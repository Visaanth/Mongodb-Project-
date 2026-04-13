import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import ItemCard from '../components/ItemCard';
import { FiSearch, FiArrowRight, FiZap, FiShield, FiUsers } from 'react-icons/fi';

const HomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recentItems, setRecentItems] = useState([]);
  const [stats, setStats] = useState({ total: 0, lost: 0, found: 0, resolved: 0 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch recent items (latest 6)
        const { data } = await API.get('/items?limit=6&sort=-createdAt');
        setRecentItems(data.items);

        // Calculate stats from total (including resolved items for accurate platform numbers)
        const totalRes = await API.get('/items?status=all&limit=1');
        const lostRes = await API.get('/items?type=lost&status=all&limit=1');
        const foundRes = await API.get('/items?type=found&status=all&limit=1');
        const resolvedRes = await API.get('/items?status=resolved&limit=1');
        setStats({
          total: totalRes.data.total,
          lost: lostRes.data.total,
          found: foundRes.data.total,
          resolved: resolvedRes.data.total,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/items?search=${encodeURIComponent(search.trim())}`);
    } else {
      navigate('/items');
    }
  };

  return (
    <div>
      {/* ===================== HERO SECTION ===================== */}
      <section className="hero">
        <div className="container hero-content">
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(108,99,255,0.12)', border: '1px solid rgba(108,99,255,0.3)',
            borderRadius: 'var(--radius-full)', padding: '0.4rem 1rem',
            fontSize: '0.82rem', color: 'var(--accent-primary)', marginBottom: '1.5rem',
            fontWeight: 600
          }}>
            <FiZap size={13} /> Campus Lost & Found System
          </div>

          <h1 className="hero-title">
            Reunite with Your<br />
            <span className="gradient-text">Lost Belongings</span>
          </h1>

          <p className="hero-subtitle">
            A centralized platform for students and staff to report, search,
            and recover lost items on campus — fast and effortlessly.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} style={{
            display: 'flex', gap: '0.75rem', maxWidth: 560, margin: '0 auto 2rem',
            background: 'var(--bg-card)', padding: '6px',
            borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
          }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <FiSearch style={{
                position: 'absolute', left: '1rem', top: '50%',
                transform: 'translateY(-50%)', color: 'var(--text-muted)'
              }} size={16} />
              <input
                type="text"
                placeholder="Search for an item..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%', background: 'transparent', border: 'none',
                  color: 'var(--text-primary)', outline: 'none', padding: '0.7rem 1rem 0.7rem 2.7rem',
                  fontSize: '0.95rem'
                }}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ flexShrink: 0 }}>
              Search <FiArrowRight size={15} />
            </button>
          </form>

          {/* CTA Buttons */}
          <div className="hero-actions">
            {user ? (
              <>
                <Link to="/post-item" className="btn btn-primary btn-lg">
                  Report an Item
                </Link>
                <Link to="/items" className="btn btn-ghost btn-lg">
                  Browse All Items
                </Link>
              </>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary btn-lg">
                  Get Started Free
                </Link>
                <Link to="/items" className="btn btn-ghost btn-lg">
                  Browse Items
                </Link>
              </>
            )}
          </div>

          {/* Stats */}
          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-number">{stats.total ?? '—'}</div>
              <div className="stat-label">Total Reports</div>
            </div>
            <div className="stat-item">
              <div className="stat-number" style={{ color: 'var(--accent-danger)' }}>
                {stats.lost ?? '—'}
              </div>
              <div className="stat-label">Lost Items</div>
            </div>
            <div className="stat-item">
              <div className="stat-number" style={{ color: 'var(--accent-success)' }}>
                {stats.found ?? '—'}
              </div>
              <div className="stat-label">Found Items</div>
            </div>
            <div className="stat-item">
              <div className="stat-number" style={{ color: 'var(--accent-info)' }}>
                {stats.resolved ?? '—'}
              </div>
              <div className="stat-label">Resolved Cases</div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== FEATURES SECTION ===================== */}
      <section style={{ padding: '4rem 0', background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              Why Use <span style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>LostFoundCampus?</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: 480, margin: '0 auto' }}>
              A smarter way to handle lost & found across your entire campus
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            {[
              { icon: <FiZap size={24} />, title: 'Smart Matching', desc: 'AI-powered matching suggests potential lost-found pairs based on category, keywords, and location.' },
              { icon: <FiSearch size={24} />, title: 'Powerful Search', desc: 'Full-text search across item names, descriptions, tags, and locations in real-time.' },
              { icon: <FiShield size={24} />, title: 'Secure & Private', desc: 'JWT authentication protects your data. Contact info only shared when needed.' },
              { icon: <FiUsers size={24} />, title: 'Direct Messaging', desc: 'Contact item posters directly through our built-in messaging system.' },
            ].map((feature, idx) => (
              <div key={idx} className="card" style={{ textAlign: 'center' }}>
                <div style={{
                  width: 56, height: 56, background: 'rgba(108,99,255,0.12)',
                  border: '1px solid rgba(108,99,255,0.2)', borderRadius: 'var(--radius-md)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 1rem', color: 'var(--accent-primary)'
                }}>
                  {feature.icon}
                </div>
                <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>{feature.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.87rem', lineHeight: 1.7 }}>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== RECENT ITEMS ===================== */}
      <section style={{ padding: '4rem 0' }}>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              Recent <span>Reports</span>
            </h2>
            <Link to="/items" className="btn btn-secondary btn-sm">
              View All <FiArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="spinner-wrapper"><div className="spinner" /></div>
          ) : recentItems.length > 0 ? (
            <div className="items-grid">
              {recentItems.map((item) => (
                <ItemCard key={item._id} item={item} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📭</div>
              <h3>No Items Yet</h3>
              <p>Be the first to report a lost or found item on campus!</p>
              <Link to="/post-item" className="btn btn-primary">
                Post an Item
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
