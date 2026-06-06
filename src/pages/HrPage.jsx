import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { downloadCSV } from '../utils/exportCSV';

export default function HrPage() {
  const [employees, setEmployees] = useState([]);
  const [activeTab, setActiveTab] = useState('directory');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // State khusus untuk Mesin Cetak
  const [selectedSlip, setSelectedSlip] = useState(null);

  const [formData, setFormData] = useState({
    nik: `EMP-${Date.now().toString().slice(-5)}`,
    name: '',
    position: '',
    salary: '',
    hire_date: new Date().toISOString().split('T')[0]
  });

  const baseUrl = 'https://bimasatria-enterprise-erp-api.hf.space';

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`${baseUrl}/api/hr/employees`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setEmployees(response.data.data || []);
    } catch (err) {
      console.error("Gagal mengambil data karyawan", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('token');
    
    try {
      const payload = {
        nik: formData.nik,
        name: formData.name,
        position: formData.position,
        basic_salary: Number(formData.salary) || 0, 
        hire_date: formData.hire_date
      };

      if (editingId) {
        await axios.put(`${baseUrl}/api/hr/employees/${editingId}`, payload, { headers: { Authorization: `Bearer ${token}` } });
        alert("✅ Data Karyawan Berhasil Diperbarui!");
      } else {
        await axios.post(`${baseUrl}/api/hr/employees`, payload, { headers: { Authorization: `Bearer ${token}` } });
        alert("✅ Karyawan Baru Berhasil Direkrut!");
      }
      
      setShowForm(false);
      setEditingId(null);
      setFormData({ nik: `EMP-${Date.now().toString().slice(-5)}`, name: '', position: '', salary: '', hire_date: new Date().toISOString().split('T')[0] });
      fetchEmployees();
    } catch (err) {
      alert("❌ Gagal menyimpan data: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (emp) => {
    setEditingId(emp.ID || emp.id);
    setFormData({
      nik: emp.NIK || emp.nik || '',
      name: emp.Name || emp.name || '',
      position: emp.Position || emp.position || '',
      salary: emp.BasicSalary || emp.basic_salary || 0,
      hire_date: emp.HireDate ? emp.HireDate.split('T')[0] : new Date().toISOString().split('T')[0]
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id, name) => {
    if(!window.confirm(`⚠️ PERINGATAN: Pecat/hapus "${name}" secara permanen?`)) return;
    try {
      await axios.delete(`${baseUrl}/api/hr/employees/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }});
      fetchEmployees();
    } catch (err) {
      alert("❌ Gagal menghapus karyawan.");
    }
  };

  const handlePaySalary = (name, salary) => {
    const confirmPay = window.confirm(`Cairkan gaji untuk ${name} sebesar Rp ${salary.toLocaleString('id-ID')}?`);
    if (confirmPay) alert(`💸 BUKTI TRANSFER: Gaji berhasil dikirim ke rekening ${name}!`);
  };

  // FUNGSI PEMICU MESIN CETAK
  const handlePrintSlip = (emp) => {
    setSelectedSlip(emp);
    // Beri jeda sedikit agar React merender UI Slip Gaji, lalu picu print browser
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const handleExportCSV = () => {
    const formattedData = employees.map((emp, index) => ({
      "No": index + 1,
      "NIK Karyawan": emp.NIK || emp.nik || "-",
      "Nama Lengkap": emp.Name || emp.name || "-",
      "Jabatan": emp.Position || emp.position || "-",
      "Gaji Pokok (Rp)": emp.BasicSalary || emp.basic_salary || 0,
      "Tanggal Masuk": emp.HireDate ? new Date(emp.HireDate).toLocaleDateString('id-ID') : "-",
      "Status": emp.IsActive !== false ? "Aktif" : "Non-Aktif"
    }));
    
    downloadCSV(formattedData, `Data_Karyawan_ERP_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const totalSalaryBurden = employees.reduce((sum, emp) => sum + (emp.BasicSalary || emp.basic_salary || 0), 0);

  return (
    <>
      {/* ========================================================================================= */}
      {/* 🖨️ AREA CETAK (Hanya muncul di kertas/PDF, hilang di layar normal) */}
      {/* ========================================================================================= */}
      {selectedSlip && (
        <div className="hidden print:block p-10 font-sans text-black">
          {/* Header Kop Surat */}
          <div className="flex justify-between items-end border-b-4 border-slate-800 pb-4 mb-8">
            <div>
              <h1 className="text-4xl font-black tracking-widest text-slate-800">ENTERPRISE</h1>
              <p className="text-sm font-bold text-slate-500 tracking-widest">ERP SYSTEM V2.0 INDONESIA</p>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold text-slate-800">SLIP GAJI KARYAWAN</h2>
              <p className="text-sm text-slate-600">Periode: {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</p>
            </div>
          </div>

          {/* Informasi Karyawan */}
          <div className="grid grid-cols-2 gap-4 mb-8 bg-slate-50 p-4 border rounded-lg">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase">Nama Karyawan</p>
              <p className="text-lg font-bold text-slate-800">{selectedSlip.Name || selectedSlip.name}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase">Nomor Induk (NIK)</p>
              <p className="text-lg font-mono text-slate-800">{selectedSlip.NIK || selectedSlip.nik}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase">Jabatan</p>
              <p className="text-lg text-slate-800 uppercase">{selectedSlip.Position || selectedSlip.position}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase">Tanggal Bergabung</p>
              <p className="text-lg text-slate-800">{new Date(selectedSlip.HireDate).toLocaleDateString('id-ID')}</p>
            </div>
          </div>

          {/* Rincian Gaji */}
          <table className="w-full text-left border-collapse mb-8">
            <thead>
              <tr className="bg-slate-200 border-b-2 border-slate-800">
                <th className="p-3 font-bold text-slate-800 uppercase text-sm">Deskripsi Pendapatan</th>
                <th className="p-3 font-bold text-slate-800 uppercase text-sm text-right">Jumlah (Rp)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-3 text-slate-700">Gaji Pokok (Basic Salary)</td>
                <td className="p-3 font-mono text-right text-slate-800">Rp {(selectedSlip.BasicSalary || selectedSlip.basic_salary || 0).toLocaleString('id-ID')}</td>
              </tr>
              <tr className="border-b">
                <td className="p-3 text-slate-700">Tunjangan Operasional (Simulasi)</td>
                <td className="p-3 font-mono text-right text-slate-800">Rp 0</td>
              </tr>
              <tr className="border-b">
                <td className="p-3 text-slate-700">Potongan / Pajak (Simulasi)</td>
                <td className="p-3 font-mono text-right text-red-600">- Rp 0</td>
              </tr>
              <tr className="bg-slate-100 border-t-2 border-slate-800">
                <td className="p-4 font-black text-slate-800 text-lg">PENERIMAAN BERSIH (TAKE HOME PAY)</td>
                <td className="p-4 font-black text-slate-800 text-right text-xl">Rp {(selectedSlip.BasicSalary || selectedSlip.basic_salary || 0).toLocaleString('id-ID')}</td>
              </tr>
            </tbody>
          </table>

          {/* Tanda Tangan */}
          <div className="flex justify-between mt-16 px-10">
            <div className="text-center">
              <p className="mb-20 text-sm font-bold text-slate-600">Penerima,</p>
              <p className="font-bold border-b border-slate-800 px-4 inline-block">{selectedSlip.Name || selectedSlip.name}</p>
            </div>
            <div className="text-center">
              <p className="mb-20 text-sm font-bold text-slate-600">Manager HRD & Finance,</p>
              <p className="font-bold border-b border-slate-800 px-4 inline-block">Enterprise ERP Admin</p>
            </div>
          </div>
          
          <div className="text-center mt-12 text-xs text-slate-400 italic">
            Dokumen ini dicetak secara otomatis oleh sistem Enterprise ERP dan sah tanpa cap perusahaan.
          </div>
        </div>
      )}

      {/* ========================================================================================= */}
      {/* 💻 AREA LAYAR NORMAL (Akan disembunyikan saat sedang mencetak) */}
      {/* ========================================================================================= */}
      <div className="space-y-6 print:hidden">
        <div className="flex justify-between items-center border-b pb-4">
          <h1 className="text-2xl font-bold text-gray-800">👥 HR & Payroll Management</h1>
          <div className="flex space-x-2">
            <button onClick={() => setActiveTab('directory')} className={`px-4 py-2 font-bold rounded-lg transition ${activeTab === 'directory' ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-200 text-gray-700'}`}>📖 Direktori Karyawan</button>
            <button onClick={() => setActiveTab('payroll')} className={`px-4 py-2 font-bold rounded-lg transition ${activeTab === 'payroll' ? 'bg-emerald-600 text-white shadow-md' : 'bg-gray-200 text-gray-700'}`}>💸 Proses Penggajian</button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-indigo-500">
            <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Total Karyawan Aktif</p>
            <p className="text-3xl font-black text-gray-800 mt-1">{employees.length} <span className="text-lg font-medium text-gray-500">Orang</span></p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-emerald-500">
            <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Beban Gaji (Bulanan)</p>
            <p className="text-3xl font-black text-emerald-600 mt-1">Rp {totalSalaryBurden.toLocaleString('id-ID')}</p>
          </div>
        </div>

        {activeTab === 'directory' && (
          <div className="space-y-6 animate-fade-in-up">
            {/* 🚀 TOMBOL EXPORT CSV ADA DI SINI */}
            <div className="flex justify-end space-x-3">
              <button onClick={handleExportCSV} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold shadow-sm transition flex items-center">
                <span className="mr-2">📊</span> Download Data (Excel/CSV)
              </button>
              <button onClick={() => {setShowForm(!showForm); setEditingId(null);}} className={`${showForm ? 'bg-red-500 hover:bg-red-600' : 'bg-indigo-600 hover:bg-indigo-700'} text-white px-4 py-2 rounded-lg font-bold shadow-sm transition`}>
                {showForm ? 'Batal / Tutup Form' : '+ Rekrut Karyawan Baru'}
              </button>
            </div>

            {showForm && (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-indigo-100 relative">
                {editingId && <div className="absolute top-0 right-0 bg-amber-500 text-white px-4 py-1 rounded-bl-xl rounded-tr-xl font-bold text-xs animate-pulse">✏️ Mode Edit</div>}
                <h2 className="text-lg font-bold text-indigo-800 mb-4">{editingId ? 'Edit Data Karyawan' : 'Formulir Perekrutan Baru'}</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                  <div><label className="block text-xs font-semibold text-gray-600 mb-1">Nomor Induk (NIK)</label><input type="text" readOnly value={formData.nik} className="w-full p-2 border rounded bg-gray-200 font-mono text-sm" /></div>
                  <div><label className="block text-xs font-semibold text-gray-600 mb-1">Nama Lengkap</label><input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full p-2 border rounded bg-gray-50" /></div>
                  <div><label className="block text-xs font-semibold text-gray-600 mb-1">Jabatan (Position)</label><input type="text" required value={formData.position} onChange={(e) => setFormData({...formData, position: e.target.value})} className="w-full p-2 border rounded bg-gray-50" /></div>
                  <div><label className="block text-xs font-semibold text-gray-600 mb-1">Tanggal Bergabung</label><input type="date" required value={formData.hire_date} onChange={(e) => setFormData({...formData, hire_date: e.target.value})} className="w-full p-2 border rounded bg-gray-50" /></div>
                  <div className="col-span-2"><label className="block text-xs font-semibold text-gray-600 mb-1">Gaji Pokok / Salary (Rp)</label><input type="number" min="0" required value={formData.salary} onChange={(e) => setFormData({...formData, salary: e.target.value})} className="w-full p-2 border rounded bg-gray-50" /></div>
                  <div className="col-span-2 mt-4"><button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition">{loading ? 'Menyimpan...' : (editingId ? 'Simpan Perubahan' : 'Simpan Karyawan Baru')}</button></div>
                </form>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {employees.length === 0 ? (
                <div className="col-span-3 bg-white p-8 rounded-xl shadow-sm border text-center text-gray-400 font-medium">Belum ada data karyawan.</div>
              ) : (
                employees.map((emp) => {
                  const name = emp.Name || emp.name || 'Unknown';
                  const initial = name.charAt(0).toUpperCase();

                  return (
                    <div key={emp.ID || emp.id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition flex flex-col h-full">
                      <div className="p-6 flex-grow">
                        <div className="flex items-center space-x-4 mb-4 border-b pb-4">
                          <div className="h-14 w-14 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-black text-2xl shadow-inner">{initial}</div>
                          <div><h3 className="font-bold text-gray-800 text-lg leading-tight">{name}</h3><p className="text-xs text-indigo-600 font-bold uppercase tracking-wider">{emp.Position || emp.position}</p></div>
                        </div>
                        <div className="space-y-3 text-sm text-gray-600 bg-slate-50 p-3 rounded-lg border">
                          <div className="flex justify-between"><span className="font-semibold text-gray-500 text-xs uppercase">NIK</span><span className="font-mono text-gray-800 font-bold">{emp.NIK || emp.nik}</span></div>
                          <div className="flex justify-between border-t pt-2"><span className="font-semibold text-gray-500 text-xs uppercase">Gaji</span><span className="text-emerald-600 font-bold">Rp {(emp.BasicSalary || emp.basic_salary || 0).toLocaleString('id-ID')}</span></div>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-3 border-t flex justify-end space-x-2 rounded-b-xl">
                        <button onClick={() => handleEdit(emp)} className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition">✏️ Edit</button>
                        <button onClick={() => handleDelete(emp.ID || emp.id, name)} className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition">🗑️ Hapus</button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* --- TAB PAYROLL (PENGGAJIAN) DENGAN TOMBOL CETAK SLIP --- */}
        {activeTab === 'payroll' && (
          <div className="bg-white rounded-xl shadow-sm border border-emerald-100 overflow-hidden border-t-4 border-t-emerald-500">
            <div className="p-5 bg-emerald-50 border-b border-emerald-100 flex justify-between items-center">
              <div><h2 className="font-bold text-emerald-800 text-lg">💸 Antrean Gaji Karyawan</h2></div>
              <div className="text-right"><p className="text-xs text-emerald-700 font-bold uppercase">Total Tagihan Payroll</p><p className="text-xl font-black text-emerald-800">Rp {totalSalaryBurden.toLocaleString('id-ID')}</p></div>
            </div>
            <table className="w-full text-left border-collapse">
              <thead className="bg-white text-gray-500 text-xs uppercase tracking-wider">
                <tr><th className="p-4 font-bold border-b w-1/3">Detail Karyawan</th><th className="p-4 font-bold border-b text-right">Gaji Pokok</th><th className="p-4 font-bold border-b text-center">Aksi Finance & Dokumen</th></tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-100 bg-gray-50">
                {employees.map((emp) => {
                  const name = emp.Name || emp.name;
                  const salary = emp.BasicSalary || emp.basic_salary || 0; 
                  return (
                    <tr key={emp.ID || emp.id} className="hover:bg-white transition-colors">
                      <td className="p-4"><p className="font-bold text-gray-800 text-base">{name}</p><p className="text-xs text-gray-500 mt-1">{emp.Position || emp.position} • <span className="font-mono text-indigo-600">{emp.NIK || emp.nik}</span></p></td>
                      <td className="p-4 font-black text-emerald-600 text-right text-lg">Rp {salary.toLocaleString('id-ID')}</td>
                      <td className="p-4 text-center space-x-2">
                        {/* TOMBOL BARU UNTUK MENCETAK SLIP GAJI */}
                        <button onClick={() => handlePrintSlip(emp)} className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2.5 rounded-lg text-xs font-bold shadow-md transition-all">🖨️ Cetak Slip</button>
                        <button onClick={() => handlePaySalary(name, salary)} className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-lg text-xs font-bold shadow-md transition-all">💸 Kirim Gaji</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}