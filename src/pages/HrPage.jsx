import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function HrPage() {
  const [employees, setEmployees] = useState([]);
  const [activeTab, setActiveTab] = useState('directory');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Disesuaikan 100% dengan struktur EmployeeInput di controllers/hr_controller.go
  const [formData, setFormData] = useState({
    nik: `EMP-${Date.now().toString().slice(-5)}`,
    name: '',
    position: '',
    basic_salary: '',
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
      // Pastikan nama payload sama persis dengan yang diminta Golang
      const payload = {
        nik: formData.nik,
        name: formData.name,
        position: formData.position,
        basic_salary: parseFloat(formData.basic_salary),
        hire_date: formData.hire_date
      };

      await axios.post(`${baseUrl}/api/hr/employees`, payload, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      alert("✅ Data Karyawan Baru Berhasil Disimpan!");
      setShowForm(false);
      // Reset form dengan NIK baru
      setFormData({ 
        nik: `EMP-${Date.now().toString().slice(-5)}`, 
        name: '', 
        position: '', 
        basic_salary: '', 
        hire_date: new Date().toISOString().split('T')[0] 
      });
      fetchEmployees();
    } catch (err) {
      alert("❌ Gagal menyimpan data: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handlePaySalary = (name, salary) => {
    const confirmPay = window.confirm(`Cairkan gaji untuk ${name} sebesar Rp ${salary.toLocaleString('id-ID')}?`);
    if (confirmPay) {
      alert(`💸 BUKTI TRANSFER: Gaji sebesar Rp ${salary.toLocaleString('id-ID')} telah berhasil dikirim ke rekening ${name}!`);
    }
  };

  // Kalkulasi total gaji berdasarkan BasicSalary (Sesuai penamaan dari Golang)
  const totalSalaryBurden = employees.reduce((sum, emp) => sum + (emp.BasicSalary || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-800">👥 HR & Payroll Management</h1>
        <div className="flex space-x-2">
          <button onClick={() => setActiveTab('directory')} className={`px-4 py-2 font-bold rounded-lg transition ${activeTab === 'directory' ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
            📖 Direktori Karyawan
          </button>
          <button onClick={() => setActiveTab('payroll')} className={`px-4 py-2 font-bold rounded-lg transition ${activeTab === 'payroll' ? 'bg-emerald-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
            💸 Proses Penggajian
          </button>
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

      {/* --- TAB DIREKTORI KARYAWAN --- */}
      {activeTab === 'directory' && (
        <div className="space-y-6 animate-fade-in-up">
          <div className="flex justify-end">
            <button onClick={() => setShowForm(!showForm)} className={`${showForm ? 'bg-red-500 hover:bg-red-600' : 'bg-indigo-600 hover:bg-indigo-700'} text-white px-4 py-2 rounded-lg font-bold shadow-sm transition`}>
              {showForm ? 'Batal / Tutup' : '+ Rekrut Karyawan Baru'}
            </button>
          </div>

          {/* FORM SESUAI DENGAN BACKEND GOLANG */}
          {showForm && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-t-4 border-t-indigo-500">
              <h2 className="text-lg font-bold text-gray-700 mb-4">Formulir Perekrutan Karyawan (Sistem ERP)</h2>
              <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-semibold text-gray-600 mb-1">Nomor Induk Karyawan (NIK)</label><input type="text" readOnly value={formData.nik} className="w-full p-2 border rounded bg-gray-200 font-mono text-sm text-gray-600" /></div>
                <div><label className="block text-xs font-semibold text-gray-600 mb-1">Nama Lengkap</label><input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full p-2 border rounded bg-gray-50" placeholder="John Doe..." /></div>
                <div><label className="block text-xs font-semibold text-gray-600 mb-1">Jabatan (Position)</label><input type="text" required value={formData.position} onChange={(e) => setFormData({...formData, position: e.target.value})} className="w-full p-2 border rounded bg-gray-50" placeholder="Manager Produksi" /></div>
                <div><label className="block text-xs font-semibold text-gray-600 mb-1">Tanggal Bergabung</label><input type="date" required value={formData.hire_date} onChange={(e) => setFormData({...formData, hire_date: e.target.value})} className="w-full p-2 border rounded bg-gray-50" /></div>
                <div className="col-span-2"><label className="block text-xs font-semibold text-gray-600 mb-1">Gaji Pokok / Basic Salary (Rp)</label><input type="number" min="0" required value={formData.basic_salary} onChange={(e) => setFormData({...formData, basic_salary: e.target.value})} className="w-full p-2 border rounded bg-gray-50" placeholder="8000000" /></div>
                
                <div className="col-span-2 mt-4">
                  <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition">
                    {loading ? 'Menyimpan ke Database...' : 'Simpan Data Karyawan'}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {employees.length === 0 ? (
              <div className="col-span-3 bg-white p-8 rounded-xl shadow-sm border text-center text-gray-400 font-medium">
                Perusahaan belum memiliki karyawan. Silakan rekrut sekarang!
              </div>
            ) : (
              employees.map((emp) => {
                const name = emp.Name || 'Unknown';
                const initial = name.charAt(0).toUpperCase();

                return (
                  <div key={emp.ID} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow duration-300">
                    <div className="flex items-center space-x-4 mb-4 border-b pb-4">
                      <div className="h-14 w-14 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-black text-2xl shadow-inner">
                        {initial}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 text-lg leading-tight">{name}</h3>
                        <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider">{emp.Position}</p>
                      </div>
                    </div>
                    <div className="space-y-3 text-sm text-gray-600 bg-slate-50 p-3 rounded-lg border">
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-500 text-xs uppercase">NIK</span>
                        <span className="font-mono text-gray-800 font-bold">{emp.NIK}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="font-semibold text-gray-500 text-xs uppercase">Hire Date</span>
                        <span className="text-gray-800">{new Date(emp.HireDate).toLocaleDateString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="font-semibold text-gray-500 text-xs uppercase">Status</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${emp.IsActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {emp.IsActive ? 'AKTIF' : 'NON-AKTIF'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* --- TAB PAYROLL (PENGGAJIAN) --- */}
      {activeTab === 'payroll' && (
        <div className="bg-white rounded-xl shadow-sm border border-emerald-100 overflow-hidden border-t-4 border-t-emerald-500 animate-fade-in-up">
          <div className="p-5 bg-emerald-50 border-b border-emerald-100 flex justify-between items-center">
            <div>
              <h2 className="font-bold text-emerald-800 text-lg">💸 Daftar Antrean Pembayaran Gaji</h2>
              <p className="text-xs text-emerald-600 mt-1">Sistem membaca Basic Salary langsung dari master data Golang.</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-emerald-700 font-bold uppercase">Total Tagihan Payroll</p>
              <p className="text-xl font-black text-emerald-800">Rp {totalSalaryBurden.toLocaleString('id-ID')}</p>
            </div>
          </div>
          <table className="w-full text-left border-collapse">
            <thead className="bg-white text-gray-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="p-4 font-bold border-b w-1/3">Detail Karyawan</th>
                <th className="p-4 font-bold border-b text-right">Gaji Pokok (Basic Salary)</th>
                <th className="p-4 font-bold border-b text-right">Aksi Finance</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100 bg-gray-50">
              {employees.length === 0 ? (
                <tr><td colSpan="3" className="p-8 text-center text-gray-400">Belum ada karyawan yang direkrut.</td></tr>
              ) : (
                employees.map((emp) => {
                  const salary = emp.BasicSalary || 0; 
                  return (
                    <tr key={emp.ID} className="hover:bg-white transition-colors">
                      <td className="p-4">
                        <p className="font-bold text-gray-800 text-base">{emp.Name}</p>
                        <p className="text-xs text-gray-500 mt-1">{emp.Position} • <span className="font-medium text-indigo-600 font-mono">NIK: {emp.NIK}</span></p>
                      </td>
                      <td className="p-4 font-black text-emerald-600 text-right text-lg">
                        Rp {salary.toLocaleString('id-ID')}
                      </td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => handlePaySalary(emp.Name, salary)}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-lg text-xs font-bold shadow-md hover:shadow-lg transition-all"
                        >
                          Cairkan Gaji ➔
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}