import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import axios from 'axios';
import { Video, Upload, Calendar, FileText, Plus, Trash2, Users } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ManageCourse = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [lectures, setLectures] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [liveClasses, setLiveClasses] = useState([]);
  const [tests, setTests] = useState([]);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [lectureForm, setLectureForm] = useState({ title: '', description: '', video_url: '', duration: '' });
  const [assignmentForm, setAssignmentForm] = useState({ title: '', description: '', due_date: '', total_marks: '' });
  const [liveClassForm, setLiveClassForm] = useState({ title: '', meeting_link: '', platform: 'zoom', scheduled_at: '', duration: '' });
  
  useEffect(() => {
    loadCourseData();
  }, [courseId]);
  
  const loadCourseData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const [courseRes, lecturesRes, assignmentsRes, liveClassesRes, testsRes, studentsRes] = await Promise.all([
        axios.get(`${API}/courses/${courseId}`),
        axios.get(`${API}/lectures/course/${courseId}`),
        axios.get(`${API}/assignments/course/${courseId}`),
        axios.get(`${API}/live-classes/course/${courseId}`),
        axios.get(`${API}/tests/course/${courseId}`),
        axios.get(`${API}/enrollments/course/${courseId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      
      setCourse(courseRes.data);
      setLectures(lecturesRes.data);
      setAssignments(assignmentsRes.data);
      setLiveClasses(liveClassesRes.data);
      setTests(testsRes.data);
      setEnrolledStudents(studentsRes.data);
    } catch (error) {
      toast.error('Failed to load course data');
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddLecture = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API}/lectures`,
        { ...lectureForm, course_id: courseId, duration: parseInt(lectureForm.duration) || null },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('Lecture added successfully!');
      setLectureForm({ title: '', description: '', video_url: '', duration: '' });
      await loadCourseData();
    } catch (error) {
      toast.error('Failed to add lecture');
    }
  };
  
  const handleAddAssignment = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API}/assignments`,
        { 
          ...assignmentForm, 
          course_id: courseId,
          due_date: new Date(assignmentForm.due_date).toISOString(),
          total_marks: parseInt(assignmentForm.total_marks)
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('Assignment added successfully!');
      setAssignmentForm({ title: '', description: '', due_date: '', total_marks: '' });
      await loadCourseData();
    } catch (error) {
      toast.error('Failed to add assignment');
    }
  };
  
  const handleAddLiveClass = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API}/live-classes`,
        { 
          ...liveClassForm, 
          course_id: courseId,
          scheduled_at: new Date(liveClassForm.scheduled_at).toISOString(),
          duration: parseInt(liveClassForm.duration)
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('Live class scheduled successfully!');
      setLiveClassForm({ title: '', meeting_link: '', platform: 'zoom', scheduled_at: '', duration: '' });
      await loadCourseData();
    } catch (error) {
      toast.error('Failed to schedule live class');
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button onClick={() => navigate('/teacher/dashboard')} variant="ghost" className="mb-4">
            ← Back to Dashboard
          </Button>
          <h1 className="text-4xl font-bold heading-font mb-2">{course?.title}</h1>
          <p className="text-slate-600">{course?.subject} • Class {course?.class_level}</p>
        </div>
        
        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Enrolled Students</p>
                <p className="text-3xl font-bold">{enrolledStudents.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Lectures</p>
                <p className="text-3xl font-bold">{lectures.length}</p>
              </div>
              <Video className="w-8 h-8 text-violet-600" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Assignments</p>
                <p className="text-3xl font-bold">{assignments.length}</p>
              </div>
              <FileText className="w-8 h-8 text-green-600" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Live Classes</p>
                <p className="text-3xl font-bold">{liveClasses.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-amber-600" />
            </div>
          </Card>
        </div>
        
        {/* Content Management Tabs */}
        <Tabs defaultValue="lectures" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="lectures">Lectures</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="live">Live Classes</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
          </TabsList>
          
          {/* Lectures Tab */}
          <TabsContent value="lectures" className="mt-6 space-y-6">
            <Card className="p-6">
              <h3 className="text-xl font-semibold heading-font mb-4">Add New Lecture</h3>
              <form onSubmit={handleAddLecture} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="lecture-title">Lecture Title *</Label>
                    <Input
                      id="lecture-title"
                      value={lectureForm.title}
                      onChange={(e) => setLectureForm({...lectureForm, title: e.target.value})}
                      placeholder="e.g., Introduction to Algebra"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lecture-duration">Duration (minutes)</Label>
                    <Input
                      id="lecture-duration"
                      type="number"
                      value={lectureForm.duration}
                      onChange={(e) => setLectureForm({...lectureForm, duration: e.target.value})}
                      placeholder="45"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="lecture-url">Video URL *</Label>
                  <Input
                    id="lecture-url"
                    value={lectureForm.video_url}
                    onChange={(e) => setLectureForm({...lectureForm, video_url: e.target.value})}
                    placeholder="https://youtube.com/watch?v=..."
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lecture-desc">Description</Label>
                  <Textarea
                    id="lecture-desc"
                    value={lectureForm.description}
                    onChange={(e) => setLectureForm({...lectureForm, description: e.target.value})}
                    placeholder="What will students learn in this lecture?"
                    rows={3}
                  />
                </div>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Lecture
                </Button>
              </form>
            </Card>
            
            <div className="space-y-4">
              <h3 className="text-xl font-semibold heading-font">All Lectures ({lectures.length})</h3>
              {lectures.map((lecture, idx) => (
                <Card key={lecture.lecture_id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center text-violet-600 font-bold">
                        {idx + 1}
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold mb-1">{lecture.title}</h4>
                        {lecture.description && <p className="text-sm text-slate-600 mb-2">{lecture.description}</p>}
                        <a href={lecture.video_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                          View Video →
                        </a>
                      </div>
                    </div>
                    {lecture.duration && (
                      <span className="text-sm text-slate-500">{lecture.duration} mins</span>
                    )}
                  </div>
                </Card>
              ))}
              {lectures.length === 0 && (
                <Card className="p-12 text-center">
                  <Video className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600">No lectures added yet</p>
                </Card>
              )}
            </div>
          </TabsContent>
          
          {/* Assignments Tab */}
          <TabsContent value="assignments" className="mt-6 space-y-6">
            <Card className="p-6">
              <h3 className="text-xl font-semibold heading-font mb-4">Create New Assignment</h3>
              <form onSubmit={handleAddAssignment} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="assignment-title">Assignment Title *</Label>
                    <Input
                      id="assignment-title"
                      value={assignmentForm.title}
                      onChange={(e) => setAssignmentForm({...assignmentForm, title: e.target.value})}
                      placeholder="e.g., Chapter 1 Practice Problems"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="assignment-marks">Total Marks *</Label>
                    <Input
                      id="assignment-marks"
                      type="number"
                      value={assignmentForm.total_marks}
                      onChange={(e) => setAssignmentForm({...assignmentForm, total_marks: e.target.value})}
                      placeholder="100"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="assignment-due">Due Date *</Label>
                  <Input
                    id="assignment-due"
                    type="datetime-local"
                    value={assignmentForm.due_date}
                    onChange={(e) => setAssignmentForm({...assignmentForm, due_date: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="assignment-desc">Instructions *</Label>
                  <Textarea
                    id="assignment-desc"
                    value={assignmentForm.description}
                    onChange={(e) => setAssignmentForm({...assignmentForm, description: e.target.value})}
                    placeholder="Describe the assignment requirements..."
                    rows={4}
                    required
                  />
                </div>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Assignment
                </Button>
              </form>
            </Card>
            
            <div className="space-y-4">
              <h3 className="text-xl font-semibold heading-font">All Assignments ({assignments.length})</h3>
              {assignments.map((assignment) => (
                <Card key={assignment.assignment_id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-semibold mb-1">{assignment.title}</h4>
                      <p className="text-sm text-slate-600 mb-2">{assignment.description}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-slate-500">Due: {new Date(assignment.due_date).toLocaleString('en-IN')}</span>
                        <span className="text-blue-600 font-medium">Max: {assignment.total_marks} marks</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
              {assignments.length === 0 && (
                <Card className="p-12 text-center">
                  <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600">No assignments created yet</p>
                </Card>
              )}
            </div>
          </TabsContent>
          
          {/* Live Classes Tab */}
          <TabsContent value="live" className="mt-6 space-y-6">
            <Card className="p-6">
              <h3 className="text-xl font-semibold heading-font mb-4">Schedule Live Class</h3>
              <form onSubmit={handleAddLiveClass} className="space-y-4">
                <div>
                  <Label htmlFor="live-title">Class Title *</Label>
                  <Input
                    id="live-title"
                    value={liveClassForm.title}
                    onChange={(e) => setLiveClassForm({...liveClassForm, title: e.target.value})}
                    placeholder="e.g., Weekly Doubt Solving Session"
                    required
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="live-platform">Platform *</Label>
                    <select
                      id="live-platform"
                      value={liveClassForm.platform}
                      onChange={(e) => setLiveClassForm({...liveClassForm, platform: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                      required
                    >
                      <option value="zoom">Zoom</option>
                      <option value="meet">Google Meet</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="live-duration">Duration (minutes) *</Label>
                    <Input
                      id="live-duration"
                      type="number"
                      value={liveClassForm.duration}
                      onChange={(e) => setLiveClassForm({...liveClassForm, duration: e.target.value})}
                      placeholder="60"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="live-link">Meeting Link *</Label>
                  <Input
                    id="live-link"
                    value={liveClassForm.meeting_link}
                    onChange={(e) => setLiveClassForm({...liveClassForm, meeting_link: e.target.value})}
                    placeholder="https://zoom.us/j/... or https://meet.google.com/..."
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="live-scheduled">Scheduled Time *</Label>
                  <Input
                    id="live-scheduled"
                    type="datetime-local"
                    value={liveClassForm.scheduled_at}
                    onChange={(e) => setLiveClassForm({...liveClassForm, scheduled_at: e.target.value})}
                    required
                  />
                </div>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Schedule Class
                </Button>
              </form>
            </Card>
            
            <div className="space-y-4">
              <h3 className="text-xl font-semibold heading-font">Scheduled Classes ({liveClasses.length})</h3>
              {liveClasses.map((cls) => (
                <Card key={cls.class_id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-lg font-semibold mb-1">{cls.title}</h4>
                      <div className="flex items-center gap-4 text-sm mb-3">
                        <span className="text-slate-600">{new Date(cls.scheduled_at).toLocaleString('en-IN')}</span>
                        <span className="text-blue-600">{cls.duration} mins</span>
                        <span className="px-2 py-1 bg-violet-100 text-violet-700 rounded text-xs font-medium">{cls.platform}</span>
                      </div>
                      <a href={cls.meeting_link} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                        Join Meeting →
                      </a>
                    </div>
                  </div>
                </Card>
              ))}
              {liveClasses.length === 0 && (
                <Card className="p-12 text-center">
                  <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600">No live classes scheduled yet</p>
                </Card>
              )}
            </div>
          </TabsContent>
          
          {/* Students Tab */}
          <TabsContent value="students" className="mt-6">
            <Card className="p-6">
              <h3 className="text-xl font-semibold heading-font mb-4">Enrolled Students ({enrolledStudents.length})</h3>
              {enrolledStudents.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600">No students enrolled yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {enrolledStudents.map((student) => (
                    <div key={student.enrollment_id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-medium">{student.student_name}</p>
                        <p className="text-sm text-slate-600">{student.student_email}</p>
                      </div>
                      <span className="text-xs text-slate-500">
                        Enrolled: {new Date(student.enrolled_at).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ManageCourse;
