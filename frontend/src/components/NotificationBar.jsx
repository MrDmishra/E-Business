import React, { useState, useEffect, useRef } from 'react'

export default function NotificationBar({ isOpen, onClose, notifications, onMarkAsRead, onMarkAllAsRead }) {
  const panelRef = useRef(null)
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target) && isOpen) {
        onClose()
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose])
  
  const unreadCount = notifications.filter(n => !n.isRead).length
  
  const getNotificationIcon = (type) => {
    switch(type) {
      case 'ORDER': return '📦'
      case 'PRODUCT': return '🛍️'
      case 'CUSTOMER': return '👤'
      case 'REVIEW': return '⭐'
      case 'ALERT': return '⚠️'
      case 'SUCCESS': return '✅'
      default: return '🔔'
    }
  }
  
  const getTimeAgo = (timestamp) => {
    const now = new Date()
    const notifTime = new Date(timestamp)
    const diffMs = now - notifTime
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return notifTime.toLocaleDateString()
  }
  
  if (!isOpen) return null
  
  return (
    <div 
      ref={panelRef}
      className="notification-panel"
      style={{
        position: 'fixed',
        top: '60px',
        right: '20px',
        width: '400px',
        maxHeight: '600px',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <div style={{ 
        padding: '16px 20px',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Notifications</h3>
          {unreadCount > 0 && (
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', opacity: 0.9 }}>
              {unreadCount} unread
            </p>
          )}
        </div>
        {notifications.length > 0 && (
          <button 
            onClick={onMarkAllAsRead}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '13px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Mark all read
          </button>
        )}
      </div>
      
      {/* Notification List */}
      <div style={{ 
        flex: 1,
        overflowY: 'auto',
        maxHeight: '500px'
      }}>
        {notifications.length === 0 ? (
          <div style={{ 
            padding: '40px 20px',
            textAlign: 'center',
            color: '#9ca3af'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔔</div>
            <p style={{ margin: 0, fontSize: '14px' }}>No notifications yet</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => onMarkAsRead(notification.id)}
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid #f3f4f6',
                cursor: 'pointer',
                background: notification.isRead ? 'white' : '#f9fafb',
                transition: 'background 0.2s',
                position: 'relative'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
              onMouseLeave={(e) => e.currentTarget.style.background = notification.isRead ? 'white' : '#f9fafb'}
            >
              {!notification.isRead && (
                <div style={{
                  position: 'absolute',
                  left: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '8px',
                  height: '8px',
                  background: '#3b82f6',
                  borderRadius: '50%'
                }}/>
              )}
              
              <div style={{ display: 'flex', gap: '12px', marginLeft: notification.isRead ? '0' : '12px' }}>
                <div style={{ fontSize: '24px', flexShrink: 0 }}>
                  {getNotificationIcon(notification.type)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ 
                    margin: 0,
                    fontSize: '14px',
                    fontWeight: notification.isRead ? '400' : '600',
                    color: '#1f2937',
                    lineHeight: '1.5'
                  }}>
                    {notification.title}
                  </p>
                  {notification.message && (
                    <p style={{ 
                      margin: '4px 0 0 0',
                      fontSize: '13px',
                      color: '#6b7280',
                      lineHeight: '1.4'
                    }}>
                      {notification.message}
                    </p>
                  )}
                  <p style={{ 
                    margin: '6px 0 0 0',
                    fontSize: '12px',
                    color: '#9ca3af'
                  }}>
                    {getTimeAgo(notification.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Footer */}
      {notifications.length > 0 && (
        <div style={{
          padding: '12px 20px',
          borderTop: '1px solid #e5e7eb',
          textAlign: 'center'
        }}>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#667eea',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>
      )}
    </div>
  )
}
