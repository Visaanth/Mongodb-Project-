// =============================================
// User Model - MongoDB Schema for Users
// =============================================

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    // Full name of the user
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },

    // Email used for login (must be unique)
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, 'Please enter a valid email'],
    },

    // Hashed password (never store plain text)
    password: {
      type: String,
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't include password in queries by default
    },

    // Student/Staff ID (optional)
    studentId: {
      type: String,
      trim: true,
      default: '',
    },

    // Department or role on campus
    department: {
      type: String,
      trim: true,
      default: '',
    },

    // Phone number for contact
    phone: {
      type: String,
      trim: true,
      default: '',
    },

    // Profile avatar URL
    avatar: {
      type: String,
      default: '',
    },

    // Google ID for social logins
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },

    // Role for future admin features
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// =============================================
// PRE-SAVE HOOK: Hash password before saving
// =============================================
userSchema.pre('save', async function () {
  // Only hash if password was changed/is new and exists
  if (!this.isModified('password') || !this.password) return;

  // Generate salt and hash the password
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// =============================================
// INSTANCE METHOD: Compare entered password
// =============================================
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
