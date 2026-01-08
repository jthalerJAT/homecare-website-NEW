import React, { useState, useEffect } from 'react';
import { Home, Calendar, CheckCircle, Users, MessageSquare, DollarSign, Search, Menu, X, ArrowRight, Star, Phone, Mail, MapPin, Clock } from 'lucide-react';

// Main App Component
// API Configuration
const API_URL = 'https://gpc-backend-production.up.railway.app/api';

// API Helper Functions
const api = {
  // Auth endpoints
  register: async (userData) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return response.json();
  },
  
  login: async (email, password) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return response.json();
  },
  
  // Quote endpoints
  submitQuote: async (quoteData, token) => {
    const response = await fetch(`${API_URL}/quotes/request`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      body: JSON.stringify(quoteData)
    });
    return response.json();
  },
  
  getMyQuotes: async (token) => {
    const response = await fetch(`${API_URL}/quotes/my-requests`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },
  
  // Project endpoints
  getMyProjects: async (token) => {
    const response = await fetch(`${API_URL}/projects/my-projects`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },
  
  getProjectDetails: async (projectId, token) => {
    const response = await fetch(`${API_URL}/projects/${projectId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },
  
  // Message endpoints
  getMessages: async (token) => {
    const response = await fetch(`${API_URL}/messages`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },
  
  sendMessage: async (messageData, token) => {
    const response = await fetch(`${API_URL}/messages`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify(messageData)
    });
    return response.json();
  }
};
export default function HomeCareWebsite() {
  const [currentPage, setCurrentPage] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState(null); // 'customer' or 'contractor'

  // Authentication state
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for existing auth on page load
  useEffect(() => {
    const savedToken = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
  }, []);

  // Auth helper functions
  const handleLogin = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    setIsAuthenticated(true);
    localStorage.setItem('authToken', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setCurrentPage('home');
  };
  
  // Animation state
  const [hasAnimated, setHasAnimated] = useState(false);
  
  useEffect(() => {
    setHasAnimated(true);
  }, []);

  const renderPage = () => {
    switch(currentPage) {
      case 'home':
        return <HomePage setCurrentPage={setCurrentPage} />;
      case 'services':
        return <ServicesPage setCurrentPage={setCurrentPage} />;
      case 'request-quote':
        return <RequestQuotePage user={user} token={token} isAuthenticated={isAuthenticated} />;
      case 'portal':
  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLogin} setCurrentPage={setCurrentPage} />;
  }
  return user?.user_type === 'admin' 
    ? <AdminDashboard user={user} token={token} onLogout={handleLogout} />
    : <CustomerPortal user={user} token={token} onLogout={handleLogout} />;
      case 'register':
        return <RegisterPage onRegisterSuccess={handleLogin} setCurrentPage={setCurrentPage} />;
      case 'forgot-password':
        return <ForgotPasswordPage setCurrentPage={setCurrentPage} />;
      case 'about':
        return <AboutPage />;
      default:
        return <HomePage setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <div style={{ 
      fontFamily: '"Instrument Sans", -apple-system, sans-serif',
      minHeight: '100vh',
      background: 'linear-gradient(165deg, #0a0f1e 0%, #1a1f35 50%, #0d1424 100%)',
      color: '#e8edf5',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated background elements */}
      <div style={{
        position: 'fixed',
        top: '-50%',
        left: '-50%',
        width: '200%',
        height: '200%',
        background: 'radial-gradient(circle at 30% 50%, rgba(45, 212, 191, 0.08) 0%, transparent 50%), radial-gradient(circle at 70% 70%, rgba(168, 85, 247, 0.05) 0%, transparent 50%)',
        animation: 'drift 30s ease-in-out infinite',
        pointerEvents: 'none',
        zIndex: 0
      }} />
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap');
        
        @keyframes drift {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(-5%, 5%) rotate(2deg); }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-40px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-in {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        
        .animate-slide {
          animation: slideInLeft 0.7s ease-out forwards;
        }
        
        .animate-scale {
          animation: scaleIn 0.6s ease-out forwards;
        }
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
      `}</style>

      {/* Navigation */}
      <Navigation 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        isLoggedIn={isLoggedIn}
      />

      {/* Main Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {renderPage()}
      </div>

      {/* Footer */}
      <Footer setCurrentPage={setCurrentPage} />
    </div>
  );
}

// Navigation Component
function Navigation({ currentPage, setCurrentPage, mobileMenuOpen, setMobileMenuOpen, isLoggedIn }) {
  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(10, 15, 30, 0.85)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(45, 212, 191, 0.15)',
      boxShadow: '0 4px 24px rgba(0, 0, 0, 0.3)'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '1.2rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div 
          onClick={() => setCurrentPage('home')}
          style={{
            fontFamily: '"DM Serif Display", serif',
            fontSize: '3.0rem',
            cursor: 'pointer',
            background: 'linear-gradient(135deg, #2dd4bf 0%, #a855f7 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: '400',
            letterSpacing: '-0.02em'
          }}
        >
          Greenwich Property Care
        </div>

        {/* Desktop Menu */}
        <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '2.5rem', '@media (max-width: 768px)': { display: 'none' } }}>
            {['home', 'services', 'request-quote', 'about', 'portal'].map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: currentPage === page ? '#2dd4bf' : '#9ca3af',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  fontWeight: '500',
                  transition: 'all 0.3s ease',
                  textTransform: 'capitalize',
                  position: 'relative',
                  padding: '0.5rem 0',
                  letterSpacing: '0.01em'
                }}
                onMouseEnter={(e) => e.target.style.color = '#2dd4bf'}
                onMouseLeave={(e) => e.target.style.color = currentPage === page ? '#2dd4bf' : '#9ca3af'}
              >
                {page === 'request-quote' ? 'Get Quote' : page}
                {currentPage === page && (
                  <div style={{
                    position: 'absolute',
                    bottom: '-2px',
                    left: 0,
                    right: 0,
                    height: '2px',
                    background: 'linear-gradient(90deg, #2dd4bf, #a855f7)',
                    borderRadius: '2px'
                  }} />
                )}
              </button>
            ))}
          </div>
          
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              background: 'none',
              border: 'none',
              color: '#2dd4bf',
              cursor: 'pointer',
              display: 'none',
              '@media (max-width: 768px)': { display: 'block' }
            }}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div style={{
          background: 'rgba(13, 20, 36, 0.98)',
          borderTop: '1px solid rgba(45, 212, 191, 0.15)',
          padding: '1.5rem 2rem'
        }}>
          {['home', 'services', 'request-quote', 'about', 'portal'].map(page => (
            <button
              key={page}
              onClick={() => {
                setCurrentPage(page);
                setMobileMenuOpen(false);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: currentPage === page ? '#2dd4bf' : '#9ca3af',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '500',
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: '0.75rem 0',
                textTransform: 'capitalize',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
              }}
            >
              {page === 'request-quote' ? 'Get Quote' : page}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
}

// Home Page
function HomePage({ setCurrentPage }) {
  return (
    <div>
      {/* Hero Section */}
      <section style={{
        padding: '6rem 2rem',
        textAlign: 'center',
        position: 'relative'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h1 className="animate-in" style={{
            fontFamily: '"DM Serif Display", serif',
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
            marginBottom: '1.5rem',
            lineHeight: '1.1',
            background: 'linear-gradient(135deg, #ffffff 0%, #2dd4bf 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: '400',
            animationDelay: '0.1s',
            opacity: 0
          }}>
            Professional Home Care Services You Can Trust
          </h1>
          <p className="animate-in" style={{
            fontSize: '1.25rem',
            color: '#cbd5e1',
            marginBottom: '3rem',
            lineHeight: '1.7',
            maxWidth: '700px',
            margin: '0 auto 3rem',
            animationDelay: '0.3s',
            opacity: 0
          }}>
            Expert contractors. Transparent pricing. Quality guaranteed. From repairs to renovations, we've got your home covered.
          </p>
          <div className="animate-in" style={{
            display: 'flex',
            gap: '1.5rem',
            justifyContent: 'center',
            flexWrap: 'wrap',
            animationDelay: '0.5s',
            opacity: 0
          }}>
            <button
              onClick={() => setCurrentPage('request-quote')}
              style={{
                padding: '1rem 2.5rem',
                fontSize: '1.05rem',
                fontWeight: '600',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                background: 'linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%)',
                color: '#0a0f1e',
                transition: 'all 0.3s ease',
                boxShadow: '0 8px 24px rgba(45, 212, 191, 0.3), 0 0 0 0 rgba(45, 212, 191, 0.4)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 12px 32px rgba(45, 212, 191, 0.4), 0 0 0 4px rgba(45, 212, 191, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 8px 24px rgba(45, 212, 191, 0.3), 0 0 0 0 rgba(45, 212, 191, 0.4)';
              }}
            >
              Request a Quote <ArrowRight size={20} />
            </button>
            <button
              onClick={() => setCurrentPage('services')}
              style={{
                padding: '1rem 2.5rem',
                fontSize: '1.05rem',
                fontWeight: '600',
                border: '2px solid rgba(45, 212, 191, 0.4)',
                borderRadius: '12px',
                cursor: 'pointer',
                background: 'rgba(45, 212, 191, 0.08)',
                color: '#2dd4bf',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(8px)'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(45, 212, 191, 0.15)';
                e.target.style.borderColor = 'rgba(45, 212, 191, 0.6)';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(45, 212, 191, 0.08)';
                e.target.style.borderColor = 'rgba(45, 212, 191, 0.4)';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              View Services
            </button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section style={{ padding: '4rem 2rem', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem'
        }}>
          {[
            { icon: CheckCircle, title: 'Vetted Professionals', desc: 'All contractors are background-checked and verified' },
            { icon: DollarSign, title: 'Transparent Pricing', desc: 'Clear quotes with no hidden fees or surprises' },
            { icon: Calendar, title: 'Easy Scheduling', desc: 'Book appointments that fit your schedule' },
            { icon: Star, title: 'Quality Guaranteed', desc: 'Every job backed by our satisfaction guarantee' }
          ].map((feature, i) => (
            <div
              key={i}
              className="animate-scale"
              style={{
                background: 'rgba(26, 31, 53, 0.5)',
                border: '1px solid rgba(45, 212, 191, 0.15)',
                borderRadius: '16px',
                padding: '2rem',
                transition: 'all 0.3s ease',
                cursor: 'default',
                animationDelay: `${0.1 * i}s`,
                opacity: 0,
                backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.borderColor = 'rgba(45, 212, 191, 0.4)';
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(45, 212, 191, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(45, 212, 191, 0.15)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, rgba(45, 212, 191, 0.2), rgba(168, 85, 247, 0.2))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
                border: '1px solid rgba(45, 212, 191, 0.3)'
              }}>
                <feature.icon size={28} color="#2dd4bf" />
              </div>
              <h3 style={{
                fontSize: '1.3rem',
                marginBottom: '0.75rem',
                color: '#e8edf5',
                fontWeight: '600'
              }}>
                {feature.title}
              </h3>
              <p style={{ color: '#94a3b8', lineHeight: '1.6', fontSize: '0.95rem' }}>
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '5rem 2rem',
        textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(45, 212, 191, 0.08) 0%, rgba(168, 85, 247, 0.08) 100%)',
        borderTop: '1px solid rgba(45, 212, 191, 0.15)',
        borderBottom: '1px solid rgba(45, 212, 191, 0.15)',
        margin: '4rem 0'
      }}>
        <h2 style={{
          fontFamily: '"DM Serif Display", serif',
          fontSize: 'clamp(2rem, 4vw, 3rem)',
          marginBottom: '1.5rem',
          color: '#e8edf5'
        }}>
          Ready to Get Started?
        </h2>
        <p style={{
          fontSize: '1.15rem',
          color: '#cbd5e1',
          marginBottom: '2.5rem',
          maxWidth: '600px',
          margin: '0 auto 2.5rem'
        }}>
          Tell us about your project and get a detailed quote within 24 hours
        </p>
        <button
          onClick={() => setCurrentPage('request-quote')}
          style={{
            padding: '1.1rem 3rem',
            fontSize: '1.1rem',
            fontWeight: '600',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            background: 'linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%)',
            color: '#0a0f1e',
            transition: 'all 0.3s ease',
            boxShadow: '0 8px 24px rgba(45, 212, 191, 0.3)'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-3px)';
            e.target.style.boxShadow = '0 12px 32px rgba(45, 212, 191, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 8px 24px rgba(45, 212, 191, 0.3)';
          }}
        >
          Get Your Free Quote
        </button>
      </section>
    </div>
  );
}

// Services Page
function ServicesPage({ setCurrentPage }) {
  const services = [
    {
      category: 'Recurring Home Inspections',
      items: ['Regular Walk Throughs', 'System Tests and Check Ups', 'Exterior Inspections', 'Trouble Identification', 'Project Consulting'],
      icon: '✅'
    },
    {
      category: 'Repairs & Maintenance',
      items: ['Plumbing Repairs', 'Electrical Work', 'HVAC Service', 'Appliance Repair', 'General Handyman'],
      icon: '🔧'
    },
    {
      category: 'Renovations & Repairs',
      items: ['Roofing & Siding', 'Kitchen & Bathroom Renovation', 'Flooring', 'Landscaping', 'Room & Basement Finishing'],
      icon: '🏗️'
    },
    {
      category: 'Specialized Services',
      items: ['Smart Home Installation', 'Energy Efficiency Upgrades', 'Accessibility Modifications', 'Water Damage Restoration', 'Painting & Drywall'],
      icon: '⚡'
    }
  ];

  return (
    <div style={{ padding: '4rem 2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 className="animate-in" style={{
          fontFamily: '"DM Serif Display", serif',
          fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
          marginBottom: '1rem',
          background: 'linear-gradient(135deg, #ffffff 0%, #2dd4bf 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          opacity: 0
        }}>
          Our Services
        </h1>
        <p className="animate-in" style={{
          fontSize: '1.15rem',
          color: '#cbd5e1',
          maxWidth: '700px',
          margin: '0 auto',
          animationDelay: '0.2s',
          opacity: 0
        }}>
          Comprehensive home care solutions for every need
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '2.5rem',
        marginBottom: '4rem'
      }}>
        {services.map((service, i) => (
          <div
            key={i}
            className="animate-scale"
            style={{
              background: 'rgba(26, 31, 53, 0.5)',
              border: '1px solid rgba(45, 212, 191, 0.15)',
              borderRadius: '20px',
              padding: '2.5rem',
              transition: 'all 0.3s ease',
              animationDelay: `${0.1 * i}s`,
              opacity: 0,
              backdropFilter: 'blur(10px)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.borderColor = 'rgba(45, 212, 191, 0.4)';
              e.currentTarget.style.boxShadow = '0 16px 48px rgba(45, 212, 191, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = 'rgba(45, 212, 191, 0.15)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{service.icon}</div>
            <h3 style={{
              fontSize: '1.5rem',
              marginBottom: '1.5rem',
              color: '#e8edf5',
              fontWeight: '600'
            }}>
              {service.category}
            </h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {service.items.map((item, j) => (
                <li key={j} style={{
                  padding: '0.6rem 0',
                  color: '#94a3b8',
                  borderBottom: j < service.items.length - 1 ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}>
                  <CheckCircle size={16} color="#2dd4bf" style={{ flexShrink: 0 }} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div style={{
        textAlign: 'center',
        padding: '3rem',
        background: 'rgba(45, 212, 191, 0.05)',
        borderRadius: '20px',
        border: '1px solid rgba(45, 212, 191, 0.2)'
      }}>
        <h3 style={{
          fontSize: '1.8rem',
          marginBottom: '1rem',
          color: '#e8edf5',
          fontWeight: '600'
        }}>
          Don't See What You Need?
        </h3>
        <p style={{
          fontSize: '1.05rem',
          color: '#cbd5e1',
          marginBottom: '2rem',
          maxWidth: '600px',
          margin: '0 auto 2rem'
        }}>
          We handle all types of home care projects. Contact us to discuss your specific needs.
        </p>
        <button
          onClick={() => setCurrentPage('request-quote')}
          style={{
            padding: '1rem 2.5rem',
            fontSize: '1.05rem',
            fontWeight: '600',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            background: 'linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%)',
            color: '#0a0f1e',
            transition: 'all 0.3s ease',
            boxShadow: '0 8px 24px rgba(45, 212, 191, 0.3)'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 12px 32px rgba(45, 212, 191, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 8px 24px rgba(45, 212, 191, 0.3)';
          }}
        >
          Request Custom Quote
        </button>
      </div>
    </div>
  );
}

// Request Quote Page
function RequestQuotePage({ user, token, isAuthenticated }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    serviceType: '',
    description: '',
    urgency: 'normal',
    preferredDate: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Pre-fill form with user data if logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData(prev => ({
        ...prev,
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        zipCode: user.zip_code || ''
      }));
    }
  }, [isAuthenticated, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Always save to database (for both guests and logged-in users)
      const quoteData = {
        email: formData.email,
        firstName: isAuthenticated ? (user?.first_name || formData.name.split(' ')[0]) : formData.name.split(' ')[0],
        lastName: isAuthenticated ? (user?.last_name || formData.name.split(' ').slice(1).join(' ')) : formData.name.split(' ').slice(1).join(' ') || 'Customer',
        phone: formData.phone,
        address: formData.address,
        city: formData.city || '',
        state: formData.state || '',
        zipCode: formData.zipCode || '',
        serviceType: formData.serviceType,
        title: formData.serviceType,
        description: formData.description,
        urgency: formData.urgency,
        preferredStartDate: formData.preferredDate || null
      };
      
      // Save to database
      const result = await fetch('https://gpc-backend-production.up.railway.app/api/quotes/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(quoteData)
      });
      
      if (result.ok) {
        console.log('Quote saved to database!');
      }
      
      // Also send email notification
      const templateParams = {
        from_name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        service_type: formData.serviceType,
        urgency: formData.urgency,
        preferred_date: formData.preferredDate,
        message: formData.description,
        is_registered_user: isAuthenticated ? 'Yes' : 'No'
      };
      
      await window.emailjs.send(
        'service_nwt18xw',
        'template_x7a8uha',
        templateParams
      );
      
      console.log('Quote request sent successfully!');
      setSubmitted(true);
           
    } catch (error) {
      console.error('Error sending quote request:', error);
      alert('Sorry, there was an error submitting your request. Please email us directly at info@greenwichpropertycare.com');
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ padding: '6rem 2rem', textAlign: 'center', maxWidth: '700px', margin: '0 auto' }}>
        <div className="animate-scale" style={{
          background: 'rgba(45, 212, 191, 0.1)',
          border: '2px solid rgba(45, 212, 191, 0.3)',
          borderRadius: '24px',
          padding: '4rem 2rem',
          opacity: 0
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #2dd4bf, #14b8a6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 2rem',
            boxShadow: '0 8px 32px rgba(45, 212, 191, 0.4)'
          }}>
            <CheckCircle size={48} color="#0a0f1e" />
          </div>
          <h2 style={{
            fontFamily: '"DM Serif Display", serif',
            fontSize: '2.5rem',
            marginBottom: '1rem',
            color: '#e8edf5'
          }}>
            Quote Request Received!
          </h2>
          <p style={{
            fontSize: '1.15rem',
            color: '#cbd5e1',
            lineHeight: '1.7',
            marginBottom: '2rem'
          }}>
            Thank you for your request. We'll review your project details and send you a detailed quote within 24 hours.
          </p>
          <p style={{
            fontSize: '0.95rem',
            color: '#94a3b8'
          }}>
            {isAuthenticated 
              ? <>Your quote has been saved to your <strong style={{ color: '#2dd4bf' }}>customer portal</strong>. You can track its status there.</>
              : <>Check your email at <strong style={{ color: '#2dd4bf' }}>{formData.email}</strong> for updates.</>
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '4rem 2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 className="animate-in" style={{
          fontFamily: '"DM Serif Display", serif',
          fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
          marginBottom: '1rem',
          background: 'linear-gradient(135deg, #ffffff 0%, #2dd4bf 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          opacity: 0
        }}>
          Request a Quote
        </h1>
        <p className="animate-in" style={{
          fontSize: '1.1rem',
          color: '#cbd5e1',
          animationDelay: '0.2s',
          opacity: 0
        }}>
          {isAuthenticated 
            ? `Hi ${user?.first_name || 'there'}! Tell us about your project.`
            : 'Tell us about your project and we\'ll get back to you with a detailed estimate'
          }
        </p>
        {isAuthenticated && (
          <p style={{ 
            fontSize: '0.9rem', 
            color: '#2dd4bf', 
            marginTop: '0.5rem',
            background: 'rgba(45, 212, 191, 0.1)',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            display: 'inline-block'
          }}>
            ✓ Logged in — Your info is pre-filled
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="animate-scale" style={{
        background: 'rgba(26, 31, 53, 0.5)',
        border: '1px solid rgba(45, 212, 191, 0.15)',
        borderRadius: '24px',
        padding: '3rem',
        backdropFilter: 'blur(10px)',
        opacity: 0,
        animationDelay: '0.3s'
      }}>
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          
          {/* Contact Info Section - Collapsed if logged in */}
          {!isAuthenticated ? (
            <>
              <InputField
                label="Full Name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <InputField
                  label="Email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
                <InputField
                  label="Phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>

              <InputField
                label="Property Address"
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
              />
            </>
          ) : (
            <div style={{
              background: 'rgba(45, 212, 191, 0.05)',
              border: '1px solid rgba(45, 212, 191, 0.2)',
              borderRadius: '12px',
              padding: '1.25rem',
              marginBottom: '0.5rem'
            }}>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Submitting as:</p>
              <p style={{ color: '#e8edf5', fontWeight: '600', marginBottom: '0.25rem' }}>{formData.name}</p>
              <p style={{ color: '#cbd5e1', fontSize: '0.95rem' }}>{formData.email}</p>
              {formData.phone && <p style={{ color: '#cbd5e1', fontSize: '0.95rem' }}>{formData.phone}</p>}
              {formData.address && <p style={{ color: '#cbd5e1', fontSize: '0.95rem' }}>{formData.address}</p>}
            </div>
          )}

          {/* Project Details - Always shown */}
          <div>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: '#cbd5e1',
              fontSize: '0.95rem',
              fontWeight: '500'
            }}>
              Service Type <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <select
              required
              value={formData.serviceType}
              onChange={(e) => setFormData({...formData, serviceType: e.target.value})}
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                fontSize: '1rem',
                border: '1px solid rgba(45, 212, 191, 0.2)',
                borderRadius: '10px',
                background: 'rgba(10, 15, 30, 0.6)',
                color: '#e8edf5',
                outline: 'none',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'rgba(45, 212, 191, 0.5)';
                e.target.style.background = 'rgba(10, 15, 30, 0.8)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(45, 212, 191, 0.2)';
                e.target.style.background = 'rgba(10, 15, 30, 0.6)';
              }}
            >
              <option value="">Select a service...</option>
              <option value="plumbing">Plumbing</option>
              <option value="electrical">Electrical</option>
              <option value="hvac">HVAC</option>
              <option value="remodeling">Remodeling</option>
              <option value="roofing">Roofing</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: '#cbd5e1',
              fontSize: '0.95rem',
              fontWeight: '500'
            }}>
              Project Description <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <textarea
              required
              rows={5}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Please describe your project in detail..."
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                fontSize: '1rem',
                border: '1px solid rgba(45, 212, 191, 0.2)',
                borderRadius: '10px',
                background: 'rgba(10, 15, 30, 0.6)',
                color: '#e8edf5',
                outline: 'none',
                resize: 'vertical',
                fontFamily: 'inherit',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'rgba(45, 212, 191, 0.5)';
                e.target.style.background = 'rgba(10, 15, 30, 0.8)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(45, 212, 191, 0.2)';
                e.target.style.background = 'rgba(10, 15, 30, 0.6)';
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#cbd5e1',
                fontSize: '0.95rem',
                fontWeight: '500'
              }}>
                Urgency
              </label>
              <select
                value={formData.urgency}
                onChange={(e) => setFormData({...formData, urgency: e.target.value})}
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem',
                  fontSize: '1rem',
                  border: '1px solid rgba(45, 212, 191, 0.2)',
                  borderRadius: '10px',
                  background: 'rgba(10, 15, 30, 0.6)',
                  color: '#e8edf5',
                  outline: 'none'
                }}
              >
                <option value="normal">Normal (1-2 weeks)</option>
                <option value="urgent">Urgent (Few days)</option>
                <option value="emergency">Emergency (ASAP)</option>
              </select>
            </div>

            <InputField
              label="Preferred Start Date"
              type="date"
              value={formData.preferredDate}
              onChange={(e) => setFormData({...formData, preferredDate: e.target.value})}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              marginTop: '1rem',
              padding: '1.1rem 2rem',
              fontSize: '1.1rem',
              fontWeight: '600',
              border: 'none',
              borderRadius: '12px',
              cursor: isLoading ? 'wait' : 'pointer',
              background: isLoading 
                ? 'rgba(45, 212, 191, 0.5)'
                : 'linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%)',
              color: '#0a0f1e',
              transition: 'all 0.3s ease',
              boxShadow: '0 8px 24px rgba(45, 212, 191, 0.3)',
              width: '100%'
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 12px 32px rgba(45, 212, 191, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 8px 24px rgba(45, 212, 191, 0.3)';
            }}
          >
            {isLoading ? 'Submitting...' : 'Submit Quote Request'}
          </button>
        </div>
      </form>
    </div>
  );
}

