import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function HrPage() {
  const [employees, setEmployees] = useState([]);
  const [activeTab, setActiveTab] = useState('directory'); // 'directory' atau 'payroll'
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: 'Produksi & Gudang',
    position: '',
    base_salary: ''
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
        ...formData,
        salary: parseFloat(formData.base_salary),
        base_salary: parseFloat(formData.base_salary)
      };

      await axios.post(`${baseUrl}/api/hr/employees`, payload, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      alert("✅ Data Karyawan Baru Berhasil Disimpan!");
      setShowForm(false);
      setFormData({ name: '', email: '', phone: '', department: 'Produksi & Gudang', position: '', base_salary: '' });
      fetchEmployees();
    } catch (err) {
      alert("❌ Gagal menyimpan data: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handlePaySalary = (name, salary) => {
    const confirmPay = window.confirm(`Cairkan gaji untuk ${name} sebesar Rp ${salary.toLocaleString('id-ID')}? (Simulasi Payroll)`);
    if (confirmPay) {
      // Di sistem ERP asli, ini akan menembak rute POST /api/finance/journal untuk memotong kas
      alert(`💸 BUKTI TRANSFER: Gaji sebesar Rp ${salary.toLocaleString('id-ID')} telah berhasil dikirim ke rekening ${name}!`);
    }
  };

  const getSalary = (emp) => emp.Salary || emp.salary || emp.BaseSalary || emp.base_salary || 0;
  
  const totalSalaryBurden = employees.reduce((sum, emp) => sum + getSalary(emp), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-800">👥 HR & Payroll Management</h1>
        <div className="flex space-x-2">
          <button onClick={() => setActiveTab('directory')} className={`px-4 py-2 font-bold rounded-lg transition ${activeTab === 'directory' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
            📖 Direktori Karyawan
          </button>
          <button onClick={() => setActiveTab('payroll')} className={`px-4 py-2 font-bold rounded-lg transition ${activeTab === 'payroll' ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
            💸 Proses Penggajian (Payroll)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-indigo-500">
          <p className="text-gray-500 text-sm font-semibold">Total Karyawan Aktif</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{employees.length} Orang</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-emerald-500">
          <p className="text-gray-500 text-sm font-semibold">Beban Gaji Pokok (Bulanan)</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">Rp {totalSalaryBurden.toLocaleString('id-ID')}</p>
        </div>
      </div>

      {/* --- TAB DIREKTORI KARYAWAN --- */}
      {activeTab === 'directory' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button onClick={() => setShowForm(!showForm)} className={`${showForm ? 'bg-red-500' : 'bg-indigo-600'} text-white px-4 py-2 rounded-lg font-bold shadow-sm hover:opacity-90 transition`}>
              {showForm ? 'Batal / Tutup' : '+ Rekrut Karyawan Baru'}
            </button>
          </div>

          {showForm && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-t-4 border-t-indigo-500">
              <h2 className="text-lg font-bold text-gray-700 mb-4">Formulir Perekrutan Karyawan</h2>
              <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-semibold text-gray-600 mb-1">Nama Lengkap</label><input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full p-2 border rounded bg-gray-50" placeholder="Bima Satria..." /></div>
                <div><label className="block text-xs font-semibold text-gray-600 mb-1">Email Karyawan</label><input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full p-2 border rounded bg-gray-50" placeholder="bima@enterprise.com" /></div>
                <div><label className="block text-xs font-semibold text-gray-600 mb-1">Nomor Telepon/WA</label><input type="text" required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full p-2 border rounded bg-gray-50" placeholder="0812..." /></div>
                
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Departemen</label>
                  <select required value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})} className="w-full p-2 border rounded bg-gray-50">
                    <option value="Direksi & Manajemen">Direksi & Manajemen</option>
                    <option value="Produksi & Gudang">Produksi & Gudang</option>
                    <option value="Sales & Marketing">Sales & Marketing</option>
                    <option value="Finance & HRD">Finance & HRD</option>
                  </select>
                </div>
                
                <div><label className="block text-xs font-semibold text-gray-600 mb-1">Jabatan (Position)</label><input type="text" required value={formData.position} onChange={(e) => setFormData({...formData, position: e.target.value})} className="w-full p-2 border rounded bg-gray-50" placeholder="Staff Gudang" /></div>
                <div><label className="block text-xs font-semibold text-gray-600 mb-1">Gaji Pokok (Bulan)</label><input type="number" min="0" required value={formData.base_salary} onChange={(e) => setFormData({...formData, base_salary: e.target.value})} className="w-full p-2 border rounded bg-gray-50" placeholder="5000000" /></div>
                
                <div className="col-span-2 mt-2">
                  <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition">
                    {loading ? 'Menyimpan...' : 'Simpan Data Karyawan'}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {employees.length === 0 ? (
              <div className="col-span-3 bg-white p-8 rounded-xl shadow-sm border text-center text-gray-400 font-medium">
                Perusahaan belum memiliki karyawan. Silakan rekrut sekarang!
              </div>
            ) : (
              employees.map((emp) => (
                <div key={emp.ID || emp.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="h-12 w-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xl">
                      {(emp.Name || emp.name).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">{emp.Name || emp.name}</h3>
                      <p className="text-xs text-indigo-600 font-semibold">{emp.Position || emp.position}</p>
                    </div>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>🏢 {emp.Department || emp.department}</p>
                    <p>✉️ {emp.Email || emp.email}</p>
                    <p>📞 {emp.Phone || emp.phone || '-'}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* --- TAB PAYROLL (PENGGAJIAN) --- */}
      {activeTab === 'payroll' && (
        <div className="bg-white rounded-xl shadow-sm border border-emerald-100 overflow-hidden border-t-4 border-t-emerald-500">
          <div className="p-4 bg-emerald-50 border-b border-emerald-100">
            <h2 className="font-bold text-emerald-800">💸 Daftar Antrean Pembayaran Gaji</h2>
            <p className="text-xs text-emerald-600">Slip gaji akan otomatis dikalkulasi berdasarkan Gaji Pokok karyawan.</p>
          </div>
          <table className="w-full text-left border-collapse">
            <thead className="bg-white text-gray-600 text-xs uppercase tracking-wider">
              <tr>
                <th className="p-4 font-semibold border-b">Nama Karyawan</th>
                <th className="p-4 font-semibold border-b">Jabatan & Dept</th>
                <th className="p-4 font-semibold border-b">Gaji Pokok</th>
                <th className="p-4 font-semibold border-b text-right">Aksi Finance</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100">
              {employees.length === 0 ? (
                <tr><td colSpan="4" className="p-6 text-center text-gray-400">Belum ada karyawan.</td></tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp.ID || emp.id} className="hover:bg-gray-50">
                    <td className="p-4 font-bold text-gray-800">{emp.Name || emp.name}</td>
                    <td className="p-4">
                      <p className="text-gray-700">{emp.Position || emp.position}</p>
                      <p className="text-xs text-gray-500">{emp.Department || emp.department}</p>
                    </td>
                    <td className="p-4 font-bold text-emerald-600">Rp {(emp.BaseSalary || emp.base_salary || 0).toLocaleString('id-ID')}</td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => handlePaySalary(emp.Name || emp.name, emp.BaseSalary || emp.base_salary || 0)}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded text-xs font-bold shadow-sm transition"
                      >
                        Kirim Gaji ➔
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}