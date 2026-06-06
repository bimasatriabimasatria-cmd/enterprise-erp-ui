import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import axios from 'axios';

// Import Semua Halaman
import DashboardPage from './pages/DashboardPage';
import HrPage from './pages/HrPage';
import FinancePage from './pages/FinancePage';
import AccountPage from './pages/AccountPage';
import InventoryPage from './pages/InventoryPage';
import CrmPage from './pages/CrmPage';
import PurchaseOrderPage from './pages/PurchaseOrderPage';
import ManufacturingPage from './pages/ManufacturingPage';

const baseUrl = 'https://bimasatria-enterprise-erp-api.hf.space';

const parseJwt = (token) => {
  try { return JSON.parse(atob(token.split('.')[1])); } 
  catch (e) { return null; }
};

// ==========================================
// 1. KOMPONEN PELINDUNG RUTE TINGKAT TINGGI (RBAC)
// ==========================================
function RoleProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role') || 'staff';

  if (!token) return <Navigate to="/login" replace />;
  if (userRole === 'super_admin') return children;

  if (!allowedRoles.includes(userRole)) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-100 text-slate-800 p-6 text-center">
        <span className="text-6xl mb-4">⛔</span>
        <h1 className="text-2xl md:text-3xl font-black mb-2 text-red-600">Akses Ditolak (403)</h1>
        <p className="mb-6 font-medium text-gray-500 text-sm md:text-base">Jabatan Anda (<span className="text-indigo-600 uppercase">{userRole}</span>) tidak memiliki wewenang membuka brankas ini.</p>
        <button onClick={() => window.location.href = '/dashboard'} className="bg-slate-800 text-white px-6 py-3 rounded-lg font-bold hover:bg-slate-900 w-full md:w-auto">
          Kembali ke Wilayah Aman
        </button>
      </div>
    );
  }
  return children;
}

