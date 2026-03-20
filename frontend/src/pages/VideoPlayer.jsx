import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import axios from 'axios';
import { ArrowLeft, Play } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const VideoPlayer = () => {
  const { lectureId } = useParams();
  const navigate = useNavigate();
  const [lecture, setLecture] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      await loadLecture();
    };
    
    checkAuth();
  }, [lectureId, navigate]);
  
  const loadLecture = async () => {
    try {
      const response = await axios.get(`${API}/lectures/${lectureId}`);
      setLecture(response.data);
    } catch (error) {
      toast.error('Failed to load lecture');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!lecture) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Card className="p-12 text-center">
          <p className="text-xl text-slate-600">Lecture not found</p>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
            data-testid="back-btn"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
        </div>
      </header>
      
      {/* Video Player */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold heading-font mb-2" data-testid="lecture-title">{lecture.title}</h1>
          {lecture.description && (
            <p className="text-slate-400">{lecture.description}</p>
          )}
        </div>
        
        {/* Video Container */}
        <div className="aspect-video bg-slate-800 rounded-lg overflow-hidden mb-8 flex items-center justify-center">
          {lecture.video_url ? (
            <video 
              controls 
              className="w-full h-full"
              src={lecture.video_url}
              data-testid="video-player"
            >
              Your browser does not support video playback.
            </video>
          ) : (
            <div className="text-center text-slate-400">
              <Play className="w-16 h-16 mx-auto mb-4" />
              <p>Video not available</p>
            </div>
          )}
        </div>
        
        {/* Lecture Info */}
        <Card className="p-6 bg-slate-800 border-slate-700">
          <h2 className="text-xl font-semibold mb-4">About this lecture</h2>
          <div className="space-y-2 text-slate-300">
            {lecture.duration && (
              <p>Duration: {Math.floor(lecture.duration / 60)} minutes</p>
            )}
            <p>Uploaded: {new Date(lecture.uploaded_at).toLocaleDateString('en-IN')}</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default VideoPlayer;
