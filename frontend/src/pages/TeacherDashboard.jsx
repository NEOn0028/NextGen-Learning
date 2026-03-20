import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import axios from 'axios';
import { Upload, Video, Calendar, Users, BookOpen, LogOut, Menu, X } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
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
        
        if (response.data.role !== 'teacher' && response.data.role !== 'admin') {
          navigate('/student/dashboard');
          return;
        }
        
        setUser(response.data);
        await loadCourses(token, response.data.user_id);
      } catch (error) {
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [navigate]);
  
  const loadCourses = async (token, userId) => {
    try {
      const response = await axios.get(`${API}/courses/teacher/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCourses(response.data);
    } catch (error) {
      toast.error('Failed to load courses');
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
      {/* Sidebar */}
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
            <BookOpen className="w-5 h-5" />
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
      
      {/* Main Content */}
      <div className="md:pl-64">
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200 h-16 flex items-center px-6">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden mr-4">
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold heading-font" data-testid="dashboard-title">Teacher Dashboard</h1>
        </header>
        
        <main className="p-6 space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">My Courses</p>
                  <p className="text-3xl font-bold heading-font" data-testid="stat-courses">{courses.length}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                  <BookOpen className="w-6 h-6" />
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Total Students</p>
                  <p className="text-3xl font-bold heading-font">0</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-violet-100 flex items-center justify-center text-violet-600">
                  <Users className="w-6 h-6" />
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Lectures</p>
                  <p className="text-3xl font-bold heading-font">0</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                  <Video className="w-6 h-6" />
                </div>
              </div>
            </Card>
          </div>
          
          <div>
            <h2 className="text-2xl font-semibold heading-font mb-4">My Courses</h2>
            {courses.length === 0 ? (
              <Card className="p-12 text-center">
                <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-slate-600 mb-2">No courses created yet</h3>
                <p className="text-slate-500 mb-6">Contact admin to create your first course</p>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <Card key={course.course_id} className="hover-lift" data-testid={`course-card-${course.course_id}`}>
                    <div className="p-6">
                      <h3 className="text-xl font-semibold heading-font mb-2">{course.title}</h3>
                      <p className="text-sm text-slate-600 mb-4">{course.subject} • Class {course.class_level}</p>
                      <Button className="w-full bg-blue-600 hover:bg-blue-700" data-testid={`manage-course-btn-${course.course_id}`}>
                        Manage Course
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default TeacherDashboard;