// Quote Card Component (for customer portal)
function QuoteCard({ quote, token, onUpdate }) {
  const [showDetails, setShowDetails] = useState(false);
  const [quoteDetails, setQuoteDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchQuoteDetails = async () => {
    if (quoteDetails) {
      setShowDetails(!showDetails);
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch(`https://gpc-backend-production.up.railway.app/api/quotes/${quote.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setQuoteDetails(data.quotes || []);
      setShowDetails(true);
    } catch (error) {
      console.error('Error fetching quote details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async (quoteId) => {
    if (!window.confirm('Accept this quote and start the project?')) return;
    
    setActionLoading(true);
    try {
      const response = await fetch(`https://gpc-backend-production.up.railway.app/api/quotes/${quoteId}/accept`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        }
      });
      
      if (response.ok) {
        alert('Quote accepted! Project has been created.');
        onUpdate();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to accept quote');
      }
    } catch (error) {
      alert('Error accepting quote');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDecline = async (quoteId) => {
    if (!window.confirm('Are you sure you want to decline this quote?')) return;
    
    setActionLoading(true);
    try {
      const response = await fetch(`https://gpc-backend-production.up.railway.app/api/quotes/${quoteId}/decline`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        }
      });
      
      if (response.ok) {
        alert('Quote declined.');
        onUpdate();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to decline quote');
      }
    } catch (error) {
      alert('Error declining quote');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return { bg: 'rgba(251, 191, 36, 0.1)', border: 'rgba(251, 191, 36, 0.3)', text: '#fbbf24' };
      case 'quoted': return { bg: 'rgba(45, 212, 191, 0.1)', border: 'rgba(45, 212, 191, 0.3)', text: '#2dd4bf' };
      case 'accepted': return { bg: 'rgba(34, 197, 94, 0.1)', border: 'rgba(34, 197, 94, 0.3)', text: '#22c55e' };
      case 'declined': return { bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.3)', text: '#ef4444' };
      default: return { bg: 'rgba(168, 85, 247, 0.1)', border: 'rgba(168, 85, 247, 0.3)', text: '#a855f7' };
    }
  };

  const statusColor = getStatusColor(quote.status);

  return (
    <div style={{
      background: 'rgba(26, 31, 53, 0.5)',
      border: '1px solid rgba(45, 212, 191, 0.15)',
      borderRadius: '16px',
      padding: '2rem',
      backdropFilter: 'blur(10px)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'start',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1rem'
      }}>
        <div>
          <h3 style={{
            fontSize: '1.3rem',
            marginBottom: '0.5rem',
            color: '#e8edf5',
            fontWeight: '600'
          }}>
            {quote.service_type || quote.title}
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
            Submitted: {new Date(quote.created_at).toLocaleDateString()}
          </p>
        </div>
        <div style={{
          padding: '0.5rem 1rem',
          borderRadius: '8px',
          background: statusColor.bg,
          border: `1px solid ${statusColor.border}`,
          color: statusColor.text,
          fontSize: '0.85rem',
          fontWeight: '600',
          textTransform: 'capitalize'
        }}>
          {quote.status}
        </div>
      </div>

      <p style={{ color: '#cbd5e1', fontSize: '0.95rem', marginBottom: '1rem' }}>
        {quote.description}
      </p>
      <p style={{color: 'red', fontWeight: 'bold'}}>TEST - CAN YOU SEE THIS?</p>

      {/* Show "View Quote" button if status is 'quoted' */}
{quote.status === 'quoted' ? (
  <button
    onClick={fetchQuoteDetails}
    disabled={isLoading}
    style={{
      padding: '0.75rem 1.5rem',
      background: 'linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%)',
      border: 'none',
      borderRadius: '10px',
      color: '#0a0f1e',
      fontWeight: '600',
      cursor: 'pointer',
      marginBottom: showDetails ? '1rem' : 0
    }}
  >
    {isLoading ? 'Loading...' : showDetails ? 'Hide Quote Details' : '💰 View Quote & Pricing'}
  </button>
) : (
  <p style={{color: '#fbbf24'}}>DEBUG: Status is "{quote.status}" (not showing button)</p>
)}

      {/* Quote Details */}
      {showDetails && quoteDetails && quoteDetails.length > 0 && (
        <div style={{
          background: 'rgba(45, 212, 191, 0.05)',
          border: '1px solid rgba(45, 212, 191, 0.2)',
          borderRadius: '12px',
          padding: '1.5rem',
          marginTop: '1rem'
        }}>
          {quoteDetails.map(q => (
            <div key={q.id}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                <h4 style={{ color: '#2dd4bf', fontSize: '1.1rem' }}>Quote from Greenwich Property Care</h4>
                <div style={{
                  fontSize: '2rem',
                  fontWeight: '700',
                  color: '#2dd4bf'
                }}>
                  ${parseFloat(q.amount).toLocaleString()}
                </div>
              </div>

              {q.scope_of_work && (
                <div style={{ marginBottom: '1rem' }}>
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Scope of Work:</p>
                  <p style={{ color: '#e8edf5' }}>{q.scope_of_work}</p>
                </div>
              )}

              {q.estimated_duration && (
                <div style={{ marginBottom: '1rem' }}>
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Estimated Duration:</p>
                  <p style={{ color: '#e8edf5' }}>{q.estimated_duration}</p>
                </div>
              )}

              {q.payment_terms && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Payment Terms:</p>
                  <p style={{ color: '#e8edf5' }}>{q.payment_terms}</p>
                </div>
              )}

              {q.status === 'pending' && (
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => handleAccept(q.id)}
                    disabled={actionLoading}
                    style={{
                      flex: 1,
                      minWidth: '150px',
                      padding: '1rem',
                      background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                      border: 'none',
                      borderRadius: '10px',
                      color: '#fff',
                      fontWeight: '600',
                      cursor: actionLoading ? 'wait' : 'pointer',
                      fontSize: '1rem'
                    }}
                  >
                    {actionLoading ? 'Processing...' : '✓ Accept Quote'}
                  </button>
                  <button
                    onClick={() => handleDecline(q.id)}
                    disabled={actionLoading}
                    style={{
                      flex: 1,
                      minWidth: '150px',
                      padding: '1rem',
                      background: 'transparent',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: '10px',
                      color: '#ef4444',
                      fontWeight: '600',
                      cursor: actionLoading ? 'wait' : 'pointer',
                      fontSize: '1rem'
                    }}
                  >
                    ✗ Decline
                  </button>
                </div>
              )}

              {q.status === 'accepted' && (
                <div style={{
                  padding: '1rem',
                  background: 'rgba(34, 197, 94, 0.1)',
                  borderRadius: '10px',
                  color: '#22c55e',
                  textAlign: 'center',
                  fontWeight: '600'
                }}>
                  ✓ Quote Accepted - Project Created!
                </div>
              )}

              {q.status === 'declined' && (
                <div style={{
                  padding: '1rem',
                  background: 'rgba(239, 68, 68, 0.1)',
                  borderRadius: '10px',
                  color: '#ef4444',
                  textAlign: 'center',
                  fontWeight: '600'
                }}>
                  Quote Declined
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pending status message */}
      {quote.status === 'pending' && (
        <div style={{
          padding: '1rem',
          background: 'rgba(251, 191, 36, 0.1)',
          borderRadius: '10px',
          color: '#fbbf24'
        }}>
          ⏳ Awaiting quote from our team...
        </div>
      )}
    </div>
  );
}

// Customer Quote Card Component
function CustomerQuoteCard({ quote, token, onUpdate }) {
  const [showDetails, setShowDetails] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [quoteDetails, setQuoteDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchQuoteDetails = async () => {
    if (quoteDetails) {
      setShowDetails(!showDetails);
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch(`https://gpc-backend-production.up.railway.app/api/quotes/${quote.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setQuoteDetails(data.quotes || []);
      setShowDetails(true);
    } catch (error) {
      console.error('Error fetching quote details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async (quoteId) => {
    if (!window.confirm('Accept this quote and start the project?')) return;
    
    setActionLoading(true);
    try {
      const response = await fetch(`https://gpc-backend-production.up.railway.app/api/quotes/${quoteId}/accept`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        }
      });
      
      if (response.ok) {
        alert('Quote accepted! Project has been created.');
        onUpdate();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to accept quote');
      }
    } catch (error) {
      alert('Error accepting quote');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDecline = async (quoteId) => {
    if (!window.confirm('Are you sure you want to decline this quote?')) return;
    
    setActionLoading(true);
    try {
      const response = await fetch(`https://gpc-backend-production.up.railway.app/api/quotes/${quoteId}/decline`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        }
      });
      
      if (response.ok) {
        alert('Quote declined.');
        onUpdate();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to decline quote');
      }
    } catch (error) {
      alert('Error declining quote');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div style={{
      background: 'rgba(26, 31, 53, 0.5)',
      border: '1px solid rgba(45, 212, 191, 0.15)',
      borderRadius: '16px',
      padding: '2rem',
      backdropFilter: 'blur(10px)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'start',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1rem'
      }}>
        <div>
          <h3 style={{
            fontSize: '1.3rem',
            marginBottom: '0.5rem',
            color: '#e8edf5',
            fontWeight: '600'
          }}>
            {quote.service_type || quote.title}
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
            Submitted: {new Date(quote.created_at).toLocaleDateString()}
          </p>
        </div>
        <div style={{
          padding: '0.5rem 1rem',
          borderRadius: '8px',
          background: quote.status === 'pending' ? 'rgba(251, 191, 36, 0.1)' : 
                     quote.status === 'quoted' ? 'rgba(45, 212, 191, 0.1)' :
                     quote.status === 'accepted' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(168, 85, 247, 0.1)',
          border: `1px solid ${quote.status === 'pending' ? 'rgba(251, 191, 36, 0.3)' : 
                                quote.status === 'quoted' ? 'rgba(45, 212, 191, 0.3)' :
                                quote.status === 'accepted' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(168, 85, 247, 0.3)'}`,
          color: quote.status === 'pending' ? '#fbbf24' : 
                 quote.status === 'quoted' ? '#2dd4bf' :
                 quote.status === 'accepted' ? '#22c55e' : '#a855f7',
          fontSize: '0.85rem',
          fontWeight: '600',
          textTransform: 'capitalize'
        }}>
          {quote.status}
        </div>
      </div>

      <p style={{ color: '#cbd5e1', fontSize: '0.95rem', marginBottom: '1rem' }}>
        {quote.description}
      </p>

      {/* Pending - waiting for quote */}
      {quote.status === 'pending' && (
        <div style={{
          padding: '1rem',
          background: 'rgba(251, 191, 36, 0.1)',
          borderRadius: '10px',
          color: '#fbbf24'
        }}>
          ⏳ Awaiting quote from our team...
        </div>
      )}

      {/* Quoted - show view button */}
      {quote.status === 'quoted' && (
        <button
          onClick={fetchQuoteDetails}
          disabled={isLoading}
          style={{
            padding: '0.875rem 1.5rem',
            background: 'linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%)',
            border: 'none',
            borderRadius: '10px',
            color: '#0a0f1e',
            fontWeight: '600',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          {isLoading ? 'Loading...' : '💰 View Quote & Pricing'}
        </button>
      )}

      {/* Quote Details */}
      {showDetails && quoteDetails && quoteDetails.length > 0 && (
        <div style={{
          background: 'rgba(45, 212, 191, 0.05)',
          border: '1px solid rgba(45, 212, 191, 0.2)',
          borderRadius: '12px',
          padding: '1.5rem',
          marginTop: '1rem'
        }}>
          {quoteDetails.map(q => (
            <div key={q.id}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                <h4 style={{ color: '#2dd4bf', fontSize: '1.1rem' }}>Your Quote</h4>
                <div style={{
                  fontSize: '2rem',
                  fontWeight: '700',
                  color: '#2dd4bf'
                }}>
                  ${parseFloat(q.amount).toLocaleString()}
                </div>
              </div>

              {q.scope_of_work && (
                <div style={{ marginBottom: '1rem' }}>
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Scope of Work:</p>
                  <p style={{ color: '#e8edf5' }}>{q.scope_of_work}</p>
                </div>
              )}

              {q.estimated_duration && (
                <div style={{ marginBottom: '1rem' }}>
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Estimated Duration:</p>
                  <p style={{ color: '#e8edf5' }}>{q.estimated_duration}</p>
                </div>
              )}

              {q.payment_terms && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Payment Terms:</p>
                  <p style={{ color: '#e8edf5' }}>{q.payment_terms}</p>
                </div>
              )}

              {q.status === 'quoted' && (
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => handleAccept(q.id)}
                    disabled={actionLoading}
                    style={{
                      flex: 1,
                      minWidth: '150px',
                      padding: '1rem',
                      background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                      border: 'none',
                      borderRadius: '10px',
                      color: '#fff',
                      fontWeight: '600',
                      cursor: actionLoading ? 'wait' : 'pointer',
                      fontSize: '1rem'
                    }}
                  >
                    {actionLoading ? 'Processing...' : '✓ Accept Quote'}
                  </button>
                  <button
                    onClick={() => handleDecline(q.id)}
                    disabled={actionLoading}
                    style={{
                      flex: 1,
                      minWidth: '150px',
                      padding: '1rem',
                      background: 'transparent',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: '10px',
                      color: '#ef4444',
                      fontWeight: '600',
                      cursor: actionLoading ? 'wait' : 'pointer',
                      fontSize: '1rem'
                    }}
                  >
                    ✗ Decline
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Message Button & Chat */}
      <div style={{ marginTop: '1rem' }}>
        <button
          onClick={() => setShowChat(!showChat)}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'rgba(168, 85, 247, 0.1)',
            border: '1px solid rgba(168, 85, 247, 0.3)',
            borderRadius: '10px',
            color: '#a855f7',
            fontWeight: '600',
            cursor: 'pointer',
            fontSize: '0.95rem'
          }}
        >
          {showChat ? '✕ Close Chat' : '💬 Message Us'}
        </button>
        
        {showChat && (
          <MessageChat 
            type="quote"
            id={quote.id}
            token={token}
            currentUser={null}
          />
        )}
      </div>

      {/* Accepted */}
      {quote.status === 'accepted' && (
        <div style={{
          padding: '1rem',
          background: 'rgba(34, 197, 94, 0.1)',
          borderRadius: '10px',
          color: '#22c55e'
        }}>
          ✓ Quote accepted - Check Projects tab for updates!
        </div>
      )}
    </div>
  );
}

// Message Chat Component
function MessageChat({ type, id, token, currentUser }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`https://gpc-backend-production.up.railway.app/api/messages/${type}/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        setMessages(data.messages || []);
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (token && id) {
      fetchMessages();
    }
  }, [token, id, type]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    setIsSending(true);
    try {
      const body = type === 'quote' 
        ? { quoteRequestId: id, message: newMessage }
        : { projectId: id, message: newMessage };

      const response = await fetch('https://gpc-backend-production.up.railway.app/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        const data = await response.json();
        setMessages([...messages, data.message]);
        setNewMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div style={{
      background: 'rgba(10, 15, 30, 0.5)',
      borderRadius: '12px',
      padding: '1rem',
      marginTop: '1rem'
    }}>
      <h4 style={{ color: '#2dd4bf', marginBottom: '1rem', fontSize: '1rem' }}>
        💬 Messages
      </h4>

      {/* Messages List */}
      <div style={{
        maxHeight: '300px',
        overflowY: 'auto',
        marginBottom: '1rem',
        padding: '0.5rem'
      }}>
        {isLoading ? (
          <p style={{ color: '#94a3b8', textAlign: 'center' }}>Loading messages...</p>
        ) : messages.length === 0 ? (
          <p style={{ color: '#94a3b8', textAlign: 'center', fontStyle: 'italic' }}>
            No messages yet. Start the conversation!
          </p>
        ) : (
          messages.map((msg, index) => {
            const isFromAdmin = msg.sender_type === 'admin';
            const isFromMe = msg.sender_id === currentUser?.id;
            
            return (
              <div
                key={msg.id || index}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isFromMe ? 'flex-end' : 'flex-start',
                  marginBottom: '0.75rem'
                }}
              >
                <div style={{
                  maxWidth: '80%',
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  background: isFromMe 
                    ? 'linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%)'
                    : 'rgba(45, 212, 191, 0.1)',
                  color: isFromMe ? '#0a0f1e' : '#e8edf5'
                }}>
                  <p style={{ 
                    fontSize: '0.8rem', 
                    fontWeight: '600',
                    marginBottom: '0.25rem',
                    color: isFromMe ? '#0a0f1e' : '#2dd4bf'
                  }}>
                    {isFromMe ? 'You' : isFromAdmin ? 'GPC Rep' : `${msg.first_name || 'Customer'}`}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.95rem' }}>{msg.message}</p>
                  {msg.attachments && JSON.parse(msg.attachments || '[]').length > 0 && (
                    <div style={{ marginTop: '0.5rem' }}>
                      {JSON.parse(msg.attachments).map((url, i) => (
                        <img 
                          key={i} 
                          src={url} 
                          alt="attachment" 
                          style={{ 
                            maxWidth: '200px', 
                            borderRadius: '8px',
                            marginTop: '0.5rem'
                          }} 
                        />
                      ))}
                    </div>
                  )}
                </div>
                <span style={{ 
                  fontSize: '0.7rem', 
                  color: '#64748b',
                  marginTop: '0.25rem'
                }}>
                  {formatTime(msg.created_at)}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Input Area */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type a message..."
          style={{
            flex: 1,
            padding: '0.75rem 1rem',
            borderRadius: '10px',
            border: '1px solid rgba(45, 212, 191, 0.3)',
            background: 'rgba(15, 23, 42, 0.5)',
            color: '#e8edf5',
            fontSize: '0.95rem'
          }}
        />
        <button
          onClick={handleSend}
          disabled={isSending || !newMessage.trim()}
          style={{
            padding: '0.75rem 1.25rem',
            background: isSending ? 'rgba(45, 212, 191, 0.5)' : 'linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%)',
            border: 'none',
            borderRadius: '10px',
            color: '#0a0f1e',
            fontWeight: '600',
            cursor: isSending ? 'wait' : 'pointer'
          }}
        >
          {isSending ? '...' : 'Send'}
        </button>
      </div>
    </div>
  );
}

// Input Field Component
function InputField({ label, type, required, value, onChange, ...props }) {
  return (
    <div>
      <label style={{
        display: 'block',
        marginBottom: '0.5rem',
        color: '#cbd5e1',
        fontSize: '0.95rem',
        fontWeight: '500'
      }}>
        {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
      </label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={onChange}
        {...props}
        style={{
          width: '100%',
          padding: '0.875rem 1rem',
          fontSize: '1rem',
          border: '1px solid rgba(45, 212, 191, 0.2)',
          borderRadius: '10px',
          background: 'rgba(10, 15, 30, 0.6)',
          color: '#e8edf5',
          outline: 'none',
          transition: 'all 0.3s ease'
        }}
        onFocus={(e) => {
          e.target.style.borderColor = 'rgba(45, 212, 191, 0.5)';
          e.target.style.background = 'rgba(10, 15, 30, 0.8)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = 'rgba(45, 212, 191, 0.2)';
          e.target.style.background = 'rgba(10, 15, 30, 0.6)';
        }}
      />
    </div>
  );
}

// Login Page
function LoginPage({ onLoginSuccess, setCurrentPage }) {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const result = await api.login(credentials.email, credentials.password);
      
      if (result.token) {
        onLoginSuccess(result.user, result.token);
      } else {
        setError(result.error || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '4rem 2rem', maxWidth: '500px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{
          fontFamily: '"DM Serif Display", serif',
          fontSize: '3rem',
          marginBottom: '1rem',
          background: 'linear-gradient(135deg, #ffffff 0%, #2dd4bf 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Customer Login
        </h1>
        <p style={{ color: '#94a3b8' }}>Access your dashboard to view quotes and projects</p>
      </div>

      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '12px',
          padding: '1rem',
          marginBottom: '1.5rem',
          color: '#ef4444',
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} style={{
        background: 'rgba(26, 31, 53, 0.5)',
        border: '1px solid rgba(45, 212, 191, 0.15)',
        borderRadius: '24px',
        padding: '3rem',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#e8edf5', fontWeight: 500 }}>
            Email
          </label>
          <input
            type="email"
            required
            value={credentials.email}
            onChange={(e) => setCredentials({...credentials, email: e.target.value})}
            placeholder="your@email.com"
            style={{
              width: '100%',
              padding: '0.875rem',
              borderRadius: '10px',
              border: '1px solid rgba(45, 212, 191, 0.3)',
              background: 'rgba(15, 23, 42, 0.5)',
              color: '#e8edf5',
              fontSize: '1rem'
            }}
          />
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#e8edf5', fontWeight: 500 }}>
            Password
          </label>
          <input
            type="password"
            required
            value={credentials.password}
            onChange={(e) => setCredentials({...credentials, password: e.target.value})}
            placeholder="Your password"
            style={{
              width: '100%',
              padding: '0.875rem',
              borderRadius: '10px',
              border: '1px solid rgba(45, 212, 191, 0.3)',
              background: 'rgba(15, 23, 42, 0.5)',
              color: '#e8edf5',
              fontSize: '1rem'
            }}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '1.1rem',
            fontSize: '1.1rem',
            fontWeight: '600',
            border: 'none',
            borderRadius: '12px',
            cursor: isLoading ? 'wait' : 'pointer',
            background: isLoading 
              ? 'rgba(45, 212, 191, 0.5)' 
              : 'linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%)',
            color: '#0a0f1e',
            transition: 'all 0.3s ease',
            boxShadow: '0 8px 24px rgba(45, 212, 191, 0.3)'
          }}
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>

        <div style={{
          marginTop: '1.5rem',
          textAlign: 'center',
          color: '#94a3b8',
          fontSize: '0.9rem'
        }}>
          <p style={{ marginBottom: '0.5rem' }}>
            <span 
              onClick={() => setCurrentPage('forgot-password')}
              style={{ color: '#2dd4bf', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Forgot your password?
            </span>
          </p>
          <p>
            Don't have an account?{' '}
            <span 
              onClick={() => setCurrentPage('register')}
              style={{ color: '#2dd4bf', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Register here
            </span>
          </p>
      </div>
      </form>
    </div>
  );
}

// Register Page
function RegisterPage({ onRegisterSuccess, setCurrentPage }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await api.register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode
      });
      
      if (result.token) {
        onRegisterSuccess(result.user, result.token);
        setCurrentPage('portal');
      } else {
        setError(result.error || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '0.875rem',
    borderRadius: '10px',
    border: '1px solid rgba(45, 212, 191, 0.3)',
    background: 'rgba(15, 23, 42, 0.5)',
    color: '#e8edf5',
    fontSize: '1rem',
    boxSizing: 'border-box'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '0.5rem',
    color: '#e8edf5',
    fontWeight: 500
  };

  return (
    <div style={{ padding: '4rem 2rem', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{
          fontFamily: '"DM Serif Display", serif',
          fontSize: '2.5rem',
          marginBottom: '1rem',
          background: 'linear-gradient(135deg, #ffffff 0%, #2dd4bf 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Create Your Account
        </h1>
        <p style={{ color: '#94a3b8' }}>Join Greenwich Property Care to manage your projects</p>
      </div>

      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '12px',
          padding: '1rem',
          marginBottom: '1.5rem',
          color: '#ef4444',
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleRegister} style={{
        background: 'rgba(26, 31, 53, 0.5)',
        border: '1px solid rgba(45, 212, 191, 0.15)',
        borderRadius: '24px',
        padding: '2rem',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={labelStyle}>First Name *</label>
            <input
              type="text"
              required
              value={formData.firstName}
              onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              placeholder="John"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Last Name *</label>
            <input
              type="text"
              required
              value={formData.lastName}
              onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              placeholder="Smith"
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>Email *</label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            placeholder="your@email.com"
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>Phone</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            placeholder="203-555-1234"
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>Address</label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({...formData, address: e.target.value})}
            placeholder="123 Main Street"
            style={inputStyle}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={labelStyle}>City</label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({...formData, city: e.target.value})}
              placeholder="Greenwich"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>State</label>
            <input
              type="text"
              value={formData.state}
              onChange={(e) => setFormData({...formData, state: e.target.value})}
              placeholder="CT"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Zip</label>
            <input
              type="text"
              value={formData.zipCode}
              onChange={(e) => setFormData({...formData, zipCode: e.target.value})}
              placeholder="06830"
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={labelStyle}>Password *</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              placeholder="Min 6 characters"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Confirm Password *</label>
            <input
              type="password"
              required
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              placeholder="Confirm password"
              style={inputStyle}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '1.1rem',
            fontSize: '1.1rem',
            fontWeight: '600',
            border: 'none',
            borderRadius: '12px',
            cursor: isLoading ? 'wait' : 'pointer',
            background: isLoading 
              ? 'rgba(45, 212, 191, 0.5)' 
              : 'linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%)',
            color: '#0a0f1e',
            transition: 'all 0.3s ease',
            boxShadow: '0 8px 24px rgba(45, 212, 191, 0.3)'
          }}
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </button>

        <p style={{
          marginTop: '1.5rem',
          textAlign: 'center',
          color: '#94a3b8',
          fontSize: '0.9rem'
        }}>
          Already have an account?{' '}
          <span 
            onClick={() => setCurrentPage('portal')}
            style={{ color: '#2dd4bf', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Login here
          </span>
        </p>
      </form>
    </div>
  );
}

// Forgot Password Page
function ForgotPasswordPage({ setCurrentPage }) {
  const [step, setStep] = useState(1); // 1: Enter email, 2: Enter code, 3: New password
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      // Request reset code from backend
      const response = await fetch('https://gpc-backend-production.up.railway.app/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Send email with the reset code via EmailJS
        if (data._devCode && window.emailjs) {
          try {
            const emailParams = {
              to_email: email,
              to_name: 'Customer',
              reset_code: data._devCode
            };
            console.log('Sending email with params:', emailParams);
            
            const emailResult = await window.emailjs.send(
              'service_nwt18xw',
              'template_xlo5z6l',
              emailParams
            );
            console.log('Email sent successfully:', emailResult);
          } catch (emailError) {
            console.error('EmailJS error:', emailError);
          }
        } else {
          console.log('No code or emailjs not available:', { code: data._devCode, emailjs: !!window.emailjs });
        }
        
        setMessage('A reset code has been sent to your email. Check your inbox (and spam folder).');
        setStep(2);
      } else {
        setError(data.error || 'Failed to request reset code');
      }
    } catch (err) {
      console.error('Request error:', err);
      setError('Failed to connect. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('https://gpc-backend-production.up.railway.app/api/auth/verify-reset-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      });
      
      const data = await response.json();
      
      if (response.ok && data.valid) {
        setMessage('Code verified! Enter your new password.');
        setStep(3);
      } else {
        setError(data.error || 'Invalid code');
      }
    } catch (err) {
      setError('Failed to verify code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('https://gpc-backend-production.up.railway.app/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage('Password reset successful! Redirecting to login...');
        setTimeout(() => setCurrentPage('portal'), 2000);
      } else {
        setError(data.error || 'Failed to reset password');
      }
    } catch (err) {
      setError('Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '0.875rem',
    borderRadius: '10px',
    border: '1px solid rgba(45, 212, 191, 0.3)',
    background: 'rgba(15, 23, 42, 0.5)',
    color: '#e8edf5',
    fontSize: '1rem',
    boxSizing: 'border-box'
  };

  return (
    <div style={{ padding: '4rem 2rem', maxWidth: '500px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{
          fontFamily: '"DM Serif Display", serif',
          fontSize: '2.5rem',
          marginBottom: '1rem',
          background: 'linear-gradient(135deg, #ffffff 0%, #2dd4bf 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Reset Password
        </h1>
        <p style={{ color: '#94a3b8' }}>
          {step === 1 && "Enter your email to receive a reset code"}
          {step === 2 && "Enter the 6-digit code"}
          {step === 3 && "Create your new password"}
        </p>
      </div>

      {/* Progress Indicator */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '0.5rem', 
        marginBottom: '2rem' 
      }}>
        {[1, 2, 3].map(s => (
          <div
            key={s}
            style={{
              width: '40px',
              height: '4px',
              borderRadius: '2px',
              background: s <= step ? '#2dd4bf' : 'rgba(45, 212, 191, 0.2)'
            }}
          />
        ))}
      </div>

      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '12px',
          padding: '1rem',
          marginBottom: '1.5rem',
          color: '#ef4444',
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}

      {message && (
        <div style={{
          background: 'rgba(45, 212, 191, 0.1)',
          border: '1px solid rgba(45, 212, 191, 0.3)',
          borderRadius: '12px',
          padding: '1rem',
          marginBottom: '1.5rem',
          color: '#2dd4bf',
          textAlign: 'center'
        }}>
          {message}
        </div>
      )}

      <div style={{
        background: 'rgba(26, 31, 53, 0.5)',
        border: '1px solid rgba(45, 212, 191, 0.15)',
        borderRadius: '24px',
        padding: '2rem',
        backdropFilter: 'blur(10px)'
      }}>
        {/* Step 1: Enter Email */}
        {step === 1 && (
          <form onSubmit={handleRequestCode}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#e8edf5', fontWeight: 500 }}>
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                style={inputStyle}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '1rem',
                fontSize: '1.1rem',
                fontWeight: '600',
                border: 'none',
                borderRadius: '12px',
                cursor: isLoading ? 'wait' : 'pointer',
                background: isLoading ? 'rgba(45, 212, 191, 0.5)' : 'linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%)',
                color: '#0a0f1e'
              }}
            >
              {isLoading ? 'Sending...' : 'Send Reset Code'}
            </button>
          </form>
        )}

        {/* Step 2: Enter Code */}
        {step === 2 && (
          <form onSubmit={handleVerifyCode}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#e8edf5', fontWeight: 500 }}>
                6-Digit Reset Code
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="123456"
                maxLength={6}
                style={{...inputStyle, textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem'}}
              />
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                Check Railway logs for the reset code (or contact admin)
              </p>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '1rem',
                fontSize: '1.1rem',
                fontWeight: '600',
                border: 'none',
                borderRadius: '12px',
                cursor: isLoading ? 'wait' : 'pointer',
                background: isLoading ? 'rgba(45, 212, 191, 0.5)' : 'linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%)',
                color: '#0a0f1e'
              }}
            >
              {isLoading ? 'Verifying...' : 'Verify Code'}
            </button>
          </form>
        )}

        {/* Step 3: New Password */}
        {step === 3 && (
          <form onSubmit={handleResetPassword}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#e8edf5', fontWeight: 500 }}>
                New Password
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 6 characters"
                style={inputStyle}
              />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#e8edf5', fontWeight: 500 }}>
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                style={inputStyle}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '1rem',
                fontSize: '1.1rem',
                fontWeight: '600',
                border: 'none',
                borderRadius: '12px',
                cursor: isLoading ? 'wait' : 'pointer',
                background: isLoading ? 'rgba(45, 212, 191, 0.5)' : 'linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%)',
                color: '#0a0f1e'
              }}
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        <p style={{
          marginTop: '1.5rem',
          textAlign: 'center',
          color: '#94a3b8',
          fontSize: '0.9rem'
        }}>
          Remember your password?{' '}
          <span 
            onClick={() => setCurrentPage('portal')}
            style={{ color: '#2dd4bf', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Back to Login
          </span>
        </p>
      </div>
    </div>
  );
}

// Admin Dashboard
function AdminDashboard({ user, token, onLogout }) {
  const [activeTab, setActiveTab] = useState('quotes');
  const [quotes, setQuotes] = useState([]);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [quoteResponse, setQuoteResponse] = useState({ amount: '', scope: '', duration: '' });

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch all quote requests (admin endpoint)
        const response = await fetch('https://gpc-backend-production.up.railway.app/api/admin/quotes', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        setQuotes(data.quoteRequests || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchData();
    }
  }, [token]);

 const handleSendQuote = async (quoteRequestId) => {
    try {
      // Find the quote request to get customer info
      const currentQuote = quotes.find(q => q.id === quoteRequestId);
      
      const response = await fetch(`https://gpc-backend-production.up.railway.app/api/admin/quotes/${quoteRequestId}/create-quote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: parseFloat(quoteResponse.amount),
          estimatedDuration: quoteResponse.duration,
          scopeOfWork: quoteResponse.scope,
          paymentTerms: '50% deposit, 50% on completion'
        })
      });

      if (response.ok) {
        // Send email notification to customer
        if (currentQuote && currentQuote.email && window.emailjs) {
          try {
            await window.emailjs.send(
              'service_nwt18xw',
              'template_djw315q',
              {
                to_email: currentQuote.email,
                to_name: currentQuote.first_name || 'Valued Customer',
                service_type: currentQuote.service_type || 'Home Improvement',
                quote_amount: quoteResponse.amount,
                duration: quoteResponse.duration || 'To be discussed'
              }
            );
            console.log('Quote notification email sent!');
          } catch (emailError) {
            console.error('Email send failed:', emailError);
          }
        }
        
        alert('Quote sent successfully!');
        setSelectedQuote(null);
        setQuoteResponse({ amount: '', scope: '', duration: '' });
        // Refresh quotes
        const refreshResponse = await fetch('https://gpc-backend-production.up.railway.app/api/admin/quotes', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await refreshResponse.json();
        setQuotes(data.quoteRequests || []);
      } else {
        alert('Failed to send quote');
      }
    } catch (error) {
      console.error('Error sending quote:', error);
      alert('Error sending quote');
    }
  };
  
  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return { bg: 'rgba(251, 191, 36, 0.1)', border: 'rgba(251, 191, 36, 0.3)', text: '#fbbf24' };
      case 'quoted': return { bg: 'rgba(45, 212, 191, 0.1)', border: 'rgba(45, 212, 191, 0.3)', text: '#2dd4bf' };
      case 'accepted': return { bg: 'rgba(34, 197, 94, 0.1)', border: 'rgba(34, 197, 94, 0.3)', text: '#22c55e' };
      case 'rejected': return { bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.3)', text: '#ef4444' };
      default: return { bg: 'rgba(168, 85, 247, 0.1)', border: 'rgba(168, 85, 247, 0.3)', text: '#a855f7' };
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h1 style={{
            fontFamily: '"DM Serif Display", serif',
            fontSize: '2.5rem',
            marginBottom: '0.5rem',
            color: '#e8edf5'
          }}>
            Admin Dashboard
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '1.05rem' }}>
            Welcome back, {user?.first_name || 'Admin'}! Manage quotes and projects.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span style={{
            padding: '0.5rem 1rem',
            background: 'rgba(168, 85, 247, 0.1)',
            border: '1px solid rgba(168, 85, 247, 0.3)',
            borderRadius: '8px',
            color: '#a855f7',
            fontSize: '0.9rem',
            fontWeight: '600'
          }}>
            ADMIN
          </span>
          <button
            onClick={onLogout}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '10px',
              color: '#ef4444',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600'
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          background: 'rgba(251, 191, 36, 0.1)',
          border: '1px solid rgba(251, 191, 36, 0.3)',
          borderRadius: '16px',
          padding: '1.5rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#fbbf24' }}>
            {quotes.filter(q => q.status === 'pending').length}
          </div>
          <div style={{ color: '#94a3b8' }}>Pending Quotes</div>
        </div>
        <div style={{
          background: 'rgba(45, 212, 191, 0.1)',
          border: '1px solid rgba(45, 212, 191, 0.3)',
          borderRadius: '16px',
          padding: '1.5rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#2dd4bf' }}>
            {quotes.filter(q => q.status === 'quoted').length}
          </div>
          <div style={{ color: '#94a3b8' }}>Quotes Sent</div>
        </div>
        <div style={{
          background: 'rgba(34, 197, 94, 0.1)',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          borderRadius: '16px',
          padding: '1.5rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#22c55e' }}>
            {quotes.filter(q => q.status === 'accepted').length}
          </div>
          <div style={{ color: '#94a3b8' }}>Accepted</div>
        </div>
        <div style={{
          background: 'rgba(168, 85, 247, 0.1)',
          border: '1px solid rgba(168, 85, 247, 0.3)',
          borderRadius: '16px',
          padding: '1.5rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#a855f7' }}>
            {quotes.length}
          </div>
          <div style={{ color: '#94a3b8' }}>Total Requests</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '2rem',
        borderBottom: '1px solid rgba(45, 212, 191, 0.15)',
        flexWrap: 'wrap'
      }}>
        {['quotes', 'projects', 'customers'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '1rem 1.5rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab ? '3px solid #2dd4bf' : '3px solid transparent',
              color: activeTab === tab ? '#2dd4bf' : '#94a3b8',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600',
              textTransform: 'capitalize'
            }}
          >
            {tab === 'quotes' ? `Quote Requests (${quotes.length})` : tab}
          </button>
        ))}
      </div>

      {/* Loading */}
      {isLoading && (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
          Loading...
        </div>
      )}

