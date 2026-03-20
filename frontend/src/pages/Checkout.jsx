import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import axios from 'axios';
import { CheckCircle, Loader2 } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Checkout = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  useEffect(() => {
    checkAuthAndLoadData();
  }, [courseId]);
  
  const checkAuthAndLoadData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      
      const [userRes, courseRes] = await Promise.all([
        axios.get(`${API}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        }),
        axios.get(`${API}/courses/${courseId}`)
      ]);
      
      setUser(userRes.data);
      setCourse(courseRes.data);
    } catch (error) {
      toast.error('Failed to load checkout data');
      navigate('/courses');
    } finally {
      setLoading(false);
    }
  };
  
  const handlePayment = async () => {
    setProcessing(true);
    
    try {
      const token = localStorage.getItem('token');
      
      // Create enrollment first
      await axios.post(
        `${API}/enrollments`,
        { course_id: courseId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Create payment order (MOCKED)
      const orderRes = await axios.post(
        `${API}/payments/create-order`,
        { course_id: courseId, amount: course.price },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // For now, auto-verify the mocked payment
      await axios.post(
        `${API}/payments/verify`,
        {
          order_id: orderRes.data.order_id,
          payment_id: 'mock_payment_' + Date.now(),
          signature: 'mock_signature'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('Enrollment successful! (Payment mocked)');
      navigate('/student/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Payment failed');
    } finally {
      setProcessing(false);
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
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold heading-font mb-2" data-testid="checkout-heading">Complete Your Enrollment</h1>
          <p className="text-slate-600">You're one step away from starting your learning journey</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Order Summary */}
          <Card className="p-8">
            <h2 className="text-2xl font-semibold heading-font mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <p className="text-sm text-slate-500">Course</p>
                <p className="text-lg font-semibold">{course.title}</p>
              </div>
              
              <div>
                <p className="text-sm text-slate-500">Subject</p>
                <p className="text-lg">{course.subject}</p>
              </div>
              
              <div>
                <p className="text-sm text-slate-500">Class</p>
                <p className="text-lg">Class {course.class_level}</p>
              </div>
            </div>
            
            <div className="border-t border-slate-200 pt-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-600">Subtotal</span>
                <span className="font-semibold">₹{course.price}</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-slate-600">Taxes</span>
                <span className="font-semibold">₹0</span>
              </div>
              <div className="flex justify-between items-center text-xl">
                <span className="font-bold">Total</span>
                <span className="font-bold text-blue-600">₹{course.price}</span>
              </div>
            </div>
          </Card>
          
          {/* Payment Method */}
          <Card className="p-8">
            <h2 className="text-2xl font-semibold heading-font mb-6">Payment Method</h2>
            
            <div className="mb-6">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg mb-4">
                <p className="text-sm text-amber-800">
                  <strong>Note:</strong> Payment gateway is in demo mode. Your enrollment will be completed without actual payment.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Live & Recorded Classes</p>
                    <p className="text-sm text-slate-600">Access all course content</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Study Materials</p>
                    <p className="text-sm text-slate-600">Downloadable resources</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium">AI Doubt Assistant</p>
                    <p className="text-sm text-slate-600">24/7 instant help</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Mock Tests</p>
                    <p className="text-sm text-slate-600">Regular assessments</p>
                  </div>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={handlePayment}
              disabled={processing}
              className="w-full bg-blue-600 hover:bg-blue-700 text-lg h-12"
              data-testid="complete-enrollment-btn"
            >
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                `Complete Enrollment - ₹${course.price}`
              )}
            </Button>
            
            <p className="text-xs text-slate-500 text-center mt-4">
              By enrolling, you agree to our Terms of Service and Privacy Policy
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
