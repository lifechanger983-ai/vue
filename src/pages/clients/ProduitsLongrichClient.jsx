import { useEffect, useState, useCallback } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Search, ZoomIn } from 'lucide-react';
import api from '../../api/axiosConfig';

import { useCart } from '../../pages/clients/CartContext'; // AJOUTER EN HAUT

const ProduitsLongrichClient = () => {
  const { urlBoutique } = useParams();
  const { boutiqueConfig } = useOutletContext();
  // Dans le composant :
const { dispatch } = useCart();
  const [produitsParCategorie, setProduitsParCategorie] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategorie, setActiveCategorie] = useState(null);
  

  // ÉTAT MODAL ZOOM AVANCÉ
  const [imageModal, setImageModal] = useState({ 
    open: false, 
    src: '', 
    alt: '',
    scale: 1,
    rotation: 0,
    positionX: 0,
    positionY: 0
  });

  // ✅ HANDLER OUVERTURE MODAL - CRITIQUE
  const openImageModal = useCallback((src, alt) => {
    console.log('🖼️ Ouverture modal zoom:', src, alt); // DEBUG
    setImageModal({ 
      open: true, 
      src, 
      alt,
      scale: 1,
      rotation: 0, 
      positionX: 0, 
      positionY: 0 
    });
  }, []);

  // ✅ GESTIONNAIRES ZOOM PRO - TOUS useCallback
  const resetTransform = useCallback(() => {
    setImageModal(prev => ({ 
      ...prev, 
      scale: 1, 
      rotation: 0, 
      positionX: 0, 
      positionY: 0 
    }));
  }, []);

  const zoomIn = useCallback(() => {
    setImageModal(prev => ({ 
      ...prev, 
      scale: Math.min(prev.scale + 0.2, 3) 
    }));
  }, []);

  const zoomOut = useCallback(() => {
    setImageModal(prev => ({ 
      ...prev, 
      scale: Math.max(prev.scale - 0.2, 0.5) 
    }));
  }, []);

  const rotateLeft = useCallback(() => {
    setImageModal(prev => ({ 
      ...prev, 
      rotation: prev.rotation - 90 
    }));
  }, []);

  const rotateRight = useCallback(() => {
    setImageModal(prev => ({ 
      ...prev, 
      rotation: prev.rotation + 90 
    }));
  }, []);

  // ✅ TOUCHES CLAVIER - DÉPENDANCES CORRIGÉES
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!imageModal.open) return;
      
      console.log('⌨️ Touche:', e.key); // DEBUG
      
      switch(e.key) {
        case 'Escape':
          setImageModal({ open: false, src: '', alt: '', scale: 1, rotation: 0, positionX: 0, positionY: 0 });
          break;
        case '+':
        case '=':
          e.preventDefault();
          zoomIn();
          break;
        case '-':
          e.preventDefault();
          zoomOut();
          break;
        case 'ArrowLeft':
          setImageModal(prev => ({ ...prev, positionX: prev.positionX - 20 }));
          break;
        case 'ArrowRight':
          setImageModal(prev => ({ ...prev, positionX: prev.positionX + 20 }));
          break;
        case 'ArrowUp':
          setImageModal(prev => ({ ...prev, positionY: prev.positionY - 20 }));
          break;
        case 'ArrowDown':
          setImageModal(prev => ({ ...prev, positionY: prev.positionY + 20 }));
          break;
      }
    };

    if (imageModal.open) {
      window.addEventListener('keydown', handleKeyDown);
    }
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [imageModal.open, zoomIn, zoomOut]);

  useEffect(() => {
    const fetchProduitsLongrich = async () => {
      try {
        setLoading(true);
        console.log('🛒 Chargement PRODUITS LONGRICH:', urlBoutique);
        
        const { data } = await api.get(`/boutique/${urlBoutique}/produits-longrich`);
        console.log('✅ Produits Longrich:', data);
        
        const grouped = data.reduce((acc, produit) => {
          const cat = produit.categorie || 'sans_categorie';
          if (!acc[cat]) acc[cat] = [];
          acc[cat].push(produit);
          return acc;
        }, {});
        
        setProduitsParCategorie(grouped);
        
        const categories = Object.keys(grouped);
        if (categories.length > 0) {
          setActiveCategorie(categories[0]);
        }
      } catch (err) {
        console.error('❌ Produits Longrich ERREUR:', err.response?.data || err.message);
        setError(err.response?.data?.error || 'Erreur chargement produits Longrich');
      } finally {
        setLoading(false);
      }
    };

    if (boutiqueConfig?.activeProduitsLongrich) {
      fetchProduitsLongrich();
    } else {
      setError('Produits Longrich non activés');
      setLoading(false);
    }
  }, [urlBoutique, boutiqueConfig]);

