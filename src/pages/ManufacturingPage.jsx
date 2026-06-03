import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function ManufacturingPage() {
  const [activeTab, setActiveTab] = useState('orders'); 
  const [boms, setBoms] = useState([]);
  const [orders, setOrders] = useState([]);
  const [items, setItems] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fitur Baru: State untuk Edit & Detail
  const [editingBomId, setEditingBomId] = useState(null);
  const [viewingBom, setViewingBom] = useState(null);

  const [bomForm, setBomForm] = useState({ code: `BOM-${Date.now().toString().slice(-5)}`, name: '', item_id: '', components: [{ material_id: '', quantity: 1 }] });
  const [orderForm, setOrderForm] = useState({ order_number: `PRD-${Date.now().toString().slice(-5)}`, bom_id: '', warehouse_id: '', target_quantity: 1, start_date: new Date().toISOString().split('T')[0] });

  const baseUrl = 'https://bimasatria-enterprise-erp-api.hf.space';

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const [resItems, resWh, resBoms, resOrders] = await Promise.all([
        axios.get(`${baseUrl}/api/items`, { headers }),
        axios.get(`${baseUrl}/api/warehouse`, { headers }).catch(() => ({ data: { data: [] } })),
        axios.get(`${baseUrl}/api/manufacturing/bom`, { headers }),
        axios.get(`${baseUrl}/api/manufacturing/orders`, { headers })
      ]);
      setItems(resItems.data.data || []);
      setWarehouses(resWh.data.data || []);
      setBoms(resBoms.data.data || []);
      setOrders(resOrders.data.data || []);
    } catch (err) { console.error("Gagal ambil data", err); }
  };

  // --- HANDLER BOM ---
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
      const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
      
      if (editingBomId) {
        await axios.put(`${baseUrl}/api/manufacturing/bom/${editingBomId}`, payload, config);
        alert("✅ Resep (BOM) berhasil diperbarui!");
      } else {
        await axios.post(`${baseUrl}/api/manufacturing/bom`, payload, config);
        alert("✅ Resep baru berhasil disimpan!");
      }
      
      setEditingBomId(null);
      setBomForm({ code: `BOM-${Date.now().toString().slice(-5)}`, name: '', item_id: '', components: [{ material_id: '', quantity: 1 }] });
      fetchData();
    } catch (err) { alert("❌ Gagal: " + (err.response?.data?.error || err.message)); }
    setLoading(false);
  };

  const handleEditBom = (bom) => {
    setEditingBomId(bom.ID || bom.id);
    setBomForm({
      code: bom.Code || bom.code,
      name: bom.Name || bom.name,
      item_id: bom.ItemID || bom.item_id,
      components: (bom.Components || bom.components || []).map(c => ({
        material_id: c.MaterialID || c.material_id,
        quantity: c.Quantity || c.quantity
      }))
    });
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Gulir ke atas
  };

  const deleteBom = async (id, name) => {
    if(!window.confirm(`Yakin ingin menghapus resep "${name}" secara permanen?`)) return;
    try {
      await axios.delete(`${baseUrl}/api/manufacturing/bom/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      alert("🗑️ Resep berhasil dihapus!");
      fetchData();
    } catch (err) { alert("❌ Gagal menghapus: " + (err.response?.data?.error || err.message)); }
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
    if (!window.confirm(`Selesaikan produksi ${code}? Bahan baku akan dipotong otomatis.`)) return;
    try {
      await axios.post(`${baseUrl}/api/manufacturing/orders/${id}/complete`, {}, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      alert("🏭 PRODUKSI SELESAI! Stok berhasil diupdate.");
      fetchData();
    } catch (err) { alert("❌ Gagal: " + (err.response?.data?.error || err.message)); }
  };

  return (
    <div className="space-y-6 relative">
      
      {/* --- MODAL DETAIL RESEP (BOM) --- */}
      {viewingBom && (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl border-t-4 border-t-indigo-500">
            <h3 className="font-bold text-xl text-gray-800 border-b pb-2 mb-4">📖 Detail Resep: {viewingBom.Name || viewingBom.name}</h3>
            
            <div className="mb-4 bg-indigo-50 p-3 rounded text-sm text-indigo-900">
              <span className="font-semibold block text-xs text-indigo-500 uppercase mb-1">Menghasilkan Barang:</span>
              <span className="font-bold">{items.find(i => (i.ID||i.id) === (viewingBom.ItemID||viewingBom.item_id))?.Name || 'Barang Tidak Ditemukan'}</span>
            </div>

            <h4 className="font-bold text-gray-700 text-sm mb-2">Komponen Bahan Baku:</h4>
            <div className="bg-gray-50 border rounded p-3 mb-6 max-h-48 overflow-y-auto">
              <ul className="space-y-2">
                {(viewingBom.Components || viewingBom.components || []).map((c, idx) => {
                  const matItem = items.find(i => (i.ID||i.id) === (c.MaterialID||c.material_id));
                  return (
                    <li key={idx} className="flex justify-between items-center text-sm border-b border-gray-200 pb-1 last:border-0 last:pb-0">
                      <span className="font-medium text-gray-700">{matItem?.Name || 'Bahan Dihapus'}</span>
                      <span className="bg-gray-200 px-2 py-0.5 rounded text-xs font-bold">{c.Quantity || c.quantity} Unit</span>
                    </li>
                  )
                })}
              </ul>
            </div>
            <button onClick={() => setViewingBom(null)} className="w-full bg-slate-800 text-white py-2 rounded-lg font-bold hover:bg-slate-900 transition">Tutup Detail</button>
          </div>
        </div>
      )}

      {/* --- KONTEN UTAMA --- */}
      <div className="flex justify-between items-center border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-800">🏭 Modul Pabrik & Manufaktur</h1>
        <div className="flex space-x-2">
          <button onClick={() => setActiveTab('boms')} className={`px-4 py-2 font-bold rounded ${activeTab === 'boms' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}>1. Master Resep (BOM)</button>
          <button onClick={() => setActiveTab('orders')} className={`px-4 py-2 font-bold rounded ${activeTab === 'orders' ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-700'}`}>2. Eksekusi Produksi</button>
        </div>
      </div>

      {/* --- TAB RESEP BOM --- */}
      {activeTab === 'boms' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-indigo-100 relative">
            {editingBomId && (
              <div className="absolute top-0 right-0 bg-amber-500 text-white px-4 py-1 rounded-bl-xl rounded-tr-xl font-bold text-xs animate-pulse">
                ✏️ Sedang Mode Edit
              </div>
            )}
            <h2 className="text-lg font-bold text-indigo-800 mb-4">{editingBomId ? 'Edit Resep Tersimpan' : 'Buat Resep Baru'}</h2>
            <form onSubmit={submitBom} className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div><label className="block text-xs font-bold mb-1">Kode BOM</label><input readOnly value={bomForm.code} className="w-full p-2 border bg-gray-100 rounded text-gray-500" /></div>
                <div><label className="block text-xs font-bold mb-1">Nama Resep</label><input required value={bomForm.name} onChange={e => setBomForm({...bomForm, name: e.target.value})} className="w-full p-2 border rounded" placeholder="Resep Meja Kayu..." /></div>
                <div>
                  <label className="block text-xs font-bold mb-1">Pilih Barang Jadi</label>
                  <select required value={bomForm.item_id} onChange={e => setBomForm({...bomForm, item_id: e.target.value})} className="w-full p-2 border rounded">
                    <option value="">-- Pilih Hasil Akhir --</option>
                    {items.map(i => <option key={i.ID||i.id} value={i.ID||i.id}>{i.Name||i.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="bg-gray-50 p-4 border rounded">
                <h3 className="text-sm font-bold mb-2 flex justify-between">Komponen Bahan Baku<button type="button" onClick={handleAddComp} className="text-xs bg-indigo-500 text-white px-2 py-1 rounded shadow">+ Tambah Bahan</button></h3>
                {bomForm.components.map((comp, idx) => (
                  <div key={idx} className="flex gap-2 mb-2 items-center">
                    <select required value={comp.material_id} onChange={e => handleCompChange(idx, 'material_id', e.target.value)} className="flex-1 p-2 border rounded text-sm">
                      <option value="">-- Pilih Bahan --</option>
                      {items.map(i => <option key={i.ID||i.id} value={i.ID||i.id}>{i.Name||i.name} (Stok: {i.Stock||i.stock})</option>)}
                    </select>
                    <input type="number" min="1" required value={comp.quantity} onChange={e => handleCompChange(idx, 'quantity', e.target.value)} className="w-24 p-2 border rounded text-sm" placeholder="Qty" />
                    {bomForm.components.length > 1 && (
                      <button type="button" onClick={() => { const newC = [...bomForm.components]; newC.splice(idx, 1); setBomForm({...bomForm, components: newC}) }} className="text-red-500 font-bold hover:bg-red-50 p-2 rounded">X</button>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={loading} className="flex-1 bg-indigo-600 text-white font-bold py-3 rounded hover:bg-indigo-700 transition">
                  {editingBomId ? 'Simpan Perubahan Resep' : 'Simpan Resep Baru'}
                </button>
                {editingBomId && (
                  <button type="button" onClick={() => {setEditingBomId(null); setBomForm({ code: `BOM-${Date.now().toString().slice(-5)}`, name: '', item_id: '', components: [{ material_id: '', quantity: 1 }] });}} className="px-6 bg-gray-300 text-gray-700 font-bold rounded hover:bg-gray-400">Batal Edit</button>
                )}
              </div>
            </form>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-700 mb-4">Daftar Resep Tersimpan</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-xs uppercase text-gray-600">
                  <tr><th className="p-4 border-b">Kode BOM</th><th className="p-4 border-b">Nama Resep</th><th className="p-4 border-b text-center">Jml Komponen</th><th className="p-4 border-b text-right">Aksi</th></tr>
                </thead>
                <tbody className="text-sm">
                  {boms.length === 0 ? <tr><td colSpan="4" className="p-6 text-center text-gray-400">Belum ada resep.</td></tr> : boms.map(b => (
                    <tr key={b.ID||b.id} className="hover:bg-gray-50 border-b">
                      <td className="p-4 font-bold text-indigo-600">{b.Code||b.code}</td>
                      <td className="p-4 font-medium">{b.Name||b.name}</td>
                      <td className="p-4 text-center text-gray-500 font-semibold">{(b.Components||b.components||[]).length} Bahan</td>
                      <td className="p-4 text-right space-x-2">
                        <button onClick={() => setViewingBom(b)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1 rounded text-xs font-bold border">👁️ Detail</button>
                        <button onClick={() => handleEditBom(b)} className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 rounded text-xs font-bold">✏️ Edit</button>
                        <button onClick={() => deleteBom(b.ID||b.id, b.Name||b.name)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-bold">🗑️ Hapus</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB PERINTAH PRODUKSI --- */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-emerald-100 border-t-4 border-t-emerald-500">
            <h2 className="text-lg font-bold text-gray-700 mb-4">Terbitkan Perintah Produksi</h2>
            <form onSubmit={submitOrder} className="grid grid-cols-4 gap-4">
              <div><label className="block text-xs font-bold mb-1">Pilih Resep</label><select required value={orderForm.bom_id} onChange={e => setOrderForm({...orderForm, bom_id: e.target.value})} className="w-full p-2 border rounded text-sm"><option value="">-- Pilih BOM --</option>{boms.map(b => <option key={b.ID||b.id} value={b.ID||b.id}>{b.Name||b.name}</option>)}</select></div>
              <div><label className="block text-xs font-bold mb-1">Gudang Operasi</label><select required value={orderForm.warehouse_id} onChange={e => setOrderForm({...orderForm, warehouse_id: e.target.value})} className="w-full p-2 border rounded text-sm"><option value="">-- Pilih Gudang --</option>{warehouses.map(w => <option key={w.ID||w.id} value={w.ID||w.id}>{w.Name||w.name}</option>)}</select></div>
              <div><label className="block text-xs font-bold mb-1">Target Jadi (Qty)</label><input type="number" min="1" required value={orderForm.target_quantity} onChange={e => setOrderForm({...orderForm, target_quantity: e.target.value})} className="w-full p-2 border rounded text-sm" /></div>
              <div className="flex items-end"><button type="submit" className="w-full bg-emerald-600 text-white font-bold py-2 rounded text-sm">Mulai Produksi</button></div>
            </form>
          </div>

          <div className="bg-white rounded-xl shadow-sm border">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-xs uppercase text-gray-600">
                <tr><th className="p-4 border-b">No. Produksi</th><th className="p-4 border-b text-center">Target</th><th className="p-4 border-b text-center">Status</th><th className="p-4 border-b text-right">Eksekusi</th></tr>
              </thead>
              <tbody className="text-sm">
                {orders.map(o => (
                  <tr key={o.ID||o.id} className="hover:bg-gray-50 border-b">
                    <td className="p-4 font-bold text-gray-800">{o.OrderNumber||o.order_number}</td>
                    <td className="p-4 text-center font-bold">{o.TargetQuantity||o.target_quantity} Unit</td>
                    <td className="p-4 text-center"><span className={`px-2 py-1 rounded text-xs font-bold ${(o.Status||o.status) === 'completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{(o.Status||o.status).toUpperCase()}</span></td>
                    <td className="p-4 text-right">
                      {(o.Status||o.status) !== 'completed' ? (
                        <button onClick={() => completeProduction(o.ID||o.id, o.OrderNumber||o.order_number)} className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-bold">🏭 Selesai</button>
                      ) : <span className="text-gray-400 italic font-medium">Selesai</span>}
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