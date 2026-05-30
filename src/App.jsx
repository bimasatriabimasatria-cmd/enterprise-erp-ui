import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const [newItem, setNewItem] = useState({ SKU: '', Name: '', Stock: '', Price: '' });
  const [isAdding, setIsAdding] = useState(false);

  // ⚠️ URL Back4App Aktif Anda ⚠️
  const baseUrl = 'https://enterpriseerpapi-wcfc8hrl.b4a.run';

  // ========================================================
  // [BARU] FUNGSI AUTO-LOGIN SAAT HALAMAN DI-REFRESH
  // ========================================================
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      fetchItems(token); // Langsung ambil data jika token ada
    }
  }, []);

  // --- FUNGSI LOGIN ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await axios.post(`${baseUrl}/api/auth/login`, {
        email: email,
        password: password
      });

      const token = response.data.token;
      localStorage.setItem('token', token);
      setIsLoggedIn(true);
      fetchItems(token);
      
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal terhubung ke server');
    }
  };

  // --- FUNGSI AMBIL DATA BARANG (GET) ---
  const fetchItems = async (token) => {
    setLoading(true);
    try {
      const response = await axios.get(`${baseUrl}/api/items`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setItems(response.data.data || []);
    } catch (err) {
      console.error("Gagal mengambil data", err);
    }
    setLoading(false);
  };

  // --- FUNGSI TAMBAH BARANG (POST) ---
  const handleAddItem = async (e) => {
    e.preventDefault();
    setIsAdding(true);
    const token = localStorage.getItem('token');

    try {
      await axios.post(`${baseUrl}/api/items`, {
        SKU: newItem.SKU,
        Name: newItem.Name,
        Stock: parseInt(newItem.Stock),
        Price: parseFloat(newItem.Price)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Kosongkan form input
      setNewItem({ SKU: '', Name: '', Stock: '', Price: '' });
      
      // ========================================================
      // [PERBAIKAN] BERI JEDA 500ms AGAR DATABASE SELESAI SINKRON
      // ========================================================
      setTimeout(() => {
        fetchItems(token);
      }, 500);

    } catch (err) {
      alert("Gagal menambah barang: " + (err.response?.data?.error || "Error tidak diketahui"));
    }
    setIsAdding(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setItems([]);
  };

  // ==========================================
  // TAMPILAN DASHBOARD (JIKA SUDAH LOGIN)
  // ==========================================
  if (isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Dashboard ERP</h1>
              <p className="text-gray-500 mt-1">PT Enterprise Sejahtera</p>
            </div>
            <button onClick={handleLogout} className="bg-red-50 text-red-600 font-bold px-6 py-2 rounded-lg hover:bg-red-100 transition">
              Logout Keluar
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* PANEL KIRI: FORM TAMBAH BARANG */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:col-span-1 h-fit">
              <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center">
                ➕ Tambah Barang Baru
              </h2>
              <form onSubmit={handleAddItem} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">SKU (Kode)</label>
                  <input type="text" required value={newItem.SKU} onChange={(e) => setNewItem({...newItem, SKU: e.target.value})} className="w-full p-2 border rounded bg-gray-50 focus:bg-white text-sm" placeholder="Contoh: LPT-001" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Nama Barang</label>
                  <input type="text" required value={newItem.Name} onChange={(e) => setNewItem({...newItem, Name: e.target.value})} className="w-full p-2 border rounded bg-gray-50 focus:bg-white text-sm" placeholder="MacBook Pro M2" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Stok</label>
                    <input type="number" required min="0" value={newItem.Stock} onChange={(e) => setNewItem({...newItem, Stock: e.target.value})} className="w-full p-2 border rounded bg-gray-50 focus:bg-white text-sm" placeholder="10" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Harga (Rp)</label>
                    <input type="number" required min="0" value={newItem.Price} onChange={(e) => setNewItem({...newItem, Price: e.target.value})} className="w-full p-2 border rounded bg-gray-50 focus:bg-white text-sm" placeholder="25000000" />
                  </div>
                </div>
                <button type="submit" disabled={isAdding} className="w-full bg-green-600 text-white font-bold py-2 rounded hover:bg-green-700 transition mt-2 disabled:bg-gray-400">
                  {isAdding ? 'Menyimpan...' : 'Simpan Barang'}
                </button>
              </form>
            </div>

            {/* PANEL KANAN: TABEL BARANG */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:col-span-2">
              <h2 className="text-xl font-bold text-gray-700 mb-4 flex items-center">
                📦 Data Master Barang
              </h2>
              
              {loading ? (
                <div className="text-center text-gray-500 py-10 animate-pulse">Memuat data dari server...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                        <th className="p-3 border-b font-semibold rounded-tl-lg">SKU</th>
                        <th className="p-3 border-b font-semibold">Nama Barang</th>
                        <th className="p-3 border-b font-semibold">Stok</th>
                        <th className="p-3 border-b font-semibold rounded-tr-lg">Harga Jual</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="p-8 text-center text-gray-400 font-medium">Belum ada barang di gudang. Silakan tambah di panel sebelah kaki!</td>
                        </tr>
                      ) : (
                        items.map((item, index) => (
                          <tr key={index} className="hover:bg-blue-50 transition-colors border-b border-gray-50 text-sm">
                            <td className="p-3 font-semibold text-blue-600">{item.SKU}</td>
                            <td className="p-3 text-gray-700 font-medium">{item.Name}</td>
                            <td className="p-3">
                              <span className="bg-green-100 text-green-700 py-1 px-2 rounded-md font-bold">
                                {item.Stock}
                              </span>
                            </td>
                            <td className="p-3 text-gray-700 font-medium">
                              Rp {item.Price.toLocaleString('id-ID')}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // TAMPILAN LOGIN (JIKA BELUM LOGIN)
  // ==========================================
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-lg w-96 border border-gray-200">
        <div className="text-center mb-8">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🏢</span>
          </div>
          <h1 className="text-2xl font-bold text-blue-800">Enterprise ERP</h1>
          <p className="text-sm text-gray-500 mt-2">Silakan login ke akun Anda</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-200 text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Karyawan</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition" placeholder="admin@enterprise.com" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition" placeholder="••••••••" required />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition duration-200 shadow-md mt-2">
            Masuk Sistem
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;