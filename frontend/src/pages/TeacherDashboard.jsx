import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import axios from 'axios';
import { 
  Video, Calendar, Users, BookOpen, LogOut, Menu, X, Plus, Trash2, 
  Edit, Eye, EyeOff, Clock, Check, XCircle, Settings, CalendarDays,
  ChevronRight, GraduationCap
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('courses');
  
  // Course form states
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    stream: 'general',
    class_level: '9',
    subject: '',
    price: '',
    thumbnail: ''
  });
  
  // Availability form states
  const [showAddAvailability, setShowAddAvailability] = useState(false);
  const [availabilityForm, setAvailabilityForm] = useState({
    day_of_week: 0,
    start_time: '09:00',
    end_time: '17:00',
    slot_duration: 30
  });

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    checkAuth();
  }, []);

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
      await loadAllData(token, response.data.user_id);
    } catch (error) {
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const loadAllData = async (token, userId) => {
    try {
      const [coursesRes, bookingsRes, availabilityRes] = await Promise.all([
        axios.get(`${API}/courses/teacher/${userId}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/bookings/my`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/teacher/availability`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      setCourses(coursesRes.data);
      setBookings(bookingsRes.data);
      setAvailability(availabilityRes.data);
      
      // Get all upcoming live classes across all courses
      const allClasses = [];
      for (const course of coursesRes.data) {
        const classesRes = await axios.get(`${API}/live-classes/course/${course.course_id}`);
        allClasses.push(...classesRes.data.map(c => ({ ...c, course_title: course.title })));
      }
      setUpcomingClasses(allClasses.filter(c => new Date(c.scheduled_at) > new Date()).sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at)));
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Course Management Functions
  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      if (editingCourse) {
        await axios.put(
          `${API}/courses/${editingCourse}`,
          {
            ...courseForm,
            price: parseFloat(courseForm.price) || 0
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Course updated successfully!');
        setEditingCourse(null);
      } else {
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
      }
      
      resetCourseForm();
      await loadAllData(token, user.user_id);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save course');
    }
  };

  const handleEditCourse = (course) => {
    setEditingCourse(course.course_id);
    setCourseForm({
      title: course.title,
      description: course.description,
      stream: course.stream,
      class_level: course.class_level,
      subject: course.subject,
      price: course.price.toString(),
      thumbnail: course.thumbnail || ''
    });
    setShowAddCourse(true);
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course? All content will be permanently removed.')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Course deleted successfully!');
      await loadAllData(token, user.user_id);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to delete course');
    }
  };

  const handleTogglePublish = async (courseId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${API}/courses/${courseId}/publish`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Course ${currentStatus ? 'unpublished' : 'published'} successfully!`);
      await loadAllData(token, user.user_id);
    } catch (error) {
      toast.error('Failed to update course status');
    }
  };

  const resetCourseForm = () => {
    setCourseForm({
      title: '',
      description: '',
      stream: 'general',
      class_level: '9',
      subject: '',
      price: '',
      thumbnail: ''
    });
    setShowAddCourse(false);
    setEditingCourse(null);
  };

  // Availability Management Functions
  const handleAddAvailability = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API}/teacher/availability`,
        availabilityForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Availability slot added!');
      setShowAddAvailability(false);
      setAvailabilityForm({ day_of_week: 0, start_time: '09:00', end_time: '17:00', slot_duration: 30 });
      await loadAllData(token, user.user_id);
    } catch (error) {
      toast.error('Failed to add availability');
    }
  };

  const handleDeleteAvailability = async (availabilityId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/teacher/availability/${availabilityId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Availability removed!');
      await loadAllData(token, user.user_id);
    } catch (error) {
      toast.error('Failed to remove availability');
    }
  };

  // Booking Management Functions
  const handleApproveBooking = async (slotId) => {
    const meetingLink = prompt('Enter meeting link (Zoom/Google Meet):');
    if (!meetingLink) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${API}/bookings/${slotId}/approve?meeting_link=${encodeURIComponent(meetingLink)}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Booking approved!');
      await loadAllData(token, user.user_id);
    } catch (error) {
      toast.error('Failed to approve booking');
    }
  };

  const handleRejectBooking = async (slotId) => {
    if (!window.confirm('Are you sure you want to reject this booking?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${API}/bookings/${slotId}/reject`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Booking rejected');
      await loadAllData(token, user.user_id);
    } catch (error) {
      toast.error('Failed to reject booking');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const upcomingBookings = bookings.filter(b => b.status === 'approved' && new Date(b.date) >= new Date());

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 transform transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <img 
              src="https://customer-assets.emergentagent.com/job_board-ready-3/artifacts/9esikr1w_ChatGPT%20Image%20Mar%209%2C%202026%2C%2001_45_09%20PM.png" 
              alt="NextGen Learning" 
              className="h-8 rounded"
              style={{ mixBlendMode: 'screen' }}
            />
            <span className="font-bold text-white text-lg">NextGen</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-slate-400">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('courses')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'courses' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            data-testid="nav-courses"
          >
            <BookOpen className="w-5 h-5" />
            <span>My Courses</span>
          </button>
          <button 
            onClick={() => setActiveTab('classes')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'classes' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            data-testid="nav-classes"
          >
            <Video className="w-5 h-5" />
            <span>Live Classes</span>
          </button>
          <button 
            onClick={() => setActiveTab('bookings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'bookings' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            data-testid="nav-bookings"
          >
            <CalendarDays className="w-5 h-5" />
            <span>1:1 Bookings</span>
            {pendingBookings.length > 0 && (
              <Badge className="ml-auto bg-red-500 text-white">{pendingBookings.length}</Badge>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('availability')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'availability' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            data-testid="nav-availability"
          >
            <Settings className="w-5 h-5" />
            <span>Availability</span>
          </button>
        </nav>
        
        <div className="absolute bottom-0 w-full p-4 border-t border-slate-800">
          <div className="mb-4 px-4">
            <p className="text-sm text-slate-400">Logged in as</p>
            <p className="text-white font-medium truncate">{user?.name}</p>
          </div>
          <Button onClick={handleLogout} variant="ghost" className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800" data-testid="logout-btn">
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </Button>
        </div>
      </aside>
      
      {/* Main Content */}
      <div className="md:pl-64">
        <header className="sticky top-0 z-20 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 h-16 flex items-center px-6">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden mr-4 text-slate-400">
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold text-white" data-testid="dashboard-title">Teacher Dashboard</h1>
        </header>
        
        <main className="p-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="p-4 bg-slate-900 border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">My Courses</p>
                  <p className="text-2xl font-bold text-white">{courses.length}</p>
                </div>
                <BookOpen className="w-8 h-8 text-blue-500" />
              </div>
            </Card>
            <Card className="p-4 bg-slate-900 border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Upcoming Classes</p>
                  <p className="text-2xl font-bold text-white">{upcomingClasses.length}</p>
                </div>
                <Video className="w-8 h-8 text-violet-500" />
              </div>
            </Card>
            <Card className="p-4 bg-slate-900 border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Pending Bookings</p>
                  <p className="text-2xl font-bold text-white">{pendingBookings.length}</p>
                </div>
                <Clock className="w-8 h-8 text-amber-500" />
              </div>
            </Card>
            <Card className="p-4 bg-slate-900 border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Availability Slots</p>
                  <p className="text-2xl font-bold text-white">{availability.length}</p>
                </div>
                <Calendar className="w-8 h-8 text-green-500" />
              </div>
            </Card>
          </div>

          {/* My Courses Tab */}
          {activeTab === 'courses' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">My Courses</h2>
                <Button 
                  onClick={() => { resetCourseForm(); setShowAddCourse(true); }}
                  className="bg-blue-600 hover:bg-blue-700"
                  data-testid="add-course-btn"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Course
                </Button>
              </div>

              {/* Course Form */}
              {showAddCourse && (
                <Card className="p-6 bg-slate-900 border-slate-800" data-testid="course-form">
                  <h3 className="text-xl font-semibold text-white mb-4">
                    {editingCourse ? 'Edit Course' : 'Create New Course'}
                  </h3>
                  <form onSubmit={handleCreateCourse} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-slate-300">Course Title *</Label>
                        <Input
                          value={courseForm.title}
                          onChange={(e) => setCourseForm({...courseForm, title: e.target.value})}
                          placeholder="e.g., Mathematics Class 10"
                          required
                          className="bg-slate-800 border-slate-700 text-white"
                          data-testid="course-title-input"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-300">Subject *</Label>
                        <Input
                          value={courseForm.subject}
                          onChange={(e) => setCourseForm({...courseForm, subject: e.target.value})}
                          placeholder="e.g., Mathematics"
                          required
                          className="bg-slate-800 border-slate-700 text-white"
                          data-testid="course-subject-input"
                        />
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-slate-300">Stream *</Label>
                        <select
                          value={courseForm.stream}
                          onChange={(e) => setCourseForm({...courseForm, stream: e.target.value})}
                          className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                          data-testid="course-stream-select"
                        >
                          <option value="general">General (Class 9-10)</option>
                          <option value="commerce">Commerce</option>
                          <option value="humanities">Humanities</option>
                        </select>
                      </div>
                      <div>
                        <Label className="text-slate-300">Class Level *</Label>
                        <select
                          value={courseForm.class_level}
                          onChange={(e) => setCourseForm({...courseForm, class_level: e.target.value})}
                          className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                          data-testid="course-class-select"
                        >
                          <option value="9">Class 9</option>
                          <option value="10">Class 10</option>
                          <option value="11">Class 11</option>
                          <option value="12">Class 12</option>
                        </select>
                      </div>
                      <div>
                        <Label className="text-slate-300">Price (₹/month) *</Label>
                        <Input
                          type="number"
                          value={courseForm.price}
                          onChange={(e) => setCourseForm({...courseForm, price: e.target.value})}
                          placeholder="6999"
                          required
                          className="bg-slate-800 border-slate-700 text-white"
                          data-testid="course-price-input"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-slate-300">Thumbnail URL (optional)</Label>
                      <Input
                        value={courseForm.thumbnail}
                        onChange={(e) => setCourseForm({...courseForm, thumbnail: e.target.value})}
                        placeholder="https://example.com/image.jpg"
                        className="bg-slate-800 border-slate-700 text-white"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-slate-300">Description *</Label>
                      <Textarea
                        value={courseForm.description}
                        onChange={(e) => setCourseForm({...courseForm, description: e.target.value})}
                        placeholder="Describe what students will learn..."
                        rows={3}
                        required
                        className="bg-slate-800 border-slate-700 text-white"
                        data-testid="course-desc-input"
                      />
                    </div>
                    
                    <div className="flex gap-3">
                      <Button type="submit" className="bg-green-600 hover:bg-green-700" data-testid="submit-course-btn">
                        {editingCourse ? 'Update Course' : 'Create Course'}
                      </Button>
                      <Button type="button" variant="outline" onClick={resetCourseForm} className="border-slate-700 text-slate-300 hover:bg-slate-800">
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Card>
              )}

              {/* Courses Grid */}
              {courses.length === 0 ? (
                <Card className="p-12 text-center bg-slate-900 border-slate-800">
                  <BookOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-slate-400 mb-2">No courses yet</h3>
                  <p className="text-slate-500 mb-4">Create your first course to start teaching</p>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses.map((course) => (
                    <Card key={course.course_id} className="bg-slate-900 border-slate-800 overflow-hidden" data-testid={`course-card-${course.course_id}`}>
                      {course.thumbnail && (
                        <img src={course.thumbnail} alt={course.title} className="w-full h-32 object-cover" />
                      )}
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-semibold text-white">{course.title}</h3>
                          <Badge className={course.published !== false ? 'bg-green-600' : 'bg-slate-600'}>
                            {course.published !== false ? 'Published' : 'Draft'}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-400 mb-2">{course.subject} • Class {course.class_level}</p>
                        <p className="text-sm text-slate-500 mb-4 line-clamp-2">{course.description}</p>
                        <p className="text-lg font-bold text-blue-400 mb-4">₹{course.price}/month</p>
                        
                        <div className="flex gap-2 flex-wrap">
                          <Link to={`/teacher/course/${course.course_id}`} className="flex-1">
                            <Button className="w-full bg-blue-600 hover:bg-blue-700" size="sm" data-testid={`manage-btn-${course.course_id}`}>
                              <Settings className="w-4 h-4 mr-1" />
                              Manage
                            </Button>
                          </Link>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditCourse(course)}
                            className="border-slate-700 text-slate-300 hover:bg-slate-800"
                            data-testid={`edit-btn-${course.course_id}`}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleTogglePublish(course.course_id, course.published !== false)}
                            className="border-slate-700 text-slate-300 hover:bg-slate-800"
                            data-testid={`publish-btn-${course.course_id}`}
                          >
                            {course.published !== false ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteCourse(course.course_id)}
                            className="border-red-800 text-red-400 hover:bg-red-900/50"
                            data-testid={`delete-btn-${course.course_id}`}
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
          )}

          {/* Live Classes Tab */}
          {activeTab === 'classes' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Upcoming Live Classes</h2>
              
              {upcomingClasses.length === 0 ? (
                <Card className="p-12 text-center bg-slate-900 border-slate-800">
                  <Video className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-slate-400 mb-2">No upcoming classes</h3>
                  <p className="text-slate-500">Schedule live classes from your course management page</p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {upcomingClasses.map((cls) => (
                    <Card key={cls.class_id} className="p-4 bg-slate-900 border-slate-800">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-white">{cls.title}</h3>
                          <p className="text-sm text-slate-400">{cls.course_title}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm">
                            <span className="text-blue-400">{new Date(cls.scheduled_at).toLocaleString()}</span>
                            <Badge variant="secondary">{cls.platform}</Badge>
                            <span className="text-slate-500">{cls.duration} mins</span>
                          </div>
                        </div>
                        <a href={cls.meeting_link} target="_blank" rel="noopener noreferrer">
                          <Button className="bg-green-600 hover:bg-green-700">
                            Start Class
                          </Button>
                        </a>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Bookings Tab */}
          {activeTab === 'bookings' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">1:1 Session Bookings</h2>
              
              {/* Pending Bookings */}
              <div>
                <h3 className="text-lg font-semibold text-slate-300 mb-4">Pending Requests ({pendingBookings.length})</h3>
                {pendingBookings.length === 0 ? (
                  <Card className="p-6 text-center bg-slate-900 border-slate-800">
                    <p className="text-slate-500">No pending booking requests</p>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {pendingBookings.map((booking) => (
                      <Card key={booking.slot_id} className="p-4 bg-slate-900 border-slate-800">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-white">{booking.student_name}</h4>
                            <p className="text-sm text-slate-400">{booking.student_email}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm">
                              <span className="text-blue-400">{booking.date}</span>
                              <span className="text-slate-400">{booking.start_time} - {booking.end_time}</span>
                              {booking.subject && <Badge variant="secondary">{booking.subject}</Badge>}
                            </div>
                            {booking.notes && <p className="text-sm text-slate-500 mt-2">"{booking.notes}"</p>}
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              onClick={() => handleApproveBooking(booking.slot_id)}
                              className="bg-green-600 hover:bg-green-700"
                              size="sm"
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button 
                              onClick={() => handleRejectBooking(booking.slot_id)}
                              variant="outline"
                              className="border-red-800 text-red-400 hover:bg-red-900/50"
                              size="sm"
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Upcoming Approved Bookings */}
              <div>
                <h3 className="text-lg font-semibold text-slate-300 mb-4">Upcoming Sessions ({upcomingBookings.length})</h3>
                {upcomingBookings.length === 0 ? (
                  <Card className="p-6 text-center bg-slate-900 border-slate-800">
                    <p className="text-slate-500">No upcoming sessions</p>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {upcomingBookings.map((booking) => (
                      <Card key={booking.slot_id} className="p-4 bg-slate-900 border-slate-800">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-white">{booking.student_name}</h4>
                            <div className="flex items-center gap-4 mt-1 text-sm">
                              <span className="text-blue-400">{booking.date}</span>
                              <span className="text-slate-400">{booking.start_time} - {booking.end_time}</span>
                              <Badge className="bg-green-600">Approved</Badge>
                            </div>
                          </div>
                          {booking.meeting_link && (
                            <a href={booking.meeting_link} target="_blank" rel="noopener noreferrer">
                              <Button className="bg-blue-600 hover:bg-blue-700" size="sm">
                                Join Meeting
                              </Button>
                            </a>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Availability Tab */}
          {activeTab === 'availability' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">My Availability</h2>
                <Button 
                  onClick={() => setShowAddAvailability(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Slot
                </Button>
              </div>

              {/* Add Availability Form */}
              {showAddAvailability && (
                <Card className="p-6 bg-slate-900 border-slate-800">
                  <h3 className="text-xl font-semibold text-white mb-4">Add Availability Slot</h3>
                  <form onSubmit={handleAddAvailability} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-slate-300">Day of Week</Label>
                        <select
                          value={availabilityForm.day_of_week}
                          onChange={(e) => setAvailabilityForm({...availabilityForm, day_of_week: parseInt(e.target.value)})}
                          className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                        >
                          {daysOfWeek.map((day, idx) => (
                            <option key={idx} value={idx}>{day}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label className="text-slate-300">Slot Duration (mins)</Label>
                        <select
                          value={availabilityForm.slot_duration}
                          onChange={(e) => setAvailabilityForm({...availabilityForm, slot_duration: parseInt(e.target.value)})}
                          className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                        >
                          <option value={15}>15 minutes</option>
                          <option value={30}>30 minutes</option>
                          <option value={45}>45 minutes</option>
                          <option value={60}>60 minutes</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-slate-300">Start Time</Label>
                        <Input
                          type="time"
                          value={availabilityForm.start_time}
                          onChange={(e) => setAvailabilityForm({...availabilityForm, start_time: e.target.value})}
                          className="bg-slate-800 border-slate-700 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-300">End Time</Label>
                        <Input
                          type="time"
                          value={availabilityForm.end_time}
                          onChange={(e) => setAvailabilityForm({...availabilityForm, end_time: e.target.value})}
                          className="bg-slate-800 border-slate-700 text-white"
                        />
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button type="submit" className="bg-green-600 hover:bg-green-700">
                        Save Availability
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setShowAddAvailability(false)} className="border-slate-700 text-slate-300 hover:bg-slate-800">
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Card>
              )}

              {/* Availability List */}
              {availability.length === 0 ? (
                <Card className="p-12 text-center bg-slate-900 border-slate-800">
                  <Calendar className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-slate-400 mb-2">No availability set</h3>
                  <p className="text-slate-500">Add your available time slots for 1:1 sessions</p>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availability.map((slot) => (
                    <Card key={slot.availability_id} className="p-4 bg-slate-900 border-slate-800">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-white">{daysOfWeek[slot.day_of_week]}</h3>
                          <p className="text-sm text-blue-400 mt-1">{slot.start_time} - {slot.end_time}</p>
                          <p className="text-xs text-slate-500 mt-1">{slot.slot_duration} min slots</p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteAvailability(slot.availability_id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-900/30"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default TeacherDashboard;
