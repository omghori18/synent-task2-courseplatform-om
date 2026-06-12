const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/email');

const generateToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: 'All fields are required' });
    if (password.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters' });

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ message: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate verification token
    const verifyToken = crypto.randomBytes(32).toString('hex');
    const verifyTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      verifyToken,
      verifyTokenExpiry,
      isVerified: false,
    });

    // Send verification email
    try {
      await sendVerificationEmail(user.email, user.name, verifyToken);
    } catch (emailErr) {
      console.error('Failed to send verification email:', emailErr.message);
      // Still allow registration even if email fails
    }

    const token = generateToken(user);
    return res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, isVerified: false },
    });
  } catch (err) {
    console.error('Register error:', err);
    next(err);
  }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required' });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = generateToken(user);
    return res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, isVerified: user.isVerified },
    });
  } catch (err) {
    console.error('Login error:', err);
    next(err);
  }
});

// POST /api/auth/verify-email
router.post('/verify-email', async (req, res) => {
  try {
    const { token, email } = req.body;
    if (!token || !email) return res.status(400).json({ message: 'Token and email are required' });

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      verifyToken: token,
      verifyTokenExpiry: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification link' });
    }

    user.isVerified = true;
    user.verifyToken = undefined;
    user.verifyTokenExpiry = undefined;
    await user.save();

    return res.json({ success: true, message: 'Email verified successfully' });
  } catch (err) {
    console.error('Verify email error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/resend-verification
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const trimmedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: trimmedEmail });
    if (!user) {
      return res.status(404).json({ message: `No account registered with email "${trimmedEmail}".` });
    }
    if (user.isVerified) return res.json({ success: true, message: 'Email is already verified' });

    // Generate new token
    const verifyToken = crypto.randomBytes(32).toString('hex');
    user.verifyToken = verifyToken;
    user.verifyTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    await sendVerificationEmail(user.email, user.name, verifyToken);

    return res.json({ success: true, message: 'Verification email sent' });
  } catch (err) {
    console.error('Resend verification error:', err);
    res.status(500).json({ message: 'Failed to resend verification email' });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const trimmedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: trimmedEmail });
    if (!user) {
      return res.status(404).json({ message: `No account registered with email "${trimmedEmail}". Please check spelling.` });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetToken = resetToken;
    user.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    await sendPasswordResetEmail(user.email, user.name, resetToken);

    return res.json({ success: true, message: 'Password reset email sent' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Failed to send reset email' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ message: 'Token and password are required' });
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset link' });
    }

    user.password = await bcrypt.hash(password, 12);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    return res.json({ success: true, message: 'Password reset successfully' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/auth/me
router.get('/me', require('../middleware/protect'), async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password -verifyToken -resetToken')
      .populate('enrolledCourses', 'title thumbnail _id');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const Progress = require('../models/Progress');
    const courseProgress = await Progress.find({ user: user._id });

    const userObj = user.toObject();
    userObj.enrolledCourses = userObj.enrolledCourses.map(course => {
      const prog = courseProgress.find(p => p.course.toString() === course._id.toString());
      return {
        ...course,
        progressPercent: prog ? prog.progressPercent : 0
      };
    });

    return res.json(userObj);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
