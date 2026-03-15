import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Signup from './Components/Signup';
import SignIn from './Components/SignIn';
import Dashboard from './pages/Dashboard';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Navbar from './Components/Navbar';
import AdminDashboard from './pages/AdminDashboard';
import "./app.css";

// Check if user is logged in
const isLoggedIn = () => {
  const auth = JSON.parse(localStorage.getItem('auth') || 'null');
  return !!auth?.token;
};

// Protected route for any logged in user
function ProtectedRoute({ children }) {
  const auth = JSON.parse(localStorage.getItem('auth') || 'null');
  if (!auth?.token) {
    return <Navigate to="/signin" />;
  }
  return children;
}

// Protected route for admin only
function AdminProtectedRoute({ children }) {
  const auth = JSON.parse(localStorage.getItem('auth') || 'null');
  
  console.log('AdminProtectedRoute - auth:', auth); // DEBUG
  
  if (!auth?.token) {
    console.log('No token, redirecting to signin');
    return <Navigate to="/signin" />;
  }
  
  if (auth?.user?.role !== 'admin') {
    console.log('Role is not admin:', auth?.user?.role);
    return <Navigate to="/dashboard" />;
  }
  
  console.log('Admin access granted');
  return children;
}

function App() {
  const logout = () => {
    localStorage.removeItem('auth');
    localStorage.removeItem('cart');
    window.location.href = '/signin';
  };

  function ConditionalNavbar() {
    const location = useLocation();
    const loggedIn = isLoggedIn();
    const show = loggedIn && !['/signin', '/signup', '/','/admin'].includes(location.pathname);
    return show ? <Navbar isLoggedIn={true} onLogout={logout} /> : null;
  }

  return (
    <CartProvider>
      <BrowserRouter>
        <ConditionalNavbar />
        <Routes>
          <Route path="/" element={
            <div className="min-h-screen flex flex-col">
             
              <div className="w-full bg-gradient-to-br from-blue-50 to-indigo-100 p-4 items-center justify-center">
                <Signup />
              </div>
            </div>
          } />

          <Route path="/signup" element={<Navigate to="/" />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signout" element={<Navigate to="/signin" replace />} />

          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/cart" element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          } />
          
          <Route path="/checkout" element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          } />

          <Route path="/admin" element={
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          } />

          <Route path="*" element={<h1 className="p-8 text-center">404 - Page Not Found</h1>} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;