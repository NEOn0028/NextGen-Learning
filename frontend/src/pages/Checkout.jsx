import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import axios from 'axios';
import { CheckCircle, Loader2, Smartphone, QrCode, Upload, Copy } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Checkout = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [upiId, setUpiId] = useState('');
  const [transactionId, setTransactionId] = useState('');
  
  const COMPANY_UPI_ID = 'nextgenlearning@paytm'; // Replace with actual UPI ID
  
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
    if (paymentMethod === 'upi' && !transactionId) {
      toast.error('Please enter UPI transaction ID');
      return;
    }
    
    setProcessing(true);
    
    try {
      const token = localStorage.getItem('token');
      
      // Create enrollment first
      await axios.post(
        `${API}/enrollments`,
        { course_id: courseId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Create payment order
      const orderRes = await axios.post(
        `${API}/payments/create-order`,
        { 
          course_id: courseId, 
          amount: course.price,
          payment_method: paymentMethod,
          upi_transaction_id: transactionId || null
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Auto-verify for demo (in production, admin would verify manually)
      await axios.post(
        `${API}/payments/verify`,
        {
          order_id: orderRes.data.order_id,
          payment_id: transactionId || 'upi_' + Date.now(),
          signature: 'upi_signature',
          payment_method: paymentMethod
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('Payment submitted successfully! Your enrollment is being processed.');
      navigate('/student/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };
  
  const copyUpiId = () => {
    navigator.clipboard.writeText(COMPANY_UPI_ID);
    toast.success('UPI ID copied to clipboard!');
  };
  
  const openUpiApp = () => {
    const upiLink = `upi://pay?pa=${COMPANY_UPI_ID}&pn=NextGen Learning&am=${course.price}&cu=INR&tn=Course Enrollment - ${course.title}`;
    window.location.href = upiLink;
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
            
            <Tabs value={paymentMethod} onValueChange={setPaymentMethod} className="mb-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upi" data-testid="upi-tab">
                  <Smartphone className="w-4 h-4 mr-2" />
                  UPI Payment
                </TabsTrigger>
                <TabsTrigger value="qr" data-testid="qr-tab">
                  <QrCode className="w-4 h-4 mr-2" />
                  QR Code
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="upi" className="mt-6 space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 mb-2">Pay via UPI</p>
                  <div className="flex items-center justify-between bg-white p-3 rounded border border-blue-200">
                    <span className="font-mono text-blue-600 font-semibold">{COMPANY_UPI_ID}</span>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={copyUpiId}
                      className="text-blue-600 hover:text-blue-700"
                      data-testid="copy-upi-btn"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Button 
                    onClick={openUpiApp}
                    variant="outline"
                    className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50"
                    data-testid="open-upi-app-btn"
                  >
                    <Smartphone className="w-4 h-4 mr-2" />
                    Open in UPI App (PhonePe/GPay/Paytm)
                  </Button>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-slate-500">After payment</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Enter UPI Transaction ID
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., 123456789012"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      data-testid="transaction-id-input"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      You'll receive this in your payment app after successful payment
                    </p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="qr" className="mt-6">
                <div className="text-center space-y-4">
                  <div className="w-64 h-64 mx-auto bg-slate-100 rounded-lg flex items-center justify-center border-2 border-slate-300">
                    <div className="text-center">
                      <QrCode className="w-16 h-16 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm text-slate-600">Scan with any UPI app</p>
                      <p className="text-xs text-slate-500 mt-1">PhonePe, GPay, Paytm</p>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-800">
                      <strong>Note:</strong> After scanning and completing payment, enter the transaction ID below
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      UPI Transaction ID
                    </label>
                    <input
                      type="text"
                      placeholder="Enter transaction ID from your UPI app"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      data-testid="qr-transaction-id-input"
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="mb-6 space-y-3 pt-6 border-t border-slate-200">
              <p className="font-medium text-slate-900 mb-3">What you get:</p>
              <div className="space-y-3">
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
            
            <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-sm font-medium text-slate-700 mb-2">Need Help?</p>
              <p className="text-sm text-slate-600 mb-2">Contact us for payment assistance:</p>
              <a href="tel:+919619974466" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                📞 +91 9619974466
              </a>
              <p className="text-xs text-slate-500 mt-1">Yatindra Mankesh Mishra</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
