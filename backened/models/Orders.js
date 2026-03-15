const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product', 
    required: true 
  },
  name: String,
  price: Number,
  quantity: Number,
  image: String
});

const orderSchema = new mongoose.Schema({
  // User reference
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  
  // Order items
  items: [orderItemSchema],
  
  // Price breakdown
  subtotal: { type: Number, required: true },
  shipping: { type: Number, required: true },
  tax: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  currency: { type: String, default: 'PKR' },
  
  // Customer information
  customerInfo: {
    fullName: String,
    email: String,
    phone: String
  },
  
  // Shipping address
  shippingAddress: {
    fullName: String,
    address: String,
    city: String,
    province: String,
    postalCode: String,
    country: String,
    phone: String
  },
  
  // Billing address (if different)
  billingAddress: {
    fullName: String,
    address: String,
    city: String,
    province: String,
    postalCode: String,
    country: String,
    phone: String
  },
  
  // Delivery preferences
  deliveryInstructions: String,
  preferredDeliveryDate: String,
  preferredDeliveryTime: String,
  
  // Payment
  paymentMethod: { 
    type: String, 
    enum: ['easypaisa', 'jazzcash', 'card', 'cod'],
    required: true 
  },
  paymentDetails: mongoose.Schema.Types.Mixed,
  paymentStatus: { 
    type: String, 
    enum: ['Pending', 'Processing', 'Completed', 'Failed'],
    default: 'Pending'
  },
  
  // Promo code
  promoCode: String,
  
  // Order status
  status: { 
    type: String, 
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending'
  }
  
}, { 
  timestamps: true // Adds createdAt and updatedAt automatically
});

// Virtual for 'date' field to match frontend expectation
orderSchema.virtual('date').get(function() {
  return this.createdAt;
});

// Ensure virtual fields are serialized
orderSchema.set('toJSON', { virtuals: true });
orderSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Order', orderSchema);