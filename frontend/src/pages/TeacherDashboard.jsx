import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import axios from 'axios';
import { Upload, Video, Calendar, Users, BookOpen, LogOut, Menu, X, Plus, Trash2 } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    stream: 'general',
    class_level: '9',
    subject: '',
    price: ''
  });
  
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
  
  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API}/courses`,
        {
          ...courseForm,
          price: parseFloat(courseForm.price) || 0,
          teacher_id: user.user_id
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('Course created successfully!');
      setCourseForm({
        title: '',
        description: '',
        stream: 'general',
        class_level: '9',
        subject: '',
        price: ''
      });
      setShowAddCourse(false);
      await loadCourses(token, user.user_id);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create course');
    }
  };
  
  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course? This will also delete all lectures, assignments, and tests associated with it.')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Course deleted successfully!');
      await loadCourses(token, user.user_id);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to delete course');
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
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold heading-font">My Courses</h2>
              <Button 
                onClick={() => setShowAddCourse(!showAddCourse)} 
                className="bg-blue-600 hover:bg-blue-700"
                data-testid="add-course-btn"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Course
              </Button>
            </div>
            
            {/* Add Course Form */}
            {showAddCourse && (
              <Card className="p-6 mb-6" data-testid="add-course-form">
                <h3 className="text-xl font-semibold mb-4">Create New Course</h3>
                <form onSubmit={handleCreateCourse} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="course-title">Course Title *</Label>
                      <Input
                        id="course-title"
                        value={courseForm.title}
                        onChange={(e) => setCourseForm({...courseForm, title: e.target.value})}
                        placeholder="e.g., Mathematics Class 10"
                        required
                        data-testid="course-title-input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="course-subject">Subject *</Label>
                      <Input
                        id="course-subject"
                        value={courseForm.subject}
                        onChange={(e) => setCourseForm({...courseForm, subject: e.target.value})}
                        placeholder="e.g., Mathematics"
                        required
                        data-testid="course-subject-input"
                      />
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="course-stream">Stream *</Label>
                      <select
                        id="course-stream"
                        value={courseForm.stream}
                        onChange={(e) => setCourseForm({...courseForm, stream: e.target.value})}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                        data-testid="course-stream-select"
                      >
                        <option value="general">General (Class 9-10)</option>
                        <option value="commerce">Commerce</option>
                        <option value="humanities">Humanities</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="course-class">Class Level *</Label>
                      <select
                        id="course-class"
                        value={courseForm.class_level}
                        onChange={(e) => setCourseForm({...courseForm, class_level: e.target.value})}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                        data-testid="course-class-select"
                      >
                        <option value="9">Class 9</option>
                        <option value="10">Class 10</option>
                        <option value="11">Class 11</option>
                        <option value="12">Class 12</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="course-price">Price (₹/month) *</Label>
                      <Input
                        id="course-price"
                        type="number"
                        value={courseForm.price}
                        onChange={(e) => setCourseForm({...courseForm, price: e.target.value})}
                        placeholder="6999"
                        required
                        data-testid="course-price-input"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="course-desc">Description *</Label>
                    <Textarea
                      id="course-desc"
                      value={courseForm.description}
                      onChange={(e) => setCourseForm({...courseForm, description: e.target.value})}
                      placeholder="Describe what students will learn in this course..."
                      rows={3}
                      required
                      data-testid="course-desc-input"
                    />
                  </div>
                  
                  <div className="flex gap-3">
                    <Button type="submit" className="bg-green-600 hover:bg-green-700" data-testid="submit-course-btn">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Course
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowAddCourse(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </Card>
            )}
            
            {courses.length === 0 ? (
              <Card className="p-12 text-center">
                <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-slate-600 mb-2">No courses created yet</h3>
                <p className="text-slate-500 mb-6">Click "Add New Course" to create your first course</p>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <Card key={course.course_id} className="hover-lift" data-testid={`course-card-${course.course_id}`}>
                    <div className="p-6">
                      <h3 className="text-xl font-semibold heading-font mb-2">{course.title}</h3>
                      <p className="text-sm text-slate-600 mb-2">{course.subject} • Class {course.class_level}</p>
                      <p className="text-sm text-slate-500 mb-4 line-clamp-2">{course.description}</p>
                      <div className="flex gap-2">
                        <Link to={`/teacher/course/${course.course_id}`} className="flex-1">
                          <Button className="w-full bg-blue-600 hover:bg-blue-700" data-testid={`manage-course-btn-${course.course_id}`}>
                            Manage Course
                          </Button>
                        </Link>
                        <Button 
                          variant="outline" 
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteCourse(course.course_id)}
                          data-testid={`delete-course-btn-${course.course_id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
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
