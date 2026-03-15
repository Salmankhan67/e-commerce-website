const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { OAuth2Client } = require('google-auth-library');

console.log('🔍 Google Auth route loaded');
console.log('GOOGLE_CLIENT_ID exists:', !!process.env.GOOGLE_CLIENT_ID);

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

// TEST ROUTE - MUST be accessible at /api/auth/google/test
router.get('/test', (req, res) => {
  console.log('✅ Test route hit!');
  res.json({ 
    message: 'Google Auth route is WORKING!',
    googleIdExists: !!process.env.GOOGLE_CLIENT_ID
  });
});

// MAIN GOOGLE LOGIN ROUTE
router.post('/', async (req, res) => {
  console.log('📥 Google login hit!');
  console.log('Body:', req.body);
  
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'No code provided' });
    }

    // Exchange code for tokens
    const { tokens } = await client.getToken({
      code,
      redirect_uri: 'postmessage'
    });

    // Verify the token
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { email, name, sub: googleId, picture } = payload;

    // Find or create user
    let user = await User.findOne({ email });
    
    if (!user) {
      user = new User({
        name,
        email,
        googleId,
        avatar: picture,
        role: 'user',
        password: 'google-auth-no-password'
      });
      await user.save();
    }

    // Create JWT
    const jwtToken = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token: jwtToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });

  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;