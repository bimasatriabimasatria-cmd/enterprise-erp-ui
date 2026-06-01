import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function HrPage() {
  const [employees, setEmployees] = useState([]);
  const [showForm, setShowForm] = useState(false);
  
  // State untuk data karyawan baru sesuai struktur Database Anda
  const [formData, setFormData] = useState({
    NIK: '', Name: '', Role: '', Department: '', Position: '', BasicSalary: '', Status: 'Aktif', HireDate: ''
  });

  // ⚠️ URL HUGGING FACE ANDA ⚠️
  const baseUrl = 'https://bimasatria-enterprise-erp-api.hf.space';

  // Ambil data saat halaman pertama kali dibuka
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
    const token = localStorage.getItem('token');
    
    try {
      // Menyesuaikan format data (Ubah string ke angka, format tanggal ISO)
      const payload = {
        ...formData,
        BasicSalary: parseFloat(formData.BasicSalary),
        HireDate: formData.HireDate ? new Date(formData.HireDate).toISOString() : new Date().toISOString()
      };

      await axios.post(`${baseUrl}/api/hr/employees`, payload, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      alert("Karyawan berhasil ditambahkan!");
      setShowForm(false); // Tutup form
      setFormData({ NIK: '', Name: '', Role: '', Department: '', Position: '', BasicSalary: '', Status: 'Aktif', HireDate: '' });
      fetchEmployees(); // Refresh tabel otomatis
      
    } catch (err) {
      alert("Gagal menyimpan data: " + (err.response?.data?.error || "Cek console/backend anda"));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">👥 Modul Sumber Daya Manusia (HRD)</h1>
        <button 
          onClick={() => setShowForm(!showForm)}
          className={`${showForm ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-700'} text-white px-4 py-2 rounded-lg font-bold shadow-sm transition`}
        >
          {showForm ? 'Batal / Tutup' : '+ Tambah Karyawan'}
        </button>
      </div>

      {/* FORM INPUT KARYAWAN (Tampil jika tombol diklik) */}
      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
          <h2 className="text-lg font-bold text-gray-700 mb-4">Formulir Karyawan Baru</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs font-semibold text-gray-600 mb-1">NIK (Nomor Induk)</label><input type="text" required value={formData.NIK} onChange={(e) => setFormData({...formData, NIK: e.target.value})} className="w-full p-2 border rounded bg-gray-50" placeholder="Ketik NIK..." /></div>
            <div><label className="block text-xs font-semibold text-gray-600 mb-1">Nama Lengkap</label><input type="text" required value={formData.Name} onChange={(e) => setFormData({...formData, Name: e.target.value})} className="w-full p-2 border rounded bg-gray-50" placeholder="Nama Lengkap..." /></div>
            <div><label className="block text-xs font-semibold text-gray-600 mb-1">Posisi Jabatan</label><input type="text" required value={formData.Position} onChange={(e) => setFormData({...formData, Position: e.target.value})} className="w-full p-2 border rounded bg-gray-50" placeholder="Manager, Staff, dll..." /></div>
            <div><label className="block text-xs font-semibold text-gray-600 mb-1">Departemen</label><input type="text" required value={formData.Department} onChange={(e) => setFormData({...formData, Department: e.target.value})} className="w-full p-2 border rounded bg-gray-50" placeholder="IT, HR, Sales..." /></div>
            <div><label className="block text-xs font-semibold text-gray-600 mb-1">Role Sistem</label><input type="text" required value={formData.Role} onChange={(e) => setFormData({...formData, Role: e.target.value})} className="w-full p-2 border rounded bg-gray-50" placeholder="Admin, User..." /></div>
            <div><label className="block text-xs font-semibold text-gray-600 mb-1">Gaji Pokok (Rp)</label><input type="number" required value={formData.BasicSalary} onChange={(e) => setFormData({...formData, BasicSalary: e.target.value})} className="w-full p-2 border rounded bg-gray-50" placeholder="5000000" /></div>
            <div><label className="block text-xs font-semibold text-gray-600 mb-1">Tanggal Bergabung</label><input type="date" required value={formData.HireDate} onChange={(e) => setFormData({...formData, HireDate: e.target.value})} className="w-full p-2 border rounded bg-gray-50" /></div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Status Karyawan</label>
              <select value={formData.Status} onChange={(e) => setFormData({...formData, Status: e.target.value})} className="w-full p-2 border rounded bg-gray-50 font-medium">
                <option value="Aktif">Aktif</option>
                <option value="Cuti">Cuti</option>
                <option value="Resign">Resign</option>
              </select>
            </div>
            <div className="col-span-2 mt-2">
              <button type="submit" className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition">Simpan Data Karyawan</button>
            </div>
          </form>
        </div>
      )}

      {/* TABEL KARYAWAN DARI DATABASE */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
            <tr>
              <th className="p-4 font-semibold border-b">NIK</th>
              <th className="p-4 font-semibold border-b">Nama Karyawan</th>
              <th className="p-4 font-semibold border-b">Posisi & Dept</th>
              <th className="p-4 font-semibold border-b">Gaji Pokok</th>
              <th className="p-4 font-semibold border-b text-center">Status</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-gray-100">
            {employees.length === 0 ? (
              <tr><td colSpan="5" className="p-8 text-center text-gray-400 font-medium">Belum ada data karyawan. Silakan tambah data baru.</td></tr>
            ) : (
              employees.map((emp, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition">
                  <td className="p-4 font-bold text-gray-700">{emp.NIK}</td>
                  <td className="p-4 font-medium text-gray-900">{emp.Name}</td>
                  <td className="p-4">
                    <p className="font-semibold text-gray-800">{emp.Position}</p>
                    <p className="text-xs text-gray-500">{emp.Department}</p>
                  </td>
                  <td className="p-4 font-medium text-gray-700">
                    Rp {emp.BasicSalary ? emp.BasicSalary.toLocaleString('id-ID') : '0'}
                  </td>
                  <td className="p-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${emp.Status === 'Aktif' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                      {emp.Status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}