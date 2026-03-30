import { useState, useEffect } from 'react';
import { useParams, Outlet } from 'react-router-dom';
import api from '../../api/axiosConfig';
import NavbarClient from '../../common/clients/NavbarClient';
import { applyTheme } from '../../utils/themeEngine';

const BoutiqueLayout = () => {
  const { urlBoutique } = useParams();
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/boutique/${urlBoutique}/config`);
        setConfig(data);
        
        // Thème (couleurs par défaut)
        applyTheme({ 
          primaire: '#10b981', 
          secondaire: '#0f172a' 
        });
        
      } catch (err) {
        console.error('Boutique config:', err);
        setError('Boutique introuvable');
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, [urlBoutique]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-slate-700 border-t-[var(--boutique-primary)] rounded-full" />
      </div>
    );
  }

  if (error || !config) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="text-center max-w-md p-8">
          <Store className="w-20 h-20 text-slate-600 mx-auto mb-6" />
          <h1 className="text-2xl font-bold mb-4">Boutique introuvable</h1>
          <p className="text-slate-400 mb-8">Vérifiez l'URL ou contactez l'administrateur</p>
          <a href="/" className="inline-flex items-center gap-2 bg-[var(--boutique-primary)] text-white px-6 py-3 rounded-xl font-medium">
            ← Retour accueil
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <NavbarClient 
        boutiqueName={config.nom}
        activeCategories={config}
      />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Outlet context={{ config, urlBoutique }} />
      </main>
    </div>
  );
};

export default BoutiqueLayout;
