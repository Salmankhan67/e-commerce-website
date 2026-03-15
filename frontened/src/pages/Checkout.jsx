import { useCart } from '../context/CartContext';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard,
  Wallet,
  Truck,
  Shield,
  MapPin,
  Phone,
  Mail,
  User,
  Home,
  Building,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Lock,
  Package,
  Plus,
  Minus,
  Edit,
  ChevronRight,
  Info,
  Smartphone,
  Landmark,
  Zap,
  Gift,
  Globe
} from 'lucide-react';

function Checkout() {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('easypaisa');
  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [saveAddress, setSaveAddress] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [orderError, setOrderError] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    // Personal Info
    fullName: '',
    email: '',
    phone: '',

    // Shipping Address
    addressLine1: '',
    addressLine2: '',
    city: '',
    province: '', // Changed from state to province for Pakistan
    pincode: '',
    country: 'Pakistan', // Default to Pakistan

    // Billing Address (if different)
    billingAddressLine1: '',
    billingAddressLine2: '',
    billingCity: '',
    billingProvince: '',
    billingPincode: '',
    billingCountry: 'Pakistan',

    // Delivery Instructions
    deliveryInstructions: '',
    preferredDate: '',
    preferredTime: 'anytime',

    // Payment Info
    easypaisaNumber: '',
    jazzcashNumber: '',
    cardNumber: '',
    cardName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: ''
  });

  const [errors, setErrors] = useState({});

  // Get token from localStorage
  const getToken = () => {
    const auth = JSON.parse(localStorage.getItem('auth') || 'null');
    return auth?.token || null;
  };

  const getAuthHeader = () => {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Get user from localStorage
  useEffect(() => {
    const auth = JSON.parse(localStorage.getItem('auth') || 'null');
    if (auth?.user) {
      setFormData(prev => ({
        ...prev,
        fullName: auth.user.name || '',
        email: auth.user.email || '',
        phone: auth.user.phone || ''
      }));
    }
  }, []);

  // Redirect if cart is empty
  useEffect(() => {
    if (cart.length === 0 && !orderPlaced) {
      navigate('/cart');
    }
  }, [cart, navigate, orderPlaced]);

  // Pakistan provinces data
  const pakistanProvinces = [
    'Punjab',
    'Sindh',
    'Khyber Pakhtunkhwa',
    'Balochistan',
    'Islamabad Capital Territory',
    'Gilgit-Baltistan',
    'Azad Kashmir'
  ];

  // Pakistani cities by province (simplified)
  const getCitiesByProvince = (province) => {
    const cities = {
      'Punjab': ['Lahore', 'Faisalabad', 'Rawalpindi', 'Multan', 'Gujranwala', 'Sialkot', 'Bahawalpur'],
      'Sindh': ['Karachi', 'Hyderabad', 'Sukkur', 'Larkana', 'Nawabshah'],
      'Khyber Pakhtunkhwa': ['Peshawar', 'Abbottabad', 'Mardan', 'Swat', 'Kohat', 'Dera Ismail Khan'],
      'Balochistan': ['Quetta', 'Gwadar', 'Turbat', 'Sibi'],
      'Islamabad Capital Territory': ['Islamabad'],
      'Gilgit-Baltistan': ['Gilgit', 'Skardu', 'Hunza'],
      'Azad Kashmir': ['Muzaffarabad', 'Mirpur', 'Rawalakot']
    };
    return cities[province] || [];
  };

  // Calculate totals with Pakistan tax structure
  const subtotal = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);

  // Pakistan tax rates (simplified)
  const taxRate = 0.17; // 17% GST/Sales Tax in Pakistan
  const tax = subtotal * taxRate;

  // Pakistan shipping costs (based on city tiers)
  const getShippingCost = () => {
    const majorCities = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad'];
    if (subtotal > 5000) return 0; // Free shipping above Rs. 5000
    if (majorCities.includes(formData.city)) return 150; // Major cities
    return 250; // Other cities
  };

  const shipping = getShippingCost();
  const discount = promoApplied ? subtotal * promoDiscount : 0;
  const total = subtotal + shipping + tax - discount;

  const validateForm = () => {
    const newErrors = {};

    // Personal Info Validation
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^03\d{9}$/.test(formData.phone)) {
      newErrors.phone = 'Enter valid Pakistani number (03xxxxxxxxx)';
    }

    // Shipping Address Validation
    if (!formData.addressLine1.trim()) newErrors.addressLine1 = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.province.trim()) newErrors.province = 'Province is required';
    if (!formData.pincode.trim()) {
      newErrors.pincode = 'Postal code is required';
    }

    // Payment Validation based on method
    if (paymentMethod === 'easypaisa') {
      if (!formData.easypaisaNumber.trim()) {
        newErrors.easypaisaNumber = 'EasyPaisa number is required';
      } else if (!/^03\d{9}$/.test(formData.easypaisaNumber)) {
        newErrors.easypaisaNumber = 'Enter valid mobile number';
      }
    } else if (paymentMethod === 'jazzcash') {
      if (!formData.jazzcashNumber.trim()) {
        newErrors.jazzcashNumber = 'JazzCash number is required';
      } else if (!/^03\d{9}$/.test(formData.jazzcashNumber)) {
        newErrors.jazzcashNumber = 'Enter valid mobile number';
      }
    } else if (paymentMethod === 'card') {
      if (!formData.cardNumber.trim()) {
        newErrors.cardNumber = 'Card number is required';
      } else if (!/^\d{16}$/.test(formData.cardNumber.replace(/\s/g, ''))) {
        newErrors.cardNumber = 'Card number must be 16 digits';
      }
      if (!formData.cardName.trim()) newErrors.cardName = 'Name on card is required';
      if (!formData.expiryMonth || !formData.expiryYear) {
        newErrors.expiry = 'Expiry date is required';
      }
      if (!formData.cvv.trim()) {
        newErrors.cvv = 'CVV is required';
      } else if (!/^\d{3}$/.test(formData.cvv)) {
        newErrors.cvv = 'CVV must be 3 digits';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePromoApply = async () => {
    if (!promoCode.trim()) {
      alert('Please enter a promo code');
      return;
    }

    setLoading(true);
    try {
      const token = getToken();
      if (!token) {
        alert('Please login to apply promo');
        return;
      }

      console.log('Validating promo:', promoCode); // Debug
      console.log('Subtotal:', subtotal); // Debug

      const response = await fetch('http://localhost:5000/api/promo/validate', {
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
      console.log('Validation response:', data); // Debug

      if (data.valid) {
        // Calculate discount percentage from amount
        const discountPercent = data.promo.discountAmount / subtotal;
        setPromoApplied(true);
        setPromoDiscount(discountPercent);
        alert(`✅ Promo applied! You saved Rs. ${data.promo.discountAmount}`);
      } else {
        alert('❌ ' + data.message);
      }
    } catch (error) {
      console.error('Error applying promo:', error);
      alert('❌ Failed to validate promo. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  // ========== FIXED: Place Order Function with Backend Connection ==========
  const handlePlaceOrder = async () => {
  if (!validateForm()) {
    const firstError = document.querySelector('.border-red-500');
    if (firstError) {
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return;
  }

  setLoading(true);
  setOrderError(null);

  // Get token from "auth" object saved in localStorage
  const savedAuth = JSON.parse(localStorage.getItem('auth'));
  const token = savedAuth?.token;

  if (!token) {
    alert('Please login to place order');
    setLoading(false);
    navigate('/signin');
    return;
  }

  // ✅ COMPLETE: Build full orderData with all required fields
  const orderData = {
    // Order items from cart
    items: cart.map(item => ({
      productId: item._id || item.id, // Handle both _id and id
      name: item.name,
      price: item.price,
      quantity: item.quantity || 1,
      image: item.image
    })),
    
    // Price breakdown
    subtotal: subtotal,
    shipping: shipping,
    tax: tax,
    discount: discount,
    total: total,
    currency: 'PKR',
    
    // Customer information
    customerInfo: {
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone
    },
    
    // Shipping address
    shippingAddress: {
      fullName: formData.fullName,
      address: formData.addressLine1 + (formData.addressLine2 ? ', ' + formData.addressLine2 : ''),
      city: formData.city,
      province: formData.province,
      postalCode: formData.pincode,
      country: formData.country || 'Pakistan',
      phone: formData.phone
    },
    
    // Billing address (same as shipping for now, or add logic if different)
    billingAddress: sameAsBilling ? {
      fullName: formData.fullName,
      address: formData.addressLine1 + (formData.addressLine2 ? ', ' + formData.addressLine2 : ''),
      city: formData.city,
      province: formData.province,
      postalCode: formData.pincode,
      country: formData.country || 'Pakistan',
      phone: formData.phone
    } : {
      fullName: formData.fullName,
      address: formData.billingAddressLine1 + (formData.billingAddressLine2 ? ', ' + formData.billingAddressLine2 : ''),
      city: formData.billingCity,
      province: formData.billingProvince,
      postalCode: formData.billingPincode,
      country: formData.billingCountry || 'Pakistan',
      phone: formData.phone
    },
    
    // Delivery preferences
    deliveryInstructions: formData.deliveryInstructions,
    preferredDeliveryDate: formData.preferredDate,
    preferredDeliveryTime: formData.preferredTime,
    
    // Payment
    paymentMethod: paymentMethod,
    paymentDetails: paymentMethod === 'easypaisa' ? { easypaisaNumber: formData.easypaisaNumber } :
                   paymentMethod === 'jazzcash' ? { jazzcashNumber: formData.jazzcashNumber } :
                   paymentMethod === 'card' ? { 
                     cardNumber: formData.cardNumber,
                     cardName: formData.cardName,
                     expiryMonth: formData.expiryMonth,
                     expiryYear: formData.expiryYear
                     // Note: Don't send CVV to backend for security
                   } : {},
    
    paymentStatus: paymentMethod === 'cod' ? 'Pending' : 'Processing',
    status: 'Pending',
    
    // Promo code
    promoCode: promoApplied ? promoCode : null
  };

  console.log('🚀 Sending order data:', orderData); // Debug log

  try {
    const response = await fetch('http://localhost:5000/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(orderData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to place order');
    }

    setOrderId(data._id);
    setOrderPlaced(true);
    clearCart();

    console.log('✅ Order placed successfully:', data);
  } catch (error) {
    console.error('❌ Order placement error:', error);
    setOrderError(error.message || 'Failed to place order. Please try again.');
    alert('⚠️ ' + (error.message || 'Could not place order. Please check your connection and try again.'));
  } finally {
    setLoading(false);
  }
};


const nextStep = () => {
  if (step === 1) {
    // Validate all fields
    const newErrors = {};
    
    // Personal Info
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else {
      const cleanPhone = formData.phone.replace(/[\s\-\(\)]/g, '');
      if (!/^03\d{9}$/.test(cleanPhone)) {
        newErrors.phone = 'Enter valid Pakistani number (03xxxxxxxxx)';
      }
    }
    
    // Address
    if (!formData.addressLine1.trim()) newErrors.addressLine1 = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.province.trim()) newErrors.province = 'Province is required';
    if (!formData.pincode.trim()) newErrors.pincode = 'Postal code is required';

    // If errors exist
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      alert('❌ Please fix the errors before continuing');
      return;
    }
    
    // No errors - go to next step
    setStep(step + 1);
  }
};
  //this is the function to go back to the previous step in the checkout process

  const prevStep = () => setStep(step - 1);

  // Order Success View
  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>

            <h1 className="text-3xl font-bold text-gray-800 mb-2">Order Placed Successfully!</h1>
            <p className="text-gray-500 mb-6">Thank you for shopping with StoreFlow Pakistan</p>

            <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-xl mb-6">
              <p className="text-sm opacity-90 mb-1">Order Number</p>
              <p className="text-2xl font-mono font-bold">{orderId}</p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Order Total</span>
                <span className="text-xl font-bold text-gray-800">Rs. {total.toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Payment Method</span>
                <span className="font-medium">
                  {paymentMethod === 'easypaisa' ? 'EasyPaisa' :
                    paymentMethod === 'jazzcash' ? 'JazzCash' :
                      paymentMethod === 'cod' ? 'Cash on Delivery' :
                        'Credit/Debit Card'}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Delivery Address</span>
                <span className="font-medium text-right">
                  {formData.addressLine1}<br />
                  {formData.city}, {formData.province}
                </span>
              </div>
            </div>

            <div className="border-t pt-6 space-y-4">
              <p className="text-sm text-gray-600">
                {paymentMethod === 'cod' ? (
                  <>
                    <Truck className="w-4 h-4 inline mr-1 text-green-600" />
                    Pay Rs. {total.toLocaleString()} when your order is delivered
                  </>
                ) : paymentMethod === 'easypaisa' || paymentMethod === 'jazzcash' ? (
                  <>
                    <Smartphone className="w-4 h-4 inline mr-1 text-green-600" />
                    Payment of Rs. {total.toLocaleString()} will be processed from your mobile account
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 inline mr-1 text-green-600" />
                    Payment of Rs. {total.toLocaleString()} has been processed
                  </>
                )}
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => navigate('/orders')}
                  className="flex-1 bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 transition font-medium"
                >
                  Track Order
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex-1 border-2 border-green-600 text-green-600 py-3 rounded-xl hover:bg-green-50 transition font-medium"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Empty cart view


  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h1>
            <p className="text-gray-500 mb-6">Add some products to your cart before checkout</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 transition"
            >
              Start Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-green-600 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Cart
          </button>

          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Checkout
          </h1>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mt-6 max-w-2xl">
            {[
              { number: 1, label: 'Shipping' },
              { number: 2, label: 'Payment' },
              { number: 3, label: 'Review' }
            ].map((s) => (
              <div key={s.number} className="flex items-center flex-1">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= s.number ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                  {step > s.number ? <CheckCircle className="w-5 h-5" /> : s.number}
                </div>
                <span className={`ml-2 text-sm font-medium ${step >= s.number ? 'text-green-600' : 'text-gray-400'
                  }`}>
                  {s.label}
                </span>
                {s.number < 3 && (
                  <ChevronRight className="w-4 h-4 mx-2 text-gray-400 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Form */}
          <div className="lg:w-2/3 space-y-6">
            {/* Step 1: Shipping Information */}
            {step === 1 && (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h2 className="text-xl font-semibold mb-6 flex items-center">
                  <User className="w-5 h-5 mr-2 text-green-600" />
                  Personal Information
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 ${errors.fullName ? 'border-red-500' : 'border-gray-300'
                        }`}
                      placeholder="name as it appears on card"
                    />
                    {errors.fullName && (
                      <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 ${errors.email ? 'border-red-500' : 'border-gray-300'
                          }`}
                        placeholder="ali@example.com"
                      />
                      {errors.email && (
                        <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 ${errors.phone ? 'border-red-500' : 'border-gray-300'
                          }`}
                        placeholder="03001234567"
                        maxLength="11"
                      />
                      {errors.phone && (
                        <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">Pakistani mobile number (03xxxxxxxxx)</p>
                    </div>
                  </div>
                </div>

                <h2 className="text-xl font-semibold mt-8 mb-6 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-green-600" />
                  Shipping Address (Pakistan)
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address Line 1 *
                    </label>
                    <input
                      type="text"
                      name="addressLine1"
                      value={formData.addressLine1}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 ${errors.addressLine1 ? 'border-red-500' : 'border-gray-300'
                        }`}
                      placeholder="House/Flat No., Building, Street"
                    />
                    {errors.addressLine1 && (
                      <p className="mt-1 text-xs text-red-500">{errors.addressLine1}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address Line 2 (Optional)
                    </label>
                    <input
                      type="text"
                      name="addressLine2"
                      value={formData.addressLine2}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
                      placeholder="Landmark, Area"
                    />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Province *
                      </label>
                      <select
                        name="province"
                        value={formData.province}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 ${errors.province ? 'border-red-500' : 'border-gray-300'
                          }`}
                      >
                        <option value="">Select Province</option>
                        {pakistanProvinces.map(prov => (
                          <option key={prov} value={prov}>{prov}</option>
                        ))}
                      </select>
                      {errors.province && (
                        <p className="mt-1 text-xs text-red-500">{errors.province}</p>
                      )}
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City *
                      </label>
                      <select
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 ${errors.city ? 'border-red-500' : 'border-gray-300'
                          }`}
                        disabled={!formData.province}
                      >
                        <option value="">Select City</option>
                        {formData.province && getCitiesByProvince(formData.province).map(city => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                      {errors.city && (
                        <p className="mt-1 text-xs text-red-500">{errors.city}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Postal Code *
                      </label>
                      <input
                        type="text"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 ${errors.pincode ? 'border-red-500' : 'border-gray-300'
                          }`}
                        placeholder="54000"
                      />
                      {errors.pincode && (
                        <p className="mt-1 text-xs text-red-500">{errors.pincode}</p>
                      )}
                    </div>
                  </div>

                  {/* Delivery Preferences */}
                  <div className="mt-6 pt-6 border-t">
                    <h3 className="font-medium mb-4">Delivery Preferences (Optional)</h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Delivery Instructions
                        </label>
                        <textarea
                          name="deliveryInstructions"
                          value={formData.deliveryInstructions}
                          onChange={handleInputChange}
                          rows="2"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
                          placeholder="E.g., Leave at gate, Call before delivery, etc."
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Preferred Date
                          </label>
                          <input
                            type="date"
                            name="preferredDate"
                            value={formData.preferredDate}
                            onChange={handleInputChange}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Preferred Time
                          </label>
                          <select
                            name="preferredTime"
                            value={formData.preferredTime}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
                          >
                            <option value="anytime">Anytime</option>
                            <option value="morning">Morning (9AM - 12PM)</option>
                            <option value="afternoon">Afternoon (12PM - 4PM)</option>
                            <option value="evening">Evening (4PM - 8PM)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Payment Method - PAKISTAN EDITION */}
            {step === 2 && (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h2 className="text-xl font-semibold mb-6 flex items-center">
                  <Wallet className="w-5 h-5 mr-2 text-green-600" />
                  Payment Method (Pakistan)
                </h2>

                <div className="space-y-4">
                  {/* EasyPaisa */}
                  <label className={`block border-2 rounded-xl p-4 cursor-pointer transition ${paymentMethod === 'easypaisa' ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-green-300'
                    }`}>
                    <input
                      type="radio"
                      name="payment"
                      value="easypaisa"
                      checked={paymentMethod === 'easypaisa'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="hidden"
                    />
                    <div className="flex items-center">
                      <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${paymentMethod === 'easypaisa' ? 'border-green-600' : 'border-gray-400'
                        }`}>
                        {paymentMethod === 'easypaisa' && <div className="w-3 h-3 bg-green-600 rounded-full"></div>}
                      </div>
                      <img
                        src="https://seeklogo.com/images/E/easypaisa-logo-8F12A12B21-seeklogo.com.png"
                        alt="EasyPaisa"
                        className="w-8 h-8 object-contain mr-3"
                      />
                      <div className="flex-1">
                        <p className="font-semibold">EasyPaisa</p>
                        <p className="text-sm text-gray-500">Pay using your EasyPaisa mobile account</p>
                      </div>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Popular</span>
                    </div>
                  </label>

                  {/* JazzCash */}
                  <label className={`block border-2 rounded-xl p-4 cursor-pointer transition ${paymentMethod === 'jazzcash' ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-green-300'
                    }`}>
                    <input
                      type="radio"
                      name="payment"
                      value="jazzcash"
                      checked={paymentMethod === 'jazzcash'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="hidden"
                    />
                    <div className="flex items-center">
                      <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${paymentMethod === 'jazzcash' ? 'border-green-600' : 'border-gray-400'
                        }`}>
                        {paymentMethod === 'jazzcash' && <div className="w-3 h-3 bg-green-600 rounded-full"></div>}
                      </div>
                      <img
                        src="https://seeklogo.com/images/J/jazzcash-logo-8F9A1C1F1C-seeklogo.com.png"
                        alt="JazzCash"
                        className="w-8 h-8 object-contain mr-3"
                      />
                      <div className="flex-1">
                        <p className="font-semibold">JazzCash</p>
                        <p className="text-sm text-gray-500">Pay using your JazzCash mobile account</p>
                      </div>
                    </div>
                  </label>

                  {/* Credit/Debit Card */}
                  <label className={`block border-2 rounded-xl p-4 cursor-pointer transition ${paymentMethod === 'card' ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-green-300'
                    }`}>
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="hidden"
                    />
                    <div className="flex items-center">
                      <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${paymentMethod === 'card' ? 'border-green-600' : 'border-gray-400'
                        }`}>
                        {paymentMethod === 'card' && <div className="w-3 h-3 bg-green-600 rounded-full"></div>}
                      </div>
                      <CreditCard className="w-6 h-6 text-green-600 mr-3" />
                      <div className="flex-1">
                        <p className="font-semibold">Credit/Debit Card</p>
                        <p className="text-sm text-gray-500">Visa, Mastercard, Union Pay</p>
                      </div>
                      <div className="flex space-x-1">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Visa</span>
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Mastercard</span>
                      </div>
                    </div>
                  </label>

                  {/* Cash on Delivery */}
                  <label className={`block border-2 rounded-xl p-4 cursor-pointer transition ${paymentMethod === 'cod' ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-green-300'
                    }`}>
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="hidden"
                    />
                    <div className="flex items-center">
                      <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${paymentMethod === 'cod' ? 'border-green-600' : 'border-gray-400'
                        }`}>
                        {paymentMethod === 'cod' && <div className="w-3 h-3 bg-green-600 rounded-full"></div>}
                      </div>
                      <Truck className="w-6 h-6 text-green-600 mr-3" />
                      <div className="flex-1">
                        <p className="font-semibold">Cash on Delivery</p>
                        <p className="text-sm text-gray-500">Pay when you receive your order</p>
                      </div>
                      <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">No card needed</span>
                    </div>
                  </label>
                </div>

                {/* EasyPaisa Form */}
                {paymentMethod === 'easypaisa' && (
                  <div className="mt-6 pt-6 border-t">
                    <h3 className="font-medium mb-4">Enter EasyPaisa Mobile Number</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          EasyPaisa Number *
                        </label>
                        <input
                          type="tel"
                          name="easypaisaNumber"
                          value={formData.easypaisaNumber}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 ${errors.easypaisaNumber ? 'border-red-500' : 'border-gray-300'
                            }`}
                          placeholder="03001234567"
                          maxLength="11"
                        />
                        {errors.easypaisaNumber && (
                          <p className="mt-1 text-xs text-red-500">{errors.easypaisaNumber}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                          You'll receive a payment request on your EasyPaisa app
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* JazzCash Form */}
                {paymentMethod === 'jazzcash' && (
                  <div className="mt-6 pt-6 border-t">
                    <h3 className="font-medium mb-4">Enter JazzCash Mobile Number</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          JazzCash Number *
                        </label>
                        <input
                          type="tel"
                          name="jazzcashNumber"
                          value={formData.jazzcashNumber}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 ${errors.jazzcashNumber ? 'border-red-500' : 'border-gray-300'
                            }`}
                          placeholder="03001234567"
                          maxLength="11"
                        />
                        {errors.jazzcashNumber && (
                          <p className="mt-1 text-xs text-red-500">{errors.jazzcashNumber}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                          You'll receive a payment request on your JazzCash app
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Card Details Form */}
                {paymentMethod === 'card' && (
                  <div className="mt-6 pt-6 border-t">
                    <h3 className="font-medium mb-4">Enter Card Details</h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Card Number *
                        </label>
                        <input
                          type="text"
                          name="cardNumber"
                          value={formData.cardNumber}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 ${errors.cardNumber ? 'border-red-500' : 'border-gray-300'
                            }`}
                          placeholder="1234 5678 9012 3456"
                          maxLength="19"
                        />
                        {errors.cardNumber && (
                          <p className="mt-1 text-xs text-red-500">{errors.cardNumber}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Name on Card *
                        </label>
                        <input
                          type="text"
                          name="cardName"
                          value={formData.cardName}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 ${errors.cardName ? 'border-red-500' : 'border-gray-300'
                            }`}
                          placeholder="name as it appears on card"
                        />
                        {errors.cardName && (
                          <p className="mt-1 text-xs text-red-500">{errors.cardName}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Month *
                          </label>
                          <select
                            name="expiryMonth"
                            value={formData.expiryMonth}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
                          >
                            <option value="">MM</option>
                            {Array.from({ length: 12 }, (_, i) => {
                              const month = (i + 1).toString().padStart(2, '0');
                              return <option key={month} value={month}>{month}</option>;
                            })}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Year *
                          </label>
                          <select
                            name="expiryYear"
                            value={formData.expiryYear}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
                          >
                            <option value="">YY</option>
                            {Array.from({ length: 10 }, (_, i) => {
                              const year = (new Date().getFullYear() + i).toString();
                              return <option key={year} value={year}>{year.slice(-2)}</option>;
                            })}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            CVV *
                          </label>
                          <input
                            type="password"
                            name="cvv"
                            value={formData.cvv}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 ${errors.cvv ? 'border-red-500' : 'border-gray-300'
                              }`}
                            placeholder="123"
                            maxLength="3"
                          />
                        </div>
                      </div>
                      {(errors.expiry || errors.cvv) && (
                        <p className="text-xs text-red-500">{errors.expiry || errors.cvv}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
        



        
            {/* Step 3: Review Order - FIXED TAX CALCULATION */}
            
            {step === 3 && (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                 {/* inputs, fields, and the button above */}
                   
                <h2 className="text-xl font-semibold mb-6 flex items-center">
                  <Package className="w-5 h-5 mr-2 text-green-600" />
                  Review Your Order
                </h2>

                {/* Items Review */}
                <div className="space-y-4 mb-6">
                  {cart.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-500">Qty: {item.quantity || 1}</p>
                        </div>
                      </div>
                      <p className="font-bold">Rs. {(item.price * (item.quantity || 1)).toLocaleString()}</p>
                    </div>
                  ))}
      
                </div>

                {/* ===== ADD THIS MISSING PRICE BREAKDOWN SECTION HERE ===== */}
                <div className="border-t border-b py-4 my-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span>Rs. {subtotal.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    {shipping === 0 ? (
                      <span className="text-green-600 font-medium">Free</span>
                    ) : (
                      <span>Rs. {shipping.toLocaleString()}</span>
                    )}
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Sales Tax (17% GST)</span>
                    <span>Rs. {tax.toLocaleString()}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount ({promoCode})</span>
                      <span>-Rs. {discount.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-lg font-bold pt-2 mt-2 border-t border-gray-200">
                    <span>Total</span>
                    <span className="text-green-600">Rs. {total.toLocaleString()}</span>
                  </div>

                  <p className="text-xs text-gray-500 text-right">Inclusive of all taxes</p>
                </div>

                {/* Address Review */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <h4 className="font-medium text-sm text-gray-500 mb-2 flex items-center">
                      <MapPin className="w-4 h-4 mr-1" /> Shipping Address
                    </h4>
                    <p className="text-sm">
                      {formData.fullName}<br />
                      {formData.addressLine1}<br />
                      {formData.addressLine2 && <>{formData.addressLine2}<br /></>}
                      {formData.city}, {formData.province} - {formData.pincode}<br />
                      Pakistan<br />
                      Phone: {formData.phone}
                    </p>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-xl">
                    <h4 className="font-medium text-sm text-gray-500 mb-2 flex items-center">
                      <Wallet className="w-4 h-4 mr-1" /> Payment Method
                    </h4>
                    <p className="text-sm font-medium">
                      {paymentMethod === 'easypaisa' ? 'EasyPaisa' :
                        paymentMethod === 'jazzcash' ? 'JazzCash' :
                          paymentMethod === 'cod' ? 'Cash on Delivery' :
                            'Credit/Debit Card'}
                    </p>
                    {paymentMethod === 'easypaisa' && formData.easypaisaNumber && (
                      <p className="text-xs text-gray-600 mt-1">Mobile: {formData.easypaisaNumber}</p>
                    )}
                    {paymentMethod === 'jazzcash' && formData.jazzcashNumber && (
                      <p className="text-xs text-gray-600 mt-1">Mobile: {formData.jazzcashNumber}</p>
                    )}
                  </div>
                </div>

                {/* Error Message */}
                {orderError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start">
                    <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-600">{orderError}</p>
                  </div>
                )}

                {/* Terms */}
                <div className="border-t pt-4">
                  <label className="flex items-start space-x-2">
                    <input type="checkbox" className="mt-1 rounded border-gray-300 text-green-600" />
                    <span className="text-sm text-gray-600">
                      I confirm that the information provided is correct and I agree to the
                      <button className="text-green-600 hover:underline mx-1">Terms & Conditions</button>
                      and
                      <button className="text-green-600 hover:underline mx-1">Privacy Policy</button>
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              {step > 1 && (
                <button
                  onClick={prevStep}
                  className="px-6 py-3 border-2 border-green-600 text-green-600 rounded-xl hover:bg-green-50 transition font-medium"
                >
                  Previous
                </button>
              )}
              {step < 3 ? (
                <button
                  onClick={nextStep}
                  className="ml-auto px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-medium"
                >
                  Continue
                </button>
              ) : (

                <button
                  onClick={handlePlaceOrder}  
                  disabled={loading || cart.length === 0}
                  className={`ml-auto px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition font-medium flex items-center ${loading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Placing Order...
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5 mr-2" />
                      Place Order
                    </>
                  )}
                </button>
                
              )}
            </div>
            
          </div>

          {/* Order Summary Sidebar - FIXED TAX CALCULATION */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-24">
              <h3 className="text-lg font-semibold mb-4">Order Summary</h3>

              <div className="space-y-3 mb-4">
                {cart.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {item.name} x {item.quantity || 1}
                    </span>
                    <span className="font-medium">Rs. {(item.price * (item.quantity || 1)).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span>Rs. {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  {shipping === 0 ? (
                    <span className="text-green-600 font-medium">Free</span>
                  ) : (
                    <span>Rs. {shipping.toLocaleString()}</span>
                  )}
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Sales Tax (17% GST)</span>
                  <span>Rs. {tax.toLocaleString()}</span>
                </div>
                {promoApplied && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-Rs. {discount.toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* Promo Code */}
              <div className="mt-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    disabled={promoApplied}
                  />
                  {promoApplied ? (
                    <button
                      onClick={() => {
                        setPromoApplied(false);
                        setPromoDiscount(0);
                        setPromoCode('');
                      }}
                      className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm"
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      onClick={handlePromoApply}
                      className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm"
                    >
                      Apply
                    </button>
                  )}
                </div>
                {/* <p className="text-xs text-gray-500 mt-2">Try: PAK10, FREESHIP, EID50</p> */}
              </div>

              <div className="border-t mt-4 pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-green-600">Rs. {total.toLocaleString()}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Inclusive of all taxes</p>
              </div>

              {/* Payment Method Info */}
              {paymentMethod === 'easypaisa' && (
                <div className="mt-4 p-3 bg-green-50 rounded-xl">
                  <div className="flex items-start space-x-2">
                    <img src="https://seeklogo.com/images/E/easypaisa-logo-8F12A12B21-seeklogo.com.png" alt="EasyPaisa" className="w-6 h-6 object-contain" />
                    <div>
                      <p className="text-xs text-green-800 font-medium">EasyPaisa</p>
                      <p className="text-xs text-green-600">
                        You'll receive a payment request on your mobile
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'jazzcash' && (
                <div className="mt-4 p-3 bg-green-50 rounded-xl">
                  <div className="flex items-start space-x-2">
                    <img src="https://seeklogo.com/images/J/jazzcash-logo-8F9A1C1F1C-seeklogo.com.png" alt="JazzCash" className="w-6 h-6 object-contain" />
                    <div>
                      <p className="text-xs text-green-800 font-medium">JazzCash</p>
                      <p className="text-xs text-green-600">
                        You'll receive a payment request on your mobile
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'cod' && (
                <div className="mt-4 p-3 bg-blue-50 rounded-xl">
                  <div className="flex items-start space-x-2">
                    <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-xs text-blue-800 font-medium">Cash on Delivery</p>
                      <p className="text-xs text-blue-600">
                        Pay Rs. {total.toLocaleString()} when your order is delivered
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Badge */}
              <div className="mt-4 flex items-center justify-center space-x-2 text-xs text-gray-500">
                <Shield className="w-4 h-4 text-green-600" />
                <span>Secure Checkout</span>
                <Lock className="w-4 h-4 text-green-600 ml-2" />
                <span>SSL Encrypted</span>
              </div>

              {/* Accepted Payments */}
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-gray-500 text-center mb-2">We Accept</p>
                <div className="flex justify-center space-x-4">
                  <img src="https://seeklogo.com/images/E/easypaisa-logo-8F12A12B21-seeklogo.com.png" alt="EasyPaisa" className="h-6 object-contain" />
                  <img src="https://seeklogo.com/images/J/jazzcash-logo-8F9A1C1F1C-seeklogo.com.png" alt="JazzCash" className="h-6 object-contain" />
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Visa</span>
                  <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Mastercard</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;