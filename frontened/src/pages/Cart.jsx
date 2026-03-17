import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { API } from '../config';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  ArrowRight,
  Tag,
  Shield,
  Truck,
  CreditCard,
  AlertCircle,
  X,
  Heart,
  ShoppingBag
} from 'lucide-react';

function Cart() {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(null);

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  const shipping = subtotal > 999 ? 0 : 40;
  const tax = subtotal * 0.18; // 18% GST
  const discount = promoApplied ? subtotal * promoDiscount : 0;
  const total = subtotal + shipping + tax - discount;

  const handlePromoApply = async () => {
    if (!promoCode.trim()) {
      alert('Please enter a promo code');
      return;
    }

    try {
      const token = JSON.parse(localStorage.getItem('auth') || 'null')?.token;
      if (!token) {
        alert('Please login to apply promo');
        return;
      }

      const response = await fetch(`${API.promo}/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          code: promoCode,
          subtotal: subtotal
        })
      });

      const data = await response.json();

      if (data.valid) {
        setPromoApplied(true);
        setPromoDiscount(data.promo.discountAmount / subtotal);
        alert(`✅ Promo applied! You saved Rs. ${data.promo.discountAmount}`);
      } else {
        alert('❌ ' + data.message);
      }
    } catch (error) {
      console.error('Error applying promo:', error);
      alert('❌ Failed to validate promo');
    }
  };

  const handleRemovePromo = () => {
    setPromoApplied(false);
    setPromoDiscount(0);
    setPromoCode('');
  };

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 1) {
      setShowRemoveConfirm(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  const handleRemoveItem = (itemId) => {
    try {
      removeFromCart(itemId);
      setShowRemoveConfirm(null);
      
      // Show success notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      notification.textContent = 'Item removed from cart';
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 2000);
    } catch (error) {
      console.error('Error removing item:', error);
      alert('Failed to remove item. Please try again.');
    }
  };

  const handleClearCart = () => {
    try {
      if (window.confirm('Are you sure you want to clear your entire cart?')) {
        clearCart();
        
        // Show success notification
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        notification.textContent = 'Cart cleared successfully!';
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 2000);
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      alert('Failed to clear cart. Please try again.');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-indigo-600 mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Continue Shopping
          </button>

          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="relative">
              <ShoppingCart className="w-24 h-24 text-gray-300 mx-auto mb-6" />
              <div className="absolute top-0 right-1/2 transform translate-x-12">
                <X className="w-8 h-8 text-red-300" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Your cart is empty</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Looks like you haven't added anything to your cart yet. Explore our products and find something you'll love!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-8 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition flex items-center justify-center"
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                Start Shopping
              </button>
              <button
                onClick={() => navigate('/wishlist')}
                className="px-8 py-3 border-2 border-indigo-600 text-indigo-600 rounded-xl hover:bg-indigo-50 transition flex items-center justify-center"
              >
                <Heart className="w-5 h-5 mr-2" />
                View Wishlist
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with back button */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Continue Shopping
          </button>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Shopping Cart ({cart.length} {cart.length === 1 ? 'item' : 'items'})
          </h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              {/* Cart Header */}
              <div className="hidden md:grid grid-cols-12 gap-4 p-6 bg-gray-50 border-b font-medium text-gray-600">
                <div className="col-span-6">Product</div>
                <div className="col-span-2 text-center">Price</div>
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-2 text-center">Total</div>
              </div>

              {/* Cart Items List */}
              <div className="divide-y divide-gray-200">
                {cart.map((item) => (
                  <div key={item._id} className="p-6 hover:bg-gray-50 transition group">
                    {/* Remove Confirmation Modal */}
                    {showRemoveConfirm === item._id && (
                      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl p-6 max-w-sm mx-4">
                          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-center mb-2">Remove Item?</h3>
                          <p className="text-gray-500 text-center mb-6">
                            Are you sure you want to remove {item.name} from your cart?
                          </p>
                          <div className="flex gap-3">
                            <button
                              onClick={() => setShowRemoveConfirm(null)}
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleRemoveItem(item._id)}
                              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col md:grid md:grid-cols-12 gap-4 items-center">
                      {/* Product Info */}
                      <div className="md:col-span-6 flex items-center space-x-4 w-full">
                        <img
                          src={item.image ? `${API_BASE_URL}${item.image}` : 'https://via.placeholder.com/80?text=Product'}
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded-lg"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/80?text=Product';
                          }}
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800 mb-1">{item.name}</h3>
                          <p className="text-sm text-gray-500 line-clamp-2">{item.description}</p>
                          {item.discount > 0 && (
                            <span className="text-xs text-green-600 font-medium">
                              {item.discount}% off
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Price */}
                      <div className="md:col-span-2 text-center">
                        <span className="md:hidden font-medium text-gray-500 mr-2">Price:</span>
                        <span className="font-semibold text-gray-800">Rs.{item.price}</span>
                      </div>

                      {/* Quantity Controls */}
                      <div className="md:col-span-2 flex items-center justify-center">
                        <span className="md:hidden font-medium text-gray-500 mr-2">Qty:</span>
                        <div className="flex items-center border rounded-lg overflow-hidden">
                          <button
                            onClick={() => handleQuantityChange(item._id, (item.quantity || 1) - 1)}
                            className="px-3 py-2 hover:bg-gray-100 transition"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="px-4 py-2 font-medium min-w-[50px] text-center">
                            {item.quantity || 1}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item._id, (item.quantity || 1) + 1)}
                            className="px-3 py-2 hover:bg-gray-100 transition"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Total and Remove */}
                      <div className="md:col-span-2 flex items-center justify-between md:justify-center">
                        <span className="md:hidden font-medium text-gray-500">Total:</span>
                        <span className="font-bold text-indigo-600">
                          Rs.{(item.price * (item.quantity || 1)).toLocaleString()}
                        </span>
                        <button
                          onClick={() => setShowRemoveConfirm(item._id)}
                          className="ml-2 p-2 text-red-500 hover:bg-red-50 rounded-lg transition opacity-0 group-hover:opacity-100"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cart Actions */}
              <div className="p-6 bg-gray-50 border-t">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => navigate('/dashboard')}
                      className="flex items-center text-indigo-600 hover:text-indigo-700"
                    >
                      <ArrowLeft className="w-4 h-4 mr-1" />
                      Add More Items
                    </button>
                    <button
                      onClick={handleClearCart}
                      className="flex items-center text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Clear Cart
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Order Summary</h2>

              {/* Price Breakdown */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>Rs.{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  {shipping === 0 ? (
                    <span className="text-green-600 font-medium">Free</span>
                  ) : (
                    <span>Rs.{shipping.toLocaleString()}</span>
                  )}
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (18% GST)</span>
                  <span>Rs.{tax.toLocaleString()}</span>
                </div>
                {promoApplied && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({(promoDiscount * 100)}%)</span>
                    <span>-Rs.{discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="border-t pt-4">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-indigo-600">Rs.{total.toLocaleString()}</span>
                  </div>
                  {subtotal < 999 && (
                    <p className="text-xs text-gray-500 mt-2">
                      Add Rs.{(999 - subtotal).toLocaleString()} more for free shipping
                    </p>
                  )}
                </div>
              </div>

              {/* Promo Code */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Promo Code
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Enter code"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    disabled={promoApplied}
                  />
                  {promoApplied ? (
                    <button
                      onClick={handleRemovePromo}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  ) : (
                    <button
                      onClick={handlePromoApply}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      Apply
                    </button>
                  )}
                </div>
                {promoApplied && (
                  <p className="text-xs text-green-600 mt-2 flex items-center">
                    <Tag className="w-3 h-3 mr-1" />
                    Promo code applied successfully!
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  Try: SAVE10 (10% off) or SAVE20 (20% off)
                </p>
              </div>

              {/* Checkout Button */}
              <button
                onClick={() => navigate('/checkout')}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition flex items-center justify-center space-x-2 mb-4"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              {/* Payment Methods */}
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-3">We accept</p>
                <div className="flex justify-center space-x-4">
                  <CreditCard className="w-6 h-6 text-gray-400" />
                  <img src="https://cdn.iconscout.com/icon/free/png-256/visa-282263.png" alt="Visa" className="h-6 opacity-50" />
                  <img src="https://cdn.iconscout.com/icon/free/png-256/mastercard-2879673.png" alt="Mastercard" className="h-6 opacity-50" />
                  <img src="https://cdn.iconscout.com/icon/free/png-256/paytm-282864.png" alt="Paytm" className="h-6 opacity-50" />
                </div>
              </div>

              {/* Features */}
              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span>Secure Payment</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Truck className="w-4 h-4 text-indigo-500" />
                  <span>Free shipping on orders above ₹999</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;