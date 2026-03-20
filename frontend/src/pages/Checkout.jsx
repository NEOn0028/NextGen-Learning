import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import axios from 'axios';
import { CheckCircle, Loader2, Smartphone, QrCode, Upload, Copy, AlertCircle, Clock, ChevronRight } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Checkout = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState('payment'); // payment, verification, confirmed
  const [processing, setProcessing] = useState(false);
  const [verificationData, setVerificationData] = useState({
    utr: '',
    screenshot: null,
    screenshotPreview: null
  });
  
  const COMPANY_UPI_ID = 'ruchikejriwal28@okhdfcbank';
  const QR_CODE_URL = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=${COMPANY_UPI_ID}&pn=NextGen%20Learning&cu=INR`;
  
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
    if (!verificationData.utr || verificationData.utr.length < 6) {
      toast.error('Please enter a valid UTR/Transaction ID (minimum 6 characters)');
      return;
    }
    
    setProcessing(true);
    
    try {
      const token = localStorage.getItem('token');
      
      // Create enrollment with pending status
      await axios.post(
        `${API}/enrollments`,
        { course_id: courseId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Submit payment verification request
      const formData = new FormData();
      formData.append('course_id', courseId);
      formData.append('amount', course.price);
      formData.append('upi_id', COMPANY_UPI_ID);
      formData.append('utr', verificationData.utr);
      if (verificationData.screenshot) {
        formData.append('screenshot', verificationData.screenshot);
      }
      
      await axios.post(
        `${API}/payments/submit-verification`,
        formData,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          } 
        }
      );
      
      setStep('confirmed');
      toast.success('Payment verification submitted successfully!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to submit verification');
    } finally {
      setProcessing(false);
    }
  };
  
  const copyUpiId = () => {
    navigator.clipboard.writeText(COMPANY_UPI_ID);
    toast.success('UPI ID copied to clipboard!');
  };
  
  const openUpiApp = () => {
    const amount = course ? course.price : 0;
    const upiLink = `upi://pay?pa=${COMPANY_UPI_ID}&pn=NextGen Learning&am=${amount}&cu=INR&tn=Course Enrollment`;
    window.location.href = upiLink;
  };
  
  const handleScreenshotChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('File size should be less than 5MB');
        return;
      }
      setVerificationData({
        ...verificationData,
        screenshot: file,
        screenshotPreview: URL.createObjectURL(file)
      });
      toast.success('Screenshot uploaded');
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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {step === 'confirmed' ? (
          /* Confirmation Screen */
          <div className="text-center max-w-2xl mx-auto">
            <Card className="p-12">
              <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-6">
                <Clock className="w-10 h-10 text-amber-600" />
              </div>
              <h1 className="text-3xl font-bold heading-font mb-4" data-testid="verification-pending-heading">Payment Under Verification</h1>
              <p className="text-lg text-slate-600 mb-8">
                Your payment details have been submitted successfully. Our team will verify your payment and grant access within 2-4 hours.
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 text-left">
                <h3 className="font-semibold text-blue-900 mb-3">What happens next?</h3>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>Our team will verify your UTR/Transaction ID: <strong>{verificationData.utr}</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>You'll receive confirmation via email once verified</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>Course access will be activated in your dashboard</span>
                  </li>
                </ul>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => navigate('/student/dashboard')}
                  className="bg-blue-600 hover:bg-blue-700"
                  data-testid="go-to-dashboard-btn"
                >
                  Go to Dashboard
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => navigate('/courses')}
                  data-testid="browse-courses-btn"
                >
                  Browse More Courses
                </Button>
              </div>
              
              <div className="mt-8 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-sm font-medium text-slate-700 mb-2">Need Help?</p>
                <a href="tel:+919619974466" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  📞 +91 9619974466
                </a>
                <p className="text-xs text-slate-500 mt-1">Yatindra Mankesh Mishra</p>
              </div>
            </Card>
          </div>
        ) : step === 'verification' ? (
          /* Verification Screen */
          <div className="max-w-2xl mx-auto">
            <Card className="p-8">
              <h1 className="text-3xl font-bold heading-font mb-2" data-testid="verification-heading">Submit Payment Details</h1>
              <p className="text-slate-600 mb-8">Please provide your payment details for verification</p>
              
              <div className="space-y-6">
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-800">
                    <strong>Important:</strong> Access will be granted only after payment verification by our team (within 2-4 hours)
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="utr" className="text-base font-semibold mb-2">
                    UTR / Transaction ID <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="utr"
                    type="text"
                    placeholder="Enter 12-digit UTR number"
                    value={verificationData.utr}
                    onChange={(e) => setVerificationData({...verificationData, utr: e.target.value})}
                    className="text-lg h-12"
                    data-testid="utr-input"
                  />
                  <p className="text-sm text-slate-500 mt-1">
                    You can find this in your payment app (PhonePe/GPay/Paytm) under transaction details
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="screenshot" className="text-base font-semibold mb-2">
                    Payment Screenshot <span className="text-slate-500">(Optional but recommended)</span>
                  </Label>
                  <div className="mt-2">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 text-slate-400 mb-2" />
                        <p className="text-sm text-slate-600">
                          {verificationData.screenshot ? verificationData.screenshot.name : 'Click to upload screenshot'}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">PNG, JPG up to 5MB</p>
                      </div>
                      <input
                        id="screenshot"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleScreenshotChange}
                        data-testid="screenshot-input"
                      />
                    </label>
                  </div>
                  {verificationData.screenshotPreview && (
                    <div className="mt-3">
                      <img 
                        src={verificationData.screenshotPreview} 
                        alt="Payment screenshot preview" 
                        className="max-h-40 rounded border border-slate-200"
                      />
                    </div>
                  )}
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setStep('payment')}
                    className="flex-1"
                    data-testid="back-to-payment-btn"
                  >
                    Back to Payment
                  </Button>
                  <Button
                    onClick={handlePayment}
                    disabled={processing || !verificationData.utr}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    data-testid="submit-verification-btn"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Submit for Verification'
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        ) : (
          /* Payment Screen */
          <div>
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold heading-font mb-2" data-testid="checkout-heading">Complete Your Payment</h1>
              <p className="text-slate-600">Follow the steps below to complete your enrollment</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Order Summary */}
              <Card className="p-8 h-fit">
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
              
              {/* Payment Instructions */}
              <Card className="p-8">
                <h2 className="text-2xl font-semibold heading-font mb-6">Pay via UPI</h2>
                
                {/* Step by Step Instructions */}
                <div className="space-y-6 mb-8">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                      1
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Scan QR Code or Copy UPI ID</h3>
                      <div className="bg-white p-4 rounded-lg border border-slate-200 mb-3">
                        <img 
                          src={QR_CODE_URL} 
                          alt="UPI QR Code" 
                          className="w-48 h-48 mx-auto mb-3"
                          data-testid="qr-code"
                        />
                        <div className="flex items-center justify-between bg-blue-50 p-3 rounded">
                          <span className="font-mono text-blue-600 font-semibold text-sm">{COMPANY_UPI_ID}</span>
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
                      <Button 
                        onClick={openUpiApp}
                        variant="outline"
                        className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50"
                        data-testid="open-upi-app-btn"
                      >
                        <Smartphone className="w-4 h-4 mr-2" />
                        Open in UPI App
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                      2
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Complete Payment</h3>
                      <p className="text-sm text-slate-600">
                        Pay ₹{course.price} using PhonePe, GPay, Paytm or any UPI app
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                      3
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Submit Transaction Details</h3>
                      <p className="text-sm text-slate-600 mb-3">
                        After payment, click below to submit your UTR/Transaction ID
                      </p>
                      <Button 
                        onClick={() => setStep('verification')}
                        className="w-full bg-green-600 hover:bg-green-700 h-12"
                        data-testid="i-completed-payment-btn"
                      >
                        I Have Completed Payment
                        <ChevronRight className="w-5 h-5 ml-2" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800 flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong>Important:</strong> Do not close this page until you submit payment details. Access will be granted only after verification.
                    </span>
                  </p>
                </div>
                
                <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-sm font-medium text-slate-700 mb-2">Need Help?</p>
                  <a href="tel:+919619974466" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    📞 +91 9619974466
                  </a>
                  <p className="text-xs text-slate-500 mt-1">Yatindra Mankesh Mishra (Mon-Sat, 9 AM - 8 PM)</p>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Checkout;
