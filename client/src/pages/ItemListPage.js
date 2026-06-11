import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../api/axios';
import ItemCard from '../components/ItemCard';
import { FiSearch, FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const CATEGORIES = [
  'Electronics', 'Clothing', 'Books & Stationery', 'Accessories',
  'ID & Documents', 'Keys', 'Bags & Wallets', 'Sports Equipment', 'Other'
];

const ItemListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // State
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Filter state (initialized from URL params)
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    type: searchParams.get('type') || '',
    category: searchParams.get('category') || '',
    status: searchParams.get('status') || '',
    location: searchParams.get('location') || '',
    page: Number(searchParams.get('page')) || 1,
  });

  // Fetch items from API
  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.set('search', filters.search);
      if (filters.type) params.set('type', filters.type);
      if (filters.category) params.set('category', filters.category);
      if (filters.status) params.set('status', filters.status);
      if (filters.location) params.set('location', filters.location);
      params.set('page', filters.page);
      params.set('limit', 12);

      const { data } = await API.get(`/items?${params.toString()}`);
      setItems(data.items);
      setTotalPages(data.totalPages);
      setTotal(data.total);

      // Update URL params
      setSearchParams(params);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters, setSearchParams]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ search: '', type: '', category: '', status: '', location: '', page: 1 });
  };

  const hasActiveFilters = filters.search || filters.type || filters.category || filters.status || filters.location;

  return (
    <div className="page-wrapper">
      <div className="container">
        {/* Header */}
        <div className="section-header" style={{ marginBottom: '1.5rem' }}>
          <div>
            <h1 className="section-title">
              Browse <span>Items</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.3rem' }}>
              {total > 0 ? `${total} items found` : 'Search and filter items below'}
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="filter-bar">
          <div className="filter-row">
            {/* Search Input */}
            <div className="filter-group" style={{ flex: 2, minWidth: 220 }}>
              <div className="filter-label">Search</div>
              <div className="search-bar">
                <FiSearch size={16} />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Search items by name, tags..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchItems()}
                />
              </div>
            </div>

            {/* Type Filter */}
            <div className="filter-group">
              <div className="filter-label">Type</div>
              <select
                className="form-select"
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
              >
                <option value="">All Types</option>
                <option value="lost">🔍 Lost</option>
                <option value="found">✅ Found</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="filter-group">
              <div className="filter-label">Status</div>
              <select
                className="form-select"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">Listed (Active & Pending)</option>
                <option value="active">Active Only</option>
                <option value="resolved">Resolved Cases</option>
                <option value="all">Everything</option>
              </select>
            </div>

            {/* Category Filter */}
            <div className="filter-group">
              <div className="filter-label">Category</div>
              <select
                className="form-select"
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <option value="">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Location Filter */}
            <div className="filter-group">
              <div className="filter-label">Location</div>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Library, Block A..."
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
              />
            </div>

            {/* Clear Button */}
            {hasActiveFilters && (
              <div className="filter-group" style={{ minWidth: 'auto', alignSelf: 'flex-end' }}>
                <button onClick={clearFilters} className="btn btn-ghost btn-sm">
                  <FiX size={14} /> Clear
                </button>
              </div>
            )}
          </div>

          {/* Active type pills */}
          {(filters.type || filters.category || filters.status) && (
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
              {filters.type && (
                <span className={`badge badge-${filters.type}`} style={{ cursor: 'pointer' }}
                  onClick={() => handleFilterChange('type', '')}>
                  {filters.type === 'lost' ? '🔍 Lost' : '✅ Found'} ×
                </span>
              )}
              {filters.status && (
                <span className={`badge badge-${filters.status}`} style={{ cursor: 'pointer' }}
                  onClick={() => handleFilterChange('status', '')}>
                  {filters.status.charAt(0).toUpperCase() + filters.status.slice(1)} ×
                </span>
              )}
              {filters.category && (
                <span className="badge" style={{
                  background: 'rgba(108,99,255,0.15)', color: 'var(--accent-primary)',
                  border: '1px solid rgba(108,99,255,0.3)', cursor: 'pointer'
                }} onClick={() => handleFilterChange('category', '')}>
                  {filters.category} ×
                </span>
              )}
            </div>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <div className="spinner-wrapper"><div className="spinner" /></div>
        ) : items.length > 0 ? (
          <>
            <div className="items-grid">
              {items.map((item) => (
                <ItemCard key={item._id} item={item} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '0.5rem', marginTop: '2.5rem'
              }}>
                <button
                  className="btn btn-ghost btn-sm"
                  disabled={filters.page <= 1}
                  onClick={() => setFilters((prev) => ({ ...prev, page: prev.page - 1 }))}
                >
                  <FiChevronLeft size={16} />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    className={`btn btn-sm ${p === filters.page ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setFilters((prev) => ({ ...prev, page: p }))}
                  >
                    {p}
                  </button>
                ))}

                <button
                  className="btn btn-ghost btn-sm"
                  disabled={filters.page >= totalPages}
                  onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}
                >
                  <FiChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">🔎</div>
            <h3>No Items Found</h3>
            <p>
              {hasActiveFilters
                ? 'No items match your search criteria. Try adjusting your filters.'
                : 'No items have been posted yet. Be the first!'}
            </p>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="btn btn-secondary" style={{ marginTop: '0.5rem' }}>
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemListPage;