{/* Quotes Tab */}
      {!isLoading && activeTab === 'quotes' && (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {quotes.length === 0 ? (
            <div style={{
              background: 'rgba(26, 31, 53, 0.5)',
              border: '1px solid rgba(45, 212, 191, 0.15)',
              borderRadius: '16px',
              padding: '3rem',
              textAlign: 'center'
            }}>
              <h3 style={{ color: '#e8edf5', marginBottom: '0.5rem' }}>No Quote Requests Yet</h3>
              <p style={{ color: '#94a3b8' }}>When customers submit quotes, they'll appear here.</p>
            </div>
          ) : (
            quotes.map(quote => (
              <div
                key={quote.id}
                style={{
                  background: 'rgba(26, 31, 53, 0.5)',
                  border: '1px solid rgba(45, 212, 191, 0.15)',
                  borderRadius: '16px',
                  padding: '2rem',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'start',
                  marginBottom: '1.5rem',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}>
                  <div>
                    <h3 style={{
                      fontSize: '1.4rem',
                      marginBottom: '0.5rem',
                      color: '#e8edf5',
                      fontWeight: '600'
                    }}>
                      {quote.service_type || quote.title}
                    </h3>
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                      {new Date(quote.created_at).toLocaleDateString()} at {new Date(quote.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                  <div style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    background: getStatusColor(quote.status).bg,
                    border: `1px solid ${getStatusColor(quote.status).border}`,
                    color: getStatusColor(quote.status).text,
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    textTransform: 'capitalize'
                  }}>
                    {quote.status}
                  </div>
                </div>

                {/* Customer Info */}
                <div style={{
                  background: 'rgba(10, 15, 30, 0.5)',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  marginBottom: '1.5rem'
                }}>
                  <h4 style={{ color: '#2dd4bf', marginBottom: '0.75rem', fontSize: '0.9rem', fontWeight: '600' }}>
                    CUSTOMER INFO
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                    <p style={{ color: '#cbd5e1' }}>
                      <strong style={{ color: '#94a3b8' }}>Name:</strong> {quote.first_name} {quote.last_name}
                    </p>
                    <p style={{ color: '#cbd5e1' }}>
                      <strong style={{ color: '#94a3b8' }}>Email:</strong> {quote.email}
                    </p>
                    <p style={{ color: '#cbd5e1' }}>
                      <strong style={{ color: '#94a3b8' }}>Phone:</strong> {quote.phone || 'Not provided'}
                    </p>
                    <p style={{ color: '#cbd5e1' }}>
                      <strong style={{ color: '#94a3b8' }}>Address:</strong> {quote.address || 'Not provided'}
                    </p>
                  </div>
                </div>

                {/* Project Details */}
                <div style={{
                  background: 'rgba(10, 15, 30, 0.5)',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  marginBottom: '1.5rem'
                }}>
                  <h4 style={{ color: '#2dd4bf', marginBottom: '0.75rem', fontSize: '0.9rem', fontWeight: '600' }}>
                    PROJECT DETAILS
                  </h4>
                  <p style={{ color: '#cbd5e1', marginBottom: '0.75rem' }}>
                    <strong style={{ color: '#94a3b8' }}>Description:</strong><br />
                    {quote.description}
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem' }}>
                    <p style={{ color: '#cbd5e1' }}>
                      <strong style={{ color: '#94a3b8' }}>Urgency:</strong> {quote.urgency}
                    </p>
                    <p style={{ color: '#cbd5e1' }}>
                      <strong style={{ color: '#94a3b8' }}>Preferred Date:</strong> {quote.preferred_start_date ? new Date(quote.preferred_start_date).toLocaleDateString() : 'Flexible'}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                {quote.status === 'pending' && (
                  <div>
                    {selectedQuote === quote.id ? (
                      <div style={{
                        background: 'rgba(45, 212, 191, 0.05)',
                        border: '1px solid rgba(45, 212, 191, 0.2)',
                        borderRadius: '12px',
                        padding: '1.5rem'
                      }}>
                        <h4 style={{ color: '#2dd4bf', marginBottom: '1rem' }}>Send Quote to Customer</h4>
                        <div style={{ display: 'grid', gap: '1rem' }}>
                          <div>
                            <label style={{ display: 'block', color: '#cbd5e1', marginBottom: '0.5rem' }}>
                              Quote Amount ($)
                            </label>
                            <input
                              type="number"
                              value={quoteResponse.amount}
                              onChange={(e) => setQuoteResponse({...quoteResponse, amount: e.target.value})}
                              placeholder="5000"
                              style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                border: '1px solid rgba(45, 212, 191, 0.3)',
                                background: 'rgba(15, 23, 42, 0.5)',
                                color: '#e8edf5',
                                fontSize: '1rem'
                              }}
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', color: '#cbd5e1', marginBottom: '0.5rem' }}>
                              Estimated Duration
                            </label>
                            <input
                              type="text"
                              value={quoteResponse.duration}
                              onChange={(e) => setQuoteResponse({...quoteResponse, duration: e.target.value})}
                              placeholder="2-3 weeks"
                              style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                border: '1px solid rgba(45, 212, 191, 0.3)',
                                background: 'rgba(15, 23, 42, 0.5)',
                                color: '#e8edf5',
                                fontSize: '1rem'
                              }}
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', color: '#cbd5e1', marginBottom: '0.5rem' }}>
                              Scope of Work
                            </label>
                            <textarea
                              value={quoteResponse.scope}
                              onChange={(e) => setQuoteResponse({...quoteResponse, scope: e.target.value})}
                              placeholder="Detailed description of what's included..."
                              rows={3}
                              style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                border: '1px solid rgba(45, 212, 191, 0.3)',
                                background: 'rgba(15, 23, 42, 0.5)',
                                color: '#e8edf5',
                                fontSize: '1rem',
                                resize: 'vertical'
                              }}
                            />
                          </div>
                          <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                              onClick={() => handleSendQuote(quote.id)}
                              style={{
                                flex: 1,
                                padding: '0.875rem',
                                background: 'linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%)',
                                border: 'none',
                                borderRadius: '10px',
                                color: '#0a0f1e',
                                fontWeight: '600',
                                cursor: 'pointer'
                              }}
                            >
                              Send Quote
                            </button>
                            <button
                              onClick={() => setSelectedQuote(null)}
                              style={{
                                padding: '0.875rem 1.5rem',
                                background: 'transparent',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                borderRadius: '10px',
                                color: '#ef4444',
                                fontWeight: '600',
                                cursor: 'pointer'
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setSelectedQuote(quote.id)}
                        style={{
                          padding: '0.875rem 2rem',
                          background: 'linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%)',
                          border: 'none',
                          borderRadius: '10px',
                          color: '#0a0f1e',
                          fontWeight: '600',
                          cursor: 'pointer',
                          fontSize: '1rem'
                        }}
                      >
                        Create & Send Quote
                      </button>
                    )}
                  </div>
                )}

                {quote.status === 'quoted' && (
                  <div style={{
                    padding: '1rem',
                    background: 'rgba(45, 212, 191, 0.1)',
                    borderRadius: '10px',
                    color: '#2dd4bf'
                  }}>
                    ✓ Quote sent - waiting for customer response
                  </div>
                )}

                {quote.status === 'accepted' && (
                  <div style={{
                    padding: '1rem',
                    background: 'rgba(34, 197, 94, 0.1)',
                    borderRadius: '10px',
                    color: '#22c55e'
                  }}>
                    ✓ Quote accepted - Project created!
                  </div>
                )}

                {quote.status === 'declined' && (
                  <div style={{
                    padding: '1rem',
                    background: 'rgba(239, 68, 68, 0.1)',
                    borderRadius: '10px',
                    color: '#ef4444'
                  }}>
                    ✗ Quote declined by customer
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
          
      {/* Projects Tab */}
      {!isLoading && activeTab === 'projects' && (
        <div style={{
          background: 'rgba(26, 31, 53, 0.5)',
          border: '1px solid rgba(45, 212, 191, 0.15)',
          borderRadius: '16px',
          padding: '3rem',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#e8edf5', marginBottom: '0.5rem' }}>Projects Coming Soon</h3>
          <p style={{ color: '#94a3b8' }}>
            When customers accept quotes, projects will be created and managed here.
          </p>
        </div>
      )}

      {/* Customers Tab */}
      {!isLoading && activeTab === 'customers' && (
        <div style={{
          background: 'rgba(26, 31, 53, 0.5)',
          border: '1px solid rgba(45, 212, 191, 0.15)',
          borderRadius: '16px',
          padding: '3rem',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#e8edf5', marginBottom: '0.5rem' }}>Customer Management Coming Soon</h3>
          <p style={{ color: '#94a3b8' }}>
            View and manage all your customers here.
          </p>
        </div>
      )}
    </div>
  );
}

// Customer Portal
function CustomerPortal({ user, token, onLogout }) {
  const [activeTab, setActiveTab] = useState('projects');
  const [projects, setProjects] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user's data from backend
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [quotesResult, projectsResult, messagesResult] = await Promise.all([
          api.getMyQuotes(token),
          api.getMyProjects(token),
          api.getMessages(token)
        ]);
        
        setQuotes(quotesResult.quoteRequests || []);
        setProjects(projectsResult.projects || []);
        setMessages(messagesResult.messages || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchData();
    }
  }, [token]);

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header with Logout */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h1 style={{
            fontFamily: '"DM Serif Display", serif',
            fontSize: '2.5rem',
            marginBottom: '0.5rem',
            color: '#e8edf5'
          }}>
            Welcome, {user?.first_name || 'Customer'}!
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '1.05rem' }}>
            Here's an overview of your quotes and projects.
          </p>
        </div>
        <button
          onClick={onLogout}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '10px',
            color: '#ef4444',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '600',
            transition: 'all 0.3s ease'
          }}
        >
          Logout
        </button>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '2rem',
        borderBottom: '1px solid rgba(45, 212, 191, 0.15)',
        flexWrap: 'wrap'
      }}>
        {['quotes', 'projects', 'messages'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '1rem 1.5rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab ? '3px solid #2dd4bf' : '3px solid transparent',
              color: activeTab === tab ? '#2dd4bf' : '#94a3b8',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600',
              textTransform: 'capitalize',
              transition: 'all 0.3s ease'
            }}
          >
            {tab} {tab === 'quotes' && `(${quotes.length})`}
            {tab === 'projects' && `(${projects.length})`}
            {tab === 'messages' && `(${messages.length})`}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div style={{
          textAlign: 'center',
          padding: '4rem',
          color: '#94a3b8'
        }}>
          Loading your data...
        </div>
      )}

    {/* Quotes Tab */}
      {!isLoading && activeTab === 'quotes' && (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {quotes.length === 0 ? (
            <div style={{
              background: 'rgba(26, 31, 53, 0.5)',
              border: '1px solid rgba(45, 212, 191, 0.15)',
              borderRadius: '16px',
              padding: '3rem',
              textAlign: 'center',
              backdropFilter: 'blur(10px)'
            }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#e8edf5' }}>
                No Quote Requests Yet
              </h3>
              <p style={{ color: '#94a3b8' }}>
                Submit a quote request to get started!
              </p>
            </div>
          ) : (
            quotes.map(quote => (
              <CustomerQuoteCard 
                key={quote.id} 
                quote={quote} 
                token={token}
                onUpdate={async () => {
                  const result = await api.getMyQuotes(token);
                  setQuotes(result.quoteRequests || []);
                  const projectsResult = await api.getMyProjects(token);
                  setProjects(projectsResult.projects || []);
                }}
              />
            ))
          )}
        </div>
      )}
      
      {/* Projects Tab */}
      {!isLoading && activeTab === 'projects' && (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {projects.length === 0 ? (
            <div style={{
              background: 'rgba(26, 31, 53, 0.5)',
              border: '1px solid rgba(45, 212, 191, 0.15)',
              borderRadius: '16px',
              padding: '3rem',
              textAlign: 'center',
              backdropFilter: 'blur(10px)'
            }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#e8edf5' }}>
                No Active Projects
              </h3>
              <p style={{ color: '#94a3b8' }}>
                Once a quote is accepted, your project will appear here.
              </p>
            </div>
          ) : (
            projects.map(project => (
              <div
                key={project.id}
                style={{
                  background: 'rgba(26, 31, 53, 0.5)',
                  border: '1px solid rgba(45, 212, 191, 0.15)',
                  borderRadius: '16px',
                  padding: '2rem',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'start',
                  marginBottom: '1.5rem',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}>
                  <div>
                    <h3 style={{
                      fontSize: '1.5rem',
                      marginBottom: '0.5rem',
                      color: '#e8edf5',
                      fontWeight: '600'
                    }}>
                      {project.title}
                    </h3>
                    {project.start_date && (
                      <p style={{ color: '#94a3b8' }}>
                        Started: {new Date(project.start_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    background: project.status === 'in_progress' ? 'rgba(45, 212, 191, 0.1)' : 
                               project.status === 'completed' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(168, 85, 247, 0.1)',
                    border: `1px solid ${project.status === 'in_progress' ? 'rgba(45, 212, 191, 0.3)' : 
                                          project.status === 'completed' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(168, 85, 247, 0.3)'}`,
                    color: project.status === 'in_progress' ? '#2dd4bf' : 
                           project.status === 'completed' ? '#22c55e' : '#a855f7',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    textTransform: 'capitalize'
                  }}>
                    {project.status?.replace('_', ' ')}
                  </div>
                </div>

                {project.progress_percentage > 0 && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '0.5rem'
                    }}>
                      <span style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>Progress</span>
                      <span style={{ color: '#2dd4bf', fontWeight: '600' }}>{project.progress_percentage}%</span>
                    </div>
                    <div style={{
                      height: '8px',
                      background: 'rgba(45, 212, 191, 0.1)',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${project.progress_percentage}%`,
                        background: 'linear-gradient(90deg, #2dd4bf, #14b8a6)',
                        transition: 'width 0.5s ease'
                      }} />
                    </div>
                  </div>
                )}

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '1rem',
                  borderTop: '1px solid rgba(45, 212, 191, 0.1)'
                }}>
                  <span style={{ color: '#94a3b8' }}>
                    Total: <span style={{ color: '#2dd4bf', fontWeight: '600' }}>${project.total_amount?.toLocaleString()}</span>
                  </span>
                  <span style={{ color: '#94a3b8' }}>
                    Paid: <span style={{ color: '#22c55e', fontWeight: '600' }}>${project.amount_paid?.toLocaleString() || '0'}</span>
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Messages Tab */}
      {!isLoading && activeTab === 'messages' && (
        <div style={{
          background: 'rgba(26, 31, 53, 0.5)',
          border: '1px solid rgba(45, 212, 191, 0.15)',
          borderRadius: '16px',
          padding: '3rem',
          textAlign: 'center',
          backdropFilter: 'blur(10px)'
        }}>
          {messages.length === 0 ? (
            <>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#e8edf5' }}>
                No Messages Yet
              </h3>
              <p style={{ color: '#94a3b8' }}>
                Your messages with our team will appear here.
              </p>
            </>
          ) : (
            <div style={{ textAlign: 'left' }}>
              {messages.map(msg => (
                <div
                  key={msg.id}
                  style={{
                    padding: '1rem',
                    background: 'rgba(10, 15, 30, 0.5)',
                    borderRadius: '10px',
                    marginBottom: '0.75rem',
                    borderLeft: '3px solid #2dd4bf'
                  }}
                >
                  <div style={{
                    fontSize: '0.85rem',
                    color: '#94a3b8',
                    marginBottom: '0.25rem'
                  }}>
                    {msg.sender_first_name} {msg.sender_last_name} • {new Date(msg.created_at).toLocaleDateString()}
                  </div>
                  <div style={{ color: '#cbd5e1' }}>
                    {msg.message}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// About Page
function AboutPage() {
  return (
    <div style={{ padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 className="animate-in" style={{
          fontFamily: '"DM Serif Display", serif',
          fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
          marginBottom: '1rem',
          background: 'linear-gradient(135deg, #ffffff 0%, #2dd4bf 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          opacity: 0
        }}>
          About Greenwich Property Care
        </h1>
        <p className="animate-in" style={{
          fontSize: '1.15rem',
          color: '#cbd5e1',
          maxWidth: '700px',
          margin: '0 auto',
          lineHeight: '1.7',
          animationDelay: '0.2s',
          opacity: 0
        }}>
          We provide homeowners with trusted, vetted labor across all trades for all their home improvement needs. Quality work, transparent pricing, and exceptional service are at the heart of everything we do.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '2rem',
        marginBottom: '4rem'
      }}>
        {[
          { number: '10K+', label: 'Projects Completed' },
          { number: '500+', label: 'Verified Contractors' },
          { number: '4.9★', label: 'Average Rating' },
          { number: '98%', label: 'Satisfaction Rate' }
        ].map((stat, i) => (
          <div
            key={i}
            className="animate-scale"
            style={{
              background: 'rgba(26, 31, 53, 0.5)',
              border: '1px solid rgba(45, 212, 191, 0.15)',
              borderRadius: '16px',
              padding: '2.5rem',
              textAlign: 'center',
              backdropFilter: 'blur(10px)',
              animationDelay: `${0.1 * i}s`,
              opacity: 0
            }}
          >
            <div style={{
              fontSize: '3rem',
              fontWeight: '700',
              color: '#2dd4bf',
              marginBottom: '0.5rem',
              fontFamily: '"DM Serif Display", serif'
            }}>
              {stat.number}
            </div>
            <div style={{ color: '#cbd5e1', fontSize: '1.1rem' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      <div style={{
        background: 'rgba(45, 212, 191, 0.05)',
        border: '1px solid rgba(45, 212, 191, 0.2)',
        borderRadius: '20px',
        padding: '3rem',
        textAlign: 'center'
      }}>
        <h2 style={{
          fontFamily: '"DM Serif Display", serif',
          fontSize: '2rem',
          marginBottom: '1.5rem',
          color: '#e8edf5'
        }}>
          Get in Touch
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '2rem',
          maxWidth: '900px',
          margin: '0 auto'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'center' }}>
            <Phone size={24} color="#2dd4bf" />
            <div>
              <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Phone</div>
              <div style={{ color: '#e8edf5', fontWeight: '600' }}>203-350-2014</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'center' }}>
            <Mail size={24} color="#2dd4bf" />
            <div>
              <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Email</div>
              <div style={{ color: '#e8edf5', fontWeight: '600' }}>info@greenwichpropertycare.com</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'center' }}>
            <Clock size={24} color="#2dd4bf" />
            <div>
              <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Hours</div>
              <div style={{ color: '#e8edf5', fontWeight: '600' }}>24/7 Support</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Footer Component
function Footer({ setCurrentPage }) {
  return (
    <footer style={{
      background: 'rgba(10, 15, 30, 0.95)',
      borderTop: '1px solid rgba(45, 212, 191, 0.15)',
      padding: '3rem 2rem 2rem',
      marginTop: '6rem',
      position: 'relative',
      zIndex: 1
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '3rem',
        marginBottom: '3rem'
      }}>
        <div>
          <div style={{
            fontFamily: '"DM Serif Display", serif',
            fontSize: '1.5rem',
            marginBottom: '1rem',
            background: 'linear-gradient(135deg, #2dd4bf 0%, #a855f7 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Greenwich Property Care
          </div>
          <p style={{ color: '#94a3b8', lineHeight: '1.6', fontSize: '0.95rem' }}>
            Your trusted partner for all home improvement and maintenance needs.
          </p>
        </div>

        <div>
          <h4 style={{ color: '#e8edf5', marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '600' }}>
            Quick Links
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {['Services', 'Request Quote', 'About', 'Portal'].map(link => (
              <button
                key={link}
                onClick={() => setCurrentPage(link.toLowerCase().replace(' ', '-'))}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  textAlign: 'left',
                  padding: '0.25rem 0',
                  transition: 'color 0.3s ease'
                }}
                onMouseEnter={(e) => e.target.style.color = '#2dd4bf'}
                onMouseLeave={(e) => e.target.style.color = '#94a3b8'}
              >
                {link}
              </button>
            ))}
          </div>
        </div>

        <div>
  <h4 style={{
    color: '#e8edf5',
    marginBottom: '1rem',
    fontSize: '1.1rem',
    fontWeight: 600
  }}>
    Contact
  </h4>
  <div style={{ 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '0.75rem', 
    color: '#94a3b8', 
    fontSize: '0.95rem' 
  }}>
    <div>203-350-2014</div>
    <div>info@greenwichpropertycare.com</div>
    <div>24 Field Point Rd, Greenwich, CT 06830</div>
    <div>24/7 Customer Support</div>
  </div>
</div>
      </div>
      
      <div style={{
        borderTop: '1px solid rgba(45, 212, 191, 0.15)',
        paddingTop: '2rem',
        textAlign: 'center',
        color: '#94a3b8',
        fontSize: '0.9rem'
      }}>
        <p>© 2026 Greenwich Property Care. All rights reserved.</p>
      </div>
    </footer>
  );
}
