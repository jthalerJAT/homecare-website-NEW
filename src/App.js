import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Calendar, CheckCircle, DollarSign, Menu, X, ArrowRight, Star, Phone, Mail, Clock, Plus, Send, ChevronDown, ChevronUp, Search, User, Settings, FileText, Briefcase, MessageSquare, Users, Trash2, Edit, AlertCircle } from 'lucide-react';
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
      case 'account-settings':
        if (!isAuthenticated) return <LoginPage onLoginSuccess={handleLogin} setCurrentPage={setCurrentPage} />;
        return <AccountSettingsPage user={user} token={token} refreshUser={refreshUser} setCurrentPage={setCurrentPage} />;
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
        .animate-in { animation: fadeInUp 0.8s ease-out forwards; }
        * { scrollbar-width: thin; scrollbar-color: rgba(220,38,38,0.3) transparent; }
        *::-webkit-scrollbar { width: 6px; }
        *::-webkit-scrollbar-track { background: transparent; }
        *::-webkit-scrollbar-thumb { background: rgba(220,38,38,0.3); border-radius: 3px; }
        input::placeholder, textarea::placeholder { color: #6b7280; }
      `}</style>
 
      {/* NAVIGATION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 30px', borderBottom: '1px solid rgba(220, 38, 38, 0.15)', position: 'sticky', top: 0, zIndex: 100, background: 'rgba(10, 10, 10, 0.95)', backdropFilter: 'blur(20px)' }}>
        <div onClick={() => setCurrentPage('home')} style={{ cursor: 'pointer' }}>
          <img src="https://i.imgur.com/YourLogoHere.png" alt="Greenwich Property Care" style={{ height: '60px', width: 'auto', display: 'block' }}
            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
          />
          <span style={{ display: 'none', fontFamily: '"Oswald", sans-serif', fontSize: '1.5rem', fontWeight: 700, color: COLORS.red }}>GPC</span>
        </div>
 
        <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
          <div className="desktop-nav" style={{ display: 'flex', gap: '25px' }}>
            {[
              { key: 'home', label: 'Home' },
              { key: 'services', label: 'Services' },
              { key: 'request-quote', label: 'Get Quote' },
              { key: 'about', label: 'About' },
              { key: 'portal', label: isAuthenticated ? 'My Account' : 'Login' }
            ].map(({ key, label }) => (
              <button key={key} onClick={() => { setCurrentPage(key); setMobileMenuOpen(false); }}
                style={{ background: 'none', border: 'none', color: currentPage === key ? COLORS.red : COLORS.text, cursor: 'pointer', fontSize: '1.05rem', fontWeight: '600', transition: 'all 0.3s ease', padding: '0.5rem 0', position: 'relative' }}
                onMouseEnter={(e) => e.target.style.color = COLORS.red}
                onMouseLeave={(e) => e.target.style.color = currentPage === key ? COLORS.red : COLORS.text}
              >
                {label}
                {currentPage === key && <div style={{ position: 'absolute', bottom: '-2px', left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, ${COLORS.red}, ${COLORS.redLight})`, borderRadius: '2px' }} />}
              </button>
            ))}
            {isAuthenticated && (
              <button onClick={() => { setCurrentPage('account-settings'); setMobileMenuOpen(false); }}
                style={{ background: 'none', border: 'none', color: currentPage === 'account-settings' ? COLORS.red : COLORS.textMuted, cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Settings size={16} /> Settings
              </button>
            )}
          </div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-menu-btn"
            style={{ background: 'none', border: 'none', color: COLORS.red, cursor: 'pointer', display: 'none' }}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
 
      {mobileMenuOpen && (
        <div style={{ background: COLORS.bg, borderTop: `1px solid ${COLORS.border}`, padding: '20px', position: 'sticky', top: '80px', zIndex: 99 }}>
          {['home', 'services', 'request-quote', 'about', 'portal'].map(page => (
            <button key={page} onClick={() => { setCurrentPage(page); setMobileMenuOpen(false); }}
              style={{ display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', color: currentPage === page ? COLORS.red : COLORS.text, cursor: 'pointer', fontSize: '1.1rem', fontWeight: '600', padding: '12px 0', borderBottom: `1px solid ${COLORS.border}`, textTransform: 'capitalize' }}>
              {page === 'request-quote' ? 'Get Quote' : page === 'portal' ? (isAuthenticated ? 'My Account' : 'Login') : page}
            </button>
          ))}
          {isAuthenticated && (
            <button onClick={() => { setCurrentPage('account-settings'); setMobileMenuOpen(false); }}
              style={{ display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', color: COLORS.textMuted, cursor: 'pointer', fontSize: '1rem', padding: '12px 0' }}>
              Account Settings
            </button>
          )}
        </div>
      )}
 
      {/* RESPONSIVE CSS */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
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
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const messagesEndRef = useRef(null);
 
  const fetchMessages = useCallback(async () => {
    try {
      const result = await api.getMessages(type, id, token);
      setMessages(result.messages || []);
    } catch (e) { console.error('Error fetching messages:', e); }
    finally { setIsLoading(false); }
  }, [type, id, token]);
 
  useEffect(() => { fetchMessages(); }, [fetchMessages]);
  useEffect(() => { if (expanded) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, expanded]);
 
  // Poll for new messages every 10s
  useEffect(() => {
    if (readOnly) return;
    const interval = setInterval(fetchMessages, 10000);
    return () => clearInterval(interval);
  }, [fetchMessages, readOnly]);
 
  const handleSend = async () => {
    if (!newMessage.trim() || isSending) return;
    setIsSending(true);
    try {
      const data = type === 'quote' ? { quoteRequestId: id, message: newMessage } : { projectId: id, message: newMessage };
      await api.sendMessage(data, token);
      setNewMessage('');
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
        {readOnly ? 'Quote Messaging History' : 'Message Your Rep'}
        <span style={{ color: COLORS.textMuted, fontSize: '0.85rem' }}>({messages.length} messages)</span>
        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </div>
 
      {expanded && (
        <div style={{ background: 'rgba(10,10,10,0.5)', borderRadius: '12px', border: `1px solid ${COLORS.border}`, overflow: 'hidden' }}>
          <div style={{ maxHeight: '350px', overflowY: 'auto', padding: '15px' }}>
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
               return (
                 <div key={msg.id || i} style={{ display: 'flex', justifyContent: own ? 'flex-end' : 'flex-start', marginBottom: '10px' }}>
                   <div style={{ maxWidth: '75%', padding: '10px 14px', borderRadius: '12px', background: own ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.08)', border: `1px solid ${own ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.1)'}` }}>
                     <p style={{ color: COLORS.textMuted, fontSize: '0.75rem', marginBottom: '4px', fontWeight: 600 }}>
                       {msg.first_name} {msg.last_name}
                     </p>
                     <p style={{ color: COLORS.text, fontSize: '0.95rem', lineHeight: '1.4', wordBreak: 'break-word' }}>{msg.message}</p>
                     <p style={{ color: COLORS.textMuted, fontSize: '0.7rem', fontStyle: 'italic', marginTop: '4px', textAlign: 'right' }}>
                       {formatDateTimeEST(msg.created_at)}
                     </p>
                   </div>
                 </div>
               );
             })}
            <div ref={messagesEndRef} />
          </div>
 
          {!readOnly && (
            <div style={{ display: 'flex', gap: '8px', padding: '12px', borderTop: `1px solid ${COLORS.border}` }}>
              <input value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="Type a message..."
                style={{ ...inputStyle, flex: 1, padding: '10px 14px', borderRadius: '10px' }} />
              <button onClick={handleSend} disabled={isSending || !newMessage.trim()}
                style={{ ...btnPrimary, padding: '10px 16px', borderRadius: '10px', opacity: isSending || !newMessage.trim() ? 0.5 : 1 }}>
                <Send size={18} />
              </button>
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
        <OpenQuotesTab quotes={openQuotes} token={token} user={user} onRefresh={fetchData} />
      )}
 
      {!isLoading && activeTab === 'open-jobs' && (
        <OpenJobsTab projects={openJobs} token={token} user={user} onRefresh={fetchData} refreshUser={refreshUser} />
      )}
 
      {!isLoading && activeTab === 'past-jobs' && (
        <PastJobsTab projects={pastJobs} token={token} user={user} />
      )}
    </div>
  );
}
 
// ============================================
// OPEN QUOTES TAB
// ============================================
function OpenQuotesTab({ quotes, token, user, onRefresh }) {
  const [expandedId, setExpandedId] = useState(null);
  const [showPayment, setShowPayment] = useState(null);
 
  const handleAccept = async (quoteId) => {
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
      {projects.map(project => (
        <div key={project.id}>
          <JobWindow onClick={() => setExpandedId(expandedId === project.id ? null : project.id)}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr 1fr', gap: '10px', alignItems: 'center' }}>
              <span style={{ color: COLORS.textLight }}>{formatDateEST(project.closed_at || project.created_at)}</span>
              <span style={{ color: COLORS.text, fontWeight: 600 }}>{project.service_type || project.title}</span>
              <span style={{ color: COLORS.textMuted }}>{project.description}</span>
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
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await api.submitQuote(formData, token);
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
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '', phone: '', address: '', city: '', state: '', zipCode: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
 
  const handleRegister = async (e) => {
    e.preventDefault(); setError('');
    if (formData.password !== formData.confirmPassword) { setError('Passwords do not match'); return; }
    if (formData.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setIsLoading(true);
    try {
      const result = await api.register({ email: formData.email, password: formData.password, firstName: formData.firstName, lastName: formData.lastName, phone: formData.phone, address: formData.address, city: formData.city, state: formData.state, zipCode: formData.zipCode });
      if (result.token) { onRegisterSuccess(result.user, result.token); setCurrentPage('portal'); }
      else { setError(result.error || 'Registration failed'); }
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
        <button type="submit" disabled={isLoading} style={{ ...btnPrimary, width: '100%', opacity: isLoading ? 0.6 : 1 }}>{isLoading ? 'Creating Account...' : 'Create Account'}</button>
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
 
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button onClick={() => { setActiveSection('info'); setMessage(''); }} style={{ ...( activeSection === 'info' ? btnPrimary : btnSecondary), padding: '8px 20px', fontSize: '0.9rem' }}>Edit Account Info</button>
        <button onClick={() => { setActiveSection('password'); setMessage(''); }} style={{ ...(activeSection === 'password' ? btnPrimary : btnSecondary), padding: '8px 20px', fontSize: '0.9rem' }}>Change Password</button>
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
 
      <p style={{ marginTop: '20px', textAlign: 'center' }}>
        <span onClick={() => setCurrentPage('portal')} style={{ color: COLORS.red, cursor: 'pointer', textDecoration: 'underline' }}>← Back to My Account</span>
      </p>
    </div>
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
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{ padding: '0.4rem 0.8rem', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '8px', color: COLORS.redLight, fontSize: '0.85rem', fontWeight: 600 }}>ADMIN</span>
          <button onClick={onLogout} style={btnSecondary}>Logout</button>
        </div>
      </div>
 
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
      {!isLoading && activeTab === 'quotes' && <AdminQuotesTab quotes={quotes} token={token} onRefresh={fetchData} />}
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
      <div style={{ display: 'grid', gridTemplateColumns: '0.8fr 1.5fr 1fr 1fr 1.5fr 1fr', gap: '10px', padding: '0 20px', color: COLORS.textMuted, fontSize: '0.8rem', fontWeight: 600 }}>
        <span>Date</span><span>Address</span><span>Customer</span><span>Contact</span><span>Description</span><span>Rep(s)</span>
      </div>
      {jobs.map(job => (
        <div key={job.id}>
          <JobWindow onClick={() => setExpandedId(expandedId === job.id ? null : job.id)}>
            <div style={{ display: 'grid', gridTemplateColumns: '0.8fr 1.5fr 1fr 1fr 1.5fr 1fr', gap: '10px', alignItems: 'center', fontSize: '0.9rem' }}>
              <span style={{ color: COLORS.textLight }}>{formatDateEST(job.scheduled_date || job.created_at)}</span>
              <span style={{ color: COLORS.text, fontWeight: 600 }}>{job.address || 'N/A'}</span>
              <span style={{ color: COLORS.textLight }}>{job.first_name} {job.last_name}</span>
              <span style={{ color: COLORS.textLight }}>{job.phone || 'N/A'}</span>
              <span style={{ color: COLORS.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.description}</span>
              <span style={{ color: COLORS.textMuted }}>{job.assigned_reps ? job.assigned_reps.map(r => r.rep_name).join(', ') : 'None'}</span>
            </div>
          </JobWindow>
          {expandedId === job.id && (
            <AdminJobExpanded job={job} token={token} user={user} onRefresh={onRefresh} />
          )}
        </div>
      ))}
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
 
  return (
    <div style={{ ...cardStyle, marginTop: '5px', borderColor: COLORS.red }}>
      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap' }}>
        <button onClick={() => setShowChangeOrder(!showChangeOrder)} style={{ ...btnPrimary, padding: '8px 16px', fontSize: '0.9rem' }}>
          <Plus size={14} style={{ marginRight: '4px' }} /> New Change Order
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
 
      {/* Change Order Form */}
      {showChangeOrder && (
        <div style={{ background: 'rgba(10,10,10,0.5)', borderRadius: '10px', padding: '15px', marginBottom: '15px', border: `1px solid ${COLORS.borderRed}` }}>
          <h4 style={{ color: COLORS.red, marginBottom: '10px' }}>Create Change Order</h4>
          <div style={{ marginBottom: '10px' }}><label style={labelStyle}>Description</label><textarea value={coDescription} onChange={(e) => setCoDescription(e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical' }} /></div>
          <div style={{ marginBottom: '10px' }}><label style={labelStyle}>Amount ($)</label><input type="number" step="0.01" value={coAmount} onChange={(e) => setCoAmount(e.target.value)} style={inputStyle} /></div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handleCreateChangeOrder} style={{ ...btnPrimary, padding: '8px 20px' }}>Submit Change Order</button>
            <button onClick={() => setShowChangeOrder(false)} style={btnSecondary}>Cancel</button>
          </div>
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
// ADMIN: QUOTES TAB
// ============================================
function AdminQuotesTab({ quotes, token, onRefresh }) {
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [quoteForm, setQuoteForm] = useState({ amount: '', duration: '', scope: '', proposedStartDate: '', proposedWorkTime: '' });
  const [showConfirmDelete, setShowConfirmDelete] = useState(null);
 
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
 
  return (
    <div style={{ display: 'grid', gap: '12px' }}>
      {quotes.map(quote => (
        <div key={quote.id} style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ color: COLORS.text, fontSize: '1.1rem', fontWeight: 600 }}>{quote.service_type || quote.title}</h3>
              <p style={{ color: COLORS.textMuted, fontSize: '0.85rem' }}>{formatDateTimeEST(quote.created_at)}</p>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <StatusBadge status={quote.status} />
              <button onClick={() => setShowConfirmDelete(quote.id)} style={{ background: 'none', border: 'none', color: COLORS.textMuted, cursor: 'pointer' }}><Trash2 size={16} /></button>
            </div>
          </div>
 
          {showConfirmDelete === quote.id && <ConfirmDialog message="Delete this quote request?" onConfirm={async () => { await api.adminDeleteQuote(quote.id, token); setShowConfirmDelete(null); onRefresh(); }} onCancel={() => setShowConfirmDelete(null)} />}
 
          <div style={{ background: 'rgba(10,10,10,0.5)', borderRadius: '8px', padding: '10px', marginBottom: '10px' }}>
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
              <button onClick={() => setSelectedQuote(quote.id)} style={{ ...btnPrimary, padding: '8px 20px', fontSize: '0.9rem' }}>Create & Send Quote</button>
            )
          )}
 
          {quote.status === 'quoted' && <p style={{ color: COLORS.red, padding: '8px', background: `${COLORS.red}10`, borderRadius: '8px' }}>✓ Quote sent - awaiting customer response</p>}
          {quote.status === 'accepted' && <p style={{ color: COLORS.green, padding: '8px', background: `${COLORS.green}10`, borderRadius: '8px' }}>✓ Accepted - Project created</p>}
 
          <MessageChat type="quote" id={quote.id} token={token} currentUser={{ id: 0, ...user }} />
        </div>
      ))}
    </div>
  );
}
 
// ============================================
// ADMIN: PROJECTS TAB
// ============================================
function AdminProjectsTab({ projects, token, user, onRefresh }) {
  const [expandedId, setExpandedId] = useState(null);
  return (
    <div style={{ display: 'grid', gap: '12px' }}>
      {projects.length === 0 ? <div style={{ ...cardStyle, textAlign: 'center' }}><p style={{ color: COLORS.textMuted }}>No projects yet.</p></div> :
        projects.map(job => (
          <div key={job.id}>
            <JobWindow onClick={() => setExpandedId(expandedId === job.id ? null : job.id)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <span style={{ color: COLORS.text, fontWeight: 600 }}>{job.title || job.service_type}</span>
                  <span style={{ color: COLORS.textMuted, marginLeft: '10px', fontSize: '0.85rem' }}>{job.first_name} {job.last_name} — {formatDateEST(job.created_at)}</span>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ color: COLORS.textLight }}>${parseFloat(job.total_amount || 0).toFixed(2)}</span>
                  <StatusBadge status={job.status} />
                </div>
              </div>
            </JobWindow>
            {expandedId === job.id && <AdminJobExpanded job={job} token={token} user={user} onRefresh={onRefresh} />}
          </div>
        ))
      }
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
            results.map((item, i) => (
              <JobWindow key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <span style={{ color: COLORS.text, fontWeight: 600 }}>{item.service_type}</span>
                    {item.first_name && <span style={{ color: COLORS.textMuted, marginLeft: '10px', fontSize: '0.85rem' }}>{item.first_name} {item.last_name}</span>}
                    <p style={{ color: COLORS.textMuted, fontSize: '0.85rem', marginTop: '4px' }}>{item.description?.substring(0, 100)}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ color: COLORS.textMuted, fontSize: '0.8rem' }}>{formatDateEST(item.created_at)}</span>
                    <StatusBadge status={item.activity_type === 'quote' ? item.status : item.status} />
                    <span style={{ padding: '0.3rem 0.6rem', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', color: COLORS.textMuted, fontSize: '0.75rem', textTransform: 'capitalize' }}>{item.activity_type?.replace('_', ' ')}</span>
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
// ADMIN: REPS TAB
// ============================================
function AdminRepsTab({ token, onRefresh }) {
  const [reps, setReps] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRep, setNewRep] = useState({ firstName: '', lastName: '', email: '', phone: '', trade: '', notes: '' });
  const [showConfirmDelete, setShowConfirmDelete] = useState(null);
 
  useEffect(() => { api.adminGetReps(token).then(r => setReps(r.reps || [])); }, [token]);
 
  const handleAddRep = async () => {
    if (!newRep.firstName || !newRep.lastName || !newRep.email) { alert('Name and email required'); return; }
    const result = await api.adminAddRep(newRep, token);
    if (result.rep) {
      alert(`Rep created! Temp password: ${result._devTempPassword || 'check logs'}`);
      setShowAddForm(false);
      setNewRep({ firstName: '', lastName: '', email: '', phone: '', trade: '', notes: '' });
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
      <div style={{ padding: '80px 2rem', textAlign: 'center', maxWidth: '1000px', margin: '0 auto' }}>
        <h1 className="animate-in" style={{ fontFamily: '"Oswald", sans-serif', fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.5rem' }}>
          Greenwich <span style={{ color: COLORS.red }}>Property Care</span>
        </h1>
        <p style={{ fontSize: '1.2rem', color: COLORS.textMuted, maxWidth: '600px', margin: '0 auto 2rem', lineHeight: 1.6 }}>
          Professional home improvement and maintenance services you can trust. From small repairs to full renovations.
        </p>
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => setCurrentPage('request-quote')} style={btnPrimary}>Get a Free Quote <ArrowRight size={18} style={{ marginLeft: '8px' }} /></button>
          <button onClick={() => setCurrentPage('services')} style={btnSecondary}>Our Services</button>
        </div>
      </div>
 
      {/* Quick Features */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', maxWidth: '1200px', margin: '0 auto', padding: '0 2rem 60px' }}>
        {[
          { icon: <Calendar size={32} />, title: 'Easy Scheduling', desc: 'Book services at your convenience with our online scheduling system.' },
          { icon: <CheckCircle size={32} />, title: 'Quality Work', desc: 'Licensed professionals delivering top-quality results every time.' },
          { icon: <DollarSign size={32} />, title: 'Fair Pricing', desc: 'Transparent pricing with detailed quotes before any work begins.' },
        ].map((feature, i) => (
          <div key={i} style={{ ...cardStyle, textAlign: 'center', padding: '30px' }}>
            <div style={{ color: COLORS.red, marginBottom: '15px' }}>{feature.icon}</div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', color: COLORS.text }}>{feature.title}</h3>
            <p style={{ color: COLORS.textMuted, lineHeight: 1.6 }}>{feature.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
 
// ============================================
// SERVICES PAGE
// ============================================
function ServicesPage({ setCurrentPage }) {
  const services = [
    { name: 'General Maintenance', desc: 'Regular upkeep and repairs for your property.' },
    { name: 'Plumbing', desc: 'Leak repairs, fixture installation, and pipe work.' },
    { name: 'Electrical', desc: 'Wiring, panel upgrades, and lighting installation.' },
    { name: 'Painting', desc: 'Interior and exterior painting services.' },
    { name: 'Carpentry', desc: 'Custom woodwork, cabinetry, and structural repairs.' },
    { name: 'Landscaping', desc: 'Lawn care, garden design, and outdoor maintenance.' },
    { name: 'HVAC', desc: 'Heating and cooling system installation and maintenance.' },
    { name: 'Roofing', desc: 'Roof repairs, replacement, and maintenance.' },
    { name: 'Flooring', desc: 'Hardwood, tile, and carpet installation.' },
    { name: 'Masonry', desc: 'Brick, stone, and concrete work.' },
  ];
 
  return (
    <div style={{ padding: '60px 2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontFamily: '"Oswald", sans-serif', fontSize: '2.5rem', textAlign: 'center', marginBottom: '40px', color: COLORS.text }}>
        Our <span style={{ color: COLORS.red }}>Services</span>
      </h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        {services.map((service, i) => (
          <div key={i} style={{ ...cardStyle, transition: 'all 0.3s ease' }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = COLORS.red}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = COLORS.border}>
            <h3 style={{ color: COLORS.text, fontSize: '1.1rem', marginBottom: '8px', fontWeight: 600 }}>{service.name}</h3>
            <p style={{ color: COLORS.textMuted, lineHeight: 1.5, marginBottom: '12px' }}>{service.desc}</p>
            <button onClick={() => setCurrentPage('request-quote')} style={{ background: 'none', border: 'none', color: COLORS.red, cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>
              Get Quote →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
 
// ============================================
// ABOUT PAGE
// ============================================
function AboutPage() {
  return (
    <div style={{ padding: '60px 2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h1 style={{ fontFamily: '"Oswald", sans-serif', fontSize: '2.5rem', textAlign: 'center', marginBottom: '30px', color: COLORS.text }}>
        About <span style={{ color: COLORS.red }}>Greenwich Property Care</span>
      </h1>
      <div style={cardStyle}>
        <p style={{ color: COLORS.textLight, lineHeight: 1.8, fontSize: '1.05rem', marginBottom: '15px' }}>
          Greenwich Property Care is a full-service home improvement and maintenance company serving the Greenwich, CT area.
          We specialize in delivering professional, reliable, and high-quality services for residential and commercial properties.
        </p>
        <p style={{ color: COLORS.textLight, lineHeight: 1.8, fontSize: '1.05rem', marginBottom: '15px' }}>
          From routine maintenance to large-scale renovations, our experienced team handles every project with care and expertise.
          We pride ourselves on transparent pricing, clear communication, and exceptional workmanship.
        </p>
        <p style={{ color: COLORS.textLight, lineHeight: 1.8, fontSize: '1.05rem' }}>
          Contact us today to discuss your next project. We look forward to working with you.
        </p>
        <div style={{ marginTop: '20px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <p style={{ color: COLORS.textMuted, display: 'flex', alignItems: 'center', gap: '8px' }}><Phone size={16} style={{ color: COLORS.red }} /> (203) 555-0100</p>
          <p style={{ color: COLORS.textMuted, display: 'flex', alignItems: 'center', gap: '8px' }}><Mail size={16} style={{ color: COLORS.red }} /> john@greenwichpropertycare.com</p>
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
    <div style={{ background: 'rgba(10,10,10,0.8)', borderTop: `1px solid ${COLORS.border}`, padding: '40px 2rem', marginTop: '60px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '30px' }}>
        <div>
          <h3 style={{ fontFamily: '"Oswald", sans-serif', color: COLORS.red, fontSize: '1.3rem', marginBottom: '10px' }}>Greenwich Property Care</h3>
          <p style={{ color: COLORS.textMuted, lineHeight: 1.6 }}>Professional home improvement<br />and maintenance services.</p>
        </div>
        <div>
          <h4 style={{ color: COLORS.text, marginBottom: '10px', fontWeight: 600 }}>Quick Links</h4>
          {['home', 'services', 'request-quote', 'about', 'portal'].map(page => (
            <button key={page} onClick={() => setCurrentPage(page)}
              style={{ display: 'block', background: 'none', border: 'none', color: COLORS.textMuted, cursor: 'pointer', padding: '3px 0', textTransform: 'capitalize', fontSize: '0.9rem' }}
              onMouseEnter={(e) => e.target.style.color = COLORS.red}
              onMouseLeave={(e) => e.target.style.color = COLORS.textMuted}>
              {page === 'request-quote' ? 'Get Quote' : page === 'portal' ? 'My Account' : page}
            </button>
          ))}
        </div>
        <div>
          <h4 style={{ color: COLORS.text, marginBottom: '10px', fontWeight: 600 }}>Contact</h4>
          <p style={{ color: COLORS.textMuted, lineHeight: 1.8 }}>Greenwich, CT<br />john@greenwichpropertycare.com</p>
        </div>
      </div>
      <div style={{ maxWidth: '1200px', margin: '30px auto 0', paddingTop: '20px', borderTop: `1px solid ${COLORS.border}`, textAlign: 'center', color: COLORS.textMuted, fontSize: '0.85rem' }}>
        © {new Date().getFullYear()} Greenwich Property Care. All rights reserved.
      </div>
    </div>
  );
}
 
