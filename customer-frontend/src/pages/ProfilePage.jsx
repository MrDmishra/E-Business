import React, { useState, useEffect } from 'react'

export default function ProfilePage({ user }) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [addingAddress, setAddingAddress] = useState(false)
  const [editingAddressId, setEditingAddressId] = useState(null)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: ''
  })
  const [addressForm, setAddressForm] = useState({
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    addressType: 'HOME',
    isDefault: false
  })

  useEffect(() => {
    if (user) {
      fetchProfile()
    }
  }, [user])

  const fetchProfile = async () => {
    try {
      const res = await fetch(`/api/consumers/${user.consumerId}`)
      if (res.ok) {
        const data = await res.json()
        setProfile(data)
        setFormData({
          fullName: data.fullName || '',
          email: data.email || '',
          phone: data.phone || ''
        })
      }
    } catch (err) {
      console.error('Failed to fetch profile')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleAddressInputChange = (e) => {
    const { name, value } = e.target
    setAddressForm(prev => ({ ...prev, [name]: value }))
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch(`/api/consumers/${user.consumerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone
        })
      })

      if (!res.ok) {
        const errorText = await res.text()
        console.error('Update failed:', res.status, errorText)
        throw new Error(`Update failed: ${res.status}`)
      }

      await fetchProfile()
      setEditing(false)
      alert('Profile updated successfully!')
    } catch (err) {
      console.error('Error updating profile:', err)
      alert('Failed to update profile: ' + err.message)
    }
  }

  const handleAddAddress = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch(`/api/consumers/${user.consumerId}/addresses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          phone: formData.phone,
          addressLine1: addressForm.addressLine1,
          addressLine2: addressForm.addressLine2,
          city: addressForm.city,
          state: addressForm.state,
          postalCode: addressForm.postalCode,
          country: addressForm.country,
          addressType: addressForm.addressType,
          isDefault: addressForm.isDefault
        })
      })

      if (!res.ok) throw new Error('Failed to add address')

      await fetchProfile()
      setAddingAddress(false)
      setAddressForm({
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'India',
        addressType: 'HOME',
        isDefault: false
      })
      alert('Address added successfully!')
    } catch (err) {
      console.error('Error adding address:', err)
      alert('Failed to add address')
    }
  }

  const handleUpdateAddress = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch(`/api/consumers/${user.consumerId}/addresses/${editingAddressId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          phone: formData.phone,
          addressLine1: addressForm.addressLine1,
          addressLine2: addressForm.addressLine2,
          city: addressForm.city,
          state: addressForm.state,
          postalCode: addressForm.postalCode,
          country: addressForm.country,
          addressType: addressForm.addressType,
          isDefault: addressForm.isDefault
        })
      })

      if (!res.ok) throw new Error('Failed to update address')

      await fetchProfile()
      setEditingAddressId(null)
      setAddressForm({
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'India',
        addressType: 'HOME',
        isDefault: false
      })
      alert('Address updated successfully!')
    } catch (err) {
      console.error('Error updating address:', err)
      alert('Failed to update address')
    }
  }

  const handleDeleteAddress = async (addressId) => {
    if (!confirm('Are you sure you want to delete this address?')) return

    try {
      const res = await fetch(`/api/consumers/${user.consumerId}/addresses/${addressId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!res.ok) throw new Error('Failed to delete address')

      await fetchProfile()
      alert('Address deleted successfully!')
    } catch (err) {
      console.error('Error deleting address:', err)
      alert('Failed to delete address')
    }
  }

  const startEditAddress = (address) => {
    setEditingAddressId(address.addressId)
    setAddressForm({
      addressLine1: address.addressLine1 || '',
      addressLine2: address.addressLine2 || '',
      city: address.city || '',
      state: address.state || '',
      postalCode: address.postalCode || '',
      country: address.country || 'India',
      addressType: address.addressType || 'HOME',
      isDefault: address.isDefault || false
    })
  }

  if (!user) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '32px', marginBottom: '16px' }}>Please Login</h2>
        <p style={{ color: '#6b7280', fontSize: '18px' }}>You need to login to view your profile</p>
      </div>
    )
  }

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>Loading profile...</div>
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '24px' }}>My Profile</h1>

      <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '32px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600' }}>Personal Information</h2>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
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
              Edit Profile
            </button>
          )}
        </div>

        {editing ? (
          <form onSubmit={handleUpdate}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '16px'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '16px'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '16px'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="submit"
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false)
                  setFormData({
                    fullName: profile.fullName || '',
                    email: profile.email || '',
                    phone: profile.phone || ''
                  })
                }}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '4px' }}>Full Name</p>
              <p style={{ fontSize: '18px', fontWeight: '500' }}>{profile?.fullName}</p>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '4px' }}>Email</p>
              <p style={{ fontSize: '18px', fontWeight: '500' }}>{profile?.email}</p>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '4px' }}>Phone</p>
              <p style={{ fontSize: '18px', fontWeight: '500' }}>{profile?.phone || 'Not provided'}</p>
            </div>
          </div>
        )}
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600' }}>Saved Addresses</h2>
          {!addingAddress && !editingAddressId && (
            <button
              onClick={() => setAddingAddress(true)}
              style={{
                padding: '10px 20px',
                backgroundColor: 'rgb(69, 104, 130)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'rgb(35, 76, 106)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'rgb(69, 104, 130)'}
            >
              + Add New Address
            </button>
          )}
        </div>

        {(addingAddress || editingAddressId) && (
          <form onSubmit={editingAddressId ? handleUpdateAddress : handleAddAddress} style={{
            padding: '24px',
            backgroundColor: '#f9fafb',
            borderRadius: '8px',
            marginBottom: '24px',
            border: '2px solid rgb(69, 104, 130)'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', color: 'rgb(27, 60, 83)' }}>
              {editingAddressId ? 'Edit Address' : 'Add New Address'}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                  Address Type
                </label>
                <select
                  name="addressType"
                  value={addressForm.addressType}
                  onChange={handleAddressInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'border 0.3s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'rgb(69, 104, 130)'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                >
                  <option value="HOME">Home</option>
                  <option value="WORK">Work</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                  Address Line 1 *
                </label>
                <input
                  type="text"
                  name="addressLine1"
                  value={addressForm.addressLine1}
                  onChange={handleAddressInputChange}
                  placeholder="123 Main Street, Apt 4B"
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'border 0.3s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'rgb(69, 104, 130)'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                  Address Line 2
                </label>
                <input
                  type="text"
                  name="addressLine2"
                  value={addressForm.addressLine2}
                  onChange={handleAddressInputChange}
                  placeholder="Near City Mall (Optional)"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'border 0.3s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'rgb(69, 104, 130)'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  value={addressForm.city}
                  onChange={handleAddressInputChange}
                  placeholder="Mumbai"
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'border 0.3s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'rgb(69, 104, 130)'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                  State *
                </label>
                <input
                  type="text"
                  name="state"
                  value={addressForm.state}
                  onChange={handleAddressInputChange}
                  placeholder="Maharashtra"
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'border 0.3s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'rgb(69, 104, 130)'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                  Postal Code *
                </label>
                <input
                  type="text"
                  name="postalCode"
                  value={addressForm.postalCode}
                  onChange={handleAddressInputChange}
                  placeholder="400001"
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'border 0.3s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'rgb(69, 104, 130)'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                  Country *
                </label>
                <input
                  type="text"
                  name="country"
                  value={addressForm.country}
                  onChange={handleAddressInputChange}
                  placeholder="India"
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'border 0.3s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'rgb(69, 104, 130)'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button
                type="submit"
                style={{
                  padding: '12px 32px',
                  backgroundColor: 'rgb(69, 104, 130)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'rgb(35, 76, 106)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'rgb(69, 104, 130)'}
              >
                {editingAddressId ? 'Update Address' : 'Save Address'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setAddingAddress(false)
                  setEditingAddressId(null)
                  setAddressForm({
                    street: '',
                    city: '',
                    state: '',
                    postalCode: '',
                    country: 'India',
                    addressType: 'HOME'
                  })
                }}
                style={{
                  padding: '12px 32px',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#4b5563'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#6b7280'}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
        
        {!profile?.addresses || profile.addresses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📍</div>
            <p style={{ fontSize: '18px' }}>No addresses saved yet</p>
            <p style={{ fontSize: '14px', marginTop: '8px' }}>Add your first address to save delivery information</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {profile.addresses.map(addr => (
              <div key={addr.addressId} style={{
                padding: '24px',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                backgroundColor: 'white',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgb(69, 104, 130)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                  <span style={{
                    padding: '6px 16px',
                    backgroundColor: addr.addressType === 'HOME' ? '#dbeafe' : addr.addressType === 'WORK' ? '#fef3c7' : '#f3e8ff',
                    color: addr.addressType === 'HOME' ? '#1e40af' : addr.addressType === 'WORK' ? '#92400e' : '#6b21a8',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    {addr.addressType}
                  </span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => startEditAddress(addr)}
                      style={{
                        padding: '6px 16px',
                        backgroundColor: 'transparent',
                        color: 'rgb(69, 104, 130)',
                        border: '2px solid rgb(69, 104, 130)',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = 'rgb(69, 104, 130)'
                        e.target.style.color = 'white'
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'transparent'
                        e.target.style.color = 'rgb(69, 104, 130)'
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteAddress(addr.addressId)}
                      style={{
                        padding: '6px 16px',
                        backgroundColor: 'transparent',
                        color: '#dc2626',
                        border: '2px solid #dc2626',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#dc2626'
                        e.target.style.color = 'white'
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'transparent'
                        e.target.style.color = '#dc2626'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#374151' }}>
                  {addr.fullName && <strong style={{ display: 'block', marginBottom: '4px' }}>{addr.fullName}</strong>}
                  {addr.phone && <span style={{ display: 'block', marginBottom: '8px', color: '#6b7280' }}>{addr.phone}</span>}
                  <span style={{ display: 'block' }}>{addr.addressLine1}</span>
                  {addr.addressLine2 && <span style={{ display: 'block' }}>{addr.addressLine2}</span>}
                  <span style={{ display: 'block' }}>{addr.city}, {addr.state} {addr.postalCode}</span>
                  <span style={{ display: 'block' }}>{addr.country}</span>
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
