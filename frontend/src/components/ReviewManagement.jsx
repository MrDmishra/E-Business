import React, { useState, useEffect } from 'react'
import { useAlert } from '../context/AlertContext'

export default function ReviewManagement() {
  const alert = useAlert()
  const [reviews, setReviews] = useState([])
  const [consumers, setConsumers] = useState([])
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [expandedReviewId, setExpandedReviewId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [reviewsPerPage] = useState(10)
  const [formData, setFormData] = useState({
    consumerId: '',
    itemId: '',
    rating: 5,
    reviewText: ''
  })

  useEffect(() => {
    fetchReviews()
    fetchConsumers()
    fetchItems()
  }, [])

  const fetchReviews = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/reviews')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setReviews(data || [])
    } catch (err) {
      alert.error('Load Failed', 'Failed to fetch reviews')
    } finally {
      setLoading(false)
    }
  }

  const fetchConsumers = async () => {
    try {
      const res = await fetch('/api/consumers')
      if (res.ok) setConsumers(await res.json())
    } catch (err) {}
  }

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/items')
      if (res.ok) setItems(await res.json())
    } catch (err) {}
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.consumerId || !formData.itemId || !formData.rating) {
      alert.warning('Missing Fields', 'Consumer, item, and rating are required')
      return
    }

    try {
      const url = editingId ? `/api/reviews/${editingId}` : '/api/reviews'
      const method = editingId ? 'PUT' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      
      await fetchReviews()
      resetForm()
      alert.success(
        editingId ? 'Review Updated' : 'Review Created',
        editingId ? 'Review updated successfully!' : 'Review created successfully!'
      )
    } catch (err) {
      alert.error('Operation Failed', 'Failed to save review')
    }
  }

  const handleEdit = (review) => {
    setEditingId(review.reviewId)
    setFormData({
      consumerId: review.consumerId || '',
      itemId: review.itemId || '',
      rating: review.rating || 5,
      reviewText: review.reviewText || ''
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this review?')) return
    
    try {
      const res = await fetch(`/api/reviews/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      await fetchReviews()
      alert.success('Review Deleted', 'Review deleted successfully!')
    } catch (err) {
      alert.error('Delete Failed', 'Failed to delete review')
    }
  }

  const resetForm = () => {
    setFormData({
      consumerId: '',
      itemId: '',
      rating: 5,
      reviewText: ''
    })
    setEditingId(null)
    setShowModal(false)
  }

  const filteredReviews = reviews.filter(review => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    return (
      review.reviewId?.toString().includes(search) ||
      review.consumerName?.toLowerCase().includes(search) ||
      review.itemName?.toLowerCase().includes(search) ||
      review.rating?.toString().includes(search) ||
      review.reviewText?.toLowerCase().includes(search)
    )
  })

  const indexOfLastReview = currentPage * reviewsPerPage
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage
  const currentReviews = filteredReviews.slice(indexOfFirstReview, indexOfLastReview)
  const totalPages = Math.ceil(filteredReviews.length / reviewsPerPage)

  const renderStars = (rating) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating)
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '16px', flexWrap: 'wrap' }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>Review Management</h1>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ position: 'relative', minWidth: '300px' }}>
            <input
              type="text"
              placeholder="🔍 Search reviews..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input-inline"
            />
            {searchTerm && (
              <button
                className="clear-search-inline"
                onClick={() => setSearchTerm('')}
                title="Clear search"
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '16px',
                  color: '#6b7280'
                }}
              >
                ✕
              </button>
            )}
          </div>
          
          <button 
            onClick={() => setShowModal(true)} 
            style={{ padding: '10px 20px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            + Add Review
          </button>
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : currentReviews.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <p style={{ color: '#6b7280' }}>{searchTerm ? 'No reviews match your search.' : 'No reviews yet. Add your first review!'}</p>
        </div>
      ) : (
        <>
          <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <thead style={{ backgroundColor: '#f9fafb' }}>
              <tr>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Review ID</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Customer</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Item</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Rating</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Date</th>
                <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #e5e7eb' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentReviews.map(review => (
                <React.Fragment key={review.reviewId}>
                  <tr 
                    onClick={() => setExpandedReviewId(expandedReviewId === review.reviewId ? null : review.reviewId)}
                    style={{ borderBottom: '1px solid #f3f4f6', cursor: 'pointer', backgroundColor: expandedReviewId === review.reviewId ? '#f9fafb' : 'white' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = expandedReviewId === review.reviewId ? '#f9fafb' : 'white'}
                  >
                    <td style={{ padding: '12px' }}>#{review.reviewId}</td>
                    <td style={{ padding: '12px' }}>{review.consumerName || 'N/A'}</td>
                    <td style={{ padding: '12px' }}>{review.itemName || 'N/A'}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ fontSize: '16px' }}>{renderStars(review.rating)}</span>
                      <span style={{ marginLeft: '4px', color: '#6b7280', fontSize: '13px' }}>({review.rating}/5)</span>
                    </td>
                    <td style={{ padding: '12px' }}>{new Date(review.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setExpandedReviewId(expandedReviewId === review.reviewId ? null : review.reviewId) }}
                        style={{ padding: '4px 8px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                      >
                        {expandedReviewId === review.reviewId ? '▲ Hide' : '▼ Show'}
                      </button>
                    </td>
                  </tr>
                  {expandedReviewId === review.reviewId && (
                    <tr style={{ backgroundColor: '#f9fafb' }}>
                      <td colSpan="6" style={{ padding: '16px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '24px' }}>
                          <div>
                            <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Review Details</h4>
                            {review.reviewText ? (
                              <p style={{ margin: 0, color: '#4b5563', fontSize: '14px', lineHeight: '1.6', backgroundColor: 'white', padding: '12px', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                                {review.reviewText}
                              </p>
                            ) : (
                              <p style={{ margin: 0, color: '#9ca3af', fontSize: '14px', fontStyle: 'italic' }}>No review text provided</p>
                            )}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Actions</h4>
                            <button 
                              onClick={() => handleEdit(review)}
                              style={{ padding: '8px 16px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', whiteSpace: 'nowrap' }}
                            >
                              ✏️ Edit Review
                            </button>
                            <button 
                              onClick={() => handleDelete(review.reviewId)}
                              style={{ padding: '8px 16px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', whiteSpace: 'nowrap' }}
                            >
                              🗑️ Delete Review
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', padding: '16px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ color: '#6b7280', fontSize: '14px' }}>
              Showing {indexOfFirstReview + 1} to {Math.min(indexOfLastReview, filteredReviews.length)} of {filteredReviews.length} reviews
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} 
                disabled={currentPage === 1}
                style={{ padding: '8px 16px', backgroundColor: currentPage === 1 ? '#e5e7eb' : '#3b82f6', color: currentPage === 1 ? '#9ca3af' : 'white', border: 'none', borderRadius: '6px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
              >
                Previous
              </button>
              <span style={{ padding: '8px 16px', backgroundColor: '#f3f4f6', borderRadius: '6px', fontWeight: '600' }}>
                Page {currentPage} of {totalPages}
              </span>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} 
                disabled={currentPage === totalPages}
                style={{ padding: '8px 16px', backgroundColor: currentPage === totalPages ? '#e5e7eb' : '#3b82f6', color: currentPage === totalPages ? '#9ca3af' : 'white', border: 'none', borderRadius: '6px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', borderRadius: '8px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflow: 'auto', padding: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px' }}>{editingId ? 'Edit Review' : 'Add Review'}</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Consumer *</label>
                <select name="consumerId" value={formData.consumerId} onChange={handleInputChange} required disabled={editingId} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}>
                  <option value="">Select Consumer</option>
                  {consumers.map(c => (
                    <option key={c.consumerId} value={c.consumerId}>{c.fullName}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Item *</label>
                <select name="itemId" value={formData.itemId} onChange={handleInputChange} required disabled={editingId} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}>
                  <option value="">Select Item</option>
                  {items.map(i => (
                    <option key={i.itemId} value={i.itemId}>{i.itemName}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Rating *</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                      style={{
                        fontSize: '32px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '0',
                        filter: star <= formData.rating ? 'none' : 'grayscale(1)'
                      }}
                    >
                      {star <= formData.rating ? '⭐' : '☆'}
                    </button>
                  ))}
                  <span style={{ marginLeft: '12px', fontSize: '18px', fontWeight: '600', alignSelf: 'center' }}>
                    {formData.rating}/5
                  </span>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Review Text</label>
                <textarea
                  name="reviewText"
                  value={formData.reviewText}
                  onChange={handleInputChange}
                  rows="5"
                  placeholder="Share your experience with this product..."
                  style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', resize: 'vertical', fontFamily: 'system-ui, sans-serif' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button type="button" onClick={resetForm} style={{ padding: '10px 20px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
