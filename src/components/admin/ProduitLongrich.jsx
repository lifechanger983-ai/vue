import { Package, ShieldCheck, Zap } from 'lucide-react';
import ProduitTable from './ProduitTable';

const ProduitLongrich = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900/50 to-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Hero Header RESPONSIVE */}
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          <div className="inline-flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 p-6 sm:p-8 lg:p-10 rounded-3xl mb-8 sm:mb-12 backdrop-blur-xl shadow-2xl mx-4 sm:mx-0">
            {/* Icône gauche */}
            <Package className="w-12 h-12 sm:w-16 sm:h-16 text-emerald-400 flex-shrink-0 mx-auto sm:mx-0" />
            
            {/* Titre & Description */}
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 bg-clip-text text-transparent mb-2 sm:mb-4 leading-tight">
                Gestion Produits
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-slate-300 max-w-md sm:max-w-lg lg:max-w-2xl mx-auto sm:mx-0 leading-relaxed">
                Catalogue complet Longrich avec Cloudinary, prix promo dynamiques et gestion PV en temps réel
              </p>
            </div>
            
            {/* Icône droite */}
            <div className="flex items-center justify-center">
              <div className="relative">
                <ShieldCheck className="w-12 h-12 sm:w-16 sm:h-16 text-emerald-400 animate-pulse" />
                <Zap className="w-6 h-6 text-emerald-300 absolute -top-1 -right-1 animate-ping" />
              </div>
            </div>
          </div>

          {/* Stats rapides (optionnel) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div className="glass-card p-4 sm:p-6 text-center">
              <div className="text-2xl sm:text-3xl font-black text-emerald-400 mb-1">0</div>
              <div className="text-xs sm:text-sm text-slate-400 uppercase tracking-wide font-bold">Produits actifs</div>
            </div>
            <div className="glass-card p-4 sm:p-6 text-center">
              <div className="text-2xl sm:text-3xl font-black text-teal-400 mb-1">0 CFA</div>
              <div className="text-xs sm:text-sm text-slate-400 uppercase tracking-wide font-bold">CA Prévu</div>
            </div>
            <div className="glass-card p-4 sm:p-6 text-center">
              <div className="text-2xl sm:text-3xl font-black text-purple-400 mb-1">0</div>
              <div className="text-xs sm:text-sm text-slate-400 uppercase tracking-wide font-bold">Points PV</div>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="glass-card shadow-2xl">
          <ProduitTable />
        </div>
      </div>
    </div>
  );
};

export default ProduitLongrich;