import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { FiInbox, FiSend, FiMessageSquare, FiPackage } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const MessagesPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('inbox');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Reply State
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const endpoint = activeTab === 'inbox' ? '/messages/inbox' : '/messages/sent';
        const { data } = await API.get(endpoint);
        setMessages(data.messages);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [activeTab]);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const displayPerson = (msg) =>
    activeTab === 'inbox' ? msg.sender : msg.receiver;

  const handleReplySubmit = async (msg) => {
    if (!replyContent.trim()) return;
    setSendingMessage(true);
    try {
      await API.post('/messages', {
        itemId: msg.item._id,
        receiverId: msg.sender._id, // Reply to the sender of this message
        content: replyContent.trim(),
      });
      import('react-hot-toast').then(toast => toast.default.success('Reply sent successfully! ✅'));
      setReplyingTo(null);
      setReplyContent('');
    } catch (err) {
      import('react-hot-toast').then(toast => toast.default.error('Failed to send reply'));
    } finally {
      setSendingMessage(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: 760 }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 className="section-title">
            <FiMessageSquare size={22} style={{ marginRight: '0.5rem', verticalAlign: 'middle', color: 'var(--accent-primary)' }} />
            <span>Messages</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.3rem', fontSize: '0.9rem' }}>
            View messages related to your lost & found items.
          </p>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', gap: '0.4rem', marginBottom: '1.5rem',
          background: 'var(--bg-secondary)', padding: '4px',
          borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)',
        }}>
          <button onClick={() => setActiveTab('inbox')}
            className={`btn btn-sm ${activeTab === 'inbox' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ flex: 1 }}>
            <FiInbox size={14} /> Inbox
          </button>
          <button onClick={() => setActiveTab('sent')}
            className={`btn btn-sm ${activeTab === 'sent' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ flex: 1 }}>
            <FiSend size={14} /> Sent
          </button>
        </div>

        {/* Messages List */}
        {loading ? (
          <div className="spinner-wrapper"><div className="spinner" /></div>
        ) : messages.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {messages.map((msg) => {
              const person = displayPerson(msg);
              const personInitial = person?.name?.charAt(0).toUpperCase();
              return (
                <div key={msg._id} style={{
                  background: 'var(--bg-card)',
                  border: `1px solid ${!msg.isRead && activeTab === 'inbox' ? 'rgba(108,99,255,0.4)' : 'var(--border-color)'}`,
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                  position: 'relative',
                  transition: 'var(--transition)',
                }}>
                  {/* Unread dot */}
                  {!msg.isRead && activeTab === 'inbox' && (
                    <div style={{
                      position: 'absolute', top: '1.25rem', right: '1.25rem',
                      width: 10, height: 10, background: 'var(--accent-primary)',
                      borderRadius: '50%'
                    }} />
                  )}

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                    {/* Avatar */}
                    <div className="avatar-sm" style={{ width: 42, height: 42, fontSize: '1rem', flexShrink: 0 }}>
                      {person?.avatar
                        ? <img src={`http://localhost:5000${person.avatar}`} alt={person?.name} />
                        : personInitial}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* Header */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        marginBottom: '0.4rem', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                          {activeTab === 'inbox' ? 'From: ' : 'To: '}
                          {person?.name}
                          {person?.email && (
                            <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.82rem', marginLeft: '0.4rem' }}>
                              ({person.email})
                            </span>
                          )}
                        </span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', flexShrink: 0 }}>
                          {formatDate(msg.createdAt)}
                        </span>
                      </div>

                      {/* Item Reference */}
                      {msg.item && (
                        <Link to={`/items/${msg.item._id}`} style={{
                          display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                          fontSize: '0.8rem', color: 'var(--accent-primary)',
                          background: 'rgba(108,99,255,0.1)', borderRadius: 'var(--radius-full)',
                          padding: '0.2rem 0.6rem', marginBottom: '0.6rem',
                          border: '1px solid rgba(108,99,255,0.2)'
                        }}>
                          <FiPackage size={11} />
                          {msg.item.title} ({msg.item.type})
                        </Link>
                      )}

                      {/* Message Content */}
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6,
                        background: 'rgba(255,255,255,0.03)', padding: '0.75rem',
                        borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                        {msg.content}
                      </p>

                      {/* Reply Feature */}
                      {activeTab === 'inbox' && (
                        <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                          {replyingTo !== msg._id ? (
                            <button 
                              onClick={() => { setReplyingTo(msg._id); setReplyContent(''); }} 
                              className="btn btn-ghost btn-sm" 
                              style={{ padding: '0.2rem 0.5rem', fontSize: '0.85rem' }}
                            >
                              ↩ Reply
                            </button>
                          ) : (
                            <div style={{ width: '100%', marginTop: '0.25rem' }}>
                              <textarea 
                                className="form-textarea"
                                rows={2} 
                                placeholder="Write your reply..."
                                value={replyContent} 
                                onChange={(e) => setReplyContent(e.target.value)}
                                autoFocus
                                style={{ fontSize: '0.85rem', padding: '0.5rem' }}
                              />
                              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', justifyContent: 'flex-end' }}>
                                <button 
                                  onClick={() => handleReplySubmit(msg)} 
                                  className="btn btn-primary btn-sm" 
                                  disabled={sendingMessage}
                                >
                                  {sendingMessage ? 'Sending...' : 'Send Reply'}
                                </button>
                                <button 
                                  onClick={() => setReplyingTo(null)} 
                                  className="btn btn-ghost btn-sm"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">
              {activeTab === 'inbox' ? <FiInbox /> : <FiSend />}
            </div>
            <h3>{activeTab === 'inbox' ? 'No Messages' : 'Nothing Sent'}</h3>
            <p style={{ marginBottom: '1rem' }}>
              {activeTab === 'inbox'
                ? "Your inbox is empty. Messages from others about your items will appear here."
                : "You haven't sent any messages yet."}
            </p>
            <Link to="/items" className="btn btn-secondary btn-sm">Browse Items</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
