import React, { useEffect } from 'react'

export default function ToastNotification({ toast, onClose }) {
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        onClose()
      }, toast.duration || 5000)
      
      return () => clearTimeout(timer)
    }
  }, [toast, onClose])
  
  if (!toast) return null
  
  const getToastStyle = (type) => {
    const baseStyle = {
      position: 'fixed',
      top: '80px',
      right: '20px',
      minWidth: '320px',
      maxWidth: '480px',
      padding: '16px 20px',
      borderRadius: '12px',
      boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
      zIndex: 9999,
      animation: 'slideInRight 0.3s ease-out',
      cursor: 'pointer'
    }
    
    const styles = {
      success: {
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        color: 'white',
        border: '1px solid rgba(255,255,255,0.2)'
      },
      error: {
        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        color: 'white',
        border: '1px solid rgba(255,255,255,0.2)'
      },
      warning: {
        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        color: 'white',
        border: '1px solid rgba(255,255,255,0.2)'
      },
      info: {
        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
        color: 'white',
        border: '1px solid rgba(255,255,255,0.2)'
      }
    }
    
    return { ...baseStyle, ...styles[type] }
  }
  
  const getIcon = (type) => {
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    }
    return icons[type] || '🔔'
  }
  
  return (
    <>
      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes slideOutRight {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }
        
        .toast-progress {
          position: absolute;
          bottom: 0;
          left: 0;
          height: 4px;
          background: rgba(255,255,255,0.3);
          animation: progressBar ${toast.duration || 5000}ms linear;
        }
        
        @keyframes progressBar {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
      
      <div 
        style={getToastStyle(toast.type)}
        onClick={onClose}
      >
        <div style={{ fontSize: '24px', flexShrink: 0 }}>
          {getIcon(toast.type)}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: '600', marginBottom: '4px', fontSize: '15px' }}>
            {toast.title}
          </div>
          {toast.message && (
            <div style={{ fontSize: '14px', opacity: 0.95, lineHeight: '1.4' }}>
              {toast.message}
            </div>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onClose()
          }}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            color: 'white',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            cursor: 'pointer',
            fontSize: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          ×
        </button>
        <div className="toast-progress" />
      </div>
    </>
  )
}
