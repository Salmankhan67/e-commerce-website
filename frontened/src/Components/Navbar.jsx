import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useState, useEffect, useRef } from 'react';
import {
  ShoppingCart,
  User,
  LogOut,
  Menu,
  X,
  Home,
  Package,
  Heart,
  Search,
  ChevronDown,
  Store,
  Tag,
  Headphones,
  Shield,
  Truck,
  Star,
  Award,
  Sparkles
} from 'lucide-react';

function Navbar({ isLoggedIn, onLogout }) {
  const { totalItems, cart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);
  const [user, setUser] = useState(null);

  const profileRef = useRef(null);
  const cartRef = useRef(null);
  const menuRef = useRef(null);

  // Get user from localStorage
  useEffect(() => {
    const auth = JSON.parse(localStorage.getItem('auth') || 'null');
    if (auth?.user) {
      setUser(auth.user);
    }
  }, [isLoggedIn]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (cartRef.current && !cartRef.current.contains(event.target)) {
        setIsCartOpen(false);
      }
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Mock categories (replace with actual data from your backend)
  useEffect(() => {
    setCategories([
      { id: 1, name: 'Electronics', icon: '📱' },
      { id: 2, name: 'Fashion', icon: '👕' },
      { id: 3, name: 'Home & Living', icon: '🏠' },
      { id: 4, name: 'Books', icon: '📚' },
      { id: 5, name: 'Sports', icon: '⚽' },
    ]);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
      setSearchTerm('');
      setIsMenuOpen(false);
    }
  };

  const getCartTotal = () => {
    return cart?.reduce((total, item) => total + (item.price * (item.quantity || 1)), 0) || 0;
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2 px-4 text-center text-sm font-medium relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10" />
        <div className="relative flex items-center justify-center gap-2">
          <Truck className="w-4 h-4" />
          <span>Free shipping on orders above ₹999</span>
          <span className="mx-2">•</span>
          <Shield className="w-4 h-4" />
          <span>100% secure payments</span>
          <span className="mx-2">•</span>
          <Award className="w-4 h-4" />
          <span>1 year warranty</span>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-lg'
          : 'bg-white'
        }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            {/* Logo and Mobile Menu */}
            <div className="flex items-center space-x-4">
              <button
                ref={menuRef}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>

              <Link to="/" className="flex items-center space-x-2 group">
                <div className="relative">
                  <Store className="w-8 h-8 text-indigo-600 group-hover:scale-110 transition-transform" />
                  <Sparkles className="w-3 h-3 text-yellow-400 absolute -top-1 -right-1" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent hidden sm:block">
                  StoreFlow
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}

            {/* //home, categories, deals, support */}
            <div className="hidden lg:flex items-center space-x-8">
              <Link
                to="/dashboard"
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition ${isActive('/dashboard')
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'
                  }`}
              >
                <Home className="w-5 h-5" />
                <span>Home</span>
              </Link>

              {/* Categories Dropdown */}
              <div className="relative group">
                <button className="flex items-center space-x-1 px-3 py-2 text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-lg transition">
                  <Package className="w-5 h-5" />
                  <span>Categories</span>
                  <ChevronDown className="w-4 h-4 group-hover:rotate-180 transition" />
                </button>
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                  {categories.map(cat => (
                    <Link
                      key={cat.id}
                      to={`/category/${cat.name.toLowerCase()}`}
                      className="flex items-center space-x-3 px-4 py-3 hover:bg-indigo-50 transition"
                    >
                      <span className="text-xl">{cat.icon}</span>
                      <span className="text-gray-700">{cat.name}</span>
                    </Link>
                  ))}
                </div>
              </div>

              <Link
                to="/deals"
                className="flex items-center space-x-1 px-3 py-2 text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-lg transition"
              >
                <Tag className="w-5 h-5" />
                <span>Deals</span>
              </Link>

              <Link
                to="/support"
                className="flex items-center space-x-1 px-3 py-2 text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-lg transition"
              >
                <Headphones className="w-5 h-5" />
                <span>Support</span>
              </Link>
            </div>

            {/* Right Side Icons */}
            <div className="flex items-center space-x-2 md:space-x-4">
              {/* Search Bar - Desktop */}
              <form onSubmit={handleSearch} className="hidden md:block relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64 lg:w-80 pl-10 pr-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </form>

              {/* Cart Icon with Preview */}
              {isLoggedIn && (
                <div className="relative" ref={cartRef}>
                  <button
                    onClick={() => setIsCartOpen(!isCartOpen)}
                    className="relative p-2 hover:bg-gray-100 rounded-full transition"
                  >
                    <ShoppingCart className="w-6 h-6" />
                    {totalItems > 0 && (
                      <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full animate-pulse">
                        {totalItems}
                      </span>
                    )}
                  </button>

                  {/* Cart Preview Dropdown */}
                  {isCartOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden">
                      <div className="p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                        <h3 className="font-semibold">Shopping Cart</h3>
                        <p className="text-xs opacity-90">{totalItems} items</p>
                      </div>
                      <div className="max-h-96 overflow-auto">
                        {cart?.length === 0 ? (
                          <div className="p-8 text-center">
                            <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">Your cart is empty</p>
                          </div>
                        ) : (
                          <>
                            {cart?.slice(0, 3).map((item, index) => (
                              <div key={index} className="flex items-center space-x-3 p-3 border-b hover:bg-gray-50">
                                <img
                                  src={item.image ? `http://localhost:5000${item.image}` : 'https://via.placeholder.com/50?text=Product'}
                                  alt={item.name}
                                  className="w-12 h-12 object-cover rounded"
                                  onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/50?text=Product';
                                  }}
                                />                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{item.name}</p>
                                  <p className="text-xs text-gray-500">Qty: {item.quantity || 1}</p>
                                </div>
                                <p className="text-sm font-bold text-indigo-600">₹{item.price}</p>
                              </div>
                            ))}
                            {cart?.length > 3 && (
                              <p className="text-xs text-center text-gray-500 py-2">
                                +{cart.length - 3} more items
                              </p>
                            )}
                          </>
                        )}
                      </div>
                      <div className="p-4 border-t bg-gray-50">
                        <div className="flex justify-between mb-3">
                          <span className="font-medium">Total:</span>
                          <span className="font-bold text-indigo-600">₹{getCartTotal().toLocaleString()}</span>
                        </div>
                        <Link
                          to="/cart"
                          onClick={() => setIsCartOpen(false)}
                          className="block w-full text-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition"
                        >
                          View Cart
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Wishlist Icon */}
              {isLoggedIn && (
                <Link
                  to="/wishlist"
                  className="relative p-2 hover:bg-gray-100 rounded-full transition"
                >
                  <Heart className="w-6 h-6" />
                </Link>
              )}

              {/* User Menu */}
              {isLoggedIn ? (
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg transition"
                  >
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                        {user?.name?.charAt(0) || 'U'}
                      </div>
                    )}
                    <ChevronDown className={`w-4 h-4 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Profile Dropdown */}
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden">
                      <div className="p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                        <p className="font-semibold">{user?.name || 'User'}</p>
                        <p className="text-xs opacity-90">{user?.email || ''}</p>
                      </div>
                      <div className="p-2">
                        <Link
                          to="/profile"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-50 rounded-lg transition"
                        >
                          <User className="w-4 h-4" />
                          <span>Profile</span>
                        </Link>
                        
                        <Link
                          to="/orders"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-50 rounded-lg transition"
                        >
                          <Package className="w-4 h-4" />
                          <span>Orders</span>
                        </Link>
                        <Link
                          to="/wishlist"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-50 rounded-lg transition"
                        >
                          <Heart className="w-4 h-4" />
                          <span>Wishlist</span>
                        </Link>
                        <button
                          onClick={() => {
                            setIsProfileOpen(false);
                            onLogout();
                          }}
                          className="w-full flex items-center space-x-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/signin"
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition flex items-center space-x-2"
                >
                  <User className="w-4 h-4" />
                  <span>Sign In</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`lg:hidden absolute left-0 right-0 bg-white shadow-xl transition-all duration-300 overflow-hidden ${isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
          }`}>
          <div className="p-4 space-y-4">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </form>

            {/* Mobile Navigation Links */}
            <Link
              to="/dashboard"
              onClick={() => setIsMenuOpen(false)}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg ${isActive('/dashboard') ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-gray-50'
                }`}
            >
              <Home className="w-5 h-5" />
              <span>Home</span>
            </Link>

            {categories.map(cat => (
              <Link
                key={cat.id}
                to={`/category/${cat.name.toLowerCase()}`}
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 rounded-lg"
              >
                <span className="text-xl">{cat.icon}</span>
                <span>{cat.name}</span>
              </Link>
            ))}

            <Link
              to="/deals"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 rounded-lg"
            >
              <Tag className="w-5 h-5" />
              <span>Deals</span>
            </Link>

            <Link
              to="/support"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 rounded-lg"
            >
              <Headphones className="w-5 h-5" />
              <span>Support</span>
            </Link>
          </div>
        </div>
      </nav>
    </>
  );
}

export default Navbar;