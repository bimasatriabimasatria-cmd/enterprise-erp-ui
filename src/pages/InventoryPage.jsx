import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { parseCSV } from '../utils/importCSV';

export default function InventoryPage() {
  const [items, setItems] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);

  // State Buka/Tutup Form
  const [showItemForm, setShowItemForm] = useState(false);
  const [showWhForm, setShowWhForm] = useState(false);

  // State Data Form
  const [itemForm, setItemForm] = useState({
    item_code: `SKU-${Date.now().toString().slice(-5)}`, name: '', category: 'Material', price: 0, cost: 0, stock: 0, unit: 'pcs'
  });
  const [whForm, setWhForm] = useState({
    code: `WH-${Date.now().toString().slice(-5)}`, name: '', location: ''
  });
  const [movementForm, setMovementForm] = useState({
    item_id: '', movement_type: 'IN', quantity: ''
  });

  const baseUrl = 'https://bimasatria-enterprise-erp-api.hf.space';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    try {
      const [resItems, resWh] = await Promise.all([
        axios.get(`${baseUrl}/api/items`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${baseUrl}/api/warehouse`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({data: {data:[]}}))
      ]);
      setItems(resItems.data.data || []);
      setWarehouses(resWh.data.data || []);
    } catch (err) {
      console.error("Gagal mengambil data", err);
    }
  };

  // 1. Simpan Master Barang
  const handleCreateItem = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { 
        ...itemForm,
        sku: itemForm.item_code,
        price: parseFloat(itemForm.price), 
        cost: parseFloat(itemForm.cost), 
        stock: parseInt(itemForm.stock) 
      };
      await axios.post(`${baseUrl}/api/items`, payload, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      alert("✅ Master Barang Baru Berhasil Disimpan!");
      setShowItemForm(false);
      setItemForm({ item_code: `SKU-${Date.now().toString().slice(-5)}`, name: '', category: 'Material', price: 0, cost: 0, stock: 0, unit: 'pcs' });
      fetchData();
    } catch (err) { alert("❌ Gagal: " + (err.response?.data?.error || err.message)); }
    setLoading(false);
  };

  // 2. Simpan Lokasi Gudang
  const handleCreateWh = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${baseUrl}/api/warehouse`, whForm, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      alert("✅ Lokasi Gudang Baru Berhasil Dibuat!");
      setShowWhForm(false);
      setWhForm({ code: `WH-${Date.now().toString().slice(-5)}`, name: '', location: '' });
      fetchData();
    } catch (err) { alert("❌ Gagal: " + (err.response?.data?.error || err.message)); }
    setLoading(false);
  };

  // 3. Mutasi Stok (IN/OUT)
  const handleMovement = async (e) => {
    e.preventDefault();
    if (!movementForm.item_id) return alert("Pilih barang!");
    setLoading(true);
    try {
      const payload = { ...movementForm, quantity: parseInt(movementForm.quantity) };
      await axios.post(`${baseUrl}/api/warehouse/movement`, payload, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      alert("✅ Transaksi Gudang Berhasil Diproses!");
      setMovementForm({ item_id: '', movement_type: 'IN', quantity: '' });
      fetchData();
    } catch (err) { alert("❌ Transaksi Ditolak: " + (err.response?.data?.error || err.message)); }
    setLoading(false);
  };

  // 2. Tambahkan Fungsi Import di dalam komponen
  const handleImportCSV = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const confirmImport = window.confirm("⚠️ Import data massal? Sistem akan menambahkan data dari file ini.");
    if (!confirmImport) return;

    try {
      const data = await parseCSV(file);
      const token = localStorage.getItem('token');
      
      // Kirim data ke API (Anda mungkin perlu menyesuaikan loop ini sesuai endpoint API Anda)
      for (const item of data) {
        await axios.post(`${baseUrl}/api/items`, {
          item_code: item['Kode Barang'],
          name: item['Nama Barang'],
          stock: parseInt(item['Stok']),
          price: parseFloat(item['Harga'])
        }, { headers: { Authorization: `Bearer ${token}` } });
      }
      
      alert("✅ Import massal berhasil!");
      fetchData(); // Refresh list barang
    } catch (err) {
      alert("❌ Gagal import: " + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER & TOMBOL AKSI */}
      <div className="flex justify-between items-center border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-800">📦 Master Data & Inventory</h1>
        {/* Wadah yang rapi dan elegan */}
        <div className="flex items-center gap-3 bg-white p-2 border rounded-lg shadow-sm">
          <label className="text-xs font-bold text-gray-600 uppercase tracking-widest pl-2">
            Import Data:
          </label>
          <label className="cursor-pointer bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold transition flex items-center">
            <span>📂 Pilih File CSV</span>
            <input 
              type="file" 
              accept=".csv" 
              onChange={handleImportCSV} 
              className="hidden" 
            />
          </label>
        </div>
        <div className="flex space-x-2">
          <button onClick={() => setShowWhForm(!showWhForm)} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-bold shadow-sm transition">
            {showWhForm ? 'Tutup Form Gudang' : '+ Buat Lokasi Gudang'}
          </button>
          <button onClick={() => setShowItemForm(!showItemForm)} className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-bold shadow-sm transition">
            {showItemForm ? 'Tutup Form Barang' : '+ Tambah Barang Baru'}
          </button>
        </div>
      </div>

      {/* FORM LOKASI GUDANG */}
      {showWhForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border-t-4 border-t-purple-500 mb-6">
          <h2 className="text-lg font-bold text-gray-700 mb-4">Buat Lokasi Gudang Pabrik</h2>
          <form onSubmit={handleCreateWh} className="grid grid-cols-3 gap-4">
            <div><label className="block text-xs font-bold mb-1">Kode Lokasi</label><input readOnly value={whForm.code} className="w-full p-2 border bg-gray-100 rounded" /></div>
            <div><label className="block text-xs font-bold mb-1">Nama Gudang</label><input required value={whForm.name} onChange={e => setWhForm({...whForm, name: e.target.value})} placeholder="Gudang Perakitan..." className="w-full p-2 border rounded bg-gray-50" /></div>
            <div className="flex items-end"><button type="submit" disabled={loading} className="w-full bg-purple-600 text-white font-bold py-2 rounded">Simpan Lokasi</button></div>
          </form>
        </div>
      )}

      {/* FORM BARANG BARU */}
      {showItemForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border-t-4 border-t-amber-500 mb-6">
          <h2 className="text-lg font-bold text-gray-700 mb-4">Input Master Barang Baru (Bahan Baku / Jadi)</h2>
          <form onSubmit={handleCreateItem} className="grid grid-cols-4 gap-4">
            <div className="col-span-2"><label className="block text-xs font-bold mb-1">Nama Barang</label><input required value={itemForm.name} onChange={e => setItemForm({...itemForm, name: e.target.value})} placeholder="Kayu Jati..." className="w-full p-2 border rounded bg-gray-50" /></div>
            <div className="col-span-1"><label className="block text-xs font-bold mb-1">Kategori</label><select value={itemForm.category} onChange={e => setItemForm({...itemForm, category: e.target.value})} className="w-full p-2 border rounded bg-gray-50"><option value="Material">Material (Bahan Baku)</option><option value="Produk Jadi">Produk Jadi</option></select></div>
            <div className="col-span-1"><label className="block text-xs font-bold mb-1">Stok Awal</label><input type="number" required value={itemForm.stock} onChange={e => setItemForm({...itemForm, stock: e.target.value})} className="w-full p-2 border rounded bg-gray-50" /></div>
            <div className="col-span-4"><button type="submit" disabled={loading} className="w-full bg-amber-600 text-white font-bold py-2 rounded mt-2">Simpan ke Master Data</button></div>
          </form>
        </div>
      )}

      {/* AREA UTAMA: TRANSAKSI & TABEL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* PANEL KIRI: TRANSAKSI IN/OUT */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-700 mb-6 flex items-center"><span className="mr-2">🔄</span> Input Transaksi Gudang</h2>
          <form onSubmit={handleMovement} className="space-y-4">
            <div>
              <label className="block text-xs font-bold mb-1">Pilih Barang</label>
              <select required value={movementForm.item_id} onChange={e => setMovementForm({...movementForm, item_id: e.target.value})} className="w-full p-2 border rounded bg-gray-50 text-sm">
                <option value="">-- Pilih Barang --</option>
                {items.map(i => <option key={i.ID} value={i.ID}>{i.Name} (Stok: {i.Stock})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Jenis Pergerakan</label>
              <select value={movementForm.movement_type} onChange={e => setMovementForm({...movementForm, movement_type: e.target.value})} className="w-full p-2 border rounded bg-gray-50 text-sm">
                <option value="IN">Masuk (+)</option>
                <option value="OUT">Keluar (-)</option>
              </select>
            </div>
            <div><label className="block text-xs font-bold mb-1">Jumlah (Qty)</label><input type="number" min="1" required value={movementForm.quantity} onChange={e => setMovementForm({...movementForm, quantity: e.target.value})} className="w-full p-2 border rounded bg-gray-50 text-sm" /></div>
            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold py-3 rounded mt-4">Proses Transaksi</button>
          </form>
        </div>

        {/* PANEL KANAN: TABEL STOK */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-700 mb-6 flex items-center"><span className="mr-2">📦</span> Posisi Stok Gudang Master</h2>
          <div className="overflow-y-auto max-h-96">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 text-gray-600 text-xs uppercase sticky top-0">
                <tr><th className="p-3 border-b">Nama Barang</th><th className="p-3 border-b text-center">Stok</th><th className="p-3 border-b">Kategori</th></tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-100">
                {items.map(item => (
                  <tr key={item.ID} className="hover:bg-gray-50">
                    <td className="p-3 font-bold text-gray-800">{item.Name}</td>
                    <td className="p-3 text-center font-bold text-lg text-blue-600">{item.Stock}</td>
                    <td className="p-3 text-xs text-gray-500">{item.Category}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}