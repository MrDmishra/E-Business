import React, { useState, useEffect } from 'react'

export default function AboutUsPage({ onBack }) {
  const [activeSection, setActiveSection] = useState('story')
  const [companyInfo, setCompanyInfo] = useState({})
  const [companyValues, setCompanyValues] = useState([])
  const [companyMilestones, setCompanyMilestones] = useState([])
  const [careerBenefits, setCareerBenefits] = useState([])
  const [jobOpenings, setJobOpenings] = useState([])
  const [privacyPolicy, setPrivacyPolicy] = useState([])
  const [termsOfService, setTermsOfService] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAboutUsData()
  }, [])

  const fetchAboutUsData = async () => {
    try {
      const response = await fetch('/api/about-us')
      if (response.ok) {
        const data = await response.json()
        setCompanyInfo(data.companyInfo || {})
        setCompanyValues(data.companyValues || [])
        setCompanyMilestones(data.companyMilestones || [])
        setCareerBenefits(data.careerBenefits || [])
        setJobOpenings(data.jobOpenings || [])
        setPrivacyPolicy(data.privacyPolicy || [])
        setTermsOfService(data.termsOfService || [])
      }
    } catch (error) {
      console.error('Failed to fetch about us data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontSize: '18px', color: '#6b7280' }}>Loading...</p>
      </div>
    )
  }

  const sections = {
    story: {
      title: 'Our Story',
      icon: '📖',
      content: (
        <div>
          <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px', color: 'rgb(27, 60, 83)' }}>
            Our Story
          </h3>
          <div style={{ display: 'grid', gap: '24px' }}>
            {companyInfo.intro && (
              <p style={{ color: '#6b7280', lineHeight: '1.8', fontSize: '16px', whiteSpace: 'pre-line' }}>
                {companyInfo.intro}
              </p>
            )}
            {companyInfo.mission && (
              <p style={{ color: '#6b7280', lineHeight: '1.8', fontSize: '16px', whiteSpace: 'pre-line' }}>
                {companyInfo.mission}
              </p>
            )}
            <div style={{ backgroundColor: '#f9fafb', padding: '24px', borderRadius: '8px', marginTop: '16px' }}>
              <h4 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: 'rgb(27, 60, 83)' }}>
                Our Values
              </h4>
              <div style={{ display: 'grid', gap: '16px' }}>
                {companyValues.map((value) => (
                  <div key={value.id} style={{ display: 'flex', gap: '12px', alignItems: 'start' }}>
                    <div style={{ 
                      width: '8px', 
                      height: '8px', 
                      backgroundColor: 'rgb(69, 104, 130)', 
                      borderRadius: '50%',
                      marginTop: '8px',
                      flexShrink: 0
                    }} />
                    <div>
                      <h5 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>{value.title}</h5>
                      <p style={{ color: '#6b7280', fontSize: '14px' }}>{value.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ marginTop: '24px' }}>
              <h4 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: 'rgb(27, 60, 83)' }}>
                Our Milestones
              </h4>
              <div style={{ display: 'grid', gap: '16px' }}>
                {companyMilestones.map((milestone) => (
                  <div key={milestone.id} style={{ display: 'flex', gap: '16px', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                    <div style={{ fontSize: '32px', fontWeight: '700', color: 'rgb(69, 104, 130)', minWidth: '80px' }}>{milestone.year}</div>
                    <div>
                      <h5 style={{ fontWeight: '600', marginBottom: '4px' }}>{milestone.title}</h5>
                      <p style={{ color: '#6b7280', fontSize: '14px' }}>{milestone.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )
    },
    careers: {
      title: 'Careers',
      icon: '💼',
      content: (
        <div>
          <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px', color: 'rgb(27, 60, 83)' }}>
            Join Our Team
          </h3>
          <div style={{ display: 'grid', gap: '24px' }}>
            {companyInfo.careersIntro && (
              <p style={{ color: '#6b7280', lineHeight: '1.8', fontSize: '16px', whiteSpace: 'pre-line' }}>
                {companyInfo.careersIntro}
              </p>
            )}
            
            <div style={{ backgroundColor: '#f9fafb', padding: '24px', borderRadius: '8px' }}>
              <h4 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: 'rgb(27, 60, 83)' }}>
                Why Work With Us?
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                {careerBenefits.map((benefit) => (
                  <div key={benefit.id} style={{ textAlign: 'center', padding: '16px' }}>
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>{benefit.icon}</div>
                    <h5 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>{benefit.title}</h5>
                    <p style={{ color: '#6b7280', fontSize: '14px' }}>{benefit.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: 'rgb(27, 60, 83)' }}>
                Open Positions
              </h4>
              <div style={{ display: 'grid', gap: '12px' }}>
                {jobOpenings.map((job) => (
                  <div
                    key={job.id}
                    style={{
                      padding: '20px',
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <h5 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>{job.title}</h5>
                      <p style={{ color: '#6b7280', fontSize: '14px' }}>
                        {job.department} • {job.location}
                      </p>
                    </div>
                    <button
                      style={{
                        padding: '10px 20px',
                        backgroundColor: 'rgb(69, 104, 130)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: '500',
                        cursor: 'pointer'
                      }}
                    >
                      Apply
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {companyInfo.careersEmail && (
              <div style={{ marginTop: '24px', padding: '24px', backgroundColor: 'rgba(69, 104, 130, 0.1)', borderRadius: '8px' }}>
                <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: 'rgb(27, 60, 83)' }}>
                  Don't see a position that fits?
                </h4>
                <p style={{ color: '#6b7280', marginBottom: '16px', whiteSpace: 'pre-line' }}>
                  {companyInfo.careersEmail}
                </p>
              </div>
            )}
          </div>
        </div>
      )
    },
    privacy: {
      title: 'Privacy Policy',
      icon: '🔒',
      content: (
        <div>
          <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px', color: 'rgb(27, 60, 83)' }}>
            Privacy Policy
          </h3>
          <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '24px' }}>
            Last updated: December 16, 2025
          </p>
          <div style={{ display: 'grid', gap: '24px' }}>
            {privacyPolicy.map((section) => (
              <div key={section.id}>
                <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>
                  {section.sectionNumber}. {section.title}
                </h4>
                <p style={{ color: '#6b7280', lineHeight: '1.8', whiteSpace: 'pre-line' }}>
                  {section.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      )
    },
    terms: {
      title: 'Terms of Service',
      icon: '📄',
      content: (
        <div>
          <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px', color: 'rgb(27, 60, 83)' }}>
            Terms of Service
          </h3>
          <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '24px' }}>
            Last updated: December 16, 2025
          </p>
          <div style={{ display: 'grid', gap: '24px' }}>
            {termsOfService.map((section) => (
              <div key={section.id}>
                <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>
                  {section.sectionNumber}. {section.title}
                </h4>
                <p style={{ color: '#6b7280', lineHeight: '1.8', whiteSpace: 'pre-line' }}>
                  {section.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      )
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fff' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'rgb(27, 60, 83)', color: 'white', padding: '40px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <button
            onClick={onBack}
            style={{
              padding: '8px 16px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              marginBottom: '20px',
              cursor: 'pointer'
            }}
          >
            ← Back
          </button>
          <h1 style={{ fontSize: '42px', fontWeight: '700', marginBottom: '16px' }}>
            About Us
          </h1>
          <p style={{ fontSize: '18px', opacity: 0.9 }}>
            Learn more about our company, values, and commitments.
          </p>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '40px' }}>
          {/* Sidebar */}
          <div>
            <div style={{ position: 'sticky', top: '20px' }}>
              {Object.keys(sections).map(key => (
                <button
                  key={key}
                  onClick={() => setActiveSection(key)}
                  style={{
                    width: '100%',
                    padding: '16px',
                    marginBottom: '8px',
                    backgroundColor: activeSection === key ? 'rgb(69, 104, 130)' : '#f9fafb',
                    color: activeSection === key ? 'white' : '#374151',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.3s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  <span style={{ fontSize: '20px' }}>{sections[key].icon}</span>
                  {sections[key].title}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            {sections[activeSection].content}
          </div>
        </div>
      </div>
    </div>
  )
}
