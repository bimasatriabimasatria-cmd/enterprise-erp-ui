import React, { useState } from 'react';
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

// ==========================================
// ALAT PEMBONGKAR TOKEN (Membaca Jabatan)
// ==========================================
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

  // 1. Jika tidak ada tiket masuk
  if (!token) return <Navigate to="/login" replace />;

  // 2. Super Admin Bebas Masuk ke Mana Saja!
  if (userRole === 'super_admin') return children;

  // 3. Jika jabatannya tidak ada di daftar yang diizinkan (Cek ID Card)
  if (!allowedRoles.includes(userRole)) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-100 text-slate-800">
        <span className="text-6xl mb-4">⛔</span>
        <h1 className="text-3xl font-black mb-2 text-red-600">Akses Ditolak (403)</h1>
        <p className="mb-6 font-medium text-gray-500">Jabatan Anda (<span className="text-indigo-600 uppercase">{userRole}</span>) tidak memiliki wewenang membuka brankas ini.</p>
        <button onClick={() => window.location.href = '/dashboard'} className="bg-slate-800 text-white px-6 py-2 rounded-lg font-bold hover:bg-slate-900">
          Kembali ke Wilayah Aman
        </button>
      </div>
    );
  }

  // 4. Jika diizinkan, silakan lewat!
  return children;
}

