const mongoose = require('mongoose');

const promoSchema = new mongoose.Schema({
  code: { 
    type: String, 
    required: [true, 'Promo code is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  description: { 
    type: String,
    default: function() {
      if (this.discountType === 'percentage') {
        return `${this.discountValue}% off`;
      } else {
        return `Rs. ${this.discountValue} off`;
      }
    }
  },
  discountType: { 
    type: String, 
    enum: ['percentage', 'fixed'], 
    required: [true, 'Discount type is required'] 
  },
  discountValue: { 
    type: Number, 
    required: [true, 'Discount value is required'],
    min: [0, 'Discount cannot be negative']
  },
  minOrderValue: { 
    type: Number, 
    default: 0,
    min: 0
  },
  maxDiscount: { 
    type: Number,
    min: 0
  },
  startDate: { 
    type: Date,
    default: Date.now
  },
  endDate: { 
    type: Date
  },
  usageLimit: { 
    type: Number,
    min: 1
  },
  usedCount: { 
    type: Number, 
    default: 0,
    min: 0
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Add index for faster queries
promoSchema.index({ isActive: 1, startDate: 1, endDate: 1 });

// Method to check if promo is valid
promoSchema.methods.isValid = function(subtotal) {
  const now = new Date();
  
  if (!this.isActive) return { valid: false, message: 'Promo code is inactive' };
  if (this.startDate && now < this.startDate) return { valid: false, message: 'Promo code not yet active' };
  if (this.endDate && now > this.endDate) return { valid: false, message: 'Promo code has expired' };
  if (subtotal < this.minOrderValue) return { valid: false, message: `Minimum order of Rs. ${this.minOrderValue} required` };
  if (this.usageLimit && this.usedCount >= this.usageLimit) return { valid: false, message: 'Promo code usage limit exceeded' };
  
  return { valid: true };
};

// Method to calculate discount
promoSchema.methods.calculateDiscount = function(subtotal) {
  let discountAmount = 0;
  
  if (this.discountType === 'percentage') {
    discountAmount = (subtotal * this.discountValue) / 100;
    if (this.maxDiscount && discountAmount > this.maxDiscount) {
      discountAmount = this.maxDiscount;
    }
  } else {
    discountAmount = this.discountValue;
    if (discountAmount > subtotal) {
      discountAmount = subtotal;
    }
  }
  
  return Math.round(discountAmount);
};

module.exports = mongoose.model('PromoCode', promoSchema);