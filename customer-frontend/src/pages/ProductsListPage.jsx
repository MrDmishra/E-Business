import React, { useState, useEffect } from 'react'

export default function ProductsListPage({ selectedCategory, onViewProduct, onAddToCart, onBack }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState([])
  const [activeCategory, setActiveCategory] = useState(selectedCategory)

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

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories')
      if (res.ok) {
        const data = await res.json()
        setCategories(data)
      }
    } catch (err) {
      console.error('Failed to fetch categories')
    }
  }

  useEffect(() => {
    fetchCategories()
    fetchItems(selectedCategory)
  }, [selectedCategory])

  const handleCategoryClick = (categoryId) => {
    setActiveCategory(categoryId)
    fetchItems(categoryId)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff' }}>
      {/* Header Section */}
      <section style={{
        background: 'linear-gradient(135deg, rgb(27, 60, 83) 0%, rgb(69, 104, 130) 100%)',
        padding: '120px 32px 60px',
        color: 'white'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <button
            onClick={onBack}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              padding: '10px 24px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              marginBottom: '32px',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.3)'
              e.target.style.transform = 'translateX(-4px)'
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.2)'
              e.target.style.transform = 'translateX(0)'
            }}
          >
            ← Back to Home
          </button>
          <h1 style={{
            fontSize: '48px',
            fontWeight: '700',
            marginBottom: '16px',
            letterSpacing: '-1px'
          }}>
            Our Products
          </h1>
          <p style={{
            fontSize: '18px',
            opacity: 0.9,
            maxWidth: '600px'
          }}>
            {activeCategory 
              ? `Browse ${categories.find(c => c.id === activeCategory)?.categoryName || 'Selected Category'}` 
              : 'Browse all our furniture collections'}
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section style={{ padding: '40px 32px', background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: '20px',
            color: '#374151'
          }}>
            Filter by Category
          </h3>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={() => handleCategoryClick(null)}
              style={{
                padding: '12px 24px',
                background: activeCategory === null ? 'rgb(69, 104, 130)' : 'white',
                color: activeCategory === null ? 'white' : '#4b5563',
                border: activeCategory === null ? 'none' : '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}
              onMouseEnter={(e) => {
                if (activeCategory !== null) {
                  e.target.style.borderColor = 'rgb(69, 104, 130)'
                  e.target.style.color = 'rgb(69, 104, 130)'
                }
              }}
              onMouseLeave={(e) => {
                if (activeCategory !== null) {
                  e.target.style.borderColor = '#e5e7eb'
                  e.target.style.color = '#4b5563'
                }
              }}
            >
              All Products
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                style={{
                  padding: '12px 24px',
                  background: activeCategory === cat.id ? 'rgb(69, 104, 130)' : 'white',
                  color: activeCategory === cat.id ? 'white' : '#4b5563',
                  border: activeCategory === cat.id ? 'none' : '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}
                onMouseEnter={(e) => {
                  if (activeCategory !== cat.id) {
                    e.target.style.borderColor = 'rgb(69, 104, 130)'
                    e.target.style.color = 'rgb(69, 104, 130)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeCategory !== cat.id) {
                    e.target.style.borderColor = '#e5e7eb'
                    e.target.style.color = '#4b5563'
                  }
                }}
              >
                {cat.categoryName}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section style={{ padding: '60px 32px', background: '#ffffff' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px 20px' }}>
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
          ) : items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 20px' }}>
              <div style={{ fontSize: '64px', marginBottom: '20px' }}>📦</div>
              <h3 style={{ fontSize: '24px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>
                No products found
              </h3>
              <p style={{ fontSize: '16px', color: '#6b7280' }}>
                Try selecting a different category
              </p>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ color: '#6b7280', fontSize: '16px' }}>
                  Showing {items.length} {items.length === 1 ? 'product' : 'products'}
                </p>
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '32px'
              }}>
                {items.map(item => (
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
                        height: '280px',
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

                    <div style={{ padding: '24px' }}>
                      <h3 style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        marginBottom: '8px',
                        color: '#1f2937',
                        minHeight: '48px'
                      }}>
                        {item.itemName}
                      </h3>
                      {item.description && (
                        <p style={{
                          fontSize: '14px',
                          color: '#6b7280',
                          marginBottom: '12px',
                          lineHeight: '1.5',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical'
                        }}>
                          {item.description}
                        </p>
                      )}
                      <p style={{
                        fontSize: '24px',
                        fontWeight: '700',
                        color: 'rgb(27, 60, 83)',
                        marginBottom: '16px'
                      }}>
                        ₹{item.price}
                      </p>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onViewProduct(item)
                          }}
                          style={{
                            flex: 1,
                            padding: '12px 20px',
                            background: 'transparent',
                            color: 'rgb(69, 104, 130)',
                            border: '2px solid rgb(69, 104, 130)',
                            borderRadius: '8px',
                            fontSize: '14px',
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
                          View Details
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onAddToCart(item)
                            alert('Added to cart!')
                          }}
                          style={{
                            flex: 1,
                            padding: '12px 20px',
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
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