// ==========================================
// 2. KOMPONEN LOGIN
// ==========================================
function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${baseUrl}/api/auth/login`, { email, password });
      const token = response.data.token;
      
      // Simpan Tiket dan Bongkar Jabatannya!
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
    <div className="min-h-screen bg-slate-900 flex items-center justify-center relative overflow-hidden">
      {/* Dekorasi Latar Belakang */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-emerald-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

      <div className="bg-white p-10 rounded-2xl shadow-2xl w-96 relative z-10">
        <div className="text-center mb-8">
          <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
            <span className="text-3xl">🛡️</span>
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Enterprise ERP</h1>
          <p className="text-xs text-gray-500 mt-1 font-semibold uppercase tracking-widest">Secure Access Gateway</p>
        </div>
        {error && <div className="bg-red-50 text-red-600 font-bold p-3 rounded-lg text-xs mb-4 border border-red-200">{error}</div>}
        <form onSubmit={handleLogin} className="space-y-4">
          <div><label className="block text-xs font-bold text-gray-600 mb-1">Email Karyawan</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-slate-50 font-medium" placeholder="admin@erp.com" required /></div>
          <div><label className="block text-xs font-bold text-gray-600 mb-1">Password</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-slate-50 font-medium" placeholder="••••••••" required /></div>
          <button type="submit" className="w-full bg-indigo-600 text-white font-black py-3 rounded-lg hover:bg-indigo-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 mt-2">
            Akses Sistem ➔
          </button>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// 3. MASTER LAYOUT (SIDEBAR DINAMIS SESUAI JABATAN)
// ==========================================
function AdminLayout({ children }) {
  const navigate = useNavigate();
  const userRole = localStorage.getItem('role') || 'staff';
  const userName = localStorage.getItem('user_name') || 'User';

  const handleLogout = () => {
    localStorage.clear(); // Bersihkan semua memori
    navigate('/login');
  };

  // Logika Penyembunyian Menu
  const isSuperAdmin = userRole === 'super_admin';
  const isWarehouse = isSuperAdmin || userRole === 'warehouse_staff';
  const isFinance = isSuperAdmin || userRole === 'finance_staff';
  const isHR = isSuperAdmin || userRole === 'hr_staff';

  return (
    <div className="flex h-screen bg-gray-50">
      {/* SIDEBAR */}
      <div className="w-64 bg-slate-900 text-white flex flex-col shadow-2xl relative z-20">
        <div className="p-6 text-center border-b border-slate-800">
          <h1 className="text-xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">ENTERPRISE</h1>
          <p className="text-[10px] text-slate-400 mt-1 font-bold tracking-widest uppercase">ERP System v2.0</p>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4 space-y-1">
          <Link to="/dashboard" className="block px-6 py-3 hover:bg-slate-800 transition border-l-4 border-transparent hover:border-indigo-500">📊 Executive Dashboard</Link>
          
          {/* MENU GUDANG & PABRIK (Hanya Gudang & Super Admin) */}
          {isWarehouse && (
            <div className="mt-4">
              <p className="px-6 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Supply Chain</p>
              <Link to="/inventory" className="block px-6 py-2.5 hover:bg-slate-800 transition text-sm">📦 Inventory & Gudang</Link>
              <Link to="/procurement" className="block px-6 py-2.5 hover:bg-slate-800 transition text-sm">🛒 Procurement (PO)</Link>
              <Link to="/manufacturing" className="block px-6 py-2.5 hover:bg-slate-800 transition text-sm">🏭 Pabrik & Produksi</Link>
            </div>
          )}

          {/* MENU KEUANGAN & SALES (Hanya Finance & Super Admin) */}
          {isFinance && (
            <div className="mt-4">
              <p className="px-6 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Finance & CRM</p>
              <Link to="/crm" className="block px-6 py-2.5 hover:bg-slate-800 transition text-sm">🤝 CRM & Sales</Link>
              <Link to="/finance" className="block px-6 py-2.5 hover:bg-slate-800 transition text-sm">💰 Finance & Akuntansi</Link>
              <Link to="/accounts" className="block px-6 py-2.5 hover:bg-slate-800 transition text-slate-400 pl-10 text-xs">↳ Buku Besar (COA)</Link>
            </div>
          )}

          {/* MENU HRD (Hanya HR & Super Admin) */}
          {isHR && (
            <div className="mt-4">
              <p className="px-6 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Human Resources</p>
              <Link to="/hrd" className="block px-6 py-2.5 hover:bg-slate-800 transition text-sm">👥 HR & Payroll</Link>
            </div>
          )}
        </nav>

        {/* PROFIL PENGGUNA DI BAWAH SIDEBAR */}
        <div className="p-4 border-t border-slate-800 bg-slate-950">
          <div className="flex items-center space-x-3 mb-3">
            <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-sm shadow-lg">{userName.charAt(0).toUpperCase()}</div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">{userName}</p>
              <p className="text-[10px] text-emerald-400 font-bold uppercase truncate">{userRole.replace('_', ' ')}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full text-xs bg-red-500/10 text-red-400 font-bold px-4 py-2 rounded hover:bg-red-500 hover:text-white transition">🚪 Keluar (Logout)</button>
        </div>
      </div>

      {/* KONTEN UTAMA */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <main className="flex-1 overflow-y-auto p-8 z-10 bg-slate-50/50">
          {children}
        </main>
      </div>
    </div>
  );
}

// ==========================================
// 4. SISTEM PENGATUR RUTE (ROUTER & SATPAM)
// ==========================================
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Login />} />
        
        {/* SEMUA JABATAN BOLEH MASUK DASHBOARD */}
        <Route path="/dashboard" element={ <RoleProtectedRoute allowedRoles={['warehouse_staff', 'finance_staff', 'hr_staff']}><AdminLayout><DashboardPage /></AdminLayout></RoleProtectedRoute> } />
        
        {/* ZONA GUDANG (Hanya warehouse_staff) */}
        <Route path="/inventory" element={ <RoleProtectedRoute allowedRoles={['warehouse_staff']}><AdminLayout><InventoryPage /></AdminLayout></RoleProtectedRoute> } />
        <Route path="/procurement" element={ <RoleProtectedRoute allowedRoles={['warehouse_staff']}><AdminLayout><PurchaseOrderPage /></AdminLayout></RoleProtectedRoute> } />
        <Route path="/manufacturing" element={ <RoleProtectedRoute allowedRoles={['warehouse_staff']}><AdminLayout><ManufacturingPage /></AdminLayout></RoleProtectedRoute> } />
        
        {/* ZONA HRD (Hanya hr_staff) */}
        <Route path="/hrd" element={ <RoleProtectedRoute allowedRoles={['hr_staff']}><AdminLayout><HrPage /></AdminLayout></RoleProtectedRoute> } />
        
        {/* ZONA KEUANGAN & SALES (Hanya finance_staff) */}
        <Route path="/finance" element={ <RoleProtectedRoute allowedRoles={['finance_staff']}><AdminLayout><FinancePage /></AdminLayout></RoleProtectedRoute> } />
        <Route path="/accounts" element={ <RoleProtectedRoute allowedRoles={['finance_staff']}><AdminLayout><AccountPage /></AdminLayout></RoleProtectedRoute> } />
        <Route path="/crm" element={ <RoleProtectedRoute allowedRoles={['finance_staff']}><AdminLayout><CrmPage /></AdminLayout></RoleProtectedRoute> } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;