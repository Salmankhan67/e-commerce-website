const express = require('express');
const router = express.Router();
const PromoCode = require('../models/PromoCode');
const { verifyToken, isAdmin } = require('../middleware/auth'); // ← USING YOUR EXISTING AUTH

// ========== TEST ROUTE - Check if route works ==========
router.get('/test', (req, res) => {
  res.json({ message: 'Promo route is working!' });
});

// ========== CREATE PROMO CODE (Admin only) ==========
router.post('/', verifyToken, isAdmin, async (req, res) => { // ← USING verifyToken AND isAdmin
  console.log('📦 Received promo creation request:', req.body);
  
  try {
    const { code, discountType, discountValue, minOrderValue, maxDiscount, startDate, endDate, usageLimit, isActive } = req.body;

    // Validation
    if (!code || !discountType || !discountValue) {
      return res.status(400).json({ 
        message: 'Missing required fields: code, discountType, discountValue' 
      });
    }

    // Check if code already exists
    const existingPromo = await PromoCode.findOne({ code: code.toUpperCase() });
    if (existingPromo) {
      return res.status(400).json({ message: 'Promo code already exists' });
    }

    // Create new promo
    const promo = new PromoCode({
      code: code.toUpperCase(),
      discountType,
      discountValue: Number(discountValue),
      minOrderValue: minOrderValue ? Number(minOrderValue) : 0,
      maxDiscount: maxDiscount ? Number(maxDiscount) : null,
      startDate: startDate || null,
      endDate: endDate || null,
      usageLimit: usageLimit ? Number(usageLimit) : null,
      isActive: isActive !== undefined ? isActive : true
    });
    
    const savedPromo = await promo.save();
    console.log('✅ Promo created:', savedPromo.code);
    
    res.status(201).json({ 
      message: 'Promo code created successfully', 
      promo: savedPromo 
    });

  } catch (error) {
    console.error('❌ Error creating promo:', error);
    res.status(500).json({ 
      message: error.message || 'Failed to create promo code' 
    });
  }
});

// ========== GET ALL PROMO CODES (Admin only) ==========
router.get('/', verifyToken, isAdmin, async (req, res) => { // ← USING verifyToken AND isAdmin
  try {
    const promos = await PromoCode.find().sort({ createdAt: -1 });
    res.json(promos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ========== VALIDATE PROMO CODE (Any logged in user) ==========
router.post('/validate', verifyToken, async (req, res) => { // ← USING verifyToken ONLY
  try {
    const { code, subtotal } = req.body;
    
    const promo = await PromoCode.findOne({ code: code.toUpperCase(), isActive: true });
    
    if (!promo) {
      return res.status(404).json({ valid: false, message: 'Invalid promo code' });
    }

    // Check date range
    const now = new Date();
    if (promo.startDate && now < promo.startDate) {
      return res.status(400).json({ valid: false, message: 'Promo not yet active' });
    }
    if (promo.endDate && now > promo.endDate) {
      return res.status(400).json({ valid: false, message: 'Promo has expired' });
    }

    // Check min order
    if (promo.minOrderValue > subtotal) {
      return res.status(400).json({ 
        valid: false, 
        message: `Minimum order of ${promo.minOrderValue} required` 
      });
    }

    // Check usage limit
    if (promo.usageLimit && promo.usedCount >= promo.usageLimit) {
      return res.status(400).json({ valid: false, message: 'Promo usage limit exceeded' });
    }

    // Calculate discount
    let discountAmount = 0;
    if (promo.discountType === 'percentage') {
      discountAmount = (subtotal * promo.discountValue) / 100;
      if (promo.maxDiscount && discountAmount > promo.maxDiscount) {
        discountAmount = promo.maxDiscount;
      }
    } else {
      discountAmount = promo.discountValue;
    }

    res.json({
      valid: true,
      promo: {
        id: promo._id,
        code: promo.code,
        discountType: promo.discountType,
        discountValue: promo.discountValue,
        discountAmount: Math.round(discountAmount)
      }
    });

  } catch (error) {
    res.status(500).json({ valid: false, message: error.message });
  }
});

// ========== TOGGLE PROMO STATUS (Admin only) ==========
router.patch('/:id/toggle', verifyToken, isAdmin, async (req, res) => { // ← USING verifyToken AND isAdmin
  try {
    const promo = await PromoCode.findById(req.params.id);
    if (!promo) {
      return res.status(404).json({ message: 'Promo code not found' });
    }

    promo.isActive = !promo.isActive;
    await promo.save();
    
    res.json({ 
      message: `Promo ${promo.isActive ? 'activated' : 'deactivated'}`,
      isActive: promo.isActive 
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ========== DELETE PROMO (Admin only) ==========
router.delete('/:id', verifyToken, isAdmin, async (req, res) => { // ← USING verifyToken AND isAdmin
  try {
    const promo = await PromoCode.findByIdAndDelete(req.params.id);
    if (!promo) {
      return res.status(404).json({ message: 'Promo code not found' });
    }
    res.json({ message: 'Promo code deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;