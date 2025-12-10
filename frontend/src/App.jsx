import React, { useState, useEffect } from "react"
import ProductList from "./components/ProductList"
import ProductManagement from "./components/ProductManagement"
import CategoryManagement from "./components/CategoryManagement"
import ItemManagement from "./components/ItemManagement"
import Login from "./components/Login"

const sidebarLinks = [
  { label: "Dashboard", icon: "📊" },
  { label: "Orders", icon: "📦" },
  { label: "Products", icon: "🛍️" },
  { label: "Items", icon: "📦" },
  { label: "Categories", icon: "📁" },
  { label: "Customers", icon: "👥" },
  { label: "Reviews", icon: "⭐" },
  { label: "Reports", icon: "📈" },
  { label: "Settings", icon: "⚙️" }
]

const kpis = [
  { label: "New orders", value: "57", sub: "Average processing" },
  { label: "Orders", value: "5", sub: "On hold" },
  { label: "Products", value: "15", sub: "Out of stock" }
]

const statCards = [
  { title: "Total orders", value: "16,247", delta: "-2.8%", period: "Last 7 days" },
  { title: "New customers", value: "356", delta: "+6.3%", period: "Last 7 days" },
  { title: "Payment mix", value: "52% Completed", note: "48% Pending" }
]

export default function App(){
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [currentUser, setCurrentUser] = useState(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState("Dashboard")
  const [logoutTimer, setLogoutTimer] = useState(null)
  
  const TIMEOUT_DURATION = 30 * 60 * 1000 // 30 minutes in milliseconds

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
  
  // Setup auto-logout timer and activity tracking
  useEffect(() => {
    if (!isLoggedIn) return
    
    const resetTimer = () => {
      if (logoutTimer) clearTimeout(logoutTimer)
      
      const timer = setTimeout(() => {
        handleLogout()
        alert('Session expired due to inactivity. Please login again.')
      }, TIMEOUT_DURATION)
      
      setLogoutTimer(timer)
      localStorage.setItem('loginTimestamp', Date.now().toString())
    }
    
    // Reset timer on user activity
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click']
    events.forEach(event => {
      document.addEventListener(event, resetTimer)
    })
    
    // Initial timer setup
    resetTimer()
    
    // Cleanup
    return () => {
      if (logoutTimer) clearTimeout(logoutTimer)
      events.forEach(event => {
        document.removeEventListener(event, resetTimer)
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
    
    // Clear localStorage
    localStorage.removeItem('currentUser')
    localStorage.removeItem('loginTimestamp')
    
    setCurrentUser(null)
    setIsLoggedIn(false)
  }

  const handleLoginSuccess = (user) => {
    setCurrentUser(user)
    setIsLoggedIn(true)
    localStorage.setItem('currentUser', JSON.stringify(user))
    localStorage.setItem('loginTimestamp', Date.now().toString())
  }

  if (!isLoggedIn && !loading) {
    return <Login onLoginSuccess={handleLoginSuccess} />
  }

  if (loading) {
    return <div className="loading-screen">Loading...</div>
  }

  return (
    <div className="shell">
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
                <span className="pill">{currentUser.name}</span>
                <button className="primary" onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <>
                <button className="ghost">Login</button>
              </>
            )}
          </div>
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
                {kpis.map((kpi) => (
                  <div key={kpi.label} className="card kpi">
                    <p className="muted">{kpi.label}</p>
                    <div className="kpi-value">{kpi.value}</div>
                    <p className="muted small">{kpi.sub}</p>
                  </div>
                ))}
              </section>

              <section className="grid-2">
                <div className="card chart-card">
                  <div className="card-head">
                    <div>
                      <p className="muted">Total sales</p>
                      <h3>Payment received across all channels</h3>
                    </div>
                    <button className="ghost">Last 30 days </button>
                  </div>
                  <div className="chart-placeholder">
                    <div className="sparkline" />
                  </div>
                </div>

                <div className="card stats-card">
                  <div className="stat-stack">
                    {statCards.map((card) => (
                      <div key={card.title} className="stat-item">
                        <div className="stat-top">
                          <p className="muted small">{card.title}</p>
                          {card.delta && <span className={`delta ${card.delta.startsWith("-") ? "down" : "up"}`}>{card.delta}</span>}
                        </div>
                        <div className="stat-value">{card.value}</div>
                        {card.period && <p className="muted small">{card.period}</p>}
                        {card.note && <p className="muted small">{card.note}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section className="card">
                <div className="card-head">
                  <div>
                    <p className="muted">Latest reviews</p>
                    <h3>Payment received across all channels</h3>
                  </div>
                  <div className="pill">All products</div>
                </div>
                <ProductList />
              </section>
            </>
          ) : currentPage === "Products" ? (
            <ProductManagement />
          ) : currentPage === "Items" ? (
            <ItemManagement />
          ) : currentPage === "Categories" ? (
            <CategoryManagement />
          ) : (
            <div style={{ padding: "24px", textAlign: "center", color: "#999" }}>
              <h2>{currentPage}</h2>
              <p>This page is coming soon...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
