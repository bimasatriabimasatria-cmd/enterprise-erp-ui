import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function AccountPage() {
  const [accounts, setAccounts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    account_code: '',
    account_name: '',
    account_type: 'asset'
  });

  // URL Backend Hugging Face Anda
  const baseUrl = 'https://bimasatria-enterprise-erp-api.hf.space';

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`${baseUrl}/api/accounts`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setAccounts(response.data.data || []);
    } catch (err) {
      console.error("Gagal mengambil data akun", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    try {
      await axios.post(`${baseUrl}/api/accounts`, formData, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      alert("✅ Akun Buku Besar berhasil ditambahkan!");
      setShowForm(false);
      setFormData({ account_code: '', account_name: '', account_type: 'asset' });
      fetchAccounts();
    } catch (err) {
      alert("❌ Gagal menyimpan akun: " + (err.response?.data?.error || err.message));
    }
  };

  const getBadgeColor = (type) => {
    const colors = {
      asset: 'bg-blue-100 text-blue-700',
      liability: 'bg-red-100 text-red-700',
      equity: 'bg-purple-100 text-purple-700',
      revenue: 'bg-green-100 text-green-700',
      expense: 'bg-orange-100 text-orange-700'
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">📖 Chart of Accounts (Buku Besar)</h1>
        <button 
          onClick={() => setShowForm(!showForm)}
          className={`${showForm ? 'bg-red-500' : 'bg-indigo-600'} text-white px-4 py-2 rounded-lg font-bold shadow-sm hover:opacity-90 transition`}
        >
          {showForm ? 'Batal' : '+ Tambah Akun Baru'}
        </button>
      </div>

      {/* Tampilan Peringatan Khusus untuk Anda */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded text-sm text-yellow-800">
        <strong>Pemberitahuan Sistem ERP:</strong> Untuk dapat melakukan transaksi Faktur (Invoice), pastikan Anda telah membuat Akun <strong>1120 (Piutang Usaha / asset)</strong> dan Akun <strong>4100 (Pendapatan Penjualan / revenue)</strong>.
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Kode Akun (Cth: 1120)</label>
              <input type="text" required value={formData.account_code} onChange={(e) => setFormData({...formData, account_code: e.target.value})} className="w-full p-2 border rounded bg-gray-50" placeholder="1120" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Nama Akun</label>
              <input type="text" required value={formData.account_name} onChange={(e) => setFormData({...formData, account_name: e.target.value})} className="w-full p-2 border rounded bg-gray-50" placeholder="Piutang Usaha" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Tipe Akun (Standar Akuntansi)</label>
              <select required value={formData.account_type} onChange={(e) => setFormData({...formData, account_type: e.target.value})} className="w-full p-2 border rounded bg-gray-50">
                <option value="asset">Asset (Harta/Piutang)</option>
                <option value="liability">Liability (Kewajiban/Hutang)</option>
                <option value="equity">Equity (Modal)</option>
                <option value="revenue">Revenue (Pendapatan)</option>
                <option value="expense">Expense (Beban/Biaya)</option>
              </select>
            </div>
            <div className="col-span-3">
              <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-2 rounded-lg hover:bg-indigo-700 transition">Simpan Akun ke Buku Besar</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
            <tr>
              <th className="p-4 font-semibold border-b">Kode Akun</th>
              <th className="p-4 font-semibold border-b">Nama Akun</th>
              <th className="p-4 font-semibold border-b">Tipe Klasifikasi</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-gray-100">
            {accounts.length === 0 ? (
              <tr><td colSpan="3" className="p-8 text-center text-gray-400 font-medium">Buku besar masih kosong.</td></tr>
            ) : (
              accounts.map((acc) => (
                <tr key={acc.ID} className="hover:bg-gray-50 transition">
                  <td className="p-4 font-bold text-gray-800">{acc.AccountCode}</td>
                  <td className="p-4 font-medium text-gray-900">{acc.AccountName}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getBadgeColor(acc.AccountType)}`}>
                      {acc.AccountType}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}