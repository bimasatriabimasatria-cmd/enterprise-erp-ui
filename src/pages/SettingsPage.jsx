import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function SettingsPage() {
  const [companyName, setCompanyName] = useState('');
  const [logoBase64, setLogoBase64] = useState('');

  useEffect(() => {
    // Ambil identitas saat ini (jika ada)
    setCompanyName(localStorage.getItem('company_name') || 'ENTERPRISE');
    setLogoBase64(localStorage.getItem('company_logo') || '');
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1000000) {
        alert("⚠️ Ukuran gambar terlalu besar! Maksimal 1MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoBase64(reader.result); // Mengubah gambar jadi teks sandi (Base64)
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      // Kirim ke API Golang Anda
      await axios.post(`${baseUrl}/api/settings`, { 
        company_name: companyName, 
        logo: logoBase64 
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      alert("✅ Identitas berhasil tersinkronisasi ke server!");
      window.location.reload();
    } catch (err) {
      alert("❌ Gagal simpan ke server: " + err.message);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up max-w-3xl mx-auto">
      <div className="bg-gradient-to-r from-slate-900 to-indigo-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
            ⚙️ White-Label Settings
          </h1>
          <p className="text-indigo-200 font-medium">Kustomisasi identitas aplikasi untuk perusahaan Anda.</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <form onSubmit={handleSave} className="space-y-6">
          
          {/* INPUT NAMA PERUSAHAAN */}
          <div>
            <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-widest">
              Nama Perusahaan
            </label>
            <input 
              type="text" 
              required 
              value={companyName} 
              onChange={(e) => setCompanyName(e.target.value)} 
              className="w-full p-4 border-2 border-gray-200 rounded-xl bg-gray-50 font-black text-gray-800 text-xl focus:border-indigo-500 focus:ring-0 outline-none uppercase transition-all" 
              placeholder="PT. MAJU BERSAMA" 
            />
          </div>

          {/* INPUT LOGO PERUSAHAAN */}
          <div>
            <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-widest">
              Logo Perusahaan (Maks 1MB)
            </label>
            <div className="flex items-center gap-6 p-4 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all">
              <div className="w-24 h-24 rounded-full bg-white shadow-md border flex items-center justify-center overflow-hidden shrink-0 no-invert">
                {logoBase64 ? (
                  <img src={logoBase64} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl text-gray-300">🏢</span>
                )}
              </div>
              <div className="flex-1">
                <input 
                  type="file" 
                  accept="image/png, image/jpeg, image/svg+xml"
                  onChange={handleImageUpload}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-all cursor-pointer"
                />
                <p className="text-xs text-gray-400 mt-2 font-medium">Format didukung: PNG, JPG, SVG.</p>
              </div>
              {logoBase64 && (
                <button type="button" onClick={() => setLogoBase64('')} className="text-red-500 text-sm font-bold hover:underline">
                  Hapus Logo
                </button>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <button type="submit" className="w-full bg-indigo-600 text-white font-black py-4 rounded-xl hover:bg-indigo-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all text-lg">
              💾 Simpan Identitas Perusahaan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}