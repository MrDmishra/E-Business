import React, { useState, useEffect } from 'react'

export default function OrdersPage({ user }) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)

  useEffect(() => {
    if (user) {
      fetchOrders()
    }
  }, [user])

  const fetchOrders = async () => {
    try {
      const res = await fetch(`/api/orders/consumer/${user.consumerId}`)
      if (res.ok) {
        const data = await res.json()
        setOrders(data)
      }
    } catch (err) {
      console.error('Failed to fetch orders')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      PENDING: '#f59e0b',
      CONFIRMED: '#3b82f6',
      SHIPPED: '#8b5cf6',
      DELIVERED: '#10b981',
      CANCELLED: '#ef4444',
      RETURNED: '#6b7280'
    }
    return colors[status] || '#6b7280'
  }

  if (!user) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '32px', marginBottom: '16px' }}>Please Login</h2>
        <p style={{ color: '#6b7280', fontSize: '18px' }}>You need to login to view your orders</p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '24px' }}>My Orders</h1>

      {loading ? (
        <p style={{ textAlign: 'center', padding: '40px' }}>Loading orders...</p>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', backgroundColor: 'white', borderRadius: '8px' }}>
          <p style={{ fontSize: '18px', color: '#6b7280' }}>You haven't placed any orders yet</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {orders.map(order => (
            <div key={order.orderId} style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>
                    Order #{order.orderId}
                  </h3>
                  <p style={{ color: '#6b7280', fontSize: '14px' }}>
                    Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '6px 16px',
                    borderRadius: '16px',
                    fontSize: '14px',
                    fontWeight: '600',
                    backgroundColor: getStatusColor(order.orderStatus) + '20',
                    color: getStatusColor(order.orderStatus)
                  }}>
                    {order.orderStatus}
                  </span>
                  <p style={{ fontSize: '14px', marginTop: '8px', color: '#6b7280' }}>
                    {order.paymentMethod} - {order.paymentStatus}
                  </p>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px', marginBottom: '16px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
                  Items ({order.orderItems?.length || 0})
                </h4>
                <div style={{ display: 'grid', gap: '12px' }}>
                  {order.orderItems?.map((item, idx) => (
                    <div key={idx} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '12px',
                      backgroundColor: '#f9fafb',
                      borderRadius: '6px'
                    }}>
                      <div>
                        <p style={{ fontWeight: '500', marginBottom: '4px' }}>{item.itemName}</p>
                        <p style={{ fontSize: '14px', color: '#6b7280' }}>Quantity: {item.quantity}</p>
                      </div>
                      <p style={{ fontWeight: '600', color: '#3b82f6' }}>₹{item.price}</p>
                    </div>
                  ))}
                </div>

                {order.orderCoupons?.length > 0 && (
                  <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#dcfce7', borderRadius: '6px' }}>
                    <p style={{ fontSize: '14px', color: '#059669', fontWeight: '500' }}>
                      🎉 Coupons applied: {order.orderCoupons.map(c => c.couponCode).join(', ')}
                    </p>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  onClick={() => setSelectedOrder(order)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  View Details
                </button>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Total Amount</p>
                  <p style={{ fontSize: '24px', fontWeight: '700', color: '#3b82f6' }}>
                    ₹{order.orderItems?.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedOrder && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => setSelectedOrder(null)}
        >
          <div 
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              width: '90%',
              maxWidth: '600px',
              maxHeight: '80vh',
              overflow: 'auto',
              padding: '32px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '20px' }}>
              Order Details #{selectedOrder.orderId}
            </h2>

            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>Order Information</h3>
              <div style={{ backgroundColor: '#f9fafb', padding: '16px', borderRadius: '8px' }}>
                <p style={{ marginBottom: '8px' }}><strong>Date:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                <p style={{ marginBottom: '8px' }}><strong>Status:</strong> {selectedOrder.orderStatus}</p>
                <p style={{ marginBottom: '8px' }}><strong>Payment:</strong> {selectedOrder.paymentMethod} ({selectedOrder.paymentStatus})</p>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>Items</h3>
              {selectedOrder.orderItems?.map((item, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '12px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '6px',
                  marginBottom: '8px'
                }}>
                  <div>
                    <p style={{ fontWeight: '500' }}>{item.itemName}</p>
                    <p style={{ fontSize: '14px', color: '#6b7280' }}>SKU: {item.sku}</p>
                    <p style={{ fontSize: '14px', color: '#6b7280' }}>Qty: {item.quantity}</p>
                  </div>
                  <p style={{ fontWeight: '600' }}>₹{item.price}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setSelectedOrder(null)}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
