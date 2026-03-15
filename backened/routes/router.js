const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const promoRoutes = require('./promo');
const googleAuthRouter = require('./googleAuth');

// ========== SIGNUP ==========
router.post('/signup', async (req, res) => {
  console.log('Signup hit:', req.body);
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const role = email === process.env.ADMIN_EMAIL ? 'admin' : 'user';

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role
    });

    const saved = await newUser.save();

    const token = jwt.sign(
      { id: saved._id, email: saved.email, role: saved.role },
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: '1d' }
    );

    res.status(201).json({
      message: 'User created',
      user: { id: saved._id, name: saved.name, email: saved.email, role: saved.role },
      token
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ========== LOGIN ==========
router.post('/login', async (req, res) => {
  console.log('Login hit:', req.body);
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Login successful',
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ========== MOUNT SUB-ROUTERS ==========
router.use('/promo', promoRoutes);
router.use('/google', googleAuthRouter); // ← THIS IS CORRECT

console.log('✅ Router loaded with /google route');
module.exports = router;