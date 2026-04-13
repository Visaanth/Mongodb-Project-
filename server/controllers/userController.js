// =============================================
// User Controller - Profile Management
// =============================================

const User = require('../models/User');

/**
 * @route   GET /api/users/profile
 * @desc    Get logged-in user's profile
 * @access  Protected
 */
const getProfile = async (req, res) => {
  try {
    // req.user is set by the protect middleware
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        studentId: user.studentId,
        department: user.department,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Get Profile Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @route   PUT /api/users/profile
 * @desc    Update logged-in user's profile
 * @access  Protected
 */
const updateProfile = async (req, res) => {
  try {
    const { name, studentId, department, phone } = req.body;

    // Find the current user
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Update only the provided fields
    if (name) user.name = name;
    if (studentId !== undefined) user.studentId = studentId;
    if (department !== undefined) user.department = department;
    if (phone !== undefined) user.phone = phone;

    // If an avatar image was uploaded, update it
    if (req.file) {
      user.avatar = `/uploads/${req.file.filename}`;
    }

    // Save the updated user document
    const updatedUser = await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        studentId: updatedUser.studentId,
        department: updatedUser.department,
        phone: updatedUser.phone,
        avatar: updatedUser.avatar,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    console.error('Update Profile Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @route   PUT /api/users/change-password
 * @desc    Change user password
 * @access  Protected
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new password',
      });
    }

    // Fetch user with password field included
    const user = await User.findById(req.user._id).select('+password');

    // Verify current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    // Set new password (will be hashed by pre-save hook)
    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change Password Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @route   GET /api/users/:id
 * @desc    Get a specific user's public profile (for messaging)
 * @access  Protected
 */
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -email');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error('Get User Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getProfile, updateProfile, changePassword, getUserById };
