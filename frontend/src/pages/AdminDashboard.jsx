import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import axios from 'axios';
import { 
  Users, BookOpen, DollarSign, TrendingUp, LogOut, Menu, X, CheckCircle, 
  XCircle, Clock, Eye, Settings, Video, CalendarDays, Trash2, Edit, Plus,
  UserCheck, Mail, Phone, Lock, User, GraduationCap, ExternalLink, EyeOff
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [allPayments, setAllPayments] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [allLiveClasses, setAllLiveClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
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
    teacher_id: ''
  });
  
  // Helper functions for course form
  const isJuniorClass = (classLevel) => classLevel === '6-8' || classLevel === '9-10';
  
  const getSubjectOptions = (classLevel) => {
    if (classLevel === '6-8' || classLevel === '9-10') {
      return [
        'All Subjects (Mathematics, Science, English, Social Science, Hindi, Computer Science)'
      ];
    }
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
  
  // User management
  const [showAddUser, setShowAddUser] = useState(false);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    phone: ''
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
      
      if (response.data.role !== 'admin') {
        navigate('/student/dashboard');
        return;
      }
      
      setUser(response.data);
      await loadAllData(token);
    } catch (error) {
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const loadAllData = async (token) => {
    try {
      const [analyticsRes, paymentsRes, usersRes, coursesRes] = await Promise.all([
        axios.get(`${API}/admin/analytics`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/admin/payment-verifications`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/admin/users`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: [] })),
        axios.get(`${API}/courses`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      setAnalytics(analyticsRes.data);
      setAllPayments(paymentsRes.data);
      setPendingPayments(paymentsRes.data.filter(p => p.status === 'pending'));
      setAllUsers(usersRes.data);
      setAllCourses(coursesRes.data);
      
      // Load all live classes
      const allClasses = [];
      for (const course of coursesRes.data) {
        try {
          const classesRes = await axios.get(`${API}/live-classes/course/${course.course_id}`);
          allClasses.push(...classesRes.data.map(c => ({ ...c, course_title: course.title })));
        } catch (e) {}
      }
      setAllLiveClasses(allClasses);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Payment Management
  const handleApprovePayment = async (verificationId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API}/admin/approve-payment/${verificationId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Payment approved and access granted!');
      await loadAllData(token);
    } catch (error) {
      toast.error('Failed to approve payment');
    }
  };

  const handleRejectPayment = async (verificationId) => {
    if (!window.confirm('Are you sure you want to reject this payment?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API}/admin/reject-payment/${verificationId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Payment rejected');
      await loadAllData(token);
    } catch (error) {
      toast.error('Failed to reject payment');
    }
  };

  // User Management
  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API}/auth/register`,
        userForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('User created successfully!');
      setShowAddUser(false);
      setUserForm({ name: '', email: '', password: '', role: 'student', phone: '' });
      await loadAllData(token);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('User deleted');
      await loadAllData(token);
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  // Course Management
  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const teachers = allUsers.filter(u => u.role === 'teacher');
      const teacherId = courseForm.teacher_id || (teachers[0]?.user_id);
      
      if (editingCourse) {
        await axios.put(
          `${API}/courses/${editingCourse}`,
          { ...courseForm, price: parseFloat(courseForm.price) || 0 },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Course updated!');
        setEditingCourse(null);
      } else {
        await axios.post(
          `${API}/courses`,
          { ...courseForm, price: parseFloat(courseForm.price) || 0, teacher_id: teacherId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Course created!');
      }
      setShowAddCourse(false);
      setCourseForm({ title: '', description: '', stream: 'general', class_level: '6-8', subject: '', price: '', teacher_id: '' });
      await loadAllData(token);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save course');
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Delete this course and all its content?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Course deleted!');
      await loadAllData(token);
    } catch (error) {
      toast.error('Failed to delete course');
    }
  };

  const handleTogglePublish = async (courseId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API}/courses/${courseId}/publish`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`Course ${currentStatus ? 'unpublished' : 'published'}!`);
      await loadAllData(token);
    } catch (error) {
      toast.error('Failed to update course');
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
      teacher_id: course.teacher_id
    });
    setShowAddCourse(true);
  };

  // Live Class Management
  const handleCreateLiveClass = async (e) => {
    e.preventDefault();
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
      toast.success('Live class scheduled!');
      setShowAddLiveClass(false);
      setLiveClassForm({ title: '', course_id: '', date: '', start_time: '10:00', duration: 60, platform: 'zoom', meeting_link: '', description: '' });
      await loadAllData(token);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to schedule class');
    }
  };

  const handleDeleteLiveClass = async (classId) => {
    if (!window.confirm('Delete this live class?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/live-classes/${classId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Live class deleted!');
      await loadAllData(token);
    } catch (error) {
      toast.error('Failed to delete class');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const teachers = allUsers.filter(u => u.role === 'teacher');
  const students = allUsers.filter(u => u.role === 'student');

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
            <span className="font-bold text-white text-lg">Admin</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-slate-400">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-600 to-orange-600 flex items-center justify-center text-white font-bold">
              A
            </div>
            <div>
              <p className="text-white font-semibold">{user?.name}</p>
              <p className="text-xs text-red-400">Super Admin</p>
            </div>
          </div>
        </div>
        
        <nav className="p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'overview' ? 'bg-red-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <TrendingUp className="w-5 h-5" />
            <span>Overview</span>
          </button>
          <button 
            onClick={() => setActiveTab('payments')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'payments' ? 'bg-red-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <DollarSign className="w-5 h-5" />
            <span>Payments</span>
            {pendingPayments.length > 0 && (
              <Badge className="ml-auto bg-amber-600">{pendingPayments.length}</Badge>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'users' ? 'bg-red-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <Users className="w-5 h-5" />
            <span>Users</span>
            <Badge className="ml-auto bg-slate-700">{allUsers.length}</Badge>
          </button>
          <button 
            onClick={() => setActiveTab('courses')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'courses' ? 'bg-red-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <BookOpen className="w-5 h-5" />
            <span>Courses</span>
            <Badge className="ml-auto bg-slate-700">{allCourses.length}</Badge>
          </button>
          <button 
            onClick={() => setActiveTab('classes')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'classes' ? 'bg-red-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <Video className="w-5 h-5" />
            <span>Live Classes</span>
          </button>
        </nav>
        
        <div className="absolute bottom-0 w-full p-4 border-t border-slate-800">
          <Button onClick={handleLogout} variant="ghost" className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800">
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
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <Badge className="ml-4 bg-red-600">Full Access</Badge>
        </header>
        
        <main className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4 bg-slate-900 border-slate-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400">Total Users</p>
                      <p className="text-2xl font-bold text-white">{allUsers.length}</p>
                    </div>
                    <Users className="w-8 h-8 text-blue-500" />
                  </div>
                </Card>
                <Card className="p-4 bg-slate-900 border-slate-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400">Total Courses</p>
                      <p className="text-2xl font-bold text-white">{allCourses.length}</p>
                    </div>
                    <BookOpen className="w-8 h-8 text-violet-500" />
                  </div>
                </Card>
                <Card className="p-4 bg-slate-900 border-slate-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400">Pending Payments</p>
                      <p className="text-2xl font-bold text-white">{pendingPayments.length}</p>
                    </div>
                    <Clock className="w-8 h-8 text-amber-500" />
                  </div>
                </Card>
                <Card className="p-4 bg-slate-900 border-slate-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400">Live Classes</p>
                      <p className="text-2xl font-bold text-white">{allLiveClasses.length}</p>
                    </div>
                    <Video className="w-8 h-8 text-green-500" />
                  </div>
                </Card>
              </div>

              {/* Quick Stats */}
              <div className="grid md:grid-cols-3 gap-4">
                <Card className="p-4 bg-gradient-to-br from-blue-900/50 to-blue-800/30 border-blue-700">
                  <h3 className="text-lg font-semibold text-white mb-2">Students</h3>
                  <p className="text-3xl font-bold text-blue-400">{students.length}</p>
                  <p className="text-sm text-slate-400 mt-1">Registered students</p>
                </Card>
                <Card className="p-4 bg-gradient-to-br from-violet-900/50 to-violet-800/30 border-violet-700">
                  <h3 className="text-lg font-semibold text-white mb-2">Teachers</h3>
                  <p className="text-3xl font-bold text-violet-400">{teachers.length}</p>
                  <p className="text-sm text-slate-400 mt-1">Active teachers</p>
                </Card>
                <Card className="p-4 bg-gradient-to-br from-green-900/50 to-green-800/30 border-green-700">
                  <h3 className="text-lg font-semibold text-white mb-2">Approved Payments</h3>
                  <p className="text-3xl font-bold text-green-400">{allPayments.filter(p => p.status === 'approved').length}</p>
                  <p className="text-sm text-slate-400 mt-1">Total approved</p>
                </Card>
              </div>

              {/* Recent Activity */}
              {pendingPayments.length > 0 && (
                <Card className="p-4 bg-slate-900 border-slate-800">
                  <h3 className="text-lg font-semibold text-white mb-4">Pending Payments (Action Required)</h3>
                  <div className="space-y-3">
                    {pendingPayments.slice(0, 3).map((payment) => (
                      <div key={payment.verification_id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                        <div>
                          <p className="font-medium text-white">{payment.user_name}</p>
                          <p className="text-sm text-slate-400">₹{payment.amount} - UTR: {payment.utr}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleApprovePayment(payment.verification_id)}>
                            Approve
                          </Button>
                          <Button size="sm" variant="outline" className="border-red-800 text-red-400" onClick={() => handleRejectPayment(payment.verification_id)}>
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* Payments Tab */}
          {activeTab === 'payments' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Payment Management</h2>
              
              {/* Pending Payments */}
              <Card className="p-4 bg-slate-900 border-slate-800">
                <h3 className="text-lg font-semibold text-amber-400 mb-4">Pending Payments ({pendingPayments.length})</h3>
                {pendingPayments.length === 0 ? (
                  <p className="text-slate-500 text-center py-8">No pending payments</p>
                ) : (
                  <div className="space-y-3">
                    {pendingPayments.map((payment) => (
                      <div key={payment.verification_id} className="p-4 bg-slate-800/50 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-white">{payment.user_name}</p>
                            <p className="text-sm text-slate-400">{payment.user_email}</p>
                            <div className="mt-2 space-y-1 text-sm">
                              <p className="text-slate-300">Amount: <span className="text-green-400 font-semibold">₹{payment.amount}</span></p>
                              <p className="text-slate-300">UTR: <span className="text-blue-400">{payment.utr}</span></p>
                              <p className="text-slate-300">UPI ID: {payment.upi_id}</p>
                              <p className="text-slate-400">Submitted: {new Date(payment.created_at).toLocaleString()}</p>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleApprovePayment(payment.verification_id)}>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Approve & Grant Access
                            </Button>
                            <Button variant="outline" className="border-red-800 text-red-400 hover:bg-red-900/50" onClick={() => handleRejectPayment(payment.verification_id)}>
                              <XCircle className="w-4 h-4 mr-2" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* All Payments */}
              <Card className="p-4 bg-slate-900 border-slate-800">
                <h3 className="text-lg font-semibold text-white mb-4">All Payments ({allPayments.length})</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-slate-400 border-b border-slate-800">
                        <th className="text-left py-3 px-2">User</th>
                        <th className="text-left py-3 px-2">Amount</th>
                        <th className="text-left py-3 px-2">UTR</th>
                        <th className="text-left py-3 px-2">Status</th>
                        <th className="text-left py-3 px-2">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allPayments.map((payment) => (
                        <tr key={payment.verification_id} className="border-b border-slate-800/50">
                          <td className="py-3 px-2 text-white">{payment.user_name}</td>
                          <td className="py-3 px-2 text-green-400">₹{payment.amount}</td>
                          <td className="py-3 px-2 text-slate-300">{payment.utr}</td>
                          <td className="py-3 px-2">
                            <Badge className={
                              payment.status === 'approved' ? 'bg-green-600' :
                              payment.status === 'pending' ? 'bg-amber-600' :
                              'bg-red-600'
                            }>
                              {payment.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-2 text-slate-400">{new Date(payment.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">User Management</h2>
                <Button onClick={() => setShowAddUser(true)} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add User
                </Button>
              </div>

              {/* Add User Form */}
              {showAddUser && (
                <Card className="p-6 bg-slate-900 border-slate-800">
                  <h3 className="text-xl font-semibold text-white mb-4">Create New User</h3>
                  <form onSubmit={handleCreateUser} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-slate-300">Full Name *</Label>
                        <Input
                          value={userForm.name}
                          onChange={(e) => setUserForm({...userForm, name: e.target.value})}
                          required
                          className="bg-slate-800 border-slate-700 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-300">Email *</Label>
                        <Input
                          type="email"
                          value={userForm.email}
                          onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                          required
                          className="bg-slate-800 border-slate-700 text-white"
                        />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-slate-300">Password *</Label>
                        <Input
                          type="password"
                          value={userForm.password}
                          onChange={(e) => setUserForm({...userForm, password: e.target.value})}
                          required
                          className="bg-slate-800 border-slate-700 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-300">Role *</Label>
                        <select
                          value={userForm.role}
                          onChange={(e) => setUserForm({...userForm, role: e.target.value})}
                          className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                        >
                          <option value="student">Student</option>
                          <option value="teacher">Teacher</option>
                          <option value="parent">Parent</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                      <div>
                        <Label className="text-slate-300">Phone</Label>
                        <Input
                          value={userForm.phone}
                          onChange={(e) => setUserForm({...userForm, phone: e.target.value})}
                          className="bg-slate-800 border-slate-700 text-white"
                        />
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button type="submit" className="bg-green-600 hover:bg-green-700">Create User</Button>
                      <Button type="button" variant="outline" onClick={() => setShowAddUser(false)} className="border-slate-700 text-slate-300">Cancel</Button>
                    </div>
                  </form>
                </Card>
              )}

              {/* Users List */}
              <div className="grid md:grid-cols-3 gap-4">
                {/* Teachers */}
                <Card className="p-4 bg-slate-900 border-slate-800">
                  <h3 className="text-lg font-semibold text-violet-400 mb-4">Teachers ({teachers.length})</h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {teachers.map((t) => (
                      <div key={t.user_id} className="p-3 bg-slate-800/50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-white">{t.name}</p>
                            <p className="text-xs text-slate-400">{t.email}</p>
                          </div>
                          <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300" onClick={() => handleDeleteUser(t.user_id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Students */}
                <Card className="p-4 bg-slate-900 border-slate-800">
                  <h3 className="text-lg font-semibold text-blue-400 mb-4">Students ({students.length})</h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {students.map((s) => (
                      <div key={s.user_id} className="p-3 bg-slate-800/50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-white">{s.name}</p>
                            <p className="text-xs text-slate-400">{s.email}</p>
                          </div>
                          <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300" onClick={() => handleDeleteUser(s.user_id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Admins & Parents */}
                <Card className="p-4 bg-slate-900 border-slate-800">
                  <h3 className="text-lg font-semibold text-red-400 mb-4">Admins & Parents</h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {allUsers.filter(u => u.role === 'admin' || u.role === 'parent').map((u) => (
                      <div key={u.user_id} className="p-3 bg-slate-800/50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-white">{u.name}</p>
                            <p className="text-xs text-slate-400">{u.email}</p>
                            <Badge className={u.role === 'admin' ? 'bg-red-600' : 'bg-green-600'} variant="secondary">
                              {u.role}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* Courses Tab */}
          {activeTab === 'courses' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Course Management</h2>
                <Button onClick={() => { setCourseForm({ title: '', description: '', stream: 'general', class_level: '6-8', subject: '', price: '', teacher_id: '' }); setEditingCourse(null); setShowAddCourse(true); }} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Course
                </Button>
              </div>

              {/* Add/Edit Course Form */}
              {showAddCourse && (
                <Card className="p-6 bg-slate-900 border-slate-800">
                  <h3 className="text-xl font-semibold text-white mb-4">{editingCourse ? 'Edit Course' : 'Create New Course'}</h3>
                  <form onSubmit={handleCreateCourse} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-slate-300">Course Title *</Label>
                        <Input
                          value={courseForm.title}
                          onChange={(e) => setCourseForm({...courseForm, title: e.target.value})}
                          required
                          className="bg-slate-800 border-slate-700 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-300">Subject *</Label>
                        <Input
                          value={courseForm.subject}
                          onChange={(e) => setCourseForm({...courseForm, subject: e.target.value})}
                          required
                          className="bg-slate-800 border-slate-700 text-white"
                        />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-4 gap-4">
                      <div>
                        <Label className="text-slate-300">Class Level</Label>
                        <select
                          value={courseForm.class_level}
                          onChange={(e) => {
                            const newClassLevel = e.target.value;
                            const newStream = isJuniorClass(newClassLevel) ? 'general' : 'commerce';
                            setCourseForm({
                              ...courseForm,
                              class_level: newClassLevel,
                              stream: newStream,
                              subject: ''
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
                      {!isJuniorClass(courseForm.class_level) && (
                        <div>
                          <Label className="text-slate-300">Stream</Label>
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
                        <Label className="text-slate-300">Subject</Label>
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
                        <Label className="text-slate-300">Price (₹/month)</Label>
                        <Input
                          type="number"
                          value={courseForm.price}
                          onChange={(e) => setCourseForm({...courseForm, price: e.target.value})}
                          required
                          className="bg-slate-800 border-slate-700 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-300">Assign Teacher</Label>
                        <select
                          value={courseForm.teacher_id}
                          onChange={(e) => setCourseForm({...courseForm, teacher_id: e.target.value})}
                          className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                        >
                          <option value="">Select Teacher</option>
                          {teachers.map((t) => (
                            <option key={t.user_id} value={t.user_id}>{t.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <Label className="text-slate-300">Description</Label>
                      <Textarea
                        value={courseForm.description}
                        onChange={(e) => setCourseForm({...courseForm, description: e.target.value})}
                        rows={3}
                        className="bg-slate-800 border-slate-700 text-white"
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button type="submit" className="bg-green-600 hover:bg-green-700">{editingCourse ? 'Update' : 'Create'} Course</Button>
                      <Button type="button" variant="outline" onClick={() => setShowAddCourse(false)} className="border-slate-700 text-slate-300">Cancel</Button>
                    </div>
                  </form>
                </Card>
              )}

              {/* Courses List */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allCourses.map((course) => (
                  <Card key={course.course_id} className="bg-slate-900 border-slate-800 overflow-hidden">
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-white">{course.title}</h3>
                        <Badge className={course.published !== false ? 'bg-green-600' : 'bg-slate-600'}>
                          {course.published !== false ? 'Published' : 'Draft'}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-400 mb-1">{course.subject} • Class {course.class_level}</p>
                      <p className="text-lg font-bold text-blue-400 mb-3">₹{course.price}/mo</p>
                      <div className="flex gap-2 flex-wrap">
                        <Button size="sm" onClick={() => handleEditCourse(course)} className="bg-blue-600 hover:bg-blue-700">
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleTogglePublish(course.course_id, course.published !== false)} className="border-slate-700 text-slate-300">
                          {course.published !== false ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDeleteCourse(course.course_id)} className="border-red-800 text-red-400">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Live Classes Tab */}
          {activeTab === 'classes' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Live Class Management</h2>
                <Button onClick={() => setShowAddLiveClass(true)} className="bg-violet-600 hover:bg-violet-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Schedule Class
                </Button>
              </div>

              {/* Add Live Class Form */}
              {showAddLiveClass && (
                <Card className="p-6 bg-slate-900 border-slate-800">
                  <h3 className="text-xl font-semibold text-white mb-4">Schedule Live Class</h3>
                  <form onSubmit={handleCreateLiveClass} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-slate-300">Class Title *</Label>
                        <Input
                          value={liveClassForm.title}
                          onChange={(e) => setLiveClassForm({...liveClassForm, title: e.target.value})}
                          required
                          className="bg-slate-800 border-slate-700 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-300">Select Course *</Label>
                        <select
                          value={liveClassForm.course_id}
                          onChange={(e) => setLiveClassForm({...liveClassForm, course_id: e.target.value})}
                          required
                          className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                        >
                          <option value="">Select Course</option>
                          {allCourses.map((c) => (
                            <option key={c.course_id} value={c.course_id}>{c.title}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-4 gap-4">
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
                        <Label className="text-slate-300">Duration</Label>
                        <select
                          value={liveClassForm.duration}
                          onChange={(e) => setLiveClassForm({...liveClassForm, duration: parseInt(e.target.value)})}
                          className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                        >
                          <option value={30}>30 mins</option>
                          <option value={45}>45 mins</option>
                          <option value={60}>60 mins</option>
                          <option value={90}>90 mins</option>
                        </select>
                      </div>
                      <div>
                        <Label className="text-slate-300">Platform</Label>
                        <select
                          value={liveClassForm.platform}
                          onChange={(e) => setLiveClassForm({...liveClassForm, platform: e.target.value})}
                          className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                        >
                          <option value="zoom">Zoom</option>
                          <option value="google_meet">Google Meet</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <Label className="text-slate-300">Meeting Link *</Label>
                      <Input
                        value={liveClassForm.meeting_link}
                        onChange={(e) => setLiveClassForm({...liveClassForm, meeting_link: e.target.value})}
                        required
                        placeholder="https://zoom.us/j/... or https://meet.google.com/..."
                        className="bg-slate-800 border-slate-700 text-white"
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button type="submit" className="bg-violet-600 hover:bg-violet-700">Schedule Class</Button>
                      <Button type="button" variant="outline" onClick={() => setShowAddLiveClass(false)} className="border-slate-700 text-slate-300">Cancel</Button>
                    </div>
                  </form>
                </Card>
              )}

              {/* Live Classes List */}
              {allLiveClasses.length === 0 ? (
                <Card className="p-12 text-center bg-slate-900 border-slate-800">
                  <Video className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-slate-400">No live classes scheduled</h3>
                </Card>
              ) : (
                <div className="space-y-4">
                  {allLiveClasses.map((cls) => (
                    <Card key={cls.class_id} className="p-4 bg-slate-900 border-slate-800">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-white">{cls.title}</h3>
                          <p className="text-sm text-blue-400">{cls.course_title}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm">
                            <span className="text-slate-400">{new Date(cls.scheduled_at).toLocaleString()}</span>
                            <Badge variant="secondary" className={cls.platform === 'zoom' ? 'bg-blue-600' : 'bg-green-600'}>
                              {cls.platform}
                            </Badge>
                            <span className="text-slate-500">{cls.duration} mins</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <a href={cls.meeting_link} target="_blank" rel="noopener noreferrer">
                            <Button className="bg-green-600 hover:bg-green-700">
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Join
                            </Button>
                          </a>
                          <Button variant="outline" onClick={() => handleDeleteLiveClass(cls.class_id)} className="border-red-800 text-red-400">
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
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
