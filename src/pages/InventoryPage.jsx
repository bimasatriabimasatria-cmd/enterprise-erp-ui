import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function InventoryPage() {
  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Struktur data yang presisi sesuai dengan item_controller.go di Golang
  const [formData, setFormData] = useState({
    item_code: `SKU-${new Date().getTime().toString().slice(-5)}`,
    name: '',
    description: '',
    category: 'Elektronik',
    price: '',
    cost: '',
    stock: '',
    unit: 'pcs'
  });

  const baseUrl = 'https://bimasatria-enterprise-erp-api.hf.space';

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`${baseUrl}/api/items`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setItems(response.data.data || []);
    } catch (err) {
      console.error("Gagal mengambil data gudang", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    setLoading(true);
    
    try {
      // Pastikan angka tidak dikirim sebagai teks (string) ke Golang
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        cost: parseFloat(formData.cost),
        stock: parseInt(formData.stock)
      };

      await axios.post(`${baseUrl}/api/items`, payload, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      alert("✅ Barang Baru Berhasil Masuk Gudang!");
      setShowForm(false);
      setFormData({
        item_code: `SKU-${new Date().getTime().toString().slice(-5)}`,
        name: '', description: '', category: 'Elektronik', price: '', cost: '', stock: '', unit: 'pcs'
      });
      fetchItems();
    } catch (err) {
      alert("❌ Gagal menyimpan barang: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Menghitung total valuasi aset di gudang (Stok * Harga Modal)
  const totalValuation = items.reduce((sum, item) => sum + ((item.Cost || item.cost || 0) * (item.Stock || item.stock || 0)), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">📦 Modul Inventory & Gudang</h1>
        <button 
          onClick={() => setShowForm(!showForm)}
          className={`${showForm ? 'bg-red-500 hover:bg-red-600' : 'bg-amber-600 hover:bg-amber-700'} text-white px-4 py-2 rounded-lg font-bold shadow-sm transition`}
        >
          {showForm ? 'Batal / Tutup' : '+ Tambah Barang Baru'}
        </button>
      </div>

      {/* Dashboard Mini Gudang */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-amber-500">
          <p className="text-gray-500 text-sm font-semibold">Total Jenis Barang (SKU)</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{items.length} Item</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-blue-500">
          <p className="text-gray-500 text-sm font-semibold">Total Valuasi Aset Gudang (Modal)</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">Rp {totalValuation.toLocaleString('id-ID')}</p>
        </div>
      </div>

      {/* Formulir Input Barang */}
      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6 border-t-4 border-t-amber-500">
          <h2 className="text-lg font-bold text-gray-700 mb-4">Penerimaan Barang Baru</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-4 gap-4">
            <div className="col-span-1"><label className="block text-xs font-semibold text-gray-600 mb-1">Kode SKU</label><input type="text" readOnly value={formData.item_code} className="w-full p-2 border rounded bg-gray-200 font-mono text-sm" /></div>
            <div className="col-span-2"><label className="block text-xs font-semibold text-gray-600 mb-1">Nama Barang</label><input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full p-2 border rounded bg-gray-50" placeholder="Laptop Lenovo ThinkPad..." /></div>
            <div className="col-span-1">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Kategori</label>
              <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full p-2 border rounded bg-gray-50">
                <option value="Elektronik">Elektronik</option>
                <option value="Material">Material Pokok</option>
                <option value="Konsumsi">Konsumsi</option>
                <option value="Jasa">Jasa</option>
              </select>
            </div>
            
            <div className="col-span-1"><label className="block text-xs font-semibold text-gray-600 mb-1">Harga Modal (Rp)</label><input type="number" min="0" required value={formData.cost} onChange={(e) => setFormData({...formData, cost: e.target.value})} className="w-full p-2 border rounded bg-gray-50" placeholder="5000000" /></div>
            <div className="col-span-1"><label className="block text-xs font-semibold text-gray-600 mb-1">Harga Jual (Rp)</label><input type="number" min="0" required value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="w-full p-2 border rounded bg-gray-50" placeholder="7500000" /></div>
            <div className="col-span-1"><label className="block text-xs font-semibold text-gray-600 mb-1">Jumlah Stok Fisik</label><input type="number" min="0" required value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} className="w-full p-2 border rounded bg-gray-50" placeholder="100" /></div>
            <div className="col-span-1">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Satuan (Unit)</label>
              <select value={formData.unit} onChange={(e) => setFormData({...formData, unit: e.target.value})} className="w-full p-2 border rounded bg-gray-50">
                <option value="pcs">Pcs</option>
                <option value="box">Box</option>
                <option value="kg">Kilogram (Kg)</option>
                <option value="liter">Liter</option>
              </select>
            </div>

            <div className="col-span-4 mt-2">
              <button type="submit" disabled={loading} className="w-full bg-amber-600 text-white font-bold py-3 rounded-lg hover:bg-amber-700 transition">
                {loading ? 'Menyimpan ke Database...' : 'Simpan Barang ke Gudang'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabel Database Gudang */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
            <tr>
              <th className="p-4 font-semibold border-b">SKU & Barang</th>
              <th className="p-4 font-semibold border-b text-center">Stok & Satuan</th>
              <th className="p-4 font-semibold border-b">Harga Modal</th>
              <th className="p-4 font-semibold border-b">Harga Jual</th>
              <th className="p-4 font-semibold border-b text-center">Status</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-gray-100">
            {items.length === 0 ? (
              <tr><td colSpan="5" className="p-8 text-center text-gray-400 font-medium">Gudang kosong. Silakan tambah barang.</td></tr>
            ) : (
              items.map((item) => {
                const stock = item.Stock ?? item.stock ?? 0;
                // Logika peringatan stok menipis
                const isLowStock = stock < 10; 

                return (
                  <tr key={item.ID || item.id} className="hover:bg-gray-50 transition">
                    <td className="p-4">
                      <p className="font-bold text-blue-600 text-xs">{item.ItemCode || item.item_code}</p>
                      <p className="font-bold text-gray-900">{item.Name || item.name}</p>
                      <p className="text-xs text-gray-500">{item.Category || item.category}</p>
                    </td>
                    <td className="p-4 text-center">
                      <p className={`text-lg font-bold ${isLowStock ? 'text-red-600' : 'text-emerald-600'}`}>
                        {stock}
                      </p>
                      <p className="text-xs font-semibold text-gray-500 uppercase">{item.Unit || item.unit}</p>
                      {isLowStock && <p className="text-[10px] text-red-500 font-bold mt-1 animate-pulse">STOK MENIPIS!</p>}
                    </td>
                    <td className="p-4 font-medium text-gray-600">Rp {(item.Cost || item.cost || 0).toLocaleString('id-ID')}</td>
                    <td className="p-4 font-bold text-gray-800">Rp {(item.Price || item.price || 0).toLocaleString('id-ID')}</td>
                    <td className="p-4 text-center">
                       <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">Aktif</span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}