import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import {
  FiPlusCircle, FiUser, FiLogOut, FiMenu,
  FiX, FiMessageSquare, FiHome, FiList, FiGrid, FiMapPin,
  FiSun, FiMoon
} from 'react-icons/fi';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const [theme, setTheme] = useState(() => localStorage.getItem('app-theme') || 'light');

  // Sync theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // Fetch unread message count
  useEffect(() => {
    if (user) {
      const fetchUnread = async () => {
        try {
          const { data } = await API.get('/messages/unread-count');
          setUnreadCount(data.count);
        } catch {
          // Silently fail
        }
      };
      fetchUnread();
      const interval = setInterval(fetchUnread, 30000); // Poll every 30s
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <FiMapPin size={22} />
          LostFound<span style={{ color: '#ff6584', WebkitTextFillColor: '#ff6584' }}>Campus</span>
        </Link>

        {/* Desktop Nav Links */}
        <ul className={`navbar-links ${mobileOpen ? 'mobile-open' : ''}`}>
          <li>
            <NavLink to="/" end onClick={() => setMobileOpen(false)}>
              <FiHome size={16} /> Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/items" onClick={() => setMobileOpen(false)}>
              <FiList size={16} /> Browse Items
            </NavLink>
          </li>
          {user && (
            <>
              <li>
                <NavLink to="/dashboard" onClick={() => setMobileOpen(false)}>
                  <FiGrid size={16} /> Dashboard
                </NavLink>
              </li>
              <li>
                <NavLink to="/post-item" onClick={() => setMobileOpen(false)}>
                  <FiPlusCircle size={16} /> Post Item
                </NavLink>
              </li>
              <li>
                <NavLink to="/messages" onClick={() => setMobileOpen(false)}>
                  <FiMessageSquare size={16} /> Messages
                  {unreadCount > 0 && (
                    <span className="nav-badge">{unreadCount}</span>
                  )}
                </NavLink>
              </li>
            </>
          )}
        </ul>

        {/* Actions */}
        <div className="navbar-actions">
          {/* Theme Toggle Button */}
          <button onClick={toggleTheme} className="btn btn-ghost btn-sm" style={{ padding: '0.4rem', marginRight: '0.2rem' }} aria-label="Toggle Theme">
            {theme === 'light' ? <FiSun size={18} /> : <FiMoon size={18} />}
          </button>

          {user ? (
            <>
              <Link to="/profile" className="btn btn-ghost btn-sm">
                <FiUser size={15} />
                {user.name.split(' ')[0]}
              </Link>
              <button onClick={handleLogout} className="btn btn-danger btn-sm">
                <FiLogOut size={15} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
            </>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
