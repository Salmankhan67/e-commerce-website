import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GoogleLogin from '../Components/GoogleLogin';
import './Auth.css';

function Signup() {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false); // Optional: add loading state

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser({
      ...user,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!user.name || !user.email || !user.password) {
      alert("Please fill all fields");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: user.name,
          email: user.email,
          password: user.password
        })
      });

      const data = await response.json();

      if (response.ok) {
        // ✅ FIXED: Don't auto-login, just show success and redirect to signin
        alert("✅ Account created successfully! Please login with your credentials.");
        
        // Clear form
        setUser({ name: '', email: '', password: '' });
        
        // Redirect to signin page
        navigate('/signin');
        
      } else {
        // Show error message from server
        alert("❌ " + (data.message || "Signup failed"));
      }
    } catch (error) {
      console.error("Signup error:", error);
      alert("❌ Cannot connect to server.\n\nIs backend running on port 5000?");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleUser = (userData) => {
    console.log('Google user signed up:', userData);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Sign Up</h2>

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Name */}
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={user.name}
              onChange={handleChange}
              placeholder="Your full name"
              required
              disabled={loading}
            />
          </div>

          {/* Email */}
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={user.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              disabled={loading}
            />
          </div>

          {/* Password */}
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={user.password}
              onChange={handleChange}
              placeholder="Create a strong password"
              required
              disabled={loading}
            />
          </div>

          {/* Submit button */}
          <button 
            type="submit" 
            className="auth-btn"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        {/* Divider */}
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
          Already have an account? <a href="/signin">Sign In</a>
        </p>
      </div>
    </div>
  );
}

export default Signup;