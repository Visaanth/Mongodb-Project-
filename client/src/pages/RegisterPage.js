import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiLock, FiPhone, FiBook, FiHash, FiEye, FiEyeOff, FiMapPin } from 'react-icons/fi';
import GoogleLoginButton from '../components/GoogleLoginButton';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, loginWithGoogle, loading } = useAuth();

  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    studentId: '', department: '', phone: ''
  });

  const handleGoogleSuccess = async (credential) => {
    const result = await loginWithGoogle(credential);
    if (result.success) {
      toast.success('Account created successfully! 👋');
      navigate('/dashboard');
    } else {
      toast.error(result.message);
    }
  };
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Min 6 characters';
    else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\-=[\]{}|\\;:'",.<>/?`~]).{6,}$/.test(formData.password)) {
      newErrors.password = 'Need uppercase, lowercase, number, and special character';
    }
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    const { confirmPassword, ...submitData } = formData;
    const result = await register(submitData);
    if (result.success) {
      toast.success('Account created successfully! 🎉');
      navigate('/dashboard');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card" style={{ maxWidth: 520 }}>
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <FiMapPin size={28} color="white" />
          </div>
          <h1 className="auth-title">Join LostFoundCampus</h1>
          <p className="auth-subtitle">Create your account to get started</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {/* Name & Student ID */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label"><FiUser size={13} style={{ marginRight: 4 }} /> Full Name*</label>
              <input type="text" name="name" className={`form-input ${errors.name ? 'input-error' : ''}`}
                placeholder="John Doe" value={formData.name} onChange={handleChange} />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>
            <div className="form-group">
              <label className="form-label"><FiHash size={13} style={{ marginRight: 4 }} /> Student ID</label>
              <input type="text" name="studentId" className="form-input"
                placeholder="e.g. STU2024001" value={formData.studentId} onChange={handleChange} />
            </div>
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label"><FiMail size={13} style={{ marginRight: 4 }} /> Email Address*</label>
            <input type="email" name="email" className={`form-input ${errors.email ? 'input-error' : ''}`}
              placeholder="you@campus.edu" value={formData.email} onChange={handleChange} />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          {/* Department & Phone */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label"><FiBook size={13} style={{ marginRight: 4 }} /> Department</label>
              <input type="text" name="department" className="form-input"
                placeholder="e.g. Computer Science" value={formData.department} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label"><FiPhone size={13} style={{ marginRight: 4 }} /> Phone</label>
              <input type="tel" name="phone" className="form-input"
                placeholder="+91 XXXXX XXXXX" value={formData.phone} onChange={handleChange} />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label"><FiLock size={13} style={{ marginRight: 4 }} /> Password*</label>
            <div style={{ position: 'relative' }}>
              <input type={showPassword ? 'text' : 'password'} name="password"
                className={`form-input ${errors.password ? 'input-error' : ''}`}
                placeholder="Include A-Z, a-z, 0-9, and symbols" value={formData.password} onChange={handleChange}
                style={{ paddingRight: '3rem' }} />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label className="form-label"><FiLock size={13} style={{ marginRight: 4 }} /> Confirm Password*</label>
            <input type="password" name="confirmPassword"
              className={`form-input ${errors.confirmPassword ? 'input-error' : ''}`}
              placeholder="Re-enter your password" value={formData.confirmPassword} onChange={handleChange} />
            {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
          </div>

          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}
            style={{ width: '100%', marginTop: '0.5rem' }}>
            {loading
              ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Creating account...</>
              : 'Create Account →'
            }
          </button>
        </form>

        <div className="auth-divider">or</div>

        <GoogleLoginButton
          onSuccess={handleGoogleSuccess}
          onError={(err) => toast.error(err)}
          text="signup_with"
        />

        <p className="auth-link" style={{ marginTop: '1.5rem' }}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
