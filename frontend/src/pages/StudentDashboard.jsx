import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import axios from 'axios';
import { 
  BookOpen, Video, Calendar, MessageCircle, TrendingUp, LogOut, Menu, X, 
  Sparkles, Play, Clock, Users, CalendarDays, ChevronRight, FileText, Award, ExternalLink
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [mySessions, setMySessions] = useState([]);
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

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
      const [enrolledRes, teachersRes] = await Promise.all([
        axios.get(`${API}/student/enrolled-courses`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/teachers`)
      ]);
      
      setEnrolledCourses(enrolledRes.data);
      
      // Set teacher info (we only have one teacher now)
      if (teachersRes.data.length > 0) {
        setTeacher(teachersRes.data[0]);
      }
      
      // Get upcoming classes ONLY for enrolled courses
      const enrolledCourseIds = enrolledRes.data.map(e => e.course.course_id);
      let allUpcomingClasses = [];
      
      for (const item of enrolledRes.data) {
        if (item.live_classes) {
          const upcoming = item.live_classes
            .filter(cls => new Date(cls.scheduled_at) > new Date())
            .map(cls => ({
              ...cls,
              course_title: item.course.title,
              course_id: item.course.course_id
            }));
          allUpcomingClasses.push(...upcoming);
        }
      }
      
      // Sort by date
      allUpcomingClasses.sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at));
      setUpcomingClasses(allUpcomingClasses);
      
      // Get scheduled sessions for this student
      try {
        const sessionsRes = await axios.get(`${API}/bookings/my`, { headers: { Authorization: `Bearer ${token}` } });
        setMySessions(sessionsRes.data.filter(s => s.status === 'scheduled'));
      } catch (e) {
        setMySessions([]);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

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
            onClick={() => setActiveTab('sessions')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'sessions' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            data-testid="nav-sessions"
          >
            <CalendarDays className="w-5 h-5" />
            <span>My Sessions</span>
            {mySessions.length > 0 && (
              <Badge className="ml-auto bg-green-600 text-white">{mySessions.length}</Badge>
            )}
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
                      <p className="text-2xl font-bold text-white">{mySessions.length}</p>
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

              {/* Teacher Info Card */}
              {teacher && (
                <Card className="p-6 bg-gradient-to-r from-violet-900/50 to-blue-900/50 border-slate-800">
                  <h3 className="text-lg font-semibold text-white mb-4">Your Teacher</h3>
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-violet-600 to-blue-600 flex items-center justify-center text-white font-bold text-2xl">
                      {teacher.name?.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-white">{teacher.name}</h4>
                      {teacher.bio && (
                        <p className="text-slate-300 mt-1">{teacher.bio}</p>
                      )}
                      {teacher.subjects && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {teacher.subjects.map((subj, idx) => (
                            <Badge key={idx} className="bg-violet-600">{subj}</Badge>
                          ))}
                        </div>
                      )}
                      {teacher.class_range && (
                        <p className="text-sm text-slate-400 mt-2">Teaches: Class {teacher.class_range}</p>
                      )}
                    </div>
                  </div>
                </Card>
              )}

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
                              <Badge variant="secondary" className={cls.platform === 'zoom' ? 'bg-blue-600' : 'bg-green-600'}>
                                {cls.platform === 'zoom' ? 'Zoom' : 'Google Meet'}
                              </Badge>
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

              {/* Scheduled 1:1 Sessions */}
              {mySessions.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-white mb-4">Upcoming 1:1 Sessions</h2>
                  <div className="space-y-3">
                    {mySessions.map((session) => (
                      <Card key={session.slot_id} className="p-4 bg-slate-900 border-slate-800">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-white">{session.subject || '1:1 Session'}</h3>
                            <p className="text-sm text-slate-400">with {session.teacher_name || 'Teacher'}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm">
                              <span className="text-blue-400">{session.date}</span>
                              <span className="text-slate-400">{session.start_time} - {session.end_time}</span>
                              <Badge variant="secondary" className={session.platform === 'zoom' ? 'bg-blue-600' : 'bg-green-600'}>
                                {session.platform === 'zoom' ? 'Zoom' : 'Google Meet'}
                              </Badge>
                            </div>
                          </div>
                          {session.meeting_link && (
                            <a href={session.meeting_link} target="_blank" rel="noopener noreferrer">
                              <Button className="bg-green-600 hover:bg-green-700">
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Join
                              </Button>
                            </a>
                          )}
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
                    <BookOpen className="w-8 h-8 text-green-400" />
                    <h3 className="text-xl font-bold text-white">Explore Courses</h3>
                  </div>
                  <p className="text-slate-300 mb-4">Browse available courses in Commerce and Humanities</p>
                  <Link to="/courses">
                    <Button className="bg-green-600 hover:bg-green-700">
                      Browse Courses
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
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

          {/* Sessions Tab */}
          {activeTab === 'sessions' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">My 1:1 Sessions</h2>
              
              <Card className="p-4 bg-blue-900/30 border-blue-800">
                <p className="text-blue-300 text-sm">
                  💡 Sessions are scheduled by your teacher. When a session is scheduled for you, it will appear here with a link to join.
                </p>
              </Card>

              {mySessions.length === 0 ? (
                <Card className="p-12 text-center bg-slate-900 border-slate-800">
                  <CalendarDays className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-slate-400 mb-2">No sessions scheduled</h3>
                  <p className="text-slate-500">Your teacher will schedule 1:1 sessions for you</p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {mySessions.map((session) => (
                    <Card key={session.slot_id} className="p-4 bg-slate-900 border-slate-800">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold text-white">{session.subject || '1:1 Session'}</h3>
                            <Badge className="bg-green-600">Scheduled</Badge>
                          </div>
                          <p className="text-sm text-slate-400">with {session.teacher_name || 'Teacher'}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm">
                            <span className="text-blue-400">{session.date}</span>
                            <span className="text-slate-400">{session.start_time} - {session.end_time}</span>
                            <Badge variant="secondary" className={session.platform === 'zoom' ? 'bg-blue-600' : 'bg-green-600'}>
                              {session.platform === 'zoom' ? 'Zoom' : 'Google Meet'}
                            </Badge>
                          </div>
                          {session.notes && (
                            <p className="text-sm text-slate-500 mt-2">{session.notes}</p>
                          )}
                        </div>
                        {session.meeting_link && (
                          <a href={session.meeting_link} target="_blank" rel="noopener noreferrer">
                            <Button className="bg-green-600 hover:bg-green-700">
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Join Session
                            </Button>
                          </a>
                        )}
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

export default StudentDashboard;
