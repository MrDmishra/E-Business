import React, { useState, useEffect } from "react"
import ProductList from "./components/ProductList"
import ProductManagement from "./components/ProductManagement"
import CategoryManagement from "./components/CategoryManagement"
import ItemManagement from "./components/ItemManagement"
import ConsumerManagement from "./components/ConsumerManagement"
import OrderManagement from "./components/OrderManagement"
import ReviewManagement from "./components/ReviewManagement"
import CustomerServiceManagement from "./components/CustomerServiceManagement"
import AboutUsManagement from "./components/AboutUsManagement"
import Login from "./components/Login"
import NotificationBar from "./components/NotificationBar"
import ToastNotification from "./components/ToastNotification"
import { AlertProvider } from "./context/AlertContext"

const sidebarLinks = [
  { label: "Dashboard", icon: "📊" },
  { label: "Orders", icon: "📦" },
  { label: "Products", icon: "🛍️" },
  { label: "Items", icon: "📦" },
  { label: "Categories", icon: "📁" },
  { label: "Customers", icon: "👥" },
  { label: "Reviews", icon: "⭐" },
  { label: "Customer Service", icon: "💬" },
  { label: "About Us", icon: "ℹ️" },
  { label: "Reports", icon: "📈" },
  { label: "Settings", icon: "⚙️" }
]

