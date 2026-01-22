import React, { useState, useEffect } from 'react'
import { useAlert } from '../context/AlertContext'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'

export default function CustomerServiceManagement() {
  const alert = useAlert()
  const [activeTab, setActiveTab] = useState('contact')
  const [loading, setLoading] = useState(false)
  
  // Contact Info
  const [contactInfo, setContactInfo] = useState({ id: null, phone: '', email: '', address: '' })
  
  // FAQs
  const [faqs, setFaqs] = useState([])
  const [editingFaq, setEditingFaq] = useState(null)
  const [newFaq, setNewFaq] = useState({ question: '', answer: '', displayOrder: 0 })
  
  // Shipping Info
  const [shippingInfos, setShippingInfos] = useState([])
  const [editingShipping, setEditingShipping] = useState(null)
  const [newShipping, setNewShipping] = useState({ infoType: '', title: '', description: '', displayOrder: 0 })
  
  // Return Policy
  const [returnPolicies, setReturnPolicies] = useState([])
  const [editingReturn, setEditingReturn] = useState(null)
  const [newReturn, setNewReturn] = useState({ policyType: '', title: '', description: '', displayOrder: 0 })
  
  // Quill editor configuration with table and image support
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['link', 'image'],
      [{ 'color': [] }, { 'background': [] }],
      ['blockquote', 'code-block'],
      ['clean']
    ]
  }
  
  const quillFormats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'align', 'link', 'image',
    'color', 'background', 'blockquote', 'code-block'
  ]

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/customer-service')
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      const data = await res.json()
      setContactInfo(data.contactInfo || { id: null, phone: '', email: '', address: '' })
      setFaqs(data.faqs || [])
      setShippingInfos(data.shippingInfo || [])
      setReturnPolicies(data.returnPolicy || [])
    } catch (err) {
      console.error('Error fetching data:', err)
      alert.error('Load Failed', `Error loading data: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Contact Info handlers
  const saveContactInfo = async () => {
    try {
      const method = contactInfo.id ? 'PUT' : 'POST'
      const url = contactInfo.id ? `/api/customer-service/contact/${contactInfo.id}` : '/api/customer-service/contact'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactInfo)
      })
      
      if (res.ok) {
        const saved = await res.json()
        setContactInfo(saved)
        alert.success('Saved', 'Contact info saved successfully!')
      } else {
        const errorText = await res.text()
        console.error('Server error:', res.status, errorText)
        alert.error('Save Failed', `Failed to save contact info: ${res.status} - ${errorText}`)
      }
    } catch (err) {
      console.error('Error saving contact info:', err)
      alert.error('Save Failed', `Failed to save contact info: ${err.message}`)
    }
  }

  // FAQ handlers
  const addFaq = async () => {
    if (!newFaq.question || !newFaq.answer) {
      alert.warning('Missing Fields', 'Please fill in question and answer')
      return
    }
    
    try {
      const res = await fetch('/api/customer-service/faq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFaq)
      })
      
      if (res.ok) {
        fetchData()
        setNewFaq({ question: '', answer: '', displayOrder: 0 })
        alert.success('FAQ Added', 'FAQ added successfully!')
      }
    } catch (err) {
      console.error('Error adding FAQ:', err)
      alert.error('Add Failed', 'Failed to add FAQ')
    }
  }

  const updateFaq = async (faq) => {
    try {
      const res = await fetch(`/api/customer-service/faq/${faq.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(faq)
      })
      
      if (res.ok) {
        fetchData()
        setEditingFaq(null)
        alert.success('FAQ Updated', 'FAQ updated successfully!')
      }
    } catch (err) {
      console.error('Error updating FAQ:', err)
      alert.error('Update Failed', 'Failed to update FAQ')
    }
  }

  const deleteFaq = async (id) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return
    
    try {
      const res = await fetch(`/api/customer-service/faq/${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchData()
        alert.success('FAQ Deleted', 'FAQ deleted successfully!')
      }
    } catch (err) {
      console.error('Error deleting FAQ:', err)
      alert.error('Delete Failed', 'Failed to delete FAQ')
    }
  }

  // Shipping Info handlers
  const addShippingInfo = async () => {
    if (!newShipping.title) {
      alert.warning('Missing Field', 'Please fill in title')
      return
    }
    
    try {
      const res = await fetch('/api/customer-service/shipping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newShipping)
      })
      
      if (res.ok) {
        fetchData()
        setNewShipping({ infoType: '', title: '', description: '', displayOrder: 0 })
        alert.success('Shipping Info Added', 'Shipping info added successfully!')
      }
    } catch (err) {
      console.error('Error adding shipping info:', err)
      alert.error('Add Failed', 'Failed to add shipping info')
    }
  }

  const updateShippingInfo = async (info) => {
    try {
      const res = await fetch(`/api/customer-service/shipping/${info.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(info)
      })
      
      if (res.ok) {
        fetchData()
        setEditingShipping(null)
        alert.success('Shipping Info Updated', 'Shipping info updated successfully!')
      }
    } catch (err) {
      console.error('Error updating shipping info:', err)
      alert.error('Update Failed', 'Failed to update shipping info')
    }
  }

  const deleteShippingInfo = async (id) => {
    if (!confirm('Are you sure you want to delete this shipping info?')) return
    
    try {
      const res = await fetch(`/api/customer-service/shipping/${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchData()
        alert.success('Shipping Info Deleted', 'Shipping info deleted successfully!')
      }
    } catch (err) {
      console.error('Error deleting shipping info:', err)
      alert.error('Delete Failed', 'Failed to delete shipping info')
    }
  }

  // Return Policy handlers
  const addReturnPolicy = async () => {
    if (!newReturn.title) {
      alert.warning('Missing Field', 'Please fill in title')
      return
    }
    
    try {
      const res = await fetch('/api/customer-service/returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReturn)
      })
      
      if (res.ok) {
        fetchData()
        setNewReturn({ policyType: '', title: '', description: '', displayOrder: 0 })
        alert.success('Return Policy Added', 'Return policy added successfully!')
      }
    } catch (err) {
      console.error('Error adding return policy:', err)
      alert.error('Add Failed', 'Failed to add return policy')
    }
  }

  const updateReturnPolicy = async (policy) => {
    try {
      const res = await fetch(`/api/customer-service/returns/${policy.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(policy)
      })
      
      if (res.ok) {
        fetchData()
        setEditingReturn(null)
        alert.success('Return Policy Updated', 'Return policy updated successfully!')
      }
    } catch (err) {
      console.error('Error updating return policy:', err)
      alert.error('Update Failed', 'Failed to update return policy')
    }
  }

  const deleteReturnPolicy = async (id) => {
    if (!confirm('Are you sure you want to delete this return policy?')) return
    
    try {
      const res = await fetch(`/api/customer-service/returns/${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchData()
        alert.success('Return Policy Deleted', 'Return policy deleted successfully!')
      }
    } catch (err) {
      console.error('Error deleting return policy:', err)
      alert.error('Delete Failed', 'Failed to delete return policy')
    }
  }

  if (loading) return <div style={{ padding: '24px', fontFamily: 'system-ui, sans-serif' }}>Loading...</div>

  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>Customer Service Management</h1>
      </div>

      {/* Tabs */}
      <div style={{ marginBottom: '24px', display: 'flex', gap: '8px', borderBottom: '2px solid #e5e7eb', backgroundColor: 'white', borderRadius: '8px 8px 0 0', padding: '0 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        {['contact', 'faq', 'shipping', 'returns'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '12px 24px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab ? '3px solid #3b82f6' : '3px solid transparent',
              color: activeTab === tab ? '#3b82f6' : '#6b7280',
              fontWeight: activeTab === tab ? '600' : '500',
              cursor: 'pointer',
              textTransform: 'capitalize',
              fontSize: '14px',
              transition: 'all 0.2s'
            }}
          >
            {tab === 'faq' ? 'FAQ' : tab.replace('_', ' ')}
          </button>
        ))}
      </div>

      {activeTab === 'contact' && (
        <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '600', color: '#111827' }}>Contact Information</h3>
          <div style={{ display: 'grid', gap: '20px', maxWidth: '700px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151', fontSize: '14px' }}>Phone Number</label>
              <input
                type="text"
                value={contactInfo.phone}
                onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                placeholder="+1 (555) 123-4567"
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151', fontSize: '14px' }}>Email Address</label>
              <input
                type="email"
                value={contactInfo.email}
                onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                placeholder="support@company.com"
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151', fontSize: '14px' }}>Office Address</label>
              <textarea
                value={contactInfo.address}
                onChange={(e) => setContactInfo({ ...contactInfo, address: e.target.value })}
                rows={4}
                placeholder="123 Business St, Suite 100\nCity, State 12345"
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', fontFamily: 'inherit' }}
              />
            </div>
            <button 
              onClick={saveContactInfo}
              style={{ padding: '10px 20px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', fontSize: '14px', alignSelf: 'flex-start' }}
            >
              💾 Save Contact Info
            </button>
          </div>
        </div>
      )}

      {activeTab === 'faq' && (
        <div>
          {/* Add New FAQ Card */}
          <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '24px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600', color: '#111827' }}>➕ Add New FAQ</h3>
            <div style={{ display: 'grid', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151', fontSize: '14px' }}>Question *</label>
                <input
                  type="text"
                  placeholder="What is your return policy?"
                  value={newFaq.question}
                  onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151', fontSize: '14px' }}>Answer *</label>
                <textarea
                  placeholder="We accept returns within 30 days..."
                  value={newFaq.answer}
                  onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
                  rows={4}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', fontFamily: 'inherit' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ flex: '0 0 200px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151', fontSize: '14px' }}>Display Order</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={newFaq.displayOrder}
                    onChange={(e) => setNewFaq({ ...newFaq, displayOrder: parseInt(e.target.value) || 0 })}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                  />
                </div>
                <button 
                  onClick={addFaq}
                  style={{ marginTop: '28px', padding: '10px 20px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', fontSize: '14px' }}
                >
                  ➕ Add FAQ
                </button>
              </div>
            </div>
          </div>

          {/* Existing FAQs */}
          <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600', color: '#111827' }}>📋 Existing FAQs ({faqs.length})</h3>
            <div style={{ display: 'grid', gap: '16px' }}>
              />
              <textarea
                placeholder="Answer"
                value={newFaq.answer}
                onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
                rows={4}
                style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }}
              />
              <input
                type="number"
                placeholder="Display Order"
                value={newFaq.displayOrder}
                onChange={(e) => setNewFaq({ ...newFaq, displayOrder: parseInt(e.target.value) })}
                style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', width: '200px' }}
              />
              <button className="primary" onClick={addFaq}>Add FAQ</button>
            </div>
          </div>

          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: '16px' }}>Existing FAQs</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {faqs.map(faq => (
                <div key={faq.id} style={{ padding: '16px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                  {editingFaq?.id === faq.id ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <input
                        type="text"
                        value={editingFaq.question}
                        onChange={(e) => setEditingFaq({ ...editingFaq, question: e.target.value })}
                        style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                      />
                      <textarea
                        value={editingFaq.answer}
                        onChange={(e) => setEditingFaq({ ...editingFaq, answer: e.target.value })}
                        rows={4}
                        style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                      />
                      <input
                        type="number"
                        value={editingFaq.displayOrder}
                        onChange={(e) => setEditingFaq({ ...editingFaq, displayOrder: parseInt(e.target.value) })}
                        style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', width: '200px' }}
                      />
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="primary" onClick={() => updateFaq(editingFaq)}>Save</button>
                        <button className="ghost" onClick={() => setEditingFaq(null)}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{ marginBottom: '8px' }}>
                        <strong>Q: {faq.question}</strong>
                      </div>
                      <div style={{ marginBottom: '12px', color: '#6b7280' }}>
                        A: {faq.answer}
                      </div>
                      <div style={{ display: 'flex', gap: '8px', fontSize: '14px' }}>
                        <button className="ghost" onClick={() => setEditingFaq({ ...faq })}>Edit</button>
                        <button className="ghost" onClick={() => deleteFaq(faq.id)} style={{ color: '#ef4444' }}>Delete</button>
                        <span style={{ marginLeft: 'auto', color: '#9ca3af' }}>Order: {faq.displayOrder}</span>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'shipping' && (
        <div>
          <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
            <h3 style={{ marginBottom: '16px' }}>Add New Shipping Info</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                type="text"
                placeholder="Info Type"
                value={newShipping.infoType}
                onChange={(e) => setNewShipping({ ...newShipping, infoType: e.target.value })}
                style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }}
              />
              <input
                type="text"
                placeholder="Title"
                value={newShipping.title}
                onChange={(e) => setNewShipping({ ...newShipping, title: e.target.value })}
                style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }}
              />
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Description</label>
                <ReactQuill
                  theme="snow"
                  value={newShipping.description}
                  onChange={(value) => setNewShipping({ ...newShipping, description: value })}
                  modules={quillModules}
                  formats={quillFormats}
                  placeholder="Enter description with formatting, images, and tables..."
                  style={{ background: 'white', borderRadius: '6px' }}
                />
              </div>
              <input
                type="number"
                placeholder="Display Order"
                value={newShipping.displayOrder}
                onChange={(e) => setNewShipping({ ...newShipping, displayOrder: parseInt(e.target.value) })}
                style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', width: '200px' }}
              />
              <button className="primary" onClick={addShippingInfo}>Add Shipping Info</button>
            </div>
          </div>

          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: '16px' }}>Existing Shipping Info</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {shippingInfos.map(info => (
                <div key={info.id} style={{ padding: '16px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                  {editingShipping?.id === info.id ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <input
                        type="text"
                        value={editingShipping.infoType}
                        onChange={(e) => setEditingShipping({ ...editingShipping, infoType: e.target.value })}
                        style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                      />
                      <input
                        type="text"
                        value={editingShipping.title}
                        onChange={(e) => setEditingShipping({ ...editingShipping, title: e.target.value })}
                        style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                      />
                      <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Description</label>
                        <ReactQuill
                          theme="snow"
                          value={editingShipping.description}
                          onChange={(value) => setEditingShipping({ ...editingShipping, description: value })}
                          modules={quillModules}
                          formats={quillFormats}
                          placeholder="Enter description with formatting, images, and tables..."
                          style={{ background: 'white', borderRadius: '6px' }}
                        />
                      </div>
                      <input
                        type="number"
                        value={editingShipping.displayOrder}
                        onChange={(e) => setEditingShipping({ ...editingShipping, displayOrder: parseInt(e.target.value) })}
                        style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', width: '200px' }}
                      />
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="primary" onClick={() => updateShippingInfo(editingShipping)}>Save</button>
                        <button className="ghost" onClick={() => setEditingShipping(null)}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{ marginBottom: '8px' }}>
                        <strong>{info.title}</strong>
                        {info.infoType && <span style={{ marginLeft: '8px', color: '#6b7280' }}>({info.infoType})</span>}
                      </div>
                      <div 
                        className="rich-text-display"
                        style={{ marginBottom: '12px', color: '#6b7280' }}
                        dangerouslySetInnerHTML={{ __html: info.description }}
                      />
                      <div style={{ display: 'flex', gap: '8px', fontSize: '14px' }}>
                        <button className="ghost" onClick={() => setEditingShipping({ ...info })}>Edit</button>
                        <button className="ghost" onClick={() => deleteShippingInfo(info.id)} style={{ color: '#ef4444' }}>Delete</button>
                        <span style={{ marginLeft: 'auto', color: '#9ca3af' }}>Order: {info.displayOrder}</span>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'returns' && (
        <div>
          <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
            <h3 style={{ marginBottom: '16px' }}>Add New Return Policy</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                type="text"
                placeholder="Policy Type"
                value={newReturn.policyType}
                onChange={(e) => setNewReturn({ ...newReturn, policyType: e.target.value })}
                style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }}
              />
              <input
                type="text"
                placeholder="Title"
                value={newReturn.title}
                onChange={(e) => setNewReturn({ ...newReturn, title: e.target.value })}
                style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }}
              />
              <textarea
                placeholder="Description"
                value={newReturn.description}
                onChange={(e) => setNewReturn({ ...newReturn, description: e.target.value })}
                rows={4}
                style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }}
              />
              <input
                type="number"
                placeholder="Display Order"
                value={newReturn.displayOrder}
                onChange={(e) => setNewReturn({ ...newReturn, displayOrder: parseInt(e.target.value) })}
                style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', width: '200px' }}
              />
              <button className="primary" onClick={addReturnPolicy}>Add Return Policy</button>
            </div>
          </div>

          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: '16px' }}>Existing Return Policies</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {returnPolicies.map(policy => (
                <div key={policy.id} style={{ padding: '16px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                  {editingReturn?.id === policy.id ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <input
                        type="text"
                        value={editingReturn.policyType}
                        onChange={(e) => setEditingReturn({ ...editingReturn, policyType: e.target.value })}
                        style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                      />
                      <input
                        type="text"
                        value={editingReturn.title}
                        onChange={(e) => setEditingReturn({ ...editingReturn, title: e.target.value })}
                        style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                      />
                      <textarea
                        value={editingReturn.description}
                        onChange={(e) => setEditingReturn({ ...editingReturn, description: e.target.value })}
                        rows={4}
                        style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                      />
                      <input
                        type="number"
                        value={editingReturn.displayOrder}
                        onChange={(e) => setEditingReturn({ ...editingReturn, displayOrder: parseInt(e.target.value) })}
                        style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', width: '200px' }}
                      />
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="primary" onClick={() => updateReturnPolicy(editingReturn)}>Save</button>
                        <button className="ghost" onClick={() => setEditingReturn(null)}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{ marginBottom: '8px' }}>
                        <strong>{policy.title}</strong>
                        {policy.policyType && <span style={{ marginLeft: '8px', color: '#6b7280' }}>({policy.policyType})</span>}
                      </div>
                      <div style={{ marginBottom: '12px', color: '#6b7280', whiteSpace: 'pre-line' }}>
                        {policy.description}
                      </div>
                      <div style={{ display: 'flex', gap: '8px', fontSize: '14px' }}>
                        <button className="ghost" onClick={() => setEditingReturn({ ...policy })}>Edit</button>
                        <button className="ghost" onClick={() => deleteReturnPolicy(policy.id)} style={{ color: '#ef4444' }}>Delete</button>
                        <span style={{ marginLeft: 'auto', color: '#9ca3af' }}>Order: {policy.displayOrder}</span>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
