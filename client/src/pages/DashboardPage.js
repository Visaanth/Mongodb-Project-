import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import ItemCard from '../components/ItemCard';
import toast from 'react-hot-toast';
import {
  FiPlusCircle, FiPackage, FiCheckCircle, FiClock,
  FiAlertCircle, FiGrid, FiList
} from 'react-icons/fi';

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [myItems, setMyItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const fetchMyItems = async () => {
      try {
        const { data } = await API.get('/items/my/posts');
        setMyItems(data.items);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyItems();
  }, []);

  // Filter items by tab
  const filteredItems = myItems.filter((item) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'lost') return item.type === 'lost';
    if (activeTab === 'found') return item.type === 'found';
    if (activeTab === 'pending') return item.status === 'pending';
    if (activeTab === 'resolved') return item.status === 'resolved';
    return true;
  });

  // Stats
  const stats = {
    total: myItems.length,
    lost: myItems.filter((i) => i.type === 'lost').length,
    found: myItems.filter((i) => i.type === 'found').length,
    pending: myItems.filter((i) => i.status === 'pending').length,
    resolved: myItems.filter((i) => i.status === 'resolved').length,
  };

  const tabs = [
    { key: 'all', label: 'All Items', count: stats.total, icon: <FiGrid size={14} /> },
    { key: 'lost', label: 'Lost', count: stats.lost, icon: '🔍' },
    { key: 'found', label: 'Found', count: stats.found, icon: '✅' },
    { key: 'pending', label: 'Pending', count: stats.pending, icon: <FiClock size={14} /> },
    { key: 'resolved', label: 'Resolved', count: stats.resolved, icon: <FiCheckCircle size={14} /> },
  ];

  return (
    <div className="page-wrapper">
      <div className="container">
        {/* Welcome Header */}
        <div style={{
          background: 'linear-gradient(135deg, #141d35, #1a2540)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-xl)', padding: '2rem',
          marginBottom: '2rem', display: 'flex',
          alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '1rem',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 4,
            background: 'var(--gradient-primary)'
          }} />
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.3rem' }}>
              Welcome back, {user?.name?.split(' ')[0]}! 👋
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Manage all your lost and found item reports from one place.
            </p>
          </div>
          <Link to="/post-item" className="btn btn-primary">
            <FiPlusCircle size={16} /> Report New Item
          </Link>
        </div>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'Total Posts', value: stats.total, color: 'var(--accent-primary)', bg: 'rgba(108,99,255,0.1)' },
            { label: 'Lost Items', value: stats.lost, color: 'var(--accent-danger)', bg: 'rgba(255,87,87,0.1)' },
            { label: 'Found Items', value: stats.found, color: 'var(--accent-success)', bg: 'rgba(67,217,130,0.1)' },
            { label: 'Pending Claims', value: stats.pending, color: 'var(--accent-warning)', bg: 'rgba(255,179,71,0.1)' },
            { label: 'Resolved', value: stats.resolved, color: 'var(--accent-info)', bg: 'rgba(79,195,247,0.1)' },
          ].map((stat, idx) => (
            <div key={idx} style={{
              background: stat.bg, border: `1px solid ${stat.color}30`,
              borderRadius: 'var(--radius-md)', padding: '1.25rem', textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: stat.color }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.25rem', fontWeight: 500 }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', gap: '0.4rem', marginBottom: '1.75rem',
          background: 'var(--bg-secondary)', padding: '4px',
          borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)',
          flexWrap: 'wrap',
        }}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`btn btn-sm ${activeTab === tab.key ? 'btn-primary' : 'btn-ghost'}`}
              style={{ flex: '1', minWidth: 80 }}
            >
              {tab.icon} {tab.label}
              {tab.count > 0 && (
                <span style={{
                  background: activeTab === tab.key ? 'rgba(255,255,255,0.2)' : 'var(--bg-card)',
                  borderRadius: 'var(--radius-full)', padding: '0.05rem 0.4rem',
                  fontSize: '0.72rem', fontWeight: 700
                }}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Items Grid */}
        {loading ? (
          <div className="spinner-wrapper"><div className="spinner" /></div>
        ) : filteredItems.length > 0 ? (
          <div className="items-grid">
            {filteredItems.map((item) => (
              <ItemCard key={item._id} item={item} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon"><FiPackage /></div>
            <h3>{activeTab === 'all' ? 'No Items Yet' : `No ${activeTab} items`}</h3>
            <p>
              {activeTab === 'all'
                ? "You haven't reported any items yet."
                : `You don't have any items with "${activeTab}" status.`}
            </p>
            {activeTab === 'all' && (
              <Link to="/post-item" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
                <FiPlusCircle size={15} /> Post Your First Item
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
