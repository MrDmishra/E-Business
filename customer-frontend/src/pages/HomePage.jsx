import React, { useState, useEffect } from 'react'

export default function HomePage({ onViewProduct, onAddToCart, onNavigateToProducts }) {
  const [items, setItems] = useState([])
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [email, setEmail] = useState('')
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const fetchItems = async (categoryId = null) => {
    try {
      setLoading(true)
      const url = categoryId ? `/api/items/category/${categoryId}` : '/api/items'
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setItems(data)
      }
    } catch (err) {
      console.error('Failed to fetch items')
    } finally {
      setLoading(false)
    }
  }

  const fetchBanners = async () => {
    try {
      const res = await fetch('/api/banners/active')
      if (res.ok) {
        const data = await res.json()
        setBanners(data)
      }
    } catch (err) {
      console.error('Failed to fetch banners')
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories')
      if (res.ok) {
        const data = await res.json()
        setCategories(data)
      }
    } catch (err) {}
  }

  useEffect(() => {
    fetchCategories()
    fetchItems()
    fetchBanners()
  }, [])

  // Auto-rotate carousel every 2 seconds
  useEffect(() => {
    if (banners.length === 0) return
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % banners.length)
    }, 2000)
    
    return () => clearInterval(interval)
  }, [banners.length])

  const handleCategoryClick = (categoryId) => {
    onNavigateToProducts(categoryId)
  }

  const handleNewsletterSubmit = (e) => {
    e.preventDefault()
    alert('Thank you for subscribing!')
    setEmail('')
  }

  const popularProducts = items.slice(0, 4)
  const specialProducts = items.slice(0, 3)

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff' }}>
      {/* Hero Section */}
      <section style={{
        position: 'relative',
        minHeight: '600px',
        padding: '120px 32px 100px',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center'
      }}>
        {/* Background Image Carousel */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0
        }}>
          {banners.length > 0 && banners[currentImageIndex]?.imageUrl ? (
            <img
              key={currentImageIndex}
              src={banners[currentImageIndex].imageUrl}
              alt={banners[currentImageIndex].title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                animation: 'fadeIn 0.8s ease-in-out'
              }}
              onError={(e) => {
                console.error('Failed to load banner image:', banners[currentImageIndex].imageUrl)
                e.target.style.display = 'none'
              }}
            />
          ) : (
            <div style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, rgba(210, 193, 182, 0.3) 0%, rgba(255, 255, 255, 0.8) 100%)'
            }}></div>
          )}
        </div>
        
        {/* Content */}
        <div style={{ 
          width: '100%',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'flex-start',
          position: 'relative',
          zIndex: 2,
          padding: '0 64px'
        }}>
          <div style={{ maxWidth: '600px' }}>
            <div style={{
              background: 'rgba(27, 60, 83, 0.75)',
              backdropFilter: 'blur(8px)',
              padding: '40px',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
            }}>
              <h1 style={{ 
                fontSize: '56px', 
                fontWeight: '700', 
                marginBottom: '24px',
                color: 'white',
                lineHeight: '1.2',
                letterSpacing: '-1px'
              }}>
                {banners[currentImageIndex]?.title || 'Exclusive Deals of'}<br/>
                {banners[currentImageIndex]?.subtitle || 'Furniture Collection'}
              </h1>
              <p style={{ 
                fontSize: '18px', 
                color: 'rgba(255, 255, 255, 0.95)',
                marginBottom: '32px',
                lineHeight: '1.6',
                maxWidth: '500px'
              }}>
                {banners[currentImageIndex]?.description || 'Explore different categories. Find the best deals. Your dream furniture awaits.'}
              </p>
              <button
                style={{
                  padding: '16px 40px',
                  background: 'white',
                  color: 'rgb(27, 60, 83)',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px) scale(1.05)'
                  e.target.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.4)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0) scale(1)'
                  e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)'
                }}
                onClick={() => {
                  const link = banners[currentImageIndex]?.buttonLink || 'products'
                  if (link.startsWith('http')) {
                    window.open(link, '_blank')
                  } else {
                    document.getElementById(link)?.scrollIntoView({ behavior: 'smooth' })
                  }
                }}
              >
                {banners[currentImageIndex]?.buttonText || 'Shop Now'} →
              </button>
            </div>
          </div>
        </div>

        {/* Counter Badge & Dots - Bottom Right */}
        {banners.length > 0 && (
          <div style={{
            position: 'absolute',
            bottom: '32px',
            right: '32px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            zIndex: 3
          }}>
            {/* Counter Badge */}
            <div style={{
              background: 'rgba(27, 60, 83, 0.85)',
              backdropFilter: 'blur(10px)',
              padding: '12px 24px',
              borderRadius: '30px',
              fontSize: '16px',
              fontWeight: '600',
              color: 'white',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)'
            }}>
              {currentImageIndex + 1} / {banners.length}
            </div>

            {/* Dots Indicator */}
            <div style={{ display: 'flex', gap: '12px' }}>
              {banners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  style={{
                    width: index === currentImageIndex ? '40px' : '12px',
                    height: '12px',
                    borderRadius: '6px',
                    border: 'none',
                    background: index === currentImageIndex 
                      ? 'white' 
                      : 'rgba(255, 255, 255, 0.4)',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    boxShadow: index === currentImageIndex 
                      ? '0 2px 8px rgba(255, 255, 255, 0.4)' 
                      : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (index !== currentImageIndex) {
                      e.target.style.background = 'rgba(255, 255, 255, 0.7)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (index !== currentImageIndex) {
                      e.target.style.background = 'rgba(255, 255, 255, 0.4)'
                    }
                  }}
                />
              ))}
            </div>
          </div>
        )}

        <style>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: scale(1.1);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
        `}</style>
      </section>

      {/* Explore by Category */}
      <section style={{ padding: '80px 32px', background: '#f9fafb' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <h2 style={{ 
            fontSize: '36px', 
            fontWeight: '700', 
            textAlign: 'center',
            marginBottom: '48px',
            color: 'rgb(27, 60, 83)'
          }}>
            Explore by Category
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
            <button
              onClick={() => handleCategoryClick(null)}
              style={{
                padding: '60px 24px',
                background: selectedCategory === null ? 'rgb(69, 104, 130)' : '#e5e7eb',
                color: selectedCategory === null ? 'white' : '#4b5563',
                border: 'none',
                borderRadius: '16px',
                fontSize: '20px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'translateY(-4px)'}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
              🌟 All Products
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                style={{
                  padding: '60px 24px',
                  background: selectedCategory === cat.id ? 'rgb(69, 104, 130)' : '#e5e7eb',
                  color: selectedCategory === cat.id ? 'white' : '#4b5563',
                  border: 'none',
                  borderRadius: '16px',
                  fontSize: '20px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'translateY(-4px)'}
                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
              >
                {cat.categoryName}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Products */}
      <section id="products" style={{ padding: '80px 32px', background: '#ffffff' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <h2 style={{ 
            fontSize: '36px', 
            fontWeight: '700', 
            textAlign: 'center',
            marginBottom: '48px',
            color: 'rgb(27, 60, 83)'
          }}>
            Popular Products
          </h2>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px' }}>
              <div style={{
                width: '60px',
                height: '60px',
                border: '4px solid #f3f4f6',
                borderTop: '4px solid rgb(69, 104, 130)',
                borderRadius: '50%',
                margin: '0 auto 20px',
                animation: 'spin 1s linear infinite'
              }}></div>
              <p style={{ color: '#6b7280', fontSize: '18px' }}>Loading products...</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '32px'
            }}>
              {popularProducts.map(item => (
                <div
                  key={item.itemId}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    transition: 'all 0.3s',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)'
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'
                  }}
                >
                  <div
                    onClick={() => onViewProduct(item)}
                    style={{
                      height: '240px',
                      background: 'linear-gradient(135deg, rgba(210, 193, 182, 0.2) 0%, rgba(69, 104, 130, 0.1) 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden'
                    }}
                  >
                    {item.images?.[0]?.imageUrl ? (
                      <img
                        src={item.images[0].imageUrl}
                        alt={item.itemName}
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'cover'
                        }}
                      />
                    ) : (
                      <span style={{ fontSize: '80px' }}>🪑</span>
                    )}
                  </div>
                  
                  <div style={{ padding: '20px', textAlign: 'center' }}>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      marginBottom: '8px',
                      color: '#1f2937'
                    }}>
                      {item.itemName}
                    </h3>
                    <p style={{ 
                      fontSize: '22px', 
                      fontWeight: '700', 
                      color: 'rgb(27, 60, 83)',
                      marginBottom: '16px'
                    }}>
                      ₹{item.price}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onAddToCart(item)
                        alert('Added to cart!')
                      }}
                      style={{
                        padding: '10px 24px',
                        background: 'rgb(69, 104, 130)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s'
                      }}
                      onMouseEnter={(e) => e.target.style.background = 'rgb(35, 76, 106)'}
                      onMouseLeave={(e) => e.target.style.background = 'rgb(69, 104, 130)'}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div style={{ textAlign: 'center', marginTop: '48px' }}>
            <button
              onClick={() => onNavigateToProducts(null)}
              style={{
                padding: '14px 32px',
                background: 'transparent',
                color: 'rgb(69, 104, 130)',
                border: '2px solid rgb(69, 104, 130)',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgb(69, 104, 130)'
                e.target.style.color = 'white'
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent'
                e.target.style.color = 'rgb(69, 104, 130)'
              }}
            >
              Browse All Items
            </button>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section style={{ padding: '80px 32px', background: 'rgba(210, 193, 182, 0.1)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <h2 style={{ 
            fontSize: '36px', 
            fontWeight: '700', 
            textAlign: 'center',
            marginBottom: '48px',
            color: 'rgb(27, 60, 83)'
          }}>
            Benefits for your expediency
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '32px' }}>
            <div style={{ textAlign: 'center', padding: '32px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>💳</div>
              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px', color: '#1f2937' }}>
                Payment Method
              </h3>
              <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.6' }}>
                We offer flexible payment methods to make your purchase easy and convenient.
              </p>
            </div>
            <div style={{ textAlign: 'center', padding: '32px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔄</div>
              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px', color: '#1f2937' }}>
                Return policy
              </h3>
              <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.6' }}>
                You can return products within 30 days of purchase. No questions asked.
              </p>
            </div>
            <div style={{ textAlign: 'center', padding: '32px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎧</div>
              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px', color: '#1f2937' }}>
                Customer Support
              </h3>
              <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.6' }}>
                Our support team is available 24/7 to assist you with any inquiries.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: '80px 32px', background: '#ffffff' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <h2 style={{ 
            fontSize: '36px', 
            fontWeight: '700', 
            textAlign: 'center',
            marginBottom: '8px',
            color: 'rgb(27, 60, 83)'
          }}>
            Testimonials
          </h2>
          <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '48px', fontSize: '16px' }}>
            Over 15,000 happy customers
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
            <div style={{
              background: '#f9fafb',
              padding: '32px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
            }}>
              <p style={{ fontSize: '15px', color: '#4b5563', marginBottom: '16px', lineHeight: '1.6' }}>
                "My experience with E-Business is a complete success story. From customer service, wide range of products, clean store, purchasing experience, the newsletter. Thank you."
              </p>
              <p style={{ fontSize: '14px', fontWeight: '600', color: 'rgb(27, 60, 83)' }}>
                — Laura Paul
              </p>
            </div>
            <div style={{
              background: '#f9fafb',
              padding: '32px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
            }}>
              <p style={{ fontSize: '15px', color: '#4b5563', marginBottom: '16px', lineHeight: '1.6' }}>
                "Amazing quality and fast delivery! The furniture pieces are exactly as described. Highly recommend this store to everyone."
              </p>
              <p style={{ fontSize: '14px', fontWeight: '600', color: 'rgb(27, 60, 83)' }}>
                — John Smith
              </p>
            </div>
            <div style={{
              background: '#f9fafb',
              padding: '32px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
            }}>
              <p style={{ fontSize: '15px', color: '#4b5563', marginBottom: '16px', lineHeight: '1.6' }}>
                "Best shopping experience ever! The customer support team helped me choose the perfect furniture for my home. Love it!"
              </p>
              <p style={{ fontSize: '14px', fontWeight: '600', color: 'rgb(27, 60, 83)' }}>
                — Sarah Johnson
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section style={{ padding: '80px 32px', background: 'rgba(210, 193, 182, 0.2)' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ 
            fontSize: '36px', 
            fontWeight: '700', 
            marginBottom: '16px',
            color: 'rgb(27, 60, 83)'
          }}>
            Join Our Newsletter
          </h2>
          <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '32px' }}>
            Signup for our weekly newsletter to get the latest news, updates and amazing offers
          </p>
          <form onSubmit={handleNewsletterSubmit} style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              style={{
                flex: '1 1 300px',
                maxWidth: '400px',
                padding: '14px 20px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none',
                transition: 'border 0.3s'
              }}
              onFocus={(e) => e.target.style.borderColor = 'rgb(69, 104, 130)'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
            <button
              type="submit"
              style={{
                padding: '14px 32px',
                background: 'rgb(69, 104, 130)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => e.target.style.background = 'rgb(35, 76, 106)'}
              onMouseLeave={(e) => e.target.style.background = 'rgb(69, 104, 130)'}
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  )
}
