import React from 'react';
import { Download } from 'lucide-react';
import api from '../../api/axiosConfig';

const ReceiptPDF = ({ commandeId, className = '' }) => {
  const handleDownload = async () => {
    try {
      const response = await api.get(`/client/commandes/recu/${commandeId}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = `recu-longrich-${commandeId.slice(-8)}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur téléchargement reçu:', error);
      alert('Erreur téléchargement reçu');
    }
  };

  return (
    <button
      onClick={handleDownload}
      className={`flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all ${className}`}
    >
      <Download className="w-5 h-5" />
      Télécharger reçu PDF
    </button>
  );
};

export default ReceiptPDF;