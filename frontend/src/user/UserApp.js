import React, { useMemo, useState } from 'react';
import { NavLink, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import Signup from './Signup';
import Login from './Login';
import Home from './Home';
import Landing from './Landing';
import Events from './Events';
import Resources from './Resources';
import Services from './Services';
import Facilities from './Facilities';
import Profile from './Profile';
import MyBookings from './MyBookings';
import '../App.css';

const USER_AUTH_KEY = 'smartcampus_user_auth';

function ProtectedRoute({ isAuthenticated, children }) {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function UserTopNav({ isAuthenticated, onLogout }) {
  const username = localStorage.getItem('smartcampus_username');
  const fullName = localStorage.getItem('smartcampus_user_fullname');
  const displayName = fullName || username || '';

  return (
    <header className="top-nav">
      <div className="brand-block">
        <div className="brand-dot" />
        <div>
          <p className="brand-kicker">Smart Campus Platform</p>
          <h1>NUSLIIT PAF Portal</h1>
        </div>
      </div>

      <nav className="nav-links">
        {isAuthenticated ? (
          <>
            <NavLink to="/home" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Home
            </NavLink>
            <NavLink to="/events" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Events
            </NavLink>
            <NavLink to="/resources" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Resources
            </NavLink>
            <NavLink to="/facilities" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Facilities
            </NavLink>
            <NavLink to="/services" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Services
            </NavLink>
            <NavLink to="/my-bookings" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              My Bookings
            </NavLink>
            <NavLink to="/profile" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              {displayName ? `👤 ${displayName}` : 'Profile'}
            </NavLink>
            <button type="button" className="nav-button" onClick={onLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Overview
            </NavLink>
            <NavLink to="/login" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Login
            </NavLink>
            <NavLink to="/signup" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Signup
            </NavLink>
          </>
        )}
      </nav>
    </header>
  );
}

function UserApp() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem(USER_AUTH_KEY) === 'true');

  const authApi = useMemo(
    () => ({
      login: () => {
        localStorage.setItem(USER_AUTH_KEY, 'true');
        setIsAuthenticated(true);
      },
      logout: () => {
        /* Clear all user session data */
        localStorage.removeItem(USER_AUTH_KEY);
        localStorage.removeItem('smartcampus_user_id');
        localStorage.removeItem('smartcampus_username');
        localStorage.removeItem('smartcampus_user_email');
        localStorage.removeItem('smartcampus_user_role');
        localStorage.removeItem('smartcampus_user_fullname');
        localStorage.removeItem('smartcampus_user_department');
        setIsAuthenticated(false);
        navigate('/login');
      },
    }),
    [navigate]
  );

  const protectedRoute = (component) => (
    <ProtectedRoute isAuthenticated={isAuthenticated}>{component}</ProtectedRoute>
  );

  return (
    <div className="app-page">
      <UserTopNav isAuthenticated={isAuthenticated} onLogout={authApi.logout} />
      <main className="page-body">
        <Routes>
          <Route path="/" element={isAuthenticated ? <Navigate to="/home" replace /> : <Landing />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login onLoginSuccess={authApi.login} />} />
          <Route path="/home" element={protectedRoute(<Home />)} />
          <Route path="/events" element={protectedRoute(<Events />)} />
          <Route path="/resources" element={protectedRoute(<Resources />)} />
          <Route path="/services" element={protectedRoute(<Services />)} />
          <Route path="/facilities" element={protectedRoute(<Facilities />)} />
          <Route path="/profile" element={protectedRoute(<Profile />)} />
          <Route path="/my-bookings" element={protectedRoute(<MyBookings />)} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default UserApp;
