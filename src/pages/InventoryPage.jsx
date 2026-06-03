import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function InventoryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    item_id: '',
    movement_type: 'IN', // IN untuk Masuk (+), OUT untuk Keluar (-)
    quantity: ''
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
    if (!formData.item_id) return alert("Pilih barang terlebih dahulu!");
    
    setLoading(true);
    const token = localStorage.getItem('token');
    
    // Pastikan quantity berformat angka (Integer)
    const payload = {
      item_id: formData.item_id,
      movement_type: formData.movement_type,
      quantity: parseInt(formData.quantity)
    };

    try {
      // Sesuaikan URL ini dengan rute di warehouse_routes.go Anda (contoh: /api/warehouse)
      await axios.post(`${baseUrl}/api/warehouse`, payload, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      alert("✅ Transaksi Gudang Berhasil Diproses!");
      
      setFormData({ item_id: '', movement_type: 'IN', quantity: '' });
      fetchItems(); // Refresh tabel stok secara otomatis
    } catch (err) {
      alert("❌ Transaksi Ditolak: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* PANEL KIRI: FORM TRANSAKSI */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-700 mb-6 flex items-center">
            <span className="mr-2">🔄</span> Input Transaksi Gudang
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Pilih Barang (SKU - Nama)</label>
              {/* PERBAIKAN: Menggunakan Dropdown agar UUID terkirim ke Database */}
              <select 
                required
                value={formData.item_id} 
                onChange={(e) => setFormData({...formData, item_id: e.target.value})} 
                className="w-full p-2 border rounded bg-gray-50 text-sm"
              >
                <option value="">-- Klik untuk memilih barang --</option>
                {items.map(item => (
                  <option key={item.ID} value={item.ID}>
                    {item.ItemCode || 'SKU'} - {item.Name} (Stok: {item.Stock})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Jenis Pergerakan</label>
              <select 
                value={formData.movement_type} 
                onChange={(e) => setFormData({...formData, movement_type: e.target.value})} 
                className="w-full p-2 border rounded bg-gray-50 text-sm"
              >
                <option value="IN">Masuk (+)</option>
                <option value="OUT">Keluar (-)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Jumlah (Qty)</label>
              <input 
                type="number" 
                min="1" 
                required
                value={formData.quantity} 
                onChange={(e) => setFormData({...formData, quantity: e.target.value})} 
                className="w-full p-2 border rounded bg-gray-50 text-sm" 
                placeholder="0"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 text-white font-bold py-3 rounded hover:bg-blue-700 transition mt-4"
            >
              {loading ? 'Memproses...' : 'Proses Transaksi'}
            </button>
          </form>
        </div>

        {/* PANEL KANAN: TABEL STOK */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-700 mb-6 flex items-center">
            <span className="mr-2">📦</span> Posisi Stok Gudang (Master)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
                <tr>
                  <th className="p-3 font-semibold border-b">SKU</th>
                  <th className="p-3 font-semibold border-b">Nama Barang</th>
                  <th className="p-3 font-semibold border-b text-center">Stok Aktif</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-100">
                {items.map((item) => (
                  <tr key={item.ID} className="hover:bg-gray-50">
                    <td className="p-3 font-medium text-blue-600">{item.ItemCode || 'SKU'}</td>
                    <td className="p-3 text-gray-800 uppercase">{item.Name}</td>
                    <td className="p-3 text-center font-bold text-lg text-gray-900">{item.Stock || 0}</td>
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