import React, { useState, useEffect } from 'react'
import { useAlert } from '../context/AlertContext'

export default function AboutUsManagement() {
  const alert = useAlert()
  const [activeTab, setActiveTab] = useState('companyInfo')
  const [loading, setLoading] = useState(false)
  
  // Company Info (key-value pairs)
  const [companyInfos, setCompanyInfos] = useState([])
  const [editingCompanyInfo, setEditingCompanyInfo] = useState(null)
  const [newCompanyInfo, setNewCompanyInfo] = useState({ section: '', content: '' })
  
  // Company Values
  const [values, setValues] = useState([])
  const [editingValue, setEditingValue] = useState(null)
  const [newValue, setNewValue] = useState({ title: '', description: '', displayOrder: 0 })
  
  // Milestones
  const [milestones, setMilestones] = useState([])
  const [editingMilestone, setEditingMilestone] = useState(null)
  const [newMilestone, setNewMilestone] = useState({ year: '', title: '', description: '', displayOrder: 0 })
  
  // Career Benefits
  const [benefits, setBenefits] = useState([])
  const [editingBenefit, setEditingBenefit] = useState(null)
  const [newBenefit, setNewBenefit] = useState({ icon: '', title: '', description: '', displayOrder: 0 })
  
  // Job Openings
  const [jobs, setJobs] = useState([])
  const [editingJob, setEditingJob] = useState(null)
  const [newJob, setNewJob] = useState({ title: '', department: '', location: '', isActive: true })
  
  // Privacy Policy
  const [privacyPolicies, setPrivacyPolicies] = useState([])
  const [editingPrivacy, setEditingPrivacy] = useState(null)
  const [newPrivacy, setNewPrivacy] = useState({ sectionNumber: 0, title: '', content: '', displayOrder: 0 })
  
  // Terms of Service
  const [terms, setTerms] = useState([])
  const [editingTerm, setEditingTerm] = useState(null)
  const [newTerm, setNewTerm] = useState({ sectionNumber: 0, title: '', content: '', displayOrder: 0 })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [companyInfoRes, valuesRes, milestonesRes, benefitsRes, jobsRes, privacyRes, termsRes] = await Promise.all([
        fetch('/api/about-us/company-info'),
        fetch('/api/about-us'),
        fetch('/api/about-us'),
        fetch('/api/about-us'),
        fetch('/api/about-us/jobs'),
        fetch('/api/about-us/privacy'),
        fetch('/api/about-us/terms')
      ])
      
      const companyInfoData = await companyInfoRes.json()
      const aboutData = await valuesRes.json()
      const jobsData = await jobsRes.json()
      const privacyData = await privacyRes.json()
      const termsData = await termsRes.json()
      
      setCompanyInfos(companyInfoData)
      setValues(aboutData.companyValues || [])
      setMilestones(aboutData.companyMilestones || [])
      setBenefits(aboutData.careerBenefits || [])
      setJobs(jobsData)
      setPrivacyPolicies(privacyData)
      setTerms(termsData)
    } catch (err) {
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  // Company Info handlers
  const addCompanyInfo = async () => {
    if (!newCompanyInfo.section || !newCompanyInfo.content) {
      alert.warning('Validation Failed', 'Please fill in section and content')
      return
    }
    
    try {
      const res = await fetch('/api/about-us/company-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCompanyInfo)
      })
      
      if (res.ok) {
        fetchData()
        setNewCompanyInfo({ section: '', content: '' })
        alert.success('Company Info Added', 'Company info added successfully')
      }
    } catch (err) {
      console.error('Error adding company info:', err)
      alert.error('Operation Failed', 'Failed to add company info')
    }
  }

  const updateCompanyInfo = async (info) => {
    try {
      const res = await fetch(`/api/about-us/company-info/${info.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(info)
      })
      
      if (res.ok) {
        fetchData()
        setEditingCompanyInfo(null)
        alert.success('Company Info Updated', 'Company info updated successfully')
      }
    } catch (err) {
      console.error('Error updating company info:', err)
      alert.error('Update Failed', 'Failed to update company info')
    }
  }

  const deleteCompanyInfo = async (id) => {
    if (!confirm('Are you sure you want to delete this company info?')) return
    
    try {
      const res = await fetch(`/api/about-us/company-info/${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchData()
        alert.success('Company Info Deleted', 'Company info deleted successfully')
      }
    } catch (err) {
      console.error('Error deleting company info:', err)
      alert.error('Delete Failed', 'Failed to delete company info')
    }
  }

  // Company Value handlers
  const addValue = async () => {
    if (!newValue.title) {
      alert.warning('Validation Failed', 'Please fill in title')
      return
    }
    
    try {
      const res = await fetch('/api/about-us/values', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newValue)
      })
      
      if (res.ok) {
        fetchData()
        setNewValue({ title: '', description: '', displayOrder: 0 })
        alert.success('Value Added', 'Value added successfully')
      }
    } catch (err) {
      console.error('Error adding value:', err)
      alert.error('Operation Failed', 'Failed to add value')
    }
  }

  const updateValue = async (value) => {
    try {
      const res = await fetch(`/api/about-us/values/${value.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(value)
      })
      
      if (res.ok) {
        fetchData()
        setEditingValue(null)
        alert.success('Value Updated', 'Value updated successfully!')
      }
    } catch (err) {
      console.error('Error updating value:', err)
      alert.error('Update Failed', 'Failed to update value')
    }
  }

  const deleteValue = async (id) => {
    if (!confirm('Are you sure you want to delete this value?')) return
    
    try {
      const res = await fetch(`/api/about-us/values/${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchData()
        alert.success('Value Deleted', 'Value deleted successfully!')
      }
    } catch (err) {
      console.error('Error deleting value:', err)
      alert.error('Delete Failed', 'Failed to delete value')
    }
  }

  // Milestone handlers
  const addMilestone = async () => {
    if (!newMilestone.year || !newMilestone.title) {
      alert.warning('Validation Failed', 'Please fill in year and title')
      return
    }
    
    try {
      const res = await fetch('/api/about-us/milestones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMilestone)
      })
      
      if (res.ok) {
        fetchData()
        setNewMilestone({ year: '', title: '', description: '', displayOrder: 0 })
        alert.success('Milestone Added', 'Milestone added successfully!')
      }
    } catch (err) {
      console.error('Error adding milestone:', err)
      alert.error('Operation Failed', 'Failed to add milestone')
    }
  }

  const updateMilestone = async (milestone) => {
    try {
      const res = await fetch(`/api/about-us/milestones/${milestone.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(milestone)
      })
      
      if (res.ok) {
        fetchData()
        setEditingMilestone(null)
        alert.success('Milestone Updated', 'Milestone updated successfully!')
      }
    } catch (err) {
      console.error('Error updating milestone:', err)
      alert.error('Update Failed', 'Failed to update milestone')
    }
  }

  const deleteMilestone = async (id) => {
    if (!confirm('Are you sure you want to delete this milestone?')) return
    
    try {
      const res = await fetch(`/api/about-us/milestones/${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchData()
        alert.success('Milestone Deleted', 'Milestone deleted successfully!')
      }
    } catch (err) {
      console.error('Error deleting milestone:', err)
      alert.error('Delete Failed', 'Failed to delete milestone')
    }
  }

  // Career Benefit handlers
  const addBenefit = async () => {
    if (!newBenefit.title) {
      alert.warning('Validation Failed', 'Please fill in title')
      return
    }
    
    try {
      const res = await fetch('/api/about-us/benefits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBenefit)
      })
      
      if (res.ok) {
        fetchData()
        setNewBenefit({ icon: '', title: '', description: '', displayOrder: 0 })
        alert.success('Benefit Added', 'Benefit added successfully!')
      }
    } catch (err) {
      console.error('Error adding benefit:', err)
      alert.error('Operation Failed', 'Failed to add benefit')
    }
  }

  const updateBenefit = async (benefit) => {
    try {
      const res = await fetch(`/api/about-us/benefits/${benefit.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(benefit)
      })
      
      if (res.ok) {
        fetchData()
        setEditingBenefit(null)
        alert.success('Benefit Updated', 'Benefit updated successfully!')
      }
    } catch (err) {
      console.error('Error updating benefit:', err)
      alert.error('Update Failed', 'Failed to update benefit')
    }
  }

  const deleteBenefit = async (id) => {
    if (!confirm('Are you sure you want to delete this benefit?')) return
    
    try {
      const res = await fetch(`/api/about-us/benefits/${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchData()
        alert.success('Benefit Deleted', 'Benefit deleted successfully!')
      }
    } catch (err) {
      console.error('Error deleting benefit:', err)
      alert.error('Delete Failed', 'Failed to delete benefit')
    }
  }

  // Job Opening handlers
  const addJob = async () => {
    if (!newJob.title) {
      alert.warning('Validation Failed', 'Please fill in title')
      return
    }
    
    try {
      const res = await fetch('/api/about-us/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newJob)
      })
      
      if (res.ok) {
        fetchData()
        setNewJob({ title: '', department: '', location: '', isActive: true })
        alert.success('Job Added', 'Job added successfully!')
      }
    } catch (err) {
      console.error('Error adding job:', err)
      alert.error('Operation Failed', 'Failed to add job')
    }
  }

  const updateJob = async (job) => {
    try {
      const res = await fetch(`/api/about-us/jobs/${job.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(job)
      })
      
      if (res.ok) {
        fetchData()
        setEditingJob(null)
        alert.success('Job Updated', 'Job updated successfully!')
      }
    } catch (err) {
      console.error('Error updating job:', err)
      alert.error('Update Failed', 'Failed to update job')
    }
  }

  const deleteJob = async (id) => {
    if (!confirm('Are you sure you want to delete this job?')) return
    
    try {
      const res = await fetch(`/api/about-us/jobs/${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchData()
        alert.success('Job Deleted', 'Job deleted successfully!')
      }
    } catch (err) {
      console.error('Error deleting job:', err)
      alert.error('Delete Failed', 'Failed to delete job')
    }
  }

  // Privacy Policy handlers
  const addPrivacy = async () => {
    if (!newPrivacy.title) {
      alert.warning('Validation Failed', 'Please fill in title')
      return
    }
    
    try {
      const res = await fetch('/api/about-us/privacy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPrivacy)
      })
      
      if (res.ok) {
        fetchData()
        setNewPrivacy({ sectionNumber: 0, title: '', content: '', displayOrder: 0 })
        alert.success('Privacy Policy Added', 'Privacy policy added successfully!')
      }
    } catch (err) {
      console.error('Error adding privacy policy:', err)
      alert.error('Operation Failed', 'Failed to add privacy policy')
    }
  }

  const updatePrivacy = async (policy) => {
    try {
      const res = await fetch(`/api/about-us/privacy/${policy.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(policy)
      })
      
      if (res.ok) {
        fetchData()
        setEditingPrivacy(null)
        alert.success('Privacy Policy Updated', 'Privacy policy updated successfully!')
      }
    } catch (err) {
      console.error('Error updating privacy policy:', err)
      alert.error('Update Failed', 'Failed to update privacy policy')
    }
  }

  const deletePrivacy = async (id) => {
    if (!confirm('Are you sure you want to delete this privacy policy section?')) return
    
    try {
      const res = await fetch(`/api/about-us/privacy/${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchData()
        alert.success('Privacy Policy Deleted', 'Privacy policy deleted successfully!')
      }
    } catch (err) {
      console.error('Error deleting privacy policy:', err)
      alert.error('Delete Failed', 'Failed to delete privacy policy')
    }
  }

  // Terms handlers
  const addTerm = async () => {
    if (!newTerm.title) {
      alert.warning('Validation Failed', 'Please fill in title')
      return
    }
    
    try {
      const res = await fetch('/api/about-us/terms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTerm)
      })
      
      if (res.ok) {
        fetchData()
        setNewTerm({ sectionNumber: 0, title: '', content: '', displayOrder: 0 })
        alert.success('Terms Added', 'Terms of service added successfully!')
      }
    } catch (err) {
      console.error('Error adding terms:', err)
      alert.error('Operation Failed', 'Failed to add terms')
    }
  }

  const updateTerm = async (term) => {
    try {
      const res = await fetch(`/api/about-us/terms/${term.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(term)
      })
      
      if (res.ok) {
        fetchData()
        setEditingTerm(null)
        alert.success('Terms Updated', 'Terms updated successfully!')
      }
    } catch (err) {
      console.error('Error updating terms:', err)
      alert.error('Update Failed', 'Failed to update terms')
    }
  }

  const deleteTerm = async (id) => {
    if (!confirm('Are you sure you want to delete this terms section?')) return
    
    try {
      const res = await fetch(`/api/about-us/terms/${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchData()
        alert.success('Terms Deleted', 'Terms deleted successfully!')
      }
    } catch (err) {
      console.error('Error deleting terms:', err)
      alert.error('Delete Failed', 'Failed to delete terms')
    }
  }

  if (loading) return <div style={{ padding: '24px', fontFamily: 'system-ui, sans-serif' }}>Loading...</div>

  const tabs = [
    { key: 'companyInfo', label: 'Company Info', icon: '🏢' },
    { key: 'values', label: 'Values', icon: '💎' },
    { key: 'milestones', label: 'Milestones', icon: '🎯' },
    { key: 'benefits', label: 'Benefits', icon: '✨' },
    { key: 'jobs', label: 'Jobs', icon: '💼' },
    { key: 'privacy', label: 'Privacy', icon: '🔒' },
    { key: 'terms', label: 'Terms', icon: '📜' }
  ]

  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>About Us Management</h1>
      </div>

      {/* Tabs */}
      <div style={{ marginBottom: '24px', display: 'flex', gap: '4px', borderBottom: '2px solid #e5e7eb', overflowX: 'auto', backgroundColor: 'white', borderRadius: '8px 8px 0 0', padding: '0 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '12px 20px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab.key ? '3px solid #3b82f6' : '3px solid transparent',
              color: activeTab === tab.key ? '#3b82f6' : '#6b7280',
              fontWeight: activeTab === tab.key ? '600' : '500',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              fontSize: '14px',
              transition: 'all 0.2s'
            }}
          >
            <span style={{ marginRight: '6px' }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'companyInfo' && (
        <div>
          {/* Add New Section Card */}
          <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '24px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600', color: '#111827' }}>➕ Add New Company Info Section</h3>
            <div style={{ display: 'grid', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151', fontSize: '14px' }}>Section Key *</label>
                <input
                  type="text"
                  placeholder="e.g., intro, mission, careers_intro, careers_email"
                  value={newCompanyInfo.section}
                  onChange={(e) => setNewCompanyInfo({ ...newCompanyInfo, section: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151', fontSize: '14px' }}>Content *</label>
                <textarea
                  placeholder="Enter the content for this section..."
                  value={newCompanyInfo.content}
                  onChange={(e) => setNewCompanyInfo({ ...newCompanyInfo, content: e.target.value })}
                  rows={6}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', fontFamily: 'inherit' }}
                />
              </div>
              <button 
                onClick={addCompanyInfo}
                style={{ padding: '10px 20px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', fontSize: '14px', alignSelf: 'flex-start' }}
              >
                ➕ Add Company Info
              </button>
            </div>
          </div>

          {/* Existing Sections */}
          <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600', color: '#111827' }}>📄 Existing Company Info Sections ({companyInfos.length})</h3>
            <div style={{ display: 'grid', gap: '16px' }}>
              {companyInfos.map(info => (
                <div key={info.id} style={{ padding: '16px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                  {editingCompanyInfo?.id === info.id ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <input
                        type="text"
                        value={editingCompanyInfo.section}
                        onChange={(e) => setEditingCompanyInfo({ ...editingCompanyInfo, section: e.target.value })}
                        style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                      />
                      <textarea
                        value={editingCompanyInfo.content}
                        onChange={(e) => setEditingCompanyInfo({ ...editingCompanyInfo, content: e.target.value })}
                        rows={6}
                        style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                      />
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="primary" onClick={() => updateCompanyInfo(editingCompanyInfo)}>Save</button>
                        <button className="ghost" onClick={() => setEditingCompanyInfo(null)}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{ marginBottom: '8px' }}>
                        <strong>{info.section}</strong>
                      </div>
                      <div style={{ marginBottom: '12px', color: '#6b7280', whiteSpace: 'pre-line' }}>
                        {info.content}
                      </div>
                      <div style={{ display: 'flex', gap: '8px', fontSize: '14px' }}>
                        <button className="ghost" onClick={() => setEditingCompanyInfo({ ...info })}>Edit</button>
                        <button className="ghost" onClick={() => deleteCompanyInfo(info.id)} style={{ color: '#ef4444' }}>Delete</button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'values' && (
        <div>
          <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
            <h3 style={{ marginBottom: '16px' }}>Add New Value</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                type="text"
                placeholder="Title"
                value={newValue.title}
                onChange={(e) => setNewValue({ ...newValue, title: e.target.value })}
                style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }}
              />
              <textarea
                placeholder="Description"
                value={newValue.description}
                onChange={(e) => setNewValue({ ...newValue, description: e.target.value })}
                rows={4}
                style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }}
              />
              <input
                type="number"
                placeholder="Display Order"
                value={newValue.displayOrder}
                onChange={(e) => setNewValue({ ...newValue, displayOrder: parseInt(e.target.value) })}
                style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', width: '200px' }}
              />
              <button className="primary" onClick={addValue}>Add Value</button>
            </div>
          </div>

          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: '16px' }}>Existing Values</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {values.map(value => (
                <div key={value.id} style={{ padding: '16px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                  {editingValue?.id === value.id ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <input
                        type="text"
                        value={editingValue.title}
                        onChange={(e) => setEditingValue({ ...editingValue, title: e.target.value })}
                        style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                      />
                      <textarea
                        value={editingValue.description}
                        onChange={(e) => setEditingValue({ ...editingValue, description: e.target.value })}
                        rows={4}
                        style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                      />
                      <input
                        type="number"
                        value={editingValue.displayOrder}
                        onChange={(e) => setEditingValue({ ...editingValue, displayOrder: parseInt(e.target.value) })}
                        style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', width: '200px' }}
                      />
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="primary" onClick={() => updateValue(editingValue)}>Save</button>
                        <button className="ghost" onClick={() => setEditingValue(null)}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{ marginBottom: '8px' }}>
                        <strong>{value.title}</strong>
                      </div>
                      <div style={{ marginBottom: '12px', color: '#6b7280' }}>
                        {value.description}
                      </div>
                      <div style={{ display: 'flex', gap: '8px', fontSize: '14px' }}>
                        <button className="ghost" onClick={() => setEditingValue({ ...value })}>Edit</button>
                        <button className="ghost" onClick={() => deleteValue(value.id)} style={{ color: '#ef4444' }}>Delete</button>
                        <span style={{ marginLeft: 'auto', color: '#9ca3af' }}>Order: {value.displayOrder}</span>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'milestones' && (
        <div>
          <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
            <h3 style={{ marginBottom: '16px' }}>Add New Milestone</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                type="text"
                placeholder="Year"
                value={newMilestone.year}
                onChange={(e) => setNewMilestone({ ...newMilestone, year: e.target.value })}
                style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', width: '200px' }}
              />
              <input
                type="text"
                placeholder="Title"
                value={newMilestone.title}
                onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
                style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }}
              />
              <textarea
                placeholder="Description"
                value={newMilestone.description}
                onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
                rows={4}
                style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }}
              />
              <input
                type="number"
                placeholder="Display Order"
                value={newMilestone.displayOrder}
                onChange={(e) => setNewMilestone({ ...newMilestone, displayOrder: parseInt(e.target.value) })}
                style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', width: '200px' }}
              />
              <button className="primary" onClick={addMilestone}>Add Milestone</button>
            </div>
          </div>

          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: '16px' }}>Existing Milestones</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {milestones.map(milestone => (
                <div key={milestone.id} style={{ padding: '16px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                  {editingMilestone?.id === milestone.id ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <input
                        type="text"
                        value={editingMilestone.year}
                        onChange={(e) => setEditingMilestone({ ...editingMilestone, year: e.target.value })}
                        style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', width: '200px' }}
                      />
                      <input
                        type="text"
                        value={editingMilestone.title}
                        onChange={(e) => setEditingMilestone({ ...editingMilestone, title: e.target.value })}
                        style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                      />
                      <textarea
                        value={editingMilestone.description}
                        onChange={(e) => setEditingMilestone({ ...editingMilestone, description: e.target.value })}
                        rows={4}
                        style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                      />
                      <input
                        type="number"
                        value={editingMilestone.displayOrder}
                        onChange={(e) => setEditingMilestone({ ...editingMilestone, displayOrder: parseInt(e.target.value) })}
                        style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', width: '200px' }}
                      />
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="primary" onClick={() => updateMilestone(editingMilestone)}>Save</button>
                        <button className="ghost" onClick={() => setEditingMilestone(null)}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{ marginBottom: '8px' }}>
                        <strong style={{ fontSize: '24px', color: '#2563eb' }}>{milestone.year}</strong>
                        <span style={{ marginLeft: '12px', fontSize: '18px' }}>{milestone.title}</span>
                      </div>
                      <div style={{ marginBottom: '12px', color: '#6b7280' }}>
                        {milestone.description}
                      </div>
                      <div style={{ display: 'flex', gap: '8px', fontSize: '14px' }}>
                        <button className="ghost" onClick={() => setEditingMilestone({ ...milestone })}>Edit</button>
                        <button className="ghost" onClick={() => deleteMilestone(milestone.id)} style={{ color: '#ef4444' }}>Delete</button>
                        <span style={{ marginLeft: 'auto', color: '#9ca3af' }}>Order: {milestone.displayOrder}</span>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'benefits' && (
        <div>
          <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
            <h3 style={{ marginBottom: '16px' }}>Add New Career Benefit</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                type="text"
                placeholder="Icon (emoji)"
                value={newBenefit.icon}
                onChange={(e) => setNewBenefit({ ...newBenefit, icon: e.target.value })}
                style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', width: '120px' }}
              />
              <input
                type="text"
                placeholder="Title"
                value={newBenefit.title}
                onChange={(e) => setNewBenefit({ ...newBenefit, title: e.target.value })}
                style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }}
              />
              <textarea
                placeholder="Description"
                value={newBenefit.description}
                onChange={(e) => setNewBenefit({ ...newBenefit, description: e.target.value })}
                rows={3}
                style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }}
              />
              <input
                type="number"
                placeholder="Display Order"
                value={newBenefit.displayOrder}
                onChange={(e) => setNewBenefit({ ...newBenefit, displayOrder: parseInt(e.target.value) })}
                style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', width: '200px' }}
              />
              <button className="primary" onClick={addBenefit}>Add Benefit</button>
            </div>
          </div>

          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: '16px' }}>Existing Career Benefits</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
              {benefits.map(benefit => (
                <div key={benefit.id} style={{ padding: '16px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                  {editingBenefit?.id === benefit.id ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <input
                        type="text"
                        value={editingBenefit.icon}
                        onChange={(e) => setEditingBenefit({ ...editingBenefit, icon: e.target.value })}
                        style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', width: '80px' }}
                      />
                      <input
                        type="text"
                        value={editingBenefit.title}
                        onChange={(e) => setEditingBenefit({ ...editingBenefit, title: e.target.value })}
                        style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                      />
                      <textarea
                        value={editingBenefit.description}
                        onChange={(e) => setEditingBenefit({ ...editingBenefit, description: e.target.value })}
                        rows={3}
                        style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                      />
                      <input
                        type="number"
                        value={editingBenefit.displayOrder}
                        onChange={(e) => setEditingBenefit({ ...editingBenefit, displayOrder: parseInt(e.target.value) })}
                        style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                      />
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="primary" onClick={() => updateBenefit(editingBenefit)} style={{ fontSize: '12px', padding: '6px 12px' }}>Save</button>
                        <button className="ghost" onClick={() => setEditingBenefit(null)} style={{ fontSize: '12px', padding: '6px 12px' }}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{ fontSize: '48px', marginBottom: '12px', textAlign: 'center' }}>{benefit.icon}</div>
                      <div style={{ marginBottom: '8px', fontWeight: 'bold', textAlign: 'center' }}>{benefit.title}</div>
                      <div style={{ marginBottom: '12px', color: '#6b7280', fontSize: '14px', textAlign: 'center' }}>
                        {benefit.description}
                      </div>
                      <div style={{ display: 'flex', gap: '8px', fontSize: '12px', justifyContent: 'center' }}>
                        <button className="ghost" onClick={() => setEditingBenefit({ ...benefit })} style={{ padding: '4px 8px' }}>Edit</button>
                        <button className="ghost" onClick={() => deleteBenefit(benefit.id)} style={{ color: '#ef4444', padding: '4px 8px' }}>Delete</button>
                      </div>
                      <div style={{ textAlign: 'center', marginTop: '8px', color: '#9ca3af', fontSize: '12px' }}>Order: {benefit.displayOrder}</div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'jobs' && (
        <div>
          <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
            <h3 style={{ marginBottom: '16px' }}>Add New Job Opening</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                type="text"
                placeholder="Job Title"
                value={newJob.title}
                onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }}
              />
              <input
                type="text"
                placeholder="Department"
                value={newJob.department}
                onChange={(e) => setNewJob({ ...newJob, department: e.target.value })}
                style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }}
              />
              <input
                type="text"
                placeholder="Location"
                value={newJob.location}
                onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }}
              />
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={newJob.isActive}
                  onChange={(e) => setNewJob({ ...newJob, isActive: e.target.checked })}
                />
                <span>Active</span>
              </label>
              <button className="primary" onClick={addJob}>Add Job</button>
            </div>
          </div>

          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: '16px' }}>Existing Job Openings</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {jobs.map(job => (
                <div key={job.id} style={{ padding: '16px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                  {editingJob?.id === job.id ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <input
                        type="text"
                        value={editingJob.title}
                        onChange={(e) => setEditingJob({ ...editingJob, title: e.target.value })}
                        style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                      />
                      <input
                        type="text"
                        value={editingJob.department}
                        onChange={(e) => setEditingJob({ ...editingJob, department: e.target.value })}
                        style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                      />
                      <input
                        type="text"
                        value={editingJob.location}
                        onChange={(e) => setEditingJob({ ...editingJob, location: e.target.value })}
                        style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                      />
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="checkbox"
                          checked={editingJob.isActive}
                          onChange={(e) => setEditingJob({ ...editingJob, isActive: e.target.checked })}
                        />
                        <span>Active</span>
                      </label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="primary" onClick={() => updateJob(editingJob)}>Save</button>
                        <button className="ghost" onClick={() => setEditingJob(null)}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{ marginBottom: '8px' }}>
                        <strong style={{ fontSize: '18px' }}>{job.title}</strong>
                        <span style={{ marginLeft: '12px', padding: '4px 8px', background: job.isActive ? '#dcfce7' : '#fee2e2', color: job.isActive ? '#166534' : '#991b1b', borderRadius: '4px', fontSize: '12px' }}>
                          {job.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div style={{ marginBottom: '12px', color: '#6b7280' }}>
                        <div>Department: {job.department}</div>
                        <div>Location: {job.location}</div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', fontSize: '14px' }}>
                        <button className="ghost" onClick={() => setEditingJob({ ...job })}>Edit</button>
                        <button className="ghost" onClick={() => deleteJob(job.id)} style={{ color: '#ef4444' }}>Delete</button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'privacy' && (
        <div>
          <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
            <h3 style={{ marginBottom: '16px' }}>Add New Privacy Policy Section</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                type="number"
                placeholder="Section Number"
                value={newPrivacy.sectionNumber}
                onChange={(e) => setNewPrivacy({ ...newPrivacy, sectionNumber: parseInt(e.target.value) })}
                style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', width: '200px' }}
              />
              <input
                type="text"
                placeholder="Title"
                value={newPrivacy.title}
                onChange={(e) => setNewPrivacy({ ...newPrivacy, title: e.target.value })}
                style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }}
              />
              <textarea
                placeholder="Content"
                value={newPrivacy.content}
                onChange={(e) => setNewPrivacy({ ...newPrivacy, content: e.target.value })}
                rows={6}
                style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }}
              />
              <input
                type="number"
                placeholder="Display Order"
                value={newPrivacy.displayOrder}
                onChange={(e) => setNewPrivacy({ ...newPrivacy, displayOrder: parseInt(e.target.value) })}
                style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', width: '200px' }}
              />
              <button className="primary" onClick={addPrivacy}>Add Privacy Section</button>
            </div>
          </div>

          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: '16px' }}>Existing Privacy Policy Sections</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {privacyPolicies.map(policy => (
                <div key={policy.id} style={{ padding: '16px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                  {editingPrivacy?.id === policy.id ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <input
                        type="number"
                        value={editingPrivacy.sectionNumber}
                        onChange={(e) => setEditingPrivacy({ ...editingPrivacy, sectionNumber: parseInt(e.target.value) })}
                        style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', width: '200px' }}
                      />
                      <input
                        type="text"
                        value={editingPrivacy.title}
                        onChange={(e) => setEditingPrivacy({ ...editingPrivacy, title: e.target.value })}
                        style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                      />
                      <textarea
                        value={editingPrivacy.content}
                        onChange={(e) => setEditingPrivacy({ ...editingPrivacy, content: e.target.value })}
                        rows={6}
                        style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                      />
                      <input
                        type="number"
                        value={editingPrivacy.displayOrder}
                        onChange={(e) => setEditingPrivacy({ ...editingPrivacy, displayOrder: parseInt(e.target.value) })}
                        style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', width: '200px' }}
                      />
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="primary" onClick={() => updatePrivacy(editingPrivacy)}>Save</button>
                        <button className="ghost" onClick={() => setEditingPrivacy(null)}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{ marginBottom: '8px' }}>
                        <strong>{policy.sectionNumber}. {policy.title}</strong>
                      </div>
                      <div style={{ marginBottom: '12px', color: '#6b7280', whiteSpace: 'pre-line' }}>
                        {policy.content}
                      </div>
                      <div style={{ display: 'flex', gap: '8px', fontSize: '14px' }}>
                        <button className="ghost" onClick={() => setEditingPrivacy({ ...policy })}>Edit</button>
                        <button className="ghost" onClick={() => deletePrivacy(policy.id)} style={{ color: '#ef4444' }}>Delete</button>
                        <span style={{ marginLeft: 'auto', color: '#9ca3af' }}>Order: {policy.displayOrder}</span>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'terms' && (
        <div>
          <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
            <h3 style={{ marginBottom: '16px' }}>Add New Terms Section</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                type="number"
                placeholder="Section Number"
                value={newTerm.sectionNumber}
                onChange={(e) => setNewTerm({ ...newTerm, sectionNumber: parseInt(e.target.value) })}
                style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', width: '200px' }}
              />
              <input
                type="text"
                placeholder="Title"
                value={newTerm.title}
                onChange={(e) => setNewTerm({ ...newTerm, title: e.target.value })}
                style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }}
              />
              <textarea
                placeholder="Content"
                value={newTerm.content}
                onChange={(e) => setNewTerm({ ...newTerm, content: e.target.value })}
                rows={6}
                style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }}
              />
              <input
                type="number"
                placeholder="Display Order"
                value={newTerm.displayOrder}
                onChange={(e) => setNewTerm({ ...newTerm, displayOrder: parseInt(e.target.value) })}
                style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', width: '200px' }}
              />
              <button className="primary" onClick={addTerm}>Add Terms Section</button>
            </div>
          </div>

          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: '16px' }}>Existing Terms Sections</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {terms.map(term => (
                <div key={term.id} style={{ padding: '16px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                  {editingTerm?.id === term.id ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <input
                        type="number"
                        value={editingTerm.sectionNumber}
                        onChange={(e) => setEditingTerm({ ...editingTerm, sectionNumber: parseInt(e.target.value) })}
                        style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', width: '200px' }}
                      />
                      <input
                        type="text"
                        value={editingTerm.title}
                        onChange={(e) => setEditingTerm({ ...editingTerm, title: e.target.value })}
                        style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                      />
                      <textarea
                        value={editingTerm.content}
                        onChange={(e) => setEditingTerm({ ...editingTerm, content: e.target.value })}
                        rows={6}
                        style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                      />
                      <input
                        type="number"
                        value={editingTerm.displayOrder}
                        onChange={(e) => setEditingTerm({ ...editingTerm, displayOrder: parseInt(e.target.value) })}
                        style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', width: '200px' }}
                      />
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="primary" onClick={() => updateTerm(editingTerm)}>Save</button>
                        <button className="ghost" onClick={() => setEditingTerm(null)}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{ marginBottom: '8px' }}>
                        <strong>{term.sectionNumber}. {term.title}</strong>
                      </div>
                      <div style={{ marginBottom: '12px', color: '#6b7280', whiteSpace: 'pre-line' }}>
                        {term.content}
                      </div>
                      <div style={{ display: 'flex', gap: '8px', fontSize: '14px' }}>
                        <button className="ghost" onClick={() => setEditingTerm({ ...term })}>Edit</button>
                        <button className="ghost" onClick={() => deleteTerm(term.id)} style={{ color: '#ef4444' }}>Delete</button>
                        <span style={{ marginLeft: 'auto', color: '#9ca3af' }}>Order: {term.displayOrder}</span>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
