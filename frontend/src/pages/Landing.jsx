import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle, Star, TrendingUp, MessageCircle, Award, Shield, RefreshCw, Phone, ArrowRight, Play, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { isAuthenticated, getUser } from '@/utils/auth';

const Landing = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    if (isAuthenticated()) {
      setUser(getUser());
    }
  }, []);
  
  const teachers = [
    { name: 'Priya Sharma', qualification: 'M.Sc Mathematics, IIT Delhi', experience: '8 years', subject: 'Mathematics', rating: 5 },
    { name: 'Rajesh Kumar', qualification: 'MBA, CA Finalist', experience: '6 years', subject: 'Commerce', rating: 5 },
    { name: 'Anjali Verma', qualification: 'M.A Political Science, DU', experience: '7 years', subject: 'Humanities', rating: 5 }
  ];
  
  const results = [
    { name: 'Rahul M.', class: 'Class 12 Commerce', before: '65%', after: '89%', improvement: '+24%' },
    { name: 'Priya S.', class: 'Class 11 Humanities', before: '58%', after: '84%', improvement: '+26%' },
    { name: 'Arjun K.', class: 'Class 10 CBSE', before: '72%', after: '91%', improvement: '+19%' }
  ];
  
  const testimonials = [
    { parent: 'Mrs. Sharma', student: 'Rahul (Class 12)', text: 'My son\'s performance improved dramatically. The personal attention makes all the difference!', rating: 5 },
    { parent: 'Mr. Kumar', student: 'Priya (Class 11)', text: 'Best investment for our daughter\'s education. Teachers are excellent and very supportive.', rating: 5 },
    { parent: 'Mrs. Verma', student: 'Arjun (Class 10)', text: 'Weekly reports help us track progress. The dedicated mentor approach really works!', rating: 5 }
  ];
  
  return (
    <div className="min-h-screen bg-slate-950">
      {/* WhatsApp Floating Button */}
      <a 
        href="https://wa.me/919619974466?text=Hello! I'm interested in NextGen Learning courses" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform"
        data-testid="whatsapp-button"
      >
        <MessageCircle className="w-7 h-7 text-white" />
      </a>
      
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <img 
                src="https://customer-assets.emergentagent.com/job_board-ready-3/artifacts/9esikr1w_ChatGPT%20Image%20Mar%209%2C%202026%2C%2001_45_09%20PM.png" 
                alt="NextGen Learning" 
                className="h-12 rounded-lg"
                style={{ mixBlendMode: 'screen' }}
              />
              <span className="text-2xl font-bold heading-font text-white">NextGen Learning</span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <a href="#courses" className="text-slate-300 hover:text-white font-medium transition-colors">Courses</a>
              <a href="#teachers" className="text-slate-300 hover:text-white font-medium transition-colors">Teachers</a>
              <a href="#results" className="text-slate-300 hover:text-white font-medium transition-colors">Results</a>
              <a href="#contact" className="text-slate-300 hover:text-white font-medium transition-colors">Contact</a>
              {user ? (
                <Link to={`/${user.role}/dashboard`}>
                  <Button className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white shadow-lg">
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost" className="text-white hover:text-blue-400">Login</Button>
                  </Link>
                  <Link to="/signup">
                    <Button className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white shadow-lg">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-violet-900/20 to-slate-950"></div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-6 bg-blue-500/20 text-blue-300 border-blue-500/30">
                Premium 1-on-1 Mentorship
              </Badge>
              <h1 className="text-5xl md:text-6xl font-bold heading-font text-white mb-6 leading-tight" data-testid="hero-heading">
                Get a Personal Teacher for Your Child –{' '}
                <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                  Guaranteed Academic Improvement
                </span>
              </h1>
              <p className="text-xl text-slate-300 mb-8">
                1-on-1 mentorship for Classes 9–12 with real results
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  'Dedicated Personal Teacher',
                  'Weekly Tests & Reports',
                  'Doubt Solving Anytime',
                  'Limited Students Per Teacher'
                ].map((benefit, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-slate-200">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
              
              <div className="flex flex-wrap gap-4">
                <Link to="/signup">
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white shadow-2xl px-8 h-14 text-lg">
                    Book Free Demo Class
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/courses">
                  <Button size="lg" variant="outline" className="border-2 border-slate-700 text-white hover:bg-slate-800 h-14 px-8 text-lg">
                    Start Learning
                  </Button>
                </Link>
              </div>
              
              <div className="mt-8 flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  <span className="text-slate-300">500+ Happy Students</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <span className="text-slate-300">4.9/5 Rating</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-violet-600 rounded-2xl blur-3xl opacity-20"></div>
              <img 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800" 
                alt="Students learning" 
                className="relative rounded-2xl shadow-2xl border border-slate-800"
              />
              <div className="absolute bottom-6 left-6 right-6 bg-slate-900/90 backdrop-blur-lg border border-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Success Rate</p>
                    <p className="text-2xl font-bold text-white">95%</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Why Section */}
      <section className="py-20 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold heading-font text-white mb-4">
              Why Choose NextGen Learning?
            </h2>
            <p className="text-xl text-slate-400">Personalized education that delivers results</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: <Award className="w-8 h-8" />, title: 'Customized Study Plans', desc: 'Tailored to your child\'s learning pace and goals' },
              { icon: <TrendingUp className="w-8 h-8" />, title: 'Weekly Performance Tracking', desc: 'Detailed reports sent to parents every week' },
              { icon: <CheckCircle className="w-8 h-8" />, title: 'Concept Clarity + Exam Strategy', desc: 'Focus on understanding, not just memorization' },
              { icon: <MessageCircle className="w-8 h-8" />, title: 'Parent Updates', desc: 'Regular communication about progress' }
            ].map((item, idx) => (
              <Card key={idx} className="p-6 bg-slate-800/50 border-slate-700 hover-lift">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 flex items-center justify-center text-white mb-4">
                  {item.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-slate-400">{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* Courses & Pricing */}
      <section id="courses" className="py-20 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold heading-font text-white mb-4">
              Choose Your Plan
            </h2>
            <p className="text-xl text-slate-400">Premium 1-on-1 mentorship starting from ₹6,999/month</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              { title: 'Class 9-12 (General)', price: '₹6,999', popular: false },
              { title: 'Class 11-12 Humanities', price: '₹7,999', popular: true },
              { title: 'Class 11-12 Commerce', price: '₹9,999', popular: false }
            ].map((plan, idx) => (
              <Card key={idx} className={`p-8 ${plan.popular ? 'bg-gradient-to-br from-blue-900/50 to-violet-900/50 border-blue-500/50 ring-2 ring-blue-500/30' : 'bg-slate-800/50 border-slate-700'} relative overflow-hidden hover-lift`}>
                {plan.popular && (
                  <Badge className="absolute top-4 right-4 bg-gradient-to-r from-blue-600 to-violet-600 text-white">
                    Most Popular
                  </Badge>
                )}
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.title}</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-white">{plan.price}</span>
                    <span className="text-slate-400">/month</span>
                  </div>
                </div>
                
                <div className="space-y-4 mb-8">
                  {[
                    'Dedicated Personal Mentor',
                    'Weekly Tests & Analysis',
                    'Performance Reports to Parents',
                    'Unlimited Doubt Support',
                    'Study Materials Included',
                    'Live Classes + Recordings'
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-3 text-slate-200">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                
                <Link to="/signup">
                  <Button className={`w-full h-12 ${plan.popular ? 'bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700' : 'bg-slate-700 hover:bg-slate-600'} text-white`}>
                    Enroll Now
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* Teachers Section */}
      <section id="teachers" className="py-20 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold heading-font text-white mb-4">
              Learn from India's Best Teachers
            </h2>
            <p className="text-xl text-slate-400">Expert educators with proven track records</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {teachers.map((teacher, idx) => (
              <Card key={idx} className="p-6 bg-slate-800/50 border-slate-700 hover-lift text-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-600 to-violet-600 flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
                  {teacher.name.charAt(0)}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{teacher.name}</h3>
                <p className="text-blue-400 mb-2">{teacher.subject}</p>
                <p className="text-sm text-slate-400 mb-1">{teacher.qualification}</p>
                <p className="text-sm text-slate-500 mb-3">{teacher.experience} experience</p>
                <div className="flex items-center justify-center gap-1">
                  {[...Array(teacher.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* Student Results */}
      <section id="results" className="py-20 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold heading-font text-white mb-4">
              Real Results from Real Students
            </h2>
            <p className="text-xl text-slate-400">See how we've transformed academic performance</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {results.map((result, idx) => (
              <Card key={idx} className="p-8 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700 hover-lift">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-violet-600 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                    {result.name.charAt(0)}
                  </div>
                  <h3 className="text-lg font-bold text-white">{result.name}</h3>
                  <p className="text-slate-400 text-sm">{result.class}</p>
                </div>
                
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-red-400">{result.before}</p>
                    <p className="text-xs text-slate-500">Before</p>
                  </div>
                  <ArrowRight className="w-6 h-6 text-slate-600" />
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-400">{result.after}</p>
                    <p className="text-xs text-slate-500">After</p>
                  </div>
                </div>
                
                <div className="text-center">
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    {result.improvement} Improvement
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* Testimonials */}
      <section className="py-20 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold heading-font text-white mb-4">
              What Parents & Students Say
            </h2>
            <p className="text-xl text-slate-400">Trusted by hundreds of families</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <Card key={idx} className="p-6 bg-slate-800/50 border-slate-700">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-300 mb-4 italic">"{testimonial.text}"</p>
                <div>
                  <p className="text-white font-semibold">{testimonial.parent}</p>
                  <p className="text-slate-500 text-sm">{testimonial.student}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* Demo Class Section */}
      <section className="py-20 bg-gradient-to-r from-blue-900/30 to-violet-900/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <Play className="w-16 h-16 text-blue-400 mx-auto mb-6" />
            <h2 className="text-4xl md:text-5xl font-bold heading-font text-white mb-4">
              Experience the Difference
            </h2>
            <p className="text-xl text-slate-300">
              Book a free demo class and see how personal mentorship works
            </p>
          </div>
          
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white shadow-2xl px-8 h-14 text-lg">
                Book Free Demo Class
              </Button>
            </Link>
            <a href="tel:+919619974466">
              <Button size="lg" variant="outline" className="border-2 border-slate-700 text-white hover:bg-slate-800 h-14 px-8 text-lg">
                <Phone className="w-5 h-5 mr-2" />
                Call Now
              </Button>
            </a>
          </div>
        </div>
      </section>
      
      {/* Trust Elements */}
      <section className="py-12 bg-slate-950 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center gap-3">
              <Shield className="w-12 h-12 text-green-400" />
              <h3 className="font-semibold text-white">Secure Payment</h3>
              <p className="text-slate-400 text-sm">100% safe & encrypted</p>
            </div>
            <div className="flex flex-col items-center gap-3">
              <RefreshCw className="w-12 h-12 text-blue-400" />
              <h3 className="font-semibold text-white">7-Day Refund</h3>
              <p className="text-slate-400 text-sm">Not satisfied? Get full refund</p>
            </div>
            <div className="flex flex-col items-center gap-3">
              <MessageCircle className="w-12 h-12 text-violet-400" />
              <h3 className="font-semibold text-white">24/7 Support</h3>
              <p className="text-slate-400 text-sm">Always here to help</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Final CTA */}
      <section id="contact" className="py-20 bg-gradient-to-r from-blue-900 to-violet-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold heading-font text-white mb-6">
            Give Your Child the Advantage of Personal Mentorship
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join 500+ students achieving academic excellence
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center mb-12">
            <Link to="/signup">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-slate-100 shadow-2xl px-12 h-16 text-lg font-bold">
                Start Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/signup">
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 h-16 px-12 text-lg">
                Book Demo
              </Button>
            </Link>
          </div>
          
          <div className="p-6 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20">
            <p className="text-white font-semibold mb-3">Contact Us</p>
            <div className="flex items-center justify-center gap-2 text-white mb-2">
              <Phone className="w-5 h-5" />
              <a href="tel:+919619974466" className="text-xl font-bold hover:text-blue-200">
                +91 9619974466
              </a>
            </div>
            <p className="text-blue-100 text-sm">Yatindra Mankesh Mishra</p>
            <p className="text-blue-200 text-xs mt-1">Available Mon-Sat, 9 AM - 8 PM IST</p>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img 
                  src="https://customer-assets.emergentagent.com/job_board-ready-3/artifacts/9esikr1w_ChatGPT%20Image%20Mar%209%2C%202026%2C%2001_45_09%20PM.png" 
                  alt="NextGen Learning" 
                  className="h-8 rounded-md"
                  style={{ mixBlendMode: 'screen' }}
                />
                <span className="font-bold text-white">NextGen Learning</span>
              </div>
              <p className="text-slate-400 text-sm">Premium 1-on-1 mentorship for Classes 9-12</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Courses</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Class 9-12 General</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Class 11-12 Commerce</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Class 11-12 Humanities</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#teachers" className="hover:text-white transition-colors">Our Teachers</a></li>
                <li><a href="#results" className="hover:text-white transition-colors">Student Success</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <a href="tel:+919619974466" className="hover:text-white transition-colors">+91 9619974466</a>
                </li>
                <li>
                  <p>Yatindra Mankesh Mishra</p>
                </li>
                <li>www.nextgenlearning.com</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center">
            <p className="text-slate-500 text-sm">© 2026 NextGen Learning. All rights reserved.</p>
            <p className="text-slate-600 text-xs mt-2">www.nextgenlearning.com</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
