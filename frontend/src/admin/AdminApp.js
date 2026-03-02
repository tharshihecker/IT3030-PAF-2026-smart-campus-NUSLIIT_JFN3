import React, { useMemo, useState } from 'react';
import { NavLink, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import FacilitiesAdmin from './FacilitiesAdmin';
import AdminHome from './AdminHome';
import AdminLogin from './AdminLogin';
import ManageUsers from './ManageUsers';
import ManageEvents from './ManageEvents';
import ManageServices from './ManageServices';
import ManageResources from './ManageResources';
import ManageBookings from './ManageBookings';
import '../App.css';

const ADMIN_AUTH_KEY = 'smartcampus_admin_auth';

function ProtectedAdminRoute({ isAuthenticated, children }) {
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
}

function AdminTopNav({ isAuthenticated, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className="top-nav">
      <div className="brand-block">
        <div className="brand-dot" />
        <div>
          <p className="brand-kicker">Smart Campus Platform</p>
          <h1>NUSLIIT Admin Portal</h1>
        </div>
      </div>

      <nav className="nav-links">
        {isAuthenticated ? (
          <>
            <NavLink to="/admin/home" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Dashboard
            </NavLink>
            <NavLink to="/admin/facilities" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Facilities
            </NavLink>
            <NavLink to="/admin/bookings" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Bookings
            </NavLink>
            <NavLink to="/admin/users" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Users
            </NavLink>
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                className="nav-link"
                onClick={() => setMenuOpen(!menuOpen)}
                style={{ cursor: 'pointer' }}
              >
                More ▾
              </button>
              {menuOpen && (
                <div style={{
                  position: 'absolute', top: '100%', right: 0, background: '#fff', border: '1px solid #e2e8f0',
                  borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', zIndex: 50, minWidth: '160px', padding: '6px 0'
                }}>
                  <NavLink to="/admin/events" className="nav-link" onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '8px 16px' }}>Events</NavLink>
                  <NavLink to="/admin/services" className="nav-link" onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '8px 16px' }}>Services</NavLink>
                  <NavLink to="/admin/resources" className="nav-link" onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '8px 16px' }}>Resources</NavLink>
                </div>
              )}
            </div>
            <button type="button" className="nav-button" onClick={onLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <NavLink to="/admin/login" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Admin Login
            </NavLink>
            <NavLink to="/" className="nav-link">
              User Site
            </NavLink>
          </>
        )}
      </nav>
    </header>
  );
}

function AdminApp() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem(ADMIN_AUTH_KEY) === 'true');

  const authApi = useMemo(
    () => ({
      login: () => {
        localStorage.setItem(ADMIN_AUTH_KEY, 'true');
        setIsAuthenticated(true);
      },
      logout: () => {
        localStorage.removeItem(ADMIN_AUTH_KEY);
        setIsAuthenticated(false);
        navigate('/admin/login');
      },
    }),
    [navigate]
  );

  const protectedRoute = (Component) => (
    <ProtectedAdminRoute isAuthenticated={isAuthenticated}>
      <Component />
    </ProtectedAdminRoute>
  );

  return (
    <div className="app-page">
      <AdminTopNav isAuthenticated={isAuthenticated} onLogout={authApi.logout} />
      <main className="page-body">
        <Routes>
          <Route path="/" element={<Navigate to={isAuthenticated ? '/admin/home' : '/admin/login'} replace />} />
          <Route path="/login" element={<AdminLogin onLoginSuccess={authApi.login} />} />
          <Route path="/home" element={protectedRoute(AdminHome)} />
          <Route path="/facilities" element={protectedRoute(FacilitiesAdmin)} />
          <Route path="/users" element={protectedRoute(ManageUsers)} />
          <Route path="/bookings" element={protectedRoute(ManageBookings)} />
          <Route path="/events" element={protectedRoute(ManageEvents)} />
          <Route path="/services" element={protectedRoute(ManageServices)} />
          <Route path="/resources" element={protectedRoute(ManageResources)} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default AdminApp;
