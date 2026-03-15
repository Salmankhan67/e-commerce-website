import { useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';

function GoogleLogin({ setUser }) {
  const navigate = useNavigate();

  const login = useGoogleLogin({
    flow: 'auth-code',
    onSuccess: async (codeResponse) => {
      console.log('✅ Google login success, code:', codeResponse.code);
      
      try {
        console.log('Sending to:', 'http://localhost:5000/api/auth/google');
        
        const res = await fetch('http://localhost:5000/api/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: codeResponse.code })
        });

        const data = await res.json();
        console.log('Backend response:', data);

        if (res.ok) {
          localStorage.setItem('auth', JSON.stringify({
            token: data.token,
            user: data.user
          }));
          
          setUser(data.user);
          navigate(data.user.role === 'admin' ? '/admin' : '/dashboard');
        } else {
          alert('❌ Error: ' + (data.error || data.message || 'Unknown error'));
        }
      } catch (error) {
        console.error('❌ Fetch error:', error);
        alert('Server error - check console');
      }
    },
    onError: (error) => {
      console.error('❌ Google login failed:', error);
      alert('Google login failed');
    }
  });

  return (
    <button onClick={() => login()} className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition font-medium">
      <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
      Continue with Google
    </button>
  );
}

export default GoogleLogin;