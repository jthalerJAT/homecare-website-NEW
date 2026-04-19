import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Calendar, CheckCircle, DollarSign, Menu, X, ArrowRight, Star, Phone, Mail, Clock, Plus, Send, ChevronDown, ChevronUp, Search, Settings, FileText, Briefcase, MessageSquare, Trash2, AlertCircle } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
 
// ============================================
// CONFIGURATION
// ============================================
const API_URL = process.env.REACT_APP_API_URL || 'https://gpc-backend-production.up.railway.app/api';
const STRIPE_PUBLIC_KEY = process.env.REACT_APP_STRIPE_PUBLIC_KEY || 'pk_test_REPLACE_ME';
const stripePromise = loadStripe(STRIPE_PUBLIC_KEY);
 
// ============================================
// SHARED STYLES
// ============================================
const COLORS = {
  bg: '#0a0a0a', cardBg: 'rgba(20, 20, 20, 0.5)', inputBg: 'rgba(15, 23, 42, 0.5)',
  red: '#dc2626', redDark: '#b91c1c', redLight: '#ef4444',
  green: '#22c55e', yellow: '#fbbf24', blue: '#3b82f6',
  text: '#f5f5f5', textMuted: '#a3a3a3', textLight: '#d4d4d4',
  border: 'rgba(220, 38, 38, 0.15)', borderRed: 'rgba(220, 38, 38, 0.3)',
};
const LOGO = "https://res.cloudinary.com/dorcgqudu/image/upload/f_auto,q_auto/gpc-nav-logo_qtnoxj";
 
const cardStyle = {
  background: COLORS.cardBg, border: `1px solid ${COLORS.border}`,
  borderRadius: '16px', padding: '20px', backdropFilter: 'blur(10px)'
};
 
const inputStyle = {
  width: '100%', padding: '0.875rem', borderRadius: '10px',
  border: `1px solid ${COLORS.borderRed}`, background: COLORS.inputBg,
  color: COLORS.text, fontSize: '1rem', boxSizing: 'border-box'
};
 
const labelStyle = { display: 'block', marginBottom: '0.5rem', color: COLORS.text, fontWeight: 500 };
 
const btnPrimary = {
  padding: '0.875rem 2rem', background: `linear-gradient(135deg, ${COLORS.red} 0%, ${COLORS.redDark} 100%)`,
  border: 'none', borderRadius: '12px', color: COLORS.bg, fontWeight: '600', cursor: 'pointer',
  fontSize: '1rem', transition: 'all 0.3s ease', boxShadow: '0 8px 24px rgba(220, 38, 38, 0.3)'
};
 
const btnSecondary = {
  padding: '0.75rem 1.5rem', background: 'transparent', border: `1px solid ${COLORS.borderRed}`,
  borderRadius: '10px', color: COLORS.redLight, fontWeight: '600', cursor: 'pointer', fontSize: '1rem'
};
 
const statusColors = {
  pending: { bg: 'rgba(251, 191, 36, 0.1)', border: 'rgba(251, 191, 36, 0.3)', text: '#fbbf24' },
  quoted: { bg: 'rgba(220, 38, 38, 0.1)', border: 'rgba(220, 38, 38, 0.3)', text: '#dc2626' },
  accepted: { bg: 'rgba(34, 197, 94, 0.1)', border: 'rgba(34, 197, 94, 0.3)', text: '#22c55e' },
  declined: { bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.3)', text: '#ef4444' },
  in_progress: { bg: 'rgba(59, 130, 246, 0.1)', border: 'rgba(59, 130, 246, 0.3)', text: '#3b82f6' },
  complete: { bg: 'rgba(34, 197, 94, 0.1)', border: 'rgba(34, 197, 94, 0.3)', text: '#22c55e' },
  closed: { bg: 'rgba(156, 163, 175, 0.1)', border: 'rgba(156, 163, 175, 0.3)', text: '#9ca3af' },
};
 
const getStatusColor = (status) => statusColors[status] || statusColors.pending;
 
// EST formatter
const formatDateEST = (dateStr) => {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-US', { timeZone: 'America/New_York' });
};
const formatTimeEST = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit' });
};
const formatDateTimeEST = (dateStr) => `${formatDateEST(dateStr)} ${formatTimeEST(dateStr)}`;
 