export default function App(){
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [currentUser, setCurrentUser] = useState(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState("Dashboard")
  const [logoutTimer, setLogoutTimer] = useState(null)
  
  // Dashboard data states
  const [dashboardData, setDashboardData] = useState({
    newOrders: 0,
    ordersOnHold: 0,
    outOfStockItems: 0,
    totalOrders: 0,
    newCustomers: 0,
    completedOrders: 0,
    pendingOrders: 0,
    previousTotalOrders: 0,
    previousNewCustomers: 0,
    latestReviews: []
  })
  const [loadingDashboard, setLoadingDashboard] = useState(false)
  const [reviewsPage, setReviewsPage] = useState(1)
  const reviewsPerPage = 6
  const [selectedReview, setSelectedReview] = useState(null)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showReviewPopup, setShowReviewPopup] = useState(false)
  const [showOrderPopup, setShowOrderPopup] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState(null)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [paymentData, setPaymentData] = useState({ channels: [], loading: true })
  const [regionData, setRegionData] = useState({ regions: [], loading: true })
  
  // Notification states
  const [notifications, setNotifications] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [notificationPolling, setNotificationPolling] = useState(null)
  const [currentToast, setCurrentToast] = useState(null)
  const [notificationIdCounter, setNotificationIdCounter] = useState(1000)
  
  const TIMEOUT_DURATION = 8 * 60 * 60 * 1000 // 8 hours in milliseconds
  const NOTIFICATION_POLL_INTERVAL = 30000 // Poll every 30 seconds

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser')
    const loginTimestamp = localStorage.getItem('loginTimestamp')
    
    if (savedUser && loginTimestamp) {
      const timeElapsed = Date.now() - parseInt(loginTimestamp)
      if (timeElapsed < TIMEOUT_DURATION) {
        // Session still valid
        setCurrentUser(JSON.parse(savedUser))
        setIsLoggedIn(true)
        setLoading(false)
        return
      } else {
        // Session expired
        localStorage.removeItem('currentUser')
        localStorage.removeItem('loginTimestamp')
      }
    }
    
    // Try fetching from server
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me", {
          credentials: "include"
        })
        if (res.ok) {
          const user = await res.json()
          setCurrentUser(user)
          setIsLoggedIn(true)
          localStorage.setItem('currentUser', JSON.stringify(user))
          localStorage.setItem('loginTimestamp', Date.now().toString())
        }
      } catch (err) {
        setIsLoggedIn(false)
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [])
  
  // Fetch dashboard data
  useEffect(() => {
    if (isLoggedIn && currentPage === "Dashboard") {
      fetchDashboardData()
      fetchPaymentData()
      fetchRegionData()
    }
  }, [isLoggedIn, currentPage, selectedMonth, selectedYear])
  
  // Fetch notifications and setup polling
  useEffect(() => {
    if (isLoggedIn) {
      fetchNotifications()
      
      // Poll for new notifications every 30 seconds
      const interval = setInterval(() => {
        fetchNotifications()
      }, NOTIFICATION_POLL_INTERVAL)
      
      setNotificationPolling(interval)
      
      return () => {
        if (interval) clearInterval(interval)
      }
    }
  }, [isLoggedIn])
  
  const fetchDashboardData = async () => {
    setLoadingDashboard(true)
    try {
      // Fetch all necessary data in parallel
      const [ordersRes, itemsRes, consumersRes, reviewsRes] = await Promise.all([
        fetch('/api/orders').then(r => r.ok ? r.json() : []),
        fetch('/api/items').then(r => r.ok ? r.json() : []),
        fetch('/api/consumers').then(r => r.ok ? r.json() : []),
        fetch('/api/reviews').then(r => r.ok ? r.json() : [])
      ])
      
      // Calculate date ranges
      const now = new Date()
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
      
      // Process orders data
      const allOrders = Array.isArray(ordersRes) ? ordersRes : []
      
      const recentOrders = allOrders.filter(order => {
        const orderDate = new Date(order.orderDate || order.createdAt)
        return orderDate >= sevenDaysAgo
      })
      const previousOrders = allOrders.filter(order => {
        const orderDate = new Date(order.orderDate || order.createdAt)
        return orderDate >= fourteenDaysAgo && orderDate < sevenDaysAgo
      })
      
      // Try multiple status variations and property names
      const ordersOnHold = allOrders.filter(order => 

        order.orderStatus === 'PENDING' 
      ).length
      
      const completedOrders = allOrders.filter(order => 
        order.orderStatus === 'COMPLETED' || order.orderStatus === 'DELIVERED'
      ).length
      
      const pendingOrders = allOrders.filter(order => 
        order.orderStatus === 'PENDING' || order.orderStatus === 'PROCESSING'
      ).length
      
      // Process items data
      const allItems = Array.isArray(itemsRes) ? itemsRes : []
      
      const outOfStockItems = allItems.filter(item => 
        item.itemStatus === 'OUT_OF_STOCK' 
      ).length
      
      // Process customers data
      const allConsumers = Array.isArray(consumersRes) ? consumersRes : []
      const newCustomers = allConsumers.filter(consumer => {
        const joinDate = new Date(consumer.createdAt || consumer.registeredDate)
        return joinDate >= sevenDaysAgo
      }).length
      
      const previousNewCustomers = allConsumers.filter(consumer => {
        const joinDate = new Date(consumer.createdAt || consumer.registeredDate)
        return joinDate >= fourteenDaysAgo && joinDate < sevenDaysAgo
      }).length
      
      // Process reviews - get all reviews for dashboard
      const allReviews = Array.isArray(reviewsRes) ? reviewsRes : []
      const sortedReviews = allReviews
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      
      setDashboardData({
        newOrders: recentOrders.length,
        ordersOnHold,
        outOfStockItems,
        totalOrders: allOrders.length,
        newCustomers,
        completedOrders,
        pendingOrders,
        previousTotalOrders: previousOrders.length,
        previousNewCustomers,
        latestReviews: sortedReviews
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      showAlert('error', 'Failed to Load Dashboard', 'Unable to fetch dashboard data from server')
    } finally {
      setLoadingDashboard(false)
    }
  }
  
  const fetchPaymentData = async () => {
    setPaymentData(prev => ({ ...prev, loading: true }))
    try {
      const res = await fetch('/api/payments')
      if (res.ok) {
        const payments = await res.json()
        
        // Filter payments by selected month and year
        const filteredPayments = payments.filter(payment => {
          const paymentDate = new Date(payment.createdAt)
          return paymentDate.getMonth() === selectedMonth && 
                 paymentDate.getFullYear() === selectedYear
        })
        
        // Get number of days in selected month
        const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate()
        
        // Initialize data structure for each payment mode by date
        const modes = ['COD', 'CARD', 'UPI', 'NET_BANKING', 'WALLET']
        const dailyData = {}
        
        // Initialize all days for all modes
        modes.forEach(mode => {
          dailyData[mode] = {}
          for (let day = 1; day <= daysInMonth; day++) {
            dailyData[mode][day] = 0
          }
        })
        
        // Aggregate payments by date and mode
        filteredPayments.forEach(payment => {
          const paymentDate = new Date(payment.createdAt)
          const day = paymentDate.getDate()
          const mode = payment.paymentMode || 'UNKNOWN'
          
          if (dailyData[mode]) {
            dailyData[mode][day] += parseFloat(payment.amount || 0)
          }
        })
        
        // Convert to line chart data format
        const chartData = modes.map(mode => ({
          mode,
          data: Object.entries(dailyData[mode]).map(([day, amount]) => ({
            day: parseInt(day),
            amount
          }))
        }))
        
        setPaymentData({ chartData, daysInMonth, loading: false })
      } else {
        setPaymentData({ chartData: [], daysInMonth: 0, loading: false })
      }
    } catch (error) {
      console.error('Error fetching payment data:', error)
      setPaymentData({ chartData: [], daysInMonth: 0, loading: false })
    }
  }
  
  const fetchRegionData = async () => {
    setRegionData(prev => ({ ...prev, loading: true }))
    try {
      const res = await fetch('/api/analytics/regions')
      if (res.ok) {
        const regions = await res.json()
        setRegionData({ regions, loading: false })
      } else {
        setRegionData({ regions: [], loading: false })
      }
    } catch (error) {
      console.error('Error fetching region data:', error)
      setRegionData({ regions: [], loading: false })
    }
  }
  
  const fetchNotifications = async () => {
    try {
      // Fetch from backend - you'll need to create this endpoint
      const res = await fetch('/api/notifications')
      if (res.ok) {
        const data = await res.json()
        setNotifications(data)
      } else if (res.status === 403 || res.status === 404) {
        // Backend endpoint doesn't exist yet - use mock data once
        if (notifications.length === 0) {
          generateMockNotifications()
        }
        // Stop trying to fetch if endpoint is not available
        if (notificationPolling) {
          clearInterval(notificationPolling)
          setNotificationPolling(null)
        }
      } else {
        // Other errors - generate mock notifications
        generateMockNotifications()
      }
    } catch (error) {
      // Network or other errors - use mock data once and stop polling
      if (notifications.length === 0) {
        generateMockNotifications()
      }
      if (notificationPolling) {
        clearInterval(notificationPolling)
        setNotificationPolling(null)
      }
    }
  }
  
  const generateMockNotifications = () => {
    // Only generate if no notifications exist yet
    if (notifications.length === 0) {
      const mockNotifs = [
        {
          id: 1,
          type: 'ORDER',
          title: 'New Order Received',
          message: 'Order #12345 placed by John Doe',
          isRead: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 5) // 5 minutes ago
        },
        {
          id: 2,
          type: 'REVIEW',
          title: 'New Product Review',
          message: '5-star review on Premium Headphones',
          isRead: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
        },
        {
          id: 3,
          type: 'ALERT',
          title: 'Low Stock Alert',
          message: 'Wireless Mouse has only 5 units left',
          isRead: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
        }
      ]
      setNotifications(mockNotifs)
    }
  }
  
  const markNotificationAsRead = async (notificationId) => {
    try {
      // Call backend API to mark as read
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT'
      })
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
    
    // Update local state
    setNotifications(notifications.map(n => 
      n.id === notificationId ? { ...n, isRead: true } : n
    ))
  }
  
  const markAllNotificationsAsRead = async () => {
    try {
      // Call backend API to mark all as read
      await fetch('/api/notifications/read-all', {
        method: 'PUT'
      })
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
    
    // Update local state
    setNotifications(notifications.map(n => ({ ...n, isRead: true })))
  }
  
  // Show alert function (creates both toast and notification)
  const showAlert = (type, title, message, options = {}) => {
    const id = notificationIdCounter
    setNotificationIdCounter(id + 1)
    
    const notifType = {
      'success': 'SUCCESS',
      'error': 'ALERT',
      'warning': 'ALERT',
      'info': 'SUCCESS'
    }[type] || 'SUCCESS'
    
    // Create notification entry
    const notification = {
      id,
      type: notifType,
      title,
      message: message || '',
      isRead: false,
      createdAt: new Date()
    }
    
    // Add to notifications list (only if persistent)
    if (options.persistent !== false) {
      setNotifications(prev => [notification, ...prev])
    }
    
    // Show toast
    setCurrentToast({
      type,
      title,
      message,
      duration: options.duration || 5000
    })
    
    // Try to send to backend
    try {
      fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notification)
      }).catch(err => console.log('Backend notification endpoint not available'))
    } catch (err) {
      // Silent fail - notification already added locally
    }
  }
  
  // Setup auto-logout timer and activity tracking
  useEffect(() => {
    if (!isLoggedIn) return
    
    let currentTimer = null
    let lastActivity = Date.now()
    
    const resetTimer = () => {
      // Update last activity time
      lastActivity = Date.now()
      
      // Clear existing timer
      if (currentTimer) clearTimeout(currentTimer)
      
      // Update localStorage timestamp
      localStorage.setItem('loginTimestamp', lastActivity.toString())
      
      // Set new timeout
      currentTimer = setTimeout(() => {
        showAlert('warning', 'Session Expired', 'Your session has expired due to inactivity. Please login again.', { duration: 7000 })
        handleLogout()
      }, TIMEOUT_DURATION)
      
      setLogoutTimer(currentTimer)
    }
    
    // Reset timer on user activity - use throttling to prevent excessive calls
    let isThrottled = false
    const throttledResetTimer = () => {
      if (!isThrottled) {
        isThrottled = true
        resetTimer()
        setTimeout(() => {
          isThrottled = false
        }, 1000) // Throttle to once per second
      }
    }
    
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click']
    events.forEach(event => {
      document.addEventListener(event, throttledResetTimer, { passive: true })
    })
    
    // Initial timer setup
    resetTimer()
    
    // Cleanup
    return () => {
      if (currentTimer) clearTimeout(currentTimer)
      events.forEach(event => {
        document.removeEventListener(event, throttledResetTimer)
      })
    }
  }, [isLoggedIn])

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include"
      })
    } catch (err) {
      console.error("Logout failed:", err)
    }
    
    // Clear logout timer
    if (logoutTimer) clearTimeout(logoutTimer)
    
    // Clear notification polling
    if (notificationPolling) clearInterval(notificationPolling)
    
    // Clear localStorage
    localStorage.removeItem('currentUser')
    localStorage.removeItem('loginTimestamp')
    
    setCurrentUser(null)
    setIsLoggedIn(false)
    setNotifications([])
  }

  const handleLoginSuccess = (user) => {
    setCurrentUser(user)
    setIsLoggedIn(true)
    localStorage.setItem('currentUser', JSON.stringify(user))
    localStorage.setItem('loginTimestamp', Date.now().toString())
    
    // Show success alert
    setTimeout(() => {
      showAlert('success', 'Login Successful', `Welcome back, ${user.name}!`, { duration: 3000 })
    }, 500)
  }

  if (!isLoggedIn && !loading) {
    return <Login onLoginSuccess={handleLoginSuccess} />
  }

  if (loading) {
    return <div className="loading-screen">Loading...</div>
  }

  return (
    <AlertProvider showAlert={showAlert}>
      <div className="shell">
        <ToastNotification 
          toast={currentToast}
          onClose={() => setCurrentToast(null)}
        />
        
        <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <nav className="side-nav">
          {sidebarLinks.map((link) => (
            <button 
              key={link.label} 
              className={`side-link ${currentPage === link.label ? "active" : ""}`}
              onClick={() => setCurrentPage(link.label)}
              title={!sidebarOpen ? link.label : ""}
            >
              <span className="side-link-icon">{link.icon}</span>
              {sidebarOpen && <span className="side-link-text">{link.label}</span>}
            </button>
          ))}
        </nav>
        
        {/* Toggle Button */}
        <div style={{
          padding: '12px',
          borderTop: '1px solid var(--border)',
          marginTop: 'auto'
        }}>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="side-link"
            style={{
              width: '100%',
              justifyContent: 'center'
            }}
            title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            <span className="side-link-icon">{sidebarOpen ? '◀' : '▶'}</span>
            {sidebarOpen && <span className="side-link-text">Collapse</span>}
          </button>
        </div>
      </aside>

      <div className={`main ${sidebarOpen ? "with-sidebar" : "with-sidebar-closed"}`}>
        <header className="navbar">
          <div className="nav-left">
            <button className="logo-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <div className="logo-dot">EB</div>
            </button>
            <div>
              <p className="eyebrow">Ecommerce</p>
              <h2 className="nav-title">{currentPage}</h2>
            </div>
          </div>
          <div className="nav-right">
            {isLoggedIn && currentUser ? (
              <>
                <button 
                  className="notification-bell"
                  onClick={() => setShowNotifications(!showNotifications)}
                  style={{
                    position: 'relative',
                    background: 'none',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer',
                    padding: '8px',
                    marginRight: '12px'
                  }}
                >
                  🔔
                  {notifications.filter(n => !n.isRead).length > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      background: '#ef4444',
                      color: 'white',
                      borderRadius: '10px',
                      padding: '2px 6px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      minWidth: '18px',
                      textAlign: 'center'
                    }}>
                      {notifications.filter(n => !n.isRead).length}
                    </span>
                  )}
                </button>
                <span className="pill">{currentUser.name}</span>
                <button className="primary" onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <>
                <button className="ghost">Login</button>
              </>
            )}
          </div>
          
          <NotificationBar 
            isOpen={showNotifications}
            onClose={() => setShowNotifications(false)}
            notifications={notifications}
            onMarkAsRead={markNotificationAsRead}
            onMarkAllAsRead={markAllNotificationsAsRead}
          />
        </header>

        <div className="app">
          {currentPage === "Dashboard" ? (
            <>
              <header className="topbar">
                <div>
                  <p className="eyebrow">Ecommerce</p>
                  <h1>Ecommerce Dashboard</h1>
                  <p className="muted">Here's what's going on at your business right now.</p>
                </div>
                <div className="pill">Updated just now</div>
              </header>

              <section className="kpi-row">
                <div className="card kpi">
                  <p className="muted">New orders</p>
                  <div className="kpi-value">
                    {loadingDashboard ? '...' : dashboardData.newOrders}
                  </div>
                  <p className="muted small">Last 7 days</p>
                </div>
                <div className="card kpi">
                  <p className="muted">Orders</p>
                  <div className="kpi-value">
                    {loadingDashboard ? '...' : dashboardData.ordersOnHold}
                  </div>
                  <p className="muted small">Pending Orders</p>
                </div>
                <div className="card kpi">
                  <p className="muted">Products</p>
                  <div className="kpi-value">
                    {loadingDashboard ? '...' : dashboardData.outOfStockItems}
                  </div>
                  <p className="muted small">Out of stock</p>
                </div>
              </section>

              <section className="grid-2">
                <div className="card chart-card">
                  <div className="card-head">
                    <div>
                      <p className="muted">Total sales</p>
                      <h3>Payment received across all channels</h3>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <select 
                        value={selectedMonth} 
                        onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                        style={{
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: '1px solid #e5e7eb',
                          backgroundColor: 'white',
                          fontSize: '14px',
                          cursor: 'pointer',
                          color: '#374151'
                        }}
                      >
                        <option value={0}>January</option>
                        <option value={1}>February</option>
                        <option value={2}>March</option>
                        <option value={3}>April</option>
                        <option value={4}>May</option>
                        <option value={5}>June</option>
                        <option value={6}>July</option>
                        <option value={7}>August</option>
                        <option value={8}>September</option>
                        <option value={9}>October</option>
                        <option value={10}>November</option>
                        <option value={11}>December</option>
                      </select>
                      <select 
                        value={selectedYear} 
                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                        style={{
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: '1px solid #e5e7eb',
                          backgroundColor: 'white',
                          fontSize: '14px',
                          cursor: 'pointer',
                          color: '#374151'
                        }}
                      >
                        {[2024, 2025, 2026, 2027].map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div style={{ padding: '20px' }}>
                    {paymentData.loading ? (
                      <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                        Loading payment data...
                      </div>
                    ) : !paymentData.chartData || paymentData.chartData.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '40px' }}>
                        <div style={{ fontSize: '48px', marginBottom: '12px' }}>💳</div>
                        <div style={{ color: '#999' }}>No payments found</div>
                        <div style={{ fontSize: '12px', marginTop: '8px', color: '#bbb' }}>
                          {`No payment data for ${['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][selectedMonth]} ${selectedYear}`}
                        </div>
                      </div>
                    ) : (
                      <div>
                        {/* Multi-line Chart */}
                        <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                          {(() => {
                            const chartWidth = 700
                            const chartHeight = 300
                            const padding = { top: 30, right: 40, bottom: 50, left: 80 }
                            const graphWidth = chartWidth - padding.left - padding.right
                            const graphHeight = chartHeight - padding.top - padding.bottom
                            
                            // Find max amount for Y-axis scaling
                            const maxAmount = Math.max(...paymentData.chartData.flatMap(line => 
                              line.data.map(d => d.amount)
                            ), 1)
                            
                            // Color mapping
                            const colors = {
                              'COD': '#f59e0b',
                              'CARD': '#3b82f6',
                              'UPI': '#8b5cf6',
                              'NET_BANKING': '#10b981',
                              'WALLET': '#ec4899'
                            }
                            
                            // Create path for each payment mode
                            const createPath = (data) => {
                              return data.map((point, idx) => {
                                const x = padding.left + (point.day - 1) * (graphWidth / (paymentData.daysInMonth - 1))
                                const y = padding.top + graphHeight - (point.amount / maxAmount * graphHeight)
                                return idx === 0 ? `M ${x} ${y}` : `L ${x} ${y}`
                              }).join(' ')
                            }
                            
                            return (
                              <svg width={chartWidth} height={chartHeight} style={{ backgroundColor: 'white', borderRadius: '8px' }}>
                                {/* Grid lines */}
                                {[0, 0.25, 0.5, 0.75, 1].map((factor, idx) => {
                                  const y = padding.top + graphHeight * (1 - factor)
                                  return (
                                    <g key={idx}>
                                      <line
                                        x1={padding.left}
                                        y1={y}
                                        x2={chartWidth - padding.right}
                                        y2={y}
                                        stroke="#e5e7eb"
                                        strokeWidth="1"
                                      />
                                      <text
                                        x={padding.left - 10}
                                        y={y + 4}
                                        textAnchor="end"
                                        fontSize="11"
                                        fill="#6b7280"
                                      >
                                        ₹{(maxAmount * factor).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                      </text>
                                    </g>
                                  )
                                })}
                                
                                {/* X-axis labels (dates) */}
                                {[1, Math.floor(paymentData.daysInMonth / 4), Math.floor(paymentData.daysInMonth / 2), Math.floor(3 * paymentData.daysInMonth / 4), paymentData.daysInMonth].map((day, idx) => {
                                  const x = padding.left + (day - 1) * (graphWidth / (paymentData.daysInMonth - 1))
                                  return (
                                    <text
                                      key={idx}
                                      x={x}
                                      y={chartHeight - padding.bottom + 20}
                                      textAnchor="middle"
                                      fontSize="11"
                                      fill="#6b7280"
                                    >
                                      {day}
                                    </text>
                                  )
                                })}
                                
                                {/* X-axis label */}
                                <text
                                  x={chartWidth / 2}
                                  y={chartHeight - 10}
                                  textAnchor="middle"
                                  fontSize="13"
                                  fill="#374151"
                                  fontWeight="500"
                                >
                                  Date of Month
                                </text>
                                
                                {/* Y-axis label */}
                                <text
                                  x={-chartHeight / 2}
                                  y={20}
                                  textAnchor="middle"
                                  fontSize="13"
                                  fill="#374151"
                                  fontWeight="500"
                                  transform={`rotate(-90)`}
                                >
                                  Amount (₹)
                                </text>
                                
                                {/* Draw lines for each payment mode */}
                                {paymentData.chartData.map((line, idx) => (
                                  <path
                                    key={idx}
                                    d={createPath(line.data)}
                                    fill="none"
                                    stroke={colors[line.mode] || '#6b7280'}
                                    strokeWidth="2.5"
                                    strokeLinejoin="round"
                                    strokeLinecap="round"
                                  />
                                ))}
                                
                                {/* Draw points on lines */}
                                {paymentData.chartData.map((line, lineIdx) => 
                                  line.data.filter(point => point.amount > 0).map((point, pointIdx) => {
                                    const x = padding.left + (point.day - 1) * (graphWidth / (paymentData.daysInMonth - 1))
                                    const y = padding.top + graphHeight - (point.amount / maxAmount * graphHeight)
                                    return (
                                      <circle
                                        key={`${lineIdx}-${pointIdx}`}
                                        cx={x}
                                        cy={y}
                                        r="4"
                                        fill={colors[line.mode] || '#6b7280'}
                                        stroke="white"
                                        strokeWidth="2"
                                      />
                                    )
                                  })
                                )}
                              </svg>
                            )
                          })()}
                        </div>
                        
                        {/* Legend */}
                        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '16px', marginTop: '20px' }}>
                          {paymentData.chartData.map((line, idx) => {
                            const colors = {
                              'COD': '#f59e0b',
                              'CARD': '#3b82f6',
                              'UPI': '#8b5cf6',
                              'NET_BANKING': '#10b981',
                              'WALLET': '#ec4899'
                            }
                            const totalAmount = line.data.reduce((sum, d) => sum + d.amount, 0)
                            
                            return (
                              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ 
                                  width: '16px', 
                                  height: '3px', 
                                  backgroundColor: colors[line.mode] || '#6b7280',
                                  borderRadius: '2px'
                                }}></div>
                                <span style={{ fontSize: '13px', color: '#374151', fontWeight: '500' }}>
                                  {line.mode.replace(/_/g, ' ')}
                                </span>
                                <span style={{ fontSize: '12px', color: '#6b7280' }}>
                                  (₹{totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })})
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="card stats-card">
                  <div className="stat-stack">
                    <div className="stat-item">
                      <div className="stat-top">
                        <p className="muted small">Total orders</p>
                        {!loadingDashboard && dashboardData.previousTotalOrders > 0 && (
                          <span className={`delta ${
                            dashboardData.totalOrders >= dashboardData.previousTotalOrders ? "up" : "down"
                          }`}>
                            {((dashboardData.totalOrders - dashboardData.previousTotalOrders) / dashboardData.previousTotalOrders * 100).toFixed(1)}%
                          </span>
                        )}
                      </div>
                      <div className="stat-value">
                        {loadingDashboard ? '...' : dashboardData.totalOrders.toLocaleString()}
                      </div>
                      <p className="muted small">All time</p>
                    </div>
                    
                    <div className="stat-item">
                      <div className="stat-top">
                        <p className="muted small">New customers</p>
                        {!loadingDashboard && dashboardData.previousNewCustomers > 0 && (
                          <span className={`delta ${
                            dashboardData.newCustomers >= dashboardData.previousNewCustomers ? "up" : "down"
                          }`}>
                            {((dashboardData.newCustomers - dashboardData.previousNewCustomers) / dashboardData.previousNewCustomers * 100).toFixed(1)}%
                          </span>
                        )}
                      </div>
                      <div className="stat-value">
                        {loadingDashboard ? '...' : dashboardData.newCustomers}
                      </div>
                      <p className="muted small">Last 7 days</p>
                    </div>
                    
                    <div className="stat-item">
                      <div className="stat-top">
                        <p className="muted small">Payment mix</p>
                      </div>
                      <div className="stat-value">
                        {loadingDashboard ? '...' : (
                          dashboardData.totalOrders > 0 
                            ? `${Math.round(dashboardData.completedOrders / dashboardData.totalOrders * 100)}% Completed`
                            : '0% Completed'
                        )}
                      </div>
                      <p className="muted small">
                        {loadingDashboard ? '...' : (
                          dashboardData.totalOrders > 0 
                            ? `${Math.round(dashboardData.pendingOrders / dashboardData.totalOrders * 100)}% Pending`
                            : '0% Pending'
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="card">
                <div className="card-head">
                  <div>
                    <p className="muted">Latest reviews</p>
                    <h3>Recent customer reviews on orders</h3>
                  </div>
                  <button className="ghost" onClick={() => setCurrentPage('Reviews')}>View all</button>
                </div>
                {loadingDashboard ? (
                  <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                    Loading reviews...
                  </div>
                ) : dashboardData.latestReviews.length === 0 ? (
                  <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>⭐</div>
                    <div>No reviews yet</div>
                    <div style={{ fontSize: '14px', marginTop: '8px', color: '#bbb' }}>
                      Customer reviews will appear here
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                        <thead>
                          <tr style={{ 
                            backgroundColor: '#f9fafb', 
                            borderBottom: '2px solid #e5e7eb',
                            textAlign: 'left'
                          }}>
                            <th style={{ padding: '12px 16px', fontWeight: '600', fontSize: '12px', color: '#6b7280', textTransform: 'uppercase' }}>Product</th>
                            <th style={{ padding: '12px 16px', fontWeight: '600', fontSize: '12px', color: '#6b7280', textTransform: 'uppercase' }}>Order ID</th>
                            <th style={{ padding: '12px 16px', fontWeight: '600', fontSize: '12px', color: '#6b7280', textTransform: 'uppercase' }}>Customer</th>
                            <th style={{ padding: '12px 16px', fontWeight: '600', fontSize: '12px', color: '#6b7280', textTransform: 'uppercase' }}>Rating</th>
                            <th style={{ padding: '12px 16px', fontWeight: '600', fontSize: '12px', color: '#6b7280', textTransform: 'uppercase' }}>Order Status</th>
                            <th style={{ padding: '12px 16px', fontWeight: '600', fontSize: '12px', color: '#6b7280', textTransform: 'uppercase' }}>Review</th>
                            <th style={{ padding: '12px 16px', fontWeight: '600', fontSize: '12px', color: '#6b7280', textTransform: 'uppercase' }}>Time</th>
                            <th style={{ padding: '12px 16px', fontWeight: '600', fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', textAlign: 'center' }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dashboardData.latestReviews
                            .slice((reviewsPage - 1) * reviewsPerPage, reviewsPage * reviewsPerPage)
                            .map(review => (
                            <tr key={review.reviewId} style={{ 
                              borderBottom: '1px solid #f3f4f6',
                              transition: 'background-color 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                            >
                              {/* Product Image & Name */}
                              <td style={{ padding: '12px 16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                  <div style={{ 
                                    width: '48px', 
                                    height: '48px', 
                                    borderRadius: '6px', 
                                    overflow: 'hidden',
                                    backgroundColor: '#f3f4f6',
                                    flexShrink: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}>
                                    <img 
                                      src={`https://via.placeholder.com/48x48/667eea/ffffff?text=${(review.itemName || 'Item').charAt(0)}`}
                                      alt={review.itemName}
                                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                      onError={(e) => {
                                        e.target.style.display = 'none'
                                        e.target.parentElement.innerHTML = `<div style="font-size: 20px; color: #667eea;">📦</div>`
                                      }}
                                    />
                                  </div>
                                  <div style={{ maxWidth: '150px' }}>
                                    <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                      {review.itemName || 'N/A'}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              
                              {/* Order ID */}
                              <td style={{ padding: '12px 16px' }}>
                                <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                                  #{review.reviewId || 'N/A'}
                                </div>
                              </td>
                              
                              {/* Customer Name */}
                              <td style={{ padding: '12px 16px' }}>
                                <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                                  {review.consumerName || 'Anonymous'}
                                </div>
                              </td>
                              
                              {/* Rating */}
                              <td style={{ padding: '12px 16px' }}>
                                <div style={{ fontSize: '16px' }}>
                                  {'⭐'.repeat(review.rating || 0)}{'☆'.repeat(5 - (review.rating || 0))}
                                </div>
                              </td>
                              
                              {/* Order Status */}
                              <td style={{ padding: '12px 16px' }}>
                                <span style={{ 
                                  padding: '4px 8px', 
                                  borderRadius: '4px', 
                                  backgroundColor: '#dbeafe', 
                                  color: '#1e40af',
                                  fontSize: '12px',
                                  fontWeight: '500'
                                }}>
                                  Completed
                                </span>
                              </td>
                              
                              {/* Review Comment */}
                              <td style={{ padding: '12px 16px', maxWidth: '250px' }}>
                                <div style={{ fontSize: '13px', color: '#374151', lineHeight: '1.5', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {review.reviewText || <span style={{ fontStyle: 'italic', color: '#9ca3af' }}>No comment</span>}
                                </div>
                              </td>
                              
                              {/* Time */}
                              <td style={{ padding: '12px 16px' }}>
                                <div style={{ fontSize: '13px', color: '#6b7280' }}>
                                  {review.createdAt ? (
                                    (() => {
                                      const date = new Date(review.createdAt)
                                      const now = new Date()
                                      const diffMs = now - date
                                      const diffMins = Math.floor(diffMs / 60000)
                                      const diffHours = Math.floor(diffMs / 3600000)
                                      const diffDays = Math.floor(diffMs / 86400000)
                                      
                                      if (diffMins < 60) return `${diffMins}m ago`
                                      if (diffHours < 24) return `${diffHours}h ago`
                                      if (diffDays < 7) return `${diffDays}d ago`
                                      return date.toLocaleDateString()
                                    })()
                                  ) : (
                                    'N/A'
                                  )}
                                </div>
                              </td>
                              
                              {/* Action Dropdown */}
                              <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                <div style={{ position: 'relative', display: 'inline-block' }}>
                                  <button
                                    onClick={() => setActiveDropdown(activeDropdown === review.reviewId ? null : review.reviewId)}
                                    style={{
                                      padding: '6px 12px',
                                      backgroundColor: 'transparent',
                                      color: '#6b7280',
                                      border: '1px solid #e5e7eb',
                                      borderRadius: '6px',
                                      cursor: 'pointer',
                                      fontSize: '16px',
                                      fontWeight: '700',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                      e.target.style.backgroundColor = '#f3f4f6'
                                      e.target.style.borderColor = '#d1d5db'
                                    }}
                                    onMouseLeave={(e) => {
                                      e.target.style.backgroundColor = 'transparent'
                                      e.target.style.borderColor = '#e5e7eb'
                                    }}
                                  >
                                    ⋯
                                  </button>
                                  
                                  {activeDropdown === review.reviewId && (
                                    <div style={{
                                      position: 'absolute',
                                      top: '100%',
                                      right: 0,
                                      marginTop: '4px',
                                      backgroundColor: 'white',
                                      borderRadius: '6px',
                                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
                                      border: '1px solid #e5e7eb',
                                      minWidth: '180px',
                                      zIndex: 10
                                    }}>
                                      <button
                                        onClick={() => {
                                          setSelectedReview(review)
                                          setShowReviewPopup(true)
                                          setActiveDropdown(null)
                                        }}
                                        style={{
                                          width: '100%',
                                          padding: '10px 16px',
                                          border: 'none',
                                          backgroundColor: 'transparent',
                                          textAlign: 'left',
                                          cursor: 'pointer',
                                          fontSize: '14px',
                                          color: '#374151',
                                          borderBottom: '1px solid #e5e7eb'
                                        }}
                                        onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                      >
                                        📝 Review Management
                                      </button>
                                      <button
                                        onClick={async () => {
                                          // Fetch order details based on review
                                          try {
                                            const ordersRes = await fetch('/api/orders')
                                            if (ordersRes.ok) {
                                              const orders = await ordersRes.json()
                                              const order = orders.find(o => 
                                                o.consumerId === review.consumerId && 
                                                o.orderItems?.some(item => item.itemId === review.itemId)
                                              )
                                              setSelectedOrder(order || { orderId: 'N/A', consumerName: review.consumerName })
                                              setShowOrderPopup(true)
                                              setActiveDropdown(null)
                                            }
                                          } catch (err) {
                                            console.error('Failed to fetch order')
                                          }
                                        }}
                                        style={{
                                          width: '100%',
                                          padding: '10px 16px',
                                          border: 'none',
                                          backgroundColor: 'transparent',
                                          textAlign: 'left',
                                          cursor: 'pointer',
                                          fontSize: '14px',
                                          color: '#374151',
                                          borderRadius: '0 0 6px 6px'
                                        }}
                                        onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                      >
                                        📦 Order Management
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {dashboardData.latestReviews.length > reviewsPerPage && (
                      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '16px', borderTop: '1px solid #e5e7eb' }}>
                        <button 
                          onClick={() => setReviewsPage(p => Math.max(1, p - 1))}
                          disabled={reviewsPage === 1}
                          style={{ 
                            padding: '8px 16px', 
                            backgroundColor: reviewsPage === 1 ? '#e5e7eb' : '#3b82f6', 
                            color: reviewsPage === 1 ? '#9ca3af' : 'white', 
                            border: 'none', 
                            borderRadius: '6px', 
                            cursor: reviewsPage === 1 ? 'not-allowed' : 'pointer',
                            fontSize: '14px',
                            fontWeight: '500'
                          }}
                        >
                          Previous
                        </button>
                        <span style={{ color: '#6b7280', fontSize: '14px', fontWeight: '500' }}>
                          Page {reviewsPage} of {Math.ceil(dashboardData.latestReviews.length / reviewsPerPage)}
                        </span>
                        <button 
                          onClick={() => setReviewsPage(p => Math.min(Math.ceil(dashboardData.latestReviews.length / reviewsPerPage), p + 1))}
                          disabled={reviewsPage >= Math.ceil(dashboardData.latestReviews.length / reviewsPerPage)}
                          style={{ 
                            padding: '8px 16px', 
                            backgroundColor: reviewsPage >= Math.ceil(dashboardData.latestReviews.length / reviewsPerPage) ? '#e5e7eb' : '#3b82f6', 
                            color: reviewsPage >= Math.ceil(dashboardData.latestReviews.length / reviewsPerPage) ? '#9ca3af' : 'white', 
                            border: 'none', 
                            borderRadius: '6px', 
                            cursor: reviewsPage >= Math.ceil(dashboardData.latestReviews.length / reviewsPerPage) ? 'not-allowed' : 'pointer',
                            fontSize: '14px',
                            fontWeight: '500'
                          }}
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </>
                )}
              </section>

              {/* Top Regions by Revenue Table */}
              <section className="card">
                <div className="card-head">
                  <div>
                    <p className="muted">Regional analytics</p>
                    <h3>Top regions by revenue</h3>
                  </div>
                </div>
                {regionData.loading ? (
                  <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                    Loading region data...
                  </div>
                ) : regionData.regions.length === 0 ? (
                  <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>🗺️</div>
                    <div>No region data available</div>
                    <div style={{ fontSize: '14px', marginTop: '8px', color: '#bbb' }}>
                      Region data will appear once orders are placed
                    </div>
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                      <thead>
                        <tr style={{ 
                          backgroundColor: '#f9fafb', 
                          borderBottom: '2px solid #e5e7eb',
                          textAlign: 'left'
                        }}>
                          <th style={{ padding: '12px 16px', fontWeight: '600', fontSize: '12px', color: '#6b7280', textTransform: 'uppercase' }}>Region</th>
                          <th style={{ padding: '12px 16px', fontWeight: '600', fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', textAlign: 'center' }}>Users</th>
                          <th style={{ padding: '12px 16px', fontWeight: '600', fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', textAlign: 'center' }}>Transactions</th>
                          <th style={{ padding: '12px 16px', fontWeight: '600', fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', textAlign: 'right' }}>Revenue</th>
                          <th style={{ padding: '12px 16px', fontWeight: '600', fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', textAlign: 'right' }}>Rate (%)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {regionData.regions.map((region, idx) => (
                          <tr key={idx} style={{ 
                            borderBottom: '1px solid #f3f4f6',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                          >
                            <td style={{ padding: '12px 16px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ 
                                  width: '32px', 
                                  height: '32px', 
                                  borderRadius: '6px', 
                                  backgroundColor: '#e0e7ff',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '16px'
                                }}>
                                  📍
                                </div>
                                <div>
                                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                                    {region.region}
                                  </div>
                                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                    State
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                              <div style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                                {region.users.toLocaleString()}
                              </div>
                            </td>
                            <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                              <div style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                                {region.transactions.toLocaleString()}
                              </div>
                            </td>
                            <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                              <div style={{ fontSize: '16px', fontWeight: '700', color: '#059669' }}>
                                ₹{parseFloat(region.revenue).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </div>
                            </td>
                            <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                                <div style={{ flex: '0 0 60px' }}>
                                  <div style={{ 
                                    height: '8px', 
                                    backgroundColor: '#f3f4f6', 
                                    borderRadius: '4px',
                                    overflow: 'hidden'
                                  }}>
                                    <div style={{ 
                                      width: `${Math.min(region.rate, 100)}%`, 
                                      height: '100%', 
                                      backgroundColor: '#3b82f6',
                                      transition: 'width 0.3s ease'
                                    }}></div>
                                  </div>
                                </div>
                                <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151', minWidth: '50px', textAlign: 'right' }}>
                                  {region.rate.toFixed(1)}%
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
              
              {/* Review Management Popup */}
              {showReviewPopup && selectedReview && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowReviewPopup(false)}>
                  <div style={{ backgroundColor: 'white', borderRadius: '12px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflow: 'auto', padding: '24px' }} onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827' }}>Review Details</h2>
                      <button onClick={() => setShowReviewPopup(false)} style={{ fontSize: '24px', border: 'none', background: 'none', cursor: 'pointer', color: '#9ca3af' }}>×</button>
                    </div>
                    
                    <div style={{ marginBottom: '16px', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '12px' }}>
                        <div>
                          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Review ID</div>
                          <div style={{ fontSize: '14px', fontWeight: '600' }}>#{selectedReview.reviewId}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Date</div>
                          <div style={{ fontSize: '14px', fontWeight: '600' }}>
                            {selectedReview.createdAt ? new Date(selectedReview.createdAt).toLocaleDateString() : 'N/A'}
                          </div>
                        </div>
                      </div>
                      
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Customer</div>
                        <div style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>{selectedReview.consumerName || 'Anonymous'}</div>
                      </div>
                      
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Product</div>
                        <div style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>{selectedReview.itemName || 'N/A'}</div>
                      </div>
                      
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Rating</div>
                        <div style={{ fontSize: '24px' }}>
                          {'⭐'.repeat(selectedReview.rating || 0)}{'☆'.repeat(5 - (selectedReview.rating || 0))}
                        </div>
                      </div>
                      
                      <div>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Review Comment</div>
                        <div style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6', padding: '12px', backgroundColor: 'white', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                          {selectedReview.reviewText || <span style={{ fontStyle: 'italic', color: '#9ca3af' }}>No comment provided</span>}
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                      <button onClick={() => setShowReviewPopup(false)} style={{ padding: '10px 20px', backgroundColor: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>
                        Close
                      </button>
                      <button onClick={() => {
                        setShowReviewPopup(false)
                        setCurrentPage('Reviews')
                      }} style={{ padding: '10px 20px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>
                        Manage in Reviews
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Order Management Popup */}
              {showOrderPopup && selectedOrder && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowOrderPopup(false)}>
                  <div style={{ backgroundColor: 'white', borderRadius: '12px', width: '90%', maxWidth: '700px', maxHeight: '90vh', overflow: 'auto', padding: '24px' }} onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827' }}>Order Details</h2>
                      <button onClick={() => setShowOrderPopup(false)} style={{ fontSize: '24px', border: 'none', background: 'none', cursor: 'pointer', color: '#9ca3af' }}>×</button>
                    </div>
                    
                    <div style={{ marginBottom: '16px', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '12px' }}>
                        <div>
                          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Order ID</div>
                          <div style={{ fontSize: '14px', fontWeight: '600' }}>#{selectedOrder.orderId}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Status</div>
                          <div style={{ fontSize: '14px', fontWeight: '600' }}>
                            <span style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: '#dbeafe', color: '#1e40af' }}>
                              {selectedOrder.orderStatus || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Customer</div>
                        <div style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>{selectedOrder.consumerName || 'N/A'}</div>
                      </div>
                      
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Total Amount</div>
                        <div style={{ fontSize: '18px', fontWeight: '700', color: '#059669' }}>
                          ₹{selectedOrder.totalAmount || '0.00'}
                        </div>
                      </div>
                      
                      {selectedOrder.orderItems && selectedOrder.orderItems.length > 0 && (
                        <div>
                          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>Order Items</div>
                          <div style={{ backgroundColor: 'white', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                            {selectedOrder.orderItems.map((item, idx) => (
                              <div key={idx} style={{ padding: '12px', borderBottom: idx < selectedOrder.orderItems.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <div style={{ fontSize: '14px', color: '#111827' }}>{item.itemName}</div>
                                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>x{item.quantity}</div>
                                </div>
                                <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>₹{item.price}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                      <button onClick={() => setShowOrderPopup(false)} style={{ padding: '10px 20px', backgroundColor: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>
                        Close
                      </button>
                      <button onClick={() => {
                        setShowOrderPopup(false)
                        setCurrentPage('Orders')
                      }} style={{ padding: '10px 20px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>
                        Manage in Orders
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : currentPage === "Products" ? (
            <ProductManagement />
          ) : currentPage === "Items" ? (
            <ItemManagement />
          ) : currentPage === "Categories" ? (
            <CategoryManagement />
          ) : currentPage === "Customers" ? (
            <ConsumerManagement />
          ) : currentPage === "Orders" ? (
            <OrderManagement />
          ) : currentPage === "Reviews" ? (
            <ReviewManagement />
          ) : currentPage === "Customer Service" ? (
            <CustomerServiceManagement />
          ) : currentPage === "About Us" ? (
            <AboutUsManagement />
          ) : (
            <div style={{ padding: "24px", textAlign: "center", color: "#999" }}>
              <h2>{currentPage}</h2>
              <p>This page is coming soon...</p>
            </div>
          )}
        </div>
      </div>
      </div>
    </AlertProvider>
  )
}
