import { useState } from 'react';
import { Settings, LogOut, ShoppingCart } from 'lucide-react';
import { useGreeting } from '../../utils/themeEngine';

const NavbarClient = ({ 
  clientInfo, 
  onLogout,
  boutiqueName 
}) => {
  const greeting = useGreeting();
  const [showThemeModal, setShowThemeModal] = useState(false);

  const prefix = clientInfo?.sexe === 'F' ? 'Mme' : 'M';

  return (
    <>
      <header className="w-full border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo Boutique */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[var(--boutique-primary)] flex items-center justify-center text-white font-bold text-lg">
              {boutiqueName?.charAt(0)?.toUpperCase() || 'B'}
            </div>
            <div>
              <h1 className="text-white font-bold text-xl">{boutiqueName}</h1>
              <p className="text-xs text-slate-400">Votre boutique préférée</p>
            </div>
          </div>

          {/* Salutation + Actions */}
          <div className="flex items-center gap-4">
            {clientInfo && (
              <div className="text-right hidden md:block">
                <p className="text-slate-200 font-semibold text-sm">
                  {greeting} {prefix}. {clientInfo.nom}
                </p>
                <p className="text-xs text-slate-500">Visiteur</p>
              </div>
            )}
            
            <button 
              onClick={() => setShowThemeModal(true)}
              className="p-2 text-slate-400 hover:text-[var(--boutique-primary)] hover:bg-slate-800/50 rounded-xl transition-all"
              title="Paramètres thème"
            >
              <Settings className="w-5 h-5" />
            </button>

            <button 
              onClick={onLogout}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all flex items-center gap-1"
              title="Déconnexion"
            >
              <LogOut className="w-5 h-5" />
            </button>

            <button className="p-3 bg-slate-800/50 hover:bg-slate-700 rounded-2xl text-slate-300 transition-all relative">
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-xs rounded-full flex items-center justify-center text-white font-bold">0</span>
            </button>
          </div>
        </div>
      </header>

      {/* Modal Thème */}
      {showThemeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-3xl p-8 max-w-sm w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                <Settings className="w-6 h-6 text-[var(--boutique-primary)]" />
                Gestion Thème
              </h3>
              <button 
                onClick={() => setShowThemeModal(false)}
                className="p-2 hover:bg-slate-800 rounded-xl transition-all"
              >
                <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            
            <div className="space-y-4 text-sm">
              <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700">
                <p className="text-slate-300 mb-2">Thème actuel :</p>
                <div className="flex items-center gap-3 text-xs">
                  <div className="w-8 h-8 rounded-lg bg-[var(--boutique-primary)] border-2 border-white/20" />
                  <span className="font-mono text-emerald-400">Primaire: #10b981</span>
                </div>
                <div className="flex items-center gap-3 text-xs mt-2">
                  <div className="w-8 h-8 rounded-lg bg-[var(--boutique-secondary)] border-2 border-white/20" />
                  <span className="font-mono text-slate-400">Secondaire: #0f172a</span>
                </div>
              </div>
              <p className="text-xs text-slate-500">Personnalisation avancée disponible Vague 9</p>
              <button 
                onClick={() => setShowThemeModal(false)}
                className="w-full px-6 py-3 bg-[var(--boutique-primary)] hover:bg-[var(--boutique-primary)]/90 text-white rounded-2xl font-semibold transition-all shadow-lg hover:shadow-xl"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NavbarClient;
