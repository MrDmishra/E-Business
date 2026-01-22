import React, { useState, useEffect } from 'react'
import Header from './components/Header'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import ProductPage from './pages/ProductPage'
import ProductsListPage from './pages/ProductsListPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import ProfilePage from './pages/ProfilePage'
import OrdersPage from './pages/OrdersPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import CustomerServicePage from './pages/CustomerServicePage'
import AboutUsPage from './pages/AboutUsPage'

export default function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [user, setUser] = useState(null)
  const [cart, setCart] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)

  useEffect(() => {
    // Load user from localStorage
    const savedUser = localStorage.getItem('customerUser')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }

    // Load cart from localStorage
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      setCart(JSON.parse(savedCart))
    }
  }, [])

  useEffect(() => {
    // Save cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart))
  }, [cart])

  const login = (userData) => {
    setUser(userData)
    localStorage.setItem('customerUser', JSON.stringify(userData))
    setCurrentPage('home')
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('customerUser')
    setCurrentPage('home')
  }

  const addToCart = (item, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(i => i.itemId === item.itemId)
      if (existing) {
        return prev.map(i => 
          i.itemId === item.itemId 
            ? { ...i, quantity: i.quantity + quantity }
            : i
        )
      }
      return [...prev, { ...item, quantity }]
    })
  }

  const updateCartQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId)
    } else {
      setCart(prev => prev.map(i => 
        i.itemId === itemId ? { ...i, quantity } : i
      ))
    }
  }

  const removeFromCart = (itemId) => {
    setCart(prev => prev.filter(i => i.itemId !== itemId))
  }

  const clearCart = () => {
    setCart([])
  }

  const viewProduct = (product) => {
    setSelectedProduct(product)
    setCurrentPage('product')
  }

  const navigateToProducts = (categoryId) => {
    setSelectedCategory(categoryId)
    setCurrentPage('products')
  }

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header 
        user={user} 
        cartItemCount={cartItemCount}
        onNavigate={setCurrentPage}
        onLogout={logout}
      />
      
      <main style={{ flex: 1 }}>
        {currentPage === 'home' && (
          <HomePage 
            onViewProduct={viewProduct}
            onAddToCart={addToCart}
            onNavigateToProducts={navigateToProducts}
          />
        )}
        {currentPage === 'products' && (
          <ProductsListPage 
            selectedCategory={selectedCategory}
            onViewProduct={viewProduct}
            onAddToCart={addToCart}
            onBack={() => setCurrentPage('home')}
          />
        )}
        {currentPage === 'product' && (
          <ProductPage 
            product={selectedProduct}
            onAddToCart={addToCart}
            onBack={() => setCurrentPage('products')}
          />
        )}
        {currentPage === 'cart' && (
          <CartPage 
            cart={cart}
            onUpdateQuantity={updateCartQuantity}
            onRemove={removeFromCart}
            onCheckout={() => setCurrentPage('checkout')}
          />
        )}
        {currentPage === 'checkout' && (
          <CheckoutPage 
            cart={cart}
            user={user}
            onOrderComplete={() => {
              clearCart()
              setCurrentPage('orders')
            }}
            onBack={() => setCurrentPage('cart')}
          />
        )}
        {currentPage === 'profile' && (
          <ProfilePage user={user} />
        )}
        {currentPage === 'orders' && (
          <OrdersPage user={user} />
        )}
        {currentPage === 'login' && (
          <LoginPage 
            onLogin={login}
            onRegister={() => setCurrentPage('register')}
          />
        )}
        {currentPage === 'register' && (
          <RegisterPage 
            onRegister={login}
            onLogin={() => setCurrentPage('login')}
          />
        )}
        {currentPage === 'customer-service' && (
          <CustomerServicePage onBack={() => setCurrentPage('home')} />
        )}
        {currentPage === 'about-us' && (
          <AboutUsPage onBack={() => setCurrentPage('home')} />
        )}
      </main>
      
      <Footer onNavigate={setCurrentPage} />
    </div>
  )
}
