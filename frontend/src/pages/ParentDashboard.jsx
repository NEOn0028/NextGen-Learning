import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import axios from 'axios';
import { Users, TrendingUp, Award, LogOut, Menu, X, BookOpen } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ParentDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
        
        const response = await axios.get(`${API}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        });
        
        if (response.data.role !== 'parent') {
          navigate('/student/dashboard');
          return;
        }
        
        setUser(response.data);
        await loadChildren(token);
      } catch (error) {
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [navigate]);
  
  const loadChildren = async (token) => {
    try {
      const response = await axios.get(`${API}/parent/children`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChildren(response.data);
    } catch (error) {
      toast.error('Failed to load children data');
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-slate-50">
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <img 
              src="https://customer-assets.emergentagent.com/job_board-ready-3/artifacts/9esikr1w_ChatGPT%20Image%20Mar%209%2C%202026%2C%2001_45_09%20PM.png" 
              alt="NextGen Learning" 
              className="h-8"
            />
            <span className="font-bold heading-font text-xl">NextGen Learning</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="p-4 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-50 text-blue-600 font-medium" data-testid="sidebar-dashboard-btn">
            <Users className="w-5 h-5" />
            <span>Dashboard</span>
          </button>
        </nav>
        
        <div className="absolute bottom-0 w-full p-4 border-t border-slate-200">
          <Button onClick={handleLogout} variant="ghost" className="w-full justify-start text-slate-700" data-testid="sidebar-logout-btn">
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </Button>
        </div>
      </aside>
      
      <div className="md:pl-64">
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200 h-16 flex items-center px-6">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden mr-4">
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold heading-font" data-testid="dashboard-title">Parent Dashboard</h1>
        </header>
        
        <main className="p-6 space-y-6">
          {children.length === 0 ? (
            <Card className="p-12 text-center">
              <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-slate-600 mb-2">No children linked</h3>
              <p className="text-slate-500">Ask your child to add your email during signup</p>
            </Card>
          ) : (
            <div className="space-y-6">
              {children.map((child) => (
                <Card key={child.user_id} className="p-6" data-testid={`child-card-${child.user_id}`}>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full gradient-brand flex items-center justify-center text-white text-2xl font-bold">
                      {child.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold heading-font">{child.name}</h3>
                      <p className="text-slate-600">{child.email}</p>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <p className="text-sm text-slate-600 mb-1">Enrolled Courses</p>
                      <p className="text-2xl font-bold heading-font">0</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <p className="text-sm text-slate-600 mb-1">Attendance</p>
                      <p className="text-2xl font-bold heading-font">0%</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <p className="text-sm text-slate-600 mb-1">Avg Score</p>
                      <p className="text-2xl font-bold heading-font">-</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ParentDashboard;
