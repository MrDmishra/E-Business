import React, { useState, useEffect } from 'react'

export default function ItemManagement() {
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [formData, setFormData] = useState({
    itemName: '',
    description: '',
    price: '',
    sku: '',
    brand: '',
    weight: '',
    itemStatus: 'ACTIVE',
    images: [{ imageUrl: '', isPrimary: true }],
    categoryIds: []
  })

  useEffect(() => {
    fetchItems()
    fetchCategories()
  }, [])

  const fetchItems = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/items')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setItems(data || [])
      setError(null)
    } catch (err) {
      setError(err.message || 'Failed to fetch items')
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories')
      if (res.ok) {
        const data = await res.json()
        setCategories(data || [])
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleImageChange = (index, field, value) => {
    const newImages = [...formData.images]
    newImages[index] = { ...newImages[index], [field]: value }
    setFormData(prev => ({ ...prev, images: newImages }))
  }

  const addImageField = () => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, { imageUrl: '', isPrimary: false }]
    }))
  }

  const removeImageField = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const handleCategoryToggle = (categoryId) => {
    setFormData(prev => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(categoryId)
        ? prev.categoryIds.filter(id => id !== categoryId)
        : [...prev.categoryIds, categoryId]
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.itemName.trim()) {
      alert('Item name is required')
      return
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      alert('Valid price is required')
      return
    }

    // Filter out empty image URLs
    const validImages = formData.images.filter(img => img.imageUrl.trim())
    
    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      weight: formData.weight ? parseFloat(formData.weight) : null,
      images: validImages.map(img => ({
        imageUrl: img.imageUrl,
        isPrimary: img.isPrimary || false
      }))
    }

    try {
      let res
      if (editingId) {
        res = await fetch(`/api/items/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
      } else {
        res = await fetch('/api/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
      }

      if (!res.ok) {
        if (res.status === 400) {
          throw new Error('SKU already exists')
        }
        throw new Error(`HTTP ${res.status}`)
      }
      
      await fetchItems()
      resetForm()
      setShowModal(false)
    } catch (err) {
      alert(`Error: ${err.message}`)
    }
  }

  const handleEdit = (item) => {
    setFormData({
      itemName: item.itemName || '',
      description: item.description || '',
      price: item.price || '',
      sku: item.sku || '',
      brand: item.brand || '',
      weight: item.weight || '',
      itemStatus: item.itemStatus || 'ACTIVE',
      images: item.images && item.images.length > 0 
        ? item.images.map(img => ({ imageUrl: img.imageUrl, isPrimary: img.isPrimary }))
        : [{ imageUrl: '', isPrimary: true }],
      categoryIds: item.categoryIds || []
    })
    setEditingId(item.itemId)
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      const res = await fetch(`/api/items/${id}`, {
        method: 'DELETE'
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      await fetchItems()
    } catch (err) {
      alert(`Error: ${err.message}`)
    }
  }

  const resetForm = () => {
    setFormData({
      itemName: '',
      description: '',
      price: '',
      sku: '',
      brand: '',
      weight: '',
      itemStatus: 'ACTIVE',
      images: [{ imageUrl: '', isPrimary: true }],
      categoryIds: []
    })
    setEditingId(null)
    setShowModal(false)
  }

  const filteredItems = items.filter(item =>
    item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentItems = filteredItems.slice(startIndex, endIndex)

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-message">Loading items…</div>
      </div>
    )
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'ACTIVE': return 'in-stock'
      case 'OUT_OF_STOCK': return 'out-of-stock'
      case 'DRAFT': return 'pending'
      case 'DISCONTINUED': return 'limited-stock'
      default: return 'pending'
    }
  }

  const getPrimaryImage = (images) => {
    if (!images || images.length === 0) return null
    const primary = images.find(img => img.isPrimary)
    return primary ? primary.imageUrl : images[0].imageUrl
  }

  const getCategoryNames = (item) => {
    // Use categories array if available (with names from backend)
    if (item.categories && item.categories.length > 0) {
      return item.categories.map(cat => cat.categoryName).join(', ')
    }
    // Fallback to categoryIds lookup
    if (!item.categoryIds || item.categoryIds.length === 0) return '—'
    return item.categoryIds
      .map(id => {
        const cat = categories.find(c => c.categoryId === id)
        return cat ? cat.categoryName : `ID:${id}`
      })
      .join(', ')
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Item Management</h1>
        <button 
          className="btn btn-primary"
          onClick={() => {
            resetForm()
            setShowModal(true)
          }}
        >
          + New Item
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showModal && (
        <div className="modal-overlay" onClick={() => resetForm()}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
            <div className="modal-header">
              <h2>{editingId ? 'Edit Item' : 'Add New Item'}</h2>
              <button className="modal-close" onClick={() => resetForm()} title="Close">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="product-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Item Name *</label>
                  <input
                    type="text"
                    name="itemName"
                    value={formData.itemName}
                    onChange={handleInputChange}
                    placeholder="Enter item name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Price *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="Enter price"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>SKU</label>
                  <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleInputChange}
                    placeholder="Enter SKU (unique)"
                  />
                </div>
                <div className="form-group">
                  <label>Brand</label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    placeholder="Enter brand"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Weight (kg)</label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    placeholder="Enter weight"
                    step="0.01"
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    name="itemStatus"
                    value={formData.itemStatus}
                    onChange={handleInputChange}
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="OUT_OF_STOCK">Out of Stock</option>
                    <option value="DRAFT">Draft</option>
                    <option value="DISCONTINUED">Discontinued</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter item description"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Images</label>
                {formData.images.map((image, index) => (
                  <div key={index} className="form-row" style={{ alignItems: 'center', marginBottom: '8px' }}>
                    <input
                      type="text"
                      value={image.imageUrl}
                      onChange={(e) => handleImageChange(index, 'imageUrl', e.target.value)}
                      placeholder="Image URL"
                      style={{ flex: 1 }}
                    />
                    <label style={{ margin: '0 10px', display: 'flex', alignItems: 'center' }}>
                      <input
                        type="checkbox"
                        checked={image.isPrimary}
                        onChange={(e) => handleImageChange(index, 'isPrimary', e.target.checked)}
                        style={{ marginRight: '5px' }}
                      />
                      Primary
                    </label>
                    {formData.images.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeImageField(index)}
                        className="btn btn-secondary"
                        style={{ padding: '5px 10px' }}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={addImageField} className="btn btn-secondary" style={{ marginTop: '8px' }}>
                  + Add Image
                </button>
              </div>

              <div className="form-group">
                <label>Categories</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {categories.map(cat => (
                    <label key={cat.id} style={{ display: 'flex', alignItems: 'center' }}>
                      <input
                        type="checkbox"
                        checked={formData.categoryIds.includes(cat.id)}
                        onChange={() => handleCategoryToggle(cat.id)}
                        style={{ marginRight: '5px' }}
                      />
                      {cat.categoryName}
                    </label>
                  ))}
                </div>
              </div>

              <div className="modal-footer">
                <button type="submit" className="btn btn-success">
                  {editingId ? 'Update Item' : 'Create Item'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => resetForm()}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="table-container">
        <div className="table-header">
          <h2>Items ({filteredItems.length})</h2>
          <div className="search-container-inline">
            <input
              type="text"
              placeholder="🔍 Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input-inline"
            />
            {searchTerm && (
              <button
                className="clear-search-inline"
                onClick={() => setSearchTerm('')}
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <div className="empty-state">
            <p>{searchTerm ? 'No items match your search.' : 'No items yet. Create your first item!'}</p>
          </div>
        ) : (
          <>
            <table className="products-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Image</th>
                  <th>Item Name</th>
                  <th>SKU</th>
                  <th>Brand</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Categories</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map(item => (
                  <tr key={item.itemId} className="product-row">
                    <td>{item.itemId}</td>
                    <td>
                      {getPrimaryImage(item.images) ? (
                        <img 
                          src={getPrimaryImage(item.images)} 
                          alt={item.itemName}
                          style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                          onError={(e) => { e.target.style.display = 'none' }}
                        />
                      ) : (
                        <div style={{ width: '50px', height: '50px', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', fontSize: '20px' }}>📷</div>
                      )}
                    </td>
                    <td className="product-name">{item.itemName}</td>
                    <td>{item.sku || '—'}</td>
                    <td>{item.brand || '—'}</td>
                    <td className="product-price">₹{parseFloat(item.price).toFixed(2)}</td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(item.itemStatus)}`}>
                        {item.itemStatus}
                      </span>
                    </td>
                    <td>{getCategoryNames(item)}</td>
                    <td className="product-actions">
                      <button
                        className="btn-icon btn-edit"
                        onClick={() => handleEdit(item)}
                        title="Edit"
                      >
                        ✎
                      </button>
                      <button
                        className="btn-icon btn-delete"
                        onClick={() => handleDelete(item.itemId)}
                        title="Delete"
                      >
                        🗑
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="pagination-btn"
                >
                  ‹ Previous
                </button>
                <span className="pagination-info">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="pagination-btn"
                >
                  Next ›
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
