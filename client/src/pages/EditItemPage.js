import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { FiUpload, FiX, FiEdit3 } from 'react-icons/fi';

const CATEGORIES = [
  'Electronics', 'Clothing', 'Books & Stationery', 'Accessories',
  'ID & Documents', 'Keys', 'Bags & Wallets', 'Sports Equipment', 'Other'
];

const EditItemPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImage, setExistingImage] = useState('');

  const [formData, setFormData] = useState({
    title: '', description: '', type: 'lost', category: '',
    location: '', date: '', tags: '', contactInfo: '', status: 'active', image: null
  });

  // Load existing item data
  useEffect(() => {
    const fetchItem = async () => {
      try {
        const { data } = await API.get(`/items/${id}`);
        const item = data.item;
        setFormData({
          title: item.title || '',
          description: item.description || '',
          type: item.type || 'lost',
          category: item.category || '',
          location: item.location || '',
          date: item.date ? new Date(item.date).toISOString().split('T')[0] : '',
          tags: item.tags?.join(', ') || '',
          contactInfo: item.contactInfo || '',
          status: item.status || 'active',
          image: null,
        });
        if (item.image) {
          setExistingImage(`http://localhost:5000${item.image}`);
        }
      } catch (err) {
        toast.error('Failed to load item');
        navigate('/dashboard');
      } finally {
        setFetchLoading(false);
      }
    };
    fetchItem();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image' && files[0]) {
      setFormData({ ...formData, image: files[0] });
      setImagePreview(URL.createObjectURL(files[0]));
      setExistingImage('');
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, val]) => {
        if (val !== null && val !== undefined) data.append(key, val);
      });

      await API.put(`/items/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Item updated successfully! ✅');
      navigate(`/items/${id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update item');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) return (
    <div className="page-wrapper">
      <div className="spinner-wrapper"><div className="spinner" /></div>
    </div>
  );

  const currentImage = imagePreview || existingImage;

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: 780 }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 className="section-title">
            <FiEdit3 size={22} style={{ marginRight: '0.5rem', verticalAlign: 'middle', color: 'var(--accent-primary)' }} />
            Edit <span>Item</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            Update the details of your reported item.
          </p>
        </div>

        <form onSubmit={handleSubmit} encType="multipart/form-data">
          {/* Type Toggle */}
          <div className="form-group">
            <label className="form-label">Item Type *</label>
            <div className="type-toggle">
              <button type="button"
                className={`type-toggle-btn ${formData.type === 'lost' ? 'active-lost' : ''}`}
                onClick={() => setFormData({ ...formData, type: 'lost' })}>
                🔍 Lost
              </button>
              <button type="button"
                className={`type-toggle-btn ${formData.type === 'found' ? 'active-found' : ''}`}
                onClick={() => setFormData({ ...formData, type: 'found' })}>
                ✅ Found
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Item Name *</label>
            <input type="text" name="title" className="form-input"
              value={formData.title} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea name="description" className="form-textarea"
              value={formData.description} onChange={handleChange} rows={5} required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select name="category" className="form-select" value={formData.category} onChange={handleChange}>
                <option value="">Select category</option>
                {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Location *</label>
              <input type="text" name="location" className="form-input"
                value={formData.location} onChange={handleChange} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Date</label>
              <input type="date" name="date" className="form-input"
                value={formData.date} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select name="status" className="form-select" value={formData.status} onChange={handleChange}>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Tags (comma-separated)</label>
            <input type="text" name="tags" className="form-input"
              placeholder="blue, apple, wallet..."
              value={formData.tags} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label className="form-label">Contact Info</label>
            <input type="text" name="contactInfo" className="form-input"
              value={formData.contactInfo} onChange={handleChange} />
          </div>

          {/* Image */}
          <div className="form-group">
            <label className="form-label">Photo</label>
            {currentImage ? (
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <img src={currentImage} alt="Preview"
                  style={{ maxWidth: '100%', maxHeight: 250, borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)', objectFit: 'contain' }} />
                <button type="button"
                  onClick={() => { setImagePreview(null); setExistingImage(''); setFormData({ ...formData, image: null }); }}
                  style={{
                    position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.7)',
                    border: 'none', borderRadius: '50%', width: 28, height: 28,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: 'white'
                  }}>
                  <FiX size={14} />
                </button>
              </div>
            ) : (
              <label style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                border: '2px dashed var(--border-color)', borderRadius: 'var(--radius-md)',
                padding: '2rem', cursor: 'pointer', background: 'var(--bg-input)',
                gap: '0.5rem', color: 'var(--text-secondary)'
              }}>
                <FiUpload size={24} />
                <span style={{ fontSize: '0.88rem' }}>Click to upload new image</span>
                <input type="file" name="image" accept="image/*" onChange={handleChange}
                  style={{ display: 'none' }} />
              </label>
            )}
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
              {loading
                ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Saving...</>
                : 'Save Changes'
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

export default EditItemPage;
