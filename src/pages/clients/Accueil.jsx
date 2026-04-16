import { useState, useEffect } from 'react';  // ✅ useEffect ajouté
import { useNavigate, useParams } from 'react-router-dom';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { ArrowRight, User, UserPlus } from 'lucide-react';

const Accueil = () => {
  const { urlBoutique } = useParams();
  const navigate = useNavigate();
  const [clientInfo, setClientInfo] = useLocalStorage('clientInfo', null);
  const [formData, setFormData] = useState({ nom: '', sexe: 'M' });
  const [loading, setLoading] = useState(false);

  // ✅ CORRECTION CRITIQUE : Redirection dans useEffect (ligne ~30)
  useEffect(() => {
    if (clientInfo?.urlBoutique === urlBoutique) {
      console.log('🔄 Redirection auto vers services (client connecté)');
      navigate(`/boutique/${urlBoutique}/services`, { replace: true });
    }
  }, [clientInfo, urlBoutique, navigate]);  // ✅ Dépendances complètes

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nom.trim()) return;
    
    setLoading(true);
    const clientData = { ...formData, urlBoutique };
    setClientInfo(clientData);
    
    // Redirection vers SERVICES (page principale)
    setTimeout(() => {
      console.log('✅ Client enregistré, redirection services');
      navigate(`/boutique/${urlBoutique}/services`, { replace: true });
      setLoading(false);
    }, 1500);
  };

  // ✅ SUPPRIMÉ : if (clientInfo...) navigate() direct causait l'erreur BrowserRouter
  // Le useEffect gère maintenant cette logique

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900/50 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[var(--boutique-primary)]/3 blur-3xl animate-pulse" />
      
      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="text-center space-y-4">
          <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-r from-[var(--boutique-primary)]/30 via-white/20 to-slate-800/50 rounded-3xl flex items-center justify-center border-4 border-[var(--boutique-primary)]/40 shadow-2xl backdrop-blur-xl">
            <UserPlus className="w-20 h-20 text-[var(--boutique-primary)] drop-shadow-2xl" />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-white via-slate-100 to-slate-200 bg-clip-text text-transparent mb-4 tracking-tight">
              Bienvenue !
            </h1>
            <p className="text-xl text-slate-300 max-w-sm mx-auto leading-relaxed">
              Entrez votre nom pour une expérience personnalisée
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-slate-900/60 backdrop-blur-xl border border-slate-800/60 rounded-3xl p-8 shadow-2xl shadow-black/30">
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-[var(--boutique-primary)]" />
              Nom complet
            </label>
            <input
              type="text"
              placeholder="Marie Dupont"
              value={formData.nom}
              onChange={(e) => setFormData({...formData, nom: e.target.value})}
              className="w-full p-5 bg-slate-800/50 border-2 border-slate-700/50 rounded-2xl text-white placeholder-slate-500 focus:ring-4 ring-[var(--boutique-primary)]/40 focus:border-[var(--boutique-primary)] transition-all text-lg font-semibold shadow-lg hover:shadow-[var(--boutique-primary)]/20"
              required
              disabled={loading}
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-300 mb-3">Salutation</label>
            <select
              value={formData.sexe}
              onChange={(e) => setFormData({...formData, sexe: e.target.value})}
              className="w-full p-5 bg-slate-800/50 border-2 border-slate-700/50 rounded-2xl text-white focus:ring-4 ring-[var(--boutique-primary)]/40 focus:border-[var(--boutique-primary)] transition-all text-lg font-semibold shadow-lg hover:shadow-[var(--boutique-primary)]/20"
              disabled={loading}
              required
            >
              <option value="M">👨 Homme (M.)</option>
              <option value="F">👩 Femme (Mme)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={!formData.nom.trim() || loading}
            className="w-full px-10 py-7 bg-gradient-to-r from-[var(--boutique-primary)] via-emerald-500 to-teal-600 hover:from-[var(--boutique-primary)]/95 hover:via-emerald-400 hover:to-teal-500 text-white rounded-3xl font-black text-xl shadow-2xl hover:shadow-3xl hover:shadow-[var(--boutique-primary)]/50 transition-all duration-500 hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
          >
            {loading ? (
              <>
                <div className="w-7 h-7 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Accès boutique...</span>
              </>
            ) : (
              <>
                <span>Entrer</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500">
          Données locales - session temporaire
        </p>
      </div>
    </div>
  );
};

export default Accueil;