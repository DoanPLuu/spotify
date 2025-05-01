import React, { useState, useEffect } from 'react';
import { getAdminArtists, deleteArtist, createArtist, updateArtist } from '../../services/adminApi';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

const AdminArtists = () => {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchArtists();
  }, []);

  const fetchArtists = async () => {
    try {
      setLoading(true);
      const data = await getAdminArtists();
      setArtists(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching artists:', error);
      setError('Failed to load artists');
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this artist?')) {
      try {
        await deleteArtist(id);
        setArtists(artists.filter(artist => artist.id !== id));
      } catch (error) {
        console.error('Error deleting artist:', error);
        setError('Failed to delete artist');
      }
    }
  };

  if (loading) {
    return (
      <div className="admin-content">
        <h1>Artists</h1>
        <div className="admin-loading">Loading artists...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-content">
        <h1>Artists</h1>
        <div className="admin-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="admin-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Artists</h1>
        <button className="admin-add-btn">
          <FaPlus /> Add New Artist
        </button>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>NAME</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {artists.map(artist => (
              <tr key={artist.id}>
                <td>{artist.name}</td>
                <td>
                  <div className="admin-action-buttons">
                    <button className="admin-action-btn admin-edit-btn">Edit</button>
                    <button 
                      className="admin-action-btn admin-delete-btn"
                      onClick={() => handleDelete(artist.id)}
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

export default AdminArtists;
