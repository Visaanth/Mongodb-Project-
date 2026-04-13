import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiPhone, FiBook, FiHash, FiSave, FiLock, FiCamera } from 'react-icons/fi';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [activeTab, setActiveTab] = useState('profile');

  const [profileData, setProfileData] = useState({
    name: '', studentId: '', department: '', phone: '', avatar: null
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '', newPassword: '', confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({});

  // Load user data into form
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        studentId: user.studentId || '',
        department: user.department || '',
        phone: user.phone || '',
        avatar: null,
      });
      if (user.avatar) {
        setAvatarPreview(`http://localhost:5000${user.avatar}`);
      }
    }
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'avatar' && files[0]) {
      setProfileData({ ...profileData, avatar: files[0] });
      setAvatarPreview(URL.createObjectURL(files[0]));
    } else {
      setProfileData({ ...profileData, [name]: value });
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(profileData).forEach(([key, val]) => {
        if (val !== null && val !== undefined) data.append(key, val);
      });
      const { data: resData } = await API.put('/users/profile', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      updateUser(resData.user);
      toast.success('Profile updated successfully! ✅');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!passwordData.currentPassword) errors.currentPassword = 'Required';
    if (!passwordData.newPassword) errors.newPassword = 'Required';
    else if (passwordData.newPassword.length < 6) errors.newPassword = 'Min 6 characters';
    if (passwordData.newPassword !== passwordData.confirmPassword)
      errors.confirmPassword = 'Passwords do not match';

    if (Object.keys(errors).length > 0) { setPasswordErrors(errors); return; }

    setLoading(true);
    try {
      await API.put('/users/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success('Password changed successfully! 🔐');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordErrors({});
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const userInitial = user?.name?.charAt(0).toUpperCase();

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: 760 }}>
        {/* Profile Header Card */}
        <div className="profile-header">
          <div style={{ position: 'relative' }}>
            <div className="avatar-lg">
              {avatarPreview
                ? <img src={avatarPreview} alt={user?.name} />
                : userInitial}
            </div>
            {/* Avatar upload trigger */}
            <label style={{
              position: 'absolute', bottom: 0, right: 0,
              background: 'var(--accent-primary)', borderRadius: '50%',
              width: 28, height: 28, display: 'flex', alignItems: 'center',
              justifyContent: 'center', cursor: 'pointer', border: '2px solid var(--bg-card)'
            }}>
              <FiCamera size={13} color="white" />
              <input type="file" name="avatar" accept="image/*" onChange={handleProfileChange}
                style={{ display: 'none' }} />
            </label>
          </div>
          <div className="profile-info">
            <h2>{user?.name}</h2>
            <p>{user?.email}</p>
            <div className="profile-meta">
              {user?.studentId && (
                <span className="profile-meta-item">
                  <FiHash size={13} /> {user.studentId}
                </span>
              )}
              {user?.department && (
                <span className="profile-meta-item">
                  <FiBook size={13} /> {user.department}
                </span>
              )}
              {user?.phone && (
                <span className="profile-meta-item">
                  <FiPhone size={13} /> {user.phone}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', gap: '0.4rem', marginBottom: '1.5rem',
          background: 'var(--bg-secondary)', padding: '4px',
          borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)',
        }}>
          {[
            { key: 'profile', label: 'Edit Profile', icon: <FiUser size={14} /> },
            { key: 'password', label: 'Change Password', icon: <FiLock size={14} /> }
          ].map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`btn btn-sm ${activeTab === tab.key ? 'btn-primary' : 'btn-ghost'}`}
              style={{ flex: 1 }}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Profile Edit Form */}
        {activeTab === 'profile' && (
          <form onSubmit={handleProfileSubmit}>
            <div className="card">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label"><FiUser size={13} style={{ marginRight: 4 }} /> Full Name</label>
                  <input type="text" name="name" className="form-input"
                    value={profileData.name} onChange={handleProfileChange} />
                </div>
                <div className="form-group">
                  <label className="form-label"><FiHash size={13} style={{ marginRight: 4 }} /> Student ID</label>
                  <input type="text" name="studentId" className="form-input"
                    placeholder="e.g. STU2024001"
                    value={profileData.studentId} onChange={handleProfileChange} />
                </div>
                <div className="form-group">
                  <label className="form-label"><FiBook size={13} style={{ marginRight: 4 }} /> Department</label>
                  <input type="text" name="department" className="form-input"
                    placeholder="e.g. Computer Science"
                    value={profileData.department} onChange={handleProfileChange} />
                </div>
                <div className="form-group">
                  <label className="form-label"><FiPhone size={13} style={{ marginRight: 4 }} /> Phone Number</label>
                  <input type="tel" name="phone" className="form-input"
                    placeholder="+91 XXXXX XXXXX"
                    value={profileData.phone} onChange={handleProfileChange} />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '0.25rem' }}>
                <label className="form-label"><FiMail size={13} style={{ marginRight: 4 }} /> Email Address</label>
                <input type="email" className="form-input" value={user?.email} disabled
                  style={{ opacity: 0.5, cursor: 'not-allowed' }} />
                <small style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                  Email cannot be changed.
                </small>
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '0.5rem' }}>
                {loading
                  ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Saving...</>
                  : <><FiSave size={15} /> Save Changes</>
                }
              </button>
            </div>
          </form>
        )}

        {/* Change Password Form */}
        {activeTab === 'password' && (
          <form onSubmit={handlePasswordSubmit}>
            <div className="card">
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input type="password" className={`form-input ${passwordErrors.currentPassword ? 'input-error' : ''}`}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })} />
                {passwordErrors.currentPassword && <span className="error-text">{passwordErrors.currentPassword}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input type="password" className={`form-input ${passwordErrors.newPassword ? 'input-error' : ''}`}
                  placeholder="Min 6 characters"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} />
                {passwordErrors.newPassword && <span className="error-text">{passwordErrors.newPassword}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input type="password" className={`form-input ${passwordErrors.confirmPassword ? 'input-error' : ''}`}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} />
                {passwordErrors.confirmPassword && <span className="error-text">{passwordErrors.confirmPassword}</span>}
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading
                  ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Changing...</>
                  : <><FiLock size={15} /> Change Password</>
                }
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
