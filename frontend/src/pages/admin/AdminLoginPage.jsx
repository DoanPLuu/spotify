// src/pages/admin/AdminLoginPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styles/admin.css';
import { API_BASE_URL } from '../../config/constants';

const AdminLoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Xóa tokens cũ khi vào trang login
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminRefreshToken');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/accounts/admin/login/`, {  // Add /api prefix
        username,
        password
      });

      if (response.data.access) {
        localStorage.setItem('adminToken', response.data.access);
        if (response.data.refresh) {
          localStorage.setItem('adminRefreshToken', response.data.refresh);
        }
        navigate('/admin/dashboard');
      } else {
        setError('Invalid response from server');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.detail || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-auth-container">
      <div className="admin-auth-card">
        <div className="admin-auth-header">
          <h1>Admin Portal</h1>
        </div>
        <form className="admin-auth-form" onSubmit={handleSubmit}>
          {error && <div className="admin-login-error">{error}</div>}
          <div className="admin-form-group">
            <label htmlFor="admin-username">Username</label>
            <input
              id="admin-username"
              type="text"
              className="admin-input-field"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter admin username"
              required
            />
          </div>
          <div className="admin-form-group">
            <label htmlFor="admin-password">Password</label>
            <div className="admin-password-wrapper">
              <input
                id="admin-password"
                type="password"
                className="admin-input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                required
              />
              <button type="button" className="admin-toggle-password">
                <i className="fas fa-eye"></i>
              </button>
            </div>
          </div>
          <button 
            type="submit" 
            className="admin-submit-btn"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>
        <div className="admin-auth-footer">
          <p>This portal is for administrators only.</p>
          <p>
            If you're a regular user, please{" "}
            <a href="/login" className="admin-redirect-link">
              click here
            </a>{" "}
            to login.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
