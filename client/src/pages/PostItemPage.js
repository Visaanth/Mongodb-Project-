import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { FiUpload, FiX, FiPackage } from 'react-icons/fi';

const CATEGORIES = [
  'Electronics', 'Clothing', 'Books & Stationery', 'Accessories',
  'ID & Documents', 'Keys', 'Bags & Wallets', 'Sports Equipment', 'Other'
];

const PostItemPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    title: '', description: '', type: 'lost', category: '',
    location: '', date: new Date().toISOString().split('T')[0],
    tags: '', contactInfo: '', image: null
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image' && files[0]) {
      setFormData({ ...formData, image: files[0] });
      setImagePreview(URL.createObjectURL(files[0]));
    } else {
      setFormData({ ...formData, [name]: value });
    }
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const removeImage = () => {
    setFormData({ ...formData, image: null });
    setImagePreview(null);
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.date) newErrors.date = 'Date is required';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error('Please fix the errors below');
      return;
    }

    setLoading(true);
    try {
      // Use FormData to support file upload
      const data = new FormData();
      Object.entries(formData).forEach(([key, val]) => {
        if (val !== null && val !== undefined) data.append(key, val);
      });

      const { data: resData } = await API.post('/items', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Item posted successfully! 🎉');
      navigate(`/items/${resData.item._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: 780 }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 className="section-title">
            <FiPackage size={24} style={{ marginRight: '0.5rem', verticalAlign: 'middle', color: 'var(--accent-primary)' }} />
            Report an <span>Item</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            Fill in the details to report a lost or found item on campus.
          </p>
        </div>

        <form onSubmit={handleSubmit} encType="multipart/form-data">
          {/* Lost / Found Type Toggle */}
          <div className="form-group">
            <label className="form-label">Item Type *</label>
            <div className="type-toggle">
              <button type="button"
                className={`type-toggle-btn ${formData.type === 'lost' ? 'active-lost' : ''}`}
                onClick={() => setFormData({ ...formData, type: 'lost' })}>
                🔍 I Lost Something
              </button>
              <button type="button"
                className={`type-toggle-btn ${formData.type === 'found' ? 'active-found' : ''}`}
                onClick={() => setFormData({ ...formData, type: 'found' })}>
                ✅ I Found Something
              </button>
            </div>
          </div>

          {/* Title */}
          <div className="form-group">
            <label className="form-label">Item Name / Title *</label>
            <input type="text" name="title" className={`form-input ${errors.title ? 'input-error' : ''}`}
              placeholder="e.g. Blue Samsung Galaxy S23, Red Backpack..."
              value={formData.title} onChange={handleChange} maxLength={100} />
            {errors.title && <span className="error-text">{errors.title}</span>}
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea name="description" className={`form-textarea ${errors.description ? 'input-error' : ''}`}
              placeholder="Describe the item in detail... (color, brand, distinguishing features, condition)"
              value={formData.description} onChange={handleChange} rows={5} maxLength={1000} />
            <small style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
              {formData.description.length}/1000
            </small>
            {errors.description && <span className="error-text">{errors.description}</span>}
          </div>

          {/* Category & Location */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select name="category" className={`form-select ${errors.category ? 'input-error' : ''}`}
                value={formData.category} onChange={handleChange}>
                <option value="">Select a category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {errors.category && <span className="error-text">{errors.category}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Location *</label>
              <input type="text" name="location" className={`form-input ${errors.location ? 'input-error' : ''}`}
                placeholder="e.g. Main Library, Block A, Canteen..."
                value={formData.location} onChange={handleChange} />
              {errors.location && <span className="error-text">{errors.location}</span>}
            </div>
          </div>

          {/* Date & Contact Info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Date {formData.type === 'lost' ? 'Lost' : 'Found'} *</label>
              <input type="date" name="date" className={`form-input ${errors.date ? 'input-error' : ''}`}
                value={formData.date} onChange={handleChange}
                max={new Date().toISOString().split('T')[0]} />
              {errors.date && <span className="error-text">{errors.date}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Contact Info (optional)</label>
              <input type="text" name="contactInfo" className="form-input"
                placeholder="Phone or alternate email"
                value={formData.contactInfo} onChange={handleChange} />
            </div>
          </div>

          {/* Tags */}
          <div className="form-group">
            <label className="form-label">Keywords / Tags (optional)</label>
            <input type="text" name="tags" className="form-input"
              placeholder="e.g. blue, apple, charger (comma-separated)"
              value={formData.tags} onChange={handleChange} />
            <small style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
              Separate tags with commas. Tags help others find your item.
            </small>
          </div>

          {/* Image Upload */}
          <div className="form-group">
            <label className="form-label">Photo (optional, max 5MB)</label>
            {!imagePreview ? (
              <label style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                border: '2px dashed var(--border-color)', borderRadius: 'var(--radius-md)',
                padding: '2.5rem', cursor: 'pointer', transition: 'var(--transition)',
                background: 'var(--bg-input)', gap: '0.75rem', color: 'var(--text-secondary)',
              }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
              >
                <FiUpload size={28} />
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Click to upload image</span>
                <span style={{ fontSize: '0.78rem' }}>JPG, PNG, GIF, WebP — max 5MB</span>
                <input type="file" name="image" accept="image/*" onChange={handleChange}
                  style={{ display: 'none' }} />
              </label>
            ) : (
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <img src={imagePreview} alt="Preview"
                  style={{ maxWidth: '100%', maxHeight: 300, borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)', objectFit: 'contain' }} />
                <button type="button" onClick={removeImage}
                  style={{
                    position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.7)',
                    border: 'none', borderRadius: '50%', width: 30, height: 30,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: 'white'
                  }}>
                  <FiX size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Submit */}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
              {loading
                ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Posting...</>
                : `Post ${formData.type === 'lost' ? '🔍 Lost' : '✅ Found'} Item`
              }
            </button>
            <button type="button" className="btn btn-ghost btn-lg" onClick={() => navigate(-1)}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostItemPage;
