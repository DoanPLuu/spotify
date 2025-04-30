
import axios from 'axios';
import { API_BASE_URL } from '../config/constants';

// Tạo axios instance với config mặc định
const adminApi = axios.create({
  baseURL: API_BASE_URL
});

// Add interceptor để tự động thêm token vào header
adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Thêm interceptor để xử lý response
adminApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Nếu lỗi 401 và chưa thử refresh token
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Thử refresh token
        const refreshToken = localStorage.getItem('adminRefreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/token/refresh/`, {
            refresh: refreshToken
          });
          
          const newToken = response.data.access;
          localStorage.setItem('adminToken', newToken);
          
          // Thử lại request ban đầu với token mới
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return adminApi(originalRequest);
        }
      } catch (refreshError) {
        // Nếu refresh token cũng hết hạn, chuyển về trang login
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminRefreshToken');
        window.location.href = '/admin/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Artists
export const getAdminArtists = async () => {
  try {
    const response = await adminApi.get('/api/admin/artists/');  // Add /api prefix
    return response.data;
  } catch (error) {
    console.error('Error fetching artists:', error);
    throw error;
  }
};

export const createArtist = async (formData) => {
  try {
    const response = await adminApi.post('/admin/artists/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating artist:', error);
    throw error;
  }
};

export const updateArtist = async (id, formData) => {
  try {
    const response = await adminApi.put(`/admin/artists/${id}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating artist:', error);
    throw error;
  }
};

export const deleteArtist = async (id) => {
  try {
    await adminApi.delete(`/admin/artists/${id}/`);
  } catch (error) {
    console.error('Error deleting artist:', error);
    throw error;
  }
};

// Albums
export const getAdminAlbums = async () => {
  try {
    const response = await adminApi.get('/api/admin/albums/');  // Add /api prefix
    return response.data;
  } catch (error) {
    console.error('Error fetching albums:', error);
    throw error;
  }
};

export const createAlbum = async (formData) => {
  try {
    const response = await adminApi.post('/admin/albums/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating album:', error);
    throw error;
  }
};

export const updateAlbum = async (id, formData) => {
  try {
    const response = await adminApi.put(`/admin/albums/${id}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating album:', error);
    throw error;
  }
};

export const deleteAlbum = async (id) => {
  try {
    await adminApi.delete(`/admin/albums/${id}/`);
  } catch (error) {
    console.error('Error deleting album:', error);
    throw error;
  }
};

// Songs
export const getAdminSongs = async () => {
  try {
    const response = await adminApi.get('/api/admin/songs/');  // Add /api prefix
    return response.data;
  } catch (error) {
    console.error('Error fetching songs:', error);
    throw error;
  }
};

export const createSong = async (formData) => {
  try {
    const response = await adminApi.post('/admin/songs/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating song:', error);
    throw error;
  }
};

export const updateSong = async (id, formData) => {
  try {
    const response = await adminApi.put(`/admin/songs/${id}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating song:', error);
    throw error;
  }
};

export const deleteSong = async (id) => {
  try {
    await adminApi.delete(`/admin/songs/${id}/`);
  } catch (error) {
    console.error('Error deleting song:', error);
    throw error;
  }
};