// ============================================
// API HELPER
// ============================================
const api = {
  register: async (userData) => {
    const r = await fetch(`${API_URL}/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(userData) });
    return r.json();
  },
  login: async (email, password) => {
    const r = await fetch(`${API_URL}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
    return r.json();
  },
  getMe: async (token) => {
    const r = await fetch(`${API_URL}/auth/me`, { headers: { 'Authorization': `Bearer ${token}` } });
    return r.json();
  },
  updateAccount: async (data, token) => {
    const r = await fetch(`${API_URL}/auth/update-account`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(data) });
    return r.json();
  },
  changePassword: async (data, token) => {
    const r = await fetch(`${API_URL}/auth/change-password`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(data) });
    return r.json();
  },
  submitQuote: async (quoteData, token) => {
    const r = await fetch(`${API_URL}/quotes/request`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': token ? `Bearer ${token}` : '' }, body: JSON.stringify(quoteData) });
    return r.json();
  },
  getMyQuotes: async (token) => {
    const r = await fetch(`${API_URL}/quotes/my-requests`, { headers: { 'Authorization': `Bearer ${token}` } });
    return r.json();
  },
  getMyProjects: async (token) => {
    const r = await fetch(`${API_URL}/projects/my-projects`, { headers: { 'Authorization': `Bearer ${token}` } });
    return r.json();
  },
  getProjectDetails: async (projectId, token) => {
    const r = await fetch(`${API_URL}/projects/${projectId}`, { headers: { 'Authorization': `Bearer ${token}` } });
    return r.json();
  },
  acceptQuote: async (quoteId, token) => {
    const r = await fetch(`${API_URL}/quotes/${quoteId}/accept`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } });
    return r.json();
  },
  declineQuote: async (quoteId, token) => {
    const r = await fetch(`${API_URL}/quotes/${quoteId}/decline`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } });
    return r.json();
  },
  getMessages: async (type, id, token) => {
    const r = await fetch(`${API_URL}/messages/${type}/${id}`, { headers: { 'Authorization': `Bearer ${token}` } });
    return r.json();
  },
  sendMessage: async (data, token) => {
    const r = await fetch(`${API_URL}/messages`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(data) });
    return r.json();
  },
  uploadPhoto: async (image, token) => {
    const r = await fetch(`${API_URL}/upload-photo`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ image }) });
    return r.json();
  },
  acceptChangeOrder: async (id, token) => {
    const r = await fetch(`${API_URL}/change-orders/${id}/accept`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } });
    return r.json();
  },
  declineChangeOrder: async (id, token) => {
    const r = await fetch(`${API_URL}/change-orders/${id}/decline`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } });
    return r.json();
  },
  agreeComplete: async (projectId, token) => {
    const r = await fetch(`${API_URL}/projects/${projectId}/agree-complete`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } });
    return r.json();
  },
  disagreeComplete: async (projectId, reason, token) => {
    const r = await fetch(`${API_URL}/projects/${projectId}/disagree-complete`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ reason }) });
    return r.json();
  },
  createPaymentIntent: async (projectId, paymentType, token) => {
    const r = await fetch(`${API_URL}/payments/create-intent`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ projectId, paymentType }) });
    return r.json();
  },
  confirmPayment: async (paymentIntentId, token) => {
    const r = await fetch(`${API_URL}/payments/confirm`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ paymentIntentId }) });
    return r.json();
  },
  createSetupIntent: async (token) => {
    const r = await fetch(`${API_URL}/payments/setup-intent`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } });
    return r.json();
  },
  saveCard: async (paymentMethodId, token) => {
    const r = await fetch(`${API_URL}/payments/save-card`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ paymentMethodId }) });
    return r.json();
  },
  // Admin
  adminGetQuotes: async (token) => {
    const r = await fetch(`${API_URL}/admin/quotes`, { headers: { 'Authorization': `Bearer ${token}` } }); return r.json();
  },
  adminGetProjects: async (token) => {
    const r = await fetch(`${API_URL}/admin/projects`, { headers: { 'Authorization': `Bearer ${token}` } }); return r.json();
  },
  adminGetTodaysJobs: async (token) => {
    const r = await fetch(`${API_URL}/admin/todays-jobs`, { headers: { 'Authorization': `Bearer ${token}` } }); return r.json();
  },
  adminCreateQuote: async (requestId, data, token) => {
    const r = await fetch(`${API_URL}/admin/quotes/${requestId}/create-quote`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(data) });
    return r.json();
  },
  adminEditProject: async (projectId, data, token) => {
    const r = await fetch(`${API_URL}/admin/projects/${projectId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(data) });
    return r.json();
  },
  adminDeleteProject: async (projectId, token) => {
    const r = await fetch(`${API_URL}/admin/projects/${projectId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } }); return r.json();
  },
  adminDeleteQuote: async (quoteRequestId, token) => {
    const r = await fetch(`${API_URL}/admin/quotes/${quoteRequestId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } }); return r.json();
  },
  adminMarkComplete: async (projectId, token) => {
    const r = await fetch(`${API_URL}/admin/projects/${projectId}/mark-complete`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } }); return r.json();
  },
  adminCloseProject: async (projectId, token) => {
    const r = await fetch(`${API_URL}/admin/projects/${projectId}/close`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } }); return r.json();
  },
  adminCreateChangeOrder: async (data, token) => {
    const r = await fetch(`${API_URL}/admin/change-orders`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(data) });
    return r.json();
  },
  adminSearch: async (params, token) => {
    const qs = new URLSearchParams(params).toString();
    const r = await fetch(`${API_URL}/admin/search?${qs}`, { headers: { 'Authorization': `Bearer ${token}` } }); return r.json();
  },
  adminGetCustomers: async (token) => {
    const r = await fetch(`${API_URL}/admin/customers`, { headers: { 'Authorization': `Bearer ${token}` } }); return r.json();
  },
  adminGetConversations: async (token) => {
    const r = await fetch(`${API_URL}/admin/conversations`, { headers: { 'Authorization': `Bearer ${token}` } }); return r.json();
  },
  adminGetReps: async (token) => {
    const r = await fetch(`${API_URL}/admin/reps`, { headers: { 'Authorization': `Bearer ${token}` } }); return r.json();
  },
  adminAddRep: async (data, token) => {
    const r = await fetch(`${API_URL}/admin/reps`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(data) });
    return r.json();
  },
  adminDeleteRep: async (repId, token) => {
    const r = await fetch(`${API_URL}/admin/reps/${repId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } }); return r.json();
  },
  adminAssignRep: async (projectId, repId, token) => {
    const r = await fetch(`${API_URL}/admin/rep-assignments`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ projectId, repId }) });
    return r.json();
  },
  adminRemoveRepAssignment: async (assignmentId, token) => {
    const r = await fetch(`${API_URL}/admin/rep-assignments/${assignmentId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } }); return r.json();
  },
  adminGetRepAssignments: async (token) => {
    const r = await fetch(`${API_URL}/admin/rep-assignments`, { headers: { 'Authorization': `Bearer ${token}` } }); return r.json();
  },
  adminGetProjectReps: async (projectId, token) => {
    const r = await fetch(`${API_URL}/admin/projects/${projectId}/reps`, { headers: { 'Authorization': `Bearer ${token}` } }); return r.json();
  },
  // Rep
  repGetMyJobs: async (token) => {
    const r = await fetch(`${API_URL}/rep/my-jobs`, { headers: { 'Authorization': `Bearer ${token}` } }); return r.json();
  },
};
 
// ============================================
// MAIN APP COMPONENT
// ============================================
export default function HomeCareWebsite() {
  const [currentPage, setCurrentPage] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
 
  useEffect(() => {
    const savedToken = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
  }, []);
 
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
 
  const refreshUser = async () => {
    if (token) {
      try {
        const result = await api.getMe(token);
        if (result.user) {
          setUser(result.user);
          localStorage.setItem('user', JSON.stringify(result.user));
        }
      } catch (e) { console.error('Failed to refresh user:', e); }
    }
  };
 
  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <HomePage setCurrentPage={setCurrentPage} />;
      case 'services': return <ServicesPage setCurrentPage={setCurrentPage} />;
      case 'request-quote':
        return <RequestQuotePage user={user} token={token} isAuthenticated={isAuthenticated} setCurrentPage={setCurrentPage} />;
      case 'portal':
        if (!isAuthenticated) return <LoginPage onLoginSuccess={handleLogin} setCurrentPage={setCurrentPage} />;
        if (['admin', 'master_admin'].includes(user?.user_type)) return <AdminDashboard user={user} token={token} onLogout={handleLogout} />;
        if (user?.user_type === 'rep') return <RepPortal user={user} token={token} onLogout={handleLogout} />;
        return <CustomerPortal user={user} token={token} onLogout={handleLogout} setCurrentPage={setCurrentPage} refreshUser={refreshUser} />;
      case 'register': return <RegisterPage onRegisterSuccess={handleLogin} setCurrentPage={setCurrentPage} />;
      case 'forgot-password': return <ForgotPasswordPage setCurrentPage={setCurrentPage} />;
      case 'about': return <AboutPage />;
      default: return <HomePage setCurrentPage={setCurrentPage} />;
    }
  };
 
  return (
    <div style={{ fontFamily: '"Barlow", "Instrument Sans", -apple-system, sans-serif', minHeight: '100vh', background: COLORS.bg, color: COLORS.text, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'fixed', top: '-50%', left: '-50%', width: '200%', height: '200%', background: 'radial-gradient(circle at 30% 50%, rgba(220, 38, 38, 0.08) 0%, transparent 50%), radial-gradient(circle at 70% 70%, rgba(255, 255, 255, 0.05) 0%, transparent 50%)', animation: 'drift 30s ease-in-out infinite', pointerEvents: 'none', zIndex: 0 }} />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700;800&family=Oswald:wght@400;500;600;700&display=swap');
        @keyframes drift { 0%, 100% { transform: translate(0, 0) rotate(0deg); } 50% { transform: translate(-5%, 5%) rotate(2deg); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideInLeft { from { opacity: 0; transform: translateX(-40px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        .animate-in { animation: fadeInUp 0.8s ease-out forwards; }
        .animate-slide { animation: slideInLeft 0.7s ease-out forwards; }
        .animate-scale { animation: scaleIn 0.6s ease-out forwards; }
        * { box-sizing: border-box; scrollbar-width: thin; scrollbar-color: rgba(220,38,38,0.3) transparent; }
        *::-webkit-scrollbar { width: 6px; }
        *::-webkit-scrollbar-track { background: transparent; }
        *::-webkit-scrollbar-thumb { background: rgba(220,38,38,0.3); border-radius: 3px; }
        input::placeholder, textarea::placeholder { color: #6b7280; }
      `}</style>
 
      {/* NAVIGATION */}
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: '#0a0a0a',
        borderBottom: '3px solid #dc2626',
        boxShadow: '0 4px 16px rgba(0,0,0,0.4)'
      }}>
        <div className="nav-inner" style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 2rem',
          height: '220px',
          display: 'grid',
          gridTemplateColumns: '300px 1fr auto',
          alignItems: 'center',
          gap: '6rem'
        }}>
          <div
            onClick={() => setCurrentPage('home')}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          >
            <img
              src={LOGO}
              alt="Greenwich Property Care"
              style={{ height: '216px', width: 'auto', display: 'block' }}
            />
          </div>

          {/* Desktop Menu */}
          <div className="desktop-nav" style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
            {[
              { key: 'home', label: 'Home' },
              { key: 'services', label: 'Services' },
              { key: 'request-quote', label: 'Get Quote' },
              { key: 'about', label: 'About' },
              { key: 'portal', label: isAuthenticated ? 'My Account' : 'Login' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => { setCurrentPage(key); setMobileMenuOpen(false); }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: currentPage === key ? '#dc2626' : '#f5f5f5',
                  cursor: 'pointer',
                  fontSize: '1.15rem',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  padding: '0.5rem 0',
                  letterSpacing: '0.01em'
                }}
                onMouseEnter={(e) => e.target.style.color = '#dc2626'}
                onMouseLeave={(e) => e.target.style.color = currentPage === key ? '#dc2626' : '#f5f5f5'}
              >
                {label}
                {currentPage === key && (
                  <div style={{
                    position: 'absolute',
                    bottom: '-2px',
                    left: 0,
                    right: 0,
                    height: '2px',
                    background: 'linear-gradient(90deg, #dc2626, #ef4444)',
                    borderRadius: '2px'
                  }} />
                )}
              </button>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-menu-btn"
            style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', display: 'none' }}
          >
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div style={{
            background: '#0a0a0a',
            borderTop: '1px solid rgba(220, 38, 38, 0.3)',
            padding: '20px'
          }}>
            {['home', 'services', 'request-quote', 'about', 'portal'].map(page => (
              <button
                key={page}
                onClick={() => { setCurrentPage(page); setMobileMenuOpen(false); }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: currentPage === page ? '#dc2626' : '#f5f5f5',
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
                {page === 'request-quote' ? 'Get Quote' : page === 'portal' ? (isAuthenticated ? 'My Account' : 'Login') : page}
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* RESPONSIVE CSS */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
          .nav-inner { height: 120px !important; grid-template-columns: 1fr auto !important; gap: 1rem !important; }
          .nav-inner img { height: 100px !important; }
        }
      `}</style>
 
      {/* PAGE CONTENT */}
      <div style={{ position: 'relative', zIndex: 1, minHeight: 'calc(100vh - 200px)' }}>
        {renderPage()}
      </div>
 
      <Footer setCurrentPage={setCurrentPage} />
    </div>
  );
}
 
// ============================================
// MESSAGE CHAT COMPONENT (reusable)
// ============================================
function MessageChat({ type, id, token, currentUser, readOnly = false }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [attachments, setAttachments] = useState([]); // [{ id, url, preview }]
  const [attaching, setAttaching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const scrollContainerRef = useRef(null);
  const lastMessageCountRef = useRef(0);
  const justSentRef = useRef(false);

  const isStaff = ['admin', 'master_admin', 'rep'].includes(currentUser?.user_type);
  const liveTitle = isStaff ? 'Message Customer' : 'Message Your Rep';
  const API_BASE = API_URL.replace(/\/api$/, '');

  const parseAttachments = (raw) => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    try { return JSON.parse(raw); } catch { return []; }
  };

  const resolveUrl = (a) => {
    const u = typeof a === 'string' ? a : (a.url || '');
    if (!u) return '';
    return u.startsWith('http') ? u : `${API_BASE}${u}`;
  };

  const fetchMessages = useCallback(async () => {
    try {
      const result = await api.getMessages(type, id, token);
      setMessages(result.messages || []);
    } catch (e) { console.error('Error fetching messages:', e); }
    finally { setIsLoading(false); }
  }, [type, id, token]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  // Scroll the inner container to the bottom ONLY when the user just sent a message,
  // or on first expand. Never scroll on poll-driven refreshes — that hijacks page scroll.
  useEffect(() => {
    if (!expanded) return;
    const shouldScroll =
      justSentRef.current ||                                 // user just pressed send
      (messages.length > 0 && lastMessageCountRef.current === 0); // initial load after open
    if (shouldScroll && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
    justSentRef.current = false;
    lastMessageCountRef.current = messages.length;
  }, [messages, expanded]);

  // Poll for new messages every 10s
  useEffect(() => {
    if (readOnly) return;
    const interval = setInterval(fetchMessages, 10000);
    return () => clearInterval(interval);
  }, [fetchMessages, readOnly]);

  const handleAttach = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('Please select an image file.'); return; }
    if (file.size > 10 * 1024 * 1024) { alert('File is too large (max 10MB).'); return; }
    setAttaching(true);
    try {
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const r = await api.uploadPhoto(base64, token);
      if (r.id && r.url) {
        setAttachments(prev => [...prev, { id: r.id, url: r.url, preview: base64 }]);
      } else {
        alert(r.error || 'Upload failed');
      }
    } catch (err) { alert('Upload failed.'); console.error(err); }
    finally { setAttaching(false); }
  };

  const removeAttachment = (attId) => setAttachments(prev => prev.filter(a => a.id !== attId));

  const handleSend = async () => {
    if ((!newMessage.trim() && attachments.length === 0) || isSending) return;
    setIsSending(true);
    try {
      const payload = attachments.map(a => ({ id: a.id, url: a.url }));
      const base = type === 'quote' ? { quoteRequestId: id } : { projectId: id };
      const data = { ...base, message: newMessage, attachments: payload };
      await api.sendMessage(data, token);
      setNewMessage('');
      setAttachments([]);
      justSentRef.current = true;
      fetchMessages();
    } catch (e) { console.error('Error sending message:', e); }
    finally { setIsSending(false); }
  };

  const isOwnMessage = (msg) => msg.sender_id === currentUser?.id;
 
  return (
    <div style={{ marginTop: '15px' }}>
      <div onClick={() => setExpanded(!expanded)}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: COLORS.red, fontWeight: 600, marginBottom: '10px' }}>
        <MessageSquare size={16} />
        {readOnly ? 'Quote Messaging History' : liveTitle}
        <span style={{ color: COLORS.textMuted, fontSize: '0.85rem' }}>({messages.length} messages)</span>
        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </div>
 
      {expanded && (
        <div style={{ background: 'rgba(10,10,10,0.5)', borderRadius: '12px', border: `1px solid ${COLORS.border}`, overflow: 'hidden' }}>
          <div ref={scrollContainerRef} style={{ maxHeight: '350px', overflowY: 'auto', padding: '15px' }}>
            {isLoading ? <p style={{ color: COLORS.textMuted, textAlign: 'center' }}>Loading messages...</p> :
             messages.length === 0 ? <p style={{ color: COLORS.textMuted, textAlign: 'center', fontStyle: 'italic' }}>No messages yet</p> :
             messages.map((msg, i) => {
               const own = isOwnMessage(msg);
               const isSystem = msg.message_type === 'system' || msg.message_type === 'job_complete';
               if (isSystem) {
                 return (
                   <div key={msg.id || i} style={{ textAlign: 'center', margin: '10px 0', padding: '10px', background: msg.message_type === 'job_complete' ? 'rgba(34,197,94,0.15)' : 'rgba(59,130,246,0.1)', borderRadius: '10px', border: `1px solid ${msg.message_type === 'job_complete' ? 'rgba(34,197,94,0.3)' : 'rgba(59,130,246,0.2)'}` }}>
                     <p style={{ color: msg.message_type === 'job_complete' ? COLORS.green : COLORS.blue, fontWeight: 600, fontSize: '0.95rem' }}>{msg.message}</p>
                     <p style={{ color: COLORS.textMuted, fontSize: '0.75rem', fontStyle: 'italic', marginTop: '4px' }}>{formatDateTimeEST(msg.created_at)}</p>
                   </div>
                 );
               }
               const msgAttachments = parseAttachments(msg.attachments);
               return (
                 <div key={msg.id || i} style={{ display: 'flex', justifyContent: own ? 'flex-end' : 'flex-start', marginBottom: '10px' }}>
                   <div style={{ maxWidth: '75%', padding: '10px 14px', borderRadius: '12px', background: own ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.08)', border: `1px solid ${own ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.1)'}` }}>
                     <p style={{ color: COLORS.textMuted, fontSize: '0.75rem', marginBottom: '4px', fontWeight: 600 }}>
                       {msg.first_name} {msg.last_name}
                     </p>
                     {msg.message && <p style={{ color: COLORS.text, fontSize: '0.95rem', lineHeight: '1.4', wordBreak: 'break-word' }}>{msg.message}</p>}
                     {msgAttachments.length > 0 && (
                       <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: msg.message ? '6px' : 0 }}>
                         {msgAttachments.map((a, ai) => (
                           <a key={a.id || ai} href={resolveUrl(a)} target="_blank" rel="noreferrer" style={{ display: 'block' }}>
                             <img src={resolveUrl(a)} alt="attachment" style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '8px', border: `1px solid ${COLORS.border}` }} />
                           </a>
                         ))}
                       </div>
                     )}
                     <p style={{ color: COLORS.textMuted, fontSize: '0.7rem', fontStyle: 'italic', marginTop: '4px', textAlign: 'right' }}>
                       {formatDateTimeEST(msg.created_at)}
                     </p>
                   </div>
                 </div>
               );
             })}
          </div>
 
          {!readOnly && (
            <div style={{ padding: '12px', borderTop: `1px solid ${COLORS.border}` }}>
              {attachments.length > 0 && (
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                  {attachments.map(a => (
                    <div key={a.id} style={{ position: 'relative', width: '56px', height: '56px', borderRadius: '8px', overflow: 'hidden', border: `1px solid ${COLORS.border}` }}>
                      <img src={a.preview} alt="attachment" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button type="button" onClick={() => removeAttachment(a.id)}
                        style={{ position: 'absolute', top: '2px', right: '2px', width: '18px', height: '18px', borderRadius: '50%', background: 'rgba(0,0,0,0.7)', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ display: 'flex', gap: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', background: 'transparent', border: `1px solid ${COLORS.borderRed}`, borderRadius: '10px', cursor: attaching ? 'wait' : 'pointer', color: COLORS.red }} title="Attach photo">
                  {attaching ? '…' : <Plus size={18} />}
                  <input type="file" accept="image/*" onChange={handleAttach} disabled={attaching} style={{ display: 'none' }} />
                </label>
                <input value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder="Type a message..."
                  style={{ ...inputStyle, flex: 1, padding: '10px 14px', borderRadius: '10px' }} />
                <button onClick={handleSend} disabled={isSending || (!newMessage.trim() && attachments.length === 0)}
                  style={{ ...btnPrimary, padding: '10px 16px', borderRadius: '10px', opacity: isSending || (!newMessage.trim() && attachments.length === 0) ? 0.5 : 1 }}>
                  <Send size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
 
// ============================================
// STRIPE PAYMENT FORM
// ============================================
function StripePaymentForm({ projectId, paymentType, amount, token, onSuccess, onCancel }) {
  return (
    <Elements stripe={stripePromise}>
      <PaymentFormInner projectId={projectId} paymentType={paymentType} amount={amount} token={token} onSuccess={onSuccess} onCancel={onCancel} />
    </Elements>
  );
}
 
function PaymentFormInner({ projectId, paymentType, amount, token, onSuccess, onCancel }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [clientSecret, setClientSecret] = useState('');
 
  useEffect(() => {
    const createIntent = async () => {
      try {
        const result = await api.createPaymentIntent(projectId, paymentType, token);
        if (result.clientSecret) setClientSecret(result.clientSecret);
        else setError(result.error || 'Failed to initialize payment');
      } catch (e) { setError('Failed to connect to payment service'); }
    };
    createIntent();
  }, [projectId, paymentType, token]);
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements || !clientSecret) return;
    setIsProcessing(true);
    setError('');
 
    const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: elements.getElement(CardElement) }
    });
 
    if (stripeError) {
      setError(stripeError.message);
      setIsProcessing(false);
    } else if (paymentIntent.status === 'succeeded') {
      await api.confirmPayment(paymentIntent.id, token);
      onSuccess();
    }
  };
 
  return (
    <div style={{ ...cardStyle, border: `1px solid ${COLORS.borderRed}` }}>
      <h4 style={{ color: COLORS.red, marginBottom: '15px' }}>
        {paymentType === 'deposit' ? 'Pay 20% Deposit' : 'Make Final Payment'}: ${parseFloat(amount).toFixed(2)}
      </h4>
      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '10px', marginBottom: '15px', color: COLORS.redLight }}>{error}</div>}
      <div style={{ background: COLORS.inputBg, border: `1px solid ${COLORS.borderRed}`, borderRadius: '10px', padding: '14px', marginBottom: '15px' }}>
        <CardElement options={{ style: { base: { fontSize: '16px', color: COLORS.text, '::placeholder': { color: '#6b7280' } } } }} />
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={handleSubmit} disabled={isProcessing || !stripe || !clientSecret}
          style={{ ...btnPrimary, flex: 1, opacity: isProcessing ? 0.6 : 1 }}>
          {isProcessing ? 'Processing...' : `Pay $${parseFloat(amount).toFixed(2)}`}
        </button>
        <button onClick={onCancel} style={btnSecondary}>Cancel</button>
      </div>
    </div>
  );
}
 
// ============================================
// STATUS BADGE
// ============================================
function StatusBadge({ status }) {
  const sc = getStatusColor(status);
  return (
    <span style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', background: sc.bg, border: `1px solid ${sc.border}`, color: sc.text, fontSize: '0.8rem', fontWeight: '600', textTransform: 'capitalize' }}>
      {status?.replace('_', ' ')}
    </span>
  );
}
 
// ============================================
// JOB WINDOW (reusable list item)
// ============================================
function JobWindow({ children, onClick, style = {} }) {
  return (
    <div onClick={onClick}
      style={{ ...cardStyle, cursor: onClick ? 'pointer' : 'default', border: `2px solid ${COLORS.borderRed}`, transition: 'all 0.2s ease', ...style }}
      onMouseEnter={(e) => { if (onClick) e.currentTarget.style.borderColor = COLORS.red; }}
      onMouseLeave={(e) => { if (onClick) e.currentTarget.style.borderColor = COLORS.borderRed; }}>
      {children}
    </div>
  );
}
 
// ============================================
// CONFIRM DIALOG
// ============================================
function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ ...cardStyle, maxWidth: '400px', textAlign: 'center' }}>
        <AlertCircle size={40} style={{ color: COLORS.yellow, marginBottom: '15px' }} />
        <p style={{ color: COLORS.text, fontSize: '1.1rem', marginBottom: '20px' }}>{message}</p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button onClick={onConfirm} style={{ ...btnPrimary, padding: '10px 24px' }}>Yes</button>
          <button onClick={onCancel} style={{ ...btnSecondary, padding: '10px 24px' }}>No</button>
        </div>
      </div>
    </div>
  );
}
 
// ============================================
// CUSTOMER PORTAL
// ============================================
function CustomerPortal({ user, token, onLogout, setCurrentPage, refreshUser }) {
  const [activeTab, setActiveTab] = useState('open-quotes');
  const [quotes, setQuotes] = useState([]);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
 
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [quotesResult, projectsResult] = await Promise.all([
        api.getMyQuotes(token),
        api.getMyProjects(token)
      ]);
      setQuotes(quotesResult.quoteRequests || []);
      setProjects(projectsResult.projects || []);
    } catch (e) { console.error('Error fetching data:', e); }
    finally { setIsLoading(false); }
  }, [token]);
 
  useEffect(() => { if (token) fetchData(); }, [token, fetchData]);
 
  const openQuotes = quotes.filter(q => ['pending', 'quoted'].includes(q.status));
  const openJobs = projects.filter(p => ['pending', 'in_progress', 'complete'].includes(p.status));
  const pastJobs = projects.filter(p => p.status === 'closed');
 
  const tabs = [
    { key: 'request-quote', label: 'Request Quote', icon: <FileText size={16} /> },
    { key: 'open-quotes', label: `Open Quotes (${openQuotes.length})`, icon: <Clock size={16} /> },
    { key: 'open-jobs', label: `Open Jobs (${openJobs.length})`, icon: <Briefcase size={16} /> },
    { key: 'past-jobs', label: `Past Jobs (${pastJobs.length})`, icon: <CheckCircle size={16} /> },
    { key: 'settings', label: 'Settings', icon: <Settings size={16} /> },
  ];
 
  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h1 style={{ fontFamily: '"Oswald", sans-serif', fontSize: '2.2rem', marginBottom: '0.3rem', color: COLORS.text }}>
            Welcome, {user?.first_name || 'Customer'}!
          </h1>
          <p style={{ color: COLORS.textMuted }}>Manage your quotes and projects.</p>
        </div>
        <button onClick={onLogout} style={btnSecondary}>Logout</button>
      </div>
 
      <div style={{ display: 'flex', gap: '5px', marginBottom: '20px', borderBottom: `1px solid ${COLORS.border}`, flexWrap: 'wrap' }}>
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            style={{ padding: '0.8rem 1.2rem', background: 'none', border: 'none', borderBottom: activeTab === tab.key ? `3px solid ${COLORS.red}` : '3px solid transparent', color: activeTab === tab.key ? COLORS.red : COLORS.textMuted, cursor: 'pointer', fontSize: '0.95rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s ease' }}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>
 
      {isLoading && <div style={{ textAlign: 'center', padding: '4rem', color: COLORS.textMuted }}>Loading your data...</div>}
 
      {!isLoading && activeTab === 'request-quote' && (
        <RequestQuotePage user={user} token={token} isAuthenticated={true} setCurrentPage={setCurrentPage} onSuccess={() => { setActiveTab('open-quotes'); fetchData(); }} embedded />
      )}
 
      {!isLoading && activeTab === 'open-quotes' && (
        <OpenQuotesTab quotes={openQuotes} token={token} user={user} onRefresh={fetchData} goToSettings={() => setActiveTab('settings')} />
      )}
 
      {!isLoading && activeTab === 'open-jobs' && (
        <OpenJobsTab projects={openJobs} token={token} user={user} onRefresh={fetchData} refreshUser={refreshUser} />
      )}
 
      {!isLoading && activeTab === 'past-jobs' && (
        <PastJobsTab projects={pastJobs} token={token} user={user} />
      )}

      {!isLoading && activeTab === 'settings' && (
        <AccountSettingsPage user={user} token={token} refreshUser={refreshUser} setCurrentPage={setCurrentPage} />
      )}
    </div>
  );
}

