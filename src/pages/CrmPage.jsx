import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { downloadCSV } from '../utils/exportCSV'; // 🚀 IMPORT MESIN EXPORT

export default function CrmPage() {
  const [leads, setLeads] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: ''
  });

  const baseUrl = 'https://bimasatria-enterprise-erp-api.hf.space';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    try {
      const [resLeads, resCustomers] = await Promise.all([
        axios.get(`${baseUrl}/api/crm/leads`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${baseUrl}/api/crm/customers`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setLeads(resLeads.data.data || []);
      setCustomers(resCustomers.data.data || []);
    } catch (err) { console.error("Gagal mengambil data CRM", err); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      await axios.post(`${baseUrl}/api/crm/leads`, formData, { headers: { Authorization: `Bearer ${token}` } });
      alert("✅ Prospek (Lead) berhasil ditambahkan!");
      setShowForm(false);
      setFormData({ name: '', company: '', email: '', phone: '' });
      fetchData(); 
    } catch (err) { alert("❌ Gagal menyimpan prospek: " + (err.response?.data?.error || err.message)); } 
    finally { setLoading(false); }
  };

  const handleConvert = async (leadId, companyName) => {
    if (!window.confirm(`Apakah Anda yakin klien "${companyName}" sudah DEAL / Tanda Tangan Kontrak?`)) return;
    const token = localStorage.getItem('token');
    try {
      await axios.post(`${baseUrl}/api/crm/leads/${leadId}/convert`, {}, { headers: { Authorization: `Bearer ${token}` }});
      alert(`🎉 SELAMAT! "${companyName}" resmi menjadi Pelanggan Anda!`);
      fetchData(); 
    } catch (err) { alert("❌ Gagal mengonversi klien: " + (err.response?.data?.error || err.message)); }
  };

  // 🚀 FUNGSI EXPORT DATA CRM
  const handleExportLeads = () => {
    const data = leads.map((l, i) => ({
      "No": i + 1, "Perusahaan": l.Company || l.company || "-", "Kontak (PIC)": l.Name || l.name || "-",
      "Email": l.Email || l.email || "-", "Telepon": l.Phone || l.phone || "-",
      "Status": l.Status === 'converted' ? 'DEAL / WON' : 'PROSPECTING'
    }));
    downloadCSV(data, `Data_Leads_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleExportCustomers = () => {
    const data = customers.map((c, i) => ({
      "No": i + 1, "Pelanggan": c.Name || c.name || "-", "Kontak": c.Contact || c.contact || "-",
      "Email": c.Email || c.email || "-", "Telepon": c.Phone || c.phone || "-"
    }));
    downloadCSV(data, `Data_Customers_${new Date().toISOString().split('T')[0]}.csv`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-800">🤝 CRM & Sales Management</h1>
        <button onClick={() => setShowForm(!showForm)} className={`${showForm ? 'bg-red-500' : 'bg-indigo-600 hover:bg-indigo-700'} text-white px-4 py-2 rounded-lg font-bold shadow-sm transition text-sm md:text-base`}>
          {showForm ? 'Batal / Tutup' : '+ Tambah Prospek (Lead)'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-orange-500">
          <p className="text-gray-500 text-sm font-semibold">Total Prospek Berjalan (Leads)</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{leads.filter(l => l.Status !== 'converted').length} Perusahaan</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-green-500">
          <p className="text-gray-500 text-sm font-semibold">Total Pelanggan Resmi (Customers)</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{customers.length} Klien</p>
        </div>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6 border-t-4 border-t-indigo-500 animate-fade-in-up">
          <h2 className="text-lg font-bold text-gray-700 mb-4">Formulir Prospek Baru</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-xs font-semibold text-gray-600 mb-1">Nama Perusahaan / Institusi</label><input type="text" required value={formData.company} onChange={(e) => setFormData({...formData, company: e.target.value})} className="w-full p-2 border rounded bg-gray-50" placeholder="PT ABC Maju..." /></div>
            <div><label className="block text-xs font-semibold text-gray-600 mb-1">Nama Kontak (PIC)</label><input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full p-2 border rounded bg-gray-50" placeholder="Bpk. Budi Santoso" /></div>
            <div><label className="block text-xs font-semibold text-gray-600 mb-1">Email</label><input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full p-2 border rounded bg-gray-50" placeholder="budi@abc.com" /></div>
            <div><label className="block text-xs font-semibold text-gray-600 mb-1">No. Handphone / WhatsApp</label><input type="text" required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full p-2 border rounded bg-gray-50" placeholder="08123456789" /></div>
            <div className="col-span-1 md:col-span-2 mt-2">
              <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition">
                {loading ? 'Menyimpan...' : 'Simpan Prospek Sales'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TABEL 1: PROSPEK (LEADS) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="bg-orange-50 p-4 border-b border-orange-100 flex flex-col md:flex-row justify-between md:items-center gap-3">
          <div><h2 className="font-bold text-orange-800">🎯 Daftar Prospek (Leads)</h2><p className="text-xs text-orange-600">Tekan tombol "Jadikan Pelanggan" jika klien ini sudah deal.</p></div>
          <button onClick={handleExportLeads} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm transition whitespace-nowrap">📊 Export Leads</button>
        </div>
        {/* 🔥 BUNGKUSAN PELINDUNG TABEL 🔥 */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
              <tr><th className="p-4 font-semibold border-b">Perusahaan</th><th className="p-4 font-semibold border-b">Kontak (PIC)</th><th className="p-4 font-semibold border-b">Email / Phone</th><th className="p-4 font-semibold border-b text-center">Status</th><th className="p-4 font-semibold border-b text-right">Aksi Sales</th></tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100">
              {leads.length === 0 ? <tr><td colSpan="5" className="p-6 text-center text-gray-400">Belum ada data prospek.</td></tr> : leads.map((lead) => (
                <tr key={lead.ID || lead.id} className="hover:bg-gray-50">
                  <td className="p-4 font-bold text-gray-800">{lead.Company || lead.company}</td>
                  <td className="p-4 text-gray-700">{lead.Name || lead.name}</td>
                  <td className="p-4"><p className="text-blue-600">{lead.Email || lead.email}</p><p className="text-xs text-gray-500">{lead.Phone || lead.phone}</p></td>
                  <td className="p-4 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${lead.Status === 'converted' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                      {lead.Status === 'converted' ? 'DEAL / WON' : 'PROSPECTING'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {lead.Status !== 'converted' ? (
                      <button onClick={() => handleConvert(lead.ID || lead.id, lead.Company || lead.company)} className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs font-bold shadow-sm transition whitespace-nowrap">✅ Jadikan Pelanggan</button>
                    ) : <span className="text-gray-400 text-xs italic">Selesai</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* TABEL 2: PELANGGAN RESMI (CUSTOMERS) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-green-50 p-4 border-b border-green-100 flex flex-col md:flex-row justify-between md:items-center gap-3">
          <h2 className="font-bold text-green-800">🏆 Daftar Pelanggan Resmi (Customers)</h2>
          <button onClick={handleExportCustomers} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm transition whitespace-nowrap">📊 Export Customers</button>
        </div>
        {/* 🔥 BUNGKUSAN PELINDUNG TABEL 🔥 */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
              <tr><th className="p-4 font-semibold border-b">Nama Pelanggan</th><th className="p-4 font-semibold border-b">Kontak Personal</th><th className="p-4 font-semibold border-b">Email</th><th className="p-4 font-semibold border-b">No. Telepon</th></tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100">
              {customers.length === 0 ? <tr><td colSpan="4" className="p-6 text-center text-gray-400">Belum ada pelanggan resmi.</td></tr> : customers.map((cust) => (
                <tr key={cust.ID || cust.id} className="hover:bg-gray-50">
                  <td className="p-4 font-bold text-green-700">{cust.Name || cust.name}</td>
                  <td className="p-4 text-gray-800">{cust.Contact || cust.contact}</td>
                  <td className="p-4 text-gray-600">{cust.Email || cust.email}</td>
                  <td className="p-4 text-gray-600">{cust.Phone || cust.phone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}