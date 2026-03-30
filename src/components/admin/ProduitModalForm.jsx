import { useState, useEffect } from 'react';
import { X, Upload, Video } from 'lucide-react';
import api from '../../api/axiosConfig';
import { formatPrixCFA } from '../../utils/formatters';

const ProduitModalForm = ({ produit, onClose, onSuccess, isEdit = false }) => {
  const [formData, setFormData] = useState({
    nom: produit?.nom || '',
    pv: produit?.pv || '',
    consignePromo: produit?.consignePromo || '', // ✅ TEXT
    prixPartenaire: produit?.prixPartenaire || '',
    prixClient: produit?.prixClient || '',
    prixPromo: produit?.prixPromo || '',
    promoActive: produit?.promoActive || false,
    categorie: produit?.categorie || 'soin_sante',
    description: produit?.description || '',
    modeEmploi: produit?.modeEmploi || '',
    photo: produit?.photo || '',
    videoDemo: produit?.videoDemo || ''
  });
  const [files, setFiles] = useState({ photo: null, videoDemoFile: null });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // ✅ INITIALISATION si edit
  useEffect(() => {
    if (produit) {
      setFormData({
        nom: produit.nom || '',
        pv: produit.pv || '',
        consignePromo: produit.consignePromo || '', // ✅ TEXT
        prixPartenaire: produit.prixPartenaire || '',
        prixClient: produit.prixClient || '',
        prixPromo: produit.prixPromo || '',
        promoActive: produit.promoActive || false,
        categorie: produit.categorie || 'soin_sante',
        description: produit.description || '',
        modeEmploi: produit.modeEmploi || '',
        photo: produit.photo || '',
        videoDemo: produit.videoDemo || ''
      });
    }
  }, [produit]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nom.trim()) newErrors.nom = 'Nom requis';
    if (!formData.description.trim()) newErrors.description = 'Description requise';
    if (!formData.prixClient || formData.prixClient <= 0) newErrors.prixClient = 'Prix valide requis';
    if (formData.prixPromo && parseFloat(formData.prixPromo) >= parseFloat(formData.prixClient)) 
      newErrors.prixPromo = 'Promo < prix client';
    if (formData.pv && parseFloat(formData.pv) <= 0) newErrors.pv = 'PV valide requis';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (key !== 'photo' && key !== 'videoDemo') {
          submitData.append(key, formData[key]);
        }
      });
      if (files.photo) submitData.append('photo', files.photo);
      if (files.videoDemoFile) submitData.append('videoDemoFile', files.videoDemoFile);

      const url = isEdit ? `/admin/produits/${produit.id}` : '/admin/produits';
      const method = isEdit ? api.put : api.post;
      await method(url, submitData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
        }
      });

      alert(isEdit ? '✅ Produit mis à jour !' : '🎉 Produit créé !');
      onSuccess();
      onClose();
    } catch (error) {
      setErrors({ submit: error.response?.data?.error || 'Erreur sauvegarde' });
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      // Validation taille (100MB)
      if (file.size > 100 * 1024 * 1024) {
        alert('Fichier trop volumineux (max 100MB)');
        return;
      }
      setFiles({ ...files, [type]: file });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 p-2 sm:p-4 flex items-center justify-center">
      <div className="bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto glass-card">
        {/* Header */}
        <div className="sticky top-0 bg-slate-900/95 border-b border-slate-700/50 p-4 sm:p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                <Upload className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
                  {isEdit ? 'Modifier' : 'Nouveau'} Produit
                </h2>
                <p className="text-xs sm:text-sm text-slate-400">Longrich Management</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-slate-700/50 rounded-xl transition-all"
            >
              <X className="w-5 h-5 hover:text-red-400" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          {/* Erreur */}
          {errors.submit && (
            <div className="bg-red-500/20 border border-red-500/50 p-3 rounded-xl text-red-200 text-sm animate-pulse">
              {errors.submit}
            </div>
          )}

          {/* Grille principale */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            {/* Infos principales */}
            <div className="space-y-3 sm:space-y-4">
              {/* Nom */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-300 mb-2">Nom produit *</label>
                <input
                  type="text"
                  value={formData.nom}
                  onChange={e => setFormData({ ...formData, nom: e.target.value })}
                  className="w-full p-2.5 sm:p-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 text-sm"
                  placeholder="Ex: SOD"
                />
                {errors.nom && <p className="text-red-400 text-xs mt-1">{errors.nom}</p>}
              </div>

              {/* Prix */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2">Prix Partenaire</label>
                  <input
                    type="number"
                    step="100"
                    value={formData.prixPartenaire}
                    onChange={e => setFormData({ ...formData, prixPartenaire: e.target.value })}
                    className="w-full p-2.5 sm:p-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-amber-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2">Prix Client *</label>
                  <input
                    type="number"
                    step="100"
                    value={formData.prixClient}
                    onChange={e => setFormData({ ...formData, prixClient: e.target.value })}
                    className="w-full p-2.5 sm:p-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                  {errors.prixClient && <p className="text-red-400 text-xs mt-1">{errors.prixClient}</p>}
                </div>
              </div>

              {/* Promo + PV + ConsignePromo TEXT */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2">Prix Promo</label>
                  <input
                    type="number"
                    step="100"
                    value={formData.prixPromo}
                    onChange={e => setFormData({ ...formData, prixPromo: e.target.value })}
                    className="w-full p-2.5 sm:p-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-orange-500 text-sm"
                  />
                  {errors.prixPromo && <p className="text-red-400 text-xs mt-1">{errors.prixPromo}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2">PV</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.pv}
                    onChange={e => setFormData({ ...formData, pv: e.target.value })}
                    className="w-full p-2.5 sm:p-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                  {errors.pv && <p className="text-red-400 text-xs mt-1">{errors.pv}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2">Consigne Promo</label> {/* ✅ TEXT */}
                  <input
                    type="text"  // ✅ MODIFIÉ : TEXT
                    value={formData.consignePromo}
                    onChange={e => setFormData({ ...formData, consignePromo: e.target.value })}
                    className="w-full p-2.5 sm:p-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-purple-500 text-sm"
                    placeholder="Ex: À rendre / NULL"
                  />
                </div>
              </div>

              {/* Catégorie */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-300 mb-2">Catégorie *</label>
                <select
                  value={formData.categorie}
                  onChange={e => setFormData({ ...formData, categorie: e.target.value })}
                  className="w-full p-2.5 sm:p-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 text-sm"
                >
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
            </div>

            {/* Uploads - IDENTIQUE */}
            <div className="space-y-4">
              {/* Photo */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-300 mb-2 flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  <span>Photo *</span>
                </label>
                <div className="border-2 border-dashed border-slate-600 rounded-xl p-4 sm:p-6 h-28 sm:h-32 flex items-center justify-center hover:border-emerald-500 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'photo')}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label htmlFor="photo-upload" className="cursor-pointer w-full h-full flex flex-col items-center justify-center text-center">
                    {files.photo ? (
                      <div className="space-y-2">
                        <img src={URL.createObjectURL(files.photo)} alt="Preview" className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg mx-auto" />
                        <p className="text-emerald-400 text-xs truncate max-w-[200px]">{files.photo.name}</p>
                      </div>
                    ) : formData.photo ? (
                      <div className="space-y-2">
                        <img src={formData.photo} alt="Actuelle" className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg mx-auto" />
                        <p className="text-slate-400 text-xs">Remplacer</p>
                      </div>
                    ) : (
                      <div className="text-slate-400 space-y-2">
                        <Upload className="w-8 h-8 mx-auto" />
                        <p className="text-sm font-medium">Cliquer</p>
                        <p className="text-xs">JPG, PNG (max 100MB)</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Vidéo */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-300 mb-2 flex items-center gap-2">
                  <Video className="w-4 h-4" />
                  <span>Vidéo (optionnel)</span>
                </label>
                <div className="border-2 border-dashed border-slate-600 rounded-xl p-4 sm:p-6 h-24 sm:h-28 flex items-center justify-center hover:border-purple-500 transition-colors">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => handleFileChange(e, 'videoDemoFile')}
                    className="hidden"
                    id="video-upload"
                  />
                  <label htmlFor="video-upload" className="cursor-pointer w-full h-full flex flex-col items-center justify-center text-center">
                    {files.videoDemoFile ? (
                      <div className="space-y-2">
                        <video src={URL.createObjectURL(files.videoDemoFile)} className="w-20 h-14 sm:w-24 sm:h-16 object-cover rounded-lg mx-auto" />
                        <p className="text-purple-400 text-xs truncate">{files.videoDemoFile.name}</p>
                      </div>
                    ) : formData.videoDemo ? (
                      <div className="space-y-2">
                        <video src={formData.videoDemo} className="w-20 h-14 sm:w-24 sm:h-16 object-cover rounded-lg mx-auto" />
                        <p className="text-slate-400 text-xs">Remplacer</p>
                      </div>
                    ) : (
                      <div className="text-slate-400 space-y-2">
                        <Video className="w-8 h-8 mx-auto" />
                        <p className="text-sm font-medium">Ajouter</p>
                        <p className="text-xs">MP4 (max 100MB)</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Descriptions */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-300 mb-2">Description *</label>
              <textarea
                rows="3"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-2.5 sm:p-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 resize-vertical text-sm"
                placeholder="Description du produit..."
              />
              {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description}</p>}
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-300 mb-2">Mode d'emploi</label>
              <textarea
                rows="2"
                value={formData.modeEmploi}
                onChange={e => setFormData({ ...formData, modeEmploi: e.target.value })}
                className="w-full p-2.5 sm:p-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 resize-vertical text-sm"
                placeholder="Instructions..."
              />
            </div>

            {/* Promo Toggle */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.promoActive}
                  onChange={e => setFormData({ ...formData, promoActive: e.target.checked })}
                  className="w-5 h-5 text-emerald-500 rounded focus:ring-emerald-500"
                />
                <span className="text-sm font-bold text-emerald-400">Activer promo</span>
              </label>
              <div className="text-xs text-slate-400 space-x-2">
                <span>Partenaire:</span>
                <span className="font-mono text-amber-400">{formatPrixCFA(formData.prixPartenaire || 0)}</span>
              </div>
            </div>
          </div>

          {/* Progress */}
          {uploadProgress > 0 && (
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3">
              <div className="flex items-center justify-between mb-2 text-sm">
                <span>Upload {uploadProgress}%</span>
              </div>
              <div className="w-full bg-slate-700/50 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Boutons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-700/50">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 bg-slate-800/50 hover:bg-slate-700 border border-slate-600 text-slate-300 py-2.5 px-4 rounded-xl font-semibold text-sm hover:text-white transition-all"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg hover:shadow-xl text-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Sauvegarde...
                </>
              ) : (
                isEdit ? 'Mettre à jour' : 'Créer produit'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProduitModalForm;