import { useEffect, useState } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { applyTheme } from '../../utils/themeEngine';
import NavbarClient from '../../common/clients/NavbarClient';
import { useLocalStorage } from '../../hooks/useLocalStorage';

const BoutiqueLayout = () => {
  const { urlBoutique } = useParams();  // ✅ urlBoutique (route paramètre)
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clientInfo, setClientInfo] = useLocalStorage('clientInfo', null);

  useEffect(() => {
    const fetchConfig = async () => {
      if (!urlBoutique) {
        setError('URL boutique manquante');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('🔍 Chargement boutique:', urlBoutique);
        const { data } = await api.get(`/boutique/${urlBoutique}`);
        console.log('✅ Boutique chargée:', data);
        setConfig(data);
        if (data.theme) applyTheme(data.theme);
      } catch (err) {
        console.error('❌ Erreur boutique:', err.response?.data || err.message);
        if (err.response?.status === 404) {
          setError(`Boutique "${urlBoutique}" introuvable`);
        } else {
          setError('Erreur serveur boutique');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, [urlBoutique]);

  const handleLogout = () => {
    setClientInfo(null);
    window.location.href = `/boutique/${urlBoutique}`;  // ✅ urlBoutique partout
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-slate-700 border-t-[var(--boutique-primary)] rounded-full animate-spin mx-auto" />
          <div>
            <p className="text-xl text-slate-400">Chargement {urlBoutique?.toUpperCase()}</p>
            <p className="text-sm text-slate-600">Configuration boutique...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !config) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-28 h-28 mx-auto mb-8 bg-red-500/20 rounded-3xl flex items-center justify-center border-4 border-red-500/40 shadow-xl">
          <svg className="w-14 h-14 text-red-400" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
          </svg>
        </div>
        <h2 className="text-4xl font-black text-red-400 mb-6">{error}</h2>
        <p className="text-lg text-slate-400 mb-12 max-w-md mx-auto">
          Vérifiez l'URL ou contactez l'administrateur boutique
        </p>
        <div className="space-x-4">
          <a 
            href="/boutique/testboutique" 
            className="px-8 py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-2xl font-bold transition-all shadow-lg hover:shadow-xl inline-block"
          >
            ← Boutique Test
          </a>
          <a 
            href="/admin/login" 
            className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl font-semibold transition-all border border-slate-700 inline-block"
          >
            Admin
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-900 text-slate-100">
      {/* Navbar */}
      <NavbarClient
        clientInfo={clientInfo}
        onLogout={handleLogout}
        boutiqueName={config.nom}
      />
      
      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <Outlet context={{ 
          boutiqueConfig: config, 
          clientInfo, 
          setClientInfo 
        }} />
      </main>
    </div>
  );
};

export default BoutiqueLayout;