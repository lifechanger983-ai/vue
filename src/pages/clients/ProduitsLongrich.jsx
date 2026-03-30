import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../../api/axiosConfig';
import ProductCard from '../../components/clients/ProductCard';

const ProduitsLongrich = () => {
  const { urlBoutique } = useOutletContext();
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduits = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/boutique/${urlBoutique}/produits-longrich`);
        console.log('🔄 Fetch produits boutique:', urlBoutique);
        console.log('✅ Produits reçus:', data);
        
        setProduits(data.produits || []);
      } catch (err) {
        console.error('Erreur produits:', err);
        setError('Erreur chargement produits');
        setProduits([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProduits();
  }, [urlBoutique]);

  const handleAddToCart = (produit) => {
    console.log('🛒 Ajouté au panier:', produit.nom);
    // TODO: CartContext (Vague 6)
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-slate-700 border-t-[var(--boutique-primary)] rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-black bg-gradient-to-r from-[var(--boutique-primary)] to-emerald-500 bg-clip-text text-transparent mb-4">
          Nos Produits Longrich
        </h1>
        <p className="text-xl text-slate-300">
          {produits.length} produit(s) disponible(s)
        </p>
      </div>

      {error ? (
        <div className="text-center py-12 text-slate-400">
          <p>{error}</p>
          <p className="text-sm mt-2">Aucun produit Longrich activé pour cette boutique</p>
        </div>
      ) : produits.length === 0 ? (
        <div className="text-center py-20">
          <Store className="w-24 h-24 text-slate-600 mx-auto mb-6" />
          <p className="text-2xl text-slate-400 mb-4">Aucun produit disponible</p>
          <p className="text-slate-500">Revenez bientôt !</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {produits.map((produit) => (
            <ProductCard 
              key={produit.id}
              produit={produit}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProduitsLongrich;
