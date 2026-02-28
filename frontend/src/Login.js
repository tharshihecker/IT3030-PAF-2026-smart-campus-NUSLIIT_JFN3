import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from './api';
import './Login.css';

function Login({ onLoginSuccess }) {
  const [form, setForm] = useState({ username: '', password: '' });
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const result = await login(form);
      setIsError(false);
      setMessage(result);
      onLoginSuccess();
      navigate('/home');
    } catch (err) {
      setIsError(true);
      setMessage(err.message || 'Login failed');
    }
  };

  return (
    <section className="auth-panel">
      <h2>Welcome Back</h2>
      <p className="auth-subtitle">Login to access your personalized campus dashboard.</p>
      <form onSubmit={handleSubmit} className="auth-form">
        <input name="username" type="text" placeholder="Username" value={form.username} onChange={handleChange} required />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
        <button type="submit">Login</button>
      </form>
      {message && <p className={`auth-message ${isError ? 'error' : 'success'}`}>{message}</p>}
      <p className="auth-switch">
        New here? <Link to="/signup">Create an account</Link>
      </p>
    </section>
  );
}

export default Login;