// ============================================
// OPEN QUOTES TAB
// ============================================
function OpenQuotesTab({ quotes, token, user, onRefresh, goToSettings }) {
  const [expandedId, setExpandedId] = useState(null);

  const handleAccept = async (quoteId) => {
    if (!user?.has_payment_method) {
      alert('A credit card on file is required to initiate a job. We will redirect you to Settings to add one.');
      if (goToSettings) goToSettings();
      return;
    }
    if (!window.confirm('Accept this quote? A 20% deposit will be required to activate the job.')) return;
    try {
      const result = await api.acceptQuote(quoteId, token);
      if (result.project) {
        alert('Quote accepted! Project created. Please make your deposit payment to start the job.');
        onRefresh();
      } else {
        alert(result.error || 'Failed to accept quote');
      }
    } catch (e) { alert('Error accepting quote'); }
  };
 
  if (quotes.length === 0) {
    return (
      <div style={{ ...cardStyle, textAlign: 'center', padding: '3rem' }}>
        <h3 style={{ color: COLORS.text, marginBottom: '0.5rem' }}>No Open Quotes</h3>
        <p style={{ color: COLORS.textMuted }}>Submit a quote request to get started!</p>
      </div>
    );
  }
 
  return (
    <div style={{ display: 'grid', gap: '15px' }}>
      {/* Column Headers */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr 1fr', gap: '10px', padding: '0 20px', color: COLORS.textMuted, fontSize: '0.85rem', fontWeight: 600 }}>
        <span>Date Requested</span><span>Job Type</span><span>Job Description</span><span>Quote Status</span>
      </div>
 
      {quotes.map(quote => (
        <div key={quote.id}>
          <JobWindow onClick={() => setExpandedId(expandedId === quote.id ? null : quote.id)}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr 1fr', gap: '10px', alignItems: 'center' }}>
              <span style={{ color: COLORS.textLight }}>{formatDateEST(quote.created_at)}</span>
              <span style={{ color: COLORS.text, fontWeight: 600 }}>{quote.service_type}</span>
              <span style={{ color: COLORS.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{quote.description}</span>
              <StatusBadge status={quote.status} />
            </div>
          </JobWindow>
 
          {expandedId === quote.id && (
            <div style={{ ...cardStyle, marginTop: '5px', borderColor: COLORS.red }}>
              <h3 style={{ color: COLORS.red, marginBottom: '15px', fontFamily: '"Oswald", sans-serif' }}>Quote Details</h3>
 
              {/* Customer submitted info */}
              <div style={{ background: 'rgba(10,10,10,0.5)', borderRadius: '10px', padding: '15px', marginBottom: '15px' }}>
                <h4 style={{ color: COLORS.textMuted, fontSize: '0.85rem', marginBottom: '10px' }}>YOUR REQUEST</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                  <p style={{ color: COLORS.textLight }}><strong style={{ color: COLORS.textMuted }}>Service:</strong> {quote.service_type}</p>
                  <p style={{ color: COLORS.textLight }}><strong style={{ color: COLORS.textMuted }}>Urgency:</strong> {quote.urgency}</p>
                  <p style={{ color: COLORS.textLight }}><strong style={{ color: COLORS.textMuted }}>Preferred Date:</strong> {quote.preferred_start_date ? formatDateEST(quote.preferred_start_date) : 'Flexible'}</p>
                  <p style={{ color: COLORS.textLight }}><strong style={{ color: COLORS.textMuted }}>Address:</strong> {quote.address || 'N/A'}</p>
                </div>
                <p style={{ color: COLORS.textLight, marginTop: '8px' }}><strong style={{ color: COLORS.textMuted }}>Description:</strong> {quote.description}</p>
              </div>
 
              {/* Admin quote response (if quoted) */}
              {quote.status === 'quoted' && quote.quote_amount && (
                <div style={{ background: 'rgba(220,38,38,0.05)', borderRadius: '10px', padding: '15px', marginBottom: '15px', border: `1px solid ${COLORS.borderRed}` }}>
                  <h4 style={{ color: COLORS.red, fontSize: '0.85rem', marginBottom: '10px' }}>QUOTE DETAILS</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                    <p style={{ color: COLORS.text, fontSize: '1.2rem' }}><strong>Proposed Cost:</strong> ${parseFloat(quote.quote_amount).toFixed(2)}</p>
                    <p style={{ color: COLORS.textLight }}><strong style={{ color: COLORS.textMuted }}>Proposed Start Date:</strong> {quote.proposed_start_date ? formatDateEST(quote.proposed_start_date) : 'TBD'}</p>
                    <p style={{ color: COLORS.textLight }}><strong style={{ color: COLORS.textMuted }}>Work Time:</strong> {quote.proposed_work_time || quote.estimated_duration || 'TBD'}</p>
                  </div>
                  <p style={{ color: COLORS.textLight, marginTop: '8px' }}><strong style={{ color: COLORS.textMuted }}>Job Scope:</strong> {quote.scope_of_work || 'See messages for details'}</p>
                </div>
              )}
 
              {/* Messaging */}
              <MessageChat type="quote" id={quote.id} token={token} currentUser={user} />
 
              {/* Accept Quote */}
              {quote.status === 'quoted' && quote.quote_id && (
                <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: `1px solid ${COLORS.border}` }}>
                  <button onClick={() => handleAccept(quote.quote_id)} style={{ ...btnPrimary, width: '100%' }}>
                    Accept Quote
                  </button>
                  <p style={{ color: COLORS.textMuted, fontSize: '0.85rem', textAlign: 'center', marginTop: '10px' }}>
                    A 20% deposit is required to activate a new job, with final payment due upon completion and satisfaction.
                  </p>
                </div>
              )}
 
              {quote.status === 'pending' && (
                <p style={{ color: COLORS.yellow, marginTop: '15px', fontSize: '0.9rem', fontStyle: 'italic' }}>
                  ⏳ We will respond to you ASAP with a quote.
                </p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
 
// ============================================
// OPEN JOBS TAB
// ============================================
function OpenJobsTab({ projects, token, user, onRefresh, refreshUser }) {
  const [expandedId, setExpandedId] = useState(null);
  const [projectDetails, setProjectDetails] = useState({});
  const [showPayment, setShowPayment] = useState(null); // { projectId, type }
 
  const loadProjectDetails = async (projectId) => {
    try {
      const result = await api.getProjectDetails(projectId, token);
      setProjectDetails(prev => ({ ...prev, [projectId]: result }));
    } catch (e) { console.error('Error loading project details:', e); }
  };
 
  const handleExpand = (projectId) => {
    if (expandedId === projectId) { setExpandedId(null); return; }
    setExpandedId(projectId);
    loadProjectDetails(projectId);
  };
 
  if (projects.length === 0) {
    return (
      <div style={{ ...cardStyle, textAlign: 'center', padding: '3rem' }}>
        <h3 style={{ color: COLORS.text, marginBottom: '0.5rem' }}>No Open Jobs</h3>
        <p style={{ color: COLORS.textMuted }}>Once you accept a quote and pay the deposit, your jobs will appear here.</p>
      </div>
    );
  }
 
  return (
    <div style={{ display: 'grid', gap: '15px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr 1fr', gap: '10px', padding: '0 20px', color: COLORS.textMuted, fontSize: '0.85rem', fontWeight: 600 }}>
        <span>Date Initiated</span><span>Job Type</span><span>Job Description</span><span>Status</span>
      </div>
 
      {projects.map(project => {
        const details = projectDetails[project.id];
        return (
          <div key={project.id}>
            <JobWindow onClick={() => handleExpand(project.id)}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr 1fr', gap: '10px', alignItems: 'center' }}>
                <span style={{ color: COLORS.textLight }}>{formatDateEST(project.created_at)}</span>
                <span style={{ color: COLORS.text, fontWeight: 600 }}>{project.service_type || project.title}</span>
                <span style={{ color: COLORS.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{project.description}</span>
                <StatusBadge status={project.status} />
              </div>
            </JobWindow>
 
            {expandedId === project.id && (
              <div style={{ ...cardStyle, marginTop: '5px', borderColor: COLORS.red }}>
                <h3 style={{ color: COLORS.text, marginBottom: '5px', fontFamily: '"Oswald", sans-serif' }}>{project.title}</h3>
                <p style={{ color: COLORS.textMuted, marginBottom: '15px' }}>{project.description}</p>
                <p style={{ color: COLORS.textLight, marginBottom: '5px' }}><strong>Address:</strong> {project.address}</p>
                <StatusBadge status={project.status} />
 
                {/* Financial Summary */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px', marginTop: '20px' }}>
                  <div style={{ background: 'rgba(10,10,10,0.5)', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                    <p style={{ color: COLORS.textMuted, fontSize: '0.8rem' }}>Quoted Amount</p>
                    <p style={{ color: COLORS.text, fontSize: '1.3rem', fontWeight: 700 }}>${parseFloat(project.quoted_amount || 0).toFixed(2)}</p>
                  </div>
                  <div style={{ background: 'rgba(10,10,10,0.5)', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                    <p style={{ color: COLORS.textMuted, fontSize: '0.8rem' }}>Change Order Amount</p>
                    <p style={{ color: COLORS.yellow, fontSize: '1.3rem', fontWeight: 700 }}>${parseFloat(project.change_order_total || 0).toFixed(2)}</p>
                  </div>
                  <div style={{ background: 'rgba(220,38,38,0.08)', borderRadius: '10px', padding: '12px', textAlign: 'center', border: `1px solid ${COLORS.borderRed}` }}>
                    <p style={{ color: COLORS.textMuted, fontSize: '0.8rem' }}>Total Amount</p>
                    <p style={{ color: COLORS.red, fontSize: '1.3rem', fontWeight: 700 }}>${parseFloat(project.total_amount || 0).toFixed(2)}</p>
                  </div>
                </div>
 
                {/* Schedule Info */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginTop: '15px' }}>
                  <p style={{ color: COLORS.textLight }}><strong style={{ color: COLORS.textMuted }}>Scheduled Date:</strong> {project.scheduled_date ? formatDateEST(project.scheduled_date) : 'TBD'}</p>
                  <p style={{ color: COLORS.textLight }}><strong style={{ color: COLORS.textMuted }}>Work Time:</strong> {project.work_time || 'TBD'}</p>
                </div>
                {project.job_scope && <p style={{ color: COLORS.textLight, marginTop: '10px' }}><strong style={{ color: COLORS.textMuted }}>Job Scope:</strong> {project.job_scope}</p>}
 
                {/* Deposit Payment */}
                {!project.deposit_paid && (
                  <div style={{ marginTop: '20px' }}>
                    {showPayment?.projectId === project.id && showPayment?.type === 'deposit' ? (
                      <StripePaymentForm projectId={project.id} paymentType="deposit" amount={project.deposit_amount}
                        token={token} onSuccess={() => { setShowPayment(null); onRefresh(); refreshUser(); alert('Deposit paid! Your job is now active.'); }}
                        onCancel={() => setShowPayment(null)} />
                    ) : (
                      <button onClick={() => setShowPayment({ projectId: project.id, type: 'deposit' })}
                        style={{ ...btnPrimary, width: '100%' }}>
                        Pay Deposit (${parseFloat(project.deposit_amount || 0).toFixed(2)})
                      </button>
                    )}
                  </div>
                )}
 
                {/* Quote Messaging History (read-only) */}
                {project.quote_request_id && (
                  <MessageChat type="quote" id={project.quote_request_id} token={token} currentUser={user} readOnly={true} />
                )}
 
                {/* Change Orders */}
                {details?.changeOrders && details.changeOrders.length > 0 && (
                  <div style={{ marginTop: '20px' }}>
                    <h4 style={{ color: COLORS.red, marginBottom: '10px' }}>Change Orders</h4>
                    {details.changeOrders.map(co => (
                      <div key={co.id} style={{ background: 'rgba(10,10,10,0.5)', borderRadius: '10px', padding: '12px', marginBottom: '10px', border: `1px solid ${co.status === 'pending' ? COLORS.borderRed : COLORS.border}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ color: COLORS.textMuted, fontSize: '0.85rem' }}>{formatDateEST(co.created_at)}</span>
                          <StatusBadge status={co.status} />
                        </div>
                        <p style={{ color: COLORS.textLight, marginBottom: '5px' }}>{co.description}</p>
                        <p style={{ color: COLORS.text, fontWeight: 700 }}>${parseFloat(co.amount).toFixed(2)}</p>
                        {co.status === 'pending' && (
                          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                            <button onClick={async () => { await api.acceptChangeOrder(co.id, token); loadProjectDetails(project.id); onRefresh(); }}
                              style={{ ...btnPrimary, padding: '8px 20px', fontSize: '0.9rem' }}>Accept</button>
                            <button onClick={async () => { await api.declineChangeOrder(co.id, token); loadProjectDetails(project.id); onRefresh(); }}
                              style={{ ...btnSecondary, padding: '8px 20px', fontSize: '0.9rem' }}>Decline</button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
 
                {/* Active Job Messaging */}
                <MessageChat type="project" id={project.id} token={token} currentUser={user} />
 
                {/* Job Complete - Agree/Disagree */}
                {project.admin_marked_complete && !project.customer_agreed_complete && (
                  <div style={{ marginTop: '20px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
                    <h4 style={{ color: COLORS.green, marginBottom: '10px' }}>Job Marked Complete</h4>
                    <p style={{ color: COLORS.textLight, marginBottom: '15px' }}>Do you agree that the work has been completed to your satisfaction?</p>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                      <button onClick={async () => { await api.agreeComplete(project.id, token); onRefresh(); }}
                        style={{ ...btnPrimary, padding: '10px 30px' }}>Agree</button>
                      <button onClick={async () => { const reason = prompt('Please describe what still needs to be done:'); if (reason) { await api.disagreeComplete(project.id, reason, token); onRefresh(); } }}
                        style={{ ...btnSecondary, padding: '10px 30px' }}>Disagree</button>
                    </div>
                  </div>
                )}
 
                {/* Final Payment */}
                {project.customer_agreed_complete && !project.final_payment_paid && (
                  <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: `1px solid ${COLORS.border}` }}>
                    <div style={{ background: 'rgba(10,10,10,0.5)', borderRadius: '10px', padding: '15px', marginBottom: '15px' }}>
                      <h4 style={{ color: COLORS.text, marginBottom: '10px' }}>Payment Summary</h4>
                      <div style={{ display: 'grid', gap: '5px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: COLORS.textMuted }}>Total Amount:</span>
                          <span style={{ color: COLORS.text }}>${parseFloat(project.total_amount || 0).toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: COLORS.textMuted }}>Deposit Paid:</span>
                          <span style={{ color: COLORS.green }}>-${parseFloat(project.deposit_amount || 0).toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: `1px solid ${COLORS.border}` }}>
                          <span style={{ color: COLORS.text, fontWeight: 700 }}>Balance Due:</span>
                          <span style={{ color: COLORS.red, fontWeight: 700, fontSize: '1.2rem' }}>
                            ${(parseFloat(project.total_amount || 0) - parseFloat(project.deposit_amount || 0)).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                    {showPayment?.projectId === project.id && showPayment?.type === 'final' ? (
                      <StripePaymentForm projectId={project.id} paymentType="final"
                        amount={parseFloat(project.total_amount || 0) - parseFloat(project.deposit_amount || 0)}
                        token={token} onSuccess={() => { setShowPayment(null); onRefresh(); refreshUser(); alert('Final payment complete! Job closed.'); }}
                        onCancel={() => setShowPayment(null)} />
                    ) : (
                      <button onClick={() => setShowPayment({ projectId: project.id, type: 'final' })}
                        style={{ ...btnPrimary, width: '100%' }}>
                        Make Final Payment
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
 
// ============================================
// PAST JOBS TAB
// ============================================
function PastJobsTab({ projects, token, user }) {
  const [expandedId, setExpandedId] = useState(null);
 
  if (projects.length === 0) {
    return (
      <div style={{ ...cardStyle, textAlign: 'center', padding: '3rem' }}>
        <h3 style={{ color: COLORS.text, marginBottom: '0.5rem' }}>No Past Jobs</h3>
        <p style={{ color: COLORS.textMuted }}>Completed and closed jobs will appear here.</p>
      </div>
    );
  }
 
  return (
    <div style={{ display: 'grid', gap: '15px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr 1fr', gap: '10px', padding: '0 20px', color: COLORS.textMuted, fontSize: '0.85rem', fontWeight: 600 }}>
        <span>Date Closed</span><span>Job Type</span><span>Job Description</span><span>Status</span>
      </div>
      {projects.map(project => (
        <div key={project.id}>
          <JobWindow onClick={() => setExpandedId(expandedId === project.id ? null : project.id)}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr 1fr', gap: '10px', alignItems: 'center' }}>
              <span style={{ color: COLORS.textLight }}>{formatDateEST(project.closed_at || project.created_at)}</span>
              <span style={{ color: COLORS.text, fontWeight: 600 }}>{project.service_type || project.title}</span>
              <span style={{ color: COLORS.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{project.description}</span>
              <StatusBadge status="closed" />
            </div>
          </JobWindow>

          {expandedId === project.id && (
            <div style={{ ...cardStyle, marginTop: '5px' }}>
              <h3 style={{ color: COLORS.text, marginBottom: '10px' }}>{project.title}</h3>
              <p style={{ color: COLORS.textMuted, marginBottom: '10px' }}>{project.description}</p>
              <p style={{ color: COLORS.textLight }}><strong>Total Paid:</strong> ${parseFloat(project.total_amount || 0).toFixed(2)}</p>
              <p style={{ color: COLORS.textLight }}><strong>Completed:</strong> {formatDateEST(project.completed_at)}</p>

              {/* Read-only messaging history */}
              <MessageChat type="project" id={project.id} token={token} currentUser={user} readOnly={true} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
 
// ============================================
// REQUEST QUOTE PAGE
// ============================================
function RequestQuotePage({ user, token, isAuthenticated, setCurrentPage, onSuccess, embedded }) {
  const [formData, setFormData] = useState({
    firstName: user?.first_name || '', lastName: user?.last_name || '',
    email: user?.email || '', phone: user?.phone || '',
    address: user?.address || '', city: user?.city || '', state: user?.state || '', zipCode: user?.zip_code || '',
    serviceType: '', description: '', urgency: 'normal', preferredStartDate: ''
  });
  const [photos, setPhotos] = useState([]); // [{ id, url, preview }]
  const [photoUploading, setPhotoUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        firstName: user.first_name || prev.firstName, lastName: user.last_name || prev.lastName,
        email: user.email || prev.email, phone: user.phone || prev.phone,
        address: user.address || prev.address, city: user.city || prev.city,
        state: user.state || prev.state, zipCode: user.zip_code || prev.zipCode
      }));
    }
  }, [user]);

  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('Please select an image file.'); return; }
    if (file.size > 10 * 1024 * 1024) { alert('File is too large (max 10MB).'); return; }
    if (!token) { alert('You must be logged in to attach photos. Submit the quote first, then attach photos via Messages.'); return; }
    setPhotoUploading(true);
    try {
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const r = await api.uploadPhoto(base64, token);
      if (r.id && r.url) {
        const API_BASE = API_URL.replace(/\/api$/, '');
        setPhotos(prev => [...prev, { id: r.id, url: `${API_BASE}${r.url}`, preview: base64 }]);
      } else {
        alert(r.error || 'Upload failed');
      }
    } catch (err) { alert('Upload failed.'); console.error(err); }
    finally { setPhotoUploading(false); }
  };

  const removePhoto = (id) => setPhotos(prev => prev.filter(p => p.id !== id));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Append attached-photo URLs to the description so admin can see them until a proper media field exists.
      let descriptionWithPhotos = formData.description;
      if (photos.length > 0) {
        const lines = photos.map(p => `- ${p.url}`).join('\n');
        descriptionWithPhotos += `\n\nAttached photos:\n${lines}`;
      }
      const result = await api.submitQuote({ ...formData, description: descriptionWithPhotos }, token);
      if (result.quoteRequest) {
        setSuccess(true);
        if (onSuccess) setTimeout(onSuccess, 2000);
      } else {
        alert(result.error || 'Failed to submit quote');
      }
    } catch (e) { alert('Error submitting quote'); }
    finally { setIsLoading(false); }
  };
 
  if (success) {
    return (
      <div style={{ padding: embedded ? '20px' : '60px 2rem', maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
        <div style={cardStyle}>
          <CheckCircle size={60} style={{ color: COLORS.green, marginBottom: '15px' }} />
          <h2 style={{ color: COLORS.text, marginBottom: '10px' }}>Quote Request Submitted!</h2>
          <p style={{ color: COLORS.textMuted, marginBottom: '5px' }}>1) Your quote can be found in the Open Quotes section.</p>
          <p style={{ color: COLORS.textMuted }}>2) We will respond to you ASAP with a quote.</p>
        </div>
      </div>
    );
  }
 
  const serviceTypes = ['General Maintenance', 'Plumbing', 'Electrical', 'Painting', 'Carpentry', 'Landscaping', 'Cleaning', 'HVAC', 'Roofing', 'Flooring', 'Masonry', 'Other'];
 
  return (
    <div style={{ padding: embedded ? '0' : '60px 2rem', maxWidth: '700px', margin: '0 auto' }}>
      {!embedded && <h1 style={{ fontFamily: '"Oswald", sans-serif', fontSize: '2.5rem', textAlign: 'center', marginBottom: '20px', background: `linear-gradient(135deg, #ffffff 0%, ${COLORS.red} 100%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Request a Quote</h1>}
 
      <form onSubmit={handleSubmit} style={cardStyle}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          <div><label style={labelStyle}>First Name *</label><input required value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} style={inputStyle} /></div>
          <div><label style={labelStyle}>Last Name *</label><input required value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} style={inputStyle} /></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          <div><label style={labelStyle}>Email *</label><input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} style={inputStyle} /></div>
          <div><label style={labelStyle}>Phone *</label><input type="tel" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} style={inputStyle} /></div>
        </div>
        <div style={{ marginBottom: '12px' }}><label style={labelStyle}>Property Address *</label><input required value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} style={inputStyle} /></div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          <div><label style={labelStyle}>City</label><input value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} style={inputStyle} /></div>
          <div><label style={labelStyle}>State</label><input value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} style={inputStyle} /></div>
          <div><label style={labelStyle}>Zip</label><input value={formData.zipCode} onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })} style={inputStyle} /></div>
        </div>
        <div style={{ marginBottom: '12px' }}>
          <label style={labelStyle}>Service Type *</label>
          <select required value={formData.serviceType} onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
            style={{ ...inputStyle, appearance: 'auto' }}>
            <option value="">Select a service</option>
            {serviceTypes.map(st => <option key={st} value={st}>{st}</option>)}
          </select>
        </div>
        <div style={{ marginBottom: '12px' }}><label style={labelStyle}>Project Description *</label><textarea required rows={4} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Describe the work you need done..." /></div>

        {/* Photo upload (optional) */}
        <div style={{ marginBottom: '12px' }}>
          <label style={labelStyle}>Attach a Photo (Optional)</label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            {photos.map(p => (
              <div key={p.id} style={{ position: 'relative', width: '72px', height: '72px', borderRadius: '8px', overflow: 'hidden', border: `1px solid ${COLORS.border}` }}>
                <img src={p.preview} alt="attachment" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button type="button" onClick={() => removePhoto(p.id)}
                  style={{ position: 'absolute', top: '2px', right: '2px', width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(0,0,0,0.7)', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
                  <X size={12} />
                </button>
              </div>
            ))}
            <label style={{ width: '72px', height: '72px', borderRadius: '8px', border: `2px dashed ${COLORS.borderRed}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: photoUploading ? 'wait' : 'pointer', color: COLORS.red, background: 'rgba(220,38,38,0.05)' }}>
              {photoUploading ? '…' : <Plus size={24} />}
              <input type="file" accept="image/*" onChange={handlePhotoSelect} disabled={photoUploading} style={{ display: 'none' }} />
            </label>
          </div>
          {!isAuthenticated && <p style={{ color: COLORS.textMuted, fontSize: '0.8rem', marginTop: '6px' }}>Sign in to attach photos to your request.</p>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
          <div>
            <label style={labelStyle}>Urgency</label>
            <select value={formData.urgency} onChange={(e) => setFormData({ ...formData, urgency: e.target.value })} style={{ ...inputStyle, appearance: 'auto' }}>
              <option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option><option value="emergency">Emergency</option>
            </select>
          </div>
          <div><label style={labelStyle}>Preferred Start Date</label><input type="date" value={formData.preferredStartDate} onChange={(e) => setFormData({ ...formData, preferredStartDate: e.target.value })} style={inputStyle} /></div>
        </div>
        <button type="submit" disabled={isLoading} style={{ ...btnPrimary, width: '100%', opacity: isLoading ? 0.6 : 1 }}>
          {isLoading ? 'Submitting...' : 'Submit Quote Request'}
        </button>
        <p style={{ color: COLORS.textMuted, fontSize: '0.85rem', textAlign: 'center', marginTop: '12px' }}>
          Once submitted, your quote can be found in the Open Quotes section. We will respond to you ASAP with a quote.
        </p>
      </form>
    </div>
  );
}
 
// ============================================
// LOGIN PAGE
// ============================================
function LoginPage({ onLoginSuccess, setCurrentPage }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
 
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true); setError('');
    try {
      const result = await api.login(email, password);
      if (result.token) { onLoginSuccess(result.user, result.token); }
      else { setError(result.error || 'Login failed'); }
    } catch (e) { setError('Login failed. Please try again.'); }
    finally { setIsLoading(false); }
  };
 
  return (
    <div style={{ padding: '60px 2rem', maxWidth: '450px', margin: '0 auto' }}>
      <h1 style={{ fontFamily: '"Oswald", sans-serif', fontSize: '2.5rem', textAlign: 'center', marginBottom: '20px', color: COLORS.text }}>My Account</h1>
      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', padding: '1rem', marginBottom: '15px', color: COLORS.redLight, textAlign: 'center' }}>{error}</div>}
      <form onSubmit={handleLogin} style={cardStyle}>
        <div style={{ marginBottom: '12px' }}><label style={labelStyle}>Email</label><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} placeholder="your@email.com" /></div>
        <div style={{ marginBottom: '20px' }}><label style={labelStyle}>Password</label><input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} placeholder="Your password" /></div>
        <button type="submit" disabled={isLoading} style={{ ...btnPrimary, width: '100%', marginBottom: '15px', opacity: isLoading ? 0.6 : 1 }}>{isLoading ? 'Logging in...' : 'Login'}</button>
        <div style={{ textAlign: 'center' }}>
          <span onClick={() => setCurrentPage('forgot-password')} style={{ color: COLORS.red, cursor: 'pointer', textDecoration: 'underline', fontSize: '0.9rem' }}>Forgot Password?</span>
        </div>
        <p style={{ marginTop: '15px', textAlign: 'center', color: COLORS.textMuted, fontSize: '0.9rem' }}>
          Don't have an account? <span onClick={() => setCurrentPage('register')} style={{ color: COLORS.red, cursor: 'pointer', textDecoration: 'underline' }}>Create one here</span>
        </p>
      </form>
    </div>
  );
}
 
// ============================================
// REGISTER PAGE
// ============================================
function RegisterPage({ onRegisterSuccess, setCurrentPage }) {
  return (
    <Elements stripe={stripePromise}>
      <RegisterForm onRegisterSuccess={onRegisterSuccess} setCurrentPage={setCurrentPage} />
    </Elements>
  );
}

function RegisterForm({ onRegisterSuccess, setCurrentPage }) {
  const stripe = useStripe();
  const elements = useElements();
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '', phone: '', address: '', city: '', state: '', zipCode: '' });
  const [cardComplete, setCardComplete] = useState(false);
  const [cardSaving, setCardSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault(); setError('');
    if (formData.password !== formData.confirmPassword) { setError('Passwords do not match'); return; }
    if (formData.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setIsLoading(true);
    try {
      const result = await api.register({ email: formData.email, password: formData.password, firstName: formData.firstName, lastName: formData.lastName, phone: formData.phone, address: formData.address, city: formData.city, state: formData.state, zipCode: formData.zipCode });
      if (!result.token) { setError(result.error || 'Registration failed'); setIsLoading(false); return; }

      let user = result.user;

      // If a card was entered, save it via SetupIntent. Failures don't block registration.
      const cardElement = elements?.getElement(CardElement);
      if (cardElement && cardComplete && stripe) {
        setCardSaving(true);
        try {
          const si = await api.createSetupIntent(result.token);
          if (si.clientSecret) {
            const { setupIntent, error: stripeErr } = await stripe.confirmCardSetup(si.clientSecret, {
              payment_method: { card: cardElement, billing_details: { name: `${formData.firstName} ${formData.lastName}`.trim(), email: formData.email } }
            });
            if (stripeErr) {
              console.warn('Card save failed:', stripeErr.message);
            } else if (setupIntent?.payment_method) {
              await api.saveCard(setupIntent.payment_method, result.token);
              const me = await api.getMe(result.token);
              if (me.user) user = me.user;
            }
          }
        } catch (cardErr) { console.error('Card save threw:', cardErr); }
        finally { setCardSaving(false); }
      }

      onRegisterSuccess(user, result.token);
      setCurrentPage('portal');
    } catch (e) { setError('Registration failed. Please try again.'); }
    finally { setIsLoading(false); }
  };

  return (
    <div style={{ padding: '60px 2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ fontFamily: '"Oswald", sans-serif', fontSize: '2.5rem', textAlign: 'center', marginBottom: '20px', background: `linear-gradient(135deg, #ffffff 0%, ${COLORS.red} 100%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Create Your Account</h1>
      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', padding: '1rem', marginBottom: '15px', color: COLORS.redLight, textAlign: 'center' }}>{error}</div>}
      <form onSubmit={handleRegister} style={cardStyle}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
          <div><label style={labelStyle}>First Name *</label><input required value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} style={inputStyle} /></div>
          <div><label style={labelStyle}>Last Name *</label><input required value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} style={inputStyle} /></div>
        </div>
        <div style={{ marginBottom: '12px' }}><label style={labelStyle}>Email *</label><input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} style={inputStyle} /></div>
        <div style={{ marginBottom: '12px' }}><label style={labelStyle}>Phone</label><input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} style={inputStyle} /></div>
        <div style={{ marginBottom: '12px' }}><label style={labelStyle}>Address</label><input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} style={inputStyle} /></div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '10px', marginBottom: '12px' }}>
          <div><label style={labelStyle}>City</label><input value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} style={inputStyle} /></div>
          <div><label style={labelStyle}>State</label><input value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} style={inputStyle} /></div>
          <div><label style={labelStyle}>Zip</label><input value={formData.zipCode} onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })} style={inputStyle} /></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
          <div><label style={labelStyle}>Password *</label><input type="password" required value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} style={inputStyle} placeholder="Min 6 characters" /></div>
          <div><label style={labelStyle}>Confirm Password *</label><input type="password" required value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} style={inputStyle} /></div>
        </div>

        {/* Optional Credit Card */}
        <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: '20px', marginBottom: '20px' }}>
          <label style={{ ...labelStyle, marginBottom: '6px' }}>Credit Card (Optional)</label>
          <p style={{ color: COLORS.textMuted, fontSize: '0.85rem', marginBottom: '10px' }}>
            Not required to create an account or to receive a quote. A card on file is required before you can initiate a job — you can add or update it any time in Settings.
          </p>
          <div style={{ ...inputStyle, padding: '14px' }}>
            <CardElement
              onChange={(e) => setCardComplete(e.complete)}
              options={{ style: { base: { fontSize: '16px', color: COLORS.text, '::placeholder': { color: '#6b7280' } } } }}
            />
          </div>
        </div>

        <button type="submit" disabled={isLoading || cardSaving} style={{ ...btnPrimary, width: '100%', opacity: (isLoading || cardSaving) ? 0.6 : 1 }}>
          {cardSaving ? 'Saving Card...' : isLoading ? 'Creating Account...' : 'Create Account'}
        </button>
        <p style={{ marginTop: '15px', textAlign: 'center', color: COLORS.textMuted, fontSize: '0.9rem' }}>
          Already have an account? <span onClick={() => setCurrentPage('portal')} style={{ color: COLORS.red, cursor: 'pointer', textDecoration: 'underline' }}>Login here</span>
        </p>
      </form>
    </div>
  );
}
 
// ============================================
// FORGOT PASSWORD PAGE
// ============================================
function ForgotPasswordPage({ setCurrentPage }) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
 
  const handleSendCode = async (e) => {
    e.preventDefault(); setIsLoading(true); setError('');
    try {
      const r = await fetch(`${API_URL}/auth/forgot-password`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
      const data = await r.json();
      setMessage(data.message || 'Check your email for a reset code.');
      if (data._devCode) setMessage(`DEV MODE: Your code is ${data._devCode}`);
      setStep(2);
    } catch (e) { setError('Failed to send reset code'); }
    finally { setIsLoading(false); }
  };
 
  const handleVerifyCode = async (e) => {
    e.preventDefault(); setIsLoading(true); setError('');
    try {
      const r = await fetch(`${API_URL}/auth/verify-reset-code`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, code }) });
      const data = await r.json();
      if (data.valid) { setStep(3); setMessage(''); }
      else { setError(data.error || 'Invalid code'); }
    } catch (e) { setError('Verification failed'); }
    finally { setIsLoading(false); }
  };
 
  const handleResetPassword = async (e) => {
    e.preventDefault(); setError('');
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return; }
    if (newPassword.length < 6) { setError('Password must be at least 6 characters'); return; }
    setIsLoading(true);
    try {
      const r = await fetch(`${API_URL}/auth/reset-password`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, code, newPassword }) });
      const data = await r.json();
      if (data.message) { alert(data.message); setCurrentPage('portal'); }
      else { setError(data.error || 'Reset failed'); }
    } catch (e) { setError('Reset failed'); }
    finally { setIsLoading(false); }
  };
 
  return (
    <div style={{ padding: '60px 2rem', maxWidth: '450px', margin: '0 auto' }}>
      <h1 style={{ fontFamily: '"Oswald", sans-serif', fontSize: '2rem', textAlign: 'center', marginBottom: '20px', color: COLORS.text }}>Reset Password</h1>
      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '10px', marginBottom: '15px', color: COLORS.redLight, textAlign: 'center' }}>{error}</div>}
      {message && <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '10px', padding: '10px', marginBottom: '15px', color: COLORS.green, textAlign: 'center' }}>{message}</div>}
 
      <div style={cardStyle}>
        {step === 1 && (
          <form onSubmit={handleSendCode}>
            <div style={{ marginBottom: '15px' }}><label style={labelStyle}>Email Address</label><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} /></div>
            <button type="submit" disabled={isLoading} style={{ ...btnPrimary, width: '100%' }}>{isLoading ? 'Sending...' : 'Send Reset Code'}</button>
          </form>
        )}
        {step === 2 && (
          <form onSubmit={handleVerifyCode}>
            <div style={{ marginBottom: '15px' }}><label style={labelStyle}>Enter 6-Digit Code</label><input required value={code} onChange={(e) => setCode(e.target.value)} style={inputStyle} placeholder="123456" /></div>
            <button type="submit" disabled={isLoading} style={{ ...btnPrimary, width: '100%' }}>{isLoading ? 'Verifying...' : 'Verify Code'}</button>
          </form>
        )}
        {step === 3 && (
          <form onSubmit={handleResetPassword}>
            <div style={{ marginBottom: '12px' }}><label style={labelStyle}>New Password</label><input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={inputStyle} placeholder="Min 6 characters" /></div>
            <div style={{ marginBottom: '15px' }}><label style={labelStyle}>Confirm Password</label><input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} style={inputStyle} /></div>
            <button type="submit" disabled={isLoading} style={{ ...btnPrimary, width: '100%' }}>{isLoading ? 'Resetting...' : 'Reset Password'}</button>
          </form>
        )}
        <p style={{ marginTop: '15px', textAlign: 'center' }}>
          <span onClick={() => setCurrentPage('portal')} style={{ color: COLORS.red, cursor: 'pointer', textDecoration: 'underline', fontSize: '0.9rem' }}>Back to Login</span>
        </p>
      </div>
    </div>
  );
}
 
