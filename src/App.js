import React, { useState, useEffect } from 'react';
import { Home, Calendar, CheckCircle, Users, MessageSquare, DollarSign, Search, Menu, X, ArrowRight, Star, Phone, Mail, MapPin, Clock } from 'lucide-react';

// Main App Component
export default function HomeCareWebsite() {
  const [currentPage, setCurrentPage] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState(null); // 'customer' or 'contractor'
  
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
        return <RequestQuotePage />;
      case 'portal':
        return isLoggedIn ? <CustomerPortal userType={userType} /> : <LoginPage setIsLoggedIn={setIsLoggedIn} setUserType={setUserType} />;
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
function RequestQuotePage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    serviceType: '',
    description: '',
    urgency: 'normal',
    preferredDate: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
  e.preventDefault();
  
  try {
    // Prepare email parameters matching our template
    const templateParams = {
      from_name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      service_type: formData.serviceType,
      urgency: formData.urgency,
      preferred_date: formData.preferredDate,
      message: formData.description
    };
    
    // Send email via EmailJS
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
            Check your email at <strong style={{ color: '#2dd4bf' }}>{formData.email}</strong> for updates.
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
          Tell us about your project and we'll get back to you with a detailed estimate
        </p>
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

          <div>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: '#cbd5e1',
              fontSize: '0.95rem',
              fontWeight: '500'
            }}>
              Service Type
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
              Project Description
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
            style={{
              marginTop: '1rem',
              padding: '1.1rem 2rem',
              fontSize: '1.1rem',
              fontWeight: '600',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              background: 'linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%)',
              color: '#0a0f1e',
              transition: 'all 0.3s ease',
              boxShadow: '0 8px 24px rgba(45, 212, 191, 0.3)',
              width: '100%'
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
            Submit Quote Request
          </button>
        </div>
      </form>
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
function LoginPage({ setIsLoggedIn, setUserType }) {
  const [loginType, setLoginType] = useState('customer');
  const [credentials, setCredentials] = useState({ email: '', password: '' });

  const handleLogin = (e) => {
    e.preventDefault();
    // Simulated login - connect to your auth system
    setIsLoggedIn(true);
    setUserType(loginType);
  };

  return (
    <div style={{ padding: '4rem 2rem', maxWidth: '500px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 className="animate-in" style={{
          fontFamily: '"DM Serif Display", serif',
          fontSize: '3rem',
          marginBottom: '1rem',
          background: 'linear-gradient(135deg, #ffffff 0%, #2dd4bf 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          opacity: 0
        }}>
          Portal Login
        </h1>
      </div>

      <form onSubmit={handleLogin} className="animate-scale" style={{
        background: 'rgba(26, 31, 53, 0.5)',
        border: '1px solid rgba(45, 212, 191, 0.15)',
        borderRadius: '24px',
        padding: '3rem',
        backdropFilter: 'blur(10px)',
        opacity: 0,
        animationDelay: '0.2s'
      }}>
        <div style={{ marginBottom: '2rem' }}>
          <div style={{
            display: 'flex',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            <button
              type="button"
              onClick={() => setLoginType('customer')}
              style={{
                flex: 1,
                padding: '0.875rem',
                border: loginType === 'customer' ? '2px solid #2dd4bf' : '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '10px',
                background: loginType === 'customer' ? 'rgba(45, 212, 191, 0.1)' : 'transparent',
                color: loginType === 'customer' ? '#2dd4bf' : '#94a3b8',
                cursor: 'pointer',
                fontWeight: '600',
                transition: 'all 0.3s ease'
              }}
            >
              Customer
            </button>
            <button
              type="button"
              onClick={() => setLoginType('contractor')}
              style={{
                flex: 1,
                padding: '0.875rem',
                border: loginType === 'contractor' ? '2px solid #2dd4bf' : '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '10px',
                background: loginType === 'contractor' ? 'rgba(45, 212, 191, 0.1)' : 'transparent',
                color: loginType === 'contractor' ? '#2dd4bf' : '#94a3b8',
                cursor: 'pointer',
                fontWeight: '600',
                transition: 'all 0.3s ease'
              }}
            >
              Contractor
            </button>
          </div>

          <InputField
            label="Email"
            type="email"
            required
            value={credentials.email}
            onChange={(e) => setCredentials({...credentials, email: e.target.value})}
          />
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <InputField
            label="Password"
            type="password"
            required
            value={credentials.password}
            onChange={(e) => setCredentials({...credentials, password: e.target.value})}
          />
        </div>

        <button
          type="submit"
          style={{
            width: '100%',
            padding: '1.1rem',
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
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 12px 32px rgba(45, 212, 191, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 8px 24px rgba(45, 212, 191, 0.3)';
          }}
        >
          Sign In
        </button>

        <p style={{
          marginTop: '1.5rem',
          textAlign: 'center',
          color: '#94a3b8',
          fontSize: '0.9rem'
        }}>
          Don't have an account? <span style={{ color: '#2dd4bf', cursor: 'pointer' }}>Sign up</span>
        </p>
      </form>
    </div>
  );
}

// Customer Portal
function CustomerPortal({ userType }) {
  const [activeTab, setActiveTab] = useState('projects');

  // Mock data - would come from your backend
  const projects = [
    {
      id: 1,
      title: 'Kitchen Remodel',
      status: 'In Progress',
      contractor: 'John Smith',
      startDate: '2026-01-15',
      progress: 65,
      updates: [
        { date: '2026-01-28', message: 'Cabinets installed, starting countertop work' },
        { date: '2026-01-20', message: 'Plumbing completed, electrical in progress' }
      ]
    },
    {
      id: 2,
      title: 'Bathroom Renovation',
      status: 'Pending Quote',
      contractor: null,
      startDate: null,
      progress: 0,
      updates: []
    }
  ];

  const quotes = [
    {
      id: 1,
      service: 'Kitchen Remodel',
      amount: 15000,
      status: 'Accepted',
      date: '2026-01-10'
    },
    {
      id: 2,
      service: 'Bathroom Renovation',
      amount: 8500,
      status: 'Pending',
      date: '2026-01-25'
    }
  ];

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '3rem' }}>
        <h1 style={{
          fontFamily: '"DM Serif Display", serif',
          fontSize: '2.5rem',
          marginBottom: '0.5rem',
          color: '#e8edf5'
        }}>
          {userType === 'customer' ? 'Customer Portal' : 'Contractor Dashboard'}
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '1.05rem' }}>
          Welcome back! Here's an overview of your {userType === 'customer' ? 'projects' : 'assignments'}.
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '2rem',
        borderBottom: '1px solid rgba(45, 212, 191, 0.15)',
        flexWrap: 'wrap'
      }}>
        {['projects', 'quotes', 'messages'].map(tab => (
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
            {tab}
          </button>
        ))}
      </div>

      {/* Projects Tab */}
      {activeTab === 'projects' && (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {projects.map(project => (
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
                  {project.contractor && (
                    <p style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Users size={16} />
                      Contractor: {project.contractor}
                    </p>
                  )}
                </div>
                <div style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  background: project.status === 'In Progress' ? 'rgba(45, 212, 191, 0.1)' : 'rgba(168, 85, 247, 0.1)',
                  border: `1px solid ${project.status === 'In Progress' ? 'rgba(45, 212, 191, 0.3)' : 'rgba(168, 85, 247, 0.3)'}`,
                  color: project.status === 'In Progress' ? '#2dd4bf' : '#a855f7',
                  fontSize: '0.9rem',
                  fontWeight: '600'
                }}>
                  {project.status}
                </div>
              </div>

              {project.progress > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '0.5rem'
                  }}>
                    <span style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>Progress</span>
                    <span style={{ color: '#2dd4bf', fontWeight: '600' }}>{project.progress}%</span>
                  </div>
                  <div style={{
                    height: '8px',
                    background: 'rgba(45, 212, 191, 0.1)',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${project.progress}%`,
                      background: 'linear-gradient(90deg, #2dd4bf, #14b8a6)',
                      transition: 'width 0.5s ease'
                    }} />
                  </div>
                </div>
              )}

              {project.updates.length > 0 && (
                <div>
                  <h4 style={{
                    fontSize: '1rem',
                    marginBottom: '1rem',
                    color: '#cbd5e1',
                    fontWeight: '600'
                  }}>
                    Recent Updates
                  </h4>
                  {project.updates.map((update, i) => (
                    <div
                      key={i}
                      style={{
                        padding: '1rem',
                        background: 'rgba(10, 15, 30, 0.5)',
                        borderRadius: '10px',
                        marginBottom: i < project.updates.length - 1 ? '0.75rem' : 0,
                        borderLeft: '3px solid #2dd4bf'
                      }}
                    >
                      <div style={{
                        fontSize: '0.85rem',
                        color: '#94a3b8',
                        marginBottom: '0.25rem'
                      }}>
                        {update.date}
                      </div>
                      <div style={{ color: '#cbd5e1' }}>
                        {update.message}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Quotes Tab */}
      {activeTab === 'quotes' && (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {quotes.map(quote => (
            <div
              key={quote.id}
              style={{
                background: 'rgba(26, 31, 53, 0.5)',
                border: '1px solid rgba(45, 212, 191, 0.15)',
                borderRadius: '16px',
                padding: '2rem',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1.5rem'
              }}
            >
              <div>
                <h3 style={{
                  fontSize: '1.3rem',
                  marginBottom: '0.5rem',
                  color: '#e8edf5',
                  fontWeight: '600'
                }}>
                  {quote.service}
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                  Submitted: {quote.date}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{
                  fontSize: '2rem',
                  fontWeight: '700',
                  color: '#2dd4bf',
                  marginBottom: '0.5rem'
                }}>
                  ${quote.amount.toLocaleString()}
                </div>
                <div style={{
                  padding: '0.4rem 1rem',
                  borderRadius: '8px',
                  background: quote.status === 'Accepted' ? 'rgba(45, 212, 191, 0.1)' : 'rgba(251, 191, 36, 0.1)',
                  border: `1px solid ${quote.status === 'Accepted' ? 'rgba(45, 212, 191, 0.3)' : 'rgba(251, 191, 36, 0.3)'}`,
                  color: quote.status === 'Accepted' ? '#2dd4bf' : '#fbbf24',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  display: 'inline-block'
                }}>
                  {quote.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Messages Tab */}
      {activeTab === 'messages' && (
        <div style={{
          background: 'rgba(26, 31, 53, 0.5)',
          border: '1px solid rgba(45, 212, 191, 0.15)',
          borderRadius: '16px',
          padding: '3rem',
          textAlign: 'center',
          backdropFilter: 'blur(10px)'
        }}>
          <MessageSquare size={48} color="#2dd4bf" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#e8edf5' }}>
            No Messages Yet
          </h3>
          <p style={{ color: '#94a3b8' }}>
            Your messages with contractors will appear here
          </p>
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
          We connect homeowners with trusted, vetted contractors for all their home improvement needs. Quality work, transparent pricing, and exceptional service are at the heart of everything we do.
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
