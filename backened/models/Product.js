const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  discount: { type: Number, default: 0, min: 0, max: 100 }, // percentage
  image: { type: String, default: 'https://via.placeholder.com/300' },
  description: { type: String, default: '' },
  stock: { type: Number, default: 100, min: 0 }
});

module.exports = mongoose.model('Product', productSchema);