import React from 'react'

export default function Footer({ onNavigate }) {
  return (
    <footer style={{
      backgroundColor: '#1f2937',
      color: '#d1d5db',
      padding: '40px 20px',
      marginTop: '60px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '30px'
      }}>
        <div>
          <h3 style={{ color: '#fff', marginBottom: '12px', fontSize: '18px' }}>E-Business Shop</h3>
          <p style={{ fontSize: '14px', lineHeight: '1.6' }}>
            Your trusted online marketplace for quality products
          </p>
        </div>
        
        <div>
          <h4 style={{ color: '#fff', marginBottom: '12px', fontSize: '16px' }}>Customer Service</h4>
          <ul style={{ listStyle: 'none', fontSize: '14px', lineHeight: '2' }}>
            <li
              onClick={() => onNavigate('customer-service')}
              style={{ cursor: 'pointer', transition: 'color 0.3s' }}
              onMouseEnter={(e) => e.target.style.color = 'rgb(147, 197, 253)'}
              onMouseLeave={(e) => e.target.style.color = '#d1d5db'}
            >
              Contact Us
            </li>
            <li
              onClick={() => onNavigate('customer-service')}
              style={{ cursor: 'pointer', transition: 'color 0.3s' }}
              onMouseEnter={(e) => e.target.style.color = 'rgb(147, 197, 253)'}
              onMouseLeave={(e) => e.target.style.color = '#d1d5db'}
            >
              Shipping Info
            </li>
            <li
              onClick={() => onNavigate('customer-service')}
              style={{ cursor: 'pointer', transition: 'color 0.3s' }}
              onMouseEnter={(e) => e.target.style.color = 'rgb(147, 197, 253)'}
              onMouseLeave={(e) => e.target.style.color = '#d1d5db'}
            >
              Returns
            </li>
            <li
              onClick={() => onNavigate('customer-service')}
              style={{ cursor: 'pointer', transition: 'color 0.3s' }}
              onMouseEnter={(e) => e.target.style.color = 'rgb(147, 197, 253)'}
              onMouseLeave={(e) => e.target.style.color = '#d1d5db'}
            >
              FAQ
            </li>
          </ul>
        </div>
        
        <div>
          <h4 style={{ color: '#fff', marginBottom: '12px', fontSize: '16px' }}>About Us</h4>
          <ul style={{ listStyle: 'none', fontSize: '14px', lineHeight: '2' }}>
            <li
              onClick={() => onNavigate('about-us')}
              style={{ cursor: 'pointer', transition: 'color 0.3s' }}
              onMouseEnter={(e) => e.target.style.color = 'rgb(147, 197, 253)'}
              onMouseLeave={(e) => e.target.style.color = '#d1d5db'}
            >
              Our Story
            </li>
            <li
              onClick={() => onNavigate('about-us')}
              style={{ cursor: 'pointer', transition: 'color 0.3s' }}
              onMouseEnter={(e) => e.target.style.color = 'rgb(147, 197, 253)'}
              onMouseLeave={(e) => e.target.style.color = '#d1d5db'}
            >
              Careers
            </li>
            <li
              onClick={() => onNavigate('about-us')}
              style={{ cursor: 'pointer', transition: 'color 0.3s' }}
              onMouseEnter={(e) => e.target.style.color = 'rgb(147, 197, 253)'}
              onMouseLeave={(e) => e.target.style.color = '#d1d5db'}
            >
              Privacy Policy
            </li>
            <li
              onClick={() => onNavigate('about-us')}
              style={{ cursor: 'pointer', transition: 'color 0.3s' }}
              onMouseEnter={(e) => e.target.style.color = 'rgb(147, 197, 253)'}
              onMouseLeave={(e) => e.target.style.color = '#d1d5db'}
            >
              Terms of Service
            </li>
          </ul>
        </div>
        
        <div>
          <h4 style={{ color: '#fff', marginBottom: '12px', fontSize: '16px' }}>Follow Us</h4>
          <ul style={{ listStyle: 'none', fontSize: '14px', lineHeight: '2' }}>
            <li>Facebook</li>
            <li>Instagram</li>
            <li>Twitter</li>
            <li>YouTube</li>
          </ul>
        </div>
      </div>
      
      <div style={{
        maxWidth: '1200px',
        margin: '30px auto 0',
        paddingTop: '20px',
        borderTop: '1px solid #374151',
        textAlign: 'center',
        fontSize: '14px'
      }}>
        © 2025 E-Business Shop. All rights reserved.
      </div>
    </footer>
  )
}
