// src/pages/admin/AdminLoginPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '../../services/adminApi';
import { FaLock, FaUser, FaSpotify } from 'react-icons/fa';
import '../../styles/admin.css';

const AdminLoginPage = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Kiểm tra nếu đã đăng nhập thì chuyển hướng đến dashboard
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken) {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await adminLogin(credentials.username, credentials.password);
      localStorage.setItem('adminToken', response.access);
      localStorage.setItem('adminRefreshToken', response.refresh);
      navigate('/admin/dashboard');
    } catch (err) {
      setError('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-container">
        <div className="admin-login-logo">
          <h1><FaSpotify style={{ marginRight: '10px' }} />Admin</h1>
        </div>
        <div className="admin-login-form">
          <h2>Welcome Back</h2>
          {error && <div className="admin-login-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="admin-form-group">
              <label htmlFor="username">
                <FaUser /> Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={credentials.username}
                onChange={handleChange}
                required
                placeholder="Enter your username"
                autoComplete="username"
              />
            </div>
            <div className="admin-form-group">
              <label htmlFor="password">
                <FaLock /> Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
                autoComplete="current-password"
              />
            </div>
            <button 
              type="submit" 
              className="admin-btn admin-btn-primary admin-btn-block"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
