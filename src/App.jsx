import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import axios from 'axios';
import HrPage from './pages/HrPage';
import FinancePage from './pages/FinancePage';
import AccountPage from './pages/AccountPage';
import InventoryPage from './pages/InventoryPage';
import CrmPage from './pages/CrmPage';
import PurchaseOrderPage from './pages/PurchaseOrderPage';

// ⚠️ URL HUGGING FACE ANDA ⚠️
const baseUrl = 'https://bimasatria-enterprise-erp-api.hf.space';

// ==========================================
// 1. KOMPONEN LOGIN
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
      localStorage.setItem('token', response.data.token);
      navigate('/'); // Arahkan ke Dashboard
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal login');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-lg w-96 border border-gray-200">
        <div className="text-center mb-8">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🏢</span>
          </div>
          <h1 className="text-2xl font-bold text-blue-800">Enterprise ERP</h1>
        </div>
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">{error}</div>}
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="admin@enterprise.com" required />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="••••••••" required />
          <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700">Masuk Sistem</button>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// 2. KOMPONEN MASTER LAYOUT (SIDEBAR & TOPBAR)
// ==========================================
function AdminLayout({ children }) {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* SIDEBAR */}
      <div className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 text-center border-b border-slate-800">
          <h1 className="text-xl font-bold tracking-wider">ENTERPRISE</h1>
          <p className="text-xs text-slate-400 mt-1">ERP System v2.0</p>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 space-y-1">
          <Link to="/" className="block px-6 py-3 hover:bg-slate-800 transition">📊 Dashboard</Link>
          <Link to="/inventory" className="block px-6 py-3 hover:bg-slate-800 transition">📦 Inventory & Gudang</Link>
          <Link to="/procurement" className="block px-6 py-3 hover:bg-slate-800 transition text-white">🛒 Procurement (PO)</Link>
          <Link to="/finance" className="block px-6 py-3 hover:bg-slate-800 transition text-white">💰 Finance & Akuntansi</Link>
          <Link to="/accounts" className="block px-6 py-3 hover:bg-slate-800 transition text-slate-300 pl-10 text-sm">↳ Buku Besar (COA)</Link>
          <Link to="/hrd" className="block px-6 py-3 hover:bg-slate-800 transition text-white">👥 HR & Payroll</Link>
          {/* Ubah baris CRM yang lama menjadi ini: */}
          <Link to="/crm" className="block px-6 py-3 hover:bg-slate-800 transition text-white">🤝 CRM & Sales</Link>
          <Link to="#" className="block px-6 py-3 hover:bg-slate-800 transition text-slate-500">⚙️ Manufacturing (Coming Soon)</Link>
        </nav>
      </div>

      {/* KONTEN UTAMA */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* TOPBAR */}
        <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center justify-between px-8">
          <h2 className="text-lg font-semibold text-gray-700">Modul Sistem</h2>
          <button onClick={handleLogout} className="text-sm bg-red-50 text-red-600 font-bold px-4 py-2 rounded-lg hover:bg-red-100">Logout</button>
        </header>
        
        {/* AREA DINAMIS (BERUBAH SESUAI MENU) */}
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

// ==========================================
// 3. HALAMAN DASHBOARD (BERANDA)
// ==========================================
function Dashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Ringkasan Perusahaan</h1>
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm font-semibold">Total Aset Gudang</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">Aktif</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm font-semibold">Status Server</p>
          <p className="text-3xl font-bold text-green-600 mt-2">Online 🟢</p>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 5. SISTEM PENGATUR RUTE (ROUTER)
// ==========================================
// Komponen pelindung agar harus login
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Rute yang dilindungi AdminLayout */}
        <Route path="/" element={ <ProtectedRoute><AdminLayout><Dashboard /></AdminLayout></ProtectedRoute> } />
        <Route path="/inventory" element={ <ProtectedRoute><AdminLayout><InventoryPage /></AdminLayout></ProtectedRoute> } />
        <Route path="/procurement" element={ <ProtectedRoute><AdminLayout><PurchaseOrderPage /></AdminLayout></ProtectedRoute> } />
        <Route path="/hrd" element={ <ProtectedRoute><AdminLayout><HrPage /></AdminLayout></ProtectedRoute> } />
        <Route path="/finance" element={ <ProtectedRoute><AdminLayout><FinancePage /></AdminLayout></ProtectedRoute> } />
        <Route path="/accounts" element={ <ProtectedRoute><AdminLayout><AccountPage /></AdminLayout></ProtectedRoute> } />
        {/* Tambahkan rute ini di dalam kelompok rute ProtectedRoute lainnya */}
        <Route path="/crm" element={ <ProtectedRoute><AdminLayout><CrmPage /></AdminLayout></ProtectedRoute> } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;