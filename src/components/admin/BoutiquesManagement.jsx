import { useState, useEffect } from 'react';
import { Store, MapPin, ToggleRight, Search, Plus, Trash2 } from 'lucide-react';
import api from '../../api/axiosConfig';

const BoutiquesManagement = () => {
  const [boutiques, setBoutiques] = useState([]);
  const [proprietaires, setProprietaires] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nom: '', type: 'boutique', urlPersonnalisee: '', proprietaireId: '',
    activeProduitsLongrich: false, activeSante: false, activeAutresProduits: false
  });
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [boutiquesRes, propriosRes] = await Promise.all([
        api.get('/admin/boutiques'),
        api.get('/admin/proprietaires')
      ]);
      setBoutiques(boutiquesRes.data);
      setProprietaires(propriosRes.data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/boutiques', formData);
      setFormData({ 
        nom: '', type: 'boutique', urlPersonnalisee: '', proprietaireId: '', 
        activeProduitsLongrich: false, activeSante: false, activeAutresProduits: false 
      });
      setShowForm(false);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.error || 'Erreur création');
    }
  };

  const toggleActive = async (id) => {
    try {
      await api.post(`/admin/boutiques/${id}/toggle`);
      fetchData();
    } catch (error) {
      alert('Erreur statut');
    }
  };

  // ✅ FONCTION SUPPRESSION AJOUTÉE
  const deleteBoutique = async (id) => {
    if (!confirm('⚠️ Supprimer définitivement cette boutique ?')) return;
    
    try {
      await api.delete(`/admin/boutiques/${id}`);
      fetchData();  // Recharge la liste
    } catch (error) {
      alert(error.response?.data?.error || 'Erreur suppression');
    }
  };

  const filteredBoutiques = boutiques.filter(b =>
    b.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.urlPersonnalisee.includes(searchTerm)
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">
            Gestion Boutiques
          </h1>
          <p className="text-slate-400">{filteredBoutiques.length} trouvées</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="glass-card px-6 py-3 font-bold flex items-center gap-2">
          <Store className="w-5 h-5" />
          {showForm ? 'Annuler' : 'Nouvelle Boutique'}
        </button>
      </div>

      {showForm && (
        <div className="glass-card p-6">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <input 
              type="text" 
              placeholder="Nom boutique" 
              value={formData.nom} 
              onChange={e => setFormData({...formData, nom: e.target.value})}
              className="p-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white" 
              required 
            />
            
            <select 
              value={formData.type} 
              onChange={e => setFormData({...formData, type: e.target.value})} 
              className="p-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white"
            >
              <option value="boutique">Boutique</option>
              <option value="supermarche">Supermarché</option>
            </select>

            <input 
              type="text" 
              placeholder="URL personnalisée (mega123)" 
              value={formData.urlPersonnalisee} 
              onChange={e => setFormData({...formData, urlPersonnalisee: e.target.value.toLowerCase().replace(/\s+/g, '')})}
              className="p-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white" 
              required 
            />

            <select 
              value={formData.proprietaireId} 
              onChange={e => setFormData({...formData, proprietaireId: e.target.value})} 
              className="p-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white" 
              required
            >
              <option value="">Sélectionner propriétaire</option>
              {proprietaires.map(p => (
                <option key={p.id} value={p.id}>{p.nom} ({p.telephone})</option>
              ))}
            </select>

            <div className="md:col-span-2 lg:col-span-3 grid grid-cols-3 gap-3 mt-2">
              <label className="flex items-center gap-2 p-3 bg-slate-800/50 border border-slate-600 rounded-xl cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={formData.activeProduitsLongrich} 
                  onChange={e => setFormData({...formData, activeProduitsLongrich: e.target.checked})} 
                  className="w-4 h-4 text-emerald-500" 
                />
                <span className="text-sm text-emerald-400 font-bold">Longrich</span>
              </label>
              <label className="flex items-center gap-2 p-3 bg-slate-800/50 border border-slate-600 rounded-xl cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={formData.activeSante} 
                  onChange={e => setFormData({...formData, activeSante: e.target.checked})} 
                  className="w-4 h-4 text-blue-500" 
                />
                <span className="text-sm text-blue-400 font-bold">Santé</span>
              </label>
              <label className="flex items-center gap-2 p-3 bg-slate-800/50 border border-slate-600 rounded-xl cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={formData.activeAutresProduits} 
                  onChange={e => setFormData({...formData, activeAutresProduits: e.target.checked})} 
                  className="w-4 h-4 text-purple-500" 
                />
                <span className="text-sm text-purple-400 font-bold">Autres</span>
              </label>
            </div>

            <button 
              type="submit" 
              className="md:col-span-2 lg:col-span-3 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold py-3 px-6 rounded-xl"
            >
              Créer Boutique
            </button>
          </form>
        </div>
      )}

      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Rechercher nom ou URL..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
              className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-600 rounded-xl text-white" 
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin h-12 w-12 border-4 border-orange-500/20 border-t-orange-500 mx-auto" />
          </div>
        ) : filteredBoutiques.length === 0 ? (
          <div className="text-center py-12">
            <Store className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p>Aucune boutique</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead className="bg-slate-900/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-300">Nom</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-300">URL</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-300">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-300">Propriétaire</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-300">Longrich</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-300">Santé</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-300">Autres</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-300">Statut</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBoutiques.map(boutique => (
                  <tr key={boutique.id} className="border-t border-slate-800/30 hover:bg-slate-800/20">
                    <td className="px-4 py-4 font-semibold flex items-center gap-3">
                      <Store className="w-5 h-5 text-orange-400" />
                      {boutique.nom}
                    </td>
                    <td className="px-4 py-4 font-mono bg-orange-500/10 px-2 py-1 rounded text-orange-400">
                      mega/{boutique.urlPersonnalisee}
                    </td>
                    <td className="px-4 py-4">
                      <span className="px-2 py-1 bg-slate-800/50 text-xs rounded-full">
                        {boutique.type === 'boutique' ? '🏪' : '🛒'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm">{boutique.monProprietaire?.nom || '-'}</td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${boutique.activeProduitsLongrich ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800/50 text-slate-400'}`}>
                        {boutique.activeProduitsLongrich ? '✅' : '❌'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${boutique.activeSante ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800/50 text-slate-400'}`}>
                        {boutique.activeSante ? '✅' : '❌'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${boutique.activeAutresProduits ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-800/50 text-slate-400'}`}>
                        {boutique.activeAutresProduits ? '✅' : '❌'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${boutique.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                        {boutique.isActive ? '🟢 Actif' : '🔴 Inactif'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center gap-1 justify-end">
                        <button 
                          onClick={() => toggleActive(boutique.id)} 
                          className={`p-2 rounded-lg ${boutique.isActive ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'}`}
                        >
                          <ToggleRight className="w-4 h-4" />
                        </button>
                        {/* ✅ BOUTON SUPPRESSION CORRIGÉ */}
                        <button 
                          onClick={() => deleteBoutique(boutique.id)}
                          className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
                          title="Supprimer boutique"
                        >
                          <Trash2 className="w-4 h-4" />
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
    </div>
  );
};

export default BoutiquesManagement;