// ==========================================
// 2. KOMPONEN LOGIN DENGAN RADAR PWA
// ==========================================
function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setShowInstallBtn(false);
      setDeferredPrompt(null);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${baseUrl}/api/auth/login`, { email, password });
      const token = response.data.token;
      
      localStorage.setItem('token', token);
      const decoded = parseJwt(token);
      localStorage.setItem('role', decoded?.role || 'staff');
      localStorage.setItem('user_name', decoded?.name || email.split('@')[0]);

      navigate('/dashboard'); 
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal login. Periksa email/password.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center relative overflow-hidden p-4">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-emerald-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

      <div className="bg-white p-8 md:p-10 rounded-2xl shadow-2xl w-full max-w-md relative z-10 flex flex-col items-center">
        <div className="text-center mb-8 w-full">
          <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner"><span className="text-3xl">🛡️</span></div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Enterprise ERP</h1>
          <p className="text-xs text-gray-500 mt-1 font-semibold uppercase tracking-widest">Secure Access Gateway</p>
        </div>
        
        {error && <div className="bg-red-50 text-red-600 font-bold p-3 w-full rounded-lg text-xs mb-4 border border-red-200">{error}</div>}
        
        <form onSubmit={handleLogin} className="space-y-4 w-full">
          <div><label className="block text-xs font-bold text-gray-600 mb-1">Email Karyawan</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-slate-50 font-medium text-sm" placeholder="admin@erp.com" required /></div>
          <div><label className="block text-xs font-bold text-gray-600 mb-1">Password</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-slate-50 font-medium text-sm" placeholder="••••••••" required /></div>
          <button type="submit" className="w-full bg-indigo-600 text-white font-black py-3 rounded-lg hover:bg-indigo-700 transition shadow-lg transform hover:-translate-y-0.5 mt-2">Akses Sistem ➔</button>
        </form>

        {showInstallBtn && (
          <div className="mt-8 pt-6 border-t border-gray-100 w-full text-center">
            <p className="text-xs text-gray-500 mb-3 font-semibold">Tersedia untuk Smartphone Anda</p>
            <button onClick={handleInstallApp} className="w-full bg-slate-800 text-emerald-400 font-black py-3 rounded-lg hover:bg-slate-900 transition flex items-center justify-center space-x-2 border border-slate-700 shadow-lg">
              <span className="text-xl">📱</span><span>Install Aplikasi ke HP</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 3. FITUR DLC: ASISTEN AI (CHATBOT WIDGET)
// ==========================================
function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{ sender: 'ai', text: 'Halo! Saya AI Assistant ERP. Ada yang bisa saya bantu cek (**Karyawan**, **Stok Barang**, atau **Pendapatan**)?' }]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userText = inputText;
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setInputText('');
    setIsTyping(true);

    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    const lowerText = userText.toLowerCase();

    let aiReply = "Maaf Kapten, saya kurang paham. Coba ketik kata kunci seperti: **'jumlah karyawan'**, **'stok gudang'**, atau **'total pendapatan'**.";

    try {
      if (lowerText.includes('karyawan') || lowerText.includes('pegawai') || lowerText.includes('hrd') || lowerText.includes('orang')) {
        const res = await axios.get(`${baseUrl}/api/hr/employees`, { headers }).catch(()=>({data:{data:[]}}));
        const count = (res.data.data || []).length;
        aiReply = `👨‍💼 Saat ini perusahaan memiliki **${count} karyawan** aktif yang terdaftar di database HRD.`;
      } 
      else if (lowerText.includes('stok') || lowerText.includes('barang') || lowerText.includes('gudang') || lowerText.includes('inventory')) {
        const res = await axios.get(`${baseUrl}/api/items`, { headers }).catch(()=>({data:{data:[]}}));
        const items = res.data.data || [];
        const lowStock = items.filter(i => (i.Stock || i.stock || 0) < 10);
        aiReply = `📦 Terdapat **${items.length} jenis master barang** di gudang Anda. ${lowStock.length > 0 ? `⚠️ PERHATIAN: Ada **${lowStock.length} barang** yang stoknya menipis (<10)!` : 'Semua stok dalam status aman.'}`;
      }
      else if (lowerText.includes('uang') || lowerText.includes('pendapatan') || lowerText.includes('keuangan') || lowerText.includes('finance') || lowerText.includes('revenue')) {
        const res = await axios.get(`${baseUrl}/api/invoices`, { headers }).catch(()=>({data:{data:[]}}));
        const invoices = res.data.data || [];
        const revenue = invoices.reduce((sum, inv) => sum + (inv.TotalAmount || 0), 0);
        aiReply = `💰 Berdasarkan faktur penjualan, Total Pendapatan Kotor (Revenue) perusahaan saat ini adalah **Rp ${revenue.toLocaleString('id-ID')}**.`;
      }
    } catch (err) {
      aiReply = "❌ Maaf, saya sedang mengalami kendala jaringan saat menghubungi Server Golang.";
    }

    setTimeout(() => {
      setMessages(prev => [...prev, { sender: 'ai', text: aiReply }]);
      setIsTyping(false);
    }, 1200); 
  };

  const formatText = (text) => text.split('**').map((part, i) => i % 2 === 1 ? <strong key={i} className="text-indigo-700">{part}</strong> : part);

  return (
    <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[9999] print:hidden no-invert">
      {isOpen && (
        <div className="bg-white w-[90vw] md:w-80 max-w-sm rounded-2xl shadow-2xl border border-gray-200 mb-4 overflow-hidden flex flex-col h-[60vh] md:h-[400px] animate-fade-in-up">
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 p-4 text-white flex justify-between items-center shadow-md">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🤖</span>
              <div><h3 className="font-bold text-sm">AI Assistant</h3><p className="text-[10px] text-indigo-200 flex items-center"><span className="w-2 h-2 bg-green-400 rounded-full inline-block mr-1 animate-pulse"></span> Online</p></div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white hover:text-red-300 font-black text-xl px-2">✕</button>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto bg-slate-50 space-y-3">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-xl text-sm shadow-sm ${msg.sender === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white border border-gray-100 text-gray-800 rounded-bl-none'}`}>
                  {formatText(msg.text)}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 text-gray-400 p-3 rounded-xl rounded-bl-none shadow-sm text-xs flex space-x-1 items-center">
                  <span className="animate-bounce">●</span><span className="animate-bounce" style={{animationDelay: '100ms'}}>●</span><span className="animate-bounce" style={{animationDelay: '200ms'}}>●</span>
                </div>
              </div>
            )}
          </div>
          
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
            <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="Tanya AI..." className="flex-1 p-2.5 bg-slate-100 border-transparent rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            <button type="submit" disabled={isTyping} className="bg-indigo-600 text-white p-2.5 rounded-lg font-bold disabled:opacity-50">➤</button>
          </form>
        </div>
      )}
      
      {!isOpen && (
        <button onClick={() => setIsOpen(true)} className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white rounded-full p-4 shadow-2xl hover:scale-105 transition-all flex items-center justify-center relative">
          <span className="text-2xl md:text-3xl animate-bounce">💬</span>
          <span className="absolute -top-1 -right-1 md:-top-2 md:-right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-white">1</span>
        </button>
      )}
    </div>
  );
}

