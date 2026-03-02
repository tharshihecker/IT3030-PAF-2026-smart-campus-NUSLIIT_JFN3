import React, { useCallback, useEffect, useState } from 'react';
import { fetchProfile, updateProfile, changePassword } from '../api';
import './Profile.css';

function Profile() {
  const userId = localStorage.getItem('smartcampus_user_id');

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  /* Edit mode */
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saveMsg, setSaveMsg] = useState({ type: '', text: '' });
  const [saving, setSaving] = useState(false);

  /* Password change */
  const [showPwdForm, setShowPwdForm] = useState(false);
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwdMsg, setPwdMsg] = useState({ type: '', text: '' });
  const [pwdSaving, setPwdSaving] = useState(false);

  const loadProfile = useCallback(() => {
    if (!userId) {
      setError('User session not found. Please log in again.');
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchProfile(userId)
      .then(data => {
        setProfile(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Failed to load profile');
        setLoading(false);
      });
  }, [userId]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  /* ── Edit handlers ── */
  const startEditing = () => {
    setEditForm({
      fullName: profile.fullName || '',
      email: profile.email || '',
      phone: profile.phone || '',
      department: profile.department || '',
      bio: profile.bio || '',
    });
    setSaveMsg({ type: '', text: '' });
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
    setSaveMsg({ type: '', text: '' });
  };

  const handleEditChange = e => {
    setEditForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSaveProfile = async e => {
    e.preventDefault();
    setSaving(true);
    setSaveMsg({ type: '', text: '' });
    try {
      const updated = await updateProfile(userId, editForm);
      setProfile(updated);
      /* Keep localStorage in sync */
      localStorage.setItem('smartcampus_user_fullname', updated.fullName || '');
      localStorage.setItem('smartcampus_user_email', updated.email || '');
      localStorage.setItem('smartcampus_user_department', updated.department || '');
      setSaveMsg({ type: 'success', text: 'Profile updated successfully!' });
      setEditing(false);
    } catch (err) {
      setSaveMsg({ type: 'error', text: err.message || 'Failed to save profile' });
    } finally {
      setSaving(false);
    }
  };

  /* ── Password handlers ── */
  const handlePwdChange = e => {
    setPwdForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePasswordSubmit = async e => {
    e.preventDefault();
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      setPwdMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (pwdForm.newPassword.length < 4) {
      setPwdMsg({ type: 'error', text: 'New password must be at least 4 characters.' });
      return;
    }
    setPwdSaving(true);
    setPwdMsg({ type: '', text: '' });
    try {
      await changePassword(userId, {
        currentPassword: pwdForm.currentPassword,
        newPassword: pwdForm.newPassword,
      });
      setPwdMsg({ type: 'success', text: 'Password changed successfully!' });
      setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPwdForm(false);
    } catch (err) {
      setPwdMsg({ type: 'error', text: err.message || 'Failed to change password' });
    } finally {
      setPwdSaving(false);
    }
  };

  /* ── Render ── */
  if (loading) return <section className="profile-shell"><p className="state-text">Loading profile...</p></section>;
  if (error) return <section className="profile-shell"><p className="state-text error">{error}</p></section>;
  if (!profile) return <section className="profile-shell"><p className="state-text">No profile data.</p></section>;

  return (
    <section className="profile-shell">
      <h2>My Profile</h2>
      <p className="profile-subtitle">View and manage your campus account information.</p>

      {saveMsg.text && <div className={`profile-alert ${saveMsg.type}`}>{saveMsg.text}</div>}

      {/* ── Profile Info Card ── */}
      <div className="profile-card">
        <h3>
          <span className="card-icon">👤</span>
          Personal Information
          {!editing && <button type="button" className="btn-edit-trigger" onClick={startEditing}>Edit Profile</button>}
        </h3>

        {!editing ? (
          <div className="profile-info-grid">
            <div className="profile-info-item">
              <span className="info-label">Username</span>
              <span className="info-value">{profile.username}</span>
            </div>
            <div className="profile-info-item">
              <span className="info-label">Full Name</span>
              <span className={`info-value ${!profile.fullName ? 'muted' : ''}`}>{profile.fullName || 'Not set'}</span>
            </div>
            <div className="profile-info-item">
              <span className="info-label">Email</span>
              <span className={`info-value ${!profile.email ? 'muted' : ''}`}>{profile.email || 'Not set'}</span>
            </div>
            <div className="profile-info-item">
              <span className="info-label">Phone</span>
              <span className={`info-value ${!profile.phone ? 'muted' : ''}`}>{profile.phone || 'Not set'}</span>
            </div>
            <div className="profile-info-item">
              <span className="info-label">Department</span>
              <span className={`info-value ${!profile.department ? 'muted' : ''}`}>{profile.department || 'Not set'}</span>
            </div>
            <div className="profile-info-item">
              <span className="info-label">Role</span>
              <span className="info-value"><span className={`role-badge ${profile.role}`}>{profile.role}</span></span>
            </div>
            <div className="profile-info-item full-width">
              <span className="info-label">Bio</span>
              <span className={`info-value ${!profile.bio ? 'muted' : ''}`}>{profile.bio || 'No bio provided'}</span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSaveProfile} className="profile-form">
            <div className="profile-form-row">
              <label>
                Full Name
                <input name="fullName" value={editForm.fullName} onChange={handleEditChange} placeholder="Enter your full name" />
              </label>
              <label>
                Email
                <input name="email" type="email" value={editForm.email} onChange={handleEditChange} placeholder="your@email.com" />
              </label>
            </div>
            <div className="profile-form-row">
              <label>
                Phone
                <input name="phone" value={editForm.phone} onChange={handleEditChange} placeholder="+94 xxx xxx xxxx" />
              </label>
              <label>
                Department
                <input name="department" value={editForm.department} onChange={handleEditChange} placeholder="e.g. Computer Science" />
              </label>
            </div>
            <label>
              Bio
              <textarea name="bio" value={editForm.bio} onChange={handleEditChange} placeholder="Tell us about yourself..." rows={3} />
            </label>
            <div className="profile-form-actions">
              <button type="submit" className="btn-profile primary" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
              <button type="button" className="btn-profile secondary" onClick={cancelEditing}>Cancel</button>
            </div>
          </form>
        )}
      </div>

      {/* ── Security Card ── */}
      <div className="profile-card">
        <h3>
          <span className="card-icon">🔒</span>
          Security
        </h3>

        {pwdMsg.text && <div className={`profile-alert ${pwdMsg.type}`}>{pwdMsg.text}</div>}

        {!showPwdForm ? (
          <div>
            <p style={{ marginBottom: '1rem', color: '#666' }}>Keep your account secure by using a strong password.</p>
            <button type="button" className="btn-profile primary" onClick={() => { setShowPwdForm(true); setPwdMsg({ type: '', text: '' }); }}>
              Change Password
            </button>
          </div>
        ) : (
          <form onSubmit={handlePasswordSubmit} className="profile-form password-section">
            <label>
              Current Password
              <input name="currentPassword" type="password" value={pwdForm.currentPassword} onChange={handlePwdChange} required autoComplete="current-password" />
            </label>
            <div className="profile-form-row">
              <label>
                New Password
                <input name="newPassword" type="password" value={pwdForm.newPassword} onChange={handlePwdChange} required autoComplete="new-password" />
              </label>
              <label>
                Confirm New Password
                <input name="confirmPassword" type="password" value={pwdForm.confirmPassword} onChange={handlePwdChange} required autoComplete="new-password" />
              </label>
            </div>
            <div className="profile-form-actions">
              <button type="submit" className="btn-profile primary" disabled={pwdSaving}>{pwdSaving ? 'Changing...' : 'Update Password'}</button>
              <button type="button" className="btn-profile secondary" onClick={() => { setShowPwdForm(false); setPwdMsg({ type: '', text: '' }); }}>Cancel</button>
            </div>
          </form>
        )}
      </div>

      {/* ── Account Details Card ── */}
      <div className="profile-card">
        <h3>
          <span className="card-icon">📋</span>
          Account Details
        </h3>
        <div className="account-meta">
          <span>🆔 User ID: <strong>{profile.id}</strong></span>
          {profile.createdAt && <span>📅 Joined: <strong>{new Date(profile.createdAt).toLocaleDateString()}</strong></span>}
          {profile.updatedAt && <span>✏️ Last Updated: <strong>{new Date(profile.updatedAt).toLocaleDateString()}</strong></span>}
          <span>✅ Status: <strong>{profile.enabled !== false ? 'Active' : 'Disabled'}</strong></span>
        </div>
      </div>
    </section>
  );
}

export default Profile;