// ============================================
// ACCOUNT SETTINGS PAGE
// ============================================
function AccountSettingsPage({ user, token, refreshUser, setCurrentPage }) {
  const [activeSection, setActiveSection] = useState('info');
  const [formData, setFormData] = useState({
    firstName: user?.first_name || '', lastName: user?.last_name || '',
    phone: user?.phone || '', address: user?.address || '',
    city: user?.city || '', state: user?.state || '', zipCode: user?.zip_code || ''
  });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
 
  const handleUpdateAccount = async (e) => {
    e.preventDefault(); setIsLoading(true); setMessage('');
    try {
      const result = await api.updateAccount(formData, token);
      if (result.user) { await refreshUser(); setMessage('Account updated successfully!'); }
      else { setMessage(result.error || 'Update failed'); }
    } catch (e) { setMessage('Update failed'); }
    finally { setIsLoading(false); }
  };
 
  const handleChangePassword = async (e) => {
    e.preventDefault(); setMessage('');
    if (passwordData.newPassword !== passwordData.confirmPassword) { setMessage('Passwords do not match'); return; }
    setIsLoading(true);
    try {
      const result = await api.changePassword(passwordData, token);
      setMessage(result.message || result.error || 'Something went wrong');
      if (result.message) setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (e) { setMessage('Failed to change password'); }
    finally { setIsLoading(false); }
  };
 
  return (
    <div style={{ padding: '40px 2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ fontFamily: '"Oswald", sans-serif', fontSize: '2rem', marginBottom: '20px', color: COLORS.text }}>Account Settings</h1>
 
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button onClick={() => { setActiveSection('info'); setMessage(''); }} style={{ ...( activeSection === 'info' ? btnPrimary : btnSecondary), padding: '8px 20px', fontSize: '0.9rem' }}>Edit Account Info</button>
        <button onClick={() => { setActiveSection('password'); setMessage(''); }} style={{ ...(activeSection === 'password' ? btnPrimary : btnSecondary), padding: '8px 20px', fontSize: '0.9rem' }}>Change Password</button>
        <button onClick={() => { setActiveSection('payment'); setMessage(''); }} style={{ ...(activeSection === 'payment' ? btnPrimary : btnSecondary), padding: '8px 20px', fontSize: '0.9rem' }}>Payment Method</button>
      </div>
 
      {message && <div style={{ background: message.includes('success') ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${message.includes('success') ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`, borderRadius: '10px', padding: '10px', marginBottom: '15px', color: message.includes('success') ? COLORS.green : COLORS.redLight, textAlign: 'center' }}>{message}</div>}
 
      {activeSection === 'info' && (
        <form onSubmit={handleUpdateAccount} style={cardStyle}>
          <p style={{ color: COLORS.textMuted, marginBottom: '15px', fontSize: '0.9rem' }}>Email: {user?.email} (cannot be changed)</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
            <div><label style={labelStyle}>First Name</label><input value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} style={inputStyle} /></div>
            <div><label style={labelStyle}>Last Name</label><input value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} style={inputStyle} /></div>
          </div>
          <div style={{ marginBottom: '12px' }}><label style={labelStyle}>Phone</label><input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} style={inputStyle} /></div>
          <div style={{ marginBottom: '12px' }}><label style={labelStyle}>Address</label><input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} style={inputStyle} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '10px', marginBottom: '15px' }}>
            <div><label style={labelStyle}>City</label><input value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} style={inputStyle} /></div>
            <div><label style={labelStyle}>State</label><input value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} style={inputStyle} /></div>
            <div><label style={labelStyle}>Zip</label><input value={formData.zipCode} onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })} style={inputStyle} /></div>
          </div>
          {user?.has_payment_method && (
            <p style={{ color: COLORS.textMuted, marginBottom: '15px', fontSize: '0.9rem' }}>
              💳 Card on file: {user.payment_method_brand} ending in {user.payment_method_last4}
            </p>
          )}
          <button type="submit" disabled={isLoading} style={{ ...btnPrimary, width: '100%' }}>{isLoading ? 'Saving...' : 'Save Changes'}</button>
        </form>
      )}
 
      {activeSection === 'password' && (
        <form onSubmit={handleChangePassword} style={cardStyle}>
          <div style={{ marginBottom: '12px' }}><label style={labelStyle}>Current Password</label><input type="password" required value={passwordData.currentPassword} onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })} style={inputStyle} /></div>
          <div style={{ marginBottom: '12px' }}><label style={labelStyle}>New Password</label><input type="password" required value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} style={inputStyle} placeholder="Min 6 characters" /></div>
          <div style={{ marginBottom: '15px' }}><label style={labelStyle}>Confirm New Password</label><input type="password" required value={passwordData.confirmPassword} onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} style={inputStyle} /></div>
          <button type="submit" disabled={isLoading} style={{ ...btnPrimary, width: '100%' }}>{isLoading ? 'Changing...' : 'Change Password'}</button>
        </form>
      )}

      {activeSection === 'payment' && (
        <PaymentMethodSection user={user} token={token} refreshUser={refreshUser} />
      )}
    </div>
  );
}

// ============================================
// PAYMENT METHOD SECTION (used inside Account Settings)
// ============================================
function PaymentMethodSection({ user, token, refreshUser }) {
  return (
    <Elements stripe={stripePromise}>
      <PaymentMethodForm user={user} token={token} refreshUser={refreshUser} />
    </Elements>
  );
}

function PaymentMethodForm({ user, token, refreshUser }) {
  const stripe = useStripe();
  const elements = useElements();
  const [cardComplete, setCardComplete] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSaveCard = async (e) => {
    e.preventDefault(); setMessage('');
    if (!stripe || !elements || !cardComplete) { setMessage('Please enter complete card details.'); return; }
    setIsSaving(true);
    try {
      const si = await api.createSetupIntent(token);
      if (!si.clientSecret) { setMessage(si.error || 'Could not start card setup.'); setIsSaving(false); return; }
      const cardElement = elements.getElement(CardElement);
      const { setupIntent, error: stripeErr } = await stripe.confirmCardSetup(si.clientSecret, {
        payment_method: { card: cardElement, billing_details: { name: `${user?.first_name || ''} ${user?.last_name || ''}`.trim(), email: user?.email } }
      });
      if (stripeErr) { setMessage(stripeErr.message || 'Card setup failed.'); }
      else if (setupIntent?.payment_method) {
        const saveResult = await api.saveCard(setupIntent.payment_method, token);
        if (saveResult.success) {
          setMessage('Card saved successfully!');
          await refreshUser();
          cardElement.clear();
          setCardComplete(false);
        } else {
          setMessage(saveResult.error || 'Failed to save card.');
        }
      }
    } catch (err) { setMessage('Card save failed. Please try again.'); console.error(err); }
    finally { setIsSaving(false); }
  };

  return (
    <form onSubmit={handleSaveCard} style={cardStyle}>
      {user?.has_payment_method && (
        <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '10px', padding: '12px', marginBottom: '15px', color: COLORS.green }}>
          💳 Card on file: <strong>{user.payment_method_brand}</strong> ending in <strong>{user.payment_method_last4}</strong>
        </div>
      )}
      <p style={{ color: COLORS.textMuted, fontSize: '0.9rem', marginBottom: '12px' }}>
        {user?.has_payment_method ? 'Enter a new card below to replace the one on file.' : 'A card on file is required before initiating any job. Your card will not be charged until you accept a quote and agree to the deposit.'}
      </p>
      <label style={labelStyle}>Card Details</label>
      <div style={{ ...inputStyle, padding: '14px', marginBottom: '15px' }}>
        <CardElement
          onChange={(e) => setCardComplete(e.complete)}
          options={{ style: { base: { fontSize: '16px', color: COLORS.text, '::placeholder': { color: '#6b7280' } } } }}
        />
      </div>
      {message && <div style={{ background: message.includes('success') ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${message.includes('success') ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`, borderRadius: '10px', padding: '10px', marginBottom: '12px', color: message.includes('success') ? COLORS.green : COLORS.redLight, textAlign: 'center' }}>{message}</div>}
      <button type="submit" disabled={isSaving || !cardComplete} style={{ ...btnPrimary, width: '100%', opacity: (isSaving || !cardComplete) ? 0.6 : 1 }}>
        {isSaving ? 'Saving Card...' : user?.has_payment_method ? 'Replace Card' : 'Save Card'}
      </button>
    </form>
  );
}
 
// ============================================
// ADMIN DASHBOARD (placeholder - key structure)
// ============================================
function AdminDashboard({ user, token, onLogout }) {
  const [activeTab, setActiveTab] = useState('todays-jobs');
  const [quotes, setQuotes] = useState([]);
  const [projects, setProjects] = useState([]);
  const [todaysJobs, setTodaysJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewChangeOrder, setShowNewChangeOrder] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [quotesRes, projectsRes, todaysRes] = await Promise.all([
        api.adminGetQuotes(token), api.adminGetProjects(token), api.adminGetTodaysJobs(token)
      ]);
      setQuotes(quotesRes.quoteRequests || []);
      setProjects(projectsRes.projects || []);
      setTodaysJobs(todaysRes.projects || []);
    } catch (e) { console.error('Error fetching admin data:', e); }
    finally { setIsLoading(false); }
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);
 
  const tabs = [
    { key: 'todays-jobs', label: `Today's Jobs (${todaysJobs.length})` },
    { key: 'quotes', label: `Quotes (${quotes.length})` },
    { key: 'projects', label: `Projects (${projects.length})` },
    { key: 'search', label: 'Search Activity' },
    { key: 'reps', label: 'Manage Reps' },
    { key: 'messages', label: 'Messages' },
  ];
 
  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h1 style={{ fontFamily: '"Oswald", sans-serif', fontSize: '2.2rem', color: COLORS.text }}>Admin Dashboard</h1>
          <p style={{ color: COLORS.textMuted }}>Welcome, {user?.first_name}!</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => setShowNewChangeOrder(true)} style={{ ...btnPrimary, padding: '8px 16px', fontSize: '0.9rem' }}>
            <Plus size={14} style={{ marginRight: '4px' }} /> New Change Order
          </button>
          <span style={{ padding: '0.4rem 0.8rem', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '8px', color: COLORS.redLight, fontSize: '0.85rem', fontWeight: 600 }}>ADMIN</span>
          <button onClick={onLogout} style={btnSecondary}>Logout</button>
        </div>
      </div>

      {showNewChangeOrder && (
        <AdminStandaloneChangeOrder token={token} projects={projects} onClose={() => setShowNewChangeOrder(false)} onCreated={fetchData} />
      )}
 
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '15px', marginBottom: '20px' }}>
        {[
          { label: 'Pending Quotes', count: quotes.filter(q => q.status === 'pending').length, color: COLORS.yellow },
          { label: 'Active Jobs', count: projects.filter(p => p.status === 'in_progress').length, color: COLORS.blue },
          { label: 'Completed', count: projects.filter(p => p.status === 'complete').length, color: COLORS.green },
          { label: 'Total', count: quotes.length + projects.length, color: COLORS.red },
        ].map(stat => (
          <div key={stat.label} style={{ background: `${stat.color}15`, border: `1px solid ${stat.color}40`, borderRadius: '12px', padding: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: stat.color }}>{stat.count}</div>
            <div style={{ color: COLORS.textMuted, fontSize: '0.85rem' }}>{stat.label}</div>
          </div>
        ))}
      </div>
 
      {/* Tabs */}
      <div style={{ display: 'flex', gap: '5px', marginBottom: '20px', borderBottom: `1px solid ${COLORS.border}`, flexWrap: 'wrap', overflowX: 'auto' }}>
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            style={{ padding: '0.8rem 1rem', background: 'none', border: 'none', borderBottom: activeTab === tab.key ? `3px solid ${COLORS.red}` : '3px solid transparent', color: activeTab === tab.key ? COLORS.red : COLORS.textMuted, cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
            {tab.label}
          </button>
        ))}
      </div>
 
      {isLoading && <div style={{ textAlign: 'center', padding: '4rem', color: COLORS.textMuted }}>Loading...</div>}
 
      {!isLoading && activeTab === 'todays-jobs' && <AdminTodaysJobs jobs={todaysJobs} token={token} user={user} onRefresh={fetchData} />}
      {!isLoading && activeTab === 'quotes' && <AdminQuotesTab quotes={quotes} token={token} onRefresh={fetchData} user={user} />}
      {!isLoading && activeTab === 'projects' && <AdminProjectsTab projects={projects} token={token} user={user} onRefresh={fetchData} />}
      {!isLoading && activeTab === 'search' && <AdminSearchTab token={token} user={user} />}
      {!isLoading && activeTab === 'reps' && <AdminRepsTab token={token} onRefresh={fetchData} />}
      {!isLoading && activeTab === 'messages' && <AdminMessagesTab token={token} user={user} />}
    </div>
  );
}
 
