import React, { useState, useEffect } from 'react';
import { getAdminAlbums, deleteAlbum, createAlbum, updateAlbum } from '../../services/adminApi';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

const AdminAlbums = () => {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAlbums();
  }, []);

  const fetchAlbums = async () => {
    try {
      setLoading(true);
      const data = await getAdminAlbums();
      setAlbums(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching albums:', error);
      setError('Failed to load albums');
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this album?')) {
      try {
        await deleteAlbum(id);
        setAlbums(albums.filter(album => album.id !== id));
      } catch (error) {
        console.error('Error deleting album:', error);
        setError('Failed to delete album');
      }
    }
  };

  if (loading) {
    return (
      <div className="admin-content">
        <h1>Albums</h1>
        <div className="admin-loading">Loading albums...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-content">
        <h1>Albums</h1>
        <div className="admin-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="admin-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Albums</h1>
        <button className="admin-add-btn">
          <FaPlus /> Add New Album
        </button>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>TITLE</th>
              <th>ARTIST</th>
              <th>RELEASE DATE</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {albums.map(album => (
              <tr key={album.id}>
                <td>{album.title}</td>
                <td>{album.artist_name}</td>
                <td>{new Date(album.release_date).toLocaleDateString()}</td>
                <td>
                  <div className="admin-action-buttons">
                    <button className="admin-action-btn admin-edit-btn">Edit</button>
                    <button 
                      className="admin-action-btn admin-delete-btn"
                      onClick={() => handleDelete(album.id)}
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

export default AdminAlbums;
