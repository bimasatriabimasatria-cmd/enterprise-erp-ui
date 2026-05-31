import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import axios from 'axios';

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
          <Link to="#" className="block px-6 py-3 hover:bg-slate-800 transition text-slate-500">💰 Finance (Coming Soon)</Link>
          <Link to="#" className="block px-6 py-3 hover:bg-slate-800 transition text-slate-500">👥 HR & Payroll (Coming Soon)</Link>
          <Link to="#" className="block px-6 py-3 hover:bg-slate-800 transition text-slate-500">🤝 CRM & Sales (Coming Soon)</Link>
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
// 4. HALAMAN INVENTORY & TRANSAKSI
// ==========================================
function InventoryPage() {
  const [items, setItems] = useState([]);
  const [trxData, setTrxData] = useState({ sku: '', type: 'IN', qty: '' });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`${baseUrl}/api/items`, { headers: { Authorization: `Bearer ${token}` } });
      setItems(response.data.data || []);
    } catch (err) { console.error(err); }
  };

  const handleTransaction = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      await axios.post(`${baseUrl}/api/transactions`, {
        sku: trxData.sku,
        type: trxData.type,
        qty: parseInt(trxData.qty)
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      setTrxData({ sku: '', type: 'IN', qty: '' }); // Kosongkan form
      alert("Transaksi berhasil diproses!");
      setTimeout(() => fetchItems(), 500); // Refresh tabel
    } catch (err) {
      alert("Gagal: " + (err.response?.data?.error || "Error tidak diketahui"));
    }
  };

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* FORM TRANSAKSI (BARANG MASUK/KELUAR) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 col-span-1 h-fit">
        <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center">🔄 Input Transaksi Gudang</h2>
        <form onSubmit={handleTransaction} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">SKU Barang</label>
            <input type="text" required value={trxData.sku} onChange={(e) => setTrxData({...trxData, sku: e.target.value})} className="w-full p-2 border rounded bg-gray-50" placeholder="Ketik SKU..." />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Jenis Pergerakan</label>
            <select value={trxData.type} onChange={(e) => setTrxData({...trxData, type: e.target.value})} className="w-full p-2 border rounded bg-gray-50 font-bold">
              <option value="IN">Masuk (+)</option>
              <option value="OUT">Keluar (-)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Jumlah (Qty)</label>
            <input type="number" required min="1" value={trxData.qty} onChange={(e) => setTrxData({...trxData, qty: e.target.value})} className="w-full p-2 border rounded bg-gray-50" placeholder="10" />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700">Proses Transaksi</button>
        </form>
      </div>

      {/* TABEL STOK REAL-TIME */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 col-span-2">
        <h2 className="text-xl font-bold text-gray-700 mb-4">📦 Posisi Stok Gudang (Master)</h2>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-sm uppercase">
              <th className="p-3 border-b">SKU</th>
              <th className="p-3 border-b">Nama Barang</th>
              <th className="p-3 border-b">Stok Aktif</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index} className="border-b border-gray-50">
                <td className="p-3 font-semibold text-blue-600">{item.SKU}</td>
                <td className="p-3 text-gray-700">{item.Name}</td>
                <td className="p-3 font-bold text-lg">{item.Stock}</td>
              </tr>
            ))}
          </tbody>
        </table>
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;