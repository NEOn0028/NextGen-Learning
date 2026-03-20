import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import axios from 'axios';
import { BookOpen, Video, Calendar, MessageCircle, TrendingUp, LogOut, Menu, X, Sparkles } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [upcomingClasses, setUpcomingClasses] = useState([]);
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
        
        setUser(response.data);
        await loadDashboardData(token);
      } catch (error) {
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [navigate]);
  
  const loadDashboardData = async (token) => {
    try {
      const [enrollmentsRes, upcomingRes] = await Promise.all([
        axios.get(`${API}/enrollments/student`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API}/live-classes/upcoming`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      
      setEnrollments(enrollmentsRes.data);
      setUpcomingClasses(upcomingRes.data);
      
      // Load course details
      const courseIds = [...new Set(enrollmentsRes.data.map(e => e.course_id))];
      const coursePromises = courseIds.map(id => 
        axios.get(`${API}/courses/${id}`)
      );
      const courseResults = await Promise.all(coursePromises);
      setCourses(courseResults.map(r => r.data));
    } catch (error) {
      toast.error('Failed to load dashboard data');
    }
  };
  
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API}/auth/logout`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      // Ignore errors
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
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
          <Link to="/student/dashboard">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-50 text-blue-600 font-medium" data-testid="sidebar-dashboard-btn">
              <BookOpen className="w-5 h-5" />
              <span>Dashboard</span>
            </button>
          </Link>
          <Link to="/courses">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-100 text-slate-700" data-testid="sidebar-courses-btn">
              <Video className="w-5 h-5" />
              <span>Browse Courses</span>
            </button>
          </Link>
          <Link to="/doubts">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-100 text-slate-700" data-testid="sidebar-doubts-btn">
              <MessageCircle className="w-5 h-5" />
              <span>Doubts</span>
            </button>
          </Link>
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
        {/* Header */}
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200 h-16 flex items-center px-6">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden mr-4">
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold heading-font" data-testid="dashboard-title">Welcome back, {user?.name}!</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full gradient-brand flex items-center justify-center text-white font-medium">
              {user?.name?.charAt(0)}
            </div>
          </div>
        </header>
        
        {/* Dashboard Content */}
        <main className="p-6 space-y-6">
          {/* Quick Stats */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Enrolled Courses</p>
                  <p className="text-3xl font-bold heading-font" data-testid="stat-enrolled-courses">{courses.length}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                  <BookOpen className="w-6 h-6" />
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Upcoming Classes</p>
                  <p className="text-3xl font-bold heading-font" data-testid="stat-upcoming-classes">{upcomingClasses.length}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-violet-100 flex items-center justify-center text-violet-600">
                  <Calendar className="w-6 h-6" />
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Progress</p>
                  <p className="text-3xl font-bold heading-font">75%</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>
            </Card>
          </div>
          
          {/* My Courses */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold heading-font">My Courses</h2>
              <Link to="/courses">
                <Button variant="outline" data-testid="browse-more-courses-btn">Browse More</Button>
              </Link>
            </div>
            
            {courses.length === 0 ? (
              <Card className="p-12 text-center">
                <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-slate-600 mb-2">No courses yet</h3>
                <p className="text-slate-500 mb-6">Start your learning journey by enrolling in a course</p>
                <Link to="/courses">
                  <Button className="bg-blue-600 hover:bg-blue-700" data-testid="enroll-first-course-btn">Explore Courses</Button>
                </Link>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <Card key={course.course_id} className="hover-lift overflow-hidden" data-testid={`course-card-${course.course_id}`}>
                    <div className={`h-32 ${course.stream === 'commerce' ? 'gradient-commerce' : course.stream === 'arts' || course.stream === 'humanities' ? 'gradient-arts' : 'gradient-brand'}`}></div>
                    <div className="p-6">
                      <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                        Class {course.class_level} • {course.stream}
                      </div>
                      <h3 className="text-xl font-semibold heading-font mb-2">{course.title}</h3>
                      <p className="text-sm text-slate-600 mb-4">{course.subject}</p>
                      <Button className="w-full bg-blue-600 hover:bg-blue-700" data-testid={`view-course-btn-${course.course_id}`}>
                        View Course
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
          
          {/* Upcoming Live Classes */}
          {upcomingClasses.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold heading-font mb-4">Upcoming Live Classes</h2>
              <div className="space-y-4">
                {upcomingClasses.slice(0, 3).map((cls) => (
                  <Card key={cls.class_id} className="p-6 flex items-center justify-between" data-testid={`live-class-${cls.class_id}`}>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-violet-100 flex items-center justify-center text-violet-600">
                        <Video className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{cls.title}</h3>
                        <p className="text-sm text-slate-600">
                          {new Date(cls.scheduled_at).toLocaleString('en-IN', {
                            dateStyle: 'medium',
                            timeStyle: 'short'
                          })} • {cls.duration} mins
                        </p>
                      </div>
                    </div>
                    <Button 
                      onClick={() => window.open(cls.meeting_link, '_blank')}
                      className="bg-violet-600 hover:bg-violet-700"
                      data-testid={`join-class-btn-${cls.class_id}`}
                    >
                      Join Class
                    </Button>
                  </Card>
                ))}
              </div>
            </div>
          )}
          
          {/* AI Doubt Assistant CTA */}
          <Card className="p-8 gradient-brand text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-6 h-6" />
                <h3 className="text-2xl font-bold heading-font">AI Doubt Assistant</h3>
              </div>
              <p className="text-blue-100 mb-6">Get instant answers to your doubts powered by GPT-5.2</p>
              <Link to="/doubts">
                <Button className="bg-white text-blue-600 hover:bg-slate-100" data-testid="ask-doubt-cta-btn">
                  Ask a Doubt Now
                </Button>
              </Link>
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;
