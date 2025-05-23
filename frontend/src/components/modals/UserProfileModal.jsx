import React, { useState, useEffect } from 'react';
import { FaTimes, FaUser } from 'react-icons/fa';
import { updateUserProfile, getUser } from '../../services/api';
import { showSuccessToast, showErrorToast } from '../../utils/toast.jsx';
import './UserProfileModal.css';

const UserProfileModal = ({ isOpen, onClose, user: initialUser }) => {
  // Khởi tạo state với giá trị mặc định an toàn
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    fullName: '',
    gender: '',
    dateOfBirth: '',
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [originalData, setOriginalData] = useState({}); // Lưu trữ dữ liệu ban đầu
  const [errors, setErrors] = useState({}); // Thêm state để lưu lỗi

  // Cập nhật formData khi modal mở hoặc user thay đổi
  useEffect(() => {
    if (isOpen) {
      // Lấy user mới nhất từ localStorage
      const currentUser = initialUser || getUser() || {};
      
      const newFormData = {
        username: currentUser.username || '',
        email: currentUser.email || '',
        fullName: currentUser.full_name || '',
        gender: currentUser.gender || '',
        dateOfBirth: currentUser.date_of_birth || '',
      };
      
      setFormData(newFormData);
      setOriginalData(newFormData); // Lưu trữ dữ liệu ban đầu
      setIsEditing(false); // Reset trạng thái chỉnh sửa khi mở modal
      setErrors({}); // Reset lỗi khi mở modal
    }
  }, [isOpen, initialUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Xóa lỗi khi người dùng bắt đầu nhập lại
    if (errors[name]) {
      setErrors({...errors, [name]: ""});
    }
  };

  // Kiểm tra email hợp lệ
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    // Kiểm tra email
    if (!formData.email) {
      newErrors.email = "Vui lòng nhập email";
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }
    
    // Kiểm tra họ và tên
    if (!formData.fullName) {
      newErrors.fullName = "Vui lòng nhập họ và tên";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Chỉ xử lý submit khi đang ở chế độ chỉnh sửa
    if (!isEditing) {
      return;
    }
    
    // Validate form trước khi submit
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);

    try {
      // Chuyển đổi dữ liệu để phù hợp với API
      const apiData = {
        email: formData.email,
        full_name: formData.fullName, // Chuyển fullName thành full_name
      };

      console.log('Đang gửi dữ liệu cập nhật:', apiData);

      // Gọi API cập nhật thông tin người dùng
      const updatedUser = await updateUserProfile(apiData);
      
      console.log('Nhận dữ liệu cập nhật:', updatedUser);
      
      // Cập nhật state với dữ liệu mới
      const newFormData = {
        username: updatedUser.username || '',
        email: updatedUser.email || '',
        fullName: updatedUser.full_name || '',
        gender: updatedUser.gender || '',
        dateOfBirth: updatedUser.date_of_birth || '',
      };
      
      setFormData(newFormData);
      setOriginalData(newFormData); // Cập nhật dữ liệu gốc
      
      showSuccessToast('Cập nhật thông tin thành công!');
      setIsEditing(false);
    } catch (error) {
      console.error('Lỗi submit form:', error);
      
      // Xử lý lỗi từ API
      if (error.response && error.response.data) {
        const apiErrors = {};
        const errorData = error.response.data;
        
        if (errorData.email) {
          apiErrors.email = errorData.email[0];
        }
        if (errorData.full_name) {
          apiErrors.fullName = errorData.full_name[0];
        }
        
        if (Object.keys(apiErrors).length > 0) {
          setErrors(apiErrors);
        } else {
          showErrorToast(error.message || 'Không thể cập nhật thông tin. Vui lòng thử lại sau.');
        }
      } else {
        showErrorToast(error.message || 'Không thể cập nhật thông tin. Vui lòng thử lại sau.');
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleEdit = () => {
    if (isEditing) {
      // Nếu đang ở chế độ chỉnh sửa, hủy bỏ và khôi phục dữ liệu ban đầu
      setFormData(originalData);
      setErrors({}); // Reset lỗi khi hủy chỉnh sửa
    }
    setIsEditing(!isEditing);
  };

  // Format ngày sinh để hiển thị
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={(e) => e.target.classList.contains('modal-overlay') && onClose()}>
      <div className="modal-container user-profile-modal">
        <div className="modal-header">
          <h2 className="modal-title">Thông tin người dùng</h2>
          <button className="modal-close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        
        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">Tên người dùng</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                disabled={true}
                className="input-field disabled"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={!isEditing}
                className={`${isEditing ? 'input-field' : 'input-field disabled'} ${errors.email ? 'error' : ''}`}
              />
              {errors.email && <p className="profile-error-text">{errors.email}</p>}
            </div>
            
            <div className="form-group">
              <label htmlFor="fullName">Họ và tên</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                disabled={!isEditing}
                className={`${isEditing ? 'input-field' : 'input-field disabled'} ${errors.fullName ? 'error' : ''}`}
              />
              {errors.fullName && <p className="profile-error-text">{errors.fullName}</p>}
            </div>
            
            <div className="form-group">
              <label htmlFor="gender">Giới tính</label>
              <input
                type="text"
                id="gender"
                name="gender"
                value={formData.gender === 'male' ? 'Nam' : formData.gender === 'female' ? 'Nữ' : ''}
                disabled={true}
                className="input-field disabled"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="dateOfBirth">Ngày sinh</label>
              <input
                type="text"
                id="dateOfBirth"
                name="dateOfBirth"
                value={formatDate(formData.dateOfBirth)}
                disabled={true}
                className="input-field disabled"
              />
            </div>
            
            <div className="profile-actions">
              {isEditing ? (
                <>
                  <button 
                    type="button" 
                    className="cancel-btn" 
                    onClick={toggleEdit}
                    disabled={loading}
                  >
                    Hủy
                  </button>
                  <button 
                    type="submit" 
                    className="save-btn" 
                    disabled={loading}
                  >
                    {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </button>
                </>
              ) : (
                <button 
                  type="button" 
                  className="edit-btn" 
                  onClick={toggleEdit}
                >
                  Chỉnh sửa thông tin
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;
