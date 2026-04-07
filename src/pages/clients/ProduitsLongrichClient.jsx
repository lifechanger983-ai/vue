import { useEffect, useState } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Search, ZoomIn } from 'lucide-react';
import api from '../../api/axiosConfig';

const ProduitsLongrichClient = () => {
  const { urlBoutique } = useParams();
  const { boutiqueConfig } = useOutletContext();
  const [produitsParCategorie, setProduitsParCategorie] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategorie, setActiveCategorie] = useState(null);
  
  // ÉTAT MODAL ZOOM
  const [imageModal, setImageModal] = useState({ open: false, src: '', alt: '' });

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

  const handleAddToCart = (produit) => {
    console.log('🛒 Ajout panier Longrich:', produit);
    const prixAffiche = produit.promoActive && produit.prixPromo > 0 
      ? produit.prixPromo 
      : produit.prixClient;
    alert(`✅ ${produit.nom} ajouté !\n💰 ${prixAffiche?.toLocaleString()} FCFA`);
  };

  // OUVERTURE MODAL ZOOM
  const openImageModal = (src, alt) => {
    setImageModal({ open: true, src, alt });
  };

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
      {/* MODAL ZOOM INTERACTIF */}
      {imageModal.open && (
        <div 
          className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setImageModal({ open: false, src: '', alt: '' })}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center">
            {/* Image zoomable */}
            <img
              src={imageModal.src}
              alt={imageModal.alt}
              className="max-w-full max-h-full object-contain cursor-zoom-in hover:scale-105 transition-transform duration-200"
              draggable={false}
            />
            
            {/* Bouton fermer */}
            <button
              className="absolute top-6 right-6 p-3 bg-white/90 hover:bg-white rounded-2xl shadow-2xl backdrop-blur-sm transition-all hover:scale-110 z-10"
              onClick={(e) => {
                e.stopPropagation();
                setImageModal({ open: false, src: '', alt: '' });
              }}
            >
              <ChevronLeft className="w-6 h-6 rotate-180 text-slate-900" />
            </button>
            
            {/* Notice */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm px-6 py-3 rounded-2xl shadow-2xl text-center max-w-md mx-4">
              <ZoomIn className="w-5 h-5 text-[var(--boutique-primary)] inline ml-2 mb-1" />
              <p className="text-sm font-semibold text-slate-800">
                👆 Cliquez sur l'image ou appuyez sur Échap pour fermer
              </p>
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
            Prix client • Promotions actives • <span className="font-semibold text-[var(--boutique-primary)]">Cliquez sur les images pour zoomer</span>
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

      {/* Grille Active - NOUVEAU DESIGN E-COMMERCE PREMIUM */}
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
          
          {/* NOTICE ZOOM */}
          <div className="bg-gradient-to-r from-blue-500/10 to-emerald-500/10 border border-blue-500/20 backdrop-blur-sm rounded-2xl p-6 text-center max-w-2xl mx-auto">
            <ZoomIn className="w-8 h-8 text-blue-500 mx-auto mb-3" />
            <p className="text-lg font-semibold text-slate-200">
              👆 <span className="text-blue-400">Cliquez sur chaque image</span> pour l'agrandir et examiner tous les détails
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
            {produitsParCategorie[activeCategorie].map((produit) => (
              <div
                key={produit.id}
                className="group relative bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border border-slate-100 hover:border-[var(--boutique-primary)]/30 overflow-hidden hover:scale-[1.02]"
              >
                {/* ÉTIQUETTE PROMO */}
                {produit.promoActive && produit.prixPromo > 0 && (
                  <div className="absolute top-4 left-4 z-20">
                    <span className="bg-gradient-to-br from-red-500 to-pink-600 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg transform rotate-[-8deg] -translate-x-1 -translate-y-1">
                      🔥 PROMO
                    </span>
                  </div>
                )}

                {/* IMAGE PRINCIPALE - AFFICHAGE COMPLET + ZOOM */}
                <div className="relative mb-6 h-64 w-full overflow-hidden rounded-2xl group-hover:rounded-3xl transition-all duration-300 bg-gradient-to-br from-slate-50 to-slate-100 border-4 border-white/50 shadow-2xl">
                  <img
                    src={produit.photo}
                    alt={produit.nom}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 cursor-zoom-in hover:brightness-110 hover:shadow-2xl"
                    onClick={() => openImageModal(produit.photo, produit.nom)}
                    draggable={false}
                    onError={(e) => {
                      e.target.src = '/placeholder-product.jpg';
                    }}
                  />
                  
                  {/* Icône zoom */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                    <div className="bg-white/90 backdrop-blur-sm p-3 rounded-2xl shadow-2xl hover:bg-white hover:scale-110 transition-all duration-200">
                      <ZoomIn className="w-7 h-7 text-[var(--boutique-primary)]" />
                    </div>
                  </div>
                </div>

                {/* Infos produit */}
                <div className="space-y-3">
                  <h4 className="font-bold text-xl text-slate-900 leading-tight line-clamp-2 group-hover:text-[var(--boutique-primary)] transition-colors">
                    {produit.nom}
                  </h4>
                  
                  {/* Prix avec promo */}
                  <div className="flex items-center gap-3 pt-2">
                    {produit.promoActive && produit.prixPromo > 0 ? (
                      <>
                        <span className="text-2xl font-black text-emerald-600">
                          {produit.prixPromo?.toLocaleString()} FCFA
                        </span>
                        <span className="text-lg text-slate-500 line-through font-medium">
                          {produit.prixClient?.toLocaleString()} FCFA
                        </span>
                      </>
                    ) : (
                      <span className="text-2xl font-black text-[var(--boutique-primary)]">
                        {produit.prixClient?.toLocaleString()} FCFA
                      </span>
                    )}
                  </div>

                  {/* Bouton ajouter au panier */}
                  <button
                    onClick={() => handleAddToCart(produit)}
                    className="w-full bg-gradient-to-r from-[var(--boutique-primary)] to-emerald-500 hover:from-[var(--boutique-primary)] hover:to-emerald-600 text-white font-bold py-4 px-6 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 uppercase tracking-wide text-sm"
                  >
                    Ajouter au panier
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
