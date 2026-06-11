import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ItemListPage from './pages/ItemListPage';
import ItemDetailPage from './pages/ItemDetailPage';
import PostItemPage from './pages/PostItemPage';
import EditItemPage from './pages/EditItemPage';
import ProfilePage from './pages/ProfilePage';
import DashboardPage from './pages/DashboardPage';
import MessagesPage from './pages/MessagesPage';

// Components
import Navbar from './components/Navbar';

// Protected Route Wrapper - Redirects to login if not authenticated
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

// Public Route Wrapper - Redirects to dashboard if already logged in
const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  return !user ? children : <Navigate to="/dashboard" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        {/* Global navbar on all pages */}
        <Navbar />

        {/* Toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#141d35',
              color: '#e8eaf6',
              border: '1px solid rgba(108, 99, 255, 0.3)',
              borderRadius: '12px',
              fontSize: '0.9rem',
            },
            success: {
              iconTheme: { primary: '#43d982', secondary: '#0a0e1a' },
            },
            error: {
              iconTheme: { primary: '#ff5757', secondary: '#0a0e1a' },
            },
          }}
        />

        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/items" element={<ItemListPage />} />
          <Route path="/items/:id" element={<ItemDetailPage />} />

          {/* Auth Routes (redirect to dashboard if logged in) */}
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

          {/* Protected Routes (require login) */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/post-item" element={<ProtectedRoute><PostItemPage /></ProtectedRoute>} />
          <Route path="/edit-item/:id" element={<ProtectedRoute><EditItemPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />

          {/* Catch-all 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
