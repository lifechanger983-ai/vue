import { ShoppingCart, Heart } from 'lucide-react';

const ProductCard = ({ produit, onAddToCart }) => {
  const prixFinal = produit.promoActive && produit.prixPromo 
    ? produit.prixPromo 
    : produit.prixClient;

  return (
    <div className="group bg-gradient-to-b from-slate-900/90 to-slate-900/50 border border-slate-800/50 backdrop-blur-sm rounded-3xl overflow-hidden hover:border-[var(--boutique-primary)] hover:shadow-2xl hover:shadow-[var(--boutique-primary)]/25 transition-all duration-500 flex flex-col h-full hover:-translate-y-2">
      {/* Image + Badges */}
      <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-slate-900/50 to-slate-800 overflow-hidden p-4">
        <img 
          src={produit.photo} 
          alt={produit.nom}
          className="w-full h-48 object-cover rounded-2xl group-hover:scale-110 transition-transform duration-500 absolute inset-0 brightness-75 group-hover:brightness-100"
          loading="lazy"
        />
        
        {/* Badges */}
        <div className="absolute top-4 right-4 space-y-1">
          {produit.promoActive && (
            <span className="bg-gradient-to-r from-red-500/90 to-pink-500/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full shadow-2xl border border-red-500/50">
              -{Math.round((1 - produit.prixPromo / produit.prixClient) * 100)}%
            </span>
          )}
          <button className="p-2 bg-white/10 hover:bg-white/20 rounded-2xl transition-all group-hover:scale-110">
            <Heart className="w-4 h-4 text-slate-300 group-hover:text-red-400" fill="currentColor" />
          </button>
        </div>
      </div>

      {/* Contenu */}
      <div className="p-6 flex flex-col gap-3 flex-1">
        <div>
          <h3 className="text-slate-50 font-bold text-lg line-clamp-2 leading-tight group-hover:text-[var(--boutique-primary)] transition-colors">
            {produit.nom}
          </h3>
          <p className="text-sm text-slate-400 leading-relaxed line-clamp-2 mt-1">
            {produit.description}
          </p>
        </div>
        
        {/* Prix + Action */}
        <div className="mt-auto space-y-3">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-black text-[var(--boutique-primary)] tracking-tight">
                {parseFloat(prixFinal).toLocaleString()} <span className="text-sm font-normal tracking-normal">FCFA</span>
              </span>
              {produit.prixClient !== prixFinal && (
                <span className="ml-2 text-sm text-slate-500 line-through font-normal">
                  {parseFloat(produit.prixClient).toLocaleString()} FCFA
                </span>
              )}
            </div>
          </div>
          
          <button
            onClick={() => onAddToCart(produit)}
            className="w-full group/btn flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-gradient-to-r from-[var(--boutique-primary)] to-emerald-600 hover:from-[var(--boutique-primary)]/90 hover:to-emerald-500 text-white font-bold text-base shadow-xl hover:shadow-2xl hover:shadow-[var(--boutique-primary)]/30 transition-all duration-300 group-hover/btn:scale-[1.02] active:scale-[0.98]"
          >
            <ShoppingCart className="w-5 h-5 group-hover/btn:-translate-x-1 transition-transform" />
            <span>Ajouter au panier</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
