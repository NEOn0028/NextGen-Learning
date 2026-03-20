import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import axios from 'axios';
import { Search, ArrowLeft } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Courses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    class_level: '',
    stream: '',
    search: ''
  });
  
  useEffect(() => {
    loadCourses();
  }, []);
  
  useEffect(() => {
    filterCourses();
  }, [filters, courses]);
  
  const loadCourses = async () => {
    try {
      const response = await axios.get(`${API}/courses`);
      setCourses(response.data);
      setFilteredCourses(response.data);
    } catch (error) {
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };
  
  const filterCourses = () => {
    let filtered = [...courses];
    
    if (filters.class_level) {
      filtered = filtered.filter(c => c.class_level === filters.class_level);
    }
    if (filters.stream) {
      filtered = filtered.filter(c => c.stream === filters.stream);
    }
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(c => 
        c.title.toLowerCase().includes(search) ||
        c.subject.toLowerCase().includes(search)
      );
    }
    
    setFilteredCourses(filtered);
  };
  
  const getStreamColor = (stream) => {
    if (stream === 'science') return 'gradient-science';
    if (stream === 'commerce') return 'gradient-commerce';
    if (stream === 'arts') return 'gradient-arts';
    return 'gradient-brand';
  };
  
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2">
              <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <img 
                src="https://customer-assets.emergentagent.com/job_board-ready-3/artifacts/9esikr1w_ChatGPT%20Image%20Mar%209%2C%202026%2C%2001_45_09%20PM.png" 
                alt="NextGen Learning" 
                className="h-10"
              />
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/login">
                <Button variant="ghost" className="text-slate-700" data-testid="nav-login-btn">Login</Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white" data-testid="nav-signup-btn">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold heading-font mb-4" data-testid="courses-heading">Explore Courses</h1>
          <p className="text-lg text-slate-600">Find the perfect course for your learning journey</p>
        </div>
        
        {/* Filters */}
        <Card className="p-6 mb-8">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input 
                placeholder="Search courses..."
                className="pl-10"
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                data-testid="search-input"
              />
            </div>
            
            <Select value={filters.class_level} onValueChange={(value) => setFilters({...filters, class_level: value})}>
              <SelectTrigger data-testid="class-filter">
                <SelectValue placeholder="All Classes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                <SelectItem value="9">Class 9</SelectItem>
                <SelectItem value="10">Class 10</SelectItem>
                <SelectItem value="11">Class 11</SelectItem>
                <SelectItem value="12">Class 12</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filters.stream} onValueChange={(value) => setFilters({...filters, stream: value})}>
              <SelectTrigger data-testid="stream-filter">
                <SelectValue placeholder="All Streams" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Streams</SelectItem>
                <SelectItem value="science">Science</SelectItem>
                <SelectItem value="commerce">Commerce</SelectItem>
                <SelectItem value="arts">Arts</SelectItem>
                <SelectItem value="general">General</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline"
              onClick={() => setFilters({ class_level: '', stream: '', search: '' })}
              data-testid="clear-filters-btn"
            >
              Clear Filters
            </Button>
          </div>
        </Card>
        
        {/* Courses Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredCourses.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-xl text-slate-600">No courses found</p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <Card key={course.course_id} className="hover-lift overflow-hidden" data-testid={`course-card-${course.course_id}`}>
                <div className={`h-40 ${getStreamColor(course.stream)}`}></div>
                <div className="p-6">
                  <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                    Class {course.class_level} • {course.stream}
                  </div>
                  <h3 className="text-xl font-semibold heading-font mb-2">{course.title}</h3>
                  <p className="text-sm text-slate-600 mb-2">{course.subject}</p>
                  <p className="text-sm text-slate-500 mb-4 line-clamp-2">{course.description}</p>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-slate-500">Starting from</p>
                      <p className="text-2xl font-bold text-blue-600">₹{course.price}<span className="text-sm text-slate-500">/mo</span></p>
                    </div>
                  </div>
                  <Link to={`/courses/${course.course_id}`}>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700" data-testid={`view-course-btn-${course.course_id}`}>
                      View Details
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;
