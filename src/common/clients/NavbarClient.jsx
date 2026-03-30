import { ShoppingCart, Store } from 'lucide-react';
import { Link } from 'react-router-dom';

const NavbarClient = ({ boutiqueName, activeCategories }) => (
  <header className="w-full border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
    <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
      <Link to={`/boutique/${window.location.pathname.split('/').pop()}`} className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-[var(--boutique-primary)] flex items-center justify-center text-white font-bold text-lg">
          {boutiqueName?.charAt(0)?.toUpperCase()}
        </div>
        <div>
          <h1 className="text-white font-bold text-xl">{boutiqueName}</h1>
          <p className="text-xs text-slate-400">Boutique Longrich</p>
        </div>
      </Link>
      
      <div className="flex items-center gap-4">
        {activeCategories.activeProduitsLongrich && (
          <Link to="produits-longrich" className="px-4 py-2 bg-[var(--boutique-primary)]/10 text-[var(--boutique-primary)] rounded-xl text-sm font-medium hover:bg-[var(--boutique-primary)]/20">
            Produits
          </Link>
        )}
        {activeCategories.activeSante && (
          <Link to="packs-sante" className="px-4 py-2 bg-blue-500/10 text-blue-400 rounded-xl text-sm font-medium hover:bg-blue-500/20">
            Packs Santé
          </Link>
        )}
        {activeCategories.activeAutresProduits && (
          <Link to="autres-produits" className="px-4 py-2 bg-purple-500/10 text-purple-400 rounded-xl text-sm font-medium hover:bg-purple-500/20">
            Autres
          </Link>
        )}
        
        <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-xl transition-all">
          <ShoppingCart className="w-5 h-5" />
        </button>
      </div>
    </div>
  </header>
);

export default NavbarClient;