// ============================================
// ADMIN: TODAY'S JOBS
// ============================================
function AdminTodaysJobs({ jobs, token, user, onRefresh }) {
  const [expandedId, setExpandedId] = useState(null);
  if (jobs.length === 0) return <div style={{ ...cardStyle, textAlign: 'center' }}><p style={{ color: COLORS.textMuted }}>No active jobs for today.</p></div>;

  return (
    <div style={{ display: 'grid', gap: '12px' }}>
      <AdminJobsHeader />
      {jobs.map(job => (
        <div key={job.id}>
          <JobWindow onClick={() => setExpandedId(expandedId === job.id ? null : job.id)}>
            <AdminJobPreviewRow job={job} />
          </JobWindow>
          {expandedId === job.id && (
            <AdminJobExpanded job={job} token={token} user={user} onRefresh={onRefresh} />
          )}
        </div>
      ))}
    </div>
  );
}

// Shared preview row + header for admin job-style lists (Today's Jobs, Projects)
const adminJobCols = '0.9fr 1.1fr 1fr 1fr 1.4fr 1.2fr 0.8fr 0.8fr';
function AdminJobsHeader() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: adminJobCols, gap: '10px', padding: '0 20px', color: COLORS.textMuted, fontSize: '0.8rem', fontWeight: 600 }}>
      <span>Start Date</span><span>Job Type</span><span>Customer</span><span>Phone</span><span>Address</span><span>Reps</span><span>Amount</span><span>Status</span>
    </div>
  );
}
function AdminJobPreviewRow({ job }) {
  const addressParts = [job.address, job.city, job.state].filter(Boolean);
  const fullAddress = addressParts.join(', ');
  const reps = (job.assigned_reps && job.assigned_reps.length > 0)
    ? job.assigned_reps.map(r => r.rep_name).join(', ')
    : '—';
  const cellStyle = { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.88rem' };
  return (
    <div style={{ display: 'grid', gridTemplateColumns: adminJobCols, gap: '10px', alignItems: 'center' }}>
      <span style={{ ...cellStyle, color: COLORS.textLight }}>{job.scheduled_date ? formatDateEST(job.scheduled_date) : 'TBD'}</span>
      <span style={{ ...cellStyle, color: COLORS.text, fontWeight: 600 }}>{job.service_type || job.title}</span>
      <span style={{ ...cellStyle, color: COLORS.textLight }}>{job.first_name} {job.last_name}</span>
      <span style={{ ...cellStyle, color: COLORS.textLight }}>{job.phone || '—'}</span>
      <span style={{ ...cellStyle, color: COLORS.textLight }} title={fullAddress}>{fullAddress || '—'}</span>
      <span style={{ ...cellStyle, color: COLORS.textLight }} title={reps}>{reps}</span>
      <span style={{ ...cellStyle, color: COLORS.textLight }}>${parseFloat(job.total_amount || 0).toFixed(2)}</span>
      <span><StatusBadge status={job.status} /></span>
    </div>
  );
}
 
// ============================================
// ADMIN: EXPANDED JOB VIEW
// ============================================
function AdminJobExpanded({ job, token, user, onRefresh }) {
  const [showChangeOrder, setShowChangeOrder] = useState(false);
  const [coDescription, setCoDescription] = useState('');
  const [coAmount, setCoAmount] = useState('');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  // Rep assignment state
  const [showRepAssign, setShowRepAssign] = useState(false);
  const [assignedReps, setAssignedReps] = useState([]);
  const [availableReps, setAvailableReps] = useState([]);
  const [repFilter, setRepFilter] = useState('');
  const [confirmRemoveRep, setConfirmRemoveRep] = useState(null);

  const loadReps = useCallback(async () => {
    const [assigned, all] = await Promise.all([
      api.adminGetProjectReps(job.id, token),
      api.adminGetReps(token),
    ]);
    setAssignedReps(assigned.reps || []);
    setAvailableReps(all.reps || []);
  }, [job.id, token]);

  useEffect(() => { if (showRepAssign) loadReps(); }, [showRepAssign, loadReps]);

  const handleCreateChangeOrder = async () => {
    if (!coDescription || !coAmount) { alert('Description and amount required'); return; }
    await api.adminCreateChangeOrder({ projectId: job.id, description: coDescription, amount: parseFloat(coAmount) }, token);
    setShowChangeOrder(false); setCoDescription(''); setCoAmount('');
    alert('Change order created and customer notified.');
    onRefresh();
  };

  const handleMarkComplete = async () => {
    if (!window.confirm('Mark this job as complete? The customer will be notified.')) return;
    await api.adminMarkComplete(job.id, token);
    alert('Job marked complete. Customer notified.');
    onRefresh();
  };

  const handleDelete = async () => {
    await api.adminDeleteProject(job.id, token);
    setShowConfirmDelete(false);
    onRefresh();
  };

  const handleAssignRep = async (repId) => {
    if (!repId) return;
    const r = await api.adminAssignRep(job.id, repId, token);
    if (r.error) { alert(r.error); return; }
    setRepFilter('');
    loadReps();
    onRefresh();
  };

  const handleRemoveRep = async (assignmentId) => {
    await api.adminRemoveRepAssignment(assignmentId, token);
    setConfirmRemoveRep(null);
    loadReps();
    onRefresh();
  };

  const assignedRepIds = new Set(assignedReps.map(r => r.rep_id || r.id));
  const filteredAvailable = availableReps
    .filter(r => !assignedRepIds.has(r.id))
    .filter(r => {
      if (!repFilter) return true;
      const q = repFilter.toLowerCase();
      return `${r.first_name} ${r.last_name}`.toLowerCase().includes(q) || (r.trade || '').toLowerCase().includes(q);
    });

  return (
    <div style={{ ...cardStyle, marginTop: '5px', borderColor: COLORS.red }}>
      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap' }}>
        <button onClick={() => setShowChangeOrder(!showChangeOrder)} style={{ ...btnPrimary, padding: '8px 16px', fontSize: '0.9rem' }}>
          <Plus size={14} style={{ marginRight: '4px' }} /> New Change Order
        </button>
        <button onClick={() => setShowRepAssign(!showRepAssign)} style={{ ...btnSecondary, padding: '8px 16px', fontSize: '0.9rem' }}>
          <Briefcase size={14} style={{ marginRight: '4px' }} /> Change Rep Assignment
        </button>
        {job.status !== 'complete' && (
          <button onClick={handleMarkComplete} style={{ ...btnSecondary, padding: '8px 16px', fontSize: '0.9rem', borderColor: 'rgba(34,197,94,0.3)', color: COLORS.green }}>
            <CheckCircle size={14} style={{ marginRight: '4px' }} /> Mark Complete
          </button>
        )}
        <button onClick={() => setShowConfirmDelete(true)} style={{ ...btnSecondary, padding: '8px 16px', fontSize: '0.9rem', borderColor: 'rgba(239,68,68,0.3)', color: COLORS.redLight }}>
          <Trash2 size={14} style={{ marginRight: '4px' }} /> Delete
        </button>
      </div>

      {showConfirmDelete && <ConfirmDialog message="Are you sure you want to delete this job?" onConfirm={handleDelete} onCancel={() => setShowConfirmDelete(false)} />}
      {confirmRemoveRep && <ConfirmDialog message="Are you sure you want to remove this rep?" onConfirm={() => handleRemoveRep(confirmRemoveRep)} onCancel={() => setConfirmRemoveRep(null)} />}

      {/* Change Order Form */}
      {showChangeOrder && (
        <div style={{ background: 'rgba(10,10,10,0.5)', borderRadius: '10px', padding: '15px', marginBottom: '15px', border: `1px solid ${COLORS.borderRed}` }}>
          <h4 style={{ color: COLORS.red, marginBottom: '10px' }}>Create Change Order</h4>
          <div style={{ marginBottom: '10px', padding: '8px 10px', background: 'rgba(255,255,255,0.04)', borderRadius: '6px', color: COLORS.textMuted, fontSize: '0.85rem' }}>
            Customer: <strong style={{ color: COLORS.text }}>{job.first_name} {job.last_name}</strong> &middot; {job.email}
          </div>
          <div style={{ marginBottom: '10px' }}><label style={labelStyle}>Description</label><textarea value={coDescription} onChange={(e) => setCoDescription(e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical' }} /></div>
          <div style={{ marginBottom: '10px' }}><label style={labelStyle}>Amount ($)</label><input type="number" step="0.01" value={coAmount} onChange={(e) => setCoAmount(e.target.value)} style={inputStyle} /></div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handleCreateChangeOrder} style={{ ...btnPrimary, padding: '8px 20px' }}>Submit Change Order</button>
            <button onClick={() => setShowChangeOrder(false)} style={btnSecondary}>Cancel</button>
          </div>
        </div>
      )}

      {/* Rep Assignment */}
      {showRepAssign && (
        <div style={{ background: 'rgba(10,10,10,0.5)', borderRadius: '10px', padding: '15px', marginBottom: '15px', border: `1px solid ${COLORS.borderRed}` }}>
          <h4 style={{ color: COLORS.red, marginBottom: '10px' }}>Reps Assigned to this Job</h4>
          {assignedReps.length === 0 ? (
            <p style={{ color: COLORS.textMuted, fontStyle: 'italic', marginBottom: '12px' }}>No reps assigned yet.</p>
          ) : (
            <div style={{ display: 'grid', gap: '8px', marginBottom: '15px' }}>
              {assignedReps.map(r => (
                <div key={r.assignment_id || r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: '8px' }}>
                  <div>
                    <span style={{ color: COLORS.text, fontWeight: 600 }}>{r.first_name} {r.last_name}</span>
                    <span style={{ color: COLORS.textMuted, marginLeft: '10px', fontSize: '0.85rem' }}>{r.trade || 'No trade'} &middot; {r.phone || 'no phone'} &middot; {r.email}</span>
                  </div>
                  <button onClick={() => setConfirmRemoveRep(r.assignment_id || r.id)} style={{ ...btnSecondary, padding: '6px 12px', fontSize: '0.85rem', borderColor: 'rgba(239,68,68,0.3)', color: COLORS.redLight }}>
                    <Trash2 size={14} /> Remove Rep
                  </button>
                </div>
              ))}
            </div>
          )}

          <label style={labelStyle}>Add a Rep</label>
          <input
            type="text"
            value={repFilter}
            onChange={(e) => setRepFilter(e.target.value)}
            placeholder="Type to filter by name or trade..."
            style={{ ...inputStyle, marginBottom: '8px' }}
          />
          {filteredAvailable.length === 0 ? (
            <p style={{ color: COLORS.textMuted, fontStyle: 'italic', fontSize: '0.85rem' }}>
              {availableReps.length === 0 ? 'No reps in roster yet.' : 'No matching reps available.'}
            </p>
          ) : (
            <div style={{ display: 'grid', gap: '6px', maxHeight: '200px', overflowY: 'auto' }}>
              {filteredAvailable.map(r => (
                <button key={r.id} onClick={() => handleAssignRep(r.id)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(255,255,255,0.04)', border: `1px solid ${COLORS.border}`, borderRadius: '6px', color: COLORS.text, cursor: 'pointer', textAlign: 'left' }}>
                  <span><strong>{r.first_name} {r.last_name}</strong> — {r.trade || 'No trade'}</span>
                  <span style={{ color: COLORS.green, fontSize: '0.85rem' }}>+ Confirm Rep Assignment</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Job Details */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', marginBottom: '15px' }}>
        <p style={{ color: COLORS.textLight }}><strong style={{ color: COLORS.textMuted }}>Customer:</strong> {job.first_name} {job.last_name}</p>
        <p style={{ color: COLORS.textLight }}><strong style={{ color: COLORS.textMuted }}>Email:</strong> {job.email}</p>
        <p style={{ color: COLORS.textLight }}><strong style={{ color: COLORS.textMuted }}>Phone:</strong> {job.phone}</p>
        <p style={{ color: COLORS.textLight }}><strong style={{ color: COLORS.textMuted }}>Amount:</strong> ${parseFloat(job.total_amount || 0).toFixed(2)}</p>
        <p style={{ color: COLORS.textLight }}><strong style={{ color: COLORS.textMuted }}>Status:</strong> <StatusBadge status={job.status} /></p>
      </div>

      {/* Messaging */}
      <MessageChat type="project" id={job.id} token={token} currentUser={user} />
    </div>
  );
}

// ============================================
// ADMIN: STANDALONE CHANGE ORDER (Choose Customer → Project → Submit)
// ============================================
function AdminStandaloneChangeOrder({ token, projects, onClose, onCreated }) {
  const [customers, setCustomers] = useState([]);
  const [customerFilter, setCustomerFilter] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    api.adminGetCustomers(token).then(r => setCustomers(r.customers || []));
  }, [token]);

  const filteredCustomers = !customerFilter ? customers :
    customers.filter(c => `${c.first_name} ${c.last_name} ${c.email}`.toLowerCase().includes(customerFilter.toLowerCase()));

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
  const customerProjects = projects.filter(p => p.customer_id === selectedCustomerId && ['pending', 'in_progress', 'complete'].includes(p.status));

  const handleSubmit = async () => {
    if (!selectedProjectId || !description || !amount) { alert('Choose a project, then enter description and amount.'); return; }
    setIsLoading(true);
    try {
      const r = await api.adminCreateChangeOrder({ projectId: parseInt(selectedProjectId, 10), description, amount: parseFloat(amount) }, token);
      if (r.changeOrder) { alert('Change order created and customer notified.'); onCreated(); onClose(); }
      else { alert(r.error || 'Failed to create change order'); }
    } catch (e) { alert('Failed to create change order'); }
    finally { setIsLoading(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
      <div style={{ ...cardStyle, maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto', borderColor: COLORS.red }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 style={{ color: COLORS.red, fontFamily: '"Oswald", sans-serif' }}>Create Change Order</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: COLORS.textMuted, cursor: 'pointer' }}><X size={20} /></button>
        </div>

        {!selectedCustomer ? (
          <>
            <label style={labelStyle}>Choose Customer</label>
            <input
              type="text"
              value={customerFilter}
              onChange={(e) => setCustomerFilter(e.target.value)}
              placeholder="Type to filter by name or email..."
              style={{ ...inputStyle, marginBottom: '8px' }}
              autoFocus
            />
            <div style={{ display: 'grid', gap: '6px', maxHeight: '300px', overflowY: 'auto' }}>
              {filteredCustomers.length === 0 ? (
                <p style={{ color: COLORS.textMuted, fontStyle: 'italic', textAlign: 'center', padding: '20px' }}>No customers match.</p>
              ) : filteredCustomers.map(c => (
                <button key={c.id} onClick={() => setSelectedCustomerId(c.id)}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'rgba(255,255,255,0.04)', border: `1px solid ${COLORS.border}`, borderRadius: '8px', color: COLORS.text, cursor: 'pointer', textAlign: 'left' }}>
                  <span><strong>{c.first_name} {c.last_name}</strong> <span style={{ color: COLORS.textMuted, fontSize: '0.85rem' }}>— {c.email}</span></span>
                  <span style={{ color: COLORS.red }}>›</span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <div style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: COLORS.text }}>
                <strong>{selectedCustomer.first_name} {selectedCustomer.last_name}</strong>
                <span style={{ color: COLORS.textMuted, marginLeft: '8px', fontSize: '0.85rem' }}>{selectedCustomer.email}</span>
              </span>
              <button onClick={() => { setSelectedCustomerId(null); setSelectedProjectId(''); }} style={{ background: 'none', border: 'none', color: COLORS.red, cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'underline' }}>Change customer</button>
            </div>

            <label style={labelStyle}>Select Project</label>
            <select value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)} style={{ ...inputStyle, appearance: 'auto', marginBottom: '12px' }}>
              <option value="">Choose a project...</option>
              {customerProjects.length === 0 ? <option disabled>This customer has no open jobs</option> :
                customerProjects.map(p => <option key={p.id} value={p.id}>{p.service_type || p.title || `Project #${p.id}`} — ${parseFloat(p.total_amount || 0).toFixed(2)}</option>)
              }
            </select>

            <div style={{ marginBottom: '10px' }}><label style={labelStyle}>Change Order Description</label><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical' }} /></div>
            <div style={{ marginBottom: '15px' }}><label style={labelStyle}>Proposed Amount ($)</label><input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} style={inputStyle} /></div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleSubmit} disabled={isLoading} style={{ ...btnPrimary, padding: '10px 20px' }}>{isLoading ? 'Submitting...' : 'Submit Change Order'}</button>
              <button onClick={onClose} style={btnSecondary}>Cancel</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ============================================
// ADMIN: QUOTES TAB
// ============================================
function AdminQuotesTab({ quotes, token, onRefresh, user }) {
  const [expandedId, setExpandedId] = useState(null);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [quoteForm, setQuoteForm] = useState({ amount: '', duration: '', scope: '', proposedStartDate: '', proposedWorkTime: '' });
  const [showConfirmDelete, setShowConfirmDelete] = useState(null);
  const [search, setSearch] = useState('');

  const handleSendQuote = async (requestId) => {
    try {
      await api.adminCreateQuote(requestId, {
        amount: parseFloat(quoteForm.amount), estimatedDuration: quoteForm.duration,
        scopeOfWork: quoteForm.scope, proposedStartDate: quoteForm.proposedStartDate || null,
        proposedWorkTime: quoteForm.proposedWorkTime || null
      }, token);
      alert('Quote sent!');
      setSelectedQuote(null);
      setQuoteForm({ amount: '', duration: '', scope: '', proposedStartDate: '', proposedWorkTime: '' });
      onRefresh();
    } catch (e) { alert('Failed to send quote'); }
  };

  const filtered = !search.trim() ? quotes : quotes.filter(q => {
    const s = search.toLowerCase();
    return [q.service_type, q.title, q.description, q.first_name, q.last_name, q.email, q.phone]
      .filter(Boolean).some(v => String(v).toLowerCase().includes(s));
  });

  return (
    <div>
      <div style={{ position: 'relative', marginBottom: '15px' }}>
        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: COLORS.textMuted }} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search quotes by service, customer, description..."
          style={{ ...inputStyle, paddingLeft: '36px', paddingRight: search ? '36px' : '0.875rem' }}
        />
        {search && (
          <button onClick={() => setSearch('')} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: COLORS.textMuted, cursor: 'pointer', padding: '4px' }}>
            <X size={16} />
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gap: '12px' }}>
        {filtered.length === 0 ? (
          <div style={{ ...cardStyle, textAlign: 'center' }}>
            <p style={{ color: COLORS.textMuted }}>{search ? 'No quotes match your search.' : 'No quotes yet.'}</p>
          </div>
        ) : (<>
          <div style={{ display: 'grid', gridTemplateColumns: '0.9fr 1.1fr 1fr 1fr 1.8fr 0.9fr', gap: '10px', padding: '0 20px', color: COLORS.textMuted, fontSize: '0.8rem', fontWeight: 600 }}>
            <span>Date Requested</span><span>Job Type</span><span>Customer</span><span>Phone</span><span>Description</span><span>Status</span>
          </div>
          {filtered.map(quote => (
          <div key={quote.id}>
            <JobWindow onClick={() => setExpandedId(expandedId === quote.id ? null : quote.id)}>
              <div style={{ display: 'grid', gridTemplateColumns: '0.9fr 1.1fr 1fr 1fr 1.8fr 0.9fr', gap: '10px', alignItems: 'center' }}>
                {(() => { const cell = { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.88rem' }; return (<>
                  <span style={{ ...cell, color: COLORS.textLight }}>{formatDateEST(quote.created_at)}</span>
                  <span style={{ ...cell, color: COLORS.text, fontWeight: 600 }}>{quote.service_type || quote.title}</span>
                  <span style={{ ...cell, color: COLORS.textLight }}>{quote.first_name} {quote.last_name}</span>
                  <span style={{ ...cell, color: COLORS.textLight }}>{quote.phone || '—'}</span>
                  <span style={{ ...cell, color: COLORS.textMuted }} title={quote.description}>{quote.description || '—'}</span>
                  <span><StatusBadge status={quote.status} /></span>
                </>); })()}
              </div>
            </JobWindow>

            {expandedId === quote.id && (
              <div style={{ ...cardStyle, marginTop: '5px', borderColor: COLORS.red }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <h3 style={{ color: COLORS.red, fontSize: '1.1rem', fontWeight: 600, fontFamily: '"Oswald", sans-serif' }}>{quote.service_type || quote.title}</h3>
                    <p style={{ color: COLORS.textMuted, fontSize: '0.85rem' }}>{formatDateTimeEST(quote.created_at)}</p>
                  </div>
                  <button onClick={() => setShowConfirmDelete(quote.id)} style={{ background: 'none', border: 'none', color: COLORS.textMuted, cursor: 'pointer' }}><Trash2 size={16} /></button>
                </div>

                {showConfirmDelete === quote.id && <ConfirmDialog message="Delete this quote request?" onConfirm={async () => { await api.adminDeleteQuote(quote.id, token); setShowConfirmDelete(null); onRefresh(); }} onCancel={() => setShowConfirmDelete(null)} />}

                <div style={{ background: 'rgba(10,10,10,0.5)', borderRadius: '8px', padding: '10px', marginBottom: '12px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '6px', fontSize: '0.9rem' }}>
                    <p style={{ color: COLORS.textLight }}><strong style={{ color: COLORS.textMuted }}>Name:</strong> {quote.first_name} {quote.last_name}</p>
                    <p style={{ color: COLORS.textLight }}><strong style={{ color: COLORS.textMuted }}>Email:</strong> {quote.email}</p>
                    <p style={{ color: COLORS.textLight }}><strong style={{ color: COLORS.textMuted }}>Phone:</strong> {quote.phone || 'N/A'}</p>
                  </div>
                  <p style={{ color: COLORS.textLight, marginTop: '6px', fontSize: '0.9rem' }}><strong style={{ color: COLORS.textMuted }}>Description:</strong> {quote.description}</p>
                </div>

                {quote.status === 'pending' && (
                  selectedQuote === quote.id ? (
                    <div style={{ background: `${COLORS.red}08`, border: `1px solid ${COLORS.borderRed}`, borderRadius: '10px', padding: '15px' }}>
                      <h4 style={{ color: COLORS.red, marginBottom: '10px' }}>Send Quote to Customer</h4>
                      <div style={{ display: 'grid', gap: '10px' }}>
                        <div><label style={labelStyle}>Amount ($)</label><input type="number" value={quoteForm.amount} onChange={(e) => setQuoteForm({ ...quoteForm, amount: e.target.value })} style={inputStyle} /></div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                          <div><label style={labelStyle}>Proposed Start Date</label><input type="date" value={quoteForm.proposedStartDate} onChange={(e) => setQuoteForm({ ...quoteForm, proposedStartDate: e.target.value })} style={inputStyle} /></div>
                          <div><label style={labelStyle}>Work Time</label><input value={quoteForm.proposedWorkTime} onChange={(e) => setQuoteForm({ ...quoteForm, proposedWorkTime: e.target.value })} placeholder="e.g. 2-3 weeks" style={inputStyle} /></div>
                        </div>
                        <div><label style={labelStyle}>Scope of Work</label><textarea value={quoteForm.scope} onChange={(e) => setQuoteForm({ ...quoteForm, scope: e.target.value })} rows={3} style={{ ...inputStyle, resize: 'vertical' }} /></div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button onClick={() => handleSendQuote(quote.id)} style={{ ...btnPrimary, flex: 1 }}>Send Quote</button>
                          <button onClick={() => setSelectedQuote(null)} style={btnSecondary}>Cancel</button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setSelectedQuote(quote.id)} style={{ ...btnPrimary, padding: '8px 20px', fontSize: '0.9rem' }}>Create &amp; Send Quote</button>
                  )
                )}

                {quote.status === 'quoted' && <p style={{ color: COLORS.red, padding: '8px', background: `${COLORS.red}10`, borderRadius: '8px', marginTop: '10px' }}>✓ Quote sent - awaiting customer response</p>}
                {quote.status === 'accepted' && <p style={{ color: COLORS.green, padding: '8px', background: `${COLORS.green}10`, borderRadius: '8px', marginTop: '10px' }}>✓ Accepted - Project created</p>}

                <MessageChat type="quote" id={quote.id} token={token} currentUser={user} />
              </div>
            )}
          </div>
          ))}
        </>)}
      </div>
    </div>
  );
}

// ============================================
// ADMIN: PROJECTS TAB
// ============================================
function AdminProjectsTab({ projects, token, user, onRefresh }) {
  const [expandedId, setExpandedId] = useState(null);
  const [search, setSearch] = useState('');

  const filtered = !search.trim() ? projects : projects.filter(j => {
    const q = search.toLowerCase();
    const repNames = (j.assigned_reps || []).map(r => r.rep_name).join(' ').toLowerCase();
    return [j.title, j.service_type, j.description, j.first_name, j.last_name, j.email, repNames]
      .filter(Boolean).some(v => String(v).toLowerCase().includes(q));
  });

  return (
    <div>
      <div style={{ position: 'relative', marginBottom: '15px' }}>
        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: COLORS.textMuted }} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search projects by service, customer, rep, description..."
          style={{ ...inputStyle, paddingLeft: '36px', paddingRight: search ? '36px' : '0.875rem' }}
        />
        {search && (
          <button onClick={() => setSearch('')} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: COLORS.textMuted, cursor: 'pointer', padding: '4px' }}>
            <X size={16} />
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gap: '12px' }}>
        {filtered.length === 0 ? (
          <div style={{ ...cardStyle, textAlign: 'center' }}>
            <p style={{ color: COLORS.textMuted }}>{search ? 'No projects match your search.' : 'No projects yet.'}</p>
          </div>
        ) : (
          <>
            <AdminJobsHeader />
            {filtered.map(job => (
              <div key={job.id}>
                <JobWindow onClick={() => setExpandedId(expandedId === job.id ? null : job.id)}>
                  <AdminJobPreviewRow job={job} />
                </JobWindow>
                {expandedId === job.id && <AdminJobExpanded job={job} token={token} user={user} onRefresh={onRefresh} />}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
 
// ============================================
// ADMIN: SEARCH TAB
// ============================================
function AdminSearchTab({ token, user }) {
  const [searchBy, setSearchBy] = useState('customer');
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [trade, setTrade] = useState('');
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
 
  useEffect(() => { api.adminGetCustomers(token).then(r => setCustomers(r.customers || [])); }, [token]);
 
  const handleSearch = async () => {
    const params = { searchBy };
    if (searchBy === 'customer') params.customerId = selectedCustomerId;
    if (searchBy === 'date') { params.startDate = startDate; params.endDate = endDate; }
    if (searchBy === 'trade') params.trade = trade;
    const result = await api.adminSearch(params, token);
    setResults(result.results || []);
    setHasSearched(true);
  };
 
  const trades = ['General Maintenance', 'Plumbing', 'Electrical', 'Painting', 'Carpentry', 'Landscaping', 'Cleaning', 'HVAC', 'Roofing', 'Flooring', 'Masonry', 'Other'];
 
  return (
    <div>
      <div style={{ ...cardStyle, marginBottom: '20px' }}>
        <h3 style={{ color: COLORS.text, marginBottom: '15px' }}>Search Activity</h3>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap' }}>
          {['customer', 'date', 'trade'].map(opt => (
            <button key={opt} onClick={() => { setSearchBy(opt); setResults([]); setHasSearched(false); }}
              style={{ ...(searchBy === opt ? btnPrimary : btnSecondary), padding: '8px 16px', fontSize: '0.9rem', textTransform: 'capitalize' }}>{opt}</button>
          ))}
        </div>
 
        {searchBy === 'customer' && (
          <div style={{ marginBottom: '15px' }}>
            <label style={labelStyle}>Select Customer</label>
            <select value={selectedCustomerId} onChange={(e) => setSelectedCustomerId(e.target.value)} style={{ ...inputStyle, appearance: 'auto' }}>
              <option value="">Choose a customer...</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name} ({c.email})</option>)}
            </select>
          </div>
        )}
        {searchBy === 'date' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
            <div><label style={labelStyle}>Start Date</label><input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={inputStyle} /></div>
            <div><label style={labelStyle}>End Date</label><input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={inputStyle} /></div>
          </div>
        )}
        {searchBy === 'trade' && (
          <div style={{ marginBottom: '15px' }}>
            <label style={labelStyle}>Select Trade</label>
            <select value={trade} onChange={(e) => setTrade(e.target.value)} style={{ ...inputStyle, appearance: 'auto' }}>
              <option value="">Choose a trade...</option>
              {trades.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        )}
        <button onClick={handleSearch} style={{ ...btnPrimary, padding: '10px 24px' }}>
          <Search size={16} style={{ marginRight: '6px' }} /> Search
        </button>
      </div>
 
      {hasSearched && (
        <div style={{ display: 'grid', gap: '10px' }}>
          {results.length === 0 ? <p style={{ color: COLORS.textMuted, textAlign: 'center' }}>No results found.</p> :
            results.map((item, i) => {
              const activityMap = {
                open_quote: { label: 'Open Quote', color: COLORS.yellow, bg: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.35)' },
                open_job: { label: 'Open Job', color: COLORS.blue, bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.35)' },
                closed_job: { label: 'Closed Job', color: COLORS.textMuted, bg: 'rgba(156,163,175,0.12)', border: 'rgba(156,163,175,0.35)' },
                quote: { label: 'Open Quote', color: COLORS.yellow, bg: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.35)' },
                project: { label: 'Open Job', color: COLORS.blue, bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.35)' },
              };
              const activity = activityMap[item.activity_type] || { label: item.activity_type || 'Activity', color: COLORS.textMuted, bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)' };
              return (
                <JobWindow key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ minWidth: 0, flex: '1 1 60%' }}>
                      <span style={{ color: COLORS.text, fontWeight: 600 }}>{item.service_type}</span>
                      {item.first_name && <span style={{ color: COLORS.textMuted, marginLeft: '10px', fontSize: '0.85rem' }}>{item.first_name} {item.last_name}</span>}
                      <p style={{ color: COLORS.textMuted, fontSize: '0.85rem', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.description}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ color: COLORS.textMuted, fontSize: '0.8rem' }}>{formatDateEST(item.created_at)}</span>
                      <span style={{ padding: '0.3rem 0.7rem', borderRadius: '999px', background: activity.bg, border: `1px solid ${activity.border}`, color: activity.color, fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                        {activity.label}
                      </span>
                      <StatusBadge status={item.status} />
                    </div>
                  </div>
                </JobWindow>
              );
            })
          }
        </div>
      )}
    </div>
  );
}
 
// ============================================
// ADMIN: REPS TAB
// ============================================
function AdminRepsTab({ token, onRefresh }) {
  const [reps, setReps] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRep, setNewRep] = useState({ firstName: '', lastName: '', email: '', phone: '', address: '', city: '', state: '', zipCode: '', trade: '', notes: '' });
  const [showConfirmDelete, setShowConfirmDelete] = useState(null);

  useEffect(() => { api.adminGetReps(token).then(r => setReps(r.reps || [])); }, [token]);

  const handleAddRep = async () => {
    if (!newRep.firstName || !newRep.lastName || !newRep.email) { alert('Name and email required'); return; }
    const result = await api.adminAddRep(newRep, token);
    if (result.rep) {
      alert(`Rep created! Temp password: ${result._devTempPassword || 'check logs'}`);
      setShowAddForm(false);
      setNewRep({ firstName: '', lastName: '', email: '', phone: '', address: '', city: '', state: '', zipCode: '', trade: '', notes: '' });
      api.adminGetReps(token).then(r => setReps(r.reps || []));
    } else { alert(result.error || 'Failed to add rep'); }
  };
 
  const handleDeleteRep = async (repId) => {
    await api.adminDeleteRep(repId, token);
    setShowConfirmDelete(null);
    api.adminGetReps(token).then(r => setReps(r.reps || []));
  };
 
  return (
    <div>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button onClick={() => setShowAddForm(!showAddForm)} style={{ ...btnPrimary, padding: '10px 20px' }}>
          <Plus size={16} style={{ marginRight: '4px' }} /> Add New Rep
        </button>
      </div>
 
      {showAddForm && (
        <div style={{ ...cardStyle, marginBottom: '20px', borderColor: COLORS.red }}>
          <h4 style={{ color: COLORS.red, marginBottom: '12px' }}>Add New Rep</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
            <div><label style={labelStyle}>First Name *</label><input value={newRep.firstName} onChange={(e) => setNewRep({ ...newRep, firstName: e.target.value })} style={inputStyle} /></div>
            <div><label style={labelStyle}>Last Name *</label><input value={newRep.lastName} onChange={(e) => setNewRep({ ...newRep, lastName: e.target.value })} style={inputStyle} /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
            <div><label style={labelStyle}>Email *</label><input type="email" value={newRep.email} onChange={(e) => setNewRep({ ...newRep, email: e.target.value })} style={inputStyle} /></div>
            <div><label style={labelStyle}>Phone</label><input value={newRep.phone} onChange={(e) => setNewRep({ ...newRep, phone: e.target.value })} style={inputStyle} /></div>
          </div>
          <div style={{ marginBottom: '10px' }}><label style={labelStyle}>Home Address</label><input value={newRep.address} onChange={(e) => setNewRep({ ...newRep, address: e.target.value })} style={inputStyle} placeholder="Street address" /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '10px', marginBottom: '10px' }}>
            <div><label style={labelStyle}>City</label><input value={newRep.city} onChange={(e) => setNewRep({ ...newRep, city: e.target.value })} style={inputStyle} /></div>
            <div><label style={labelStyle}>State</label><input value={newRep.state} onChange={(e) => setNewRep({ ...newRep, state: e.target.value })} style={inputStyle} /></div>
            <div><label style={labelStyle}>Zip</label><input value={newRep.zipCode} onChange={(e) => setNewRep({ ...newRep, zipCode: e.target.value })} style={inputStyle} /></div>
          </div>
          <div style={{ marginBottom: '10px' }}><label style={labelStyle}>Trade</label><input value={newRep.trade} onChange={(e) => setNewRep({ ...newRep, trade: e.target.value })} style={inputStyle} placeholder="e.g. Plumbing, Electrical" /></div>
          <div style={{ marginBottom: '15px' }}><label style={labelStyle}>Notes</label><textarea value={newRep.notes} onChange={(e) => setNewRep({ ...newRep, notes: e.target.value })} rows={2} style={{ ...inputStyle, resize: 'vertical' }} /></div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handleAddRep} style={{ ...btnPrimary, padding: '8px 20px' }}>Create Rep</button>
            <button onClick={() => setShowAddForm(false)} style={btnSecondary}>Cancel</button>
          </div>
        </div>
      )}
 
      {showConfirmDelete && <ConfirmDialog message="Are you sure you want to remove this rep?" onConfirm={() => handleDeleteRep(showConfirmDelete)} onCancel={() => setShowConfirmDelete(null)} />}
 
      <div style={{ display: 'grid', gap: '10px' }}>
        {reps.length === 0 ? <p style={{ color: COLORS.textMuted }}>No reps yet.</p> :
          reps.map(rep => (
            <div key={rep.id} style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <span style={{ color: COLORS.text, fontWeight: 600, fontSize: '1.05rem' }}>{rep.first_name} {rep.last_name}</span>
                  <span style={{ color: COLORS.textMuted, marginLeft: '10px', fontSize: '0.9rem' }}>— {rep.trade || 'No trade'}</span>
                </div>
                <button onClick={() => setShowConfirmDelete(rep.id)} style={{ ...btnSecondary, padding: '6px 12px', fontSize: '0.85rem', borderColor: 'rgba(239,68,68,0.3)', color: COLORS.redLight }}>
                  <Trash2 size={14} /> Remove
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '6px', marginTop: '8px', fontSize: '0.9rem' }}>
                <span style={{ color: COLORS.textLight }}>📧 {rep.email}</span>
                <span style={{ color: COLORS.textLight }}>📱 {rep.phone || 'N/A'}</span>
                <span style={{ color: COLORS.textMuted }}>Since {formatDateEST(rep.created_at)}</span>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}
 
// ============================================
// ADMIN: MESSAGES TAB
// ============================================
function AdminMessagesTab({ token, user }) {
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
 
  useEffect(() => { api.adminGetConversations(token).then(r => setConversations(r.conversations || [])); }, [token]);
 
  return (
    <div>
      {selectedConv ? (
        <div>
          <button onClick={() => setSelectedConv(null)} style={{ ...btnSecondary, marginBottom: '15px', fontSize: '0.9rem' }}>← Back to Conversations</button>
          <MessageChat type={selectedConv.type} id={selectedConv.id} token={token} currentUser={user} />
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '10px' }}>
          {conversations.length === 0 ? <p style={{ color: COLORS.textMuted }}>No conversations yet.</p> :
            conversations.map((conv, i) => (
              <JobWindow key={i} onClick={() => setSelectedConv(conv)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <span style={{ color: COLORS.text, fontWeight: 600 }}>{conv.first_name} {conv.last_name}</span>
                    <span style={{ color: COLORS.textMuted, marginLeft: '10px', fontSize: '0.85rem' }}>{conv.service_type} ({conv.type})</span>
                    {conv.last_message && <p style={{ color: COLORS.textMuted, fontSize: '0.85rem', marginTop: '4px' }}>{conv.last_message.substring(0, 80)}...</p>}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {parseInt(conv.unread_count) > 0 && (
                      <span style={{ background: COLORS.red, color: '#fff', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>{conv.unread_count}</span>
                    )}
                    <StatusBadge status={conv.status} />
                  </div>
                </div>
              </JobWindow>
            ))
          }
        </div>
      )}
    </div>
  );
}
 
// ============================================
// REP PORTAL
// ============================================
function RepPortal({ user, token, onLogout }) {
  const [jobs, setJobs] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
 
  useEffect(() => {
    api.repGetMyJobs(token).then(r => { setJobs(r.projects || []); setIsLoading(false); });
  }, [token]);
 
  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontFamily: '"Oswald", sans-serif', fontSize: '2rem', color: COLORS.text }}>My Open Jobs</h1>
        <button onClick={onLogout} style={btnSecondary}>Logout</button>
      </div>
 
      {isLoading ? <p style={{ color: COLORS.textMuted }}>Loading...</p> :
       jobs.length === 0 ? <div style={{ ...cardStyle, textAlign: 'center' }}><p style={{ color: COLORS.textMuted }}>No assigned jobs.</p></div> :
       <div style={{ display: 'grid', gap: '12px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '0.8fr 1.5fr 1fr 1fr', gap: '10px', padding: '0 20px', color: COLORS.textMuted, fontSize: '0.8rem', fontWeight: 600 }}>
          <span>Date</span><span>Address</span><span>Customer</span><span>Phone</span>
        </div>
        {jobs.map(job => (
          <div key={job.id}>
            <JobWindow onClick={() => setExpandedId(expandedId === job.id ? null : job.id)}>
              <div style={{ display: 'grid', gridTemplateColumns: '0.8fr 1.5fr 1fr 1fr', gap: '10px', alignItems: 'center', fontSize: '0.9rem' }}>
                <span style={{ color: COLORS.textLight }}>{formatDateEST(job.scheduled_date || job.created_at)}</span>
                <span style={{ color: COLORS.text, fontWeight: 600 }}>{job.address}</span>
                <span style={{ color: COLORS.textLight }}>{job.customer_first} {job.customer_last}</span>
                <span style={{ color: COLORS.textLight }}>{job.customer_phone || 'N/A'}</span>
              </div>
            </JobWindow>
            {expandedId === job.id && (
              <div style={{ ...cardStyle, marginTop: '5px' }}>
                <p style={{ color: COLORS.textLight, marginBottom: '8px' }}><strong>Description:</strong> {job.description}</p>
                <p style={{ color: COLORS.textLight, marginBottom: '8px' }}><strong>Job Scope:</strong> {job.job_scope || 'N/A'}</p>
                <p style={{ color: COLORS.textLight }}><strong>Scheduled:</strong> {job.scheduled_date ? formatDateEST(job.scheduled_date) : 'TBD'}</p>
                <MessageChat type="project" id={job.id} token={token} currentUser={user} />
              </div>
            )}
          </div>
        ))}
       </div>
      }
    </div>
  );
}
 
// ============================================
// HOME PAGE
// ============================================
function HomePage({ setCurrentPage }) {
  return (
    <div>
      {/* Hero Section */}
      <section style={{
        padding: '60px 2rem',
        textAlign: 'center',
        position: 'relative'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h1 className="animate-in" style={{
            fontFamily: '"Oswald", sans-serif',
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
            marginBottom: '20px',
            lineHeight: '1.1',
            background: 'linear-gradient(135deg, #ffffff 0%, #dc2626 100%)',
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
            color: '#d4d4d4',
            marginBottom: '30px',
            lineHeight: '1.7',
            maxWidth: '700px',
            margin: '0 auto 30px',
            animationDelay: '0.3s',
            opacity: 0
          }}>
            Expert contractors. Transparent pricing. Quality guaranteed. From repairs to renovations, we've got your home covered.
          </p>
          <div className="animate-in" style={{
            display: 'flex',
            gap: '20px',
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
                background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                color: '#0a0a0a',
                transition: 'all 0.3s ease',
                boxShadow: '0 8px 24px rgba(220, 38, 38, 0.3), 0 0 0 0 rgba(220, 38, 38, 0.4)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 12px 32px rgba(220, 38, 38, 0.4), 0 0 0 4px rgba(220, 38, 38, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 8px 24px rgba(220, 38, 38, 0.3), 0 0 0 0 rgba(220, 38, 38, 0.4)';
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
                border: '2px solid rgba(220, 38, 38, 0.4)',
                borderRadius: '12px',
                cursor: 'pointer',
                background: 'rgba(220, 38, 38, 0.08)',
                color: '#dc2626',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(8px)'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(220, 38, 38, 0.15)';
                e.target.style.borderColor = 'rgba(220, 38, 38, 0.6)';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(220, 38, 38, 0.08)';
                e.target.style.borderColor = 'rgba(220, 38, 38, 0.4)';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              View Services
            </button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section style={{ padding: '60px 2rem', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px'
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
                background: 'rgba(20, 20, 20, 0.5)',
                border: '1px solid rgba(220, 38, 38, 0.15)',
                borderRadius: '16px',
                padding: '20px',
                transition: 'all 0.3s ease',
                cursor: 'default',
                animationDelay: `${0.1 * i}s`,
                opacity: 0,
                backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.4)';
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(220, 38, 38, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.15)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.2), rgba(255, 255, 255, 0.2))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
                border: '1px solid rgba(220, 38, 38, 0.3)'
              }}>
                <feature.icon size={28} color="#dc2626" />
              </div>
              <h3 style={{
                fontSize: '1.3rem',
                marginBottom: '0.75rem',
                color: '#f5f5f5',
                fontWeight: '600'
              }}>
                {feature.title}
              </h3>
              <p style={{ color: '#a3a3a3', lineHeight: '1.6', fontSize: '0.95rem' }}>
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '60px 2rem',
        textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.08) 0%, rgba(255, 255, 255, 0.08) 100%)',
        borderTop: '1px solid rgba(220, 38, 38, 0.15)',
        borderBottom: '1px solid rgba(220, 38, 38, 0.15)',
        margin: '40px 0'
      }}>
        <h2 style={{
          fontFamily: '"Oswald", sans-serif',
          fontSize: 'clamp(2rem, 4vw, 3rem)',
          marginBottom: '20px',
          color: '#f5f5f5'
        }}>
          Ready to Get Started?
        </h2>
        <p style={{
          fontSize: '1.15rem',
          color: '#d4d4d4',
          marginBottom: '20px',
          maxWidth: '600px',
          margin: '0 auto 30px'
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
            background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
            color: '#0a0a0a',
            transition: 'all 0.3s ease',
            boxShadow: '0 8px 24px rgba(220, 38, 38, 0.3)'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-3px)';
            e.target.style.boxShadow = '0 12px 32px rgba(220, 38, 38, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 8px 24px rgba(220, 38, 38, 0.3)';
          }}
        >
          Get Your Free Quote
        </button>
      </section>
    </div>
  );
}
 
// ============================================
// SERVICES PAGE
// ============================================
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
    <div style={{ padding: '60px 2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 className="animate-in" style={{
          fontFamily: '"Oswald", sans-serif',
          fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
          marginBottom: '1rem',
          background: 'linear-gradient(135deg, #ffffff 0%, #dc2626 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          opacity: 0
        }}>
          Our Services
        </h1>
        <p className="animate-in" style={{
          fontSize: '1.15rem',
          color: '#d4d4d4',
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
        gap: '30px',
        marginBottom: '40px'
      }}>
        {services.map((service, i) => (
          <div
            key={i}
            className="animate-scale"
            style={{
              background: 'rgba(20, 20, 20, 0.5)',
              border: '1px solid rgba(220, 38, 38, 0.15)',
              borderRadius: '20px',
              padding: '20px',
              transition: 'all 0.3s ease',
              animationDelay: `${0.1 * i}s`,
              opacity: 0,
              backdropFilter: 'blur(10px)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.4)';
              e.currentTarget.style.boxShadow = '0 16px 48px rgba(220, 38, 38, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.15)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{service.icon}</div>
            <h3 style={{
              fontSize: '1.5rem',
              marginBottom: '20px',
              color: '#f5f5f5',
              fontWeight: '600'
            }}>
              {service.category}
            </h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {service.items.map((item, j) => (
                <li key={j} style={{
                  padding: '0.6rem 0',
                  color: '#a3a3a3',
                  borderBottom: j < service.items.length - 1 ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <CheckCircle size={16} color="#dc2626" style={{ flexShrink: 0 }} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div style={{
        textAlign: 'center',
        padding: '20px',
        background: 'rgba(220, 38, 38, 0.05)',
        borderRadius: '20px',
        border: '1px solid rgba(220, 38, 38, 0.2)'
      }}>
        <h3 style={{
          fontSize: '1.8rem',
          marginBottom: '1rem',
          color: '#f5f5f5',
          fontWeight: '600'
        }}>
          Don't See What You Need?
        </h3>
        <p style={{
          fontSize: '1.05rem',
          color: '#d4d4d4',
          marginBottom: '20px',
          maxWidth: '600px',
          margin: '0 auto 20px'
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
            background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
            color: '#0a0a0a',
            transition: 'all 0.3s ease',
            boxShadow: '0 8px 24px rgba(220, 38, 38, 0.3)'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 12px 32px rgba(220, 38, 38, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 8px 24px rgba(220, 38, 38, 0.3)';
          }}
        >
          Request Custom Quote
        </button>
      </div>
    </div>
  );
}
 
// ============================================
// ABOUT PAGE
// ============================================
function AboutPage() {
  return (
    <div style={{ padding: '60px 2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 className="animate-in" style={{
          fontFamily: '"Oswald", sans-serif',
          fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
          marginBottom: '1rem',
          background: 'linear-gradient(135deg, #ffffff 0%, #dc2626 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          opacity: 0
        }}>
          About Greenwich Property Care
        </h1>
        <p className="animate-in" style={{
          fontSize: '1.15rem',
          color: '#d4d4d4',
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
        gap: '20px',
        marginBottom: '40px'
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
              background: 'rgba(20, 20, 20, 0.5)',
              border: '1px solid rgba(220, 38, 38, 0.15)',
              borderRadius: '16px',
              padding: '20px',
              textAlign: 'center',
              backdropFilter: 'blur(10px)',
              animationDelay: `${0.1 * i}s`,
              opacity: 0
            }}
          >
            <div style={{
              fontSize: '3rem',
              fontWeight: '700',
              color: '#dc2626',
              marginBottom: '0.5rem',
              fontFamily: '"Oswald", sans-serif'
            }}>
              {stat.number}
            </div>
            <div style={{ color: '#d4d4d4', fontSize: '1.1rem' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      <div style={{
        background: 'rgba(220, 38, 38, 0.05)',
        border: '1px solid rgba(220, 38, 38, 0.2)',
        borderRadius: '20px',
        padding: '20px',
        textAlign: 'center'
      }}>
        <h2 style={{
          fontFamily: '"Oswald", sans-serif',
          fontSize: '2rem',
          marginBottom: '20px',
          color: '#f5f5f5'
        }}>
          Get in Touch
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          maxWidth: '900px',
          margin: '0 auto'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
            <Phone size={24} color="#dc2626" />
            <div>
              <div style={{ color: '#a3a3a3', fontSize: '0.9rem' }}>Phone</div>
              <div style={{ color: '#f5f5f5', fontWeight: '600' }}>203-350-2014</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
            <Mail size={24} color="#dc2626" />
            <div>
              <div style={{ color: '#a3a3a3', fontSize: '0.9rem' }}>Email</div>
              <div style={{ color: '#f5f5f5', fontWeight: '600' }}>info@greenwichpropertycare.com</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
            <Clock size={24} color="#dc2626" />
            <div>
              <div style={{ color: '#a3a3a3', fontSize: '0.9rem' }}>Hours</div>
              <div style={{ color: '#f5f5f5', fontWeight: '600' }}>24/7 Support</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
 
// ============================================
// FOOTER
// ============================================
function Footer({ setCurrentPage }) {
  return (
    <footer style={{
      background: 'rgba(10, 10, 10, 0.95)',
      borderTop: '1px solid rgba(220, 38, 38, 0.15)',
      padding: '60px 2rem 40px',
      marginTop: '60px',
      position: 'relative',
      zIndex: 1
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '3rem',
        marginBottom: '30px'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <img
            src={LOGO}
            alt="Greenwich Property Care"
            style={{ height: '189px', width: 'auto', display: 'block', marginBottom: '1rem' }}
          />
          <p style={{ color: '#a3a3a3', lineHeight: '1.6', fontSize: '0.95rem', textAlign: 'left' }}>
            Your trusted partner for all home improvement and maintenance needs.
          </p>
        </div>

        <div>
          <h4 style={{ color: '#f5f5f5', marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '600' }}>
            Quick Links
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {['Services', 'Request Quote', 'About', 'Portal'].map(link => (
              <button
                key={link}
                onClick={() => setCurrentPage(link.toLowerCase().replace(' ', '-'))}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#a3a3a3',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  textAlign: 'left',
                  padding: '0.25rem 0',
                  transition: 'color 0.3s ease'
                }}
                onMouseEnter={(e) => e.target.style.color = '#dc2626'}
                onMouseLeave={(e) => e.target.style.color = '#a3a3a3'}
              >
                {link}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h4 style={{
            color: '#f5f5f5',
            marginBottom: '1rem',
            fontSize: '1.1rem',
            fontWeight: 600
          }}>
            Contact
          </h4>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            color: '#a3a3a3',
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
        borderTop: '1px solid rgba(220, 38, 38, 0.15)',
        paddingTop: '2rem',
        textAlign: 'center',
        color: '#a3a3a3',
        fontSize: '0.9rem'
      }}>
        <p>© {new Date().getFullYear()} Greenwich Property Care. All rights reserved.</p>
      </div>
    </footer>
  );
}
 
