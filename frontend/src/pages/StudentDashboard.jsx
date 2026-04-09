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
  BookOpen, Video, Calendar, MessageCircle, TrendingUp, LogOut, Menu, X, 
  Sparkles, Play, Clock, Users, CalendarDays, ChevronRight, FileText, Award
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Booking form states
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [teacherAvailability, setTeacherAvailability] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    date: '',
    start_time: '',
    end_time: '',
    subject: '',
    notes: ''
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
      const [enrolledRes, upcomingRes, teachersRes, bookingsRes] = await Promise.all([
        axios.get(`${API}/student/enrolled-courses`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/student/upcoming-classes`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: [] })),
        axios.get(`${API}/teachers`),
        axios.get(`${API}/bookings/my`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      setEnrolledCourses(enrolledRes.data);
      setUpcomingClasses(upcomingRes.data);
      setTeachers(teachersRes.data);
      setMyBookings(bookingsRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleSelectTeacher = async (teacher) => {
    setSelectedTeacher(teacher);
    try {
      const response = await axios.get(`${API}/teacher/${teacher.user_id}/availability`);
      setTeacherAvailability(response.data);
      setShowBookingForm(true);
    } catch (error) {
      toast.error('Failed to load teacher availability');
    }
  };

  const handleBookSession = async (e) => {
    e.preventDefault();
    if (!selectedTeacher) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API}/bookings`,
        {
          teacher_id: selectedTeacher.user_id,
          ...bookingForm
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('Booking request submitted! Waiting for teacher approval.');
      setShowBookingForm(false);
      setSelectedTeacher(null);
      setBookingForm({ date: '', start_time: '', end_time: '', subject: '', notes: '' });
      await loadAllData(token);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to submit booking');
    }
  };

  const handleCancelBooking = async (slotId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API}/bookings/${slotId}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Booking cancelled');
      await loadAllData(token);
    } catch (error) {
      toast.error('Failed to cancel booking');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const pendingBookings = myBookings.filter(b => b.status === 'pending');
  const approvedBookings = myBookings.filter(b => b.status === 'approved');

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
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            data-testid="nav-dashboard"
          >
            <BookOpen className="w-5 h-5" />
            <span>Dashboard</span>
          </button>
          <button 
            onClick={() => setActiveTab('courses')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'courses' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            data-testid="nav-courses"
          >
            <Video className="w-5 h-5" />
            <span>My Courses</span>
          </button>
          <button 
            onClick={() => setActiveTab('bookings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'bookings' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            data-testid="nav-bookings"
          >
            <CalendarDays className="w-5 h-5" />
            <span>1:1 Sessions</span>
          </button>
          <Link to="/courses">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white font-medium transition-colors">
              <TrendingUp className="w-5 h-5" />
              <span>Browse Courses</span>
            </button>
          </Link>
          <Link to="/doubts">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white font-medium transition-colors">
              <MessageCircle className="w-5 h-5" />
              <span>Ask Doubts</span>
            </button>
          </Link>
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
          <h1 className="text-2xl font-bold text-white">Welcome, {user?.name}!</h1>
        </header>
        
        <main className="p-6">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4 bg-slate-900 border-slate-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400">Enrolled</p>
                      <p className="text-2xl font-bold text-white">{enrolledCourses.length}</p>
                    </div>
                    <BookOpen className="w-8 h-8 text-blue-500" />
                  </div>
                </Card>
                <Card className="p-4 bg-slate-900 border-slate-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400">Upcoming</p>
                      <p className="text-2xl font-bold text-white">{upcomingClasses.length}</p>
                    </div>
                    <Calendar className="w-8 h-8 text-violet-500" />
                  </div>
                </Card>
                <Card className="p-4 bg-slate-900 border-slate-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400">Sessions</p>
                      <p className="text-2xl font-bold text-white">{approvedBookings.length}</p>
                    </div>
                    <Users className="w-8 h-8 text-green-500" />
                  </div>
                </Card>
                <Card className="p-4 bg-slate-900 border-slate-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400">Progress</p>
                      <p className="text-2xl font-bold text-white">75%</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-amber-500" />
                  </div>
                </Card>
              </div>

              {/* Upcoming Live Classes */}
              {upcomingClasses.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-white mb-4">Upcoming Live Classes</h2>
                  <div className="space-y-3">
                    {upcomingClasses.slice(0, 3).map((cls) => (
                      <Card key={cls.class_id} className="p-4 bg-slate-900 border-slate-800">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-white">{cls.title}</h3>
                            <p className="text-sm text-slate-400">{cls.course_title}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm">
                              <span className="text-blue-400">{new Date(cls.scheduled_at).toLocaleString()}</span>
                              <Badge variant="secondary">{cls.platform}</Badge>
                            </div>
                          </div>
                          <a href={cls.meeting_link} target="_blank" rel="noopener noreferrer">
                            <Button className="bg-green-600 hover:bg-green-700">
                              <Play className="w-4 h-4 mr-2" />
                              Join
                            </Button>
                          </a>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="p-6 bg-gradient-to-br from-blue-900/50 to-violet-900/50 border-slate-800">
                  <div className="flex items-center gap-3 mb-4">
                    <Sparkles className="w-8 h-8 text-blue-400" />
                    <h3 className="text-xl font-bold text-white">AI Doubt Assistant</h3>
                  </div>
                  <p className="text-slate-300 mb-4">Get instant answers to your doubts powered by GPT-5.2</p>
                  <Link to="/doubts">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      Ask a Doubt
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-green-900/50 to-emerald-900/50 border-slate-800">
                  <div className="flex items-center gap-3 mb-4">
                    <Users className="w-8 h-8 text-green-400" />
                    <h3 className="text-xl font-bold text-white">Book 1:1 Session</h3>
                  </div>
                  <p className="text-slate-300 mb-4">Schedule a personal session with your teacher</p>
                  <Button onClick={() => setActiveTab('bookings')} className="bg-green-600 hover:bg-green-700">
                    Book Now
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </Card>
              </div>

              {/* Enrolled Courses Preview */}
              {enrolledCourses.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-white">My Courses</h2>
                    <Button variant="ghost" onClick={() => setActiveTab('courses')} className="text-blue-400 hover:text-blue-300">
                      View All <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {enrolledCourses.slice(0, 3).map((item) => (
                      <Card key={item.course.course_id} className="bg-slate-900 border-slate-800 overflow-hidden">
                        <div className="h-24 bg-gradient-to-r from-blue-600 to-violet-600"></div>
                        <div className="p-4">
                          <h3 className="font-semibold text-white mb-1">{item.course.title}</h3>
                          <p className="text-sm text-slate-400 mb-3">{item.course.subject} • Class {item.course.class_level}</p>
                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            <span>{item.lectures?.length || 0} lectures</span>
                            <span>{item.live_classes?.length || 0} live classes</span>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* My Courses Tab */}
          {activeTab === 'courses' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">My Enrolled Courses</h2>
                <Link to="/courses">
                  <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
                    Browse More
                  </Button>
                </Link>
              </div>

              {enrolledCourses.length === 0 ? (
                <Card className="p-12 text-center bg-slate-900 border-slate-800">
                  <BookOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-slate-400 mb-2">No courses yet</h3>
                  <p className="text-slate-500 mb-4">Start your learning journey by enrolling in a course</p>
                  <Link to="/courses">
                    <Button className="bg-blue-600 hover:bg-blue-700">Explore Courses</Button>
                  </Link>
                </Card>
              ) : (
                <div className="space-y-6">
                  {enrolledCourses.map((item) => (
                    <Card key={item.course.course_id} className="bg-slate-900 border-slate-800 overflow-hidden">
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-white">{item.course.title}</h3>
                            <p className="text-slate-400">{item.course.subject} • Class {item.course.class_level}</p>
                          </div>
                          <Badge className="bg-green-600">Enrolled</Badge>
                        </div>

                        {/* Course Content Sections */}
                        <div className="grid md:grid-cols-4 gap-4 mt-6">
                          {/* Lectures */}
                          <Card className="p-4 bg-slate-800 border-slate-700">
                            <div className="flex items-center gap-2 mb-3">
                              <Video className="w-5 h-5 text-violet-400" />
                              <h4 className="font-semibold text-white">Lectures ({item.lectures?.length || 0})</h4>
                            </div>
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                              {item.lectures?.map((lecture, idx) => (
                                <a
                                  key={lecture.lecture_id}
                                  href={lecture.video_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block p-2 rounded bg-slate-700/50 hover:bg-slate-700 text-sm text-slate-300"
                                >
                                  {idx + 1}. {lecture.title}
                                </a>
                              ))}
                              {(!item.lectures || item.lectures.length === 0) && (
                                <p className="text-sm text-slate-500">No lectures yet</p>
                              )}
                            </div>
                          </Card>

                          {/* Live Classes */}
                          <Card className="p-4 bg-slate-800 border-slate-700">
                            <div className="flex items-center gap-2 mb-3">
                              <Calendar className="w-5 h-5 text-green-400" />
                              <h4 className="font-semibold text-white">Live Classes ({item.live_classes?.length || 0})</h4>
                            </div>
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                              {item.live_classes?.map((cls) => {
                                const isUpcoming = new Date(cls.scheduled_at) > new Date();
                                return (
                                  <div key={cls.class_id} className="p-2 rounded bg-slate-700/50 text-sm">
                                    <p className="text-slate-300">{cls.title}</p>
                                    <p className="text-xs text-slate-500">{new Date(cls.scheduled_at).toLocaleString()}</p>
                                    {isUpcoming && cls.meeting_link && (
                                      <a href={cls.meeting_link} target="_blank" rel="noopener noreferrer" className="text-green-400 text-xs hover:underline">
                                        Join →
                                      </a>
                                    )}
                                  </div>
                                );
                              })}
                              {(!item.live_classes || item.live_classes.length === 0) && (
                                <p className="text-sm text-slate-500">No live classes scheduled</p>
                              )}
                            </div>
                          </Card>

                          {/* Assignments */}
                          <Card className="p-4 bg-slate-800 border-slate-700">
                            <div className="flex items-center gap-2 mb-3">
                              <FileText className="w-5 h-5 text-amber-400" />
                              <h4 className="font-semibold text-white">Assignments ({item.assignments?.length || 0})</h4>
                            </div>
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                              {item.assignments?.map((assignment) => (
                                <div key={assignment.assignment_id} className="p-2 rounded bg-slate-700/50 text-sm">
                                  <p className="text-slate-300">{assignment.title}</p>
                                  <p className="text-xs text-slate-500">Due: {new Date(assignment.due_date).toLocaleDateString()}</p>
                                </div>
                              ))}
                              {(!item.assignments || item.assignments.length === 0) && (
                                <p className="text-sm text-slate-500">No assignments yet</p>
                              )}
                            </div>
                          </Card>

                          {/* Tests */}
                          <Card className="p-4 bg-slate-800 border-slate-700">
                            <div className="flex items-center gap-2 mb-3">
                              <Award className="w-5 h-5 text-blue-400" />
                              <h4 className="font-semibold text-white">Tests ({item.tests?.length || 0})</h4>
                            </div>
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                              {item.tests?.map((test) => (
                                <div key={test.test_id} className="p-2 rounded bg-slate-700/50 text-sm">
                                  <p className="text-slate-300">{test.title}</p>
                                  <p className="text-xs text-slate-500">{test.duration} mins • {test.total_marks} marks</p>
                                </div>
                              ))}
                              {(!item.tests || item.tests.length === 0) && (
                                <p className="text-sm text-slate-500">No tests yet</p>
                              )}
                            </div>
                          </Card>
                        </div>
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
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">1:1 Sessions</h2>
                <Button onClick={() => setShowBookingForm(true)} className="bg-blue-600 hover:bg-blue-700">
                  Book New Session
                </Button>
              </div>

              {/* Booking Form Modal */}
              {showBookingForm && (
                <Card className="p-6 bg-slate-900 border-slate-800">
                  <h3 className="text-xl font-semibold text-white mb-4">Book 1:1 Session</h3>
                  
                  {!selectedTeacher ? (
                    <div>
                      <p className="text-slate-400 mb-4">Select a teacher:</p>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {teachers.map((teacher) => (
                          <Card 
                            key={teacher.user_id} 
                            className="p-4 bg-slate-800 border-slate-700 cursor-pointer hover:border-blue-500 transition-colors"
                            onClick={() => handleSelectTeacher(teacher)}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-violet-600 flex items-center justify-center text-white font-bold">
                                {teacher.name?.charAt(0)}
                              </div>
                              <div>
                                <h4 className="font-semibold text-white">{teacher.name}</h4>
                                <p className="text-sm text-slate-400">{teacher.email}</p>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                      <Button 
                        variant="outline" 
                        onClick={() => setShowBookingForm(false)} 
                        className="mt-4 border-slate-700 text-slate-300"
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-3 mb-4 p-3 bg-slate-800 rounded-lg">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-violet-600 flex items-center justify-center text-white font-bold">
                          {selectedTeacher.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{selectedTeacher.name}</p>
                          <p className="text-sm text-slate-400">Selected Teacher</p>
                        </div>
                      </div>

                      {teacherAvailability?.availability?.length > 0 && (
                        <div className="mb-4 p-3 bg-slate-800 rounded-lg">
                          <p className="text-sm text-slate-400 mb-2">Available on:</p>
                          <div className="flex flex-wrap gap-2">
                            {teacherAvailability.availability.map((slot, idx) => (
                              <Badge key={idx} variant="secondary">
                                {daysOfWeek[slot.day_of_week]} {slot.start_time}-{slot.end_time}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <form onSubmit={handleBookSession} className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-slate-300">Date</Label>
                            <Input
                              type="date"
                              value={bookingForm.date}
                              onChange={(e) => setBookingForm({...bookingForm, date: e.target.value})}
                              required
                              min={new Date().toISOString().split('T')[0]}
                              className="bg-slate-800 border-slate-700 text-white"
                            />
                          </div>
                          <div>
                            <Label className="text-slate-300">Subject</Label>
                            <Input
                              value={bookingForm.subject}
                              onChange={(e) => setBookingForm({...bookingForm, subject: e.target.value})}
                              placeholder="e.g., Mathematics Doubt"
                              className="bg-slate-800 border-slate-700 text-white"
                            />
                          </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-slate-300">Start Time</Label>
                            <Input
                              type="time"
                              value={bookingForm.start_time}
                              onChange={(e) => setBookingForm({...bookingForm, start_time: e.target.value})}
                              required
                              className="bg-slate-800 border-slate-700 text-white"
                            />
                          </div>
                          <div>
                            <Label className="text-slate-300">End Time</Label>
                            <Input
                              type="time"
                              value={bookingForm.end_time}
                              onChange={(e) => setBookingForm({...bookingForm, end_time: e.target.value})}
                              required
                              className="bg-slate-800 border-slate-700 text-white"
                            />
                          </div>
                        </div>
                        <div>
                          <Label className="text-slate-300">Notes (optional)</Label>
                          <Textarea
                            value={bookingForm.notes}
                            onChange={(e) => setBookingForm({...bookingForm, notes: e.target.value})}
                            placeholder="Any specific topics you want to discuss..."
                            className="bg-slate-800 border-slate-700 text-white"
                            rows={3}
                          />
                        </div>
                        <div className="flex gap-3">
                          <Button type="submit" className="bg-green-600 hover:bg-green-700">
                            Submit Booking
                          </Button>
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => { setSelectedTeacher(null); setShowBookingForm(false); }}
                            className="border-slate-700 text-slate-300"
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </div>
                  )}
                </Card>
              )}

              {/* My Bookings */}
              <div>
                <h3 className="text-lg font-semibold text-slate-300 mb-4">My Bookings</h3>
                {myBookings.length === 0 ? (
                  <Card className="p-6 text-center bg-slate-900 border-slate-800">
                    <CalendarDays className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-500">No bookings yet. Book your first 1:1 session!</p>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {myBookings.map((booking) => (
                      <Card key={booking.slot_id} className="p-4 bg-slate-900 border-slate-800">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-white">{booking.teacher_name}</h4>
                              <Badge className={
                                booking.status === 'approved' ? 'bg-green-600' :
                                booking.status === 'pending' ? 'bg-amber-600' :
                                booking.status === 'rejected' ? 'bg-red-600' :
                                'bg-slate-600'
                              }>
                                {booking.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-slate-400">
                              <span>{booking.date}</span>
                              <span>{booking.start_time} - {booking.end_time}</span>
                              {booking.subject && <span>{booking.subject}</span>}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {booking.status === 'approved' && booking.meeting_link && (
                              <a href={booking.meeting_link} target="_blank" rel="noopener noreferrer">
                                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                  Join
                                </Button>
                              </a>
                            )}
                            {(booking.status === 'pending' || booking.status === 'approved') && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleCancelBooking(booking.slot_id)}
                                className="border-red-800 text-red-400 hover:bg-red-900/50"
                              >
                                Cancel
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;
