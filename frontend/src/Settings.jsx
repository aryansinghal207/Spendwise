import React, {useEffect, useState} from 'react'
import './settings.css'

export default function Settings({currentUser, token, onUpdateUser}){
  const [activeTab, setActiveTab] = useState('profile')
  const [profile, setProfile] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    monthlyIncome: currentUser?.monthlyIncome || 0
  })
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    budgetAlerts: true,
    currency: 'INR',
    language: 'en'
  })

  useEffect(() => {
    if (currentUser) {
      setProfile({
        name: currentUser.name,
        email: currentUser.email,
        monthlyIncome: currentUser.monthlyIncome || 0
      })
    }
  }, [currentUser])

  async function handleProfileUpdate(e) {
    e.preventDefault()
    setLoading(true)
    setStatus('')
    
    try {
      const headers = {'Content-Type': 'application/json'}
      if (token) headers['Authorization'] = 'Bearer ' + token
      
      const res = await fetch('/api/users/' + currentUser.id, {
        method: 'PUT',
        headers,
        body: JSON.stringify(profile)
      })
      
      if (!res.ok) throw new Error('Update failed')
      
      const updated = await res.json()
      if (onUpdateUser) onUpdateUser(updated)
      setStatus('Profile updated successfully! ✓')
      setTimeout(() => setStatus(''), 3000)
    } catch (err) {
      setStatus('Error: ' + err.message)
    }
    setLoading(false)
  }

  async function handleDeleteAccount() {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) return
    
    try {
      const headers = {}
      if (token) headers['Authorization'] = 'Bearer ' + token
      
      const res = await fetch('/api/users/' + currentUser.id, {
        method: 'DELETE',
        headers
      })
      
      if (!res.ok) throw new Error('Delete failed')
      
      localStorage.removeItem('token')
      window.location.reload()
    } catch (err) {
      setStatus('Error deleting account: ' + err.message)
    }
  }

  return (
    <div className="dashboard-root">
      <div className="dashboard-header">
        <h1>Settings</h1>
      </div>

      <div className="settings-container">
        <div className="settings-sidebar">
          <button 
            className={`settings-tab ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            👤 Profile
          </button>
          <button 
            className={`settings-tab ${activeTab === 'preferences' ? 'active' : ''}`}
            onClick={() => setActiveTab('preferences')}
          >
            ⚙️ Preferences
          </button>
          <button 
            className={`settings-tab ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            🔒 Security
          </button>
          <button 
            className={`settings-tab ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            🔔 Notifications
          </button>
          <button 
            className={`settings-tab ${activeTab === 'danger' ? 'active' : ''}`}
            onClick={() => setActiveTab('danger')}
          >
            ⚠️ Danger Zone
          </button>
        </div>

        <div className="settings-content">
          {activeTab === 'profile' && (
            <div className="settings-panel">
              <h2>Edit Profile</h2>
              <p style={{color: '#64748b', marginBottom: '24px'}}>Update your personal information</p>
              
              <form onSubmit={handleProfileUpdate} style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
                <div className="form-group">
                  <label>Full Name</label>
                  <input 
                    type="text"
                    value={profile.name}
                    onChange={e => setProfile({...profile, name: e.target.value})}
                    required
                    style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0'}}
                  />
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <input 
                    type="email"
                    value={profile.email}
                    onChange={e => setProfile({...profile, email: e.target.value})}
                    required
                    style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0'}}
                  />
                </div>

                <div className="form-group">
                  <label>Monthly Income</label>
                  <input 
                    type="number"
                    step="0.01"
                    value={profile.monthlyIncome}
                    onChange={e => setProfile({...profile, monthlyIncome: Number(e.target.value)})}
                    required
                    style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0'}}
                  />
                </div>

                <div className="form-group">
                  <label>Account Type</label>
                  <input 
                    type="text"
                    value={currentUser?.accountType || 'individual'}
                    disabled
                    style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'not-allowed'}}
                  />
                  <small style={{color: '#64748b', fontSize: '12px'}}>Contact support to change account type</small>
                </div>

                {status && (
                  <div style={{
                    padding: '12px',
                    borderRadius: '8px',
                    background: status.includes('Error') ? '#fee2e2' : '#d1fae5',
                    color: status.includes('Error') ? '#991b1b' : '#065f46',
                    fontSize: '14px'
                  }}>
                    {status}
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={loading}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    padding: '14px',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: '600',
                    fontSize: '15px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.6 : 1
                  }}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="settings-panel">
              <h2>Preferences</h2>
              <p style={{color: '#64748b', marginBottom: '24px'}}>Customize your SpendWise experience</p>
              
              <div style={{display: 'flex', flexDirection: 'column', gap: '24px'}}>
                <div className="preference-item">
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <div>
                      <h4 style={{margin: 0, fontSize: '15px'}}>Currency</h4>
                      <p style={{margin: '4px 0 0 0', fontSize: '13px', color: '#64748b'}}>Default currency for all transactions</p>
                    </div>
                    <select 
                      value={preferences.currency}
                      onChange={e => setPreferences({...preferences, currency: e.target.value})}
                      style={{padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0'}}
                    >
                      <option value="INR">₹ INR</option>
                      <option value="USD">$ USD</option>
                      <option value="EUR">€ EUR</option>
                      <option value="GBP">£ GBP</option>
                    </select>
                  </div>
                </div>

                <div className="preference-item">
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <div>
                      <h4 style={{margin: 0, fontSize: '15px'}}>Language</h4>
                      <p style={{margin: '4px 0 0 0', fontSize: '13px', color: '#64748b'}}>Choose your preferred language</p>
                    </div>
                    <select 
                      value={preferences.language}
                      onChange={e => setPreferences({...preferences, language: e.target.value})}
                      style={{padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0'}}
                    >
                      <option value="en">English</option>
                      <option value="hi">हिन्दी</option>
                      <option value="mr">मराठी</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="settings-panel">
              <h2>Security</h2>
              <p style={{color: '#64748b', marginBottom: '24px'}}>Manage your password and security settings</p>
              
              <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
                <div className="form-group">
                  <label>Current Password</label>
                  <input 
                    type="password"
                    placeholder="Enter current password"
                    style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0'}}
                  />
                </div>

                <div className="form-group">
                  <label>New Password</label>
                  <input 
                    type="password"
                    placeholder="Enter new password"
                    style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0'}}
                  />
                </div>

                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input 
                    type="password"
                    placeholder="Confirm new password"
                    style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0'}}
                  />
                </div>

                <button 
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    padding: '14px',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: '600',
                    fontSize: '15px',
                    cursor: 'pointer'
                  }}
                  onClick={() => alert('Password change functionality coming soon!')}
                >
                  Update Password
                </button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="settings-panel">
              <h2>Notifications</h2>
              <p style={{color: '#64748b', marginBottom: '24px'}}>Control what notifications you receive</p>
              
              <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
                <div className="toggle-item" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: '#f8fafc', borderRadius: '8px'}}>
                  <div>
                    <h4 style={{margin: 0, fontSize: '15px'}}>Email Notifications</h4>
                    <p style={{margin: '4px 0 0 0', fontSize: '13px', color: '#64748b'}}>Receive email updates about your account</p>
                  </div>
                  <label className="toggle-switch">
                    <input 
                      type="checkbox"
                      checked={preferences.emailNotifications}
                      onChange={e => setPreferences({...preferences, emailNotifications: e.target.checked})}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="toggle-item" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: '#f8fafc', borderRadius: '8px'}}>
                  <div>
                    <h4 style={{margin: 0, fontSize: '15px'}}>Budget Alerts</h4>
                    <p style={{margin: '4px 0 0 0', fontSize: '13px', color: '#64748b'}}>Get notified when you exceed your budget</p>
                  </div>
                  <label className="toggle-switch">
                    <input 
                      type="checkbox"
                      checked={preferences.budgetAlerts}
                      onChange={e => setPreferences({...preferences, budgetAlerts: e.target.checked})}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'danger' && (
            <div className="settings-panel">
              <h2>Danger Zone</h2>
              <p style={{color: '#64748b', marginBottom: '24px'}}>Irreversible actions - proceed with caution</p>
              
              <div style={{
                padding: '24px',
                background: '#fef2f2',
                border: '2px solid #fca5a5',
                borderRadius: '12px'
              }}>
                <h3 style={{color: '#991b1b', fontSize: '16px', marginTop: 0}}>Delete Account</h3>
                <p style={{color: '#7f1d1d', fontSize: '14px', marginBottom: '16px'}}>
                  Once you delete your account, there is no going back. All your data including expenses, income, and investments will be permanently removed.
                </p>
                <button
                  onClick={handleDeleteAccount}
                  style={{
                    background: '#dc2626',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#b91c1c'}
                  onMouseLeave={e => e.currentTarget.style.background = '#dc2626'}
                >
                  Delete My Account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
