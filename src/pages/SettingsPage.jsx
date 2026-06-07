import React, { useState, useEffect } from 'react';
import axios from 'axios'; // 🚀 IMPORT INI WAJIB ADA!

export default function SettingsPage() {
  const [companyName, setCompanyName] = useState('');
  const [logoBase64, setLogoBase64] = useState('');
  const baseUrl = 'https://bimasatria-enterprise-erp-api.hf.space'; // 🚀 PASTIKAN INI ADA!

  useEffect(() => {
    // Ambil identitas dari server (Database)
    const fetchSettings = async () => {
      try {
        const res = await axios.get(`${baseUrl}/api/settings`);
        if (res.data) {
          setCompanyName(res.data.company_name || 'ENTERPRISE');
          setLogoBase64(res.data.logo || '');
        }
      } catch (err) {
        console.log("Belum ada pengaturan di server, menggunakan default.");
      }
    };
    fetchSettings();
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogoBase64(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      // 🚀 MENGIRIM KE SERVER
      await axios.post(`${baseUrl}/api/settings`, { 
        company_name: companyName, 
        logo: logoBase64 
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      // Simpan juga ke localStorage agar update instan tanpa refresh
      localStorage.setItem('company_name', companyName.toUpperCase());
      localStorage.setItem('company_logo', logoBase64);
      
      alert("✅ Identitas berhasil tersinkronisasi ke server!");
      window.location.reload();
    } catch (err) {
      alert("❌ Gagal simpan ke server: " + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up max-w-3xl mx-auto">
      <div className="bg-gradient-to-r from-slate-900 to-indigo-900 rounded-2xl p-8 text-white shadow-xl">
        <h1 className="text-3xl font-black">⚙️ White-Label Settings</h1>
        <p className="text-indigo-200">Kustomisasi identitas aplikasi.</p>
      </div>
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="block text-sm font-black text-gray-700 mb-2 uppercase">Nama Perusahaan</label>
            <input type="text" required value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="w-full p-4 border rounded-xl bg-gray-50 font-black text-xl uppercase" placeholder="PT. BIMA SATRIA" />
          </div>
          <div>
            <label className="block text-sm font-black text-gray-700 mb-2 uppercase">Logo Perusahaan</label>
            <input type="file" accept="image/*" onChange={handleImageUpload} className="block w-full text-sm text-gray-500" />
          </div>
          <button type="submit" className="w-full bg-indigo-600 text-white font-black py-4 rounded-xl hover:bg-indigo-700">Simpan Identitas</button>
        </form>
      </div>
    </div>
  );
}