import { useCart } from '../context/CartContext';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  Heart, 
  Star, 
  ChevronLeft, 
  ChevronRight,
  ShoppingCart,
  User,
  LogOut,
  Menu,
  X,
  Grid3x3,
  List,
  TrendingUp,
  Clock,
  Truck,
  Shield,
  CreditCard
} from 'lucide-react';

function Dashboard() {
  const cartContext = useCart();
  const { addToCart, totalItems, cart } = cartContext || {};
  const navigate = useNavigate();
  
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('default');
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [wishlist, setWishlist] = useState([]);
  const [showCartPreview, setShowCartPreview] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const productsPerPage = 8;

  // Get categories from products
  const categories = ['all', ...new Set(products.map(p => p.category || 'Uncategorized'))];

  if (!cartContext) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center">
          <ShoppingBag className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 text-lg font-semibold">Cart context unavailable!</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Get user info
  const getUser = () => {
    const auth = JSON.parse(localStorage.getItem('auth') || 'null');
    return auth?.user || null;
  };

  const user = getUser();

  const getToken = () => {
    const auth = JSON.parse(localStorage.getItem('auth') || 'null');
    return auth?.token || null;
  };

  const handleLogout = () => {
    localStorage.removeItem('auth');
    navigate('/signin');
  };

  const fetchProducts = () => {
    const token = getToken();
    
    if (!token) {
      console.error('No token found, redirecting to login');
      navigate('/signin');
      return;
    }

    fetch('http://localhost:5000/api/products', {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
      .then(res => {
        if (res.status === 401) {
          console.error('Unauthorized - token invalid');
          localStorage.removeItem('auth');
          navigate('/signin');
          throw new Error('Unauthorized');
        }
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        console.log('fetched products', data);
        if (Array.isArray(data)) {
          setProducts(data);
          setFilteredProducts(data);
          // Set max price range based on products
          const maxPrice = Math.max(...data.map(p => Number(p.price) || 0), 10000);
          setPriceRange(prev => ({ ...prev, max: maxPrice }));
        } else {
          console.error('Expected array, got:', typeof data, data);
          setProducts([]);
          setFilteredProducts([]);
          setError('Invalid data format');
        }
        setLoading(false);
      })
      .catch(err => {
        console.log("Error loading products:", err);
        setError("Unable to load products");
        setProducts([]);
        setFilteredProducts([]);
        setLoading(false);
      });
  };

  // Load wishlist from localStorage
  useEffect(() => {
    const savedWishlist = localStorage.getItem('wishlist');
    if (savedWishlist) {
      setWishlist(JSON.parse(savedWishlist));
    }
  }, []);

  // Save wishlist to localStorage
  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Filter and sort products
  useEffect(() => {
    let result = [...products];

    // Apply search
    if (searchTerm) {
      result = result.filter(p => 
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      result = result.filter(p => p.category === selectedCategory);
    }

    // Apply price filter
    result = result.filter(p => {
      const price = Number(p.price) || 0;
      return price >= priceRange.min && price <= priceRange.max;
    });

    // Apply sorting
    switch(sortBy) {
      case 'price-low':
        result.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
        break;
      case 'price-high':
        result.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
        break;
      case 'name':
        result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      case 'newest':
        // Assuming _id contains timestamp or use createdAt if available
        result.sort((a, b) => (b._id || '').localeCompare(a._id || ''));
        break;
      default:
        // Keep original order
        break;
    }

    setFilteredProducts(result);
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, sortBy, priceRange, products]);

  // Pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const toggleWishlist = (product) => {
    if (wishlist.some(item => item._id === product._id)) {
      setWishlist(wishlist.filter(item => item._id !== product._id));
    } else {
      setWishlist([...wishlist, product]);
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.some(item => item._id === productId);
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    // Show temporary notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slideIn';
    notification.textContent = `${product.name} added to cart!`;
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.remove();
    }, 2000);
  };

  const getCartTotal = () => {
    return cart?.reduce((total, item) => total + (item.price * (item.quantity || 1)), 0) || 0;
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Mobile Sidebar */}
      <div className={`fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity lg:hidden ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setSidebarOpen(false)} />
      
      <div className={`fixed top-0 left-0 h-full w-64 bg-white shadow-2xl z-50 transform transition-transform lg:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-indigo-600">Menu</h2>
            <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-indigo-50 rounded-lg">
              <User className="w-5 h-5 text-indigo-600" />
              <div>
                <p className="font-medium text-gray-800">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-500">{user?.email || ''}</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/cart')}
              className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <ShoppingCart className="w-5 h-5" />
                <span>Cart</span>
              </div>
              {totalItems > 0 && (
                <span className="bg-indigo-600 text-white text-xs px-2 py-1 rounded-full">
                  {totalItems}
                </span>
              )}
            </button>
            <button
              onClick={() => navigate('/orders')}
              className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg"
            >
              <Truck className="w-5 h-5" />
              <span>Orders</span>
            </button>
            <button
              onClick={() => navigate('/wishlist')}
              className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg"
            >
              <Heart className="w-5 h-5" />
              <span>Wishlist</span>
              {wishlist.length > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {wishlist.length}
                </span>
              )}
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 p-3 text-red-600 hover:bg-red-50 rounded-lg"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
                >
                  <Menu className="w-6 h-6" />
                </button>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Welcome back, {user?.name?.split(' ')[0] || 'User'}!
                  </h1>
                  <p className="text-gray-500 mt-1">Discover amazing products at great prices</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Cart Preview */}
              <div className="relative">
                <button
                  onClick={() => setShowCartPreview(!showCartPreview)}
                  className="relative p-3 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition"
                >
                  <ShoppingCart className="w-6 h-6 text-indigo-600" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                      {totalItems}
                    </span>
                  )}
                </button>

                {/* Cart Preview Dropdown */}
                {showCartPreview && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl z-50 border">
                    <div className="p-4 border-b">
                      <h3 className="font-semibold">Shopping Cart ({totalItems} items)</h3>
                    </div>
                    <div className="max-h-96 overflow-auto p-4">
                      {cart?.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">Your cart is empty</p>
                      ) : (
                        <>
                          {cart?.map((item, index) => (
                            <div key={index} className="flex items-center space-x-3 mb-3 pb-3 border-b last:border-0">
                              <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded" />
                              <div className="flex-1">
                                <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                                <p className="text-xs text-gray-500">Qty: {item.quantity || 1}</p>
                              </div>
                              <p className="text-sm font-bold">₹{item.price}</p>
                            </div>
                          ))}
                          <div className="mt-4 pt-4 border-t">
                            <div className="flex justify-between mb-4">
                              <span>Total:</span>
                              <span className="font-bold">₹{getCartTotal()}</span>
                            </div>
                            <button
                              onClick={() => navigate('/cart')}
                              className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
                            >
                              View Cart
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Desktop User Menu */}
              <div className="hidden lg:flex items-center space-x-4">
                <div className="flex items-center space-x-3 px-4 py-2 bg-gray-50 rounded-xl">
                  <User className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">{user?.name || 'User'}</p>
                    <p className="text-xs text-gray-500">{user?.email || ''}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-100 rounded-xl focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 bg-white"
              />
            </div>
          </div>
        </div>

        {/* Filters and View Options */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition lg:hidden"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </button>

              <div className="hidden lg:flex items-center space-x-4">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat === 'all' ? 'All Categories' : cat}
                    </option>
                  ))}
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="default">Default</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name">Name</option>
                  <option value="newest">Newest</option>
                </select>

                <div className="flex items-center space-x-2 border rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'hover:bg-gray-100'}`}
                  >
                    <Grid3x3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'hover:bg-gray-100'}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-500">
              Showing {currentProducts.length} of {filteredProducts.length} products
            </p>
          </div>

          {/* Mobile Filters */}
          {showFilters && (
            <div className="lg:hidden mt-4 p-4 border-t">
              <div className="space-y-4">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat === 'all' ? 'All Categories' : cat}
                    </option>
                  ))}
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="default">Default</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name">Name</option>
                  <option value="newest">Newest</option>
                </select>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`flex-1 py-2 rounded ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'border'}`}
                  >
                    Grid
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`flex-1 py-2 rounded ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'border'}`}
                  >
                    List
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Products Grid/List */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm p-4 animate-pulse">
                <div className="w-full h-48 bg-gray-200 rounded-xl mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16 bg-white rounded-2xl">
            <div className="text-red-500 text-6xl mb-4">😕</div>
            <p className="text-xl text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchProducts}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Try Again
            </button>
          </div>
        ) : currentProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-xl text-gray-600 mb-2">No products found</p>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {currentProducts.map(product => (
                  <div 
                    key={product._id} 
                    className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 group"
                  >
                    <div className="relative overflow-hidden rounded-t-2xl">
                      <img 
                        src={product.image || 'https://via.placeholder.com/300?text=Product'} 
                        alt={product.name} 
                        className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      {product.discount > 0 && (
                        <span className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          -{product.discount}% OFF
                        </span>
                      )}
                      <button
                        onClick={() => toggleWishlist(product)}
                        className={`absolute top-4 right-4 p-2 rounded-full transition ${
                          isInWishlist(product._id) 
                            ? 'bg-red-500 text-white' 
                            : 'bg-white text-gray-600 hover:bg-red-500 hover:text-white'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${isInWishlist(product._id) ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-lg text-gray-800">{product.name}</h3>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm ml-1">4.5</span>
                        </div>
                      </div>
                      <p className="text-gray-500 text-sm mb-3 line-clamp-2">{product.description}</p>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <span className="text-2xl font-bold text-indigo-600">₹{product.price}</span>
                          {product.discount > 0 && (
                            <span className="ml-2 text-sm text-gray-400 line-through">
                              ₹{Math.round(product.price * (1 + product.discount/100))}
                            </span>
                          )}
                        </div>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          product.stock > 10 ? 'bg-green-100 text-green-800' : 
                          product.stock > 0 ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                        </span>
                      </div>
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock === 0}
                        className={`w-full py-3 rounded-xl font-semibold transition flex items-center justify-center space-x-2 ${
                          product.stock > 0 
                            ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        <ShoppingCart className="w-4 h-4" />
                        <span>{product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {currentProducts.map(product => (
                  <div key={product._id} className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-xl transition">
                    <div className="flex flex-col md:flex-row md:items-center gap-6">
                      <img 
                        src={product.image || 'https://via.placeholder.com/300?text=Product'} 
                        alt={product.name} 
                        className="w-full md:w-32 h-32 object-cover rounded-xl"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-xl text-gray-800">{product.name}</h3>
                            <p className="text-gray-500 mt-1">{product.description}</p>
                          </div>
                          <button
                            onClick={() => toggleWishlist(product)}
                            className={`p-2 rounded-full ${
                              isInWishlist(product._id) ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
                            }`}
                          >
                            <Heart className={`w-5 h-5 ${isInWishlist(product._id) ? 'fill-current' : ''}`} />
                          </button>
                        </div>
                        <div className="flex flex-wrap items-center justify-between mt-4">
                          <div className="flex items-center space-x-4">
                            <span className="text-2xl font-bold text-indigo-600">₹{product.price}</span>
                            <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                              product.stock > 10 ? 'bg-green-100 text-green-800' : 
                              product.stock > 0 ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-red-100 text-red-800'
                            }`}>
                              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                            </span>
                          </div>
                          <button
                            onClick={() => handleAddToCart(product)}
                            disabled={product.stock === 0}
                            className={`px-6 py-2 rounded-lg font-semibold transition flex items-center space-x-2 ${
                              product.stock > 0 
                                ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            <ShoppingCart className="w-4 h-4" />
                            <span>Add to Cart</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-8">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-10 h-10 rounded-lg transition ${
                      currentPage === i + 1
                        ? 'bg-indigo-600 text-white'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}

        {/* Features Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <Truck className="w-10 h-10 text-indigo-600 mb-4" />
            <h3 className="font-semibold mb-2">Free Shipping</h3>
            <p className="text-sm text-gray-500">On orders above ₹999</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <Shield className="w-10 h-10 text-indigo-600 mb-4" />
            <h3 className="font-semibold mb-2">Secure Payment</h3>
            <p className="text-sm text-gray-500">100% secure transactions</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <TrendingUp className="w-10 h-10 text-indigo-600 mb-4" />
            <h3 className="font-semibold mb-2">Best Prices</h3>
            <p className="text-sm text-gray-500">Price match guarantee</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <Clock className="w-10 h-10 text-indigo-600 mb-4" />
            <h3 className="font-semibold mb-2">24/7 Support</h3>
            <p className="text-sm text-gray-500">Round the clock assistance</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;