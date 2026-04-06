import { useEffect, useState } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../api/axiosConfig';
import ProductCard from '../../components/clients/ProductCard';

const ProduitsLongrichClient = () => {
  const { urlBoutique } = useParams();
  const { boutiqueConfig } = useOutletContext();
  const [produitsParCategorie, setProduitsParCategorie] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategorie, setActiveCategorie] = useState(null);

  useEffect(() => {
    const fetchProduitsLongrich = async () => {
      try {
        setLoading(true);
        console.log('🛒 Chargement PRODUITS LONGRICH:', urlBoutique);
        
        // ✅ NOUVEAU ENDPOINT - Directement table produits_longrich
        const { data } = await api.get(`/boutique/${urlBoutique}/produits-longrich`);
        console.log('✅ Produits Longrich:', data);
        
        // ✅ Groupement par catégorie
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
            Prix client • Promotions actives • Par catégories
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

      {/* Grille Active */}
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
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {produitsParCategorie[activeCategorie].map((produit) => (
              <ProductCard
                key={produit.id}
                produit={{
                  ...produit,
                  prixAffiche: produit.promoActive && produit.prixPromo > 0 
                    ? produit.prixPromo 
                    : produit.prixClient,
                  prixOriginal: produit.prixClient,
                  promoActive: produit.promoActive,
                  consignePromo: produit.consignePromo || ''
                }}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProduitsLongrichClient;
