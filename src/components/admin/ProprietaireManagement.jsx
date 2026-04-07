import { useState, useEffect } from 'react';
import { UserPlus, ToggleRight, Search, Edit3, Trash2, Upload, Eye, EyeOff } from 'lucide-react';
import api from '../../api/axiosConfig';

const ProprietaireManagement = () => {
  const [proprietaires, setProprietaires] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({ 
    nom: '', sexe: 'M', telephone: '', email: '', quartier: '', photo: '', password: ''
  });
  const [files, setFiles] = useState({ photo: null });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const fetchProprietaires = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/proprietaires');
      setProprietaires(data);
      console.log('✅ Propriétaires:', data);
    } catch (error) {
      console.error('❌ Fetch Error:', error.response?.data || error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProprietaires();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('Photo trop volumineuse (max 10MB)');
        return;
      }
      setFiles({ photo: file });
      setFormData(prev => ({ ...prev, photo: URL.createObjectURL(file) }));
    }
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setFormLoading(true);

  try {
    const submitData = new FormData();
    
    // ✅ FORM DATA ROBUSTE - Gère TOUS les types (string/null/undefined)
    Object.keys(formData).forEach(key => {
      if (key !== 'photo') {  // ← Exclut photo (fichier séparé)
        const value = formData[key];
        // ✅ SAFE TRIM: Seulement si string
        if (typeof value === 'string') {
          submitData.append(key, value.trim());
        } else {
          submitData.append(key, value || '');  // boolean/null → string
        }
      }
    });
    
    // ✅ PHOTO : UNIQUEMENT le fichier, JAMAIS l'URL preview !
    if (files.photo) {
      submitData.append('photo', files.photo);
    }

    console.log('📤 ENVOI FormData:', {
      nom: formData.nom,
      email: formData.email,  // ✅ MAINTENANT visible !
      hasPhoto: !!files.photo,
      photoName: files.photo?.name,
      password: !!formData.password
    });

    // API call SANS Content-Type (axios + intercepteur gère)
    let response;
    if (editingId) {
      response = await api.put(`/admin/proprietaires/${editingId}`, submitData, {
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
        }
      });
    } else {
      response = await api.post('/admin/proprietaires', submitData, {
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
        }
      });
    }

    // Reset + succès (UPDATE uniquement)
    await fetchProprietaires();
    setFormData({ nom: '', sexe: 'M', telephone: '', email: '', quartier: '', photo: '', password: '' });
    setFiles({ photo: null });
    setUploadProgress(0);
    setEditingId(null);
    setShowForm(false);
    alert(editingId ? '✅ Propriétaire mis à jour !' : '🎉 Propriétaire créé !');

  } catch (error) {
    console.error('❌ ERROR FULL:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    // ✅ ALERTE DÉTAILLÉE pour nouveau propriétaire (201 = SUCCÈS !)
    if (error.response?.status === 201) {
      const data = error.response.data;
      alert(`✅ PROPRIÉTAIRE CRÉÉ: ${data.nom}\n📧 Email envoyé à: ${data.email || 'AUCUN'}\nℹ️ AUCUNE BOUTIQUE associée\n👉 Allez dans "Gestion Boutiques" pour le lier`);
      
      // ✅ AUTO-RELOAD + reset (car c'est un SUCCÈS !)
      await fetchProprietaires();
      setFormData({ nom: '', sexe: 'M', telephone: '', email: '', quartier: '', photo: '', password: '' });
      setFiles({ photo: null });
      setUploadProgress(0);
      setEditingId(null);
      setShowForm(false);
      
    } else {
      // Erreurs réelles (400, 500, etc.)
      alert(error.response?.data?.error || `❌ Erreur: ${error.message}`);
    }
  } finally {
    setFormLoading(false);
  }
};



  const handleEdit = (proprietaire) => {
    setFormData({
      nom: proprietaire.nom,
      sexe: proprietaire.sexe,
      telephone: proprietaire.telephone,
      email: proprietaire.email || '',
      quartier: proprietaire.quartier || '',
      password: '',
      photo: proprietaire.photo || ''
    });
    setFiles({ photo: null });
    setEditingId(proprietaire.id);
    setShowForm(true);
    setShowPassword(false);
  };

  const toggleActive = async (id) => {
    try {
      await api.post(`/admin/proprietaires/${id}/toggle`);
      fetchProprietaires();
    } catch (error) {
      console.error('Toggle error:', error);
      alert('Erreur statut');
    }
  };

  const deleteProprietaire = async (id) => {
    if (!confirm('Supprimer ce propriétaire ?')) return;
    try {
      await api.delete(`/admin/proprietaires/${id}`);
      fetchProprietaires();
    } catch (error) {
      console.error('Delete error:', error);
      alert('Erreur suppression');
    }
  };

  const filteredProprietaires = proprietaires.filter(p =>
    p.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.telephone.includes(searchTerm) ||
    p.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            Gestion Propriétaires
          </h1>
          <p className="text-slate-400">{filteredProprietaires.length} trouvés</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({ nom: '', sexe: 'M', telephone: '', email: '', quartier: '', photo: '', password: '' });
            setFiles({ photo: null });
            setUploadProgress(0);
            setShowPassword(false);
            setShowForm(!showForm);
          }}
          className="glass-card px-6 py-3 font-bold flex items-center gap-2"
          disabled={formLoading}
        >
          <UserPlus className="w-5 h-5" />
          {showForm ? 'Annuler' : editingId ? 'Modifier' : 'Nouveau'}
        </button>
      </div>

      {/* FORMULAIRE COMPLET - ✅ FormData CORRIGÉ */}
      {showForm && (
        <div className="glass-card p-6">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <input
              type="text" placeholder="Nom complet *" value={formData.nom}
              onChange={e => setFormData({...formData, nom: e.target.value})}
              className="p-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white" required
              disabled={formLoading}
            />
            <select
              value={formData.sexe} onChange={e => setFormData({...formData, sexe: e.target.value})}
              className="p-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white"
              disabled={formLoading}
            >
              <option value="M">Homme</option>
              <option value="F">Femme</option>
            </select>
            <input
              type="tel" placeholder="Téléphone (691...)*" value={formData.telephone}
              onChange={e => setFormData({...formData, telephone: e.target.value})}
              className="p-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white" required
              disabled={formLoading}
            />
            <input
              type="email" placeholder="Email (optionnel)" value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              className="p-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white"
              disabled={formLoading}
            />
            
            {/* PASSWORD FIELD - OBLIGATOIRE POUR CRÉATION */}
            <div className="lg:col-span-2 relative">
              <input
                type={showPassword ? "text" : "password"} 
                placeholder="Mot de passe *" 
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                className="p-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white pr-12 w-full" 
                required={!editingId}
                minLength={6}
                disabled={formLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 rounded transition-colors"
                disabled={formLoading}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
              <p className="text-xs text-slate-500 mt-1">
                {editingId ? "Laisser vide pour garder ancien" : "Min 6 caractères"}
              </p>
            </div>

            <input
              type="text" placeholder="Quartier" value={formData.quartier}
              onChange={e => setFormData({...formData, quartier: e.target.value})}
              className="p-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white lg:col-span-2"
              disabled={formLoading}
            />

            {/* UPLOAD PHOTO - ✅ CORRIGÉ: files.photo UNIQUEMENT */}
            <div className="lg:col-span-3">
              <label className="block text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                <Upload className="w-4 h-4" />
                <span>Photo de profil (optionnel)</span>
              </label>
              <div className="border-2 border-dashed border-slate-600 rounded-xl p-6 h-32 flex items-center justify-center hover:border-emerald-500 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="proprietaire-photo-upload"
                  disabled={formLoading}
                />
                <label htmlFor="proprietaire-photo-upload" className="cursor-pointer w-full h-full flex flex-col items-center justify-center text-center disabled:cursor-not-allowed">
                  {files.photo ? (
                    <div className="space-y-2">
                      <img src={URL.createObjectURL(files.photo)} alt="Preview" 
                        className="w-20 h-20 object-cover rounded-xl shadow-lg mx-auto" />
                      <p className="text-emerald-400 text-xs truncate max-w-[200px]">
                        {files.photo.name}
                      </p>
                    </div>
                  ) : formData.photo ? (
                    <div className="space-y-2">
                      <img src={formData.photo} alt="Actuelle" 
                        className="w-20 h-20 object-cover rounded-xl shadow-lg mx-auto" />
                      <p className="text-slate-400 text-xs">Remplacer photo</p>
                    </div>
                  ) : (
                    <div className="text-slate-400 space-y-2">
                      <Upload className="w-10 h-10 mx-auto" />
                      <p className="text-sm font-medium">Cliquer pour ajouter</p>
                      <p className="text-xs">JPG, PNG (max 10MB)</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {uploadProgress > 0 && (
              <div className="lg:col-span-3 bg-slate-800/50 border border-slate-700 rounded-xl p-3">
                <div className="flex items-center justify-between mb-2 text-sm">
                  <span>Upload {uploadProgress}%</span>
                </div>
                <div className="w-full bg-slate-700/50 rounded-full h-2">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all"
                    style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            )}

            <button 
              type="submit" 
              disabled={formLoading || !formData.nom.trim()}
              className="md:col-span-2 lg:col-span-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:from-slate-600 disabled:to-slate-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              {formLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white inline-block mr-2" />
                  Sauvegarde en cours...
                </>
              ) : (
                editingId ? 'Modifier Propriétaire' : 'Créer Propriétaire'
              )}
            </button>
          </form>
        </div>
      )}

      {/* TABLEAU */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Rechercher nom, téléphone, email..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-600 rounded-xl text-white"
              disabled={formLoading}
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin h-12 w-12 border-4 border-emerald-500/20 border-t-emerald-500 mx-auto" />
          </div>
        ) : filteredProprietaires.length === 0 ? (
          <div className="text-center py-12">
            <UserPlus className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p>Aucun propriétaire. Créez-en un !</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead className="bg-slate-900/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-300 w-16">Photo</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-300">Nom</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-300">Téléphone</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-300">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-300">Sexe</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-300">Quartier</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-300">Statut</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProprietaires.map(proprietaire => (
                  <tr key={proprietaire.id} className="border-t border-slate-800/30 hover:bg-slate-800/20">
                    <td className="px-4 py-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-800/50 flex items-center justify-center shadow-md">
                        {proprietaire.photo ? (
                          <img 
                            src={proprietaire.photo} 
                            alt={proprietaire.nom}
                            className="w-full h-full object-cover rounded-full"
                            onError={(e) => { 
                              e.target.style.display = 'none'; 
                              e.target.parentNode.innerHTML = (
                                <UserPlus className="w-6 h-6 text-slate-500 mx-auto" />
                              ); 
                            }}
                          />
                        ) : (
                          <UserPlus className="w-6 h-6 text-slate-500" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 font-semibold">{proprietaire.nom}</td>
                    <td className="px-4 py-4 font-mono text-sm">{proprietaire.telephone}</td>
                    <td className="px-4 py-4 text-slate-400 text-sm truncate max-w-[120px]">
                      {proprietaire.email || '-'}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        proprietaire.sexe === 'M' ? 'bg-blue-500/20 text-blue-400' : 'bg-pink-500/20 text-pink-400'
                      }`}>
                        {proprietaire.sexe === 'M' ? '👨' : '👩'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-400">{proprietaire.quartier || '-'}</td>
                    <td className="px-4 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        proprietaire.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {proprietaire.isActive ? '✅ Actif' : '❌ Inactif'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <button onClick={() => handleEdit(proprietaire)}
                          className="p-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-lg"
                          title="Modifier" disabled={formLoading}
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button onClick={() => toggleActive(proprietaire.id)}
                          className={`p-2 rounded-lg ${
                            proprietaire.isActive 
                              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                              : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                          }`} title="Toggle Actif" disabled={formLoading}
                        >
                          <ToggleRight className="w-4 h-4" />
                        </button>
                        <button onClick={() => deleteProprietaire(proprietaire.id)}
                          className="p-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg"
                          title="Supprimer" disabled={formLoading}
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

export default ProprietaireManagement;