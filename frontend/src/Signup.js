import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signup } from './api';
import './Signup.css';

function Signup() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const result = await signup(form);
      setIsError(false);
      setMessage(result);
      setTimeout(() => navigate('/login'), 900);
    } catch (err) {
      setIsError(true);
      setMessage(err.message || 'Signup failed');
    }
  };

  return (
    <section className="auth-panel">
      <h2>Create Your Account</h2>
      <p className="auth-subtitle">Sign up to use smart campus services from one place.</p>
      <form onSubmit={handleSubmit} className="auth-form">
        <input name="username" type="text" placeholder="Username" value={form.username} onChange={handleChange} required />
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
        <button type="submit">Sign Up</button>
      </form>
      {message && <p className={`auth-message ${isError ? 'error' : 'success'}`}>{message}</p>}
      <p className="auth-switch">
        Already registered? <Link to="/login">Go to login</Link>
      </p>
    </section>
  );
}

export default Signup;
