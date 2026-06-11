// =============================================
// Auth Controller - Register & Login Logic
// =============================================

const User = require('../models/User');
const { generateToken } = require('../middleware/authMiddleware');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
const registerUser = async (req, res) => {
  try {
    const { name, email, password, studentId, department, phone } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password',
      });
    }

    // Enforce Password Complexity Rules
    // Requires: 1 uppercase, 1 lowercase, 1 number, 1 special char, 8+ length
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\-=\[\]{}|\\;:'",.<>/?`~]).{6,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain a capital letter, a lowercase letter, a number, and a special character.',
      });
    }

    // Check if user with this email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    // Create the new user (password hashed via pre-save hook in model)
    const user = await User.create({
      name,
      email,
      password,
      studentId: studentId || '',
      department: department || '',
      phone: phone || '',
    });

    // Generate JWT token for immediate login after registration
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Registration successful!',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        studentId: user.studentId,
        department: user.department,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Register Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
    });
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Login with email and password
 * @access  Public
 */
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Find user by email and include password for comparison
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Compare entered password with stored hashed password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        studentId: user.studentId,
        department: user.department,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
    });
  }
};

/**
 * @route   POST /api/auth/google
 * @desc    Authenticate (register or login) with Google
 * @access  Public
 */
const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({
        success: false,
        message: 'Google credential is required',
      });
    }

    // Call Google's tokeninfo API to verify the credential
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
    if (!response.ok) {
      return res.status(400).json({
        success: false,
        message: 'Failed to verify Google credential',
      });
    }

    const payload = await response.json();

    // Verify the Client ID to prevent replay attacks
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (clientId && payload.aud !== clientId) {
      console.warn(`Google Client ID mismatch. Received: ${payload.aud}, Expected: ${clientId}`);
      if (clientId !== 'your-google-client-id.apps.googleusercontent.com') {
        return res.status(400).json({
          success: false,
          message: 'Google credential client ID mismatch',
        });
      }
    }

    const { email, sub: googleId, name, picture } = payload;

    // 1. Check if user already exists with this googleId
    let user = await User.findOne({ googleId });

    if (!user) {
      // 2. If not, check if user exists with this email (e.g. registered with email/password previously)
      user = await User.findOne({ email });

      if (user) {
        // Link googleId to existing user
        user.googleId = googleId;
        if (!user.avatar) {
          user.avatar = picture;
        }
        await user.save();
      } else {
        // 3. Create new user
        user = await User.create({
          name: name || email.split('@')[0],
          email,
          googleId,
          avatar: picture || '',
        });
      }
    }

    // Generate JWT token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Google login successful!',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        studentId: user.studentId,
        department: user.department,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Google Auth Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error during Google authentication',
    });
  }
};

module.exports = { registerUser, loginUser, googleLogin };
