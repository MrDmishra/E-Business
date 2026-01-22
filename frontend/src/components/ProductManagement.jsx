import React, { useState, useEffect } from 'react'
import { useAlert } from '../context/AlertContext'

export default function ProductManagement() {
  const alert = useAlert()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    rating: '',
    status: 'In Stock',
    customer: '',
    time: 'Just now'
  })

  // Fetch products on mount
  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/products')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setProducts(data || [])
      setError(null)
    } catch (err) {
      setError(err.message || 'Failed to fetch products')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      alert.warning('Missing Field', 'Product name is required')
      return
    }

    // Check for duplicate product name (excluding current editing product)
    const isDuplicate = products.some(p => 
      p.name.toLowerCase().trim() === formData.name.toLowerCase().trim() && 
      p.id !== editingId
    )
    
    if (isDuplicate) {
      alert.warning('Duplicate Name', 'A product with this name already exists. Please choose a different name.')
      return
    }

    const payload = {
      ...formData,
      price: formData.price ? parseFloat(formData.price) : null
    }

    try {
      let res
      if (editingId) {
        // Update existing product
        res = await fetch(`/api/products/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
      } else {
        // Create new product
        res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
      }

      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      
      await fetchProducts()
      resetForm()
      setShowModal(false)
      
      alert.success(
        editingId ? 'Product Updated' : 'Product Created',
        editingId ? 'Product updated successfully' : 'New product created successfully'
      )
    } catch (err) {
      alert.error('Operation Failed', `Error: ${err.message}`)
    }
  }

  const handleEdit = (product) => {
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      imageUrl: product.imageUrl || '',
      rating: product.rating || '',
      status: product.status || 'In Stock',
      customer: product.customer || '',
      time: product.time || 'Just now'
    })
    setEditingId(product.id)
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE'
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      await fetchProducts()
      
      alert.success('Product Deleted', 'Product removed successfully')
    } catch (err) {
      alert.error('Delete Failed', `Error: ${err.message}`)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      imageUrl: '',
      rating: '',
      status: 'In Stock',
      customer: '',
      time: 'Just now'
    })
    setEditingId(null)
    setShowModal(false)
  }

  // Filter products based on search term
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.customer?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentProducts = filteredProducts.slice(startIndex, endIndex)

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-message">Loading products…</div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Product Management</h1>
        <button 
          className="btn btn-primary"
          onClick={() => {
            resetForm()
            setShowModal(true)
          }}
        >
          + New Product
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Product Modal Popup */}
      {showModal && (
        <div className="modal-overlay" onClick={() => resetForm()}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingId ? 'Edit Product' : 'Add New Product'}</h2>
              <button
                className="modal-close"
                onClick={() => resetForm()}
                title="Close"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="product-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Product Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter product name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Price</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="Enter price"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option>In Stock</option>
                    <option>Out of Stock</option>
                    <option>Limited Stock</option>
                    <option>Approved</option>
                    <option>Pending</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Rating</label>
                  <input
                    type="text"
                    name="rating"
                    value={formData.rating}
                    onChange={handleInputChange}
                    placeholder="e.g., ★★★★★"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter product description"
                  rows="4"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Image URL</label>
                  <input
                    type="text"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleInputChange}
                    placeholder="Enter image URL"
                  />
                </div>
                <div className="form-group">
                  <label>Customer Name</label>
                  <input
                    type="text"
                    name="customer"
                    value={formData.customer}
                    onChange={handleInputChange}
                    placeholder="Enter customer name"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Time Label</label>
                  <input
                    type="text"
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    placeholder="e.g., Just now, 5m ago"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="submit" className="btn btn-success">
                  {editingId ? 'Update Product' : 'Create Product'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => resetForm()}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="table-container">
        <div className="table-header">
          <h2>Products ({filteredProducts.length})</h2>
          <div className="search-container-inline">
            <input
              type="text"
              placeholder="🔍 Search products..."
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

        {filteredProducts.length === 0 ? (
          <div className="empty-state">
            <p>{searchTerm ? 'No products match your search.' : 'No products yet. Create your first product!'}</p>
          </div>
        ) : (
          <>
            <table className="products-table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Description</th>
                  <th>Price</th>
                  <th>Rating</th>
                  <th>Status</th>
                  <th>Customer</th>
                  <th>Time</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentProducts.map(product => (
                  <tr key={product.id} className="product-row">
                    <td className="product-name">{product.name}</td>
                    <td className="product-description">{product.description || '—'}</td>
                    <td className="product-price">
                      {product.price ? `₹${parseFloat(product.price).toFixed(2)}` : '—'}
                    </td>
                    <td className="product-rating">{product.rating || '—'}</td>
                    <td>
                      <span className={`badge ${(product.status || 'pending').toLowerCase().replace(' ', '-')}`}>
                        {product.status || 'Pending'}
                      </span>
                    </td>
                    <td className="product-customer">{product.customer || '—'}</td>
                    <td className="product-time">{product.time || '—'}</td>
                    <td className="product-actions">
                      <button
                        className="btn-icon btn-edit"
                        onClick={() => handleEdit(product)}
                        title="Edit"
                      >
                        ✎
                      </button>
                      <button
                        className="btn-icon btn-delete"
                        onClick={() => handleDelete(product.id)}
                        title="Delete"
                      >
                        🗑
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="pagination-btn"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  ‹ Previous
                </button>
                
                <div className="pagination-info">
                  <span>Page {currentPage} of {totalPages}</span>
                  <span className="pagination-range">
                    Showing {startIndex + 1}-{Math.min(endIndex, filteredProducts.length)} of {filteredProducts.length}
                  </span>
                </div>
                
                <button
                  className="pagination-btn"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next ›
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        .page-container {
          padding: 24px;
          background: #f5f5f5;
          min-height: 100vh;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          background: white;
          padding: 16px 24px;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .page-header h1 {
          margin: 0;
          font-size: 24px;
          color: #333;
        }

        .table-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          gap: 16px;
        }

        .table-header h2 {
          margin: 0;
          font-size: 20px;
          color: #333;
        }

        .search-container-inline {
          position: relative;
          flex: 0 1 300px;
        }

        .search-input-inline {
          width: 100%;
          padding: 8px 32px 8px 12px;
          border: 2px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
          transition: border-color 0.2s;
        }

        .search-input-inline:focus {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 3px rgba(0,123,255,0.1);
        }

        .clear-search-inline {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          font-size: 16px;
          cursor: pointer;
          color: #999;
          padding: 4px 6px;
          transition: color 0.2s;
        }

        .clear-search-inline:hover {
          color: #333;
        }

        .pagination {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #eee;
        }

        .pagination-btn {
          padding: 8px 16px;
          border: 1px solid #ddd;
          border-radius: 6px;
          background: white;
          color: #333;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
        }

        .pagination-btn:hover:not(:disabled) {
          background: #007bff;
          color: white;
          border-color: #007bff;
        }

        .pagination-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .pagination-info {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .pagination-info span {
          font-size: 14px;
          color: #333;
        }

        .pagination-range {
          font-size: 12px;
          color: #666;
        }

        .search-container {
          position: relative;
          margin-bottom: 24px;
          background: white;
          padding: 16px 24px;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .search-input {
          width: 100%;
          padding: 12px 40px 12px 16px;
          border: 2px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
          transition: border-color 0.2s;
        }

        .search-input:focus {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 3px rgba(0,123,255,0.1);
        }

        .clear-search {
          position: absolute;
          right: 32px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
          color: #999;
          padding: 4px 8px;
          transition: color 0.2s;
        }

        .clear-search:hover {
          color: #333;
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.2s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .modal-content {
          background: white;
          border-radius: 8px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.2);
          max-width: 600px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px;
          border-bottom: 1px solid #eee;
          position: sticky;
          top: 0;
          background: white;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 20px;
          color: #333;
        }

        .modal-close {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #999;
          padding: 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s;
        }

        .modal-close:hover {
          color: #333;
        }

        .modal-footer {
          display: flex;
          gap: 12px;
          padding: 20px;
          border-top: 1px solid #eee;
          background: #f5f5f5;
        }

        .modal-footer .btn {
          flex: 1;
          padding: 12px 16px;
        }

        .btn {
          padding: 10px 16px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }

        .btn-primary {
          background: #007bff;
          color: white;
        }

        .btn-primary:hover {
          background: #0056b3;
        }

        .btn-success {
          background: #28a745;
          color: white;
        }

        .btn-success:hover {
          background: #218838;
        }

        .btn-secondary {
          background: #6c757d;
          color: white;
        }

        .btn-secondary:hover {
          background: #5a6268;
        }

        .error-message {
          background: #f8d7da;
          color: #721c24;
          padding: 12px 16px;
          border-radius: 6px;
          margin-bottom: 16px;
          border-left: 4px solid #721c24;
        }

        .product-form {
          display: flex;
          flex-direction: column;
          padding: 24px;
          gap: 16px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group label {
          margin-bottom: 6px;
          font-weight: 500;
          color: #333;
          font-size: 14px;
        }

        .form-group input,
        .form-group textarea,
        .form-group select {
          padding: 10px 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-family: inherit;
          font-size: 14px;
        }

        .form-group input:focus,
        .form-group textarea:focus,
        .form-group select:focus {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 3px rgba(0,123,255,0.1);
        }

        .form-group textarea {
          resize: vertical;
        }

        .table-container {
          background: white;
          padding: 24px;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          overflow-x: auto;
        }

        .products-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
        }

        .products-table thead {
          background: #f5f5f5;
          border-bottom: 2px solid #ddd;
        }

        .products-table th {
          padding: 12px;
          text-align: left;
          font-weight: 600;
          color: #333;
        }

        .products-table td {
          padding: 12px;
          border-bottom: 1px solid #eee;
        }

        .product-row:hover {
          background: #f9f9f9;
        }

        .product-name {
          font-weight: 600;
          color: #333;
          max-width: 150px;
          word-break: break-word;
        }

        .product-description {
          color: #666;
          max-width: 200px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .product-price {
          font-weight: 600;
          color: #007bff;
        }

        .product-rating,
        .product-customer,
        .product-time {
          color: #666;
        }

        .badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
          text-align: center;
        }

        .badge.in-stock,
        .badge.approved {
          background: #d4edda;
          color: #155724;
        }

        .badge.out-of-stock {
          background: #f8d7da;
          color: #721c24;
        }

        .badge.limited-stock,
        .badge.pending {
          background: #fff3cd;
          color: #856404;
        }

        .product-actions {
          display: flex;
          gap: 8px;
        }

        .btn-icon {
          width: 32px;
          height: 32px;
          padding: 0;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .btn-edit {
          background: #e7f3ff;
          color: #007bff;
        }

        .btn-edit:hover {
          background: #007bff;
          color: white;
        }

        .btn-delete {
          background: #ffe7e7;
          color: #dc3545;
        }

        .btn-delete:hover {
          background: #dc3545;
          color: white;
        }

        .empty-state {
          text-align: center;
          padding: 40px;
          color: #999;
        }

        .loading-message {
          text-align: center;
          padding: 40px;
          font-size: 16px;
          color: #666;
        }

        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }

          .page-header {
            flex-direction: column;
            gap: 12px;
            align-items: flex-start;
          }

          .table-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .search-container-inline {
            flex: 1;
            width: 100%;
          }

          .modal-content {
            width: 95%;
          }

          .products-table {
            font-size: 12px;
          }

          .products-table th,
          .products-table td {
            padding: 8px;
          }

          .pagination {
            flex-direction: column;
            gap: 12px;
          }

          .pagination-btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  )
}
