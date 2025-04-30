// src/pages/admin/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { getAdminArtists, getAdminAlbums, getAdminSongs } from '../../services/adminApi';
import '../../styles/admin.css'; // Thêm import CSS

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    artistCount: 0,
    albumCount: 0,
    songCount: 0,
    userCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentSongs, setRecentSongs] = useState([]);

  useEffect(() => {
    // Set page title dynamically
    const headerTitle = document.querySelector('.admin-page-title');
    if (headerTitle) {
      headerTitle.textContent = 'Dashboard';
    }

    // Function to fetch stats
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Use the adminApi service functions
        const [artists, albums, songs] = await Promise.all([
          getAdminArtists(),
          getAdminAlbums(),
          getAdminSongs()
        ]);

        // Set the stats
        setStats({
          artistCount: artists.length || 0,
          albumCount: albums.length || 0,
          songCount: songs.length || 0,
          userCount: 0 // Would need a separate endpoint for this
        });

        // Get the 5 most recent songs
        const sortedSongs = [...songs].sort((a, b) => 
          new Date(b.created_at) - new Date(a.created_at)
        ).slice(0, 5);
        
        setRecentSongs(sortedSongs);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="admin-dashboard">
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <h3>Total Artists</h3>
          <div className="admin-stat-value">{stats.artistCount}</div>
        </div>
        <div className="admin-stat-card">
          <h3>Total Albums</h3>
          <div className="admin-stat-value">{stats.albumCount}</div>
        </div>
        <div className="admin-stat-card">
          <h3>Total Songs</h3>
          <div className="admin-stat-value">{stats.songCount}</div>
        </div>
      </div>

      <div className="admin-recent-songs">
        <h2>Recent Songs</h2>
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Artist</th>
                <th>Album</th>
                <th>Added</th>
              </tr>
            </thead>
            <tbody>
              {recentSongs.map((song) => (
                <tr key={song.id}>
                  <td>{song.title}</td>
                  <td>{typeof song.artist === 'object' ? song.artist.name : song.artist}</td>
                  <td>{song.album ? song.album.name : '-'}</td>
                  <td>{new Date(song.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
