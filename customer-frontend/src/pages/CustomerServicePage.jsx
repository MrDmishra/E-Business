import React, { useState, useEffect } from 'react'

export default function CustomerServicePage({ onBack }) {
  const [activeSection, setActiveSection] = useState('contact')
  const [contactInfo, setContactInfo] = useState(null)
  const [faqs, setFaqs] = useState([])
  const [shippingInfo, setShippingInfo] = useState([])
  const [returnPolicy, setReturnPolicy] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCustomerServiceData()
  }, [])

  const fetchCustomerServiceData = async () => {
    try {
      const response = await fetch('/api/customer-service')
      if (response.ok) {
        const data = await response.json()
        setContactInfo(data.contactInfo)
        setFaqs(data.faqs || [])
        setShippingInfo(data.shippingInfo || [])
        setReturnPolicy(data.returnPolicy || [])
      }
    } catch (error) {
      console.error('Failed to fetch customer service data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontSize: '18px', color: '#6b7280' }}>Loading...</p>
      </div>
    )
  }

  const sections = {
    contact: {
      title: 'Contact Us',
      icon: '📧',
      content: (
        <div>
          <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px', color: 'rgb(27, 60, 83)' }}>
            Get In Touch
          </h3>
          <div style={{ display: 'grid', gap: '24px', marginBottom: '32px' }}>
            {contactInfo && (
              <>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'start' }}>
                  <div style={{ fontSize: '24px' }}>📞</div>
                  <div>
                    <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>Phone</h4>
                    <p style={{ color: '#6b7280' }}>{contactInfo.phone}</p>
                    <p style={{ color: '#6b7280', fontSize: '14px' }}>Mon-Sat: 9:00 AM - 6:00 PM IST</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'start' }}>
                  <div style={{ fontSize: '24px' }}>📧</div>
                  <div>
                    <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>Email</h4>
                    <p style={{ color: '#6b7280' }}>{contactInfo.email}</p>
                    <p style={{ color: '#6b7280', fontSize: '14px' }}>We'll respond within 24 hours</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'start' }}>
                  <div style={{ fontSize: '24px' }}>📍</div>
                  <div>
                    <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>Address</h4>
                    <p style={{ color: '#6b7280', whiteSpace: 'pre-line' }}>{contactInfo.address}</p>
                  </div>
                </div>
              </>
            )}
          </div>

          <form style={{ backgroundColor: '#f9fafb', padding: '24px', borderRadius: '8px' }}>
            <h4 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>Send Us a Message</h4>
            <div style={{ display: 'grid', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Name</label>
                <input
                  type="text"
                  placeholder="Your name"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '16px'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Email</label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '16px'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Message</label>
                <textarea
                  placeholder="How can we help you?"
                  rows="4"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '16px',
                    resize: 'vertical'
                  }}
                />
              </div>
              <button
                type="submit"
                style={{
                  padding: '12px 24px',
                  backgroundColor: 'rgb(69, 104, 130)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Send Message
              </button>
            </div>
          </form>
        </div>
      )
    },
    shipping: {
      title: 'Shipping Info',
      icon: '🚚',
      content: (
        <div>
          <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px', color: 'rgb(27, 60, 83)' }}>
            Shipping Information
          </h3>
          <div style={{ display: 'grid', gap: '24px' }}>
            {shippingInfo.map((info) => (
              <div key={info.id}>
                <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>{info.title}</h4>
                <div 
                  className="rich-text-display"
                  style={{ color: '#6b7280', lineHeight: '1.8' }}
                  dangerouslySetInnerHTML={{ __html: info.description }}
                />
              </div>
            ))}
          </div>
        </div>
      )
    },
    returns: {
      title: 'Returns',
      icon: '↩️',
      content: (
        <div>
          <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px', color: 'rgb(27, 60, 83)' }}>
            Returns & Refunds
          </h3>
          <div style={{ display: 'grid', gap: '24px' }}>
            {returnPolicy.map((policy) => (
              <div key={policy.id}>
                <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>{policy.title}</h4>
                <div 
                  className="rich-text-display"
                  style={{ color: '#6b7280', lineHeight: '1.8' }}
                  dangerouslySetInnerHTML={{ __html: policy.description }}
                />
              </div>
            ))}
          </div>
        </div>
      )
    },
    faq: {
      title: 'FAQ',
      icon: '❓',
      content: (
        <div>
          <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px', color: 'rgb(27, 60, 83)' }}>
            Frequently Asked Questions
          </h3>
          <div style={{ display: 'grid', gap: '16px' }}>
            {faqs.map((faq) => (
              <div
                key={faq.id}
                style={{
                  padding: '20px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '8px',
                  borderLeft: '4px solid rgb(69, 104, 130)'
                }}
              >
                <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: 'rgb(27, 60, 83)' }}>
                  {faq.question}
                </h4>
                <p style={{ color: '#6b7280', lineHeight: '1.6', whiteSpace: 'pre-line' }}>{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      )
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fff' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'rgb(27, 60, 83)', color: 'white', padding: '40px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <button
            onClick={onBack}
            style={{
              padding: '8px 16px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              marginBottom: '20px',
              cursor: 'pointer'
            }}
          >
            ← Back
          </button>
          <h1 style={{ fontSize: '42px', fontWeight: '700', marginBottom: '16px' }}>
            Customer Service
          </h1>
          <p style={{ fontSize: '18px', opacity: 0.9 }}>
            We're here to help! Find answers to your questions below.
          </p>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '40px' }}>
          {/* Sidebar */}
          <div>
            <div style={{ position: 'sticky', top: '20px' }}>
              {Object.keys(sections).map(key => (
                <button
                  key={key}
                  onClick={() => setActiveSection(key)}
                  style={{
                    width: '100%',
                    padding: '16px',
                    marginBottom: '8px',
                    backgroundColor: activeSection === key ? 'rgb(69, 104, 130)' : '#f9fafb',
                    color: activeSection === key ? 'white' : '#374151',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.3s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  <span style={{ fontSize: '20px' }}>{sections[key].icon}</span>
                  {sections[key].title}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            {sections[activeSection].content}
          </div>
        </div>
      </div>
    </div>
  )
}