const handleAddToCart = useCallback((produit) => {
  console.log('🛒 Ajout panier Longrich:', produit);
  
  // ✅ AJOUT AU CONTEXTE
  dispatch({ 
    type: 'ADD_ITEM', 
    payload: produit 
  });
  
  // Prix affiché
  const prixAffiche = produit.promoActive && produit.prixPromo > 0 
    ? produit.prixPromo 
    : produit.prixClient;
    
  // Notification améliorée
  const notification = document.createElement('div');
  notification.innerHTML = `
    <div class="fixed top-6 right-6 z-[10002] bg-emerald-500 text-white px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-sm border border-emerald-400/50 animate-in slide-in-from-right-4 fade-in duration-300 max-w-sm">
      <div class="flex items-center gap-3">
        <div class="w-3 h-12 bg-white/30 rounded-full animate-pulse"></div>
        <div>
          <p class="font-bold text-lg">${produit.nom}</p>
          <p class="text-sm opacity-90">${prixAffiche?.toLocaleString()} FCFA ajouté !</p>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 4000);
}, [dispatch]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center py-20">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-[var(--boutique-primary)]/20 border-t-[var(--boutique-primary)] rounded-full animate-spin mx-auto mb-6" />
          <p className="text-xl text-slate-400">Catalogue Longrich...</p>
        </div>
      </div>
    );
  }

  if (error || Object.keys(produitsParCategorie).length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center py-20 text-center">
        <div className="w-24 h-24 mx-auto mb-8 bg-slate-800/50 rounded-3xl flex items-center justify-center border-2 border-slate-700/50">
          <svg className="w-12 h-12 text-slate-500" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-slate-400 mb-4">{error}</h2>
        <p className="text-slate-500 mb-8 max-w-md">Contactez le propriétaire</p>
        <a href={`/boutique/${urlBoutique}/services`} className="px-8 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold">
          ← Retour Services
        </a>
      </div>
    );
  }

  const categories = Object.keys(produitsParCategorie);

  return (
    <div className="space-y-16">
      {/* MODAL ZOOM INTERACTIF PRO - AFFICHÉE EN PREMIER */}
      {imageModal.open && (
        <div 
          className="fixed inset-0 z-[9999] bg-black/98 backdrop-blur-md flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              console.log('❌ Fermeture modal'); // DEBUG
              setImageModal({ open: false, src: '', alt: '', scale: 1, rotation: 0, positionX: 0, positionY: 0 });
            }
          }}
        >
          <div className="relative max-w-6xl max-h-[95vh] w-full h-full flex flex-col items-center justify-center">
            
            {/* CONTENU PRINCIPAL IMAGE */}
            <div className="relative flex-1 w-full h-full flex items-center justify-center overflow-hidden rounded-3xl">
              <div 
                className="flex items-center justify-center cursor-grab active:cursor-grabbing max-w-full max-h-full touch-pan-x touch-pan-y"
                style={{
                  transform: `scale(${imageModal.scale}) rotate(${imageModal.rotation}deg) translate(${imageModal.positionX}px, ${imageModal.positionY}px)`
                }}
                draggable={false}
              >
                <img
                  src={imageModal.src}
                  alt={imageModal.alt}
                  className="max-w-full max-h-full object-contain shadow-2xl rounded-2xl select-none"
                  draggable={false}
                />
              </div>

              {/* OVERLAY ACTIONS */}
              <div className="absolute top-6 left-6 right-6 flex gap-3 justify-between z-30">
                {/* BOUTONS GAUCHE - ZOOM */}
                <div className="flex gap-2 bg-white/95 backdrop-blur-xl p-3 rounded-3xl shadow-2xl border border-white/50">
                  <button
                    onClick={zoomIn}
                    className="p-2 hover:bg-emerald-100 rounded-2xl transition-all hover:scale-110 active:scale-95"
                    title="Zoom avant (+)"
                  >
                    <ZoomIn className="w-5 h-5 text-emerald-600" />
                  </button>
                  <button
                    onClick={zoomOut}
                    className="p-2 hover:bg-orange-100 rounded-2xl transition-all hover:scale-110 active:scale-95"
                    title="Zoom arrière (-)"
                  >
                    <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"/>
                    </svg>
                  </button>
                  <button
                    onClick={resetTransform}
                    className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-xs font-bold rounded-2xl transition-all hover:scale-105 active:scale-95"
                    title="Réinitialiser (R)"
                  >
                    ↺
                  </button>
                </div>

                {/* BOUTONS DROITE - ROTATION */}
                <div className="flex gap-2 bg-white/95 backdrop-blur-xl p-3 rounded-3xl shadow-2xl border border-white/50">
                  <button
                    onClick={rotateLeft}
                    className="p-2 hover:bg-blue-100 rounded-2xl transition-all hover:scale-110 active:scale-95"
                    title="Rotation gauche (Q)"
                  >
                    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 6l-5.5 5.5 5.5 5.5"/>
                    </svg>
                  </button>
                  <button
                    onClick={rotateRight}
                    className="p-2 hover:bg-blue-100 rounded-2xl transition-all hover:scale-110 active:scale-95"
                    title="Rotation droite (E)"
                  >
                    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 18l5.5-5.5-5.5-5.5"/>
                    </svg>
                  </button>
                </div>
              </div>

              {/* BOUTON FERMER */}
              <button
                className="absolute top-6 right-6 p-3 bg-white/95 hover:bg-white/100 rounded-3xl shadow-2xl backdrop-blur-xl transition-all hover:scale-110 active:scale-95 z-40 border border-white/50"
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('❌ Fermer modal'); // DEBUG
                  setImageModal({ open: false, src: '', alt: '', scale: 1, rotation: 0, positionX: 0, positionY: 0 });
                }}
              >
                <svg className="w-6 h-6 text-slate-800" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            {/* BARRE INFO INFÉRIEURE */}
            <div className="w-full p-4 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl mt-6 border border-white/50">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="font-mono bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full text-xs font-bold">
                    Zoom: {Math.round(imageModal.scale * 100)}%
                  </span>
                  <span className="font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-bold">
                    Rotation: {imageModal.rotation}°
                  </span>
                  <div className="flex gap-2 text-xs text-slate-600 font-medium">
                    <kbd className="bg-slate-200 px-1.5 py-0.5 rounded">←→↑↓</kbd> Déplacer
                    <kbd className="bg-slate-200 px-1.5 py-0.5 rounded">+/-</kbd> Zoom
                    <kbd className="bg-slate-200 px-1.5 py-0.5 rounded">Esc</kbd> Fermer
                  </div>
                </div>
                <div className="text-slate-800 font-semibold max-w-md truncate bg-slate-100 px-3 py-1 rounded-full text-sm">
                  {imageModal.alt}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="text-center space-y-6">
        <div className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[var(--boutique-primary)]/10 to-emerald-500/10 backdrop-blur-sm rounded-3xl border border-[var(--boutique-primary)]/20">
          <div className="w-3 h-12 bg-gradient-to-b from-[var(--boutique-primary)] to-emerald-500 rounded-full" />
          <h1 className="text-5xl font-black bg-gradient-to-r from-[var(--boutique-primary)] via-emerald-400 to-teal-500 bg-clip-text text-transparent tracking-tight">
            Longrich Authentique
          </h1>
        </div>
        <div>
          <p className="text-2xl text-slate-300 font-semibold mb-2">
            {Object.values(produitsParCategorie).flat().length} produits
          </p>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Prix client • Promotions actives • <span className="font-bold text-[var(--boutique-primary)] text-lg">👆 Cliquez images = ZOOM PRO</span>
          </p>
        </div>
      </div>

      {/* Navigation Catégories */}
      <nav className="flex flex-wrap gap-3 justify-center max-w-4xl mx-auto">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategorie(cat)}
            className={`px-6 py-3 rounded-2xl font-semibold transition-all shadow-lg capitalize whitespace-nowrap ${
              activeCategorie === cat
                ? 'bg-gradient-to-r from-[var(--boutique-primary)] to-emerald-500 text-white shadow-[var(--boutique-primary)]/30 scale-105'
                : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700 border border-slate-700/50 hover:border-slate-600 hover:text-white'
            }`}
          >
            {cat.replace(/_/g, ' ')}
            <span className="ml-2 text-xs opacity-75">
              ({produitsParCategorie[cat].length})
            </span>
          </button>
        ))}
      </nav>

      {/* Grille Active - CLIC SUR IMAGE CORRIGÉ */}
      {activeCategorie && (
        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-2 h-12 bg-gradient-to-b from-[var(--boutique-primary)] to-emerald-500 rounded-full" />
              <h3 className="text-3xl font-black text-slate-100 capitalize tracking-tight">
                {activeCategorie.replace(/_/g, ' ')}
              </h3>
            </div>
            <span className="text-sm text-slate-500 bg-slate-800/50 px-4 py-2 rounded-xl">
              {produitsParCategorie[activeCategorie].length} produits
            </span>
          </div>
          
          {/* NOTICE ZOOM PRO */}
          <div className="bg-gradient-to-r from-blue-500/15 to-emerald-500/15 border border-blue-500/30 backdrop-blur-sm rounded-3xl p-6 text-center max-w-3xl mx-auto shadow-2xl">
            <ZoomIn className="w-10 h-10 text-blue-500 mx-auto mb-4 animate-pulse drop-shadow-lg" />
            <p className="text-xl font-bold text-slate-100 mb-2">
              🔍 <span className="text-blue-400">ZOOM PRO ACTIVÉ</span>
            </p>
            <p className="text-lg font-semibold text-slate-200">
              Cliquez sur **chaque image** pour l'agrandir en haute qualité avec zoom, rotation et déplacement
            </p>
            <p className="text-sm text-blue-300 mt-2 font-medium">Flèches + molette souris + clavier = contrôle total</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
            {produitsParCategorie[activeCategorie].map((produit) => (
              <div
                key={produit.id}
                className="group relative bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-2xl hover:shadow-3xl hover:-translate-y-3 transition-all duration-500 border-2 border-white/50 hover:border-[var(--boutique-primary)]/40 overflow-hidden hover:scale-[1.03] cursor-pointer"
              >
                {/* ÉTIQUETTE PROMO */}
                {produit.promoActive && produit.prixPromo > 0 && (
                  <div className="absolute top-4 left-4 z-20">
                    <span className="bg-gradient-to-br from-red-500 to-pink-600 text-white text-xs font-black px-4 py-2 rounded-full shadow-2xl transform rotate-[-10deg] -translate-x-2 -translate-y-2 border-2 border-white/50">
                      🔥 PROMO
                    </span>
                  </div>
                )}

                {/* ✅ IMAGE PRINCIPALE - CLIC GARANTI */}
                <div 
                  className="relative mb-6 h-64 w-full overflow-hidden rounded-3xl group-hover:rounded-[1.5rem] transition-all duration-500 bg-gradient-to-br from-slate-50/80 to-white/80 border-4 border-white shadow-3xl cursor-zoom-in hover:cursor-zoom-in hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)]"
                  onClick={() => openImageModal(produit.photo, produit.nom)} // ✅ CLIC DIRECT ICI
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      openImageModal(produit.photo, produit.nom);
                    }
                  }}
                >
                  <img
                    src={produit.photo}
                    alt={produit.nom}
                    className="w-full h-full object-cover group-hover:scale-115 transition-transform duration-700 hover:brightness-105 hover:contrast-110 select-none pointer-events-none"
                    draggable={false}
                    onError={(e) => {
                      e.target.src = '/placeholder-product.jpg';
                    }}
                  />
                  
                  {/* Icône zoom PRO - SUR L'IMAGE */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-400 flex items-center justify-center backdrop-blur-sm">
                    <div className="bg-white/98 backdrop-blur-2xl p-5 rounded-3xl shadow-3xl hover:bg-white hover:scale-110 transition-all duration-300 border-2 border-white/60 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
                      <ZoomIn className="w-10 h-10 text-[var(--boutique-primary)] drop-shadow-2xl mb-2" />
                      <div className="text-xs font-black text-slate-800 uppercase tracking-wider text-center">
                        ZOOM PRO
                      </div>
                      <div className="text-[10px] text-slate-500 font-medium mt-1">Cliquez !</div>
                    </div>
                  </div>
                </div>

                {/* Infos produit */}
                <div className="space-y-3 pt-2">
                  <h4 className="font-black text-xl text-slate-900 leading-tight line-clamp-2 group-hover:text-[var(--boutique-primary)] transition-all duration-300 text-center">
                    {produit.nom}
                  </h4>
                  
                  {/* Prix avec promo */}
                  <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 justify-center">
                    {produit.promoActive && produit.prixPromo > 0 ? (
                      <>
                        <span className="text-2xl font-black text-emerald-600 drop-shadow-lg">
                          {produit.prixPromo?.toLocaleString()} <span className="text-sm">FCFA</span>
                        </span>
                        <span className="text-lg text-slate-500 line-through font-medium text-sm">
                          {produit.prixClient?.toLocaleString()} FCFA
                        </span>
                      </>
                    ) : (
                      <span className="text-2xl font-black text-[var(--boutique-primary)] drop-shadow-lg">
                        {produit.prixClient?.toLocaleString()} <span className="text-sm">FCFA</span>
                      </span>
                    )}
                  </div>

                  {/* Bouton ajouter au panier */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // ✅ EMPÊCHE MODAL
                      handleAddToCart(produit);
                    }}
                    className="w-full bg-gradient-to-r from-[var(--boutique-primary)] to-emerald-500 hover:from-[var(--boutique-primary)]/90 hover:to-emerald-600 text-white font-black py-4 px-6 rounded-3xl shadow-2xl hover:shadow-3xl hover:scale-105 active:scale-95 transition-all duration-300 uppercase tracking-wider text-sm border border-transparent hover:border-white/20"
                  >
                    🛒 Ajouter au panier
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProduitsLongrichClient;