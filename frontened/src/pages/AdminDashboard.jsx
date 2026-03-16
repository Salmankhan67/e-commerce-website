import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  TrendingUp,
  Users,
  Settings,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Search,
  Filter,
  X,
  CheckCircle,
  Clock,
  Truck,
  DollarSign,
  Star,
  AlertCircle,
  Menu,
  LogOut,
  Bell,
  Tag,
  Percent,
  Award,
  BarChart,
  Download,
  Upload,
  Eye,
  EyeOff,
  Copy,
  Calendar,
  ChevronDown,
  Grid,
  List,
  Image,
  FileText,
  Home,
  FolderTree,
  MessageSquare,
  CreditCard,
  Shield,
  Gift
} from "lucide-react";
import ImageUpload from '../Components/ImageUpload';
function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [promoCodes, setPromoCodes] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI State
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // ADDED
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [dateRange, setDateRange] = useState("today");
  const [viewMode, setViewMode] = useState("grid");

  // Modal States
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showAddPromoModal, setShowAddPromoModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(null);

  // Form States
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    image: "",
    description: "",
    stock: 100,
    discount: 0,
    category: "",
    featured: false,
    images: [],
    specifications: {},
    taxRate: 18,
  });

  const [newCategory, setNewCategory] = useState({
    name: "",
    icon: "",
    description: "",
    image: "",
    parentCategory: "",
    isActive: true
  });

  const [newPromo, setNewPromo] = useState({
    code: "",
    discountType: "percentage",
    discountValue: "",
    minOrderValue: 0,
    maxDiscount: "",
    startDate: "",
    endDate: "",
    usageLimit: "",
    isActive: true
  });

  // ========== AUTH FUNCTIONS ==========
  const getToken = () => {
    const auth = JSON.parse(localStorage.getItem("auth") || "null");
    return auth?.token || null;
  };

  const getAuthHeader = () => {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const handleLogout = () => {
    localStorage.removeItem("auth");
    window.location.href = '/login';
  };

  // ========== HELPER FUNCTION FOR API CALLS ========== ADDED
  const fetchWithError = async (url, options = {}) => {
    try {
      const res = await fetch(url, options);
      if (res.status === 401) {
        handleLogout();
        throw new Error('Unauthorized');
      }
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || 'Request failed');
      }
      return await res.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  };

  // ========== FETCH ALL DATA ==========
  useEffect(() => {
    if (!getToken()) {
      window.location.href = '/login';
      return;
    }
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchProducts(),
        fetchOrders(),
        fetchUsers(),
        fetchCategories(),
        fetchPromoCodes(),
        fetchReviews()
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const data = await fetchWithError("http://localhost:5000/api/products", {
        headers: getAuthHeader(),
      });
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setProducts([]);
    }
  };

  const fetchOrders = async () => {
    try {
      const data = await fetchWithError("http://localhost:5000/api/orders", {
        headers: getAuthHeader(),
      });
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setOrders([]);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await fetchWithError("http://localhost:5000/api/users", {
        headers: getAuthHeader(),
      });
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setUsers([]);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await fetchWithError("http://localhost:5000/api/categories", {
        headers: getAuthHeader(),
      });
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setCategories([]);
    }
  };

  const fetchPromoCodes = async () => { // UPDATED with error handling
    try {
      const data = await fetchWithError("http://localhost:5000/api/promo", {
        headers: getAuthHeader(),
      });
      setPromoCodes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setPromoCodes([]);
    }
  };

  const fetchReviews = async () => {
    try {
      const data = await fetchWithError("http://localhost:5000/api/reviews", {
        headers: getAuthHeader(),
      });
      setReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setReviews([]);
    }
  };

  // ========== CRUD OPERATIONS ==========
  const addProduct = async (e) => {
    e.preventDefault();
    try {
      await fetchWithError("http://localhost:5000/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify(newProduct),
      });
      alert('✅ Product added successfully');
      setShowAddProductModal(false);
      resetProductForm();
      fetchProducts();
    } catch (error) {
      console.error("Error adding product:", error);
      alert('❌ Failed to add product: ' + error.message);
    }
  };

  const addCategory = async (e) => {
    e.preventDefault();
    try {
      await fetchWithError("http://localhost:5000/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify(newCategory),
      });
      alert('✅ Category added successfully');
      setShowAddCategoryModal(false);
      resetCategoryForm();
      fetchCategories();
    } catch (error) {
      console.error("Error adding category:", error);
      alert('❌ Failed to add category: ' + error.message);
    }
  };

  const addPromoCode = async (e) => { // UPDATED with proper error handling
    e.preventDefault();
    try {
      const token = getToken();
      if (!token) {
        alert('Please login again');
        return;
      }

      if (!newPromo.code || !newPromo.discountValue) {
        alert('Code and discount value are required');
        return;
      }

      const promoData = {
        code: newPromo.code.toUpperCase(),
        discountType: newPromo.discountType,
        discountValue: Number(newPromo.discountValue),
        minOrderValue: newPromo.minOrderValue ? Number(newPromo.minOrderValue) : 0,
        maxDiscount: newPromo.maxDiscount ? Number(newPromo.maxDiscount) : null,
        startDate: newPromo.startDate || null,
        endDate: newPromo.endDate || null,
        usageLimit: newPromo.usageLimit ? Number(newPromo.usageLimit) : null,
        isActive: newPromo.isActive
      };

      await fetchWithError("http://localhost:5000/api/promo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(promoData),
      });

      alert('✅ Promo code created successfully!');
      setShowAddPromoModal(false);
      resetPromoForm();
      fetchPromoCodes();
    } catch (error) {
      console.error("Error adding promo code:", error);
      alert('❌ Failed to create promo: ' + error.message);
    }
  };

  const updateProduct = async (id, updates) => {
    try {
      await fetchWithError(`http://localhost:5000/api/products/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify(updates),
      });
      alert('✅ Product updated successfully');
      setShowEditModal(null);
      fetchProducts();
    } catch (error) {
      console.error("Error updating product:", error);
      alert('❌ Failed to update product: ' + error.message);
    }
  };

  const deleteItem = async (endpoint, id) => { // UPDATED with error handling
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      await fetchWithError(`http://localhost:5000/api/${endpoint}/${id}`, {
        method: "DELETE",
        headers: getAuthHeader(),
      });
      alert('✅ Item deleted successfully');
      setShowDeleteConfirm(null);
      if (endpoint === 'products') fetchProducts();
      if (endpoint === 'categories') fetchCategories();
      if (endpoint === 'promo') fetchPromoCodes();
    } catch (error) {
      console.error("Error deleting:", error);
      alert('❌ Failed to delete: ' + error.message);
    }
  };

  const updateOrderStatus = async (id, status) => { // UPDATED with error handling
    try {
      await fetchWithError(`http://localhost:5000/api/orders/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify({ status }),
      });
      alert(`✅ Order status updated to ${status}`);
      fetchOrders();
    } catch (error) {
      console.error("Error updating order:", error);
      alert('❌ Failed to update order: ' + error.message);
    }
  };

  const togglePromoStatus = async (id, currentStatus) => { // UPDATED with proper endpoint
    try {
      const token = getToken();
      await fetchWithError(`http://localhost:5000/api/promo/${id}/toggle`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });
      fetchPromoCodes();
    } catch (error) {
      console.error("Error toggling promo:", error);
      alert('❌ Failed to update promo status: ' + error.message);
    }
  };

  // ========== RESET FORMS ==========
  const resetProductForm = () => {
    setNewProduct({
      name: "", price: "", image: "", description: "",
      stock: 100, discount: 0, category: "", featured: false,
      images: [], specifications: {}, taxRate: 18
    });
  };

  const resetCategoryForm = () => {
    setNewCategory({
      name: "", icon: "", description: "", image: "", parentCategory: "", isActive: true
    });
  };

  const resetPromoForm = () => {
    setNewPromo({
      code: "", discountType: "percentage", discountValue: "", minOrderValue: 0,
      maxDiscount: "", startDate: "", endDate: "", usageLimit: "", isActive: true
    });
  };

  // ========== HELPER FUNCTIONS ==========
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'processing': return <RefreshCw className="w-4 h-4" />;
      case 'shipped': return <Truck className="w-4 h-4" />;
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <X className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const generatePromoCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPromo({ ...newPromo, code });
  };

  // ========== CALCULATIONS ==========
  const totalRevenue = orders.reduce((a, b) => a + (b.total || 0), 0);
  const totalProducts = products.length;
  const totalOrders = orders.length;
  const totalUsers = users.length;
  const pendingOrders = orders.filter(o => o.status === "Pending").length;
  const processingOrders = orders.filter(o => o.status === "Processing").length;
  const shippedOrders = orders.filter(o => o.status === "Shipped").length;
  const deliveredOrders = orders.filter(o => o.status === "Delivered").length;
  const cancelledOrders = orders.filter(o => o.status === "Cancelled").length;

  const totalTaxCollected = orders.reduce((sum, order) => sum + (order.tax || 0), 0);
  const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
  const conversionRate = users.length > 0 ? (orders.length / users.length * 100).toFixed(1) : 0;

  // ========== FILTERS ==========
  const filteredProducts = products.filter(product =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredOrders = orders.filter(order => {
    if (filterStatus === "all") return true;
    return order.status?.toLowerCase() === filterStatus.toLowerCase();
  });

  // ========== NAVIGATION ITEMS ==========
  const navigation = [
    { name: "Dashboard", icon: LayoutDashboard, id: "dashboard", count: null },
    { name: "Products", icon: Package, id: "products", count: products.length },
    { name: "Orders", icon: ShoppingCart, id: "orders", count: orders.length },
    { name: "Categories", icon: FolderTree, id: "categories", count: categories.length },
    { name: "Promo Codes", icon: Tag, id: "promos", count: promoCodes.length },
    { name: "Reviews", icon: MessageSquare, id: "reviews", count: reviews.length },
    { name: "Customers", icon: Users, id: "customers", count: users.length },
    { name: "Analytics", icon: BarChart, id: "analytics", count: null },
    { name: "Settings", icon: Settings, id: "settings", count: null },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* ========== MOBILE HEADER ========== ADDED */}
      <div className="lg:hidden bg-white shadow-md p-4 flex items-center justify-between sticky top-0 z-20">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-indigo-600">StoreFlow</h1>
        <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
          A
        </div>
      </div>

      {/* ========== MOBILE SIDEBAR OVERLAY ========== ADDED */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* ========== MOBILE SIDEBAR ========== ADDED */}
      <div className={`fixed top-0 left-0 h-full w-64 bg-white shadow-xl z-40 transform transition-transform lg:hidden ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-indigo-600">Menu</h2>
          <button onClick={() => setMobileMenuOpen(false)} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="p-4">
          {navigation.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center px-4 py-3 rounded-lg mb-1 ${activeTab === item.id ? 'bg-indigo-600 text-white' : 'hover:bg-gray-100'
                }`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </button>
          ))}
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg mt-4"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </nav>
      </div>

      {/* ========== DESKTOP SIDEBAR ========== */}
      <div className={`hidden lg:block ${sidebarOpen ? 'w-64' : 'w-20'} bg-white shadow-lg transition-all duration-300 relative`}>
        <div className="p-4 border-b flex items-center justify-between">
          {sidebarOpen ? (
            <h1 className="text-xl font-bold text-indigo-600">StoreFlow Admin</h1>
          ) : (
            <h1 className="text-xl font-bold text-indigo-600 mx-auto">SF</h1>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 hover:bg-gray-100 rounded-lg"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          {navigation.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center ${sidebarOpen ? 'px-4' : 'px-2 justify-center'} py-3 rounded-lg mb-1 transition-colors relative ${activeTab === item.id
                ? "bg-indigo-50 text-indigo-600"
                : "text-gray-600 hover:bg-gray-50"
                }`}
            >
              <item.icon className="w-5 h-5" />
              {sidebarOpen && (
                <>
                  <span className="ml-3 flex-1 text-left">{item.name}</span>
                  {item.count !== null && item.count > 0 && (
                    <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">
                      {item.count}
                    </span>
                  )}
                </>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className={`hidden lg:flex items-center ${sidebarOpen ? 'px-4' : 'px-2 justify-center'} py-3 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg w-full transition-colors group`}
          >
            <LogOut className="w-5 h-5 group-hover:text-red-600" />
            {sidebarOpen && (
              <span className="ml-3 group-hover:text-red-600">Logout</span>
            )}
          </button>
        </div>
      </div>

      {/* ========== MAIN CONTENT ========== */}
      <div className="flex-1 overflow-auto">
        {/* Desktop Header */}
        <header className="hidden lg:block bg-white shadow-sm sticky top-0 z-10">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <h2 className="text-2xl font-semibold text-gray-800">
                {navigation.find(n => n.id === activeTab)?.name}
              </h2>
              {activeTab === 'dashboard' && (
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="px-3 py-1 border border-gray-200 rounded-lg text-sm"
                >
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                </select>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder={`Search ${activeTab}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
                />
              </div>

              <button className="p-2 hover:bg-gray-100 rounded-full relative">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              <div className="flex items-center space-x-3">
                <img
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                  alt="Admin"
                  className="w-10 h-10 rounded-full object-cover"
                />
                {sidebarOpen && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Admin User</p>
                    <p className="text-xs text-gray-500">Super Admin</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Search Bar - ADDED */}
        <div className="lg:hidden p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* ========== DASHBOARD CONTENT ========== */}
        <div className="p-6">
          {/* DASHBOARD TAB */}
          {activeTab === "dashboard" && (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
                      <p className="text-2xl font-bold text-gray-800">Rs.{totalRevenue.toLocaleString()}</p>
                      <p className="text-xs text-green-500 mt-2">↑ 12.5% from last month</p>
                    </div>
                    <div className="bg-green-500 p-3 rounded-lg">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Total Orders</p>
                      <p className="text-2xl font-bold text-gray-800">{totalOrders}</p>
                      <p className="text-xs text-gray-500 mt-2">{pendingOrders} pending</p>
                    </div>
                    <div className="bg-purple-500 p-3 rounded-lg">
                      <ShoppingCart className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Total Customers</p>
                      <p className="text-2xl font-bold text-gray-800">{totalUsers}</p>
                      <p className="text-xs text-gray-500 mt-2">{users.filter(u => u.role === 'user').length} active</p>
                    </div>
                    <div className="bg-blue-500 p-3 rounded-lg">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Products</p>
                      <p className="text-2xl font-bold text-gray-800">{totalProducts}</p>
                      <p className="text-xs text-gray-500 mt-2">{products.filter(p => p.stock < 10).length} low stock</p>
                    </div>
                    <div className="bg-indigo-500 p-3 rounded-lg">
                      <Package className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Second Row Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center space-x-3">
                    <div className="bg-yellow-100 p-3 rounded-lg">
                      <Clock className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Pending Orders</p>
                      <p className="text-xl font-bold">{pendingOrders}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <RefreshCw className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Processing</p>
                      <p className="text-xl font-bold">{processingOrders}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center space-x-3">
                    <div className="bg-purple-100 p-3 rounded-lg">
                      <Truck className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Shipped</p>
                      <p className="text-xl font-bold">{shippedOrders}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-100 p-3 rounded-lg">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Delivered</p>
                      <p className="text-xl font-bold">{deliveredOrders}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts and Tables */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Revenue Chart Placeholder */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold mb-4">Revenue Overview</h3>
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <BarChart className="w-12 h-12 text-gray-400" />
                    <span className="ml-2 text-gray-500">Chart will be displayed here</span>
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold mb-4">Key Metrics</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-500">Average Order Value</span>
                        <span className="font-medium">Rs.{averageOrderValue.toFixed(2)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '70%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-500">Conversion Rate</span>
                        <span className="font-medium">{conversionRate}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: `${conversionRate}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-500">Tax Collected</span>
                        <span className="font-medium">Rs.{totalTaxCollected.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t">
                    <h4 className="font-medium mb-3">Quick Actions</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <button className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 text-sm">
                        Export Report
                      </button>
                      <button className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 text-sm">
                        Send Email
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Orders */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">Recent Orders</h3>
                  <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                    View All
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 text-sm font-medium text-gray-500">Order ID</th>
                        <th className="text-left py-3 text-sm font-medium text-gray-500">Customer</th>
                        <th className="text-left py-3 text-sm font-medium text-gray-500">Amount</th>
                        <th className="text-left py-3 text-sm font-medium text-gray-500">Tax</th>
                        <th className="text-left py-3 text-sm font-medium text-gray-500">Status</th>
                        <th className="text-left py-3 text-sm font-medium text-gray-500">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice(0, 5).map((order) => (
                        <tr key={order._id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 text-sm font-medium text-gray-800">#{order._id?.slice(-8)}</td>
                          <td className="py-3 text-sm text-gray-600">{order.userId?.name || 'N/A'}</td>
                          <td className="py-3 text-sm font-medium text-gray-800">Rs.{order.total}</td>
                          <td className="py-3 text-sm text-gray-600">Rs.{order.tax || 0}</td>
                          <td className="py-3">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                              {getStatusIcon(order.status)}
                              <span className="ml-1">{order.status}</span>
                            </span>
                          </td>
                          <td className="py-3 text-sm text-gray-600">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* PRODUCTS TAB */}
          {activeTab === "products" && (
            <>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center space-x-4">
                  <h3 className="text-lg font-semibold text-gray-800">Manage Products</h3>
                  <div className="flex items-center space-x-2 border rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'hover:bg-gray-100'}`}
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'hover:bg-gray-100'}`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddProductModal(true)}
                  className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition w-full sm:w-auto justify-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </button>
              </div>

              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredProducts.map((product) => (
                    <div key={product._id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition">
                      <div className="relative h-48">
                        <img
                          src={product.image ? `http://localhost:5000${product.image}` : 'https://via.placeholder.com/300?text=Product'}
                          alt={product.name}
                          className="w-50 h-48 object-cover hover:scale-105 transition-transform"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/300?text=Product';
                          }}
                        />
                        {product.discount > 0 && (
                          <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                            -{product.discount}%
                          </span>
                        )}
                        {product.featured && (
                          <span className="absolute top-2 left-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded">
                            Featured
                          </span>
                        )}
                      </div>

                      <div className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-800">{product.name}</h4>
                            <p className="text-xs text-gray-500">{product.category}</p>
                          </div>
                          <span className={`text-xs font-medium px-2 py-1 rounded ${product.stock > 20 ? 'bg-green-100 text-green-800' :
                            product.stock > 0 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                            Stock: {product.stock}
                          </span>
                        </div>

                        <div className="mt-3">
                          <div className="flex items-baseline">
                            <span className="text-lg font-bold text-gray-800">Rs.{product.price}</span>
                            {product.discount > 0 && (
                              <span className="ml-2 text-xs text-gray-400 line-through">
                                Rs.{Math.round(product.price * (1 + product.discount / 100))}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Tax: {product.taxRate || 18}% GST</p>
                        </div>

                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">{product.description}</p>

                        <div className="flex items-center justify-between mt-4">
                          <button
                            onClick={() => setShowEditModal(product)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => updateProduct(product._id, { stock: product.stock + 10 })}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm({ type: 'products', id: product._id })}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden overflow-x-auto">
                  <table className="w-full min-w-[800px]">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tax</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredProducts.map((product) => (
                        <tr key={product._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">

                              <img
                                src={product.image ? `http://localhost:5000${product.image}` : 'https://via.placeholder.com/40?text=Product'}
                                alt={product.name}
                                className="w-10 h-10 object-cover rounded"
                                onError={(e) => {
                                  e.target.src = 'https://via.placeholder.com/40?text=Product';
                                }}
                              />   
                               <span className="font-medium">{product.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">{product.category}</td>
                          <td className="px-6 py-4 font-medium">₹{product.price}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs ${product.stock > 20 ? 'bg-green-100 text-green-800' :
                              product.stock > 0 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                              {product.stock}
                            </span>
                          </td>
                          <td className="px-6 py-4">{product.taxRate || 18}%</td>
                          <td className="px-6 py-4">
                            <div className="flex space-x-2">
                              <button className="text-blue-600 hover:text-blue-800">Edit</button>
                              <button className="text-red-600 hover:text-red-800">Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* ORDERS TAB */}
          {activeTab === "orders" && (
            <>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <h3 className="text-lg font-semibold text-gray-800">Order Management</h3>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full sm:w-auto px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <button className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm overflow-hidden overflow-x-auto">
                <div className="min-w-[1000px]">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tax</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredOrders.map((order) => (
                        <tr key={order._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            #{order._id?.slice(-8)}
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{order.userId?.name}</div>
                              <div className="text-xs text-gray-500">{order.userId?.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {order.items?.length} items
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            Rs.{order.subtotal || order.total}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            Rs.{order.tax || 0}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            Rs.{order.total}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                              {getStatusIcon(order.status)}
                              <span className="ml-1">{order.status}</span>
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <select
                                value={order.status}
                                onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                                className="px-2 py-1 border border-gray-200 rounded text-sm"
                              >
                                <option>Pending</option>
                                <option>Processing</option>
                                <option>Shipped</option>
                                <option>Delivered</option>
                                <option>Cancelled</option>
                              </select>
                              <button
                                onClick={() => setShowOrderDetails(order)}
                                className="p-1 text-indigo-600 hover:bg-indigo-50 rounded"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* CATEGORIES TAB */}
          {activeTab === "categories" && (
            <>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <h3 className="text-lg font-semibold text-gray-800">Manage Categories</h3>
                <button
                  onClick={() => setShowAddCategoryModal(true)}
                  className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 w-full sm:w-auto justify-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Category
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category) => (
                  <div key={category._id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-xl">
                          {category.icon || '📁'}
                        </div>
                        <div>
                          <h4 className="font-semibold">{category.name}</h4>
                          <p className="text-xs text-gray-500">
                            {products.filter(p => p.category === category.name).length} products
                          </p>
                        </div>
                      </div>
                      {category.isActive ? (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Active</span>
                      ) : (
                        <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">Inactive</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-4">{category.description}</p>
                    <div className="flex items-center justify-between">
                      <button className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
                      <button
                        onClick={() => setShowDeleteConfirm({ type: 'categories', id: category._id })}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* PROMO CODES TAB */}
          {activeTab === "promos" && (
            <>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <h3 className="text-lg font-semibold text-gray-800">Promo Codes</h3>
                <button
                  onClick={() => setShowAddPromoModal(true)}
                  className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 w-full sm:w-auto justify-center"
                >
                  <Gift className="w-4 h-4 mr-2" />
                  Create Promo
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {promoCodes.map((promo) => (
                  <div key={promo._id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-2 rounded-lg">
                          <Tag className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-mono font-bold text-lg">{promo.code}</h4>
                          <p className="text-xs text-gray-500">
                            {promo.discountType === 'percentage' ? `${promo.discountValue}% OFF` : `Rs.${promo.discountValue} OFF`}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => togglePromoStatus(promo._id, promo.isActive)}
                        className={`p-2 rounded-lg ${promo.isActive ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-50'}`}
                      >
                        {promo.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Min Order:</span>
                        <span className="font-medium">Rs.{promo.minOrderValue || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Max Discount:</span>
                        <span className="font-medium">Rs.{promo.maxDiscount || 'No limit'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Usage:</span>
                        <span className="font-medium">Rs.{promo.usedCount || 0} / {promo.usageLimit || '∞'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Valid:</span>
                        <span className="font-medium">
                          {promo.startDate ? new Date(promo.startDate).toLocaleDateString() : 'Always'}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t flex justify-between">
                      <button className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
                      <button
                        onClick={() => setShowDeleteConfirm({ type: 'promo', id: promo._id })}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* CUSTOMERS TAB */}
          {activeTab === "customers" && (
            <>
              <h3 className="text-lg font-semibold text-gray-800 mb-6">Customers</h3>
              <div className="bg-white rounded-xl shadow-sm overflow-hidden overflow-x-auto">
                <div className="min-w-[800px]">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orders</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                                <Users className="w-4 h-4 text-indigo-600" />
                              </div>
                              <span className="font-medium">{user.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{user.phone || 'N/A'}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {orders.filter(o => o.userId?._id === user._id).length}
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                              Active
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ========== MODALS ========== */}

      {/* Add Product Modal */}
      {showAddProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-xl font-semibold text-gray-800">Add New Product</h3>
              <button
                onClick={() => setShowAddProductModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={addProduct} className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name
                  </label>
                  <input
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (Rs.)
                  </label>
                  <input
                    type="number"
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount (%)
                  </label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    value={newProduct.discount}
                    onChange={(e) => setNewProduct({ ...newProduct, discount: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock
                  </label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tax Rate (% GST)
                  </label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    value={newProduct.taxRate}
                    onChange={(e) => setNewProduct({ ...newProduct, taxRate: e.target.value })}
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* ===== REPLACE THE IMAGE URL INPUT WITH THIS ===== */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Image
                  </label>
                  <ImageUpload
                    onImageUploaded={(url) => setNewProduct({ ...newProduct, image: url })}
                    existingImage={newProduct.image}
                  />
                  {newProduct.image && (
                    <p className="text-xs text-gray-500 mt-1">
                      ✓ Image ready: {newProduct.image}
                    </p>
                  )}
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    required
                    rows="3"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  />
                </div>

                <div className="col-span-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={newProduct.featured}
                      onChange={(e) => setNewProduct({ ...newProduct, featured: e.target.checked })}
                      className="rounded border-gray-300 text-indigo-600"
                    />
                    <span className="text-sm text-gray-700">Featured Product</span>
                  </label>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Add Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-800">Add New Category</h3>
              <button
                onClick={() => setShowAddCategoryModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={addCategory} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category Name
                  </label>
                  <input
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Icon (emoji or URL)
                  </label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    value={newCategory.icon}
                    onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
                    placeholder="📱 or image URL"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    rows="2"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    value={newCategory.description}
                    onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Parent Category (optional)
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    value={newCategory.parentCategory}
                    onChange={(e) => setNewCategory({ ...newCategory, parentCategory: e.target.value })}
                  >
                    <option value="">None (Top Level)</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={newCategory.isActive}
                      onChange={(e) => setNewCategory({ ...newCategory, isActive: e.target.checked })}
                      className="rounded border-gray-300 text-indigo-600"
                    />
                    <span className="text-sm text-gray-700">Active</span>
                  </label>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddCategoryModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Add Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Promo Code Modal */}
      {showAddPromoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-800">Create Promo Code</h3>
              <button
                onClick={() => setShowAddPromoModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={addPromoCode} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Promo Code
                  </label>
                  <div className="flex space-x-2">
                    <input
                      required
                      className="flex-1 border border-gray-300 rounded-lg px-4 py-2 font-mono uppercase"
                      value={newPromo.code}
                      onChange={(e) => setNewPromo({ ...newPromo, code: e.target.value.toUpperCase() })}
                      placeholder="SAVE10"
                    />
                    <button
                      type="button"
                      onClick={generatePromoCode}
                      className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                      <RefreshCw className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Discount Type
                    </label>
                    <select
                      className="w-full border border-gray-300 rounded-lg px-4 py-2"
                      value={newPromo.discountType}
                      onChange={(e) => setNewPromo({ ...newPromo, discountType: e.target.value })}
                    >
                      <option value="percentage">Percentage</option>
                      <option value="fixed">Fixed Amount</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Value
                    </label>
                    <input
                      type="number"
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-2"
                      value={newPromo.discountValue}
                      onChange={(e) => setNewPromo({ ...newPromo, discountValue: e.target.value })}
                      placeholder={newPromo.discountType === 'percentage' ? '10' : '100'}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Order Value (₹)
                  </label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    value={newPromo.minOrderValue}
                    onChange={(e) => setNewPromo({ ...newPromo, minOrderValue: e.target.value })}
                    placeholder="0 for no minimum"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Discount (Rs.)
                  </label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    value={newPromo.maxDiscount}
                    onChange={(e) => setNewPromo({ ...newPromo, maxDiscount: e.target.value })}
                    placeholder="Leave empty for no limit"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2"
                      value={newPromo.startDate}
                      onChange={(e) => setNewPromo({ ...newPromo, startDate: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2"
                      value={newPromo.endDate}
                      onChange={(e) => setNewPromo({ ...newPromo, endDate: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Usage Limit
                  </label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    value={newPromo.usageLimit}
                    onChange={(e) => setNewPromo({ ...newPromo, usageLimit: e.target.value })}
                    placeholder="Leave empty for unlimited"
                  />
                </div>

                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={newPromo.isActive}
                      onChange={(e) => setNewPromo({ ...newPromo, isActive: e.target.checked })}
                      className="rounded border-gray-300 text-indigo-600"
                    />
                    <span className="text-sm text-gray-700">Active immediately</span>
                  </label>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddPromoModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Create Promo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm mx-4">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-center mb-2">Confirm Delete</h3>
            <p className="text-gray-500 text-center mb-6">
              Are you sure you want to delete this item? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteItem(showDeleteConfirm.type, showDeleteConfirm.id)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {showOrderDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-xl font-semibold text-gray-800">Order Details #{showOrderDetails._id?.slice(-8)}</h3>
              <button
                onClick={() => setShowOrderDetails(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6">
              {/* Customer Info */}
              <div className="mb-6">
                <h4 className="font-semibold mb-3">Customer Information</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p><span className="font-medium">Name:</span> {showOrderDetails.userId?.name}</p>
                  <p><span className="font-medium">Email:</span> {showOrderDetails.userId?.email}</p>
                  <p><span className="font-medium">Phone:</span> {showOrderDetails.shippingAddress?.phone || 'N/A'}</p>
                </div>
              </div>

              {/* Shipping Address */}
              {showOrderDetails.shippingAddress && (
                <div className="mb-6">
                  <h4 className="font-semibold mb-3">Shipping Address</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p>{showOrderDetails.shippingAddress.fullName}</p>
                    <p>{showOrderDetails.shippingAddress.address}</p>
                    <p>{showOrderDetails.shippingAddress.city}, {showOrderDetails.shippingAddress.state} - {showOrderDetails.shippingAddress.zipCode}</p>
                    <p>{showOrderDetails.shippingAddress.country}</p>
                  </div>
                </div>
              )}

              {/* Order Items */}
              <div className="mb-6">
                <h4 className="font-semibold mb-3">Order Items</h4>
                <div className="space-y-3">
                  {showOrderDetails.items?.map((item, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded" />
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-medium">Rs.{item.price * item.quantity}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div>
                <h4 className="font-semibold mb-3">Order Summary</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span>Subtotal:</span>
                    <span>Rs.{showOrderDetails.subtotal || showOrderDetails.total}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Tax:</span>
                    <span>Rs.{showOrderDetails.tax || 0}</span>
                  </div>
                  {showOrderDetails.discount > 0 && (
                    <div className="flex justify-between mb-2 text-green-600">
                      <span>Discount:</span>
                      <span>-Rs.{showOrderDetails.discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                    <span>Total:</span>
                    <span>Rs.{showOrderDetails.total}</span>
                  </div>
                </div>
              </div>

              {/* Update Status */}
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-semibold mb-3">Update Order Status</h4>
                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    value={showOrderDetails.status}
                    onChange={(e) => {
                      updateOrderStatus(showOrderDetails._id, e.target.value);
                      setShowOrderDetails({ ...showOrderDetails, status: e.target.value });
                    }}
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2"
                  >
                    <option>Pending</option>
                    <option>Processing</option>
                    <option>Shipped</option>
                    <option>Delivered</option>
                    <option>Cancelled</option>
                  </select>
                  <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                    Update
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;