import { useState, useEffect } from 'react';
import api from '../../api/axiosConfig.js';  
import { 
  Plus, Edit3, Trash2, Eye, CheckCircle, XCircle, Upload, Loader2 
} from 'lucide-react';

const ServicesManagement = () => {
  const [services, setServices] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    photo: null
  });
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);

  const fetchServices = async () => {
    try {
      const response = await api.get('/admin/services');
      setServices(response.data);
    } catch (error) {
      console.error('Erreur services:', error);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, photo: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('nom', formData.nom);
      formDataToSend.append('description', formData.description);
      if (formData.photo) {
        formDataToSend.append('photo', formData.photo);
      }

      if (editingService) {
        await api.put(`/admin/services/${editingService.id}`, formDataToSend);
      } else {
        await api.post('/admin/services', formDataToSend);
      }

      fetchServices();
      closeModal();
    } catch (error) {
      console.error('Erreur:', error.response?.data?.error || error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleService = async (service) => {
    try {
      await api.post(`/admin/services/${service.id}/toggle`);
      fetchServices();
    } catch (error) {
      console.error('Erreur toggle:', error);
    }
  };

  const deleteService = async (service) => {
    if (!confirm(`Supprimer ${service.nom} ?`)) return;
    try {
      await api.delete(`/admin/services/${service.id}`);
      fetchServices();
    } catch (error) {
      console.error('Erreur suppression:', error);
    }
  };

  const openModal = (service = null) => {
    setEditingService(service);
    setFormData({
      nom: service?.nom || '',
      description: service?.description || '',
      photo: null
    });
    setPreview(service?.photo || null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingService(null);
    setFormData({ nom: '', description: '', photo: null });
    setPreview(null);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            Services
          </h1>
          <p className="text-slate-400 mt-2">Gestion des catégories de services</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-2xl font-semibold flex items-center space-x-2 shadow-xl hover:shadow-2xl transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Nouveau Service</span>
        </button>
      </div>

      {/* ✅ COMPTEUR D'ÉTAT */}
      <div className="mb-6 p-4 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">
            Actifs: {services.filter(s => s.isActive).length} / Total: {services.length}
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            services.every(s => s.isActive) 
              ? 'bg-emerald-500/20 text-emerald-400' 
              : 'bg-orange-500/20 text-orange-400'
          }`}>
            {services.every(s => s.isActive) ? 'TOUS ACTIFS' : 'Certains inactifs'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {services.map((service) => (
          <div key={service.id} className={`group bg-slate-800/50 backdrop-blur-xl border-2 rounded-3xl p-6 hover:shadow-2xl transition-all hover:-translate-y-2 ${
            service.isActive 
              ? 'border-emerald-500/50 hover:border-emerald-500/80' 
              : 'border-orange-500/50 hover:border-orange-500/80'
          }`}>
            <div className="w-full h-48 rounded-2xl overflow-hidden bg-gradient-to-br from-slate-700 to-slate-900 mb-6 relative">
              <img 
                src={service.photo || 'https://via.placeholder.com/400x300?text=SERVICE'} 
                alt={service.nom}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className={`absolute top-4 right-4 p-3 rounded-2xl shadow-lg backdrop-blur-sm ${
                service.isActive 
                  ? 'bg-emerald-500/95 border-2 border-emerald-400/50 shadow-emerald-500/25' 
                  : 'bg-orange-500/95 border-2 border-orange-400/50 shadow-orange-500/25'
              }`}>
                {service.isActive ? 
                  <CheckCircle className="w-6 h-6 text-white drop-shadow-lg" /> : 
                  <XCircle className="w-6 h-6 text-white drop-shadow-lg" />
                }
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-white mb-3 truncate pr-2">{service.nom}</h3>
            <p className="text-slate-400 mb-6 line-clamp-3 leading-relaxed">{service.description}</p>
            
            <div className="flex items-center justify-between pt-4">
              <button 
                onClick={() => openModal(service)} 
                className="text-purple-400 hover:text-purple-300 flex items-center space-x-1 text-sm font-medium transition-colors hover:underline"
              >
                <Edit3 className="w-4 h-4" />
                <span>Modifier</span>
              </button>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => toggleService(service)}
                  title={service.isActive ? 'Désactiver' : 'Activer'}
                  className={`group/btn p-3 rounded-2xl font-semibold shadow-lg transition-all hover:scale-110 hover:shadow-xl backdrop-blur-sm border ${
                    service.isActive 
                      ? 'bg-emerald-500/20 hover:bg-emerald-500/40 border-emerald-400/50 shadow-emerald-500/30 hover:shadow-emerald-500/50 text-emerald-100 hover:text-emerald-50' 
                      : 'bg-orange-500/20 hover:bg-orange-500/40 border-orange-400/50 shadow-orange-500/30 hover:shadow-orange-500/50 text-orange-100 hover:text-orange-50'
                  }`}
                >
                  {service.isActive ? (
                    <XCircle className="w-6 h-6 group-hover/btn:-rotate-12 transition-transform" />
                  ) : (
                    <CheckCircle className="w-6 h-6 group-hover/btn:rotate-12 transition-transform" />
                  )}
                </button>
                
                <button
                  onClick={() => deleteService(service)}
                  className="group p-3 bg-red-500/20 hover:bg-red-500/40 text-red-400 hover:text-red-300 rounded-2xl transition-all hover:scale-110 shadow-lg hover:shadow-xl border border-red-400/30 backdrop-blur-sm"
                >
                  <Trash2 className="w-6 h-6 group-hover:-rotate-12 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8 border-b border-slate-700">
              <h2 className="text-2xl font-bold text-white">
                {editingService ? 'Modifier Service' : 'Nouveau Service'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Nom Service *
                </label>
                <select
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  className="w-full p-4 bg-slate-700/50 border border-slate-600 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  required
                >
                  <option value="">Choisir un service</option>
                  {/* ✅ VALEURS EXACTES Sequelize backend */}
                  <option value="SERVICE_PRODUITS_LONG RICH">Produits Longrich</option>
                  <option value="SERVICE_PACK_PRODUITS_SANTE_LONGRICH">Packs Santé Longrich</option>
                  <option value="SERVICE_AUTRE_PRODUITS">Autres Produits</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full p-4 bg-slate-700/50 border border-slate-600 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-vertical transition-all"
                  placeholder="Décrivez le service..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center">
                  <Upload className="w-4 h-4 mr-2" />
                  Photo (optionnel)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="w-full p-4 bg-slate-700/50 border border-slate-600 rounded-2xl file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-purple-600/80 file:text-white hover:file:bg-purple-700"
                />
                {preview && (
                  <div className="mt-4">
                    <img src={preview} alt="Preview" className="w-full h-48 object-cover rounded-2xl border-2 border-slate-600" />
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 bg-slate-700/50 hover:bg-slate-700 text-slate-300 border border-slate-600 py-3 px-6 rounded-2xl font-medium transition-all hover:border-slate-500"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 px-6 rounded-2xl font-semibold flex items-center justify-center space-x-2 shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Enregistrement...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span>{editingService ? 'Modifier' : 'Créer'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesManagement;