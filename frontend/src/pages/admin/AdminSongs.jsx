import React, { useState, useEffect } from 'react';
import { getAdminSongs, createSong, updateSong, deleteSong } from '../../services/adminApi';
import '../../styles/admin.css';

const AdminSongs = () => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    album: '',
    audio_file: null,
    duration: ''
  });

  useEffect(() => {
    fetchSongs();
  }, []);

  const fetchSongs = async () => {
    try {
      setLoading(true);
      const data = await getAdminSongs();
      setSongs(data);
    } catch (err) {
      setError('Failed to fetch songs');
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

      if (selectedSong) {
        await updateSong(selectedSong.id, formDataToSend);
      } else {
        await createSong(formDataToSend);
      }

      setShowAddModal(false);
      setShowEditModal(false);
      setSelectedSong(null);
      setFormData({
        title: '',
        artist: '',
        album: '',
        audio_file: null,
        duration: ''
      });
      fetchSongs();
    } catch (err) {
      alert('Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this song?')) {
      try {
        await deleteSong(id);
        fetchSongs();
      } catch (err) {
        alert('Delete failed');
      }
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="admin-songs">
      <div className="admin-header">
        <h1>Manage Songs</h1>
        <button 
          className="admin-btn admin-btn-primary" 
          onClick={() => setShowAddModal(true)}
        >
          Add New Song
        </button>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Artist</th>
            <th>Album</th>
            <th>Duration</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {songs.map(song => (
            <tr key={song.id}>
              <td>{song.title}</td>
              <td>{song.artist?.name}</td>
              <td>{song.album?.title}</td>
              <td>{song.duration}</td>
              <td>
                <button 
                  className="admin-btn"
                  onClick={() => {
                    setSelectedSong(song);
                    setFormData({
                      title: song.title,
                      artist: song.artist?.id,
                      album: song.album?.id,
                      duration: song.duration
                    });
                    setShowEditModal(true);
                  }}
                >
                  Edit
                </button>
                <button 
                  className="admin-btn admin-btn-danger"
                  onClick={() => handleDelete(song.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="admin-modal">
          <div className="admin-modal-content">
            <h2>{selectedSong ? 'Edit Song' : 'Add New Song'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Artist</label>
                <input
                  type="text"
                  name="artist"
                  value={formData.artist}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Album</label>
                <input
                  type="text"
                  name="album"
                  value={formData.album}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Audio File</label>
                <input
                  type="file"
                  name="audio_file"
                  onChange={handleInputChange}
                  accept="audio/*"
                  required={!selectedSong}
                />
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  className="admin-btn"
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    setSelectedSong(null);
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="admin-btn admin-btn-primary"
                >
                  {selectedSong ? 'Update' : 'Add'} Song
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSongs;
