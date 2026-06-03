import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function ManufacturingPage() {
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' atau 'boms'
  const [boms, setBoms] = useState([]);
  const [orders, setOrders] = useState([]);
  const [items, setItems] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [bomForm, setBomForm] = useState({ code: `BOM-${Date.now().toString().slice(-5)}`, name: '', item_id: '', components: [{ material_id: '', quantity: 1 }] });
  const [orderForm, setOrderForm] = useState({ order_number: `PRD-${Date.now().toString().slice(-5)}`, bom_id: '', warehouse_id: '', target_quantity: 1, start_date: new Date().toISOString().split('T')[0] });

  const baseUrl = 'https://bimasatria-enterprise-erp-api.hf.space';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const [resItems, resWh, resBoms, resOrders] = await Promise.all([
        axios.get(`${baseUrl}/api/items`, { headers }),
        axios.get(`${baseUrl}/api/warehouse`, { headers }).catch(() => ({ data: { data: [] } })), // Fallback jika gudang kosong
        axios.get(`${baseUrl}/api/manufacturing/bom`, { headers }),
        axios.get(`${baseUrl}/api/manufacturing/orders`, { headers })
      ]);
      setItems(resItems.data.data || []);
      setWarehouses(resWh.data.data || []);
      setBoms(resBoms.data.data || []);
      setOrders(resOrders.data.data || []);
    } catch (err) {
      console.error("Gagal mengambil data pabrik", err);
    }
  };

  // --- HANDLER BOM (RESEP) ---
  const handleAddComp = () => setBomForm({ ...bomForm, components: [...bomForm.components, { material_id: '', quantity: 1 }] });
  const handleCompChange = (index, field, val) => {
    const newComps = [...bomForm.components];
    newComps[index][field] = val;
    setBomForm({ ...bomForm, components: newComps });
  };
  
  const submitBom = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...bomForm, components: bomForm.components.map(c => ({ material_id: c.material_id, quantity: parseInt(c.quantity) })) };
      await axios.post(`${baseUrl}/api/manufacturing/bom`, payload, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      alert("✅ Resep (BOM) berhasil disimpan!");
      setBomForm({ code: `BOM-${Date.now().toString().slice(-5)}`, name: '', item_id: '', components: [{ material_id: '', quantity: 1 }] });
      fetchData();
      setActiveTab('orders');
    } catch (err) { alert("❌ Gagal: " + (err.response?.data?.error || err.message)); }
    setLoading(false);
  };

  // --- HANDLER PRODUKSI ---
  const submitOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...orderForm, target_quantity: parseInt(orderForm.target_quantity) };
      await axios.post(`${baseUrl}/api/manufacturing/orders`, payload, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      alert("✅ Perintah Produksi diterbitkan!");
      setOrderForm({ ...orderForm, order_number: `PRD-${Date.now().toString().slice(-5)}` });
      fetchData();
    } catch (err) { alert("❌ Gagal: " + (err.response?.data?.error || err.message)); }
    setLoading(false);
  };

  const completeProduction = async (id, code) => {
    if (!window.confirm(`Selesaikan produksi ${code}? Bahan baku akan dipotong dan barang jadi akan masuk gudang.`)) return;
    try {
      await axios.post(`${baseUrl}/api/manufacturing/orders/${id}/complete`, {}, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      alert("🏭 PRODUKSI SELESAI! Stok Gudang otomatis disesuaikan.");
      fetchData();
    } catch (err) { alert("❌ Gagal: " + (err.response?.data?.error || err.message)); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-800">🏭 Modul Pabrik & Manufaktur</h1>
        <div className="flex space-x-2">
          <button onClick={() => setActiveTab('boms')} className={`px-4 py-2 font-bold rounded ${activeTab === 'boms' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}>1. Buat Resep (BOM)</button>
          <button onClick={() => setActiveTab('orders')} className={`px-4 py-2 font-bold rounded ${activeTab === 'orders' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}>2. Eksekusi Produksi</button>
        </div>
      </div>

      {/* --- TAB RESEP BOM --- */}
      {activeTab === 'boms' && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-indigo-100">
          <h2 className="text-lg font-bold text-indigo-800 mb-4">Buat Resep (Bill of Materials) Baru</h2>
          <form onSubmit={submitBom} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div><label className="block text-xs font-bold mb-1">Kode BOM</label><input readOnly value={bomForm.code} className="w-full p-2 border bg-gray-100 rounded" /></div>
              <div><label className="block text-xs font-bold mb-1">Nama Resep</label><input required value={bomForm.name} onChange={e => setBomForm({...bomForm, name: e.target.value})} className="w-full p-2 border rounded" placeholder="Resep Meja Kayu..." /></div>
              <div>
                <label className="block text-xs font-bold mb-1">Pilih Barang Jadi (Hasil)</label>
                <select required value={bomForm.item_id} onChange={e => setBomForm({...bomForm, item_id: e.target.value})} className="w-full p-2 border rounded">
                  <option value="">-- Pilih --</option>
                  {items.map(i => <option key={i.ID} value={i.ID}>{i.Name}</option>)}
                </select>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 border rounded">
              <h3 className="text-sm font-bold mb-2 flex justify-between">
                Komponen Bahan Baku
                <button type="button" onClick={handleAddComp} className="text-xs bg-indigo-500 text-white px-2 py-1 rounded">+ Tambah Bahan</button>
              </h3>
              {bomForm.components.map((comp, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <select required value={comp.material_id} onChange={e => handleCompChange(idx, 'material_id', e.target.value)} className="flex-1 p-2 border rounded text-sm">
                    <option value="">-- Pilih Bahan Mentah --</option>
                    {items.map(i => <option key={i.ID} value={i.ID}>{i.Name} (Stok: {i.Stock})</option>)}
                  </select>
                  <input type="number" min="1" required value={comp.quantity} onChange={e => handleCompChange(idx, 'quantity', e.target.value)} className="w-24 p-2 border rounded text-sm" placeholder="Qty" />
                </div>
              ))}
            </div>
            <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white font-bold py-2 rounded">{loading ? 'Menyimpan...' : 'Simpan Resep'}</button>
          </form>
        </div>
      )}

      {/* --- TAB PERINTAH PRODUKSI --- */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-emerald-100 border-t-4 border-t-emerald-500">
            <h2 className="text-lg font-bold text-gray-700 mb-4">Terbitkan Perintah Produksi</h2>
            <form onSubmit={submitOrder} className="grid grid-cols-4 gap-4">
              <div><label className="block text-xs font-bold mb-1">Pilih Resep (BOM)</label><select required value={orderForm.bom_id} onChange={e => setOrderForm({...orderForm, bom_id: e.target.value})} className="w-full p-2 border rounded text-sm"><option value="">-- Pilih BOM --</option>{boms.map(b => <option key={b.ID} value={b.ID}>{b.Name}</option>)}</select></div>
              <div><label className="block text-xs font-bold mb-1">Gudang Operasi</label><select required value={orderForm.warehouse_id} onChange={e => setOrderForm({...orderForm, warehouse_id: e.target.value})} className="w-full p-2 border rounded text-sm"><option value="">-- Pilih Gudang --</option>{warehouses.map(w => <option key={w.ID} value={w.ID}>{w.Name}</option>)}</select></div>
              <div><label className="block text-xs font-bold mb-1">Target Jumlah (Qty)</label><input type="number" min="1" required value={orderForm.target_quantity} onChange={e => setOrderForm({...orderForm, target_quantity: e.target.value})} className="w-full p-2 border rounded text-sm" /></div>
              <div className="flex items-end"><button type="submit" className="w-full bg-emerald-600 text-white font-bold py-2 rounded text-sm">Mulai Produksi</button></div>
            </form>
          </div>

          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-xs uppercase text-gray-600">
                <tr><th className="p-4 border-b">No. Produksi</th><th className="p-4 border-b">Tgl Mulai</th><th className="p-4 border-b text-center">Target</th><th className="p-4 border-b text-center">Status</th><th className="p-4 border-b text-right">Eksekusi</th></tr>
              </thead>
              <tbody className="text-sm">
                {orders.length === 0 ? <tr><td colSpan="5" className="p-6 text-center text-gray-400">Belum ada aktivitas pabrik.</td></tr> : orders.map(o => (
                  <tr key={o.ID} className="hover:bg-gray-50 border-b">
                    <td className="p-4 font-bold text-gray-800">{o.OrderNumber}</td>
                    <td className="p-4 text-gray-600">{new Date(o.StartDate).toLocaleDateString()}</td>
                    <td className="p-4 text-center font-bold">{o.TargetQuantity} Unit</td>
                    <td className="p-4 text-center"><span className={`px-2 py-1 rounded text-xs font-bold ${o.Status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{o.Status.toUpperCase()}</span></td>
                    <td className="p-4 text-right">
                      {o.Status !== 'completed' ? (
                        <button onClick={() => completeProduction(o.ID, o.OrderNumber)} className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-bold">🏭 Selesai & Masukkan Gudang</button>
                      ) : <span className="text-gray-400 italic">Selesai</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}