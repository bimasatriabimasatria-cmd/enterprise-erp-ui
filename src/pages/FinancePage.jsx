import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function FinancePage() {
  const [invoices, setInvoices] = useState([]);
  const [items, setItems] = useState([]); // Untuk mengambil data dari Gudang
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    invoice_number: `INV-${new Date().getTime().toString().slice(-6)}`, // Nomor otomatis
    customer_name: '',
    date: new Date().toISOString().split('T')[0],
    item_id: '',
    quantity: 1
  });

  // URL Awan Hugging Face Anda
  const baseUrl = 'https://bimasatria-enterprise-erp-api.hf.space'; 
  // (Jika sedang menjalankan backend di laptop, ubah ke: http://localhost:7860)

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    try {
      // 1. Ambil Riwayat Faktur
      const resInvoices = await axios.get(`${baseUrl}/api/invoices`, { headers: { Authorization: `Bearer ${token}` } });
      setInvoices(resInvoices.data.data || []);

      // 2. Ambil Barang dari Gudang untuk di menu Dropdown (Integrasi Lintas Modul)
      const resItems = await axios.get(`${baseUrl}/api/items`, { headers: { Authorization: `Bearer ${token}` } });
      setItems(resItems.data.data || []);
    } catch (err) {
      console.error("Gagal mengambil data", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    setLoading(true);

    if (!formData.item_id) {
      alert("⚠️ Harap pilih barang dari gudang terlebih dahulu!");
      setLoading(false);
      return;
    }

    const payload = {
      invoice_number: formData.invoice_number,
      customer_name: formData.customer_name,
      date: formData.date,
      lines: [
        {
          item_id: formData.item_id,
          quantity: parseInt(formData.quantity)
        }
      ]
    };

    try {
      await axios.post(`${baseUrl}/api/invoices`, payload, { headers: { Authorization: `Bearer ${token}` } });
      alert("✅ FAKTUR BERHASIL DIBUAT!\nStok gudang telah dipotong & Jurnal Akuntansi otomatis tercatat!");
      setShowForm(false);
      setFormData({ ...formData, invoice_number: `INV-${new Date().getTime().toString().slice(-6)}` });
      fetchData(); // Refresh data otomatis
    } catch (err) {
      // Jika sistem menolak, tampilkan alasan cerdas dari ERP
      alert("❌ ERP MENOLAK TRANSAKSI: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.TotalAmount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">💰 Modul Keuangan & Invoicing</h1>
        <button 
          onClick={() => setShowForm(!showForm)}
          className={`${showForm ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-600 hover:bg-emerald-700'} text-white px-4 py-2 rounded-lg font-bold shadow-sm transition`}
        >
          {showForm ? 'Batal / Tutup' : '+ Buat Tagihan (Invoice)'}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-emerald-500">
          <p className="text-gray-500 text-sm font-semibold">Total Nilai Penjualan</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">
            Rp {totalRevenue.toLocaleString('id-ID')}
          </p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-blue-500">
          <p className="text-gray-500 text-sm font-semibold">Total Faktur Diterbitkan</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{invoices.length} Transaksi</p>
        </div>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
          <h2 className="text-lg font-bold text-gray-700 mb-4">Formulir Faktur Penjualan</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs font-semibold text-gray-600 mb-1">Nomor Faktur (Auto)</label><input type="text" readOnly value={formData.invoice_number} className="w-full p-2 border rounded bg-gray-200 font-mono text-sm" /></div>
            <div><label className="block text-xs font-semibold text-gray-600 mb-1">Nama Pelanggan (Customer)</label><input type="text" required value={formData.customer_name} onChange={(e) => setFormData({...formData, customer_name: e.target.value})} className="w-full p-2 border rounded bg-gray-50" placeholder="PT Maju Bersama..." /></div>
            <div><label className="block text-xs font-semibold text-gray-600 mb-1">Tanggal Transaksi</label><input type="date" required value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full p-2 border rounded bg-gray-50" /></div>
            
            <div className="col-span-2 border-t pt-4 mt-2">
              <h3 className="text-sm font-bold text-gray-700 mb-2">Pilih Barang yang Dijual</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Ambil Data dari Gudang</label>
                  <select value={formData.item_id} onChange={(e) => setFormData({...formData, item_id: e.target.value})} className="w-full p-2 border rounded bg-gray-50">
                    <option value="">-- Pilih Barang dari Gudang --</option>
                    {items.map((item) => (
                      <option key={item.ID || item.id} value={item.ID || item.id}>
                        {item.Name || item.name} (Sisa Stok: {item.Stock || item.stock} | Harga: Rp {item.Price || item.price})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Kuantitas Terjual</label>
                  <input type="number" min="1" required value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: e.target.value})} className="w-full p-2 border rounded bg-gray-50" />
                </div>
              </div>
            </div>
            
            <div className="col-span-2 mt-4">
              <button type="submit" disabled={loading} className="w-full bg-emerald-600 text-white font-bold py-3 rounded-lg hover:bg-emerald-700 transition">
                {loading ? 'Memproses Transaksi...' : 'Cetak & Simpan Faktur'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
            <tr>
              <th className="p-4 font-semibold border-b">No. Faktur</th>
              <th className="p-4 font-semibold border-b">Pelanggan</th>
              <th className="p-4 font-semibold border-b">Tanggal</th>
              <th className="p-4 font-semibold border-b">Total Tagihan</th>
              <th className="p-4 font-semibold border-b">Status Pembayaran</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-gray-100">
            {invoices.length === 0 ? (
              <tr><td colSpan="5" className="p-8 text-center text-gray-400 font-medium">Belum ada data faktur penjualan.</td></tr>
            ) : (
              invoices.map((inv) => (
                <tr key={inv.ID || inv.id} className="hover:bg-gray-50 transition">
                  <td className="p-4 font-bold text-blue-600">{inv.InvoiceNumber}</td>
                  <td className="p-4 font-medium text-gray-900">{inv.CustomerName}</td>
                  <td className="p-4 text-gray-600">{new Date(inv.Date).toLocaleDateString('id-ID')}</td>
                  <td className="p-4 font-bold text-gray-800">Rp {inv.TotalAmount?.toLocaleString('id-ID') || 0}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${inv.Status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                      {inv.Status.toUpperCase()}
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