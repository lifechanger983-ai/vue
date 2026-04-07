import { Link } from 'react-router-dom';
import { Store, MapPin, ShoppingBag, ArrowRight } from 'lucide-react';

const DebutPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-orange-900/20">
      {/* Hero */}
      <div className="container mx-auto px-6 py-24 text-center">
        <div className="max-w-4xl mx-auto">
          <Store className="w-32 h-32 mx-auto mb-8 text-orange-400 drop-shadow-2xl" />
          
          <h1 className="text-5xl md:text-7xl font-black bg-gradient-to-r from-orange-400 via-amber-400 to-emerald-400 bg-clip-text text-transparent mb-6">
            Bienvenue sur Mega Ecommerce
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed">
            Tapez l'URL de votre <strong>BOUTIQUE</strong> ou <strong>SUPERMARCHÉ</strong> dans votre navigateur pour commencer
          </p>

          {/* Exemples */}
          <div className="grid md:grid-cols-3 gap-6 mb-20">
            <div className="glass-card p-8 text-center group hover:scale-105 transition-all">
              <MapPin className="w-16 h-16 mx-auto mb-4 text-emerald-400 group-hover:rotate-12 transition-all" />
              <h3 className="text-2xl font-bold text-white mb-2">Boutique Longrich</h3>
              <code className="text-lg font-mono bg-slate-800/50 px-4 py-2 rounded-xl text-orange-400 block mx-auto">
                longrich.vercel.app/b/mega123
              </code>
            </div>
            
            <div className="glass-card p-8 text-center group hover:scale-105 transition-all">
              <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-purple-400 group-hover:rotate-12 transition-all" />
              <h3 className="text-2xl font-bold text-white mb-2">Supermarché</h3>
              <code className="text-lg font-mono bg-slate-800/50 px-4 py-2 rounded-xl text-purple-400 block mx-auto">
                longrich.vercel.app/b/supermarche456
              </code>
            </div>
            
            <div className="glass-card p-8 text-center group hover:scale-105 transition-all">
              <ArrowRight className="w-16 h-16 mx-auto mb-4 text-amber-400 group-hover:rotate-12 transition-all" />
              <h3 className="text-2xl font-bold text-white mb-2">Votre lien</h3>
              <p className="text-slate-400 mb-4">Demandez votre URL personnalisée à votre distributeur</p>
              <span className="text-sm text-slate-500">Ex: mega/votre-nom</span>
            </div>
          </div>

          {/* Call to action */}
          <div className="glass-card p-12 text-center">
            <h2 className="text-3xl font-bold text-white mb-6">Prêt à commencer ?</h2>
            <p className="text-lg text-slate-300 mb-8 max-w-lg mx-auto">
              Ouvrez un nouvel onglet et tapez <br />
              <strong className="text-2xl font-mono text-orange-400">longrich.vercel.app/b/mega{votre-code}</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebutPage;
