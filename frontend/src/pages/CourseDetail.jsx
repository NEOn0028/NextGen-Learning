import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import axios from 'axios';
import { ArrowLeft, BookOpen, Video, Calendar, Users, User, LogOut } from 'lucide-react';
import { isAuthenticated, getUser, clearAuth } from '@/utils/auth';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    if (isAuthenticated()) {
      setUser(getUser());
    }
    loadCourseData();
  }, [courseId]);
  
  const loadCourseData = async () => {
    try {
      const courseRes = await axios.get(`${API}/courses/${courseId}`);
      setCourse(courseRes.data);
      
      const lecturesRes = await axios.get(`${API}/lectures/course/${courseId}`);
      setLectures(lecturesRes.data);
    } catch (error) {
      toast.error('Failed to load course details');
    } finally {
      setLoading(false);
    }
  };
  
  const handleEnroll = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate(`/checkout/${courseId}`);
  };
  
  const handleLogout = () => {
    clearAuth();
    setUser(null);
    toast.success('Logged out successfully');
    navigate('/courses');
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (!course) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="p-12 text-center">
          <p className="text-xl text-slate-600">Course not found</p>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/courses" className="flex items-center gap-2">
              <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <span className="text-2xl font-bold heading-font">Back to Courses</span>
            </Link>
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <Link to={`/${user.role}/dashboard`}>
                    <Button variant="ghost" className="text-slate-700 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Dashboard
                    </Button>
                  </Link>
                  <Button variant="ghost" onClick={handleLogout} className="text-slate-700">
                    <LogOut className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost" className="text-slate-700">Login</Button>
                  </Link>
                  <Link to="/signup">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">Get Started</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Course Header */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="md:col-span-2">
            <div className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">
              Class {course.class_level} • {course.stream} • {course.subject}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold heading-font mb-4" data-testid="course-title">{course.title}</h1>
            <p className="text-lg text-slate-600 mb-6">{course.description}</p>
            
            <div className="flex items-center gap-6 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span>By {course.teacher_name || 'Expert Teacher'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5" />
                <span>{lectures.length} Lectures</span>
              </div>
            </div>
          </div>
          
          {/* Enrollment Card */}
          <div>
            <Card className="p-6 sticky top-24">
              <div className="mb-6">
                <p className="text-sm text-slate-500 mb-2">Course Price</p>
                <p className="text-4xl font-bold text-blue-600 mb-1">₹{course.price}</p>
                <p className="text-sm text-slate-500">per month</p>
              </div>
              
              <Button 
                onClick={handleEnroll}
                className="w-full bg-blue-600 hover:bg-blue-700 text-lg h-12 mb-4"
                data-testid="enroll-now-btn"
              >
                Enroll Now
              </Button>
              
              <div className="space-y-3 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <Video className="w-4 h-4" />
                  <span>Live & Recorded Classes</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>Study Materials</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Weekly Tests</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
        
        {/* Course Content Tabs */}
        <Tabs defaultValue="lectures" className="w-full">
          <TabsList>
            <TabsTrigger value="lectures" data-testid="lectures-tab">Lectures</TabsTrigger>
            <TabsTrigger value="curriculum" data-testid="curriculum-tab">Curriculum</TabsTrigger>
            <TabsTrigger value="about" data-testid="about-tab">About</TabsTrigger>
          </TabsList>
          
          <TabsContent value="lectures" className="mt-6">
            {lectures.length === 0 ? (
              <Card className="p-12 text-center">
                <Video className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">No lectures available yet</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {lectures.map((lecture, idx) => (
                  <Card key={lecture.lecture_id} className="p-6 flex items-center justify-between" data-testid={`lecture-${idx}`}>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                        {idx + 1}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{lecture.title}</h3>
                        {lecture.description && <p className="text-sm text-slate-600">{lecture.description}</p>}
                      </div>
                    </div>
                    <div className="text-sm text-slate-500">
                      {lecture.duration ? `${Math.floor(lecture.duration / 60)} mins` : '-'}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="curriculum" className="mt-6">
            <Card className="p-8">
              <h3 className="text-2xl font-semibold heading-font mb-4">What You'll Learn</h3>
              <ul className="space-y-3 text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">✓</span>
                  <span>Complete syllabus coverage as per {course.class_level}th standard</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">✓</span>
                  <span>Conceptual clarity with real-world examples</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">✓</span>
                  <span>Regular practice tests and assessments</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">✓</span>
                  <span>Doubt solving sessions with expert teachers</span>
                </li>
              </ul>
            </Card>
          </TabsContent>
          
          <TabsContent value="about" className="mt-6">
            <Card className="p-8">
              <h3 className="text-2xl font-semibold heading-font mb-4">About This Course</h3>
              <p className="text-slate-600 leading-relaxed mb-6">{course.description}</p>
              <div className="border-t border-slate-200 pt-6">
                <h4 className="font-semibold mb-2">Instructor</h4>
                <p className="text-slate-600">{course.teacher_name || 'Expert Teacher'}</p>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CourseDetail;
