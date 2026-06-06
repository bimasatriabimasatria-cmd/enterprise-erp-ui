// Lokasi file: src/utils/exportCSV.js

export const downloadCSV = (data, filename) => {
  if (!data || data.length === 0) {
    alert("⚠️ Tidak ada data untuk diekspor!");
    return;
  }
  
  const headers = Object.keys(data[0]);
  const csvRows = [];
  
  // 1. Buat Baris Header
  csvRows.push(headers.join(','));
  
  // 2. Buat Baris Data (Looping)
  data.forEach(row => {
    const values = headers.map(header => {
      const val = row[header] !== null && row[header] !== undefined ? row[header] : '';
      // Escape tanda kutip ganda agar format kolom tidak rusak di Excel
      return `"${String(val).replace(/"/g, '""')}"`; 
    });
    csvRows.push(values.join(','));
  });
  
  // 3. Tambahkan BOM (\uFEFF) agar Microsoft Excel membaca format dengan sempurna (UTF-8)
  const blob = new Blob(['\uFEFF' + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  // 4. Proses Download Otomatis
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};