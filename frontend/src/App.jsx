import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate, Outlet } from "react-router-dom";
import "./styles/App.css";
import "./styles/AuthStyles.css";
import Navbar from "./components/layout/Navbar";
import LeftSidebar from "./components/layout/LeftSidebar";
import RightSidebar from "./components/layout/RightSidebar";
import MainContent from "./components/content/MainContent";
import MusicPlayer from "./components/player/MusicPlayer";
import ModalManager from "./components/modals/ModalManager";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import TestPage from "./pages/TestPage";
import AlbumDetailPage from "./pages/AlbumDetailPage";
import CreateAlbumPage from "./pages/CreateAlbumPage";
// import EditAlbumPage from "./pages/EditAlbumPage";
import AlbumList from "./components/content/AlbumList";
import FavoriteSongs from "./components/content/FavoriteSongs";
import { isAuthenticated } from "./services/api";
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminArtists from "./pages/admin/AdminArtists";
import AdminAlbums from "./pages/admin/AdminAlbums";
import AdminSongs from "./pages/admin/AdminSongs";
import { API_BASE_URL } from "./config/constants";
import AdminLayout from './components/layout/AdminLayout';

// Component để xử lý redirect
const RedirectToLogin = () => {
  const navigate = useNavigate();
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
    } else {
      navigate("/home");
    }
  }, [navigate]);
  return null;
};

// Layout chung cho tất cả các trang đã đăng nhập
const AppLayout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div className="app">
      <div className="app-navbar">
        <Navbar />
      </div>
      <div className="main-container">
        <div className="sidebar left-sidebar">
          <LeftSidebar />
        </div>
        <div className="main-content">
          <Outlet />
        </div>
        <div className="sidebar right-sidebar">
          <RightSidebar />
        </div>
      </div>
      <div className="music-player">
        <MusicPlayer />
      </div>
      <ModalManager />
    </div>
  );
};

// Component trang chính
const HomePage = () => {
  return <MainContent />;
};

// Component trang album
const AlbumsPage = () => {
  return <AlbumList />;
};

// Component trang bài hát yêu thích
const FavoritesPage = () => {
  return <FavoriteSongs />;
};

// Component kiểm tra xác thực cho trang admin
const AdminAuthWrapper = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminAuth = async () => {
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) {
        navigate('/admin/login');
        return;
      }

      try {
        // Sửa lại URL verify token, thêm /api prefix
        const response = await fetch(`${API_BASE_URL}/api/token/verify/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: adminToken }),
        });

        if (!response.ok) {
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminRefreshToken');
          navigate('/admin/login');
        }
      } catch (error) {
        console.error('Token verification failed:', error);
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminRefreshToken');
        navigate('/admin/login');
      }
    };

    checkAdminAuth();
  }, [navigate]);

  return <Outlet />;
};

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Trang chính (home), chỉ hiển thị nếu đã đăng nhập */}
        <Route path="/" element={<RedirectToLogin />} />

        {/* Layout chung cho các trang đã đăng nhập */}
        <Route path="/" element={<AppLayout />}>
          <Route path="home" element={<HomePage />} />
          <Route path="albums" element={<AlbumsPage />} />
          <Route path="albums/create" element={<CreateAlbumPage />} />
          <Route path="albums/:id" element={<AlbumDetailPage />} />
          {/* <Route path="albums/:id/edit" element={<EditAlbumPage />} /> */}
          <Route path="favorites" element={<FavoritesPage />} />
        </Route>

        {/* Trang đăng nhập */}
        <Route path="/login" element={<LoginPage />} />
        {/* Trang đăng ký */}
        <Route path="/signup" element={<SignupPage />} />
        {/* Trang test */}
        <Route path="/test" element={<TestPage />} />

        {/* Add Admin Routes */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin" element={<AdminAuthWrapper />}>
          <Route element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="artists" element={<AdminArtists />} />
            <Route path="albums" element={<AdminAlbums />} />
            <Route path="songs" element={<AdminSongs />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
