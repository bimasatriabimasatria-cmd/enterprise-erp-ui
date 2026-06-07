// Lokasi file: src/utils/importCSV.js
export const parseCSV = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const rows = text.split('\n').filter(row => row.trim() !== "");
      const headers = rows[0].split(',').map(h => h.trim());
      
      const data = rows.slice(1).map(row => {
        const values = row.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        let obj = {};
        headers.forEach((header, i) => { obj[header] = values[i]; });
        return obj;
      });
      resolve(data);
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
};