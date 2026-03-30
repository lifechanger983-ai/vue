import { useState, useEffect } from 'react';
import { 
  Trash2, Edit3, ToggleRight, Search, Filter, Package 
} from 'lucide-react';
import api from '../../api/axiosConfig';
import { formatPrixCFA, getCategorieLabel, getPrixAffiche } from '../../utils/formatters';
import ProduitModalForm from './ProduitModalForm';

const ProduitTable = () => {
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduit, setSelectedProduit] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategorie, setFilterCategorie] = useState('all');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const fetchProduits = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/produits');
      setProduits(data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduits();
  }, []);

  // ✅ SWEET ALERTES INVERTÉES + COULEURS
  const togglePromo = async (id) => {
    try {
      const produitAvant = produits.find(p => p.id === id);
      const nouveauStatut = !produitAvant.promoActive;
      
      // Optimistic update
      setProduits(prev => prev.map(p => 
        p.id === id ? { ...p, promoActive: nouveauStatut } : p
      ));

      await api.post(`/admin/produits/${id}/promo`);
      await fetchProduits();

      // ✅ ALERTES INVERTÉES
      if (nouveauStatut) {
        // ACTIVÉ → Sweet "MODE PROMO ACTIVÉ"
        setSuccessMessage('🎉 MODE PROMO ACTIVÉ ! ' + formatPrixCFA(produitAvant.prixPromo || 0));
        setShowSuccessModal(true);
      } else {
        // DÉSACTIVÉ → Sweet "MODE PROMO DÉSACTIVÉ"
        setSuccessMessage('✅ MODE PROMO DÉSACTIVÉ');
        setShowSuccessModal(true);
      }
    } catch (error) {
      console.error('Erreur promo:', error);
      alert('❌ Erreur activation promo');
      fetchProduits();
    }
  };

  const deleteProduit = async (id) => {
    if (confirm('Supprimer ce produit ?')) {
      try {
        await api.delete(`/admin/produits/${id}`);
        fetchProduits();
      } catch (error) {
        console.error('Erreur:', error);
      }
    }
  };

  const filteredProduits = produits.filter(p => 
    p.nom.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterCategorie === 'all' || p.categorie === filterCategorie)
  );

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
    setSuccessMessage('');
  };

  return (
    <>
      <div className="space-y-4 px-2 sm:px-4 lg:px-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row gap-3 justify-between items-start lg:items-center">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
              Produits Longrich
            </h1>
            <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-sm font-bold rounded-full">
              {filteredProduits.length}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <div className="relative flex-1 sm:w-48 lg:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <button
              onClick={() => { setSelectedProduit(null); setShowModal(true); }}
              className="glass-card px-4 py-2.5 text-sm font-bold flex items-center gap-2 whitespace-nowrap"
            >
              <Package className="w-4 h-4" />
              Nouveau
            </button>
          </div>
        </div>

        {/* Filtres */}
        <div className="glass-card p-3 sm:p-4 flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-sm">
            <Filter className="w-4 h-4 text-emerald-400" />
            <span>Filtrer:</span>
          </div>
          <select
            value={filterCategorie}
            onChange={e => setFilterCategorie(e.target.value)}
            className="flex-1 min-w-[140px] bg-slate-800/50 border border-slate-600 px-3 py-2 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 text-sm"
          >
            <option value="all">Toutes</option>
            <option value="soin_sante">Soin Santé</option>
            <option value="cosmetique">Cosmétique</option>
            <option value="complement_alimentaire">Compléments</option>
            <option value="electronique">Électronique</option>
            <option value="electromenager">Électroménager</option>
            <option value="agroalimentaire">Agro</option>
            <option value="usage_quotidien">Quotidien</option>
            <option value="textile">Textile</option>
          </select>
        </div>

        {/* Contenu */}
        <div className="glass-card overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500/20 border-t-emerald-500 mx-auto mb-4" />
              <p className="text-slate-400">Chargement...</p>
            </div>
          ) : filteredProduits.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="w-20 h-20 text-slate-600 mx-auto mb-6" />
              <h3 className="text-xl font-bold text-slate-300 mb-2">Aucun produit</h3>
              <p className="text-slate-500 mb-6">Ajoutez votre premier produit Longrich</p>
              <button
                onClick={() => { setSelectedProduit(null); setShowModal(true); }}
                className="glass-card px-6 py-3 text-sm font-bold mx-auto flex items-center gap-2"
              >
                <Package className="w-4 h-4" />
                Créer
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px]">
                <thead className="bg-slate-900/50">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-bold text-slate-300 w-16">Image</th>
                    <th className="px-3 py-3 text-left text-xs font-bold text-slate-300 min-w-[200px]">Produit</th>
                    <th className="px-3 py-3 text-left text-xs font-bold text-slate-300 w-20">Catégorie</th>
                    <th className="px-3 py-3 text-left text-xs font-bold text-slate-300 w-28">Prix Partenaire</th>
                    <th className="px-3 py-3 text-left text-xs font-bold text-slate-300 w-28">Prix Client</th>
                    <th className="px-3 py-3 text-left text-xs font-bold text-slate-300 w-28">Prix Promo</th>
                    <th className="px-3 py-3 text-left text-xs font-bold text-slate-300 w-20">Promo</th>
                    <th className="px-3 py-3 text-left text-xs font-bold text-slate-300 w-20">PV</th>
                    <th className="px-3 py-3 text-left text-xs font-bold text-slate-300 w-32">Consigne</th>
                    <th className="px-3 py-3 text-right text-xs font-bold text-slate-300 w-28">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProduits.map(produit => (
                    <tr key={produit.id} className="border-t border-slate-800/30 hover:bg-slate-800/20">
                      <td className="px-3 py-3">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden bg-slate-800/50 flex items-center justify-center">
                          <img 
                            src={produit.photo} 
                            alt={produit.nom}
                            className="w-full h-full object-cover"
                            onError={e => { 
                              e.target.style.display = 'none'; 
                              e.target.parentNode.innerHTML = '📦'; 
                            }}
                          />
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="min-w-0">
                          <p className="font-semibold text-sm truncate text-white">{produit.nom}</p>
                          <p className="text-xs text-slate-500 truncate max-w-[250px]">{produit.description?.slice(0, 50)}...</p>
                          <p className="text-xs text-slate-400 truncate max-w-[250px]">{produit.modeEmploi}</p>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span className="px-2 py-1 bg-slate-800/50 text-xs font-bold rounded-full text-slate-300">
                          {getCategorieLabel(produit.categorie)}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span className="text-sm font-bold text-amber-400 block">
                          {formatPrixCFA(produit.prixPartenaire || 0)}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span className={produit.promoActive ? 'text-sm text-slate-500 line-through' : 'text-sm font-bold text-emerald-400'}>
                          {formatPrixCFA(produit.prixClient || 0)}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span className="text-sm font-bold text-red-400">
                          {formatPrixCFA(produit.prixPromo || 0)}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold w-full block text-center ${
                          produit.promoActive 
                            ? 'bg-gradient-to-r from-red-500/20 to-orange-500/20 text-red-400 border border-red-500/30' 
                            : 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {produit.promoActive ? '🔥 ACTIF' : '❌ INACTIF'}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full text-xs font-mono">
                          {produit.pv} PV
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full text-xs font-mono max-w-[120px] truncate block">
                          {produit.consignePromo || '0 CFA'}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => { setSelectedProduit(produit); setShowModal(true); }}
                            className="p-1.5 hover:bg-emerald-500/20 hover:text-emerald-400 rounded-lg transition-all"
                            title="Modifier"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => togglePromo(produit.id)}
                            className={`p-1.5 rounded-lg transition-all shadow-md ${
                              produit.promoActive 
                                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30' 
                                : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30'
                            }`}
                            title={produit.promoActive ? "Désactiver promo" : "Activer promo"}
                          >
                            <ToggleRight className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteProduit(produit.id)}
                            className="p-1.5 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-all"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Produit */}
        {showModal && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 p-2 sm:p-4">
            <div className="max-w-6xl mx-auto max-h-[95vh]">
              <ProduitModalForm
                produit={selectedProduit}
                onClose={() => {
                  setShowModal(false);
                  setSelectedProduit(null);
                  fetchProduits();
                }}
                onSuccess={fetchProduits}
                isEdit={!!selectedProduit}
              />
            </div>
          </div>
        )}
      </div>

      {/* ✅ SWEET MODAL ALERTES */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-xl p-12 rounded-3xl shadow-2xl text-center border border-white/20 max-w-md w-full animate-in fade-in zoom-in duration-300">
            <div className="text-emerald-400 w-24 h-24 mx-auto mb-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">{successMessage}</h1>
            <p className="text-white/80 mb-8">Action effectuée avec succès !</p>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto mb-4"></div>
            <button
              onClick={closeSuccessModal}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ProduitTable;