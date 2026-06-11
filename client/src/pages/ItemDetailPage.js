import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import ItemCard from '../components/ItemCard';
import toast from 'react-hot-toast';
import {
  FiMapPin, FiCalendar, FiTag, FiMessageSquare,
  FiCheckCircle, FiEdit, FiTrash2, FiArrowLeft, FiPhone,
  FiMail, FiAlertCircle, FiZap
} from 'react-icons/fi';

const categoryEmojis = {
  'Electronics': '📱', 'Clothing': '👕', 'Books & Stationery': '📚',
  'Accessories': '👓', 'ID & Documents': '🪪', 'Keys': '🔑',
  'Bags & Wallets': '👜', 'Sports Equipment': '⚽', 'Other': '📦',
};

const ItemDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [item, setItem] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showMessageForm, setShowMessageForm] = useState(false);
  const [message, setMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      setLoading(true);
      try {
        const { data } = await API.get(`/items/${id}`);
        setItem(data.item);
        // Also fetch matching items
        const matchRes = await API.get(`/items/${id}/matches`);
        setMatches(matchRes.data.matches || []);
      } catch (err) {
        toast.error('Item not found');
        navigate('/items');
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id, navigate]);

  const handleClaim = async () => {
    if (!user) { navigate('/login'); return; }
    setActionLoading(true);
    try {
      const { data } = await API.post(`/items/${id}/claim`);
      setItem(data.item);
      toast.success('Claim submitted! The owner will review it. 🎉');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to claim item');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolve = async () => {
    if (!window.confirm('Mark this item as resolved?')) return;
    setActionLoading(true);
    try {
      const { data } = await API.put(`/items/${id}/resolve`);
      setItem(data.item);
      toast.success('Item marked as resolved! ✅');
    } catch (err) {
      toast.error('Failed to resolve item');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this item? This cannot be undone.')) return;
    setActionLoading(true);
    try {
      await API.delete(`/items/${id}`);
      toast.success('Item deleted successfully');
      navigate('/dashboard');
    } catch (err) {
      toast.error('Failed to delete item');
      setActionLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    if (!message.trim()) return;
    setSendingMessage(true);
    try {
      await API.post('/messages', {
        itemId: id,
        receiverId: item.postedBy._id,
        content: message.trim(),
      });
      toast.success('Message sent! 📩');
      setMessage('');
      setShowMessageForm(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  if (loading) return (
    <div className="page-wrapper">
      <div className="spinner-wrapper"><div className="spinner" /></div>
    </div>
  );

  if (!item) return null;

  const isOwner = user && item.postedBy?._id === user._id;
  const canClaim = user && !isOwner && item.status === 'active';
  const formattedDate = new Date(item.date).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
  });
  const posterInitial = item.postedBy?.name?.charAt(0).toUpperCase();

  return (
    <div className="page-wrapper">
      <div className="container">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="btn btn-ghost btn-sm"
          style={{ marginBottom: '1.5rem' }}
        >
          <FiArrowLeft size={15} /> Back
        </button>

        <div className="detail-grid">
          {/* ======= LEFT COLUMN ======= */}
          <div>
            {/* Item Image */}
            {item.image ? (
              <img
                src={`${process.env.REACT_APP_BASE_URL || 'http://localhost:5000'}${item.image}`}
                alt={item.title}
                className="item-detail-image"
              />
            ) : (
              <div className="item-detail-placeholder">
                {categoryEmojis[item.category] || '📦'}
              </div>
            )}

            {/* Title & Type Badge */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem' }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, lineHeight: 1.2 }}>
                {item.title}
              </h1>
              <span className={`badge badge-${item.type}`} style={{ flexShrink: 0, fontSize: '0.85rem' }}>
                {item.type === 'lost' ? '🔍 Lost' : '✅ Found'}
              </span>
            </div>

            {/* Status */}
            <div style={{ marginBottom: '1rem' }}>
              <span className={`badge badge-${item.status}`}>
                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              </span>
            </div>

            {/* Description */}
            <div style={{
              background: 'var(--bg-card)', border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)', padding: '1.25rem', marginBottom: '1.5rem'
            }}>
              <h3 style={{ fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.9rem',
                color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Description
              </h3>
              <p style={{ color: 'var(--text-primary)', lineHeight: 1.8, fontSize: '0.95rem' }}>
                {item.description}
              </p>
            </div>

            {/* Tags */}
            {item.tags && item.tags.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.9rem',
                  color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Tags
                </h3>
                <div className="tags-container">
                  {item.tags.map((tag, idx) => (
                    <span key={idx} className="tag">#{tag}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Owner Actions */}
            {isOwner && (
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                <Link to={`/edit-item/${id}`} className="btn btn-secondary btn-sm">
                  <FiEdit size={14} /> Edit Item
                </Link>
                {item.status !== 'resolved' && (
                  <button onClick={handleResolve} className="btn btn-success btn-sm" disabled={actionLoading}>
                    <FiCheckCircle size={14} /> Mark Resolved
                  </button>
                )}
                <button onClick={handleDelete} className="btn btn-danger btn-sm" disabled={actionLoading}>
                  <FiTrash2 size={14} /> Delete
                </button>
              </div>
            )}

            {/* Claim Button (for non-owners) */}
            {canClaim && (
              <button
                onClick={handleClaim}
                className="btn btn-primary"
                disabled={actionLoading}
                style={{ marginBottom: '1rem' }}
              >
                <FiCheckCircle size={16} />
                {actionLoading ? 'Submitting...' : 'Claim This Item'}
              </button>
            )}

            {/* Message Form */}
            {user && !isOwner && (
              <div style={{ marginBottom: '1.5rem' }}>
                {!showMessageForm ? (
                  <button
                    onClick={() => setShowMessageForm(true)}
                    className="btn btn-secondary"
                  >
                    <FiMessageSquare size={15} /> Contact Owner
                  </button>
                ) : (
                  <form onSubmit={handleSendMessage}
                    style={{
                      background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)', padding: '1.25rem'
                    }}>
                    <h4 style={{ marginBottom: '0.75rem', fontWeight: 700 }}>
                      <FiMessageSquare size={15} style={{ marginRight: 6 }} />
                      Send a Message
                    </h4>
                    <textarea
                      className="form-textarea"
                      placeholder="Describe why you think this is your item or how you can help..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={4}
                      required
                    />
                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
                      <button type="submit" className="btn btn-primary btn-sm" disabled={sendingMessage}>
                        {sendingMessage ? 'Sending...' : 'Send Message'}
                      </button>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowMessageForm(false)}>
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {!user && (
              <div style={{
                padding: '1rem', background: 'rgba(108,99,255,0.08)',
                border: '1px solid rgba(108,99,255,0.2)', borderRadius: 'var(--radius-md)',
                display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem'
              }}>
                <FiAlertCircle size={18} color="var(--accent-primary)" />
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  <Link to="/login" style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>Sign in</Link> to claim or contact the owner.
                </span>
              </div>
            )}
          </div>

          {/* ======= RIGHT COLUMN ======= */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Item Details Card */}
            <div className="detail-meta-card">
              <div className="detail-meta-title">Item Details</div>
              <div className="detail-meta-list">
                <div className="detail-meta-item">
                  <FiTag className="icon" size={15} />
                  <div>
                    <div className="label">Category</div>
                    <div className="value">{item.category}</div>
                  </div>
                </div>
                <div className="detail-meta-item">
                  <FiMapPin className="icon" size={15} />
                  <div>
                    <div className="label">Location</div>
                    <div className="value">{item.location}</div>
                  </div>
                </div>
                <div className="detail-meta-item">
                  <FiCalendar className="icon" size={15} />
                  <div>
                    <div className="label">Date {item.type === 'lost' ? 'Lost' : 'Found'}</div>
                    <div className="value">{formattedDate}</div>
                  </div>
                </div>
                {item.contactInfo && (
                  <div className="detail-meta-item">
                    <FiPhone className="icon" size={15} />
                    <div>
                      <div className="label">Contact Info</div>
                      <div className="value">{item.contactInfo}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Posted By Card */}
            <div className="detail-meta-card">
              <div className="detail-meta-title">Posted By</div>
              <div style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                  <div className="avatar-lg" style={{ width: 56, height: 56, fontSize: '1.2rem' }}>
                    {item.postedBy?.avatar ? (
                      <img src={`${process.env.REACT_APP_BASE_URL || 'http://localhost:5000'}${item.postedBy.avatar}`} alt={item.postedBy?.name} />
                    ) : posterInitial}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700 }}>{item.postedBy?.name}</div>
                    {item.postedBy?.department && (
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        {item.postedBy.department}
                      </div>
                    )}
                  </div>
                </div>
                {item.postedBy?.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem',
                    fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                    <FiPhone size={13} /> {item.postedBy.phone}
                  </div>
                )}
                {item.postedBy?.email && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem',
                    fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <FiMail size={13} /> {item.postedBy.email}
                  </div>
                )}
              </div>
            </div>

            {/* Claimed By Card (if applicable) */}
            {item.claimedBy && (
              <div className="detail-meta-card">
                <div className="detail-meta-title">Claimed By</div>
                <div style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div className="avatar-sm">{item.claimedBy.name?.charAt(0)}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.claimedBy.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{item.claimedBy.email}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ======= MATCHING ITEMS ======= */}
        {matches.length > 0 && (
          <div className="matching-section">
            <div className="matching-header">
              <div className="matching-pulse" />
              <FiZap size={18} color="var(--accent-warning)" />
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                Possible Matches —
                <span style={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: '1rem', marginLeft: '0.5rem' }}>
                  {matches.length} similar {item.type === 'lost' ? 'found' : 'lost'} item{matches.length !== 1 ? 's' : ''} found
                </span>
              </h2>
            </div>
            <div className="items-grid">
              {matches.map((match) => (
                <ItemCard key={match._id} item={match} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemDetailPage;
