import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Users, Award, TrendingUp, CheckCircle, ArrowRight, Sparkles, Video, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const Landing = () => {
  const navigate = useNavigate();
  
  const streams = [
    { name: 'Commerce', color: 'from-amber-400 to-orange-600', icon: '💼', subjects: 'Accounts, Economics, Business Studies' },
    { name: 'Humanities', color: 'from-rose-400 to-pink-600', icon: '📚', subjects: 'History, Political Science, Geography' }
  ];
  
  const features = [
    { icon: <Video className="w-6 h-6" />, title: 'Live & Recorded Classes', desc: 'Learn at your own pace' },
    { icon: <Users className="w-6 h-6" />, title: 'Expert Teachers', desc: 'Experienced educators' },
    { icon: <MessageCircle className="w-6 h-6" />, title: 'AI Doubt Assistant', desc: 'Get instant help 24/7' },
    { icon: <Award className="w-6 h-6" />, title: 'Mock Tests', desc: 'Board exam preparation' }
  ];
  
  const pricing = [
    { 
      class: 'Class 9-12 (General)', 
      description: '1-on-1 Personal Mentorship',
      highlight: 'Dedicated teacher • Weekly tests • Doubt support',
      price: '₹6,999'
    },
    { 
      class: 'Class 11-12 Humanities', 
      description: '1-on-1 Personal Mentorship',
      highlight: 'Dedicated teacher • Weekly tests • Doubt support',
      price: '₹7,999'
    },
    { 
      class: 'Class 11-12 Commerce', 
      description: '1-on-1 Personal Mentorship',
      highlight: 'Dedicated teacher • Weekly tests • Doubt support',
      price: '₹9,999'
    }
  ];
  
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <img 
                src="https://customer-assets.emergentagent.com/job_board-ready-3/artifacts/9esikr1w_ChatGPT%20Image%20Mar%209%2C%202026%2C%2001_45_09%20PM.png" 
                alt="NextGen Learning" 
                className="h-10"
              />
              <span className="text-2xl font-bold heading-font bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">NextGen Learning</span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <a href="#courses" className="text-slate-700 hover:text-blue-600 font-medium transition-colors" data-testid="nav-courses-link">Courses</a>
              <a href="#pricing" className="text-slate-700 hover:text-blue-600 font-medium transition-colors" data-testid="nav-pricing-link">Pricing</a>
              <a href="#features" className="text-slate-700 hover:text-blue-600 font-medium transition-colors" data-testid="nav-features-link">Features</a>
              <a href="#contact" className="text-slate-700 hover:text-blue-600 font-medium transition-colors" data-testid="nav-contact-link">Contact</a>
              <Link to="/login" data-testid="nav-login-btn">
                <Button variant="ghost" className="text-slate-700">Login</Button>
              </Link>
              <Link to="/signup" data-testid="nav-signup-btn">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 gradient-brand opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-100 text-violet-700 text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                <span>AI-Powered Learning Platform</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold heading-font tracking-tight mb-6" data-testid="hero-heading">
                Master Your <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">Board Exams</span> with Premium 1-on-1 Mentorship
              </h1>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed" data-testid="hero-description">
                Join hundreds of students from Classes 9-12 learning from India's best teachers through personalized one-on-one sessions. Live classes, recorded lectures, and AI-powered doubt solving.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/signup" data-testid="hero-cta-btn">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 px-8">
                    Start Free Trial <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/courses" data-testid="hero-explore-btn">
                  <Button size="lg" variant="outline" className="border-2">
                    Explore Courses
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="w-full h-96 rounded-2xl gradient-brand opacity-20 blur-3xl absolute"></div>
              <img 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800" 
                alt="Students learning" 
                className="relative rounded-2xl shadow-2xl w-full h-96 object-cover"
                data-testid="hero-image"
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Streams Section */}
      <section id="courses" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-semibold heading-font tracking-tight mb-4" data-testid="streams-heading">Choose Your Stream</h2>
            <p className="text-lg text-slate-600">Specialized courses for every board and stream</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {streams.map((stream, idx) => (
              <Card key={idx} className="p-8 hover-lift cursor-pointer border-slate-200" data-testid={`stream-card-${idx}`}>
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${stream.color} flex items-center justify-center text-3xl mb-4`}>
                  {stream.icon}
                </div>
                <h3 className="text-2xl font-medium heading-font mb-3">{stream.name}</h3>
                <p className="text-slate-600 mb-4">{stream.subjects}</p>
                <Button variant="ghost" className="text-blue-600 hover:text-blue-700 p-0" data-testid={`stream-explore-btn-${idx}`}>
                  Explore Courses <ArrowRight className="ml-1 w-4 h-4" />
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section id="features" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-semibold heading-font tracking-tight mb-4" data-testid="features-heading">Everything You Need to Excel</h2>
            <p className="text-lg text-slate-600">Comprehensive learning experience designed for success</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <Card key={idx} className="p-6 text-center hover-lift border-slate-200" data-testid={`feature-card-${idx}`}>
                <div className="w-12 h-12 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-medium heading-font mb-2">{feature.title}</h3>
                <p className="text-slate-600 text-sm">{feature.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-semibold heading-font tracking-tight mb-4" data-testid="pricing-heading">Simple, Transparent Pricing</h2>
            <p className="text-lg text-slate-600">Choose the perfect plan for your learning journey</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {pricing.map((tier, idx) => (
              <Card key={idx} className="p-8 hover-lift border-2 border-slate-200 relative overflow-hidden" data-testid={`pricing-card-${idx}`}>
                {idx === 2 && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-600 to-violet-600 text-white text-xs font-bold px-4 py-1 rounded-bl-lg">
                    PREMIUM
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-2xl font-semibold heading-font mb-2">{tier.class}</h3>
                  <p className="text-lg text-blue-600 font-medium mb-1">{tier.description}</p>
                  <p className="text-sm text-slate-600">{tier.highlight}</p>
                </div>
                <div className="mb-8">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-slate-900">{tier.price}</span>
                    <span className="text-slate-500">/month</span>
                  </div>
                </div>
                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>One-on-one live classes</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Personalized study plan</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Recorded lectures access</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>AI-powered doubt assistant</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Progress tracking & reports</span>
                  </div>
                </div>
                <Link to="/signup">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12" data-testid={`pricing-enroll-btn-${idx}`}>
                    Enroll Now
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-violet-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-bold heading-font mb-6" data-testid="cta-heading">Ready for Premium 1-on-1 Learning?</h2>
          <p className="text-xl mb-8 text-blue-100">Join hundreds of students achieving academic excellence with personalized mentorship</p>
          <Link to="/signup" data-testid="cta-signup-btn">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-slate-100 shadow-2xl px-8">
              Get Started Free <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
      
      {/* Contact Us Section */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-semibold heading-font tracking-tight mb-4" data-testid="contact-heading">Get In Touch</h2>
            <p className="text-lg text-slate-600">Have questions? We're here to help you get started</p>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <Card className="p-8 md:p-12 text-center">
              <div className="mb-8">
                <div className="w-20 h-20 rounded-full gradient-brand flex items-center justify-center text-white text-3xl mx-auto mb-6">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold heading-font mb-2">Contact Our Founder</h3>
                <p className="text-lg text-slate-600 mb-6">Speak directly with our founder for any queries or enrollment assistance</p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-3 text-slate-700">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-xl font-medium">Yatindra Mankesh Mishra</span>
                </div>
                
                <a href="tel:+919619974466" className="flex items-center justify-center gap-3 text-slate-700 hover:text-blue-600 transition-colors group">
                  <svg className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-2xl font-bold">+91 9619974466</span>
                </a>
              </div>
              
              <div className="mt-8 pt-8 border-t border-slate-200">
                <p className="text-sm text-slate-600">Available Monday - Saturday, 9 AM - 8 PM IST</p>
              </div>
            </Card>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="text-2xl font-bold text-white mb-4 heading-font">NextGen Learning</div>
              <p className="text-sm">Empowering students to achieve excellence in board exams.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Courses</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Class 9-12 General</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Class 11-12 Commerce</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Class 11-12 Humanities</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Our Teachers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Yatindra Mankesh Mishra</span>
                </li>
                <li>
                  <a href="tel:+919619974466" className="hover:text-white transition-colors flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    +91 9619974466
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-sm">
            <p>© 2026 NextGen Learning. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
