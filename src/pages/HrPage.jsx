import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function HrPage() {
  const [employees, setEmployees] = useState([]);
  const [activeTab, setActiveTab] = useState('directory');
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
    const confirmPay = window.confirm(`Cairkan gaji untuk ${name} sebesar Rp ${salary.toLocaleString('id-ID')}?`);
    if (confirmPay) {
      alert(`💸 BUKTI TRANSFER: Gaji sebesar Rp ${salary.toLocaleString('id-ID')} telah berhasil dikirim ke rekening ${name}!`);
    }
  };

  // Kalkulasi total gaji yang lebih aman
  let totalSalaryBurden = 0;
  employees.forEach((emp) => {
    const salary = emp.BaseSalary || emp.base_salary || 0;
    totalSalaryBurden += salary;
  });

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

      {activeTab === 'directory' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button onClick={() => setShowForm(!showForm)} className={`${showForm ? 'bg-red-500 hover:bg-red-600' : 'bg-indigo-600 hover:bg-indigo-700'} text-white px-4 py-2 rounded-lg font-bold shadow-sm transition`}>
              {showForm ? 'Batal / Tutup' : '+ Rekrut Karyawan Baru'}
            </button>
          </div>

          {showForm && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-t-4 border-t-indigo-500">
              <h2 className="text-lg font-bold text-gray-700 mb-4">Formulir Perekrutan Karyawan</h2>
              <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-semibold text-gray-600 mb-1">Nama Lengkap</label><input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full p-2 border rounded bg-gray-50" /></div>
                <div><label className="block text-xs font-semibold text-gray-600 mb-1">Email Karyawan</label><input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full p-2 border rounded bg-gray-50" /></div>
                <div><label className="block text-xs font-semibold text-gray-600 mb-1">Nomor Telepon/WA</label><input type="text" required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full p-2 border rounded bg-gray-50" /></div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Departemen</label>
                  <select required value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})} className="w-full p-2 border rounded bg-gray-50">
                    <option value="Direksi & Manajemen">Direksi & Manajemen</option>
                    <option value="Produksi & Gudang">Produksi & Gudang</option>
                    <option value="Sales & Marketing">Sales & Marketing</option>
                    <option value="Finance & HRD">Finance & HRD</option>
                  </select>
                </div>
                <div><label className="block text-xs font-semibold text-gray-600 mb-1">Jabatan (Position)</label><input type="text" required value={formData.position} onChange={(e) => setFormData({...formData, position: e.target.value})} className="w-full p-2 border rounded bg-gray-50" /></div>
                <div><label className="block text-xs font-semibold text-gray-600 mb-1">Gaji Pokok (Bulan)</label><input type="number" min="0" required value={formData.base_salary} onChange={(e) => setFormData({...formData, base_salary: e.target.value})} className="w-full p-2 border rounded bg-gray-50" /></div>
                <div className="col-span-2 mt-4">
                  <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition">
                    {loading ? 'Menyimpan...' : 'Simpan Data Karyawan'}
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
                const name = emp.Name || emp.name || 'Unknown';
                const position = emp.Position || emp.position || '-';
                const department = emp.Department || emp.department || '-';
                const email = emp.Email || emp.email || 'Tidak ada email';
                const phone = emp.Phone || emp.phone || 'Tidak ada nomor';
                
                // Pengecekan ekstra aman untuk Avatar
                const initial = (name && name.length > 0) ? name.charAt(0).toUpperCase() : '?';

                return (
                  <div key={emp.ID || emp.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow duration-300">
                    <div className="flex items-center space-x-4 mb-5 border-b pb-4">
                      <div className="h-14 w-14 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-black text-2xl shadow-inner">
                        {initial}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 text-lg leading-tight">{name}</h3>
                        <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider">{position}</p>
                      </div>
                    </div>
                    <div className="space-y-3 text-sm text-gray-600">
                      <p className="flex items-center"><span className="w-6 opacity-70">🏢</span> <span className="font-medium text-gray-800">{department}</span></p>
                      <p className="flex items-center"><span className="w-6 opacity-70">✉️</span> <a href={`mailto:${email}`} className="text-blue-500 hover:underline">{email}</a></p>
                      <p className="flex items-center"><span className="w-6 opacity-70">📞</span> <span>{phone}</span></p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {activeTab === 'payroll' && (
        <div className="bg-white rounded-xl shadow-sm border border-emerald-100 overflow-hidden border-t-4 border-t-emerald-500">
          <div className="p-5 bg-emerald-50 border-b border-emerald-100 flex justify-between items-center">
            <div>
              <h2 className="font-bold text-emerald-800 text-lg">💸 Daftar Antrean Pembayaran Gaji</h2>
              <p className="text-xs text-emerald-600 mt-1">Klik tombol "Kirim Gaji" untuk mensimulasikan pencairan dana.</p>
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
                <th className="p-4 font-bold border-b text-right">Gaji Pokok</th>
                <th className="p-4 font-bold border-b text-right">Aksi Finance</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100 bg-gray-50">
              {employees.length === 0 ? (
                <tr><td colSpan="3" className="p-8 text-center text-gray-400">Belum ada karyawan yang direkrut.</td></tr>
              ) : (
                employees.map((emp) => {
                  const name = emp.Name || emp.name;
                  const position = emp.Position || emp.position;
                  const department = emp.Department || emp.department;
                  const salary = emp.BaseSalary || emp.base_salary || 0; 

                  return (
                    <tr key={emp.ID || emp.id} className="hover:bg-white transition-colors">
                      <td className="p-4">
                        <p className="font-bold text-gray-800 text-base">{name}</p>
                        <p className="text-xs text-gray-500 mt-1">{position} • <span className="font-medium text-indigo-600">{department}</span></p>
                      </td>
                      <td className="p-4 font-black text-emerald-600 text-right text-lg">
                        Rp {salary.toLocaleString('id-ID')}
                      </td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => handlePaySalary(name, salary)}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-lg text-xs font-bold shadow-md transition-all"
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