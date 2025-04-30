import React, { useState, useEffect } from 'react';
import { getAdminAlbums, createAlbum, updateAlbum, deleteAlbum } from '../../services/adminApi';
import '../../styles/admin.css';

const AdminAlbums = () => {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    release_date: '',
    cover_image: null
  });
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchAlbums();
  }, []);

  const fetchAlbums = async () => {
    try {
      setLoading(true);
      const data = await getAdminAlbums();
      setAlbums(data);
    } catch (err) {
      setError('Failed to fetch albums');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData({
        ...formData,
        [name]: files[0]
      });
      setImagePreview(URL.createObjectURL(files[0]));
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          formDataToSend.append(key, formData[key]);
        }
      });

      if (selectedAlbum) {
        await updateAlbum(selectedAlbum.id, formDataToSend);
      } else {
        await createAlbum(formDataToSend);
      }

      setShowModal(false);
      setSelectedAlbum(null);
      setFormData({ title: '', artist: '', release_date: '', cover_image: null });
      setImagePreview(null);
      fetchAlbums();
    } catch (err) {
      setError('Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this album?')) {
      try {
        await deleteAlbum(id);
        fetchAlbums();
      } catch (err) {
        setError('Delete failed');
      }
    }
  };

  if (loading) {
    return <div className="admin-loading">Loading...</div>;
  }

  return (
    <div className="admin-layout">
      <div className="admin-container">
        <div className="admin-header">
          <h1>Manage Albums</h1>
          <button 
            className="admin-btn admin-btn-primary"
            onClick={() => setShowModal(true)}
          >
            Add New Album
          </button>
        </div>

        {error && (
          <div className="admin-message admin-message-error">
            {error}
          </div>
        )}

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Cover</th>
                <th>Title</th>
                <th>Artist</th>
                <th>Release Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {albums.map(album => (
                <tr key={album.id}>
                  <td>
                    <img 
                      src={album.cover_image_url} 
                      alt={album.title}
                      className="admin-image-preview"
                    />
                  </td>
                  <td>{album.title}</td>
                  <td>{album.artist?.name}</td>
                  <td>{new Date(album.release_date).toLocaleDateString()}</td>
                  <td className="admin-action-buttons">
                    <button 
                      className="admin-btn admin-btn-secondary"
                      onClick={() => {
                        setSelectedAlbum(album);
                        setFormData({
                          title: album.title,
                          artist: album.artist?.id,
                          release_date: album.release_date,
                          cover_image: null
                        });
                        setImagePreview(album.cover_image_url);
                        setShowModal(true);
                      }}
                    >
                      Edit
                    </button>
                    <button 
                      className="admin-btn admin-btn-danger"
                      onClick={() => handleDelete(album.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showModal && (
          <div className="admin-modal-overlay">
            <div className="admin-modal">
              <div className="admin-modal-header">
                <h2 className="admin-modal-title">
                  {selectedAlbum ? 'Edit Album' : 'Add New Album'}
                </h2>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="admin-form-group">
                  <label>Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label>Artist</label>
                  <input
                    type="text"
                    name="artist"
                    value={formData.artist}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label>Release Date</label>
                  <input
                    type="date"
                    name="release_date"
                    value={formData.release_date}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label>Cover Image</label>
                  <input
                    type="file"
                    name="cover_image"
                    onChange={handleInputChange}
                    accept="image/*"
                    required={!selectedAlbum}
                  />
                  {imagePreview && (
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="admin-image-preview"
                    />
                  )}
                </div>

                <div className="admin-modal-actions">
                  <button 
                    type="button" 
                    className="admin-btn admin-btn-secondary"
                    onClick={() => {
                      setShowModal(false);
                      setSelectedAlbum(null);
                      setFormData({ title: '', artist: '', release_date: '', cover_image: null });
                      setImagePreview(null);
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="admin-btn admin-btn-primary"
                  >
                    {selectedAlbum ? 'Update' : 'Add'} Album
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAlbums;
