import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import axios from 'axios';
import { 
  Video, Calendar, Users, BookOpen, LogOut, Menu, X, Plus, Trash2, 
  Edit, Eye, EyeOff, Clock, Settings, CalendarDays, ExternalLink, 
  GraduationCap, UserCheck, Mail, Phone, Lock, User
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [teacherStats, setTeacherStats] = useState({ courses: [], total_students: 0, total_courses: 0 });
  const [sessions, setSessions] = useState([]);
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('students');
  
  // Profile form states
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  
  // Course form states
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    stream: 'general',
    class_level: '6-8',
    subject: '',
    price: '',
    thumbnail: ''
  });
  
  // Subject options based on class level
  const getSubjectOptions = (classLevel) => {
    if (classLevel === '6-8' || classLevel === '9-10') {
      return [
        'All Subjects (Mathematics, Science, English, Social Science, Hindi, Computer Science)'
      ];
    }
    // For class 11 and 12, subjects depend on stream
    return [];
  };
  
  const getStreamSubjectOptions = (stream) => {
    if (stream === 'commerce') {
      return ['All Commerce Subjects (Economics, Business Studies, Accountancy, Mathematics, English)'];
    }
    if (stream === 'humanities') {
      return ['All Humanities Subjects (History, Geography, Political Science, Sociology, Psychology, English)'];
    }
    return [];
  };
  
  const isJuniorClass = (classLevel) => classLevel === '6-8' || classLevel === '9-10';
  
  // Live Class form states
  const [showAddLiveClass, setShowAddLiveClass] = useState(false);
  const [liveClassForm, setLiveClassForm] = useState({
    title: '',
    course_id: '',
    date: '',
    start_time: '10:00',
    duration: 60,
    platform: 'zoom',
    meeting_link: '',
    description: ''
  });

  // 1:1 Session form states
  const [showAddSession, setShowAddSession] = useState(false);
  const [sessionForm, setSessionForm] = useState({
    date: '',
    start_time: '10:00',
    end_time: '11:00',
    subject: '',
    notes: '',
    student_name: '',
    student_email: '',
    platform: 'zoom',
    meeting_link: ''
  });

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
      // Initialize profile form with user data
      setProfileForm({
        name: response.data.name || '',
        email: response.data.email || '',
        phone: response.data.phone || '',
        bio: response.data.bio || '',
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
      await loadAllData(token, response.data.user_id);
    } catch (error) {
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const loadAllData = async (token, userId) => {
    try {
      const [statsRes, sessionsRes] = await Promise.all([
        axios.get(`${API}/teacher/stats`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/bookings/my`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      setTeacherStats(statsRes.data);
      setSessions(sessionsRes.data);
      
      // Get all upcoming live classes across all courses
      const allClasses = [];
      for (const course of statsRes.data.courses) {
        try {
          const classesRes = await axios.get(`${API}/live-classes/course/${course.course_id}`);
          allClasses.push(...classesRes.data.map(c => ({ ...c, course_title: course.title, course_id: course.course_id })));
        } catch (e) {
          // Course might not have classes
        }
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
      class_level: '6-8',
      subject: '',
      price: '',
      thumbnail: ''
    });
    setShowAddCourse(false);
    setEditingCourse(null);
  };

  // Live Class Functions
  const handleCreateLiveClass = async (e) => {
    e.preventDefault();
    if (!liveClassForm.course_id) {
      toast.error('Please select a course');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      
      const scheduledAt = `${liveClassForm.date}T${liveClassForm.start_time}:00`;
      
      await axios.post(
        `${API}/live-classes`,
        {
          course_id: liveClassForm.course_id,
          title: liveClassForm.title,
          scheduled_at: scheduledAt,
          duration: parseInt(liveClassForm.duration),
          platform: liveClassForm.platform,
          meeting_link: liveClassForm.meeting_link,
          description: liveClassForm.description
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('Live class scheduled successfully!');
      setShowAddLiveClass(false);
      setLiveClassForm({
        title: '',
        course_id: '',
        date: '',
        start_time: '10:00',
        duration: 60,
        platform: 'zoom',
        meeting_link: '',
        description: ''
      });
      await loadAllData(token, user.user_id);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to schedule live class');
    }
  };

  const handleDeleteLiveClass = async (classId) => {
    if (!window.confirm('Delete this live class?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/live-classes/${classId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Live class deleted');
      await loadAllData(token, user.user_id);
    } catch (error) {
      toast.error('Failed to delete live class');
    }
  };

  // 1:1 Session Functions
  const handleCreateSession = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      await axios.post(
        `${API}/bookings`,
        {
          date: sessionForm.date,
          start_time: sessionForm.start_time,
          end_time: sessionForm.end_time,
          subject: sessionForm.subject,
          notes: sessionForm.notes,
          student_name: sessionForm.student_name,
          student_email: sessionForm.student_email,
          platform: sessionForm.platform,
          meeting_link: sessionForm.meeting_link
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('1:1 Session scheduled successfully!');
      setShowAddSession(false);
      setSessionForm({
        date: '',
        start_time: '10:00',
        end_time: '11:00',
        subject: '',
        notes: '',
        student_name: '',
        student_email: '',
        platform: 'zoom',
        meeting_link: ''
      });
      await loadAllData(token, user.user_id);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to schedule session');
    }
  };

  const handleDeleteSession = async (slotId) => {
    if (!window.confirm('Delete this session?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API}/bookings/${slotId}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Session cancelled');
      await loadAllData(token, user.user_id);
    } catch (error) {
      toast.error('Failed to cancel session');
    }
  };

  // Profile Update Function
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    if (profileForm.new_password && profileForm.new_password !== profileForm.confirm_password) {
      toast.error('New passwords do not match');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const updateData = {
        name: profileForm.name,
        email: profileForm.email,
        phone: profileForm.phone,
        bio: profileForm.bio
      };
      
      if (profileForm.new_password) {
        updateData.current_password = profileForm.current_password;
        updateData.new_password = profileForm.new_password;
      }
      
      const response = await axios.put(
        `${API}/auth/profile`,
        updateData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setUser(response.data.user);
      setProfileForm({
        ...profileForm,
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update profile');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const upcomingSessions = sessions.filter(s => s.status === 'scheduled' && new Date(s.date) >= new Date());
  const { courses, total_students, total_courses } = teacherStats;

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
        
        {/* Teacher Profile */}
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-violet-600 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
              {user?.name?.charAt(0)}
            </div>
            <div>
              <p className="text-white font-semibold">{user?.name}</p>
              <p className="text-xs text-slate-400">Teacher</p>
            </div>
          </div>
          {user?.bio && (
            <p className="text-xs text-slate-500 mt-2">{user.bio}</p>
          )}
        </div>
        
        <nav className="p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('students')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'students' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            data-testid="nav-students"
          >
            <Users className="w-5 h-5" />
            <span>Enrolled Students</span>
            {total_students > 0 && (
              <Badge className="ml-auto bg-green-600 text-white">{total_students}</Badge>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('courses')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'courses' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            data-testid="nav-courses"
          >
            <BookOpen className="w-5 h-5" />
            <span>Manage Courses</span>
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
            onClick={() => setActiveTab('sessions')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'sessions' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            data-testid="nav-sessions"
          >
            <CalendarDays className="w-5 h-5" />
            <span>1:1 Sessions</span>
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'settings' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            data-testid="nav-settings"
          >
            <Settings className="w-5 h-5" />
            <span>Profile Settings</span>
          </button>
        </nav>
        
        <div className="absolute bottom-0 w-full p-4 border-t border-slate-800">
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
                  <p className="text-sm text-slate-400">Total Students</p>
                  <p className="text-2xl font-bold text-white">{total_students}</p>
                </div>
                <UserCheck className="w-8 h-8 text-green-500" />
              </div>
            </Card>
            <Card className="p-4 bg-slate-900 border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">My Courses</p>
                  <p className="text-2xl font-bold text-white">{total_courses}</p>
                </div>
                <BookOpen className="w-8 h-8 text-blue-500" />
              </div>
            </Card>
            <Card className="p-4 bg-slate-900 border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Live Classes</p>
                  <p className="text-2xl font-bold text-white">{upcomingClasses.length}</p>
                </div>
                <Video className="w-8 h-8 text-violet-500" />
              </div>
            </Card>
            <Card className="p-4 bg-slate-900 border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">1:1 Sessions</p>
                  <p className="text-2xl font-bold text-white">{upcomingSessions.length}</p>
                </div>
                <CalendarDays className="w-8 h-8 text-amber-500" />
              </div>
            </Card>
          </div>

          {/* Enrolled Students Tab */}
          {activeTab === 'students' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Enrolled Students</h2>
              
              {courses.length === 0 ? (
                <Card className="p-12 text-center bg-slate-900 border-slate-800">
                  <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-slate-400 mb-2">No students yet</h3>
                  <p className="text-slate-500">Create courses and start getting enrollments</p>
                </Card>
              ) : (
                <div className="space-y-6">
                  {courses.map((course) => (
                    <Card key={course.course_id} className="bg-slate-900 border-slate-800 overflow-hidden">
                      <div className="p-4 bg-gradient-to-r from-blue-900/50 to-violet-900/50 border-b border-slate-800">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-bold text-white">{course.title}</h3>
                            <p className="text-sm text-slate-400">{course.subject} • Class {course.class_level}</p>
                          </div>
                          <Badge className="bg-green-600 text-lg px-3 py-1">
                            {course.enrolled_count} Student{course.enrolled_count !== 1 ? 's' : ''}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="p-4">
                        {course.students && course.students.length > 0 ? (
                          <div className="space-y-3">
                            {course.students.map((student, idx) => (
                              <div key={idx} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-600 to-emerald-600 flex items-center justify-center text-white font-bold">
                                    {student.name?.charAt(0)}
                                  </div>
                                  <div>
                                    <p className="font-medium text-white">{student.name}</p>
                                    <p className="text-sm text-slate-400 flex items-center gap-1">
                                      <Mail className="w-3 h-3" />
                                      {student.email}
                                    </p>
                                  </div>
                                </div>
                                <Badge variant="secondary" className="bg-slate-700">
                                  Enrolled
                                </Badge>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-center text-slate-500 py-4">No students enrolled yet</p>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Manage Courses Tab */}
          {activeTab === 'courses' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Manage Courses</h2>
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
                          placeholder="e.g., Mathematics Class 9-10"
                          required
                          className="bg-slate-800 border-slate-700 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-300">Class Level *</Label>
                        <select
                          value={courseForm.class_level}
                          onChange={(e) => {
                            const newClassLevel = e.target.value;
                            const newStream = isJuniorClass(newClassLevel) ? 'general' : 'commerce';
                            setCourseForm({
                              ...courseForm, 
                              class_level: newClassLevel,
                              stream: newStream,
                              subject: '' // Reset subject when class level changes
                            });
                          }}
                          className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                        >
                          <option value="6-8">Class 6-8</option>
                          <option value="9-10">Class 9-10</option>
                          <option value="11">Class 11</option>
                          <option value="12">Class 12</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-4">
                      {/* Stream dropdown - only show for Class 11 and 12 */}
                      {!isJuniorClass(courseForm.class_level) && (
                        <div>
                          <Label className="text-slate-300">Stream *</Label>
                          <select
                            value={courseForm.stream}
                            onChange={(e) => setCourseForm({...courseForm, stream: e.target.value, subject: ''})}
                            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                          >
                            <option value="commerce">Commerce</option>
                            <option value="humanities">Humanities</option>
                          </select>
                        </div>
                      )}
                      
                      <div>
                        <Label className="text-slate-300">Subject *</Label>
                        <select
                          value={courseForm.subject}
                          onChange={(e) => setCourseForm({...courseForm, subject: e.target.value})}
                          required
                          className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                        >
                          <option value="">Select Subject</option>
                          {isJuniorClass(courseForm.class_level) 
                            ? getSubjectOptions(courseForm.class_level).map(subj => (
                                <option key={subj} value={subj}>{subj}</option>
                              ))
                            : getStreamSubjectOptions(courseForm.stream).map(subj => (
                                <option key={subj} value={subj}>{subj}</option>
                              ))
                          }
                        </select>
                      </div>
                      
                      <div>
                        <Label className="text-slate-300">Price (₹/month) *</Label>
                        <Input
                          type="number"
                          value={courseForm.price}
                          onChange={(e) => setCourseForm({...courseForm, price: e.target.value})}
                          placeholder="3999"
                          required
                          className="bg-slate-800 border-slate-700 text-white"
                        />
                      </div>
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
                      />
                    </div>
                    
                    <div className="flex gap-3">
                      <Button type="submit" className="bg-green-600 hover:bg-green-700">
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
                    <Card key={course.course_id} className="bg-slate-900 border-slate-800 overflow-hidden">
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-semibold text-white">{course.title}</h3>
                          <Badge className={course.published !== false ? 'bg-green-600' : 'bg-slate-600'}>
                            {course.published !== false ? 'Published' : 'Draft'}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-400 mb-2">{course.subject} • Class {course.class_level}</p>
                        <p className="text-lg font-bold text-blue-400 mb-2">₹{course.price}/month</p>
                        <p className="text-sm text-green-400 mb-4">{course.enrolled_count} students enrolled</p>
                        
                        <div className="flex gap-2 flex-wrap">
                          <Link to={`/teacher/course/${course.course_id}`} className="flex-1">
                            <Button className="w-full bg-blue-600 hover:bg-blue-700" size="sm">
                              <Settings className="w-4 h-4 mr-1" />
                              Manage
                            </Button>
                          </Link>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditCourse(course)}
                            className="border-slate-700 text-slate-300 hover:bg-slate-800"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleTogglePublish(course.course_id, course.published !== false)}
                            className="border-slate-700 text-slate-300 hover:bg-slate-800"
                          >
                            {course.published !== false ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteCourse(course.course_id)}
                            className="border-red-800 text-red-400 hover:bg-red-900/50"
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
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Live Classes</h2>
                <Button 
                  onClick={() => setShowAddLiveClass(true)}
                  className="bg-violet-600 hover:bg-violet-700"
                  data-testid="add-live-class-btn"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Schedule Live Class
                </Button>
              </div>

              {/* Add Live Class Form */}
              {showAddLiveClass && (
                <Card className="p-6 bg-slate-900 border-slate-800">
                  <h3 className="text-xl font-semibold text-white mb-4">Schedule Live Class</h3>
                  <form onSubmit={handleCreateLiveClass} className="space-y-4">
                    <div className="p-4 bg-blue-900/30 border border-blue-700 rounded-lg mb-4">
                      <Label className="text-blue-300 font-semibold">Select Course (Students of this course can attend) *</Label>
                      <select
                        value={liveClassForm.course_id}
                        onChange={(e) => setLiveClassForm({...liveClassForm, course_id: e.target.value})}
                        required
                        className="w-full mt-2 px-4 py-3 bg-slate-800 border border-blue-600 rounded-lg text-white text-lg"
                      >
                        <option value="">-- Select which course students to teach --</option>
                        {courses.map((course) => (
                          <option key={course.course_id} value={course.course_id}>
                            {course.title} ({course.enrolled_count} students enrolled)
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-blue-400 mt-2">Only students enrolled in the selected course will see and can join this class</p>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-slate-300">Class Title *</Label>
                        <Input
                          value={liveClassForm.title}
                          onChange={(e) => setLiveClassForm({...liveClassForm, title: e.target.value})}
                          placeholder="e.g., Chapter 5 - Balance Sheet"
                          required
                          className="bg-slate-800 border-slate-700 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-300">Date *</Label>
                        <Input
                          type="date"
                          value={liveClassForm.date}
                          onChange={(e) => setLiveClassForm({...liveClassForm, date: e.target.value})}
                          required
                          min={new Date().toISOString().split('T')[0]}
                          className="bg-slate-800 border-slate-700 text-white"
                        />
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-slate-300">Start Time *</Label>
                        <Input
                          type="time"
                          value={liveClassForm.start_time}
                          onChange={(e) => setLiveClassForm({...liveClassForm, start_time: e.target.value})}
                          required
                          className="bg-slate-800 border-slate-700 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-300">Duration (mins)</Label>
                        <select
                          value={liveClassForm.duration}
                          onChange={(e) => setLiveClassForm({...liveClassForm, duration: parseInt(e.target.value)})}
                          className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                        >
                          <option value={30}>30 minutes</option>
                          <option value={45}>45 minutes</option>
                          <option value={60}>60 minutes</option>
                          <option value={90}>90 minutes</option>
                          <option value={120}>120 minutes</option>
                        </select>
                      </div>
                      <div>
                        <Label className="text-slate-300">Platform *</Label>
                        <div className="flex gap-4 mt-2">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="platform"
                              value="zoom"
                              checked={liveClassForm.platform === 'zoom'}
                              onChange={(e) => setLiveClassForm({...liveClassForm, platform: e.target.value})}
                            />
                            <span className="text-slate-300">Zoom</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="platform"
                              value="google_meet"
                              checked={liveClassForm.platform === 'google_meet'}
                              onChange={(e) => setLiveClassForm({...liveClassForm, platform: e.target.value})}
                            />
                            <span className="text-slate-300">Google Meet</span>
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-slate-300">Meeting Link *</Label>
                      <Input
                        value={liveClassForm.meeting_link}
                        onChange={(e) => setLiveClassForm({...liveClassForm, meeting_link: e.target.value})}
                        placeholder={liveClassForm.platform === 'zoom' ? 'https://zoom.us/j/...' : 'https://meet.google.com/...'}
                        required
                        className="bg-slate-800 border-slate-700 text-white"
                      />
                    </div>
                    
                    <div className="flex gap-3">
                      <Button type="submit" className="bg-violet-600 hover:bg-violet-700">
                        <Calendar className="w-4 h-4 mr-2" />
                        Schedule Class
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setShowAddLiveClass(false)} className="border-slate-700 text-slate-300 hover:bg-slate-800">
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Card>
              )}
              
              {/* Live Classes List */}
              {upcomingClasses.length === 0 ? (
                <Card className="p-12 text-center bg-slate-900 border-slate-800">
                  <Video className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-slate-400 mb-2">No live classes scheduled</h3>
                  <p className="text-slate-500">Schedule your first live class for your students</p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {upcomingClasses.map((cls) => (
                    <Card key={cls.class_id} className="p-4 bg-slate-900 border-slate-800">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-white">{cls.title}</h3>
                          <p className="text-sm text-blue-400">{cls.course_title}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm">
                            <span className="text-slate-400">{new Date(cls.scheduled_at).toLocaleString()}</span>
                            <Badge variant="secondary" className={cls.platform === 'zoom' ? 'bg-blue-600' : 'bg-green-600'}>
                              {cls.platform === 'zoom' ? 'Zoom' : 'Google Meet'}
                            </Badge>
                            <span className="text-slate-500">{cls.duration} mins</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <a href={cls.meeting_link} target="_blank" rel="noopener noreferrer">
                            <Button className="bg-green-600 hover:bg-green-700">
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Start
                            </Button>
                          </a>
                          <Button 
                            variant="outline" 
                            onClick={() => handleDeleteLiveClass(cls.class_id)}
                            className="border-red-800 text-red-400 hover:bg-red-900/50"
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

          {/* 1:1 Sessions Tab */}
          {activeTab === 'sessions' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">1:1 Sessions</h2>
                <Button 
                  onClick={() => setShowAddSession(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Schedule Session
                </Button>
              </div>

              {/* Add Session Form */}
              {showAddSession && (
                <Card className="p-6 bg-slate-900 border-slate-800">
                  <h3 className="text-xl font-semibold text-white mb-4">Schedule 1:1 Session</h3>
                  <form onSubmit={handleCreateSession} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-slate-300">Student Name</Label>
                        <Input
                          value={sessionForm.student_name}
                          onChange={(e) => setSessionForm({...sessionForm, student_name: e.target.value})}
                          placeholder="Enter student name"
                          className="bg-slate-800 border-slate-700 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-300">Student Email</Label>
                        <Input
                          type="email"
                          value={sessionForm.student_email}
                          onChange={(e) => setSessionForm({...sessionForm, student_email: e.target.value})}
                          placeholder="student@email.com"
                          className="bg-slate-800 border-slate-700 text-white"
                        />
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-slate-300">Date *</Label>
                        <Input
                          type="date"
                          value={sessionForm.date}
                          onChange={(e) => setSessionForm({...sessionForm, date: e.target.value})}
                          required
                          min={new Date().toISOString().split('T')[0]}
                          className="bg-slate-800 border-slate-700 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-300">Start Time *</Label>
                        <Input
                          type="time"
                          value={sessionForm.start_time}
                          onChange={(e) => setSessionForm({...sessionForm, start_time: e.target.value})}
                          required
                          className="bg-slate-800 border-slate-700 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-300">End Time *</Label>
                        <Input
                          type="time"
                          value={sessionForm.end_time}
                          onChange={(e) => setSessionForm({...sessionForm, end_time: e.target.value})}
                          required
                          className="bg-slate-800 border-slate-700 text-white"
                        />
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-slate-300">Platform *</Label>
                        <div className="flex gap-4 mt-2">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="session_platform"
                              value="zoom"
                              checked={sessionForm.platform === 'zoom'}
                              onChange={(e) => setSessionForm({...sessionForm, platform: e.target.value})}
                            />
                            <span className="text-slate-300">Zoom</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="session_platform"
                              value="google_meet"
                              checked={sessionForm.platform === 'google_meet'}
                              onChange={(e) => setSessionForm({...sessionForm, platform: e.target.value})}
                            />
                            <span className="text-slate-300">Google Meet</span>
                          </label>
                        </div>
                      </div>
                      <div>
                        <Label className="text-slate-300">Meeting Link *</Label>
                        <Input
                          value={sessionForm.meeting_link}
                          onChange={(e) => setSessionForm({...sessionForm, meeting_link: e.target.value})}
                          placeholder={sessionForm.platform === 'zoom' ? 'https://zoom.us/j/...' : 'https://meet.google.com/...'}
                          required
                          className="bg-slate-800 border-slate-700 text-white"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-slate-300">Subject *</Label>
                      <Input
                        value={sessionForm.subject}
                        onChange={(e) => setSessionForm({...sessionForm, subject: e.target.value})}
                        placeholder="e.g., Commerce Doubt Clearing"
                        required
                        className="bg-slate-800 border-slate-700 text-white"
                      />
                    </div>
                    
                    <div className="flex gap-3">
                      <Button type="submit" className="bg-green-600 hover:bg-green-700">
                        <CalendarDays className="w-4 h-4 mr-2" />
                        Schedule Session
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setShowAddSession(false)} className="border-slate-700 text-slate-300 hover:bg-slate-800">
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Card>
              )}

              {/* Sessions List */}
              {sessions.length === 0 ? (
                <Card className="p-12 text-center bg-slate-900 border-slate-800">
                  <CalendarDays className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-slate-400 mb-2">No sessions scheduled</h3>
                  <p className="text-slate-500">Schedule 1:1 sessions with your students</p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {sessions.map((session) => (
                    <Card key={session.slot_id} className="p-4 bg-slate-900 border-slate-800">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-white">{session.subject || '1:1 Session'}</h3>
                          {session.student_name && (
                            <p className="text-sm text-slate-400">Student: {session.student_name}</p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-sm">
                            <span className="text-blue-400">{session.date}</span>
                            <span className="text-slate-400">{session.start_time} - {session.end_time}</span>
                            <Badge className={session.status === 'scheduled' ? 'bg-green-600' : 'bg-slate-600'}>
                              {session.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {session.meeting_link && session.status === 'scheduled' && (
                            <a href={session.meeting_link} target="_blank" rel="noopener noreferrer">
                              <Button className="bg-green-600 hover:bg-green-700">
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Join
                              </Button>
                            </a>
                          )}
                          {session.status === 'scheduled' && (
                            <Button 
                              variant="outline" 
                              onClick={() => handleDeleteSession(session.slot_id)}
                              className="border-red-800 text-red-400 hover:bg-red-900/50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Profile Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Profile Settings</h2>
              
              <Card className="p-6 bg-slate-900 border-slate-800">
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  {/* Personal Info */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <User className="w-5 h-5 text-blue-400" />
                      Personal Information
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-slate-300">Full Name</Label>
                        <Input
                          value={profileForm.name}
                          onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                          placeholder="Your full name"
                          className="bg-slate-800 border-slate-700 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-300">Bio</Label>
                        <Input
                          value={profileForm.bio}
                          onChange={(e) => setProfileForm({...profileForm, bio: e.target.value})}
                          placeholder="Short bio about yourself"
                          className="bg-slate-800 border-slate-700 text-white"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Contact Info */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Mail className="w-5 h-5 text-green-400" />
                      Contact Information
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-slate-300">Email Address</Label>
                        <Input
                          type="email"
                          value={profileForm.email}
                          onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                          placeholder="your@email.com"
                          className="bg-slate-800 border-slate-700 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-300">Phone Number</Label>
                        <Input
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                          placeholder="+91 XXXXX XXXXX"
                          className="bg-slate-800 border-slate-700 text-white"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Change Password */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Lock className="w-5 h-5 text-amber-400" />
                      Change Password
                    </h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-slate-300">Current Password</Label>
                        <Input
                          type="password"
                          value={profileForm.current_password}
                          onChange={(e) => setProfileForm({...profileForm, current_password: e.target.value})}
                          placeholder="••••••••"
                          className="bg-slate-800 border-slate-700 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-300">New Password</Label>
                        <Input
                          type="password"
                          value={profileForm.new_password}
                          onChange={(e) => setProfileForm({...profileForm, new_password: e.target.value})}
                          placeholder="••••••••"
                          className="bg-slate-800 border-slate-700 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-300">Confirm New Password</Label>
                        <Input
                          type="password"
                          value={profileForm.confirm_password}
                          onChange={(e) => setProfileForm({...profileForm, confirm_password: e.target.value})}
                          placeholder="••••••••"
                          className="bg-slate-800 border-slate-700 text-white"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">Leave password fields empty if you don't want to change it</p>
                  </div>
                  
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    Save Changes
                  </Button>
                </form>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default TeacherDashboard;
