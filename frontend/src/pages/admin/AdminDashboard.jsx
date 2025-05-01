import React, { useState, useEffect } from 'react';
import { getAdminArtists, getAdminAlbums, getAdminSongs } from '../../services/adminApi';
import '../../styles/admin.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    artists: 0,
    albums: 0,
    songs: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Fetch data from API
        const artists = await getAdminArtists();
        const albums = await getAdminAlbums();
        const songs = await getAdminSongs();
        
        // Update stats
        setStats({
          artists: artists.length,
          albums: albums.length,
          songs: songs.length
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        setError('Failed to load dashboard data');
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="admin-content">
        <h1>Dashboard</h1>
        <div className="admin-loading">Loading dashboard data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-content">
        <h1>Dashboard</h1>
        <div className="admin-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="admin-content">
      <h1>Dashboard</h1>
      
      <div className="admin-stats-container">
        <div className="admin-stat-card">
          <h3>Artists</h3>
          <div className="admin-stat-value">{stats.artists}</div>
          <a href="/admin/artists" className="admin-stat-link">View All</a>
        </div>
        
        <div className="admin-stat-card">
          <h3>Albums</h3>
          <div className="admin-stat-value">{stats.albums}</div>
          <a href="/admin/albums" className="admin-stat-link">View All</a>
        </div>
        
        <div className="admin-stat-card">
          <h3>Songs</h3>
          <div className="admin-stat-value">{stats.songs}</div>
          <a href="/admin/songs" className="admin-stat-link">View All</a>
        </div>
      </div>
      
      <div className="admin-recent-activity">
        <h2>Recent Activity</h2>
        <p>This is where recent activity would be displayed.</p>
      </div>
    </div>
  );
};

export default AdminDashboard;
