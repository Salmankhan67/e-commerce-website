import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GoogleLogin from '../Components/GoogleLogin'; 
import './Auth.css';
import { API } from '../config';
function SignIn() {
  const navigate = useNavigate();

  const [user, setUser] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser({
      ...user,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user.email || !user.password) {
      alert("Please fill email and password");
      return;
    }

    try {
      const response = await fetch(`${API.auth}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: user.email,
          password: user.password
        })
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Login successful!');
        console.log('User data from server:', data.user);
        console.log('User role:', data.user?.role);

        // persist token + user
        localStorage.setItem('auth', JSON.stringify({ token: data.token, user: data.user }));
        
        // Verify what was saved
        const saved = JSON.parse(localStorage.getItem('auth'));
        console.log('Saved to localStorage:', saved);
        console.log('Saved user role:', saved?.user?.role);

        // navigate based on role
        if (data.user.role === 'admin') {
          console.log('Navigating to /admin');
          navigate('/admin');
        } else {
          console.log('Navigating to /dashboard');
          navigate('/dashboard');
        }

        setUser({ email: '', password: '' });
      } else {
        alert("Login failed: " + data.message);
      }
    } catch (error) {
      alert("Cannot connect to server.\nIs backend running?");
      console.log("Login error:", error);
    }
  };

  // Add this function to handle Google user
  const handleGoogleUser = (userData) => {
    console.log('Google user logged in:', userData);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Sign In</h2>

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Email */}
          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" value={user.email} onChange={handleChange} placeholder="you@example.com" required />
          </div>

          {/* Password */}
          <div className="form-group">
            <label>Password</label>
            <input type="password" name="password" value={user.password} onChange={handleChange} placeholder="••••••••" required />
          </div>

          <button type="submit" className="auth-btn">Sign In</button>
        </form>

        {/* ===== ADD DIVIDER AND GOOGLE BUTTON HERE ===== */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <GoogleLogin setUser={handleGoogleUser} />

        <p className="auth-link mt-6">
          Don't have an account? <a href="/signup">Sign Up</a>
        </p>
      </div>
    </div>
  );
}

export default SignIn;