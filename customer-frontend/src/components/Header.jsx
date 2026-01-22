import React from 'react'

export default function Header({ user, cartItemCount, onNavigate, onLogout }) {
  return (
    <header style={{
      background: 'linear-gradient(135deg, rgb(27, 60, 83) 0%, rgb(35, 76, 106) 100%)',
      boxShadow: '0 4px 20px rgba(27, 60, 83, 0.4)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '20px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 
          onClick={() => onNavigate('home')}
          style={{
            fontSize: '28px',
            fontWeight: '800',
            color: 'white',
            cursor: 'pointer',
            letterSpacing: '-0.5px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          🛍️ E-Business
        </h1>

        <nav style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button 
            onClick={() => onNavigate('home')}
            style={{
              background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)',
              border: 'none',
              fontSize: '15px',
              fontWeight: '600',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
            onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
            onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
          >
            🏠 Shop
          </button>

          <button 
            onClick={() => onNavigate('cart')}
            style={{
              background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)',
              border: 'none',
              fontSize: '15px',
              fontWeight: '600',
              color: 'white',
              position: 'relative',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
            onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
            onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
          >
            🛒 Cart
            {cartItemCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-6px',
                right: '-6px',
                background: 'linear-gradient(135deg, rgb(69, 104, 130) 0%, rgb(210, 193, 182) 100%)',
                color: 'white',
                borderRadius: '50%',
                width: '22px',
                height: '22px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                fontWeight: '700',
                boxShadow: '0 2px 8px rgba(69, 104, 130, 0.5)'
              }}>
                {cartItemCount}
              </span>
            )}
          </button>

          {user ? (
            <>
              <button 
                onClick={() => onNavigate('orders')}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)',
                  border: 'none',
                  fontSize: '15px',
                  fontWeight: '600',
                  color: 'white',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
                onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
                onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
              >
                📦 Orders
              </button>
              <button 
                onClick={() => onNavigate('profile')}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)',
                  border: 'none',
                  fontSize: '15px',
                  fontWeight: '600',
                  color: 'white',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
                onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
                onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
              >
                👤 {user.fullName}
              </button>
              <button 
                onClick={onLogout}
                style={{
                  background: 'rgba(255,255,255,0.9)',
                  backdropFilter: 'blur(10px)',
                  border: 'none',
                  fontSize: '15px',
                  fontWeight: '600',
                  color: 'rgb(27, 60, 83)',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  boxShadow: '0 2px 10px rgba(255,255,255,0.2)'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = 'white'
                  e.target.style.transform = 'translateY(-2px)'
                  e.target.style.boxShadow = '0 4px 15px rgba(255,255,255,0.4)'
                }}
                onMouseOut={(e) => {
                  e.target.style.background = 'rgba(255,255,255,0.9)'
                  e.target.style.transform = 'translateY(0)'
                  e.target.style.boxShadow = '0 2px 10px rgba(255,255,255,0.2)'
                }}
              >
                🚪 Logout
              </button>
            </>
          ) : (
            <button 
              onClick={() => onNavigate('login')}
              style={{
                background: 'linear-gradient(135deg, rgb(69, 104, 130) 0%, rgb(210, 193, 182) 100%)',
                color: 'white',
                border: 'none',
                padding: '12px 28px',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(69, 104, 130, 0.4)',
                transition: 'all 0.3s'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-2px)'
                e.target.style.boxShadow = '0 6px 20px rgba(69, 104, 130, 0.6)'
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = '0 4px 15px rgba(69, 104, 130, 0.4)'
              }}
            >
              🔐 Login
            </button>
          )}
        </nav>
      </div>
    </header>
  )
}
