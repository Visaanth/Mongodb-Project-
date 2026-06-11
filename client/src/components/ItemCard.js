import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiMapPin, FiCalendar, FiTag
} from 'react-icons/fi';

// Category emoji map for visual flair
const categoryEmojis = {
  'Electronics': '📱',
  'Clothing': '👕',
  'Books & Stationery': '📚',
  'Accessories': '👓',
  'ID & Documents': '🪪',
  'Keys': '🔑',
  'Bags & Wallets': '👜',
  'Sports Equipment': '⚽',
  'Other': '📦',
};

const ItemCard = ({ item }) => {
  const navigate = useNavigate();

  const formattedDate = new Date(item.date).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });

  const posterName = item.postedBy?.name || 'Anonymous';
  const posterInitial = posterName.charAt(0).toUpperCase();

  return (
    <div
      className="item-card"
      onClick={() => navigate(`/items/${item._id}`)}
      style={{ cursor: 'pointer' }}
    >
      {/* Image or Placeholder */}
      {item.image ? (
        <img
          className="item-card-image"
          src={`${process.env.REACT_APP_BASE_URL || 'http://localhost:5000'}${item.image}`}
          alt={item.title}
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      ) : (
        <div className="item-card-image-placeholder">
          {categoryEmojis[item.category] || '📦'}
        </div>
      )}

      {/* Card Body */}
      <div className="item-card-body">
        <div className="item-card-header">
          <h3 className="item-card-title">{item.title}</h3>
          <span className={`badge badge-${item.type}`}>
            {item.type === 'lost' ? '🔍 Lost' : '✅ Found'}
          </span>
        </div>

        <p className="item-card-desc">{item.description}</p>

        {/* Meta info */}
        <div className="item-card-meta">
          <div className="item-card-meta-row">
            <FiMapPin size={12} />
            <span>{item.location}</span>
          </div>
          <div className="item-card-meta-row">
            <FiCalendar size={12} />
            <span>{formattedDate}</span>
          </div>
          <div className="item-card-meta-row">
            <FiTag size={12} />
            <span>{item.category}</span>
          </div>
        </div>

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div className="tags-container" style={{ marginTop: '0.75rem' }}>
            {item.tags.slice(0, 3).map((tag, idx) => (
              <span key={idx} className="tag">#{tag}</span>
            ))}
            {item.tags.length > 3 && (
              <span className="tag">+{item.tags.length - 3}</span>
            )}
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="item-card-footer">
        <div className="item-poster">
          <div className="avatar-sm">
            {item.postedBy?.avatar ? (
              <img src={`${process.env.REACT_APP_BASE_URL || 'http://localhost:5000'}${item.postedBy.avatar}`} alt={posterName} />
            ) : (
              posterInitial
            )}
          </div>
          <span>{posterName}</span>
        </div>
        <span className={`badge badge-${item.status}`} style={{ fontSize: '0.68rem' }}>
          {item.status}
        </span>
      </div>
    </div>
  );
};

export default ItemCard;
