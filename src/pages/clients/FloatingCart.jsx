import { useState, useRef, useEffect, useCallback } from 'react';  
import { useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, X, Minus, Plus, CreditCard, ArrowRight } from 'lucide-react';
import { useCart } from './CartContext';

const FloatingCart = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { cartState, dispatch } = useCart();
  const cartRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ EXTRAIT urlBoutique sécurisé
  const urlBoutique = location.pathname.split('/')[2] || 'rita';

  // ✅ onError + PLACEHOLDER LOCAL (fix timeout)
  const getImageSrc = useCallback((photo) => {
    if (!photo || photo.includes('placeholder.com')) {
      return '/placeholder-product.jpg';  
    }
    return photo;
  }, []);

  // Fermer au clic extérieur (optimisé)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cartRef.current && !cartRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const updateQuantity = useCallback((id, quantity) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  }, [dispatch]);

  const removeItem = useCallback((id) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { id } });
  }, [dispatch]);

  const clearCart = () => {
    if (window.confirm('Vider le panier ?')) {
      dispatch({ type: 'CLEAR_CART' });
    }
  };

  const handleCheckout = useCallback(() => {
    setIsOpen(false);
    console.log(`🚀 Redirection vers /boutique/${urlBoutique}/commande`);
    navigate(`/boutique/${urlBoutique}/commande`, { replace: true });
  }, [urlBoutique, navigate]);

  const totalItems = cartState.totalItems || 0;

  return (
    <>
      {/* BOUTON PANIER FLOTTANT */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-[10000] w-16 h-16 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-300 border-4 border-white/20 backdrop-blur-xl flex flex-col items-center justify-center text-white font-bold text-lg group ${
          totalItems > 0 
            ? 'bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-emerald-500/50 animate-pulse' 
            : 'bg-gradient-to-br from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 shadow-slate-500/50'
        }`}
        title={`${totalItems} article${totalItems !== 1 ? 's' : ''}`}
      >
        <ShoppingCart className="w-7 h-7 mb-1 group-hover:scale-110 transition-transform" />
        {totalItems > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-xs w-7 h-7 rounded-2xl flex items-center justify-center font-black shadow-lg border-2 border-white/50 animate-bounce">
            {totalItems}
          </span>
        )}
      </button>

      {/* PANIER MODAL - FIXÉ AVEC HAUTEUR ADAPTATIVE */}
      {isOpen && (
        <div 
          ref={cartRef}
          className="fixed bottom-28 right-6 w-96 h-[65vh] bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-slate-200/50 overflow-hidden z-[10001] animate-in slide-in-from-bottom-4 duration-300 flex flex-col"
        >
          {/* HEADER FIXE */}
          <div className="p-6 bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-b border-emerald-400/30 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-8 h-8" />
                <div>
                  <h3 className="text-xl font-black">Mon Panier ({urlBoutique})</h3>
                  <p className="text-sm opacity-90">{totalItems} article{totalItems !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/20 rounded-2xl transition-all hover:scale-110"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* CONTENU SCROLLABLE - UNIQUEMENT LES PRODUITS */}
          <div className="flex-1 overflow-y-auto px-4 py-4 custom-scrollbar max-h-max">
            {cartState.items.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-slate-400" />
                <p className="text-lg font-semibold">Panier vide</p>
                <p className="text-sm">Ajoutez des produits depuis le catalogue</p>
              </div>
            ) : (
              cartState.items.map((item) => {
                const prix = item.promoActive && item.prixPromo > 0 ? item.prixPromo : item.prixClient;
                const sousTotal = prix * item.quantity;
                
                return (
                  <div key={item.id} className="flex gap-4 p-4 bg-slate-50/50 rounded-2xl mb-3 hover:bg-slate-100 transition-all border border-slate-200/50 last:mb-0">
                    <img 
                      src={getImageSrc(item.photo)}
                      alt={item.nom}
                      className="w-20 h-20 object-cover rounded-xl shadow-md flex-shrink-0"
                      loading="lazy"
                      onError={(e) => {
                        console.log('🖼️ Image fallback:', item.nom);
                        e.target.src = '/placeholder-product.jpg';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-900 text-sm leading-tight truncate">{item.nom}</h4>
                      <p className="text-xs text-slate-500 mb-2">{item.categorie?.replace(/_/g, ' ')}</p>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`font-bold text-sm ${item.promoActive ? 'text-emerald-600' : 'text-[var(--boutique-primary)]'}`}>
                          {prix?.toLocaleString()} FCFA
                          {item.promoActive && (
                            <span className="ml-1 text-xs text-slate-500 line-through">
                              {item.prixClient?.toLocaleString()}
                            </span>
                          )}
                        </span>
                        <span className="font-bold text-lg text-emerald-600">
                          {sousTotal.toLocaleString()} FCFA
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center bg-white px-3 py-2 rounded-xl border border-slate-300 shadow-sm">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 hover:bg-slate-100 rounded-lg transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-4 h-4 text-slate-600" />
                          </button>
                          <span className="w-8 text-center font-bold text-lg mx-2 select-none">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 hover:bg-slate-100 rounded-lg transition-all hover:scale-110"
                          >
                            <Plus className="w-4 h-4 text-slate-600" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="ml-auto p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-all hover:scale-110"
                          title="Retirer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* FOOTER FIXE EN BAS - TOUJOURS VISIBLE */}
          <div className="p-6 pt-0 bg-gradient-to-r from-slate-50 to-slate-100/50 border-t border-slate-200/50 flex-shrink-0">
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm font-semibold text-slate-700">
                <span>Total articles :</span>
                <span>{totalItems}</span>
              </div>
              <div className="flex justify-between text-xl font-black text-slate-900">
                <span>Total TTC :</span>
                <span className="text-emerald-600 text-2xl">
                  {cartState.totalAmount?.toLocaleString()} FCFA
                </span>
              </div>
            </div>
            
            <div className="flex gap-3 pt-4 border-t border-slate-200">
              <button
                onClick={clearCart}
                disabled={cartState.items.length === 0}
                className="flex-1 py-3 px-4 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-2xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" />
                Vider
              </button>
              <button
                disabled={cartState.items.length === 0}
                onClick={handleCheckout}
                className="flex-1 py-3 px-6 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm uppercase tracking-wide group"
              >
                <CreditCard className="w-5 h-5" />
                <span>Passer commande</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export { FloatingCart };