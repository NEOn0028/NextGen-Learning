import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import axios from 'axios';
import { Video, Upload, Calendar, FileText, Plus, Trash2, Users, Edit, Award, Clock, Save } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

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
  const [studentPerformance, setStudentPerformance] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('lectures');
  
  // Form states
  const [lectureForm, setLectureForm] = useState({ 
    title: '', 
    description: '', 
    video_url: '', 
    duration: '' 
  });
  
  const [assignmentForm, setAssignmentForm] = useState({ 
    title: '', 
    description: '', 
    due_date: '', 
    total_marks: '' 
  });
  
  const [liveClassForm, setLiveClassForm] = useState({ 
    title: '', 
    meeting_link: '', 
    platform: 'zoom', 
    scheduled_at: '', 
    duration: '' 
  });
  
  const [testForm, setTestForm] = useState({
    title: '',
    description: '',
    duration: '',
    total_marks: '',
    questions: [{ question: '', options: ['', '', '', ''], correct_answer: 0, marks: 0 }]
  });
  
  const [editingLecture, setEditingLecture] = useState(null);
  const [editingClass, setEditingClass] = useState(null);
  const [editingTest, setEditingTest] = useState(null);
  
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
      
      // Initialize student performance
      const perfData = {};
      studentsRes.data.forEach(student => {
        perfData[student.student_id] = {
          marks: '',
          remarks: '',
          attendance: '',
          progress_level: 'beginner'
        };
      });
      setStudentPerformance(perfData);
      
    } catch (error) {
      toast.error('Failed to load course data');
    } finally {
      setLoading(false);
    }
  };
  
  // Live Class Management
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
  
  const handleDeleteLiveClass = async (classId) => {
    if (!window.confirm('Are you sure you want to delete this live class?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/live-classes/${classId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Live class deleted');
      await loadCourseData();
    } catch (error) {
      toast.error('Failed to delete live class');
    }
  };
  
  // Lecture Management
  const handleAddLecture = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      if (editingLecture) {
        await axios.put(
          `${API}/lectures/${editingLecture}`,
          { ...lectureForm, course_id: courseId, duration: parseInt(lectureForm.duration) || null },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Lecture updated successfully!');
        setEditingLecture(null);
      } else {
        await axios.post(
          `${API}/lectures`,
          { ...lectureForm, course_id: courseId, duration: parseInt(lectureForm.duration) || null },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Lecture added successfully!');
      }
      
      setLectureForm({ title: '', description: '', video_url: '', duration: '' });
      await loadCourseData();
    } catch (error) {
      toast.error('Failed to save lecture');
    }
  };
  
  const handleEditLecture = (lecture) => {
    setEditingLecture(lecture.lecture_id);
    setLectureForm({
      title: lecture.title,
      description: lecture.description || '',
      video_url: lecture.video_url,
      duration: lecture.duration?.toString() || ''
    });
    setActiveTab('lectures');
  };
  
  const handleDeleteLecture = async (lectureId) => {
    if (!window.confirm('Are you sure you want to delete this lecture?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/lectures/${lectureId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Lecture deleted');
      await loadCourseData();
    } catch (error) {
      toast.error('Failed to delete lecture');
    }
  };
  
  // Mock Test Management
  const handleAddTest = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      const testData = {
        course_id: courseId,
        title: testForm.title,
        description: testForm.description,
        duration: parseInt(testForm.duration),
        total_marks: parseInt(testForm.total_marks),
        questions: testForm.questions
      };
      
      if (editingTest) {
        await axios.put(`${API}/tests/${editingTest}`, testData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Test updated successfully!');
        setEditingTest(null);
      } else {
        await axios.post(`${API}/tests`, testData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Test created successfully!');
      }
      
      setTestForm({
        title: '',
        description: '',
        duration: '',
        total_marks: '',
        questions: [{ question: '', options: ['', '', '', ''], correct_answer: 0, marks: 0 }]
      });
      await loadCourseData();
    } catch (error) {
      toast.error('Failed to save test');
    }
  };
  
  const handleDeleteTest = async (testId) => {
    if (!window.confirm('Are you sure you want to delete this test?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/tests/${testId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Test deleted');
      await loadCourseData();
    } catch (error) {
      toast.error('Failed to delete test');
    }
  };
  
  const addQuestion = () => {
    setTestForm({
      ...testForm,
      questions: [...testForm.questions, { question: '', options: ['', '', '', ''], correct_answer: 0, marks: 0 }]
    });
  };
  
  const updateQuestion = (index, field, value) => {
    const newQuestions = [...testForm.questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setTestForm({ ...testForm, questions: newQuestions });
  };
  
  const updateQuestionOption = (qIndex, oIndex, value) => {
    const newQuestions = [...testForm.questions];
    newQuestions[qIndex].options[oIndex] = value;
    setTestForm({ ...testForm, questions: newQuestions });
  };
  
  const removeQuestion = (index) => {
    const newQuestions = testForm.questions.filter((_, i) => i !== index);
    setTestForm({ ...testForm, questions: newQuestions });
  };
  
  // Student Performance Management
  const handleUpdatePerformance = (studentId, field, value) => {
    setStudentPerformance({
      ...studentPerformance,
      [studentId]: {
        ...studentPerformance[studentId],
        [field]: value
      }
    });
  };
  
  const handleSavePerformance = async (studentId) => {
    try {
      const token = localStorage.getItem('token');
      const data = studentPerformance[studentId];
      
      await axios.post(
        `${API}/teacher/update-performance`,
        {
          student_id: studentId,
          course_id: courseId,
          ...data
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('Student performance updated!');
    } catch (error) {
      toast.error('Failed to update performance');
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
                <p className="text-sm text-slate-600 mb-1">Students</p>
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
                <p className="text-sm text-slate-600 mb-1">Live Classes</p>
                <p className="text-3xl font-bold">{liveClasses.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-green-600" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Mock Tests</p>
                <p className="text-3xl font-bold">{tests.length}</p>
              </div>
              <Award className="w-8 h-8 text-amber-600" />
            </div>
          </Card>
        </div>
        
        {/* Content Management Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="lectures">Recorded Lectures</TabsTrigger>
            <TabsTrigger value="live">Live Classes</TabsTrigger>
            <TabsTrigger value="tests">Mock Tests</TabsTrigger>
            <TabsTrigger value="performance">Student Performance</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
          </TabsList>
          
          {/* Recorded Lectures Tab */}
          <TabsContent value="lectures" className="mt-6 space-y-6">
            <Card className="p-6">
              <h3 className="text-xl font-semibold heading-font mb-4">
                {editingLecture ? 'Edit Lecture' : 'Add New Recorded Lecture'}
              </h3>
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
                  <Label htmlFor="lecture-url">Video URL * (YouTube/Google Drive)</Label>
                  <Input
                    id="lecture-url"
                    value={lectureForm.video_url}
                    onChange={(e) => setLectureForm({...lectureForm, video_url: e.target.value})}
                    placeholder="https://youtube.com/watch?v=... or https://drive.google.com/..."
                    required
                  />
                  <p className="text-xs text-slate-500 mt-1">Paste YouTube video link or Google Drive shareable link</p>
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
                <div className="flex gap-3">
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    {editingLecture ? <><Save className="w-4 h-4 mr-2" />Update</> : <><Plus className="w-4 h-4 mr-2" />Add</>} Lecture
                  </Button>
                  {editingLecture && (
                    <Button type="button" variant="outline" onClick={() => {
                      setEditingLecture(null);
                      setLectureForm({ title: '', description: '', video_url: '', duration: '' });
                    }}>
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </Card>
            
            <div className="space-y-4">
              <h3 className="text-xl font-semibold heading-font">All Recorded Lectures ({lectures.length})</h3>
              {lectures.map((lecture, idx) => (
                <Card key={lecture.lecture_id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center text-violet-600 font-bold">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold mb-1">{lecture.title}</h4>
                        {lecture.description && <p className="text-sm text-slate-600 mb-2">{lecture.description}</p>}
                        <a href={lecture.video_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                          View Video →
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {lecture.duration && (
                        <Badge variant="secondary">{lecture.duration} mins</Badge>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => handleEditLecture(lecture)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700" onClick={() => handleDeleteLecture(lecture.lecture_id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
              {lectures.length === 0 && (
                <Card className="p-12 text-center">
                  <Video className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600">No recorded lectures added yet</p>
                </Card>
              )}
            </div>
          </TabsContent>
          
          {/* Live Classes Tab */}
          <TabsContent value="live" className="mt-6 space-y-6">
            <Card className="p-6">
              <h3 className="text-xl font-semibold heading-font mb-4">Schedule Live Class (Zoom/Google Meet)</h3>
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
                  <Label htmlFor="live-scheduled">Scheduled Date & Time *</Label>
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
              <h3 className="text-xl font-semibold heading-font">Scheduled Live Classes ({liveClasses.length})</h3>
              {liveClasses.map((cls) => {
                const isUpcoming = new Date(cls.scheduled_at) > new Date();
                return (
                  <Card key={cls.class_id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-lg font-semibold">{cls.title}</h4>
                          <Badge className={isUpcoming ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'}>
                            {isUpcoming ? 'Upcoming' : 'Past'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm mb-3">
                          <span className="text-slate-600">{new Date(cls.scheduled_at).toLocaleString('en-IN')}</span>
                          <span className="text-blue-600">{cls.duration} mins</span>
                          <Badge variant="secondary">{cls.platform}</Badge>
                        </div>
                        <a href={cls.meeting_link} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                          Join Meeting →
                        </a>
                      </div>
                      <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700" onClick={() => handleDeleteLiveClass(cls.class_id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                );
              })}
              {liveClasses.length === 0 && (
                <Card className="p-12 text-center">
                  <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600">No live classes scheduled yet</p>
                </Card>
              )}
            </div>
          </TabsContent>
          
          {/* Mock Tests Tab - Continuing in next part due to length */}
          <TabsContent value="tests" className="mt-6 space-y-6">
            <Card className="p-6">
              <h3 className="text-xl font-semibold heading-font mb-4">
                {editingTest ? 'Edit Mock Test' : 'Create Mock Test'}
              </h3>
              <form onSubmit={handleAddTest} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="test-title">Test Title *</Label>
                    <Input
                      id="test-title"
                      value={testForm.title}
                      onChange={(e) => setTestForm({...testForm, title: e.target.value})}
                      placeholder="e.g., Chapter 1 Mock Test"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="test-duration">Duration (minutes) *</Label>
                    <Input
                      id="test-duration"
                      type="number"
                      value={testForm.duration}
                      onChange={(e) => setTestForm({...testForm, duration: e.target.value})}
                      placeholder="60"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="test-desc">Description</Label>
                  <Textarea
                    id="test-desc"
                    value={testForm.description}
                    onChange={(e) => setTestForm({...testForm, description: e.target.value})}
                    placeholder="Test instructions and details"
                    rows={2}
                  />
                </div>
                
                <div className="border-t pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold">Questions</h4>
                    <Button type="button" size="sm" onClick={addQuestion}>
                      <Plus className="w-4 h-4 mr-1" />
                      Add Question
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {testForm.questions.map((q, qIdx) => (
                      <Card key={qIdx} className="p-4 bg-slate-50">
                        <div className="flex items-start justify-between mb-3">
                          <Label>Question {qIdx + 1}</Label>
                          {testForm.questions.length > 1 && (
                            <Button type="button" size="sm" variant="ghost" className="text-red-600" onClick={() => removeQuestion(qIdx)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                        <Input
                          value={q.question}
                          onChange={(e) => updateQuestion(qIdx, 'question', e.target.value)}
                          placeholder="Enter question"
                          className="mb-3"
                          required
                        />
                        
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          {q.options.map((opt, oIdx) => (
                            <Input
                              key={oIdx}
                              value={opt}
                              onChange={(e) => updateQuestionOption(qIdx, oIdx, e.target.value)}
                              placeholder={`Option ${oIdx + 1}`}
                              required
                            />
                          ))}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label>Correct Answer</Label>
                            <select
                              value={q.correct_answer}
                              onChange={(e) => updateQuestion(qIdx, 'correct_answer', parseInt(e.target.value))}
                              className="w-full px-3 py-2 border rounded-lg"
                            >
                              <option value={0}>Option 1</option>
                              <option value={1}>Option 2</option>
                              <option value={2}>Option 3</option>
                              <option value={3}>Option 4</option>
                            </select>
                          </div>
                          <div>
                            <Label>Marks</Label>
                            <Input
                              type="number"
                              value={q.marks}
                              onChange={(e) => updateQuestion(qIdx, 'marks', parseInt(e.target.value))}
                              placeholder="Marks"
                              required
                            />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
                
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  {editingTest ? <><Save className="w-4 h-4 mr-2" />Update</> : <><Plus className="w-4 h-4 mr-2" />Create</>} Test
                </Button>
              </form>
            </Card>
            
            <div className="space-y-4">
              <h3 className="text-xl font-semibold heading-font">All Mock Tests ({tests.length})</h3>
              {tests.map((test) => (
                <Card key={test.test_id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold mb-2">{test.title}</h4>
                      <p className="text-sm text-slate-600 mb-3">{test.description}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <Badge variant="secondary">{test.questions?.length || 0} Questions</Badge>
                        <span className="text-slate-600">{test.duration} minutes</span>
                        <span className="text-blue-600 font-medium">Total: {test.total_marks} marks</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700" onClick={() => handleDeleteTest(test.test_id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
              {tests.length === 0 && (
                <Card className="p-12 text-center">
                  <Award className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600">No mock tests created yet</p>
                </Card>
              )}
            </div>
          </TabsContent>
          
          {/* Student Performance Tab */}
          <TabsContent value="performance" className="mt-6">
            <Card className="p-6">
              <h3 className="text-xl font-semibold heading-font mb-6">Student Performance Management</h3>
              {enrolledStudents.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600">No students enrolled yet</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {enrolledStudents.map((student) => (
                    <Card key={student.student_id} className="p-6 bg-slate-50">
                      <div className="mb-4">
                        <h4 className="text-lg font-semibold">{student.student_name}</h4>
                        <p className="text-sm text-slate-600">{student.student_email}</p>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <Label>Overall Marks (%)</Label>
                          <Input
                            type="number"
                            value={studentPerformance[student.student_id]?.marks || ''}
                            onChange={(e) => handleUpdatePerformance(student.student_id, 'marks', e.target.value)}
                            placeholder="e.g., 85"
                          />
                        </div>
                        <div>
                          <Label>Attendance (%)</Label>
                          <Input
                            type="number"
                            value={studentPerformance[student.student_id]?.attendance || ''}
                            onChange={(e) => handleUpdatePerformance(student.student_id, 'attendance', e.target.value)}
                            placeholder="e.g., 90"
                          />
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <Label>Progress Level</Label>
                        <select
                          value={studentPerformance[student.student_id]?.progress_level || 'beginner'}
                          onChange={(e) => handleUpdatePerformance(student.student_id, 'progress_level', e.target.value)}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                        >
                          <option value="beginner">Beginner</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="advanced">Advanced</option>
                          <option value="excellent">Excellent</option>
                        </select>
                      </div>
                      
                      <div className="mb-4">
                        <Label>Remarks / Feedback</Label>
                        <Textarea
                          value={studentPerformance[student.student_id]?.remarks || ''}
                          onChange={(e) => handleUpdatePerformance(student.student_id, 'remarks', e.target.value)}
                          placeholder="Add feedback about student's performance..."
                          rows={3}
                        />
                      </div>
                      
                      <Button onClick={() => handleSavePerformance(student.student_id)} className="bg-green-600 hover:bg-green-700">
                        <Save className="w-4 h-4 mr-2" />
                        Save Performance
                      </Button>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
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
        </Tabs>
      </div>
    </div>
  );
};

export default ManageCourse;
