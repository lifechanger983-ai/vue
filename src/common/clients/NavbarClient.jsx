import { useState, useEffect } from 'react';
import { Settings, LogOut, ShoppingCart, Palette, MessageCircle } from 'lucide-react';
import { useGreeting, applyTheme } from '../../utils/themeEngine';

const NavbarClient = ({ 
  clientInfo, 
  onLogout,
  boutiqueName 
}) => {
  const greeting = useGreeting();
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [currentTheme, setCurrentTheme] = useState({
    primaire: '#10b981',
    secondaire: '#0f172a'
  });
  const [customPrimary, setCustomPrimary] = useState('#10b981');
  const [customSecondary, setCustomSecondary] = useState('#0f172a');

  const prefix = clientInfo?.sexe === 'F' ? 'Mme' : 'M';
  const whatsappUrl = import.meta.env.VITE_WHATSAPP_GROUPE || 'https://chat.whatsapp.com/Fsf4HQAsq0W5E6JxdvwedW?mode=gi_t';

  // Thèmes prédéfinis
  const themesPreset = [
    { name: 'Émeraude', primaire: '#10b981', secondaire: '#0f172a' },
    { name: 'Violet', primaire: '#8b5cf6', secondaire: '#1e1b4b' },
    { name: 'Orange', primaire: '#f59e0b', secondaire: '#1f2937' },
    { name: 'Rose', primaire: '#ec4899', secondaire: '#581c87' },
    { name: 'Bleu', primaire: '#3b82f6', secondaire: '#1e3a8a' }
  ];

  // Appliquer thème personnalisé
  const applyCustomTheme = () => {
    const newTheme = {
      primaire: customPrimary,
      secondaire: customSecondary
    };
    setCurrentTheme(newTheme);
    applyTheme(newTheme);
    localStorage.setItem('boutiqueTheme', JSON.stringify(newTheme));
    setShowThemeModal(false);
  };

  // Charger thème sauvegardé
  useEffect(() => {
    const saved = localStorage.getItem('boutiqueTheme');
    if (saved) {
      const theme = JSON.parse(saved);
      setCurrentTheme(theme);
      applyTheme(theme);
      setCustomPrimary(theme.primaire);
      setCustomSecondary(theme.secondaire);
    }
  }, []);

  // Appliquer thème prédéfini
  const applyPresetTheme = (theme) => {
    setCurrentTheme(theme);
    setCustomPrimary(theme.primaire);
    setCustomSecondary(theme.secondaire);
    applyTheme(theme);
    localStorage.setItem('boutiqueTheme', JSON.stringify(theme));
  };

  return (
    <>
      <header className="w-full border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col lg:flex-row items-center justify-between gap-4 lg:gap-0">
          {/* Logo Boutique */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[var(--boutique-primary)] flex items-center justify-center text-white font-bold text-lg shadow-lg">
              {boutiqueName?.charAt(0)?.toUpperCase() || 'B'}
            </div>
            <div>
              <h1 className="text-white font-bold text-xl">{boutiqueName}</h1>
              <p className="text-xs text-slate-400">Votre boutique préférée</p>
            </div>
          </div>

          {/* ✅ NOTICE SERVICE CLIENT (Mobile + Desktop) */}
          <div className="w-full lg:w-auto">
            <div className="flex items-center gap-2 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl px-3 py-2 backdrop-blur-sm shadow-lg mx-auto lg:mx-0 text-center lg:text-left">
              <MessageCircle className="w-4 h-4 text-green-400 flex-shrink-0 animate-pulse lg:w-5 lg:h-5" />
              <p className="text-xs text-green-100 font-medium leading-tight">
                📱 <span className="font-bold">Service Client 24/7</span> : Groupe WhatsApp suivi commande & support
              </p>
            </div>
          </div>

          {/* Actions Client */}
          <div className="flex items-center gap-2 md:gap-4">
            {clientInfo && (
              <div className="text-right hidden md:block">
                <p className="text-slate-200 font-semibold text-sm">
                  {greeting} {prefix}. {clientInfo.nom}
                </p>
                <p className="text-xs text-slate-500">Client connecté</p>
              </div>
            )}
            
            {/* ✅ WHATSAPP SERVICE CLIENT */}
            <a 
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:scale-110 hover:rotate-3 group relative z-10"
              title="Service Client WhatsApp - Suivi commande & support instantané"
            >
              <MessageCircle className="w-5 h-5 group-hover:animate-bounce" />
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900/95 backdrop-blur-sm text-white text-xs px-3 py-2 rounded-2xl opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all whitespace-nowrap shadow-2xl border border-green-500/30 z-50 pointer-events-none before:absolute before:-bottom-1 before:left-1/2 before:-translate-x-1/2 before:rotate-45 before:w-2 before:h-2 before:bg-slate-900/95">
                💬 Support 24/7
              </div>
            </a>

            {/* Thème */}
            <button 
              onClick={() => setShowThemeModal(true)}
              className="p-2 text-slate-400 hover:text-[var(--boutique-primary)] hover:bg-slate-800/50 rounded-xl transition-all relative group"
              title="Personnaliser le thème"
            >
              <Settings className="w-5 h-5" />
              <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap z-50">
                Thème
              </span>
            </button>

            {/* Déconnexion */}
            <button 
              onClick={onLogout}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all flex items-center gap-1"
              title="Déconnexion"
            >
              <LogOut className="w-5 h-5" />
            </button>

            {/* Panier */}
            <button className="p-3 bg-slate-800/50 hover:bg-slate-700 rounded-2xl text-slate-300 transition-all relative group">
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-xs rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                0
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* MODAL PERSONNALISATION THÈME */}
      {showThemeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="bg-slate-900/95 backdrop-blur-2xl border border-slate-700/50 rounded-3xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-700">
              <h3 className="text-2xl font-black text-white flex items-center gap-3">
                <Palette className="w-8 h-8 text-[var(--boutique-primary)]" />
                Personnaliser Thème
              </h3>
              <button 
                onClick={() => setShowThemeModal(false)}
                className="p-2 hover:bg-slate-800/50 rounded-2xl transition-all hover:scale-110"
              >
                <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            
            {/* Thèmes prédéfinis */}
            <div className="mb-8">
              <h4 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
                🎨 Thèmes rapides
              </h4>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                {themesPreset.map((theme, idx) => (
                  <button
                    key={idx}
                    onClick={() => applyPresetTheme(theme)}
                    className={`p-3 rounded-2xl border-2 transition-all hover:scale-105 shadow-lg ${
                      currentTheme.primaire === theme.primaire 
                        ? 'border-[var(--boutique-primary)] shadow-[var(--boutique-primary)]/25 ring-2 ring-[var(--boutique-primary)]/50 scale-105'
                        : 'border-slate-700/50 hover:border-slate-600 hover:shadow-xl'
                    }`}
                  >
                    <div className="w-full h-12 rounded-xl mb-2" 
                         style={{ 
                           background: `linear-gradient(135deg, ${theme.primaire}, ${theme.secondaire})`
                         }} 
                    />
                    <p className="text-xs text-center font-semibold text-white truncate">{theme.name}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Personnalisation avancée */}
            <div>
              <h4 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
                ⚙️ Couleurs personnalisées
              </h4>
              
              <div className="space-y-4">
                {/* Primaire */}
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Couleur principale</label>
                  <div className="flex gap-3 items-center">
                    <input
                      type="color"
                      value={customPrimary}
                      onChange={(e) => setCustomPrimary(e.target.value)}
                      className="w-12 h-12 rounded-xl border-2 border-slate-600 shadow-lg cursor-pointer hover:shadow-xl transition-all"
                    />
                    <input
                      type="text"
                      value={customPrimary}
                      onChange={(e) => {
                        setCustomPrimary(e.target.value);
                        setCurrentTheme(prev => ({ ...prev, primaire: e.target.value }));
                      }}
                      className="flex-1 px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-xl text-sm font-mono focus:ring-2 focus:ring-[var(--boutique-primary)] focus:border-transparent transition-all"
                      placeholder="#10b981"
                    />
                  </div>
                </div>

                {/* Secondaire */}
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Couleur secondaire</label>
                  <div className="flex gap-3 items-center">
                    <input
                      type="color"
                      value={customSecondary}
                      onChange={(e) => setCustomSecondary(e.target.value)}
                      className="w-12 h-12 rounded-xl border-2 border-slate-600 shadow-lg cursor-pointer hover:shadow-xl transition-all"
                    />
                    <input
                      type="text"
                      value={customSecondary}
                      onChange={(e) => {
                        setCustomSecondary(e.target.value);
                        setCurrentTheme(prev => ({ ...prev, secondaire: e.target.value }));
                      }}
                      className="flex-1 px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-xl text-sm font-mono focus:ring-2 focus:ring-[var(--boutique-primary)] focus:border-transparent transition-all"
                      placeholder="#0f172a"
                    />
                  </div>
                </div>
              </div>

              {/* Aperçu */}
              <div className="mt-6 p-4 bg-gradient-to-r from-slate-800/30 to-slate-900/30 rounded-2xl border border-slate-700/50">
                <p className="text-xs text-slate-400 mb-3">Aperçu en temps réel :</p>
                <div className="flex gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--boutique-primary)] flex items-center justify-center text-white font-bold text-sm shadow-lg" />
                  <div className="w-12 h-12 rounded-2xl bg-[var(--boutique-secondary)] flex items-center justify-center text-slate-200 font-bold text-sm shadow-lg" />
                </div>
              </div>
            </div>

            {/* Boutons action */}
            <div className="flex gap-3 mt-8 pt-6 border-t border-slate-700">
              <button 
                onClick={() => setShowThemeModal(false)}
                className="flex-1 px-6 py-3 bg-slate-800/50 hover:bg-slate-700 border border-slate-700 rounded-2xl font-semibold text-slate-300 transition-all hover:text-white"
              >
                Annuler
              </button>
              <button 
                onClick={applyCustomTheme}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-[var(--boutique-primary)] to-emerald-600 hover:from-[var(--boutique-primary)]/90 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:scale-105"
              >
                Appliquer le thème
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NavbarClient;
