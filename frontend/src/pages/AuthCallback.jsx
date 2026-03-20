import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const hasProcessed = useRef(false);
  
  useEffect(() => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    if (hasProcessed.current) return;
    hasProcessed.current = true;
    
    const processSession = async () => {
      try {
        // Extract session_id from URL fragment
        const hash = location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const sessionId = params.get('session_id');
        
        if (!sessionId) {
          toast.error('Invalid session');
          navigate('/login');
          return;
        }
        
        // Exchange session_id for session_token
        const response = await axios.post(
          `${API}/auth/session`,
          {},
          {
            headers: { 'X-Session-ID': sessionId },
            withCredentials: true
          }
        );
        
        // Store user data
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Navigate based on role
        const role = response.data.user.role;
        if (role === 'admin') navigate('/admin/dashboard', { state: { user: response.data.user } });
        else if (role === 'teacher') navigate('/teacher/dashboard', { state: { user: response.data.user } });
        else if (role === 'parent') navigate('/parent/dashboard', { state: { user: response.data.user } });
        else navigate('/student/dashboard', { state: { user: response.data.user } });
        
        toast.success('Welcome back!');
      } catch (error) {
        console.error('Auth callback error:', error);
        toast.error('Authentication failed');
        navigate('/login');
      }
    };
    
    processSession();
  }, [navigate, location]);
  
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-lg text-slate-600">Completing sign in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
