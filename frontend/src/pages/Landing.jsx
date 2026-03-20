import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Users, Award, TrendingUp, CheckCircle, ArrowRight, Sparkles, Video, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const Landing = () => {
  const navigate = useNavigate();
  
  const streams = [
    { name: 'Science (PCM/PCB)', color: 'from-sky-400 to-blue-600', icon: '🔬', subjects: 'Physics, Chemistry, Maths, Biology' },
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
    { class: 'Class 9-10', packages: [{ name: 'Single Subject', price: '₹999' }, { name: '3 Subjects', price: '₹2,499' }, { name: 'All Subjects', price: '₹3,999' }] },
    { class: 'Class 11-12 Science', packages: [{ name: 'Single Subject', price: '₹1,499' }, { name: 'PCM/PCB', price: '₹3,999' }, { name: 'Full Course', price: '₹4,999' }] },
    { class: 'Class 11-12 Commerce', packages: [{ name: 'Single Subject', price: '₹1,299' }, { name: 'Full Package', price: '₹3,499' }] }
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
            </div>
            <div className="hidden md:flex items-center gap-6">
              <a href="#courses" className="text-slate-700 hover:text-blue-600 font-medium transition-colors" data-testid="nav-courses-link">Courses</a>
              <a href="#pricing" className="text-slate-700 hover:text-blue-600 font-medium transition-colors" data-testid="nav-pricing-link">Pricing</a>
              <a href="#features" className="text-slate-700 hover:text-blue-600 font-medium transition-colors" data-testid="nav-features-link">Features</a>
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
                Master Your <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">Board Exams</span> with Expert Guidance
              </h1>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed" data-testid="hero-description">
                Join thousands of students from Classes 9-12 learning from India's best teachers. Live classes, recorded lectures, and AI-powered doubt solving.
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
          <div className="grid md:grid-cols-3 gap-6">
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
              <Card key={idx} className="p-8 hover-lift border-2 border-slate-200" data-testid={`pricing-card-${idx}`}>
                <h3 className="text-2xl font-semibold heading-font mb-6">{tier.class}</h3>
                <div className="space-y-4 mb-8">
                  {tier.packages.map((pkg, pidx) => (
                    <div key={pidx} className="flex justify-between items-center py-3 border-b border-slate-100">
                      <span className="text-slate-700">{pkg.name}</span>
                      <span className="text-xl font-bold text-blue-600">{pkg.price}<span className="text-sm text-slate-500">/mo</span></span>
                    </div>
                  ))}
                </div>
                <Link to="/signup">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" data-testid={`pricing-enroll-btn-${idx}`}>Enroll Now</Button>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-violet-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-bold heading-font mb-6" data-testid="cta-heading">Ready to Start Your Learning Journey?</h2>
          <p className="text-xl mb-8 text-blue-100">Join thousands of students achieving their academic goals</p>
          <Link to="/signup" data-testid="cta-signup-btn">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-slate-100 shadow-2xl px-8">
              Get Started Free <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
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
                <li><a href="#" className="hover:text-white transition-colors">Class 9-10</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Class 11-12 Science</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Class 11-12 Commerce</a></li>
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
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
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
