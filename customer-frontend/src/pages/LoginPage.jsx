import React, { useState } from 'react'

export default function LoginPage({ onLogin, onRegister }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('http://localhost:8080/api/auth/consumer/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Login failed')
      }

      const data = await res.json()
      
      // Store token in localStorage
      localStorage.setItem('consumerToken', data.token)
      
      // Pass consumer data to parent
      onLogin(data.consumer)
    } catch (err) {
      alert('Login failed: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, rgb(27, 60, 83) 0%, rgb(35, 76, 106) 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{ 
        maxWidth: '480px', 
        width: '100%',
        padding: '48px',
        backgroundColor: 'white',
        borderRadius: '24px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            fontSize: '64px',
            marginBottom: '16px'
          }}>🛍️</div>
          <h1 style={{ 
            fontSize: '36px', 
            fontWeight: '900', 
            marginBottom: '12px',
            background: 'linear-gradient(135deg, rgb(27, 60, 83) 0%, rgb(35, 76, 106) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '-1px'
          }}>
            Welcome Back!
          </h1>
          <p style={{ color: '#6b7280', fontSize: '16px', fontWeight: '500' }}>
            Login to continue shopping
          </p>
        </div>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '24px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '10px', 
            fontWeight: '600',
            color: '#374151',
            fontSize: '15px'
          }}>
            📧 Email Address
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            placeholder="your@email.com"
            style={{
              width: '100%',
              padding: '14px 16px',
              border: '2px solid #e5e7eb',
              borderRadius: '12px',
              fontSize: '16px',
              transition: 'all 0.3s'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#667eea'
              e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e5e7eb'
              e.target.style.boxShadow = 'none'
            }}
          />
        </div>

        <div style={{ marginBottom: '32px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '10px', 
            fontWeight: '600',
            color: '#374151',
            fontSize: '15px'
          }}>
            🔒 Password
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
            placeholder="••••••••"
            style={{
              width: '100%',
              padding: '14px 16px',
              border: '2px solid #e5e7eb',
              borderRadius: '12px',
              fontSize: '16px',
              transition: 'all 0.3s'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#667eea'
              e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e5e7eb'
              e.target.style.boxShadow = 'none'
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '16px',
            background: loading 
              ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)'
              : 'linear-gradient(135deg, rgb(27, 60, 83) 0%, rgb(35, 76, 106) 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '17px',
            fontWeight: '700',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginBottom: '20px',
            boxShadow: loading 
              ? 'none' 
              : '0 4px 15px rgba(27, 60, 83, 0.4)',
            transition: 'all 0.3s'
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.target.style.transform = 'translateY(-2px)'
              e.target.style.boxShadow = '0 6px 20px rgba(27, 60, 83, 0.6)'
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.target.style.transform = 'translateY(0)'
              e.target.style.boxShadow = '0 4px 15px rgba(27, 60, 83, 0.4)'
            }
          }}
        >
          {loading ? '⏳ Logging in...' : '🚀 Login'}
        </button>

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <p style={{ 
            color: '#6b7280', 
            fontSize: '15px',
            fontWeight: '500'
          }}>
            Don't have an account?{' '}
            <button
              type="button"
              onClick={onRegister}
              style={{
                background: 'none',
                border: 'none',
                color: 'rgb(35, 76, 106)',
                fontWeight: '700',
                cursor: 'pointer',
                fontSize: '15px',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.target.style.color = 'rgb(69, 104, 130)'
                e.target.style.textDecoration = 'underline'
              }}
              onMouseLeave={(e) => {
                e.target.style.color = 'rgb(35, 76, 106)'
                e.target.style.textDecoration = 'none'
              }}
            >
              Create Account →
            </button>
          </p>
        </div>
      </form>
    </div>
    </div>
  )
}
