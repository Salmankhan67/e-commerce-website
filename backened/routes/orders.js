const express = require('express');
const router = express.Router();
const Order = require('../models/Orders');
const { verifyToken, isAdmin } = require('../middleware/auth');

// ========== CREATE NEW ORDER (Checkout) ==========
router.post('/', verifyToken, async (req, res) => {
  try {
    console.log('📦 Creating new order:', req.body);
    
    // Add userId from token and set initial status
    const orderData = {
      ...req.body,
      userId: req.user.id,
      paymentStatus: req.body.paymentMethod === 'cod' ? 'Pending' : 'Processing',
      status: 'Pending'
    };
    
    const order = new Order(orderData);
    const savedOrder = await order.save();
    
    console.log('✅ Order created successfully. ID:', savedOrder._id);
    res.status(201).json(savedOrder);
    
  } catch (error) {
    console.error('❌ Error creating order:', error);
    res.status(500).json({ 
      message: 'Failed to create order', 
      error: error.message 
    });
  }
});

// ========== GET ALL ORDERS (Admin only) ==========
router.get('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ========== GET USER'S OWN ORDERS ==========
router.get('/my-orders', verifyToken, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id })
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ========== GET SINGLE ORDER BY ID ==========
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('userId', 'name email');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if user is admin or the order owner
    if (req.user.role !== 'admin' && order.userId._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ========== UPDATE ORDER STATUS (Admin only) ==========
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    
    const order = await Order.findByIdAndUpdate(
      req.params.id, 
      { status }, 
      { new: true }
    );
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    console.log(`✅ Order ${req.params.id} status updated to: ${status}`);
    res.json(order);
    
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ========== UPDATE PAYMENT STATUS ==========
router.patch('/:id/payment', verifyToken, async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Only allow admin or order owner to update payment status
    if (req.user.role !== 'admin' && order.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    order.paymentStatus = paymentStatus;
    await order.save();
    
    res.json({ message: 'Payment status updated', order });
    
  } catch (error) {
    console.error('Error updating payment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ========== DELETE ORDER (Admin only) ==========
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    console.log(`✅ Order ${req.params.id} deleted`);
    res.json({ message: 'Order deleted successfully' });
    
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;