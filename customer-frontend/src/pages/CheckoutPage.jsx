import React, { useState, useEffect } from 'react'

export default function CheckoutPage({ cart, user, onOrderComplete, onBack }) {
  const [addresses, setAddresses] = useState([])
  const [selectedAddress, setSelectedAddress] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('COD')
  const [loading, setLoading] = useState(false)
  const [addingAddress, setAddingAddress] = useState(false)
  const [addressForm, setAddressForm] = useState({
    fullName: '',
    phone: '',
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
      fetchAddresses()
    }
  }, [user])

  const fetchAddresses = async () => {
    try {
      const res = await fetch(`/api/consumers/${user.consumerId}`)
      if (res.ok) {
        const data = await res.json()
        setAddresses(data.addresses || [])
        if (data.addresses?.length > 0) {
          setSelectedAddress(data.addresses[0].addressId)
        }
      }
    } catch (err) {
      console.error('Failed to fetch addresses')
    }
  }

  const handleAddressInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setAddressForm(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }))
  }

  const handleAddAddress = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch(`/api/consumers/${user.consumerId}/addresses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: addressForm.fullName,
          phone: addressForm.phone,
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

      await fetchAddresses()
      setAddingAddress(false)
      setAddressForm({
        fullName: '',
        phone: '',
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

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const shipping = 50
  const total = subtotal + shipping

  const handlePlaceOrder = async () => {
    if (!user) {
      alert('Please login to place order')
      return
    }

    if (!selectedAddress) {
      alert('Please select delivery address')
      return
    }

    setLoading(true)
    try {
      const orderData = {
        consumerId: user.consumerId,
        addressId: Number(selectedAddress),
        totalAmount: total,
        paymentMethod: paymentMethod,
        paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'SUCCESS',
        orderStatus: 'PENDING',
        orderItems: cart.map(item => ({
          itemId: item.itemId,
          quantity: item.quantity,
          price: item.price
        })),
        orderCoupons: []
      }

      console.log('Sending order data:', orderData)

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      })

      if (!res.ok) {
        const errorText = await res.text()
        console.error('Order failed:', res.status, errorText)
        throw new Error(`Order failed: ${res.status}`)
      }

      const result = await res.json()
      console.log('Order created:', result)
      
      alert('Order placed successfully!')
      onOrderComplete()
    } catch (err) {
      console.error('Error placing order:', err)
      alert('Failed to place order: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '32px', marginBottom: '16px' }}>Please Login</h2>
        <p style={{ color: '#6b7280', fontSize: '18px' }}>You need to login to proceed with checkout</p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <button
        onClick={onBack}
        style={{
          padding: '8px 16px',
          backgroundColor: '#6b7280',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          marginBottom: '20px'
        }}
      >
        ← Back to Cart
      </button>

      <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '24px' }}>Checkout</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <div>
          <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '24px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '600' }}>Delivery Address</h2>
              <button
                onClick={() => setAddingAddress(!addingAddress)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: addingAddress ? '#6b7280' : '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                {addingAddress ? 'Cancel' : '+ Add New Address'}
              </button>
            </div>
            
            {addingAddress && (
              <form onSubmit={handleAddAddress} style={{ 
                padding: '20px', 
                backgroundColor: '#f9fafb', 
                borderRadius: '8px', 
                marginBottom: '20px',
                border: '2px solid #3b82f6'
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={addressForm.fullName}
                      onChange={handleAddressInputChange}
                      placeholder="John Doe"
                      required
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '16px',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={addressForm.phone}
                      onChange={handleAddressInputChange}
                      placeholder="+91 9876543210"
                      required
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '16px',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                      Address Type *
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
                        outline: 'none'
                      }}
                    >
                      <option value="HOME">Home</option>
                      <option value="WORK">Work</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', paddingTop: '30px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        name="isDefault"
                        checked={addressForm.isDefault}
                        onChange={handleAddressInputChange}
                        style={{ marginRight: '8px', width: '18px', height: '18px' }}
                      />
                      <span style={{ fontWeight: '600', color: '#374151' }}>Set as default address</span>
                    </label>
                  </div>
                </div>

                <div style={{ display: 'grid', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                      Address Line 1 *
                    </label>
                    <input
                      type="text"
                      name="addressLine1"
                      value={addressForm.addressLine1}
                      onChange={handleAddressInputChange}
                      placeholder="House/Flat No, Building Name, Street"
                      required
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '16px',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                      Address Line 2
                    </label>
                    <input
                      type="text"
                      name="addressLine2"
                      value={addressForm.addressLine2}
                      onChange={handleAddressInputChange}
                      placeholder="Area, Landmark (Optional)"
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '16px',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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
                          outline: 'none'
                        }}
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
                          outline: 'none'
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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
                          outline: 'none'
                        }}
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
                          outline: 'none'
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                  <button
                    type="submit"
                    style={{
                      flex: 1,
                      padding: '12px',
                      backgroundColor: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontSize: '16px'
                    }}
                  >
                    Save Address
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAddingAddress(false)
                      setAddressForm({
                        fullName: '',
                        phone: '',
                        addressLine1: '',
                        addressLine2: '',
                        city: '',
                        state: '',
                        postalCode: '',
                        country: 'India',
                        addressType: 'HOME',
                        isDefault: false
                      })
                    }}
                    style={{
                      flex: 1,
                      padding: '12px',
                      backgroundColor: '#6b7280',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontSize: '16px'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
            
            {addresses.length === 0 && !addingAddress ? (
              <p style={{ color: '#6b7280', textAlign: 'center', padding: '20px' }}>
                No addresses found. Click "Add New Address" to add one.
              </p>
            ) : (
              <div style={{ display: 'grid', gap: '12px' }}>
                {addresses.map(addr => (
                  <label
                    key={addr.addressId}
                    style={{
                      display: 'flex',
                      padding: '16px',
                      border: `2px solid ${selectedAddress === addr.addressId ? '#3b82f6' : '#e5e7eb'}`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      backgroundColor: selectedAddress === addr.addressId ? '#eff6ff' : 'transparent'
                    }}
                  >
                    <input
                      type="radio"
                      name="address"
                      value={addr.addressId}
                      checked={selectedAddress === addr.addressId}
                      onChange={(e) => setSelectedAddress(Number(e.target.value))}
                      style={{ marginRight: '12px' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <div style={{ fontWeight: '600', fontSize: '16px' }}>{addr.addressType}</div>
                        {addr.isDefault && (
                          <span style={{ 
                            fontSize: '12px', 
                            padding: '2px 8px', 
                            backgroundColor: '#10b981', 
                            color: 'white', 
                            borderRadius: '4px' 
                          }}>
                            Default
                          </span>
                        )}
                      </div>
                      <div style={{ color: '#6b7280', fontSize: '14px', lineHeight: '1.5' }}>
                        {addr.addressLine1}
                        {addr.addressLine2 && <>, {addr.addressLine2}</>}
                        <br />
                        {addr.city}, {addr.state} {addr.postalCode}
                        <br />
                        {addr.country}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '24px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '20px' }}>Payment Method</h2>
            
            <div style={{ display: 'grid', gap: '12px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                padding: '16px',
                border: `2px solid ${paymentMethod === 'COD' ? '#3b82f6' : '#e5e7eb'}`,
                borderRadius: '8px',
                cursor: 'pointer',
                backgroundColor: paymentMethod === 'COD' ? '#eff6ff' : 'transparent'
              }}>
                <input
                  type="radio"
                  name="payment"
                  value="COD"
                  checked={paymentMethod === 'COD'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  style={{ marginRight: '12px' }}
                />
                <div>
                  <div style={{ fontWeight: '600' }}>Cash on Delivery</div>
                  <div style={{ color: '#6b7280', fontSize: '14px' }}>Pay when you receive</div>
                </div>
              </label>

              <label style={{
                display: 'flex',
                alignItems: 'center',
                padding: '16px',
                border: `2px solid ${paymentMethod === 'ONLINE' ? '#3b82f6' : '#e5e7eb'}`,
                borderRadius: '8px',
                cursor: 'pointer',
                backgroundColor: paymentMethod === 'ONLINE' ? '#eff6ff' : 'transparent'
              }}>
                <input
                  type="radio"
                  name="payment"
                  value="ONLINE"
                  checked={paymentMethod === 'ONLINE'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  style={{ marginRight: '12px' }}
                />
                <div>
                  <div style={{ fontWeight: '600' }}>Online Payment</div>
                  <div style={{ color: '#6b7280', fontSize: '14px' }}>UPI / Card / Net Banking</div>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div>
          <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '24px', position: 'sticky', top: '100px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '20px' }}>Order Summary</h2>
            
            <div style={{ marginBottom: '20px' }}>
              {cart.map(item => (
                <div key={item.itemId} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px' }}>
                  <span>{item.itemName} x {item.quantity}</span>
                  <span style={{ fontWeight: '600' }}>₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span>Subtotal</span>
                <span style={{ fontWeight: '600' }}>₹{subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span>Shipping</span>
                <span style={{ fontWeight: '600' }}>₹{shipping.toFixed(2)}</span>
              </div>
            </div>

            <div style={{ borderTop: '2px solid #e5e7eb', paddingTop: '16px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: '700' }}>
                <span>Total</span>
                <span style={{ color: '#3b82f6' }}>₹{total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={loading || !selectedAddress}
              style={{
                width: '100%',
                padding: '16px',
                backgroundColor: loading || !selectedAddress ? '#9ca3af' : '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '18px',
                fontWeight: '600',
                cursor: loading || !selectedAddress ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Placing Order...' : 'Place Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
