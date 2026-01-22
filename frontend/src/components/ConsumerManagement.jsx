import React, { useState, useEffect } from 'react'
import { useAlert } from '../context/AlertContext'

export default function ConsumerManagement() {
  const alert = useAlert()
  const [consumers, setConsumers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [consumersPerPage] = useState(10)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    addresses: [{ street: '', city: '', state: '', postalCode: '', country: '', addressType: 'HOME' }]
  })

  useEffect(() => {
    fetchConsumers()
  }, [])

  const fetchConsumers = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/consumers')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setConsumers(data || [])
    } catch (err) {
      alert.error('Fetch Failed', 'Failed to fetch consumers')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleAddressChange = (index, field, value) => {
    const newAddresses = [...formData.addresses]
    newAddresses[index] = { ...newAddresses[index], [field]: value }
    setFormData(prev => ({ ...prev, addresses: newAddresses }))
  }

  const addAddress = () => {
    setFormData(prev => ({
      ...prev,
      addresses: [...prev.addresses, { street: '', city: '', state: '', postalCode: '', country: '', addressType: 'HOME' }]
    }))
  }

  const removeAddress = (index) => {
    setFormData(prev => ({
      ...prev,
      addresses: prev.addresses.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.fullName.trim() || !formData.email.trim()) {
      alert.warning('Validation Failed', 'Full name and email are required')
      return
    }

    try {
      const url = editingId ? `/api/consumers/${editingId}` : '/api/consumers'
      const method = editingId ? 'PUT' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      
      await fetchConsumers()
      resetForm()
      setShowModal(false)
      alert.success(
        editingId ? 'Consumer Updated' : 'Consumer Created',
        editingId ? 'Consumer updated successfully' : 'New consumer created successfully'
      )
    } catch (err) {
      alert.error('Operation Failed', 'Failed to save consumer')
    }
  }

  const handleEdit = (consumer) => {
    setEditingId(consumer.consumerId)
    setFormData({
      fullName: consumer.fullName || '',
      email: consumer.email || '',
      phone: consumer.phone || '',
      addresses: consumer.addresses?.length > 0 ? consumer.addresses.map(addr => ({
        addressId: addr.addressId,
        street: addr.street || '',
        city: addr.city || '',
        state: addr.state || '',
        postalCode: addr.postalCode || '',
        country: addr.country || '',
        addressType: addr.addressType || 'HOME'
      })) : [{ street: '', city: '', state: '', postalCode: '', country: '', addressType: 'HOME' }]
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this consumer?')) return
    
    try {
      const res = await fetch(`/api/consumers/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      await fetchConsumers()
      alert.success('Consumer Deleted', 'Consumer deleted successfully')
    } catch (err) {
      alert.error('Delete Failed', 'Failed to delete consumer')
    }
  }

  const resetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      addresses: [{ street: '', city: '', state: '', postalCode: '', country: '', addressType: 'HOME' }]
    })
    setEditingId(null)
    setShowModal(false)
  }

  const filteredConsumers = consumers.filter(consumer => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    return (
      consumer.fullName?.toLowerCase().includes(search) ||
      consumer.email?.toLowerCase().includes(search) ||
      consumer.phone?.includes(search)
    )
  })

  const indexOfLastConsumer = currentPage * consumersPerPage
  const indexOfFirstConsumer = indexOfLastConsumer - consumersPerPage
  const currentConsumers = filteredConsumers.slice(indexOfFirstConsumer, indexOfLastConsumer)
  const totalPages = Math.ceil(filteredConsumers.length / consumersPerPage)

  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '16px', flexWrap: 'wrap' }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>Consumer Management</h1>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ position: 'relative', minWidth: '300px' }}>
            <input
              type="text"
              placeholder="🔍 Search by name, email, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input-inline"
            />
            {searchTerm && (
              <button
                className="clear-search-inline"
                onClick={() => setSearchTerm('')}
                title="Clear search"
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '16px',
                  color: '#6b7280'
                }}
              >
                ✕
              </button>
            )}
          </div>
          
          <button 
            onClick={() => setShowModal(true)} 
            style={{ padding: '10px 20px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            + Add Consumer
          </button>
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : filteredConsumers.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <p style={{ color: '#6b7280' }}>{searchTerm ? 'No consumers match your search.' : 'No consumers yet. Add your first consumer!'}</p>
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <thead style={{ backgroundColor: '#f9fafb' }}>
            <tr>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Name</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Email</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Phone</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Addresses</th>
              <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentConsumers.map(consumer => (
              <tr key={consumer.consumerId} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '12px' }}>{consumer.fullName}</td>
                <td style={{ padding: '12px' }}>{consumer.email}</td>
                <td style={{ padding: '12px' }}>{consumer.phone || '-'}</td>
                <td style={{ padding: '12px' }}>{consumer.addresses?.length || 0} address(es)</td>
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  <button onClick={() => handleEdit(consumer)} style={{ padding: '6px 12px', marginRight: '8px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Edit</button>
                  <button onClick={() => handleDelete(consumer.consumerId)} style={{ padding: '6px 12px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Pagination */}
      {filteredConsumers.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', padding: '16px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ color: '#6b7280', fontSize: '14px' }}>
            Showing {indexOfFirstConsumer + 1} to {Math.min(indexOfLastConsumer, filteredConsumers.length)} of {filteredConsumers.length} consumers
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} 
              disabled={currentPage === 1}
              style={{ padding: '8px 16px', backgroundColor: currentPage === 1 ? '#e5e7eb' : '#3b82f6', color: currentPage === 1 ? '#9ca3af' : 'white', border: 'none', borderRadius: '6px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
            >
              Previous
            </button>
            <span style={{ padding: '8px 16px', backgroundColor: '#f3f4f6', borderRadius: '6px', fontWeight: '600' }}>
              Page {currentPage} of {totalPages}
            </span>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} 
              disabled={currentPage === totalPages}
              style={{ padding: '8px 16px', backgroundColor: currentPage === totalPages ? '#e5e7eb' : '#3b82f6', color: currentPage === totalPages ? '#9ca3af' : 'white', border: 'none', borderRadius: '6px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', borderRadius: '8px', width: '90%', maxWidth: '700px', maxHeight: '90vh', overflow: 'auto', padding: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px' }}>{editingId ? 'Edit Consumer' : 'Add Consumer'}</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Full Name *</label>
                <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} required style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Email *</label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} required style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Phone</label>
                <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <label style={{ fontWeight: '500' }}>Addresses</label>
                  <button type="button" onClick={addAddress} style={{ padding: '6px 12px', backgroundColor: '#6366f1', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' }}>+ Add Address</button>
                </div>
                
                {formData.addresses.map((addr, index) => (
                  <div key={index} style={{ padding: '12px', border: '1px solid #e5e7eb', borderRadius: '6px', marginBottom: '12px', backgroundColor: '#f9fafb' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontWeight: '500', fontSize: '14px' }}>Address {index + 1}</span>
                      {formData.addresses.length > 1 && (
                        <button type="button" onClick={() => removeAddress(index)} style={{ padding: '4px 8px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Remove</button>
                      )}
                    </div>
                    
                    <input type="text" placeholder="Street" value={addr.street} onChange={(e) => handleAddressChange(index, 'street', e.target.value)} style={{ width: '100%', padding: '6px', border: '1px solid #d1d5db', borderRadius: '4px', marginBottom: '8px' }} />
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                      <input type="text" placeholder="City" value={addr.city} onChange={(e) => handleAddressChange(index, 'city', e.target.value)} style={{ padding: '6px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
                      <input type="text" placeholder="State" value={addr.state} onChange={(e) => handleAddressChange(index, 'state', e.target.value)} style={{ padding: '6px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                      <input type="text" placeholder="Postal Code" value={addr.postalCode} onChange={(e) => handleAddressChange(index, 'postalCode', e.target.value)} style={{ padding: '6px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
                      <input type="text" placeholder="Country" value={addr.country} onChange={(e) => handleAddressChange(index, 'country', e.target.value)} style={{ padding: '6px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
                    </div>
                    
                    <select value={addr.addressType} onChange={(e) => handleAddressChange(index, 'addressType', e.target.value)} style={{ width: '100%', padding: '6px', border: '1px solid #d1d5db', borderRadius: '4px' }}>
                      <option value="HOME">Home</option>
                      <option value="WORK">Work</option>
                    </select>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button type="button" onClick={resetForm} style={{ padding: '10px 20px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
