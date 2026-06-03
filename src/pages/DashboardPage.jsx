import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    revenue: 0,
    expense: 0,
    customers: 0,
    employees: 0
  });
  const [lowStock, setLowStock] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  const baseUrl = 'https://bimasatria-enterprise-erp-api.hf.space';

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    try {
      // Mengambil data dari seluruh departemen secara serentak!
      // Kita gunakan .catch agar jika 1 departemen kosong/error, dashboard tidak ikut hancur.
      const [resInvoices, resPos, resCustomers, resEmployees, resItems, resAudit] = await Promise.all([
        axios.get(`${baseUrl}/api/invoices`, { headers }).catch(() => ({ data: { data: [] } })),
        axios.get(`${baseUrl}/api/pos`, { headers }).catch(() => ({ data: { data: [] } })),
        axios.get(`${baseUrl}/api/crm/customers`, { headers }).catch(() => ({ data: { data: [] } })),
        axios.get(`${baseUrl}/api/hr/employees`, { headers }).catch(() => ({ data: { data: [] } })),
        axios.get(`${baseUrl}/api/items`, { headers }).catch(() => ({ data: { data: [] } })),
        axios.get(`${baseUrl}/api/audit`, { headers }).catch(() => ({ data: { data: [] } }))
      ]);

      // 1. Kalkulasi Uang
      const invoices = resInvoices.data.data || [];
      const pos = resPos.data.data || [];
      const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.TotalAmount || 0), 0);
      const totalExpense = pos.reduce((sum, po) => sum + (po.TotalAmount || 0), 0);

      // 2. Kalkulasi Orang
      const totalCustomers = (resCustomers.data.data || []).length;
      const totalEmployees = (resEmployees.data.data || []).length;

      setStats({
        revenue: totalRevenue,
        expense: totalExpense,
        customers: totalCustomers,
        employees: totalEmployees
      });

      // 3. Deteksi Stok Menipis (Stok < 10)
      const allItems = resItems.data.data || [];
      setLowStock(allItems.filter(item => (item.Stock || item.stock) < 10));

      // 4. Ambil 10 Aktivitas Terakhir (CCTV)
      const logs = resAudit.data.data || [];
      setAuditLogs(logs.slice(0, 10)); // Ambil 10 teratas saja

    } catch (error) {
      console.error("Gagal memuat data dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex h-64 items-center justify-center font-bold text-gray-500 animate-pulse">Menyiapkan Ruang Kendali Executive...</div>;
  }

  const profit = stats.revenue - stats.expense;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">📊 Executive Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Ringkasan operasional perusahaan secara real-time.</p>
        </div>
        <button onClick={fetchDashboardData} className="bg-white border hover:bg-gray-50 text-gray-600 px-4 py-2 rounded-lg font-bold shadow-sm transition text-sm">
          🔄 Refresh Data
        </button>
      </div>

      {/* --- KARTU STATISTIK UTAMA --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-emerald-100 border-t-4 border-t-emerald-500">
          <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Pendapatan (Revenue)</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">Rp {stats.revenue.toLocaleString('id-ID')}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-red-100 border-t-4 border-t-red-500">
          <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Pengeluaran (Expense)</p>
          <p className="text-2xl font-black text-red-600 mt-1">Rp {stats.expense.toLocaleString('id-ID')}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-blue-100 border-t-4 border-t-blue-500">
          <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Laba Kasar (Profit)</p>
          <p className={`text-2xl font-black mt-1 ${profit >= 0 ? 'text-blue-600' : 'text-red-500'}`}>
            Rp {profit.toLocaleString('id-ID')}
          </p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-indigo-100 border-t-4 border-t-indigo-500">
          <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Metrik Relasi</p>
          <div className="flex justify-between mt-2">
            <span className="font-bold text-gray-700">🤝 {stats.customers} Klien</span>
            <span className="font-bold text-gray-700">👥 {stats.employees} Pegawai</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* --- PANEL CCTV (AUDIT LOGS) --- */}
        <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-96">
          <div className="bg-slate-800 p-4 border-b">
            <h2 className="font-bold text-white flex items-center"><span className="animate-pulse text-red-500 mr-2">🔴</span> Live CCTV & Aktivitas Sistem</h2>
          </div>
          <div className="p-0 overflow-y-auto flex-1 bg-slate-50">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-200 text-gray-600 text-xs uppercase sticky top-0">
                <tr><th className="p-3">Waktu</th><th className="p-3">User</th><th className="p-3">Aksi</th><th className="p-3">Modul (Resource)</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {auditLogs.length === 0 ? (
                  <tr><td colSpan="4" className="p-6 text-center text-gray-400">Belum ada aktivitas terekam.</td></tr>
                ) : (
                  auditLogs.map(log => (
                    <tr key={log.ID || log.id} className="hover:bg-gray-100">
                      <td className="p-3 text-xs text-gray-500 whitespace-nowrap">{new Date(log.CreatedAt || log.created_at).toLocaleString('id-ID', {hour: '2-digit', minute:'2-digit', second:'2-digit'})}</td>
                      <td className="p-3 font-semibold text-gray-800 truncate max-w-[100px]">{log.User?.Name || 'System/Admin'}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold text-white ${log.Action === 'POST' ? 'bg-green-500' : log.Action === 'PUT' ? 'bg-amber-500' : log.Action === 'DELETE' ? 'bg-red-500' : 'bg-blue-500'}`}>
                          {log.Action}
                        </span>
                      </td>
                      <td className="p-3 text-gray-600 font-mono text-xs">{log.Resource}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* --- PANEL PERINGATAN STOK --- */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-96">
          <div className="bg-amber-50 p-4 border-b border-amber-100">
            <h2 className="font-bold text-amber-800 flex items-center">⚠️ Peringatan Stok Menipis</h2>
          </div>
          <div className="p-4 overflow-y-auto flex-1">
            {lowStock.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <span className="text-4xl mb-2">✅</span>
                <p className="text-sm font-semibold">Semua stok gudang aman.</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {lowStock.map(item => (
                  <li key={item.ID} className="flex justify-between items-center p-3 border border-red-100 bg-red-50 rounded-lg">
                    <div>
                      <p className="font-bold text-gray-800 text-sm">{item.Name || item.name}</p>
                      <p className="text-xs text-gray-500 font-mono">{item.ItemCode || item.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-red-600 animate-pulse">{item.Stock || item.stock}</p>
                      <p className="text-[10px] text-red-500 font-bold uppercase">{item.Unit || 'Unit'}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="p-3 bg-gray-50 border-t text-center">
             <Link to="/inventory" className="text-sm font-bold text-indigo-600 hover:text-indigo-800">Ke Manajemen Gudang ➔</Link>
          </div>
        </div>

      </div>
    </div>
  );
}