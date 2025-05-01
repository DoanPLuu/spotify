import React from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { FaHome, FaMusic, FaCompactDisc, FaUserAlt, FaSignOutAlt } from 'react-icons/fa';
import '../../styles/admin.css';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminRefreshToken');
    navigate('/admin/login');
  };

  return (
    <div className="admin-layout">
      <div className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h2>Music Admin</h2>
        </div>
        <nav className="admin-nav">
          <ul>
            <li className={location.pathname === '/admin/dashboard' ? 'active' : ''}>
              <Link to="/admin/dashboard">
                <FaHome /> Dashboard
              </Link>
            </li>
            <li className={location.pathname === '/admin/artists' ? 'active' : ''}>
              <Link to="/admin/artists">
                <FaUserAlt /> Artists
              </Link>
            </li>
            <li className={location.pathname === '/admin/albums' ? 'active' : ''}>
              <Link to="/admin/albums">
                <FaCompactDisc /> Albums
              </Link>
            </li>
            <li className={location.pathname === '/admin/songs' ? 'active' : ''}>
              <Link to="/admin/songs">
                <FaMusic /> Songs
              </Link>
            </li>
          </ul>
        </nav>
        <div className="admin-sidebar-footer">
          <button onClick={handleLogout} className="admin-logout-btn">
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </div>
      <div className="admin-main">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
