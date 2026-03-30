const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const downloadReceipt = (url, filename) => {
  const fullUrl = `${API_BASE.replace(/\/api$/, '')}${url}`;
  
  const link = document.createElement('a');
  link.href = fullUrl;
  link.download = filename;
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  console.log('📄 Reçu téléchargé:', fullUrl);
};

export const previewReceipt = (url) => {
  window.open(`${API_BASE.replace(/\/api$/, '')}${url}`, '_blank');
};
