import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../user/Login.css';

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';

function AdminLogin({ onLoginSuccess }) {
  const [form, setForm] = useState({ username: '', password: '' });
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();

  const handleChange = event => {
    const { name, value } = event.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = event => {
    event.preventDefault();
    const username = form.username.trim();
    const password = form.password;

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setIsError(false);
      setMessage('Admin login successful');
      onLoginSuccess();
      navigate('/admin/home');
      return;
    }

    setIsError(true);
    setMessage('Invalid admin credentials');
  };

  return (
    <section className="auth-panel">
      <h2>Admin Login</h2>
      <p className="auth-subtitle">Access the admin console to manage campus details and facilities.</p>
      <form onSubmit={handleSubmit} className="auth-form">
        <input name="username" type="text" placeholder="Admin username" value={form.username} onChange={handleChange} required />
        <input name="password" type="password" placeholder="Admin password" value={form.password} onChange={handleChange} required />
        <button type="submit">Login as Admin</button>
      </form>
      {message && <p className={`auth-message ${isError ? 'error' : 'success'}`}>{message}</p>}
    </section>
  );
}

export default AdminLogin;
