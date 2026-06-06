import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function AuditPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const baseUrl = 'https://bimasatria-enterprise-erp-api.hf.space';

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      // Mengambil rekaman CCTV dari Backend
      const response = await axios.get(`${baseUrl}/api/audit`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      // Urutkan dari yang terbaru (jika belum diurutkan dari backend)
      const sortedLogs = (response.data.data || []).sort((a, b) => new Date(b.CreatedAt) - new Date(a.CreatedAt));
      setLogs(sortedLogs);
    } catch (err) {
      console.error("Gagal mengambil log audit:", err);
    } finally {
      setLoading(false);
    }
  };

  // Menerjemahkan metode API menjadi bahasa manusia
  const getActionBadge = (action) => {
    switch(action?.toUpperCase()) {
      case 'POST': return <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">➕ DIBUAT (POST)</span>;
      case 'PUT': return <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded text-xs font-bold">✏️ DIUBAH (PUT)</span>;
      case 'DELETE': return <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">🗑️ DIHAPUS (DELETE)</span>;
      default: return <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-bold">👁️ DIAKSES ({action})</span>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="bg-slate-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden flex justify-between items-center">
        <div className="relative z-10">
          <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
            <span className="animate-pulse text-red-500">🔴</span> CCTV & Audit Trail
          </h1>
          <p className="text-slate-400 font-medium">Rekaman jejak digital seluruh aktivitas sistem (Strictly Confidential).</p>
        </div>
        <div className="text-6xl opacity-20 relative z-10">🕵️‍♂️</div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-bold text-slate-700">Live Activity Feed</h2>
          <button onClick={fetchAuditLogs} className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 px-3 py-1 rounded text-xs font-bold transition">
            🔄 Refresh CCTV
          </button>
        </div>
        
        {loading ? (
          <div className="p-10 text-center text-slate-400 font-bold animate-pulse">Memuat rekaman CCTV...</div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead className="bg-slate-100 text-slate-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="p-4 font-bold border-b w-48">Waktu Kejadian</th>
                  <th className="p-4 font-bold border-b">Aktor (User ID)</th>
                  <th className="p-4 font-bold border-b">Aksi & Modul</th>
                  <th className="p-4 font-bold border-b">IP Address</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-100 font-mono">
                {logs.length === 0 ? (
                  <tr><td colSpan="4" className="p-8 text-center text-slate-400 font-sans">Belum ada aktivitas terekam.</td></tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.ID} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 text-xs text-slate-500">
                        {new Date(log.CreatedAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'medium' })}
                      </td>
                      <td className="p-4 text-xs text-indigo-600 font-bold truncate max-w-[150px]" title={log.UserID}>
                        {log.UserID}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 mb-1">
                          {getActionBadge(log.Action)}
                          <span className="text-slate-800 font-bold text-xs truncate max-w-[200px]" title={log.Resource}>{log.Resource}</span>
                        </div>
                        {log.Payload && log.Payload !== "{}" && log.Payload !== "\"\"" && (
                          <div className="text-[10px] text-slate-400 bg-slate-100 p-2 rounded mt-1 truncate max-w-[300px]" title={log.Payload}>
                            Payload: {log.Payload}
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-xs text-emerald-600 font-bold">{log.IPAddress || "Unknown"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}