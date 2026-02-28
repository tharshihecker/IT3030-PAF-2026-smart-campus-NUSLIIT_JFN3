import React, { useMemo, useState } from 'react';
import { BrowserRouter as Router, NavLink, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import Signup from './Signup';
import Login from './Login';
import Home from './Home';
import Landing from './Landing';
import Events from './Events';
import Resources from './Resources';
import Services from './Services';
import './App.css';

function ProtectedRoute({ isAuthenticated, children }) {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function TopNav({ isAuthenticated, onLogout }) {
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
            <NavLink to="/services" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Services
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

function AppContent() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem('smartcampus_auth') === 'true');

  const authApi = useMemo(
    () => ({
      login: () => {
        localStorage.setItem('smartcampus_auth', 'true');
        setIsAuthenticated(true);
      },
      logout: () => {
        localStorage.removeItem('smartcampus_auth');
        setIsAuthenticated(false);
        navigate('/login');
      },
    }),
    [navigate]
  );

  return (
    <div className="app-page">
      <TopNav isAuthenticated={isAuthenticated} onLogout={authApi.logout} />
      <main className="page-body">
        <Routes>
          <Route path="/" element={isAuthenticated ? <Navigate to="/home" replace /> : <Landing />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login onLoginSuccess={authApi.login} />} />
          <Route
            path="/home"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/events"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Events />
              </ProtectedRoute>
            }
          />
          <Route
            path="/resources"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Resources />
              </ProtectedRoute>
            }
          />
          <Route
            path="/services"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Services />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