// ==========================================
// 4. MASTER LAYOUT (SIDEBAR DINAMIS & DARK MODE TANGGUH)
// ==========================================
function AdminLayout({ children }) {
  const navigate = useNavigate();
  const userRole = localStorage.getItem('role') || 'staff';
  const userName = localStorage.getItem('user_name') || 'User';
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // 🚀 STATE DARK MODE
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  // 🚀 EFEK PENYALAAN DARK MODE
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark-theme');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const isSuperAdmin = userRole === 'super_admin';
  const isWarehouse = isSuperAdmin || userRole === 'warehouse_staff';
  const isFinance = isSuperAdmin || userRole === 'finance_staff';
  const isHR = isSuperAdmin || userRole === 'hr_staff';

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden w-full">
      
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-sm transition-opacity no-invert" onClick={closeMobileMenu}></div>
      )}

      {/* SIDEBAR */}
      <div className={`fixed inset-y-0 left-0 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out z-40 w-64 bg-slate-900 text-white flex flex-col shadow-2xl`}>
        <div className="p-5 flex justify-between items-center border-b border-slate-800">
          <div className="text-center w-full">
            <h1 className="text-xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">ENTERPRISE</h1>
            <p className="text-[10px] text-slate-400 mt-1 font-bold tracking-widest uppercase">ERP System v2.0</p>
          </div>
          <button onClick={closeMobileMenu} className="md:hidden text-slate-400 hover:text-white font-bold text-xl ml-2">✕</button>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4 space-y-1">
          <Link onClick={closeMobileMenu} to="/dashboard" className="block px-6 py-3 hover:bg-slate-800 transition border-l-4 border-transparent hover:border-indigo-500 text-sm md:text-base">📊 Executive Dashboard</Link>
          
          {isWarehouse && (
            <div className="mt-4">
              <p className="px-6 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Supply Chain</p>
              <Link onClick={closeMobileMenu} to="/inventory" className="block px-6 py-2.5 hover:bg-slate-800 transition text-sm">📦 Inventory & Gudang</Link>
              <Link onClick={closeMobileMenu} to="/procurement" className="block px-6 py-2.5 hover:bg-slate-800 transition text-sm">🛒 Procurement (PO)</Link>
              <Link onClick={closeMobileMenu} to="/manufacturing" className="block px-6 py-2.5 hover:bg-slate-800 transition text-sm">🏭 Pabrik & Produksi</Link>
            </div>
          )}

          {isFinance && (
            <div className="mt-4">
              <p className="px-6 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Finance & CRM</p>
              <Link onClick={closeMobileMenu} to="/crm" className="block px-6 py-2.5 hover:bg-slate-800 transition text-sm">🤝 CRM & Sales</Link>
              <Link onClick={closeMobileMenu} to="/finance" className="block px-6 py-2.5 hover:bg-slate-800 transition text-sm">💰 Finance & Akuntansi</Link>
              <Link onClick={closeMobileMenu} to="/accounts" className="block px-6 py-2.5 hover:bg-slate-800 transition text-slate-400 pl-10 text-xs">↳ Buku Besar (COA)</Link>
            </div>
          )}

          {isHR && (
            <div className="mt-4">
              <p className="px-6 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Human Resources</p>
              <Link onClick={closeMobileMenu} to="/hrd" className="block px-6 py-2.5 hover:bg-slate-800 transition text-sm">👥 HR & Payroll</Link>
            </div>
          )}
        </nav>

        {/* 🚀 PROFIL PENGGUNA & TOMBOL DARK MODE DI SIDEBAR */}
        <div className="p-4 border-t border-slate-800 bg-slate-950">
          <div className="flex items-center space-x-3 mb-4">
            <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-sm shadow-lg no-invert">{userName.charAt(0).toUpperCase()}</div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">{userName}</p>
              <p className="text-[10px] text-emerald-400 font-bold uppercase truncate">{userRole.replace('_', ' ')}</p>
            </div>
          </div>
          
          {/* SAKELAR DARK MODE */}
          <button 
            onClick={toggleTheme} 
            className="w-full mb-2 text-xs bg-slate-800 text-slate-300 font-bold px-4 py-2.5 rounded hover:bg-slate-700 transition flex justify-center items-center gap-2 border border-slate-700"
          >
            <span className="text-base no-invert">{isDarkMode ? '☀️' : '🌙'}</span> 
            {isDarkMode ? 'Mode Terang' : 'Mode Gelap'}
          </button>

          <button onClick={handleLogout} className="w-full text-xs bg-red-500/10 text-red-400 font-bold px-4 py-2 rounded hover:bg-red-500 hover:text-white transition border border-red-900/50">🚪 Keluar (Logout)</button>
        </div>
      </div>

      {/* KONTEN UTAMA */}
      <div className="flex-1 flex flex-col w-full min-w-0 h-screen overflow-hidden relative bg-slate-50/50">
        
        {/* HEADER MOBILE */}
        <header className="md:hidden bg-slate-900 text-white h-14 flex items-center justify-between px-4 shadow-md z-20">
          <div className="font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400 text-sm">ERP MOBILE</div>
          <div className="flex items-center gap-3">
            {/* SAKELAR DARK MODE UNTUK HP */}
            <button onClick={toggleTheme} className="text-xl p-1 focus:outline-none no-invert">{isDarkMode ? '☀️' : '🌙'}</button>
            <button onClick={() => setIsMobileMenuOpen(true)} className="text-2xl p-1 focus:outline-none">☰</button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 z-10 w-full">
          {children}
        </main>

        <ChatbotWidget />
      </div>
    </div>
  );
}

