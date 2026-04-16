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
    <div style={{ padding: '60px 2rem', maxWidth: '500px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{
          fontFamily: '"Oswald", sans-serif',
          fontSize: '3rem',
          marginBottom: '1rem',
          background: 'linear-gradient(135deg, #ffffff 0%, #dc2626 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Customer Login
        </h1>
        <p style={{ color: '#a3a3a3' }}>Access your dashboard to view quotes and projects</p>
      </div>

      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '12px',
          padding: '1rem',
          marginBottom: '20px',
          color: '#ef4444',
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} style={{
        background: 'rgba(20, 20, 20, 0.5)',
        border: '1px solid rgba(220, 38, 38, 0.15)',
        borderRadius: '24px',
        padding: '20px',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#f5f5f5', fontWeight: 500 }}>
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
              border: '1px solid rgba(220, 38, 38, 0.3)',
              background: 'rgba(15, 23, 42, 0.5)',
              color: '#f5f5f5',
              fontSize: '1rem'
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#f5f5f5', fontWeight: 500 }}>
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
              border: '1px solid rgba(220, 38, 38, 0.3)',
              background: 'rgba(15, 23, 42, 0.5)',
              color: '#f5f5f5',
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
              ? 'rgba(220, 38, 38, 0.5)' 
              : 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
            color: '#0a0a0a',
            transition: 'all 0.3s ease',
            boxShadow: '0 8px 24px rgba(220, 38, 38, 0.3)'
          }}
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>

        <div style={{
          marginTop: '1.5rem',
          textAlign: 'center',
          color: '#a3a3a3',
          fontSize: '0.9rem'
        }}>
          <p style={{ marginBottom: '0.5rem' }}>
            <span 
              onClick={() => setCurrentPage('forgot-password')}
              style={{ color: '#dc2626', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Forgot your password?
            </span>
          </p>
          <p>
            Don't have an account?{' '}
            <span 
              onClick={() => setCurrentPage('register')}
              style={{ color: '#dc2626', cursor: 'pointer', textDecoration: 'underline' }}
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

// ============================================
// REGISTER PAGE
// ============================================
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
    border: '1px solid rgba(220, 38, 38, 0.3)',
    background: 'rgba(15, 23, 42, 0.5)',
    color: '#f5f5f5',
    fontSize: '1rem',
    boxSizing: 'border-box'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '0.5rem',
    color: '#f5f5f5',
    fontWeight: 500
  };

  return (
    <div style={{ padding: '60px 2rem', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1 style={{
          fontFamily: '"Oswald", sans-serif',
          fontSize: '2.5rem',
          marginBottom: '1rem',
          background: 'linear-gradient(135deg, #ffffff 0%, #dc2626 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Create Your Account
        </h1>
        <p style={{ color: '#a3a3a3' }}>Join Greenwich Property Care to manage your projects</p>
      </div>

      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '12px',
          padding: '1rem',
          marginBottom: '20px',
          color: '#ef4444',
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleRegister} style={{
        background: 'rgba(20, 20, 20, 0.5)',
        border: '1px solid rgba(220, 38, 38, 0.15)',
        borderRadius: '24px',
        padding: '20px',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '1rem' }}>
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

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '10px', marginBottom: '1rem' }}>
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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
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
              ? 'rgba(220, 38, 38, 0.5)' 
              : 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
            color: '#0a0a0a',
            transition: 'all 0.3s ease',
            boxShadow: '0 8px 24px rgba(220, 38, 38, 0.3)'
          }}
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </button>

        <p style={{
          marginTop: '1.5rem',
          textAlign: 'center',
          color: '#a3a3a3',
          fontSize: '0.9rem'
        }}>
          Already have an account?{' '}
          <span 
            onClick={() => setCurrentPage('portal')}
            style={{ color: '#dc2626', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Login here
          </span>
        </p>
      </form>
    </div>
  );
}

// Forgot Password Page

// ============================================
// FORGOT PASSWORD PAGE
// ============================================
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
    border: '1px solid rgba(220, 38, 38, 0.3)',
    background: 'rgba(15, 23, 42, 0.5)',
    color: '#f5f5f5',
    fontSize: '1rem',
    boxSizing: 'border-box'
  };

  return (
    <div style={{ padding: '60px 2rem', maxWidth: '500px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1 style={{
          fontFamily: '"Oswald", sans-serif',
          fontSize: '2.5rem',
          marginBottom: '1rem',
          background: 'linear-gradient(135deg, #ffffff 0%, #dc2626 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Reset Password
        </h1>
        <p style={{ color: '#a3a3a3' }}>
          {step === 1 && "Enter your email to receive a reset code"}
          {step === 2 && "Enter the 6-digit code"}
          {step === 3 && "Create your new password"}
        </p>
      </div>

      {/* Progress Indicator */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '10px', 
        marginBottom: '20px' 
      }}>
        {[1, 2, 3].map(s => (
          <div
            key={s}
            style={{
              width: '40px',
              height: '4px',
              borderRadius: '2px',
              background: s <= step ? '#dc2626' : 'rgba(220, 38, 38, 0.2)'
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
          marginBottom: '20px',
          color: '#ef4444',
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}

      {message && (
        <div style={{
          background: 'rgba(220, 38, 38, 0.1)',
          border: '1px solid rgba(220, 38, 38, 0.3)',
          borderRadius: '12px',
          padding: '1rem',
          marginBottom: '20px',
          color: '#dc2626',
          textAlign: 'center'
        }}>
          {message}
        </div>
      )}

      <div style={{
        background: 'rgba(20, 20, 20, 0.5)',
        border: '1px solid rgba(220, 38, 38, 0.15)',
        borderRadius: '24px',
        padding: '20px',
        backdropFilter: 'blur(10px)'
      }}>
        {/* Step 1: Enter Email */}
        {step === 1 && (
          <form onSubmit={handleRequestCode}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#f5f5f5', fontWeight: 500 }}>
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
                background: isLoading ? 'rgba(220, 38, 38, 0.5)' : 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                color: '#0a0a0a'
              }}
            >
              {isLoading ? 'Sending...' : 'Send Reset Code'}
            </button>
          </form>
        )}

        {/* Step 2: Enter Code */}
        {step === 2 && (
          <form onSubmit={handleVerifyCode}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#f5f5f5', fontWeight: 500 }}>
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
              <p style={{ color: '#a3a3a3', fontSize: '0.85rem', marginTop: '0.5rem' }}>
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
                background: isLoading ? 'rgba(220, 38, 38, 0.5)' : 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                color: '#0a0a0a'
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
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#f5f5f5', fontWeight: 500 }}>
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
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#f5f5f5', fontWeight: 500 }}>
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
                background: isLoading ? 'rgba(220, 38, 38, 0.5)' : 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                color: '#0a0a0a'
              }}
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        <p style={{
          marginTop: '1.5rem',
          textAlign: 'center',
          color: '#a3a3a3',
          fontSize: '0.9rem'
        }}>
          Remember your password?{' '}
          <span 
            onClick={() => setCurrentPage('portal')}
            style={{ color: '#dc2626', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Back to Login
          </span>
        </p>
      </div>
    </div>
  );
}

// Admin Dashboard

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
function AdminQuotesTab({ quotes, token, onRefresh, user }) {
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

// Services Page

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

// Request Quote Page

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

// Footer Component

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
            src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABgAAAAQACAYAAAAncZJCAAEAAElEQVR4nOz9ebStWVrX+X7nnO+71trdaSOyjexIIKVVILHFjgLrWjYIhSJW1aUEpFG5VUqB5dCrdbUEy7JQkMLrsNBboqiIlgkKCAkkjZlCQgoJmSTZZ0RkxIk47e5W877vnPP+8b5rn32CyMRKMqPL72eMHWfvtVe/zogzxvM88/eAJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmS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AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4HP6/wFu4aKxKGv0PwAAAABJRU5ErkJggg=="
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
        <p>© 2026 Greenwich Property Care. All rights reserved.</p>
      </div>
    </footer>
  );
}
