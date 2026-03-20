import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import axios from 'axios';
import { Users, BookOpen, DollarSign, TrendingUp, LogOut, Menu, X, CheckCircle, XCircle, Clock, Eye } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [allPayments, setAllPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  useEffect(() => {
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
        
        if (response.data.role !== 'admin') {
          navigate('/student/dashboard');
          return;
        }
        
        setUser(response.data);
        await loadDashboardData(token);
      } catch (error) {
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [navigate]);
  
  const loadDashboardData = async (token) => {
    try {
      const [analyticsRes, paymentsRes] = await Promise.all([
        axios.get(`${API}/admin/analytics`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API}/admin/payment-verifications`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      
      setAnalytics(analyticsRes.data);
      setAllPayments(paymentsRes.data);
      setPendingPayments(paymentsRes.data.filter(p => p.status === 'pending'));
    } catch (error) {
      toast.error('Failed to load dashboard data');
    }
  };
  
  const handleApprovePayment = async (verificationId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API}/admin/approve-payment/${verificationId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('Payment approved! Course access granted.');
      await loadDashboardData(token);
    } catch (error) {
      toast.error('Failed to approve payment');
    }
  };
  
  const handleRejectPayment = async (verificationId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API}/admin/reject-payment/${verificationId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('Payment rejected');
      await loadDashboardData(token);
    } catch (error) {
      toast.error('Failed to reject payment');
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
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
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <img 
              src="https://customer-assets.emergentagent.com/job_board-ready-3/artifacts/9esikr1w_ChatGPT%20Image%20Mar%209%2C%202026%2C%2001_45_09%20PM.png" 
              alt="NextGen Learning" 
              className="h-8"
            />
            <span className="font-bold heading-font text-xl">NextGen Learning</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${activeTab === 'overview' ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-100 text-slate-700'} font-medium`}
            data-testid="sidebar-overview-btn"
          >
            <TrendingUp className="w-5 h-5" />
            <span>Overview</span>
          </button>
          <button 
            onClick={() => setActiveTab('payments')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${activeTab === 'payments' ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-100 text-slate-700'} font-medium`}
            data-testid="sidebar-payments-btn"
          >
            <DollarSign className="w-5 h-5" />
            <span>Payment Verification</span>
            {pendingPayments.length > 0 && (
              <Badge className="ml-auto bg-red-500">{pendingPayments.length}</Badge>
            )}
          </button>
        </nav>
        
        <div className="absolute bottom-0 w-full p-4 border-t border-slate-200">
          <Button onClick={handleLogout} variant="ghost" className="w-full justify-start text-slate-700" data-testid="sidebar-logout-btn">
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </Button>
        </div>
      </aside>
      
      <div className="md:pl-64">
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200 h-16 flex items-center px-6">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden mr-4">
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold heading-font" data-testid="dashboard-title">Admin Dashboard</h1>
        </header>
        
        <main className="p-6 space-y-6">
          {activeTab === 'overview' && analytics && (
            <>
              <div className="grid md:grid-cols-4 gap-6">
                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Total Users</p>
                      <p className="text-3xl font-bold heading-font" data-testid="stat-users">{analytics.total_users}</p>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                      <Users className="w-6 h-6" />
                    </div>
                  </div>
                </Card>
                
                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Total Courses</p>
                      <p className="text-3xl font-bold heading-font" data-testid="stat-courses">{analytics.total_courses}</p>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-violet-100 flex items-center justify-center text-violet-600">
                      <BookOpen className="w-6 h-6" />
                    </div>
                  </div>
                </Card>
                
                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Enrollments</p>
                      <p className="text-3xl font-bold heading-font" data-testid="stat-enrollments">{analytics.total_enrollments}</p>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                  </div>
                </Card>
                
                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Pending Payments</p>
                      <p className="text-3xl font-bold heading-font text-amber-600" data-testid="stat-pending">{pendingPayments.length}</p>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
                      <Clock className="w-6 h-6" />
                    </div>
                  </div>
                </Card>
              </div>
              
              <Card className="p-6">
                <h2 className="text-2xl font-semibold heading-font mb-4">Recent Activity</h2>
                <p className="text-slate-600">Platform analytics and user activity overview</p>
              </Card>
            </>
          )}
          
          {activeTab === 'payments' && (
            <div>
              <div className="mb-6">
                <h2 className="text-3xl font-bold heading-font mb-2">Payment Verification</h2>
                <p className="text-slate-600">Review and approve student payment submissions</p>
              </div>
              
              <Tabs defaultValue="pending" className="w-full">
                <TabsList>
                  <TabsTrigger value="pending" data-testid="pending-tab">
                    Pending ({pendingPayments.length})
                  </TabsTrigger>
                  <TabsTrigger value="all" data-testid="all-tab">
                    All Payments ({allPayments.length})
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="pending" className="mt-6">
                  {pendingPayments.length === 0 ? (
                    <Card className="p-12 text-center">
                      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                      <h3 className="text-xl font-medium text-slate-600 mb-2">All Caught Up!</h3>
                      <p className="text-slate-500">No pending payment verifications</p>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {pendingPayments.map((payment) => (
                        <Card key={payment.verification_id} className="p-6" data-testid={`payment-${payment.verification_id}`}>
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-xl font-semibold mb-1">{payment.student_name}</h3>
                              <p className="text-sm text-slate-600">{payment.student_email}</p>
                            </div>
                            <Badge className="bg-amber-100 text-amber-800">Pending</Badge>
                          </div>
                          
                          <div className="grid md:grid-cols-2 gap-4 mb-4 p-4 bg-slate-50 rounded-lg">
                            <div>
                              <p className="text-sm text-slate-500">Amount</p>
                              <p className="text-lg font-bold text-blue-600">₹{payment.amount}</p>
                            </div>
                            <div>
                              <p className="text-sm text-slate-500">UTR/Transaction ID</p>
                              <p className="text-lg font-mono font-semibold">{payment.utr}</p>
                            </div>
                            <div>
                              <p className="text-sm text-slate-500">UPI ID</p>
                              <p className="text-sm">{payment.upi_id}</p>
                            </div>
                            <div>
                              <p className="text-sm text-slate-500">Submitted</p>
                              <p className="text-sm">{new Date(payment.submitted_at).toLocaleString('en-IN')}</p>
                            </div>
                          </div>
                          
                          {payment.has_screenshot && (
                            <div className="mb-4">
                              <p className="text-sm text-slate-500 mb-2">Payment Screenshot:</p>
                              <Badge className="bg-green-100 text-green-800">Screenshot Uploaded</Badge>
                            </div>
                          )}
                          
                          <div className="flex gap-3">
                            <Button 
                              onClick={() => handleApprovePayment(payment.verification_id)}
                              className="flex-1 bg-green-600 hover:bg-green-700"
                              data-testid={`approve-btn-${payment.verification_id}`}
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Approve & Grant Access
                            </Button>
                            <Button 
                              onClick={() => handleRejectPayment(payment.verification_id)}
                              variant="outline"
                              className="flex-1 border-red-600 text-red-600 hover:bg-red-50"
                              data-testid={`reject-btn-${payment.verification_id}`}
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Reject
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="all" className="mt-6">
                  <div className="space-y-4">
                    {allPayments.map((payment) => (
                      <Card key={payment.verification_id} className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold">{payment.student_name}</h3>
                              <Badge className={
                                payment.status === 'verified' ? 'bg-green-100 text-green-800' :
                                payment.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                'bg-amber-100 text-amber-800'
                              }>
                                {payment.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-600">{payment.student_email}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-blue-600">₹{payment.amount}</p>
                            <p className="text-xs text-slate-500">{payment.utr}</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
