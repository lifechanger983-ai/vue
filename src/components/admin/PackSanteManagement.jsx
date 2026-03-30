import { useState, useEffect, useCallback } from 'react';
import {
  Heart, Loader2, CheckCircle, ChevronLeft, ChevronRight, Search, Edit3, Trash2, Video, Package, Eye
} from 'lucide-react';
import api from '../../api/axiosConfig';

const PackSanteManagement = () => {
  const [packs, setPacks] = useState([]);
  const [produits, setProduits] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPack, setEditingPack] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    categorie: '',
    probleme: '',
    consigneUtilisation: '',
    videoDemoFile: null
  });
  const [selectedProduits, setSelectedProduits] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [videoPreview, setVideoPreview] = useState(null);
  const [submitError, setSubmitError] = useState('');

  // Fetch data
  useEffect(() => {
    fetchPacks();
    fetchProduits();
  }, []);

  const fetchPacks = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/packsante');
      setPacks(data);
    } catch (error) {
      console.error('Erreur packs:', error);
    }
  }, []);

  const fetchProduits = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/produits');
      setProduits(data);
    } catch (error) {
      console.error('Erreur produits:', error);
    }
  }, []);

  const produitsParCategorie = produits.reduce((acc, p) => {
    if (!acc[p.categorie]) acc[p.categorie] = [];
    acc[p.categorie].push(p);
    return acc;
  }, {});

  const filteredProduits = formData.categorie 
    ? (produitsParCategorie[formData.categorie] || []).filter(p => 
        p.nom.toLowerCase().includes(searchTerm.toLowerCase())
      ) 
    : [];

  const getPackProduits = (packProduitsString) => {
    if (!packProduitsString) return [];
    try {
      const parsed = JSON.parse(packProduitsString);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, videoDemoFile: file });
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  const toggleProduitSelection = useCallback((produit) => {
    const existant = selectedProduits.find(p => p.id === produit.id);
    if (existant) {
      setSelectedProduits(selectedProduits.filter(p => p.id !== produit.id));
    } else {
      setSelectedProduits([...selectedProduits, { ...produit, quantite: 1 }]);
    }
  }, [selectedProduits]);

  const updateQuantite = useCallback((id, quantite) => {
    setSelectedProduits(selectedProduits.map(p => 
      p.id === id ? { ...p, quantite: parseInt(quantite) || 1 } : p
    ));
  }, [selectedProduits]);

  const nextStep = () => {
    if (currentStep === 1 && !formData.categorie) return alert('Choisissez une catégorie');
    if (currentStep === 2 && selectedProduits.length === 0) return alert('Sélectionnez au moins 1 produit');
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => setCurrentStep(Math.max(currentStep - 1, 1));

  const isStep3Valid = formData.probleme?.trim() && formData.consigneUtilisation?.trim() && selectedProduits.length > 0;

  const openModal = useCallback((pack = null) => {
    if (pack) {
      const packProduits = getPackProduits(pack.packProduits);
      setEditingPack(pack);
      setSelectedProduits(packProduits);
      setFormData({
        categorie: pack.categorie,
        probleme: pack.probleme,
        consigneUtilisation: pack.consigneUtilisation,
        videoDemoFile: null
      });
      setVideoPreview(pack.videoDemo);
    } else {
      setEditingPack(null);
      setSelectedProduits([]);
      setFormData({ categorie: '', probleme: '', consigneUtilisation: '', videoDemoFile: null });
      setVideoPreview(null);
    }
    setCurrentStep(1);
    setSearchTerm('');
    setSubmitError('');
    setIsModalOpen(true);
  }, []);

  const deletePackSante = useCallback(async (pack) => {
    if (!confirm(`Supprimer le pack "${pack.probleme}"?`)) return;
    try {
      await api.delete(`/admin/packsante/${pack.id}`);
      fetchPacks();
    } catch (error) {
      console.error('Erreur suppression:', error);
      alert('Erreur suppression');
    }
  }, [fetchPacks]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isStep3Valid) {
      setSubmitError('Remplissez tous les champs obligatoires');
      return;
    }
    setLoading(true);
    setSubmitError('');

    // Retry logic (3 tentatives)
    for (let retry = 0; retry < 3; retry++) {
      try {
        const formDataToSend = new FormData();
        formDataToSend.append('categorie', formData.categorie);
        formDataToSend.append('probleme', formData.probleme);
        formDataToSend.append('consigneUtilisation', formData.consigneUtilisation);
        formDataToSend.append('packProduits', JSON.stringify(selectedProduits));
        if (formData.videoDemoFile) {
          formDataToSend.append('videoDemoFile', formData.videoDemoFile);
        }

        const config = {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 60000
        };

        if (editingPack) {
          await api.put(`/admin/packsante/${editingPack.id}`, formDataToSend, config);
          alert('Pack modifié !');
        } else {
          await api.post('/admin/packsante', formDataToSend, config);
          alert('Pack créé avec succès !');
        }
        fetchPacks();
        setIsModalOpen(false);
        return;
      } catch (error) {
        console.error(`Tentative ${retry + 1} échouée:`, error);
        if (retry === 2) {
          const errorMsg = error.response?.data?.error || error.message || 'Erreur inconnue';
          setSubmitError(errorMsg);
          alert(`Erreur: ${errorMsg}`);
        }
        await new Promise(resolve => setTimeout(resolve, 1000)); // Pause retry
      }
    }
    setLoading(false);
  };

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingPack(null);
    setSelectedProduits([]);
    setFormData({ categorie: '', probleme: '', consigneUtilisation: '', videoDemoFile: null });
    setVideoPreview(null);
    setCurrentStep(1);
    setSearchTerm('');
    setSubmitError('');
  }, []);

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8 py-8 min-h-screen bg-gradient-to-br from-slate-900/50 to-slate-950">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl backdrop-blur-sm">
            <Heart className="w-8 h-8 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 bg-clip-text text-transparent">
              Packs Santé
            </h1>
            <p className="text-slate-400 text-lg mt-1">{packs.length} packs actifs</p>
          </div>
        </div>
        <button
          onClick={() => openModal()}
          className="glass-card px-8 py-4 text-xl font-bold flex items-center gap-3 whitespace-nowrap shadow-2xl hover:shadow-3xl transition-all"
        >
          <Package className="w-6 h-6" />
          Nouveau Pack
        </button>
      </div>

      {/* Liste Packs */}
      <div className="glass-card overflow-hidden shadow-2xl">
        {packs.length === 0 ? (
          <div className="p-20 text-center">
            <Heart className="w-24 h-24 text-slate-600 mx-auto mb-8 opacity-50 animate-pulse" />
            <h3 className="text-3xl font-bold text-slate-300 mb-4">Aucun pack santé</h3>
            <p className="text-xl text-slate-500 mb-8">Créez votre premier pack thérapeutique Longrich</p>
            <button
              onClick={() => openModal()}
              className="glass-card px-8 py-4 text-xl font-bold mx-auto flex items-center gap-3 shadow-2xl hover:shadow-3xl"
            >
              <Package className="w-6 h-6" />
              Créer premier pack
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="bg-slate-900/70 backdrop-blur-sm">
                <tr>
                  <th className="px-6 py-4 text-left text-slate-300 font-bold text-sm">Problème</th>
                  <th className="px-6 py-4 text-left text-slate-300 font-bold text-sm hidden lg:table-cell">Consigne</th>
                  <th className="px-6 py-4 text-left text-slate-300 font-bold text-sm hidden md:table-cell">Catégorie</th>
                  <th className="px-6 py-4 text-left text-slate-300 font-bold text-sm">Produits</th>
                  <th className="px-6 py-4 text-left text-slate-300 font-bold text-sm hidden lg:table-cell">Vidéo</th>
                  <th className="px-6 py-4 text-right text-slate-300 font-bold text-sm w-32">Actions</th>
                </tr>
              </thead>
              <tbody>
                {packs.map((pack) => {
                  const packProduits = getPackProduits(pack.packProduits);
                  return (
                    <tr key={pack.id} className="border-t border-slate-800/50 hover:bg-slate-800/30 transition-all">
                      <td className="px-6 py-4">
                        <div className="font-bold text-white text-base">{pack.probleme}</div>
                        <div className="text-sm text-slate-400 mt-1">{pack.categorie?.replace(/_/g, ' ')}</div>
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell">
                        <div className="text-sm text-slate-400 line-clamp-2 max-w-md">{pack.consigneUtilisation}</div>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full">
                          {pack.categorie?.replace(/_/g, ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-2 max-w-md">
                          {packProduits.slice(0, 4).map((produit, idx) => (
                            <div key={idx} className="flex items-center gap-2 p-2 bg-slate-800/50 rounded-xl max-w-xs">
                              <img 
                                src={produit.photo || '/placeholder.jpg'} 
                                alt={produit.nom}
                                className="w-10 h-10 object-cover rounded-lg"
                                onError={(e) => { e.target.src = '/placeholder-product.jpg'; }}
                              />
                              <div className="min-w-0 flex-1">
                                <div className="text-xs font-semibold text-white truncate">{produit.nom}</div>
                                <div className="text-xs text-emerald-400 font-mono">{produit.prixClient} FCFA</div>
                              </div>
                            </div>
                          ))}
                          {packProduits.length > 4 && (
                            <div className="text-xs text-slate-500 px-3 py-2 bg-slate-800/50 rounded-xl">
                              +{packProduits.length - 4} produits
                            </div>
                          )}
                          {packProduits.length === 0 && (
                            <div className="text-sm text-slate-500 italic py-2">Aucun produit</div>
                          )}
                        </div>
                        <div className="text-xs text-slate-400 mt-2">
                          Total: <span className="font-bold text-emerald-400">{packProduits.length}</span> produits
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell text-center">
                        {pack.videoDemo ? (
                          <div className="flex items-center gap-2 text-emerald-400">
                            <Video className="w-5 h-5" />
                            <span className="text-sm font-medium">Oui</span>
                          </div>
                        ) : (
                          <span className="text-slate-500 text-sm">Aucune</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openModal(pack)}
                            className="p-2 hover:bg-emerald-500/20 hover:text-emerald-400 rounded-xl transition-all"
                            title="Modifier"
                          >
                            <Edit3 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => deletePackSante(pack)}
                            className="p-2 hover:bg-red-500/20 hover:text-red-400 rounded-xl transition-all"
                            title="Supprimer"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Création/Édition */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 p-4">
          <div className="max-w-6xl w-full max-h-[95vh] mx-auto flex flex-col">
            <div className="glass-card flex-1 overflow-hidden flex flex-col max-h-[95vh]">
              {/* Header Modal */}
              <div className="p-6 border-b border-slate-700/50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button onClick={closeModal} className="p-2 hover:bg-slate-800/50 rounded-xl">
                    <ChevronLeft className="w-6 h-6 text-slate-400 hover:text-white" />
                  </button>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
                    {editingPack ? 'Modifier Pack' : 'Nouveau Pack Santé'}
                  </h2>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  {Array.from({ length: 3 }, (_, i) => (
                    <div
                      key={i}
                      className={`w-3 h-3 rounded-full transition-all ${
                        currentStep === i + 1 
                          ? 'bg-emerald-500 scale-125 shadow-emerald-500/50' 
                          : 'bg-slate-600/50'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Formulaire */}
              <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
                <div className="flex-1 overflow-y-auto p-8">
                  {/* Étape 1: Catégorie */}
                  {currentStep === 1 && (
                    <div className="max-w-lg mx-auto text-center space-y-8">
                      <h3 className="text-3xl font-black text-white flex items-center justify-center gap-4 mx-auto">
                        <Heart className="w-16 h-16 text-emerald-500 drop-shadow-lg" />
                        <span>Étape 1/3</span>
                      </h3>
                      <label className="block text-2xl font-bold text-white mb-8 text-center">
                        Choisir Catégorie Longrich <span className="text-red-400">*</span>
                      </label>
                      <select
                        value={formData.categorie}
                        onChange={(e) => {
                          setFormData({ ...formData, categorie: e.target.value });
                          setSearchTerm('');
                        }}
                        className="w-full p-8 bg-slate-800/50 border-4 border-slate-600 rounded-3xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 text-2xl font-bold text-white shadow-2xl hover:shadow-3xl transition-all"
                        required
                      >
                        <option value="">Sélectionner une catégorie</option>
                        {Object.entries(produitsParCategorie).map(([cat, prods]) => (
                          <option key={cat} value={cat}>
                            {cat.replace(/_/g, ' ').toUpperCase()} ({prods.length} produits)
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Étape 2: Sélection Produits */}
                  {currentStep === 2 && (
                    <div className="max-w-4xl mx-auto space-y-8">
                      <h3 className="text-3xl font-black text-white flex items-center justify-center gap-4">
                        <span>Étape 2/3</span>
                        <span className="px-8 py-4 bg-emerald-500/20 text-emerald-400 text-2xl font-bold rounded-3xl border-4 border-emerald-400/30 shadow-2xl">
                          {selectedProduits.length} sélection(s)
                        </span>
                      </h3>
                      {/* Recherche */}
                      <div className="relative max-w-2xl mx-auto">
                        <Search className="w-8 h-8 absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <input
                          type="text"
                          placeholder="Rechercher produits..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-20 pr-6 py-4 bg-slate-800/50 border-2 border-slate-600 rounded-3xl text-xl text-white placeholder-slate-400 focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-xl"
                        />
                      </div>
                      {/* Grille Produits */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-96 overflow-y-auto pr-4">
                        {filteredProduits.map((produit) => {
                          const isSelected = selectedProduits.some(p => p.id === produit.id);
                          return (
                            <div
                              key={produit.id}
                              className={`glass-card p-6 cursor-pointer hover:scale-105 transition-all group ${
                                isSelected ? 'ring-4 ring-emerald-500/30 border-emerald-500/50 bg-emerald-500/10' : ''
                              }`}
                              onClick={() => toggleProduitSelection(produit)}
                            >
                              <div className="w-full h-32 rounded-2xl overflow-hidden mb-4 bg-gradient-to-br from-slate-700 to-slate-900 group-hover:scale-110 transition-transform">
                                <img
                                  src={produit.photo}
                                  alt={produit.nom}
                                  className="w-full h-full object-cover"
                                  onError={(e) => { e.target.src = '/placeholder-product.jpg'; }}
                                />
                              </div>
                              <h4 className="font-bold text-white text-lg mb-2 truncate">{produit.nom}</h4>
                              <div className="text-emerald-400 text-xl font-bold mb-3">{produit.prixClient} FCFA</div>
                              <div className="flex items-center justify-center p-3 bg-slate-800/50 rounded-xl">
                                <Package className={`w-6 h-6 ${isSelected ? 'text-emerald-400' : 'text-slate-400'} mr-2`} />
                                <span className={`font-bold ${isSelected ? 'text-emerald-400' : 'text-slate-400'}`}>
                                  {isSelected ? 'SÉLECTIONNÉ' : 'Ajouter'}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      {filteredProduits.length === 0 && (
                        <div className="text-center py-20 text-slate-500">
                          <Package className="w-20 h-20 mx-auto mb-4 text-slate-600" />
                          <p>Aucun produit dans cette catégorie</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Étape 3: Détails + Vidéo */}
                  {currentStep === 3 && (
                    <div className="max-w-4xl mx-auto space-y-8">
                      <h3 className="text-3xl font-black text-white text-center flex items-center justify-center gap-4 mx-auto">
                        <span>Étape 3/3</span>
                      </h3>
                      
                      {/* Problème traité */}
                      <div>
                        <label className="block text-xl font-bold text-white mb-4 flex items-center gap-2">
                          Problème traité <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.probleme}
                          onChange={(e) => setFormData({ ...formData, probleme: e.target.value })}
                          className="w-full p-6 bg-slate-800/50 border-2 border-slate-600 rounded-3xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 text-xl font-semibold text-white placeholder-slate-400 shadow-xl"
                          placeholder="Ex: Douleurs articulaires chroniques"
                          required
                        />
                      </div>

                      {/* Consigne utilisation */}
                      <div>
                        <label className="block text-xl font-bold text-white mb-4 flex items-center gap-2">
                          Consigne d'utilisation <span className="text-red-400">*</span>
                        </label>
                        <textarea
                          name="consigneUtilisation"
                          value={formData.consigneUtilisation}
                          onChange={(e) => setFormData({ ...formData, consigneUtilisation: e.target.value })}
                          rows={6}
                          className="w-full p-6 bg-slate-800/50 border-2 border-slate-600 rounded-3xl focus:ring-4 ring-emerald-500/20 focus:border-emerald-500 text-xl resize-vertical font-medium text-white placeholder-slate-400 shadow-xl"
                          placeholder="Instructions complètes d'utilisation du pack..."
                          required
                        />
                      </div>

                      {/* Vidéo Démo */}
                      <div>
                        <label className="block text-xl font-bold text-white mb-6 flex items-center gap-3">
                          <Video className="w-8 h-8 text-purple-400" />
                          Vidéo Démo (optionnel)
                        </label>
                        <div className="border-2 border-dashed border-slate-600/50 rounded-3xl p-12 text-center hover:border-purple-500/70 transition-all h-64 flex items-center justify-center bg-slate-900/30">
                          <input
                            type="file"
                            accept="video/*"
                            onChange={handleVideoChange}
                            className="hidden"
                            id="video-upload"
                          />
                          <label htmlFor="video-upload" className="cursor-pointer w-full h-full flex flex-col items-center justify-center">
                            {videoPreview ? (
                              <div className="space-y-4 text-center">
                                <video
                                  src={videoPreview}
                                  className="w-48 h-32 object-cover rounded-2xl shadow-2xl mx-auto"
                                  controls muted
                                />
                                <p className="text-purple-400 font-bold text-lg">Vidéo prête</p>
                              </div>
                            ) : (
                              <div className="text-slate-400 space-y-3 text-xl">
                                <Video className="w-16 h-16 mx-auto" />
                                <p className="font-bold">Ajouter vidéo démo</p>
                                <p className="text-lg opacity-75">MP4, MOV (max 150MB)</p>
                              </div>
                            )}
                          </label>
                        </div>
                      </div>

                      {/* Récap Produits */}
                      <div className="glass-card p-8">
                        <h4 className="text-2xl font-bold text-emerald-400 mb-6 flex items-center gap-3">
                          <Package className="w-8 h-8" />
                          {selectedProduits.length} produit(s) sélectionné(s)
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-48 overflow-y-auto">
                          {selectedProduits.map((produit) => (
                            <div key={produit.id} className="flex items-center gap-4 p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/30">
                              <img
                                src={produit.photo}
                                alt={produit.nom}
                                className="w-16 h-16 object-cover rounded-xl shadow-lg"
                                onError={(e) => { e.target.src = '/placeholder-product.jpg'; }}
                              />
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-white text-lg truncate">{produit.nom}</p>
                                <p className="text-emerald-400 text-xl font-bold">{produit.prixClient} FCFA</p>
                              </div>
                              <input
                                type="number"
                                min="1"
                                value={produit.quantite}
                                onChange={(e) => updateQuantite(produit.id, e.target.value)}
                                className="w-20 p-2 bg-slate-800/50 border border-slate-600 rounded-xl text-white text-lg font-mono text-center"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Erreur Submit */}
                      {submitError && (
                        <div className="p-6 bg-red-500/20 border-2 border-red-500/50 rounded-3xl text-red-300 font-bold text-xl">
                          {submitError}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer Boutons */}
                <div className="p-8 border-t border-slate-700 bg-gradient-to-r from-slate-900/50 to-slate-800/50">
                  <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                    {/* Boutons Gauche */}
                    <div className="flex flex-col sm:flex-row gap-4 order-2 lg:order-1">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="flex-1 lg:w-auto px-10 py-4 bg-slate-800/50 hover:bg-slate-700 border-2 border-slate-600 rounded-3xl font-bold text-lg text-slate-300 transition-all hover:text-white hover:shadow-xl"
                      >
                        Annuler
                      </button>
                      <button
                        type="button"
                        onClick={prevStep}
                        disabled={currentStep === 1}
                        className="flex-1 lg:w-auto px-10 py-4 bg-slate-800/50 hover:bg-slate-700 border-2 border-slate-600 rounded-3xl font-bold text-lg text-slate-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:text-white hover:shadow-xl"
                      >
                        <ChevronLeft className="w-6 h-6" />
                        Précédent
                      </button>
                    </div>

                    {/* Bouton Principal */}
                    <div className="order-1 lg:order-2">
                      {currentStep < 3 ? (
                        <button
                          type="button"
                          onClick={nextStep}
                          disabled={currentStep === 1 && !formData.categorie}
                          className="w-full lg:w-auto px-16 py-5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-3xl font-bold text-xl shadow-2xl hover:shadow-3xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                        >
                          <ChevronRight className="w-7 h-7" />
                          Étape {currentStep + 1}
                        </button>
                      ) : (
                        <button
                          type="submit"
                          disabled={loading || !isStep3Valid}
                          className="w-full px-20 py-6 bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-700 hover:from-emerald-700 hover:to-teal-600 text-white rounded-3xl font-bold text-2xl shadow-2xl hover:shadow-3xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-4 text-shadow-lg"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="w-8 h-8 animate-spin" />
                              <span>Création...</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-9 h-9" />
                              <span>{editingPack ? 'Modifier Pack' : 'Créer Pack'}</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PackSanteManagement;