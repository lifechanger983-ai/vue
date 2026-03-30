import { ShoppingCart } from 'lucide-react';

const ProductCard = ({ produit, onAddToCart }) => (
  <div className="group bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden hover:border-[var(--boutique-primary)] hover:shadow-2xl transition-all hover:scale-[1.02]">
    <div className="relative w-full aspect-[4/3] bg-slate-800/50">
      <img 
        src={produit.photo} 
        alt={produit.nom}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
      />
      {produit.promoActive && (
        <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
          PROMO
        </span>
      )}
    </div>
    
    <div className="p-4 flex flex-col gap-2">
      <h3 className="font-semibold text-slate-100 text-sm line-clamp-2 leading-tight">
        {produit.nom}
      </h3>
      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
        {produit.description}
      </p>
      
      <div className="mt-auto flex items-center justify-between pt-2">
        <div>
          {produit.prixPromo && produit.promoActive ? (
            <>
              <span className="text-[var(--boutique-primary)] font-bold text-lg">
                {produit.prixPromo.toLocaleString()} FCFA
              </span>
              <span className="text-sm text-slate-500 line-through ml-2">
                {produit.prixClient.toLocaleString()} FCFA
              </span>
            </>
          ) : (
            <span className="text-[var(--boutique-primary)] font-bold text-lg">
              {produit.prixClient.toLocaleString()} FCFA
            </span>
          )}
        </div>
        
        <button 
          onClick={() => onAddToCart(produit)}
          className="flex items-center gap-1 px-3 py-2 bg-[var(--boutique-primary)] hover:bg-[var(--boutique-primary)]/90 text-white text-xs rounded-xl font-medium transition-all group-hover:scale-105"
        >
          <ShoppingCart className="w-4 h-4" />
          Ajouter
        </button>
      </div>
    </div>
  </div>
);

export default ProductCard;
