import React, { useState, useEffect } from 'react'
import { useAlert } from '../context/AlertContext'
import './CategoryManagement.css'

export default function CategoryManagement() {
  const alert = useAlert()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [formData, setFormData] = useState({
    categoryName: '',
    description: '',
    parentId: null
  })

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/categories')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setCategories(data || [])
      setError(null)
    } catch (err) {
      setError(err.message || 'Failed to fetch categories')
      setCategories([])
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
    
    if (!formData.categoryName.trim()) {
      alert.warning('Missing Field', 'Category name is required')
      return
    }

    // Check for duplicate category name (excluding current editing category)
    const isDuplicate = categories.some(c => 
      c.categoryName.toLowerCase().trim() === formData.categoryName.toLowerCase().trim() && 
      c.id !== editingId
    )
    
    if (isDuplicate) {
      alert.warning('Duplicate Name', 'A category with this name already exists. Please choose a different name.')
      return
    }

    const payload = {
      ...formData,
      parentId: formData.parentId || null
    }

    try {
      let res
      if (editingId) {
        // Update existing category
        res = await fetch(`/api/categories/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
      } else {
        // Create new category
        res = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
      }

      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      
      await fetchCategories()
      resetForm()
      setShowModal(false)
      
      // Show success alert
      alert.success(
        editingId ? 'Category Updated' : 'Category Created',
        editingId ? 'Category updated successfully' : 'New category created successfully'
      )
    } catch (err) {
      alert.error('Operation Failed', `Error: ${err.message}`)
    }
  }

  const handleEdit = (category) => {
    setFormData({
      categoryName: category.categoryName || '',
      description: category.description || '',
      parentId: category.parentId || null
    })
    setEditingId(category.id)
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this category?')) return

    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'DELETE'
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      await fetchCategories()
      
      // Show success alert
      alert.success('Category Deleted', 'Category removed successfully')
    } catch (err) {
      alert.error('Delete Failed', `Error: ${err.message}`)
    }
  }

  const resetForm = () => {
    setFormData({
      categoryName: '',
      description: '',
      parentId: null
    })
    setEditingId(null)
    setShowModal(false)
  }

  // Filter categories based on search term
  const filteredCategories = categories.filter(category =>
    category.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Pagination logic
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentCategories = filteredCategories.slice(startIndex, endIndex)

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-message">Loading categories…</div>
      </div>
    )
  }

  return (
    <div className="page-container">
      {error && <div className="error-message">{error}</div>}

      {/* Category Modal Popup */}
      {showModal && (
        <div className="modal-overlay" onClick={() => resetForm()}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingId ? 'Edit Category' : 'Add New Category'}</h2>
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
                  <label>Category Name *</label>
                  <input
                    type="text"
                    name="categoryName"
                    value={formData.categoryName}
                    onChange={handleInputChange}
                    placeholder="Enter category name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Parent ID</label>
                  <input
                    type="number"
                    name="parentId"
                    value={formData.parentId || ''}
                    onChange={handleInputChange}
                    placeholder="Leave empty for root category"
                    min="1"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter category description"
                  rows="4"
                />
              </div>

              <div className="modal-footer">
                <button type="submit" className="btn btn-success">
                  {editingId ? 'Update Category' : 'Create Category'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => resetForm()}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Categories Table */}
      <div className="table-container">
        <div className="table-header">
          <h2>Categories ({filteredCategories.length})</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="search-container-inline">
              <input
                type="text"
                placeholder="🔍 Search categories..."
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
            <button 
              className="btn btn-primary"
              onClick={() => {
                resetForm()
                setShowModal(true)
              }}
              style={{ whiteSpace: 'nowrap' }}
            >
              + New Category
            </button>
          </div>
        </div>

        {filteredCategories.length === 0 ? (
          <div className="empty-state">
            <p>{searchTerm ? 'No categories match your search.' : 'No categories yet. Create your first category!'}</p>
          </div>
        ) : (
          <>
            <table className="products-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Category Name</th>
                  <th>Description</th>
                  <th>Parent ID</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentCategories.map(category => (
                  <tr key={category.id} className="product-row">
                    <td>{category.id}</td>
                    <td className="product-name">{category.categoryName}</td>
                    <td className="product-description">{category.description || '—'}</td>
                    <td>{category.parentId || '—'}</td>
                    <td className="product-time">
                      {category.createdAt ? new Date(category.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="product-actions">
                      <button
                        className="btn-icon btn-edit"
                        onClick={() => handleEdit(category)}
                        title="Edit"
                      >
                        ✎
                      </button>
                      <button
                        className="btn-icon btn-delete"
                        onClick={() => handleDelete(category.id)}
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
