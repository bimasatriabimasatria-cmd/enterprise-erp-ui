import React, { useState } from 'react';

export default function FinancePage() {
  const [invoices] = useState([
    { inv: 'INV-2026-001', client: 'PT Maju Bersama', date: '01 Jun 2026', amount: 45000000, status: 'Lunas' },
    { inv: 'INV-2026-002', client: 'CV Karya Cipta', date: '05 Jun 2026', amount: 12500000, status: 'Menunggu Pembayaran' }
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">💰 Modul Keuangan & Invoicing</h1>
        <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-emerald-700 shadow-sm transition">
          + Buat Tagihan (Invoice)
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-emerald-500">
          <p className="text-gray-500 text-sm font-semibold">Total Pemasukan Bulan Ini</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">Rp 45.000.000</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-orange-500">
          <p className="text-gray-500 text-sm font-semibold">Piutang Belum Dibayar</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">Rp 12.500.000</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-700 mb-4">Daftar Tagihan (Account Receivable)</h2>
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
            <tr>
              <th className="p-3 border-b">No. Invoice</th>
              <th className="p-3 border-b">Klien</th>
              <th className="p-3 border-b">Nominal</th>
              <th className="p-3 border-b">Status</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv, idx) => (
              <tr key={idx} className="border-b border-gray-50 text-sm hover:bg-gray-50">
                <td className="p-3 font-bold text-blue-600">{inv.inv}</td>
                <td className="p-3 text-gray-700">{inv.client}</td>
                <td className="p-3 font-bold text-gray-800">Rp {inv.amount.toLocaleString('id-ID')}</td>
                <td className="p-3">
                   <span className={`px-2 py-1 rounded text-xs font-bold ${inv.status === 'Lunas' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                    {inv.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}