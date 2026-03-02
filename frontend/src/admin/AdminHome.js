import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchHomeSummary, fetchUserStats } from '../api';
import './Admin.css';

function AdminHome() {
  const [summary, setSummary] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([fetchHomeSummary(), fetchUserStats()])
      .then(([s, u]) => { setSummary(s); setUserStats(u); })
      .catch(err => setError(err.message || 'Failed to load dashboard data'));
  }, []);

  return (
    <section className="admin-panel">
      <h2>Admin Dashboard</h2>
      <p className="admin-subtitle">
        Real-time overview of the Smart Campus platform. Manage facilities, users, events, bookings, and more.
      </p>

      {error && <div className="alert alert-error">{error}</div>}

      {summary && (
        <>
          <h3 style={{ margin: '0 0 12px', color: '#334155' }}>Platform Metrics</h3>
          <div className="stats-grid">
            <div className="stat-card highlight">
              <p className="stat-number">{userStats?.total || 0}</p>
              <p className="stat-label">Total Users</p>
            </div>
            <div className="stat-card">
              <p className="stat-number">{summary.totalFacilities}</p>
              <p className="stat-label">Facilities</p>
            </div>
            <div className="stat-card">
              <p className="stat-number">{summary.totalBookings}</p>
              <p className="stat-label">Total Bookings</p>
            </div>
            <div className="stat-card warning">
              <p className="stat-number">{summary.pendingBookings}</p>
              <p className="stat-label">Pending Bookings</p>
            </div>
            <div className="stat-card highlight">
              <p className="stat-number">{summary.approvedBookings}</p>
              <p className="stat-label">Approved Bookings</p>
            </div>
            <div className="stat-card">
              <p className="stat-number">{summary.totalEvents}</p>
              <p className="stat-label">Campus Events</p>
            </div>
            <div className="stat-card">
              <p className="stat-number">{summary.activeServices}</p>
              <p className="stat-label">Active Services</p>
            </div>
            <div className="stat-card">
              <p className="stat-number">{summary.totalResources}</p>
              <p className="stat-label">Learning Resources</p>
            </div>
          </div>

          {userStats && (
            <>
              <h3 style={{ margin: '20px 0 12px', color: '#334155' }}>User Breakdown</h3>
              <div className="stats-grid">
                <div className="stat-card highlight">
                  <p className="stat-number">{userStats.activeUsers}</p>
                  <p className="stat-label">Active Accounts</p>
                </div>
                <div className="stat-card danger">
                  <p className="stat-number">{userStats.disabledUsers}</p>
                  <p className="stat-label">Disabled Accounts</p>
                </div>
                <div className="stat-card">
                  <p className="stat-number">{userStats.adminCount}</p>
                  <p className="stat-label">Admins</p>
                </div>
                <div className="stat-card">
                  <p className="stat-number">{userStats.staffCount}</p>
                  <p className="stat-label">Staff</p>
                </div>
                <div className="stat-card">
                  <p className="stat-number">{userStats.userCount}</p>
                  <p className="stat-label">Regular Users</p>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {!summary && !error && <p className="state-text">Loading dashboard data...</p>}

      <h3 style={{ margin: '24px 0 12px', color: '#334155' }}>Quick Actions</h3>
      <div className="quick-actions">
        <Link to="/admin/facilities" className="quick-action-card">
          <div className="quick-action-icon">🏢</div>
          <h3>Manage Facilities</h3>
          <p>Create, update, and manage bookable campus resources and equipment.</p>
        </Link>
        <Link to="/admin/users" className="quick-action-card">
          <div className="quick-action-icon">👥</div>
          <h3>Manage Users</h3>
          <p>View, search, assign roles, and manage all registered user accounts.</p>
        </Link>
        <Link to="/admin/bookings" className="quick-action-card">
          <div className="quick-action-icon">📅</div>
          <h3>Manage Bookings</h3>
          <p>Review, approve, or reject facility booking requests from users.</p>
        </Link>
        <Link to="/admin/events" className="quick-action-card">
          <div className="quick-action-icon">🎯</div>
          <h3>Manage Events</h3>
          <p>Create and manage campus events, workshops, and activities.</p>
        </Link>
        <Link to="/admin/services" className="quick-action-card">
          <div className="quick-action-icon">🛠️</div>
          <h3>Manage Services</h3>
          <p>Control campus service channels and their operational status.</p>
        </Link>
        <Link to="/admin/resources" className="quick-action-card">
          <div className="quick-action-icon">📚</div>
          <h3>Manage Resources</h3>
          <p>Maintain learning resources, digital tools, and academic materials.</p>
        </Link>
      </div>
    </section>
  );
}

export default AdminHome;
