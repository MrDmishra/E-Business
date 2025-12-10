import React, {useEffect, useState} from 'react'

const fallbackRows = [
  ]

export default function ProductList(){
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(()=>{
    setLoading(true)
    fetch('/api/products')
      .then(res => {
        if(!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then(data => setProducts(data))
      .catch(err => setError(err.message || 'Fetch error'))
      .finally(()=> setLoading(false))
  },[])

  const rows = products && products.length > 0 ? products : fallbackRows

  if(loading) return <div className="small-note">Loading products…</div>
  if(error) return <div style={{color:'#b91c1c'}}>Error: {error}</div>

  return (
    <div className="product-list">
      <ul>
        {rows.map((p, idx) => (
          <li key={p.id || idx} className="product">
            <div>
              <h3>{p.name || `Product ${idx + 1}`}</h3>
              <p>{p.description || 'Recent review and status updates.'}</p>
            </div>

            <div>
              <div className="price">{p.price != null ? `₹${p.price}` : '₹—'}</div>
              <p className="small-note">{p.rating || '★★★★☆'}</p>
            </div>

            <div>
              <p className="small-note">{p.customer || 'Customer'}</p>
              <p className="small-note">{p.time || 'Just now'}</p>
            </div>

            <div>
              <span className={`badge ${(p.status || 'approved').toLowerCase()}`}>
                {p.status || 'Approved'}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
