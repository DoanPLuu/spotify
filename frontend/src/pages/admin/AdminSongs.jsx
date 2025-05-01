import React, { useState, useEffect } from 'react';
import { getAdminSongs, deleteSong, createSong, updateSong } from '../../services/adminApi';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

const AdminSongs = () => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSongs();
  }, []);

  const fetchSongs = async () => {
    try {
      setLoading(true);
      const data = await getAdminSongs();
      setSongs(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching songs:', error);
      setError('Failed to load songs');
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this song?')) {
      try {
        await deleteSong(id);
        setSongs(songs.filter(song => song.id !== id));
      } catch (error) {
        console.error('Error deleting song:', error);
        setError('Failed to delete song');
      }
    }
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="admin-content">
        <h1>Songs</h1>
        <div className="admin-loading">Loading songs...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-content">
        <h1>Songs</h1>
        <div className="admin-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="admin-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Songs</h1>
        <button className="admin-add-btn">
          <FaPlus /> Add New Song
        </button>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>TITLE</th>
              <th>ARTIST</th>
              <th>ALBUM</th>
              <th>DURATION</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {songs.map(song => (
              <tr key={song.id}>
                <td>{song.title}</td>
                <td>{song.artist_name}</td>
                <td>{song.album_title || 'N/A'}</td>
                <td>{formatDuration(song.duration)}</td>
                <td>
                  <div className="admin-action-buttons">
                    <button className="admin-action-btn admin-edit-btn">Edit</button>
                    <button 
                      className="admin-action-btn admin-delete-btn"
                      onClick={() => handleDelete(song.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminSongs;
