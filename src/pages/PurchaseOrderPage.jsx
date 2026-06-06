import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { downloadCSV } from '../utils/exportCSV'; // 🚀 IMPORT MESIN EXPORT KITA

export default function PurchaseOrderPage() {
  const [pos, setPos] = useState([]);
  const [items, setItems] = useState([]); // Untuk dropdown barang
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    po_number: `PO-${new Date().getTime().toString().slice(-6)}`,
    supplier_name: '',
    date: new Date().toISOString().split('T')[0],
    item_id: '',
    quantity: '',
    unit_price: ''
  });

  const baseUrl = 'https://bimasatria-enterprise-erp-api.hf.space';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    try {
      const [resPos, resItems] = await Promise.all([
        axios.get(`${baseUrl}/api/pos`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${baseUrl}/api/items`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setPos(resPos.data.data || []);
      setItems(resItems.data.data || []);
    } catch (err) {
      console.error("Gagal mengambil data Procurement", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.item_id) return alert("Pilih barang yang ingin dipesan!");
    
    setLoading(true);
    const token = localStorage.getItem('token');

    const payload = {
      po_number: formData.po_number,
      supplier_name: formData.supplier_name,
      date: formData.date,
      lines: [
        {
          item_id: formData.item_id,
          quantity: parseInt(formData.quantity),
          unit_price: parseFloat(formData.unit_price)
        }
      ]
    };

    try {
      await axios.post(`${baseUrl}/api/pos`, payload, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      alert("✅ Purchase Order (PO) berhasil diterbitkan ke Supplier!");
      setShowForm(false);
      setFormData({
        po_number: `PO-${new Date().getTime().toString().slice(-6)}`,
        supplier_name: '', date: new Date().toISOString().split('T')[0], item_id: '', quantity: '', unit_price: ''
      });
      fetchData();
    } catch (err) {
      alert("❌ Gagal membuat PO: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleReceiveItems = async (poId, poNumber) => {
    const confirmReceive = window.confirm(`Apakah fisik barang dari PO "${poNumber}" sudah tiba di gudang dan sesuai? (Stok akan otomatis ditambah)`);
    if (!confirmReceive) return;

    const token = localStorage.getItem('token');
    try {
      await axios.post(`${baseUrl}/api/pos/${poId}/receive`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(`📦 BERHASIL! Barang dari ${poNumber} telah masuk gudang. Stok bertambah!`);
      fetchData();
    } catch (err) {
      alert("❌ Gagal menerima barang: " + (err.response?.data?.error || err.message));
    }
  };

  // 🚀 FUNGSI EXPORT KE EXCEL / CSV
  const handleExportCSV = () => {
    const formattedData = pos.map((po, index) => ({
      "No": index + 1,
      "Nomor PO": po.PONumber || "-",
      "Tanggal Pesanan": po.Date ? new Date(po.Date).toLocaleDateString('id-ID') : "-",
      "Nama Supplier": po.SupplierName || "-",
      "Total Nilai (Rp)": po.TotalAmount || 0,
      "Status Kedatangan": po.Status === 'received' ? "DITERIMA (Masuk Gudang)" : "DRAFT (Menunggu)"
    }));
    downloadCSV(formattedData, `Data_PurchaseOrder_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const totalSpent = pos.reduce((sum, p) => sum + (p.TotalAmount || 0), 0);
  const pendingPos = pos.filter(p => p.Status === 'draft').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-800">🛒 Procurement & Purchase Order</h1>
        <div className="flex space-x-2">
          {/* 🚀 TOMBOL EXPORT CSV */}
          <button 
            onClick={handleExportCSV} 
            className="bg-green-600 hover:bg-green-700 text-white px-3 md:px-4 py-2 rounded-lg font-bold shadow-sm transition flex items-center text-sm md:text-base"
          >
            <span className="mr-2">📊</span> Download Data
          </button>
          <button 
            onClick={() => setShowForm(!showForm)}
            className={`${showForm ? 'bg-red-500' : 'bg-cyan-600 hover:bg-cyan-700'} text-white px-3 md:px-4 py-2 rounded-lg font-bold shadow-sm transition text-sm md:text-base`}
          >
            {showForm ? 'Batal / Tutup' : '+ Buat PO Baru'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-cyan-500">
          <p className="text-gray-500 text-xs md:text-sm font-semibold">Total Nilai Pembelian (Pengeluaran)</p>
          <p className="text-xl md:text-2xl font-bold text-gray-800 mt-1">Rp {totalSpent.toLocaleString('id-ID')}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-amber-500">
          <p className="text-gray-500 text-xs md:text-sm font-semibold">Menunggu Pengiriman (Status Draft)</p>
          <p className="text-xl md:text-2xl font-bold text-gray-800 mt-1">{pendingPos} Dokumen PO</p>
        </div>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6 border-t-4 border-t-cyan-500 animate-fade-in-up">
          <h2 className="text-lg font-bold text-gray-700 mb-4">Formulir Pemesanan Barang ke Supplier</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className="block text-xs font-semibold text-gray-600 mb-1">Nomor PO (Auto)</label><input type="text" readOnly value={formData.po_number} className="w-full p-2 border rounded bg-gray-200 font-mono text-sm" /></div>
            <div><label className="block text-xs font-semibold text-gray-600 mb-1">Nama Supplier / Vendor</label><input type="text" required value={formData.supplier_name} onChange={(e) => setFormData({...formData, supplier_name: e.target.value})} className="w-full p-2 border rounded bg-gray-50" placeholder="PT Distributor Pusat..." /></div>
            <div><label className="block text-xs font-semibold text-gray-600 mb-1">Tanggal Pesanan</label><input type="date" required value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full p-2 border rounded bg-gray-50" /></div>
            
            <div className="col-span-1 md:col-span-3 border-t pt-4 mt-2">
              <h3 className="text-sm font-bold text-gray-700 mb-2">Detail Barang yang Dipesan</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Pilih Master Barang</label>
                  <select required value={formData.item_id} onChange={(e) => setFormData({...formData, item_id: e.target.value})} className="w-full p-2 border rounded bg-gray-50">
                    <option value="">-- Pilih Barang --</option>
                    {items.map(item => (
                      <option key={item.ID} value={item.ID}>{item.ItemCode} - {item.Name}</option>
                    ))}
                  </select>
                </div>
                <div><label className="block text-xs font-semibold text-gray-600 mb-1">Jumlah Pesanan (Qty)</label><input type="number" min="1" required value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: e.target.value})} className="w-full p-2 border rounded bg-gray-50" placeholder="100" /></div>
                <div><label className="block text-xs font-semibold text-gray-600 mb-1">Harga Beli Satuan (Dari Supplier)</label><input type="number" min="0" required value={formData.unit_price} onChange={(e) => setFormData({...formData, unit_price: e.target.value})} className="w-full p-2 border rounded bg-gray-50" placeholder="50000" /></div>
              </div>
            </div>

            <div className="col-span-1 md:col-span-3 mt-4">
              <button type="submit" disabled={loading} className="w-full bg-cyan-600 text-white font-bold py-3 rounded-lg hover:bg-cyan-700 transition">
                {loading ? 'Menyimpan PO...' : 'Kirim Pesanan ke Supplier (Draft)'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* 🔥 BUNGKUSAN PELINDUNG TABEL MOBILE (OVERFLOW-X) 🔥 */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
              <tr>
                <th className="p-4 font-semibold border-b">No. PO & Tanggal</th>
                <th className="p-4 font-semibold border-b">Supplier</th>
                <th className="p-4 font-semibold border-b">Total Nilai</th>
                <th className="p-4 font-semibold border-b text-center">Status Kedatangan</th>
                <th className="p-4 font-semibold border-b text-right">Aksi Gudang</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100">
              {pos.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-gray-400">Belum ada riwayat pemesanan barang.</td></tr>
              ) : (
                pos.map((po) => (
                  <tr key={po.ID} className="hover:bg-gray-50">
                    <td className="p-4">
                      <p className="font-bold text-cyan-700">{po.PONumber}</p>
                      <p className="text-xs text-gray-500">{new Date(po.Date).toLocaleDateString('id-ID')}</p>
                    </td>
                    <td className="p-4 font-medium text-gray-800">{po.SupplierName}</td>
                    <td className="p-4 font-bold text-gray-900">Rp {po.TotalAmount?.toLocaleString('id-ID')}</td>
                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase whitespace-nowrap ${po.Status === 'received' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {po.Status === 'received' ? 'DITERIMA' : 'DRAFT / DI JALAN'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {po.Status === 'draft' ? (
                        <button 
                          onClick={() => handleReceiveItems(po.ID, po.PONumber)}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded text-xs font-bold shadow-sm transition whitespace-nowrap"
                        >
                          📥 Terima Barang
                        </button>
                      ) : (
                        <span className="text-gray-400 text-xs italic">Masuk Gudang</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}