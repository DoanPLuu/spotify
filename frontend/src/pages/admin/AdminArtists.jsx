import React, { useState, useEffect } from 'react';
import { getAdminArtists, createArtist, updateArtist, deleteArtist } from '../../services/adminApi';
import '../../styles/admin.css';

const AdminArtists = () => {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchArtists();
  }, []);

  const fetchArtists = async () => {
    try {
      setLoading(true);
      const data = await getAdminArtists();
      setArtists(data);
    } catch (err) {
      setError('Failed to fetch artists');
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

      if (selectedArtist) {
        await updateArtist(selectedArtist.id, formDataToSend);
      } else {
        await createArtist(formDataToSend);
      }

      setShowModal(false);
      setSelectedArtist(null);
      setFormData({ name: '', bio: '', image: null });
      setImagePreview(null);
      fetchArtists();
    } catch (err) {
      setError('Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this artist?')) {
      try {
        await deleteArtist(id);
        fetchArtists();
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
          <h1>Manage Artists</h1>
          <button 
            className="admin-btn admin-btn-primary"
            onClick={() => setShowModal(true)}
          >
            Add New Artist
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
                <th>Image</th>
                <th>Name</th>
                <th>Bio</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {artists.map(artist => (
                <tr key={artist.id}>
                  <td>
                    <img 
                      src={artist.image_url} 
                      alt={artist.name}
                      className="admin-image-preview"
                    />
                  </td>
                  <td>{artist.name}</td>
                  <td>{artist.bio}</td>
                  <td className="admin-action-buttons">
                    <button 
                      className="admin-btn admin-btn-secondary"
                      onClick={() => {
                        setSelectedArtist(artist);
                        setFormData({
                          name: artist.name,
                          bio: artist.bio,
                          image: null
                        });
                        setImagePreview(artist.image_url);
                        setShowModal(true);
                      }}
                    >
                      Edit
                    </button>
                    <button 
                      className="admin-btn admin-btn-danger"
                      onClick={() => handleDelete(artist.id)}
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
                  {selectedArtist ? 'Edit Artist' : 'Add New Artist'}
                </h2>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="admin-form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label>Bio</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows="4"
                  />
                </div>

                <div className="admin-form-group">
                  <label>Image</label>
                  <input
                    type="file"
                    name="image"
                    onChange={handleInputChange}
                    accept="image/*"
                    required={!selectedArtist}
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
                      setSelectedArtist(null);
                      setFormData({ name: '', bio: '', image: null });
                      setImagePreview(null);
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="admin-btn admin-btn-primary"
                  >
                    {selectedArtist ? 'Update' : 'Add'} Artist
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

export default AdminArtists;