// ==========================================
// 5. SISTEM PENGATUR RUTE (ROUTER & SATPAM)
// ==========================================
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Login />} />
        
        <Route path="/dashboard" element={ <RoleProtectedRoute allowedRoles={['warehouse_staff', 'finance_staff', 'hr_staff']}><AdminLayout><DashboardPage /></AdminLayout></RoleProtectedRoute> } />
        <Route path="/inventory" element={ <RoleProtectedRoute allowedRoles={['warehouse_staff']}><AdminLayout><InventoryPage /></AdminLayout></RoleProtectedRoute> } />
        <Route path="/procurement" element={ <RoleProtectedRoute allowedRoles={['warehouse_staff']}><AdminLayout><PurchaseOrderPage /></AdminLayout></RoleProtectedRoute> } />
        <Route path="/manufacturing" element={ <RoleProtectedRoute allowedRoles={['warehouse_staff']}><AdminLayout><ManufacturingPage /></AdminLayout></RoleProtectedRoute> } />
        <Route path="/hrd" element={ <RoleProtectedRoute allowedRoles={['hr_staff']}><AdminLayout><HrPage /></AdminLayout></RoleProtectedRoute> } />
        <Route path="/finance" element={ <RoleProtectedRoute allowedRoles={['finance_staff']}><AdminLayout><FinancePage /></AdminLayout></RoleProtectedRoute> } />
        <Route path="/accounts" element={ <RoleProtectedRoute allowedRoles={['finance_staff']}><AdminLayout><AccountPage /></AdminLayout></RoleProtectedRoute> } />
        <Route path="/crm" element={ <RoleProtectedRoute allowedRoles={['finance_staff']}><AdminLayout><CrmPage /></AdminLayout></RoleProtectedRoute> } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;