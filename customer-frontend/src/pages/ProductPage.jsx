import React from 'react'

export default function ProductPage({ product, onAddToCart, onBack }) {
  const [quantity, setQuantity] = React.useState(1)

  if (!product) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Product not found</div>
  }

  const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0]

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <button
        onClick={onBack}
        style={{
          padding: '8px 16px',
          backgroundColor: '#6b7280',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          marginBottom: '20px'
        }}
      >
        ← Back to Shop
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', backgroundColor: 'white', borderRadius: '12px', padding: '32px' }}>
        <div>
          <div style={{
            width: '100%',
            height: '400px',
            backgroundColor: '#f3f4f6',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px'
          }}>
            {primaryImage?.imageUrl ? (
              <img src={primaryImage.imageUrl} alt={product.itemName} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
            ) : (
              <span style={{ fontSize: '120px' }}>📦</span>
            )}
          </div>
          
          {product.images?.length > 1 && (
            <div style={{ display: 'flex', gap: '12px', overflowX: 'auto' }}>
              {product.images.map((img, idx) => (
                <div key={idx} style={{ width: '80px', height: '80px', backgroundColor: '#f3f4f6', borderRadius: '6px', flexShrink: 0, overflow: 'hidden' }}>
                  {img.imageUrl && <img src={img.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '12px' }}>{product.itemName}</h1>
          
          {product.brand && (
            <p style={{ fontSize: '18px', color: '#6b7280', marginBottom: '16px' }}>Brand: {product.brand}</p>
          )}
          
          <div style={{ fontSize: '36px', fontWeight: '700', color: '#3b82f6', marginBottom: '20px' }}>
            ₹{product.price}
          </div>

          {product.description && (
            <div style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid #e5e7eb' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>Description</h3>
              <p style={{ color: '#374151', lineHeight: '1.6' }}>{product.description}</p>
            </div>
          )}

          <div style={{ marginBottom: '24px' }}>
            <p style={{ marginBottom: '8px', fontWeight: '500' }}>SKU: {product.sku}</p>
            {product.weight && <p style={{ marginBottom: '8px', color: '#6b7280' }}>Weight: {product.weight}</p>}
            <p style={{ fontWeight: '500', color: product.itemStatus === 'ACTIVE' ? '#10b981' : '#ef4444' }}>
              Status: {product.itemStatus}
            </p>
          </div>

          {product.categories?.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <p style={{ fontWeight: '500', marginBottom: '8px' }}>Categories:</p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {product.categories.map(cat => (
                  <span key={cat.categoryId} style={{
                    padding: '4px 12px',
                    backgroundColor: '#e0e7ff',
                    color: '#3730a3',
                    borderRadius: '12px',
                    fontSize: '14px'
                  }}>
                    {cat.categoryName}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '24px' }}>
            <label style={{ fontWeight: '500' }}>Quantity:</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                style={{
                  width: '36px',
                  height: '36px',
                  backgroundColor: '#e5e7eb',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '18px',
                  fontWeight: '600'
                }}
              >
                -
              </button>
              <span style={{ fontSize: '18px', fontWeight: '600', minWidth: '30px', textAlign: 'center' }}>
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                style={{
                  width: '36px',
                  height: '36px',
                  backgroundColor: '#e5e7eb',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '18px',
                  fontWeight: '600'
                }}
              >
                +
              </button>
            </div>
          </div>

          <button
            onClick={() => {
              onAddToCart(product, quantity)
              alert(`Added ${quantity} item(s) to cart!`)
            }}
            style={{
              width: '100%',
              padding: '16px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '18px',
              fontWeight: '600'
            }}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  )
}
