import React, { useState, useEffect } from 'react'
import { useAlert } from '../context/AlertContext'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

export default function OrderManagement() {
  const alert = useAlert()
  const [orders, setOrders] = useState([])
  const [consumers, setConsumers] = useState([])
  const [items, setItems] = useState([])
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [viewingOrder, setViewingOrder] = useState(null)
  const [editingBill, setEditingBill] = useState(null)
  const [expandedOrderId, setExpandedOrderId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [ordersPerPage] = useState(10)
  const [billData, setBillData] = useState({
    companyName: 'Company Name',
    companyAddress: 'Address Line 1, Address Line 2\nAddress Line 3, Address Line 4\nPhone Number, Mobile Number',
    companyEmail: 'yourname@email.com, www.companyname.com',
    gstNumber: '',
    invoiceNumber: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    cgst: 9,
    sgst: 9,
    igst: 0
  })
  const [formData, setFormData] = useState({
    consumerId: '',
    addressId: '',
    orderItems: [],
    orderCoupons: [],
    orderStatus: 'PENDING',
    paymentMethod: 'COD',
    paymentStatus: 'PENDING'
  })

  useEffect(() => {
    fetchOrders()
    fetchConsumers()
    fetchItems()
    fetchCoupons()
  }, [])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/orders')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setOrders(data || [])
    } catch (err) {
      alert.error('Load Failed', 'Failed to fetch orders')
    } finally {
      setLoading(false)
    }
  }

  const fetchConsumers = async () => {
    try {
      const res = await fetch('/api/consumers')
      if (res.ok) setConsumers(await res.json())
    } catch (err) {}
  }

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/items')
      if (res.ok) setItems(await res.json())
    } catch (err) {}
  }

  const fetchCoupons = async () => {
    try {
      const res = await fetch('/api/coupons')
      if (res.ok) setCoupons(await res.json())
    } catch (err) {}
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const addOrderItem = () => {
    setFormData(prev => ({
      ...prev,
      orderItems: [...prev.orderItems, { itemId: '', quantity: 1, price: '' }]
    }))
  }

  const updateOrderItem = (index, field, value) => {
    const newItems = [...formData.orderItems]
    newItems[index] = { ...newItems[index], [field]: value }
    setFormData(prev => ({ ...prev, orderItems: newItems }))
  }

  const removeOrderItem = (index) => {
    setFormData(prev => ({
      ...prev,
      orderItems: prev.orderItems.filter((_, i) => i !== index)
    }))
  }

  const addCoupon = () => {
    setFormData(prev => ({
      ...prev,
      orderCoupons: [...prev.orderCoupons, { couponId: '', discountAmount: '' }]
    }))
  }

  const updateCoupon = (index, field, value) => {
    const newCoupons = [...formData.orderCoupons]
    newCoupons[index] = { ...newCoupons[index], [field]: value }
    setFormData(prev => ({ ...prev, orderCoupons: newCoupons }))
  }

  const removeCoupon = (index) => {
    setFormData(prev => ({
      ...prev,
      orderCoupons: prev.orderCoupons.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.consumerId || !formData.addressId || formData.orderItems.length === 0) {
      alert.warning('Missing Fields', 'Consumer, address, and at least one item are required')
      return
    }

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      
      await fetchOrders()
      resetForm()
      alert.success('Order Created', 'Order created successfully!')
    } catch (err) {
      alert.error('Create Failed', 'Failed to create order')
    }
  }

  const updateOrderStatus = async (orderId, status) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status?status=${status}`, { method: 'PUT' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      await fetchOrders()
      alert.success('Status Updated', 'Order status updated successfully!')
    } catch (err) {
      alert.error('Update Failed', 'Failed to update status')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this order?')) return
    
    try {
      const res = await fetch(`/api/orders/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      await fetchOrders()
      alert.success('Order Deleted', 'Order deleted successfully!')
    } catch (err) {
      alert.error('Delete Failed', 'Failed to delete order')
    }
  }

  const resetForm = () => {
    setFormData({
      consumerId: '',
      addressId: '',
      orderItems: [],
      orderCoupons: [],
      orderStatus: 'PENDING',
      paymentMethod: 'COD',
      paymentStatus: 'PENDING'
    })
    setShowModal(false)
  }

  const getConsumerAddresses = () => {
    const consumer = consumers.find(c => c.consumerId === parseInt(formData.consumerId))
    return consumer?.addresses || []
  }

  const getStatusColor = (status) => {
    const colors = {
      PENDING: '#f59e0b', CONFIRMED: '#3b82f6', SHIPPED: '#8b5cf6',
      DELIVERED: '#10b981', CANCELLED: '#ef4444', RETURNED: '#6b7280'
    }
    return colors[status] || '#6b7280'
  }

  const calculateOrderTotal = (order) => {
    if (!order.orderItems) return 0
    return order.orderItems.reduce((sum, item) => {
      return sum + (parseFloat(item.price) * parseInt(item.quantity))
    }, 0)
  }

  const filteredOrders = orders.filter(order => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    return (
      order.orderId?.toString().includes(search) ||
      order.consumerName?.toLowerCase().includes(search) ||
      order.orderStatus?.toLowerCase().includes(search) ||
      order.paymentMethod?.toLowerCase().includes(search)
    )
  })

  const indexOfLastOrder = currentPage * ordersPerPage
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder)
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage)

  const generateInvoiceNumber = (orderId) => {
    const year = new Date().getFullYear()
    const month = String(new Date().getMonth() + 1).padStart(2, '0')
    return `INV-${year}${month}-${String(orderId).padStart(5, '0')}`
  }

  const calculateTotals = (order) => {
    try {
      const subtotal = order.orderItems?.reduce((sum, item) => {
        const price = parseFloat(item.price) || 0
        const quantity = parseInt(item.quantity) || 0
        return sum + (price * quantity)
      }, 0) || 0
      
      const discount = order.orderCoupons?.reduce((sum, coupon) => {
        return sum + (parseFloat(coupon.discountAmount) || 0)
      }, 0) || 0
      
      const taxableAmount = Math.max(0, subtotal - discount)
      const cgst = (taxableAmount * billData.cgst) / 100
      const sgst = (taxableAmount * billData.sgst) / 100
      const igst = (taxableAmount * billData.igst) / 100
      const total = taxableAmount + cgst + sgst + igst
      
      return { subtotal, discount, taxableAmount, cgst, sgst, igst, total }
    } catch (error) {
      console.error('Calculate totals error:', error)
      return { subtotal: 0, discount: 0, taxableAmount: 0, cgst: 0, sgst: 0, igst: 0, total: 0 }
    }
  }

  const openBillEditor = (order) => {
    setEditingBill(order)
    setBillData(prev => ({
      ...prev,
      invoiceNumber: generateInvoiceNumber(order.orderId),
      invoiceDate: new Date(order.createdAt).toISOString().split('T')[0]
    }))
  }

  const generatePDF = () => {
    if (!editingBill) {
      alert.error('No Order', 'Please select an order first')
      return
    }

    if (!editingBill.orderItems || editingBill.orderItems.length === 0) {
      alert.error('No Items', 'Order has no items to generate invoice')
      return
    }

    try {
      const doc = new jsPDF()
      const totals = calculateTotals(editingBill)
      
      // Header with logo placeholder
      doc.setFillColor(139, 0, 0)
      doc.rect(0, 0, 210, 15, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text(billData.companyName, 105, 10, { align: 'center' })
    
    // Company details
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    const addressLines = billData.companyAddress.split('\n')
    let yPos = 20
    addressLines.forEach(line => {
      doc.text(line, 105, yPos, { align: 'center' })
      yPos += 4
    })
    doc.text(billData.companyEmail, 105, yPos, { align: 'center' })
    
    // Invoice header
    yPos += 10
    doc.setFillColor(139, 0, 0)
    doc.rect(14, yPos, 80, 7, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('INVOICE', 16, yPos + 5)
    
    // Invoice details
    yPos += 12
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text('Name:', 16, yPos)
    doc.text(editingBill.consumerName || 'N/A', 40, yPos)
    doc.text('GSTIN:', 120, yPos)
    doc.text(billData.gstNumber || 'Enter Your GSTIN', 145, yPos)
    
    yPos += 5
    doc.text('Address:', 16, yPos)
    doc.text('N/A', 40, yPos)
    doc.text('Invoice No.:', 120, yPos)
    doc.text(billData.invoiceNumber, 145, yPos)
    
    yPos += 5
    doc.text('Phone Number:', 16, yPos)
    doc.text('N/A', 40, yPos)
    doc.text('Invoice Date:', 120, yPos)
    doc.text(new Date(billData.invoiceDate).toLocaleDateString(), 145, yPos)
    
    // Items table
    yPos += 10
    const tableData = editingBill.orderItems?.map((item, idx) => [
      idx + 1,
      item.itemName,
      item.quantity,
      `₹${parseFloat(item.price).toFixed(2)}`,
      `₹${(parseFloat(item.price) * parseInt(item.quantity)).toFixed(2)}`
    ]) || []
    
    doc.autoTable({
      startY: yPos,
      head: [['S.No.', 'Description', 'Qty', 'Rate', 'Amount']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [220, 220, 220], textColor: [0, 0, 0], fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 15 },
        1: { cellWidth: 80 },
        2: { cellWidth: 20, halign: 'center' },
        3: { cellWidth: 30, halign: 'right' },
        4: { cellWidth: 35, halign: 'right' }
      }
    })
    
    const tableResult = doc.lastAutoTable
    
    yPos = tableResult.finalY + 5
    
    // Totals section
    const totalsX = 120
    doc.text('Taxable Value:', totalsX, yPos)
    doc.text(`₹${totals.taxableAmount.toFixed(2)}`, 190, yPos, { align: 'right' })
    
    yPos += 5
    doc.text(`CGST (${billData.cgst}%):`, totalsX, yPos)
    doc.text(`₹${totals.cgst.toFixed(2)}`, 190, yPos, { align: 'right' })
    
    yPos += 5
    doc.text(`SGST (${billData.sgst}%):`, totalsX, yPos)
    doc.text(`₹${totals.sgst.toFixed(2)}`, 190, yPos, { align: 'right' })
    
    if (billData.igst > 0) {
      yPos += 5
      doc.text(`IGST (${billData.igst}%):`, totalsX, yPos)
      doc.text(`₹${totals.igst.toFixed(2)}`, 190, yPos, { align: 'right' })
    }
    
    yPos += 5
    doc.setFont('helvetica', 'bold')
    doc.text('Grand Total:', totalsX, yPos)
    doc.text(`₹${totals.total.toFixed(2)}`, 190, yPos, { align: 'right' })
    
    // Footer
    yPos += 15
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.text("Customer's Signature", 20, yPos)
    doc.text('Signature', 170, yPos)
    
      // Save PDF
      doc.save(`Invoice_${billData.invoiceNumber}.pdf`)
      alert.success('PDF Generated', 'Invoice PDF downloaded successfully!')
    } catch (error) {
      console.error('PDF generation error:', error)
      alert.error('Generation Failed', 'Failed to generate PDF: ' + (error.message || 'Unknown error'))
    }
  }

  const previewBill = () => {
    if (!editingBill) {
      alert.error('No Order', 'Please select an order first')
      return
    }

    if (!editingBill.orderItems || editingBill.orderItems.length === 0) {
      alert.error('No Items', 'Order has no items to generate invoice')
      return
    }

    try {
      const doc = new jsPDF()
      const totals = calculateTotals(editingBill)
      
      // Same PDF generation logic as above
      doc.setFillColor(139, 0, 0)
      doc.rect(0, 0, 210, 15, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text(billData.companyName, 105, 10, { align: 'center' })
      
      doc.setTextColor(0, 0, 0)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      const addressLines = billData.companyAddress.split('\n')
      let yPos = 20
      addressLines.forEach(line => {
        doc.text(line, 105, yPos, { align: 'center' })
        yPos += 4
      })
      doc.text(billData.companyEmail, 105, yPos, { align: 'center' })
      
      yPos += 10
      doc.setFillColor(139, 0, 0)
      doc.rect(14, yPos, 80, 7, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('INVOICE', 16, yPos + 5)
      
      yPos += 12
      doc.setTextColor(0, 0, 0)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.text('Name:', 16, yPos)
      doc.text(editingBill.consumerName || 'N/A', 40, yPos)
      doc.text('GSTIN:', 120, yPos)
      doc.text(billData.gstNumber || 'Enter Your GSTIN', 145, yPos)
      
      yPos += 5
      doc.text('Address:', 16, yPos)
      doc.text('N/A', 40, yPos)
      doc.text('Invoice No.:', 120, yPos)
      doc.text(billData.invoiceNumber, 145, yPos)
      
      yPos += 5
      doc.text('Phone Number:', 16, yPos)
      doc.text('N/A', 40, yPos)
      doc.text('Invoice Date:', 120, yPos)
      doc.text(new Date(billData.invoiceDate).toLocaleDateString(), 145, yPos)
      
      yPos += 10
      const tableData = editingBill.orderItems?.map((item, idx) => [
        idx + 1,
        item.itemName,
        item.quantity,
        `₹${parseFloat(item.price).toFixed(2)}`,
        `₹${(parseFloat(item.price) * parseInt(item.quantity)).toFixed(2)}`
      ]) || []
      
      doc.autoTable({
        startY: yPos,
        head: [['S.No.', 'Description', 'Qty', 'Rate', 'Amount']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [220, 220, 220], textColor: [0, 0, 0], fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: {
          0: { cellWidth: 15 },
          1: { cellWidth: 80 },
          2: { cellWidth: 20, halign: 'center' },
          3: { cellWidth: 30, halign: 'right' },
          4: { cellWidth: 35, halign: 'right' }
        }
      })
      
      const tableResult = doc.lastAutoTable
      
      yPos = tableResult.finalY + 5
      
      const totalsX = 120
      doc.text('Taxable Value:', totalsX, yPos)
      doc.text(`₹${totals.taxableAmount.toFixed(2)}`, 190, yPos, { align: 'right' })
      
      yPos += 5
      doc.text(`CGST (${billData.cgst}%):`, totalsX, yPos)
      doc.text(`₹${totals.cgst.toFixed(2)}`, 190, yPos, { align: 'right' })
      
      yPos += 5
      doc.text(`SGST (${billData.sgst}%):`, totalsX, yPos)
      doc.text(`₹${totals.sgst.toFixed(2)}`, 190, yPos, { align: 'right' })
      
      if (billData.igst > 0) {
        yPos += 5
        doc.text(`IGST (${billData.igst}%):`, totalsX, yPos)
        doc.text(`₹${totals.igst.toFixed(2)}`, 190, yPos, { align: 'right' })
      }
      
      yPos += 5
      doc.setFont('helvetica', 'bold')
      doc.text('Grand Total:', totalsX, yPos)
      doc.text(`₹${totals.total.toFixed(2)}`, 190, yPos, { align: 'right' })
      
      yPos += 15
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.text("Customer's Signature", 20, yPos)
      doc.text('Signature', 170, yPos)
      
      // Generate blob URL and open in new window
      const pdfBlob = doc.output('blob')
      const blobUrl = URL.createObjectURL(pdfBlob)
      const previewWindow = window.open(blobUrl, '_blank')
      
      if (!previewWindow) {
        alert.warning('Popup Blocked', 'Please allow popups for this site to preview PDF. Downloading instead...')
        doc.save(`Invoice_${billData.invoiceNumber}_Preview.pdf`)
      } else {
        alert.info('Preview Opened', 'PDF preview opened in new tab')
      }
    } catch (error) {
      console.error('Preview error:', error)
      alert.error('Preview Failed', 'Failed to generate PDF preview: ' + error.message)
    }
  }

  return (
    <div className="page-container">
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '24px',
        gap: '16px',
        flexWrap: 'wrap'
      }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>Order Management</h1>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Search Bar */}
          <div style={{ position: 'relative', minWidth: '300px' }}>
            <input
              type="text"
              placeholder="🔍 Search orders by ID, customer, status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input-inline"
            />
            {searchTerm && (
              <button
                className="clear-search-inline"
                onClick={() => setSearchTerm('')}
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>
          
          <button 
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
            style={{ whiteSpace: 'nowrap' }}
          >
            + Create Order
          </button>
        </div>
      </div>

      {loading ? (
        <p>Loading orders...</p>
      ) : filteredOrders.length === 0 ? (
        <div className="empty-state">
          <p>{searchTerm ? 'No orders match your search.' : 'No orders yet. Create your first order!'}</p>
        </div>
      ) : (
        <>
          <table className="products-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentOrders.map(order => (
                <React.Fragment key={order.orderId}>
                  <tr 
                    className="product-row"
                    style={{ cursor: 'pointer' }}
                    onClick={() => setExpandedOrderId(expandedOrderId === order.orderId ? null : order.orderId)}
                  >
                    <td style={{ fontWeight: '600' }}>#{order.orderId}</td>
                    <td>{order.consumerName || 'N/A'}</td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td>{order.orderItems?.length || 0} items</td>
                    <td style={{ fontWeight: '500' }}>₹{calculateOrderTotal(order).toFixed(2)}</td>
                    <td>
                      <span style={{ 
                        padding: '4px 12px', 
                        borderRadius: '12px', 
                        fontSize: '12px', 
                        fontWeight: '500',
                        backgroundColor: getStatusColor(order.orderStatus) + '20', 
                        color: getStatusColor(order.orderStatus)
                      }}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: '13px' }}>
                        <div>{order.paymentMethod}</div>
                        <div style={{ color: '#6b7280', fontSize: '11px' }}>{order.paymentStatus}</div>
                      </div>
                    </td>
                    <td>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation()
                          setExpandedOrderId(expandedOrderId === order.orderId ? null : order.orderId)
                        }}
                        style={{ 
                          padding: '4px 8px', 
                          backgroundColor: '#f3f4f6', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '4px', 
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        {expandedOrderId === order.orderId ? '▼ Hide' : '▶ Details'}
                      </button>
                    </td>
                  </tr>
                  
                  {/* Expanded Row */}
                  {expandedOrderId === order.orderId && (
                    <tr>
                      <td colSpan="8" style={{ backgroundColor: '#f9fafb', padding: '20px', borderBottom: '2px solid #e5e7eb' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                          {/* Left Column - Order Items */}
                          <div>
                            <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#374151' }}>
                              Order Items ({order.orderItems?.length || 0})
                            </h4>
                            <div style={{ backgroundColor: 'white', borderRadius: '6px', padding: '12px', border: '1px solid #e5e7eb' }}>
                              {order.orderItems?.map((item, idx) => (
                                <div key={idx} style={{ 
                                  display: 'flex', 
                                  justifyContent: 'space-between',
                                  padding: '8px 0',
                                  borderBottom: idx < order.orderItems.length - 1 ? '1px solid #f3f4f6' : 'none',
                                  fontSize: '13px'
                                }}>
                                  <div>
                                    <div style={{ fontWeight: '500', color: '#111827' }}>{item.itemName}</div>
                                    <div style={{ color: '#6b7280', fontSize: '12px' }}>Qty: {item.quantity}</div>
                                  </div>
                                  <div style={{ fontWeight: '500', color: '#111827' }}>₹{item.price}</div>
                                </div>
                              ))}
                              {order.orderCoupons?.length > 0 && (
                                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e5e7eb' }}>
                                  <div style={{ fontSize: '13px', fontWeight: '500', color: '#10b981', marginBottom: '4px' }}>
                                    Coupons Applied:
                                  </div>
                                  {order.orderCoupons.map((c, idx) => (
                                    <div key={idx} style={{ fontSize: '12px', color: '#059669' }}>
                                      {c.couponCode} - Discount: ₹{c.discountAmount}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Right Column - Actions */}
                          <div>
                            <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#374151' }}>
                              Actions
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              <button 
                                onClick={() => setViewingOrder(order)} 
                                style={{ 
                                  padding: '10px 16px', 
                                  backgroundColor: '#6366f1', 
                                  color: 'white', 
                                  border: 'none', 
                                  borderRadius: '6px', 
                                  cursor: 'pointer',
                                  fontSize: '14px',
                                  fontWeight: '500'
                                }}
                              >
                                📄 View Full Details
                              </button>
                              
                              <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px', color: '#6b7280' }}>
                                  Update Status
                                </label>
                                <select 
                                  onChange={(e) => updateOrderStatus(order.orderId, e.target.value)} 
                                  value={order.orderStatus} 
                                  style={{ 
                                    width: '100%',
                                    padding: '8px 12px', 
                                    border: '1px solid #d1d5db', 
                                    borderRadius: '6px', 
                                    cursor: 'pointer',
                                    fontSize: '14px'
                                  }}
                                >
                                  <option value="PENDING">Pending</option>
                                  <option value="CONFIRMED">Confirmed</option>
                                  <option value="SHIPPED">Shipped</option>
                                  <option value="DELIVERED">Delivered</option>
                                  <option value="CANCELLED">Cancelled</option>
                                  <option value="RETURNED">Returned</option>
                                </select>
                              </div>

                              <button 
                                onClick={() => openBillEditor(order)} 
                                style={{ 
                                  padding: '10px 16px', 
                                  backgroundColor: '#10b981', 
                                  color: 'white', 
                                  border: 'none', 
                                  borderRadius: '6px', 
                                  cursor: 'pointer',
                                  fontSize: '14px',
                                  fontWeight: '500'
                                }}
                              >
                                🧾 Generate Bill
                              </button>

                              <button 
                                onClick={() => handleDelete(order.orderId)} 
                                style={{ 
                                  padding: '10px 16px', 
                                  backgroundColor: '#ef4444', 
                                  color: 'white', 
                                  border: 'none', 
                                  borderRadius: '6px', 
                                  cursor: 'pointer',
                                  fontSize: '14px',
                                  fontWeight: '500'
                                }}
                              >
                                🗑️ Delete Order
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              gap: '8px', 
              marginTop: '20px' 
            }}>
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{ 
                  padding: '8px 16px', 
                  backgroundColor: currentPage === 1 ? '#e5e7eb' : '#3b82f6', 
                  color: currentPage === 1 ? '#9ca3af' : 'white', 
                  border: 'none', 
                  borderRadius: '6px', 
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Previous
              </button>
              <span style={{ color: '#6b7280', fontSize: '14px', fontWeight: '500' }}>
                Page {currentPage} of {totalPages}
              </span>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                style={{ 
                  padding: '8px 16px', 
                  backgroundColor: currentPage >= totalPages ? '#e5e7eb' : '#3b82f6', 
                  color: currentPage >= totalPages ? '#9ca3af' : 'white', 
                  border: 'none', 
                  borderRadius: '6px', 
                  cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', borderRadius: '8px', width: '90%', maxWidth: '800px', maxHeight: '90vh', overflow: 'auto', padding: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px' }}>Create Order</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Consumer *</label>
                  <select name="consumerId" value={formData.consumerId} onChange={handleInputChange} required style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}>
                    <option value="">Select Consumer</option>
                    {consumers.map(c => (
                      <option key={c.consumerId} value={c.consumerId}>{c.fullName}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Delivery Address *</label>
                  <select name="addressId" value={formData.addressId} onChange={handleInputChange} required disabled={!formData.consumerId} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}>
                    <option value="">Select Address</option>
                    {getConsumerAddresses().map(addr => (
                      <option key={addr.addressId} value={addr.addressId}>{addr.city}, {addr.state}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={{ fontWeight: '500' }}>Order Items *</label>
                  <button type="button" onClick={addOrderItem} style={{ padding: '6px 12px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' }}>+ Add Item</button>
                </div>
                {formData.orderItems.map((item, idx) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '8px', marginBottom: '8px', padding: '8px', backgroundColor: '#f9fafb', borderRadius: '4px' }}>
                    <select value={item.itemId} onChange={(e) => updateOrderItem(idx, 'itemId', e.target.value)} required style={{ padding: '6px', border: '1px solid #d1d5db', borderRadius: '4px' }}>
                      <option value="">Select Item</option>
                      {items.map(i => (
                        <option key={i.itemId} value={i.itemId}>{i.itemName} (₹{i.price})</option>
                      ))}
                    </select>
                    <input type="number" placeholder="Qty" value={item.quantity} onChange={(e) => updateOrderItem(idx, 'quantity', e.target.value)} required min="1" style={{ padding: '6px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
                    <input type="number" placeholder="Price" value={item.price} onChange={(e) => updateOrderItem(idx, 'price', e.target.value)} required step="0.01" style={{ padding: '6px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
                    <button type="button" onClick={() => removeOrderItem(idx)} style={{ padding: '6px 12px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>✕</button>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={{ fontWeight: '500' }}>Coupons (Optional)</label>
                  <button type="button" onClick={addCoupon} style={{ padding: '6px 12px', backgroundColor: '#8b5cf6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' }}>+ Add Coupon</button>
                </div>
                {formData.orderCoupons.map((coupon, idx) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: '8px', marginBottom: '8px', padding: '8px', backgroundColor: '#f9fafb', borderRadius: '4px' }}>
                    <select value={coupon.couponId} onChange={(e) => updateCoupon(idx, 'couponId', e.target.value)} required style={{ padding: '6px', border: '1px solid #d1d5db', borderRadius: '4px' }}>
                      <option value="">Select Coupon</option>
                      {coupons.filter(c => c.status === 'ACTIVE').map(c => (
                        <option key={c.couponId} value={c.couponId}>{c.couponCode} ({c.discountType})</option>
                      ))}
                    </select>
                    <input type="number" placeholder="Discount" value={coupon.discountAmount} onChange={(e) => updateCoupon(idx, 'discountAmount', e.target.value)} required step="0.01" style={{ padding: '6px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
                    <button type="button" onClick={() => removeCoupon(idx)} style={{ padding: '6px 12px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>✕</button>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Payment Method</label>
                  <select name="paymentMethod" value={formData.paymentMethod} onChange={handleInputChange} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}>
                    <option value="COD">COD</option>
                    <option value="ONLINE">Online</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Order Status</label>
                  <select name="orderStatus" value={formData.orderStatus} onChange={handleInputChange} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}>
                    <option value="PENDING">Pending</option>
                    <option value="CONFIRMED">Confirmed</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Payment Status</label>
                  <select name="paymentStatus" value={formData.paymentStatus} onChange={handleInputChange} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}>
                    <option value="PENDING">Pending</option>
                    <option value="SUCCESS">Success</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button type="button" onClick={resetForm} style={{ padding: '10px 20px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Create Order</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewingOrder && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setViewingOrder(null)}>
          <div style={{ backgroundColor: 'white', borderRadius: '8px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflow: 'auto', padding: '24px' }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>Order Details #{viewingOrder.orderId}</h2>
            <div style={{ marginBottom: '12px' }}>
              <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Customer: <strong>{viewingOrder.consumerName}</strong></p>
              <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Date: {new Date(viewingOrder.createdAt).toLocaleString()}</p>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>Status: <span style={{ color: getStatusColor(viewingOrder.orderStatus), fontWeight: '600' }}>{viewingOrder.orderStatus}</span></p>
            </div>
            <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '12px', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>Items</h3>
              {viewingOrder.orderItems?.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '6px' }}>
                  <span>{item.itemName} (x{item.quantity})</span>
                  <span>₹{item.price}</span>
                </div>
              ))}
            </div>
            {viewingOrder.orderCoupons?.length > 0 && (
              <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '12px', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>Coupons Applied</h3>
                {viewingOrder.orderCoupons.map((c, idx) => (
                  <div key={idx} style={{ fontSize: '14px', color: '#10b981', marginBottom: '4px' }}>
                    {c.couponCode} - Discount: ₹{c.discountAmount}
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => setViewingOrder(null)} style={{ width: '100%', padding: '10px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', marginTop: '12px' }}>Close</button>
          </div>
        </div>
      )}

      {editingBill && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '24px', maxWidth: '600px', width: '90%', maxHeight: '90vh', overflow: 'auto' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px' }}>Edit Bill Details - Order #{editingBill.orderId}</h2>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Company Name</label>
              <input
                type="text"
                value={billData.companyName}
                onChange={(e) => setBillData({...billData, companyName: e.target.value})}
                style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px' }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Company Address (use \n for new line)</label>
              <textarea
                value={billData.companyAddress}
                onChange={(e) => setBillData({...billData, companyAddress: e.target.value})}
                rows="3"
                style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px' }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Email & Website</label>
              <input
                type="text"
                value={billData.companyEmail}
                onChange={(e) => setBillData({...billData, companyEmail: e.target.value})}
                style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px' }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>GST Number</label>
              <input
                type="text"
                value={billData.gstNumber}
                onChange={(e) => setBillData({...billData, gstNumber: e.target.value})}
                placeholder="Enter GSTIN"
                style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Invoice Number</label>
                <input
                  type="text"
                  value={billData.invoiceNumber}
                  onChange={(e) => setBillData({...billData, invoiceNumber: e.target.value})}
                  style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Invoice Date</label>
                <input
                  type="date"
                  value={billData.invoiceDate}
                  onChange={(e) => setBillData({...billData, invoiceDate: e.target.value})}
                  style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#f3f4f6', borderRadius: '6px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '12px' }}>Tax Rates (%)</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px' }}>CGST %</label>
                  <input
                    type="number"
                    value={billData.cgst}
                    onChange={(e) => setBillData({...billData, cgst: parseFloat(e.target.value) || 0})}
                    min="0"
                    step="0.01"
                    style={{ width: '100%', padding: '6px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px' }}>SGST %</label>
                  <input
                    type="number"
                    value={billData.sgst}
                    onChange={(e) => setBillData({...billData, sgst: parseFloat(e.target.value) || 0})}
                    min="0"
                    step="0.01"
                    style={{ width: '100%', padding: '6px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px' }}>IGST %</label>
                  <input
                    type="number"
                    value={billData.igst}
                    onChange={(e) => setBillData({...billData, igst: parseFloat(e.target.value) || 0})}
                    min="0"
                    step="0.01"
                    style={{ width: '100%', padding: '6px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '13px' }}
                  />
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '8px' }}>Order Items</h3>
              {editingBill.orderItems?.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '6px 0', borderBottom: '1px solid #f3f4f6' }}>
                  <span>{item.itemName} x {item.quantity}</span>
                  <span>₹{(parseFloat(item.price) * parseInt(item.quantity)).toFixed(2)}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: '600', marginTop: '12px', paddingTop: '8px', borderTop: '2px solid #d1d5db' }}>
                <span>Total</span>
                <span>₹{calculateTotals(editingBill).total.toFixed(2)}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={previewBill} style={{ flex: 1, padding: '10px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>Preview PDF</button>
              <button onClick={generatePDF} style={{ flex: 1, padding: '10px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>Download PDF</button>
              <button onClick={() => setEditingBill(null)} style={{ flex: 1, padding: '10px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
