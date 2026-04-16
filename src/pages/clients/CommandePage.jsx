import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { 
  User, Phone, Mail, MapPin, CheckCircle, ArrowLeft, CreditCard, 
  Loader2, AlertCircle, ShoppingCart, Download, Send 
} from 'lucide-react';
import { useCart } from './CartContext';
import api from '../../api/axiosConfig';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const CommandePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { urlBoutique } = useParams();
  const { cartState, dispatch } = useCart();
  
  const [formData, setFormData] = useState({
    nom: '',
    sexe: 'M',
    telephone: '',
    email: '',
    quartier: '',
    adresseLivraison: '',
    latitude: null,
    longitude: null,
    boutiqueUrl: urlBoutique,
    produits: [],
    prixTotal: 0,
    livraisonGratuite: false
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [commandeId, setCommandeId] = useState(null);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [pdfTelecharge, setPdfTelecharge] = useState(false);  // 🔥 ÉTAT PDF
  const [validationLoading, setValidationLoading] = useState(false);  // 🔥 VALIDATION
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState('');
  
  const recuRef = useRef(null);

  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }),
        reject,
        { timeout: 10000 }
      );
    });
  };

  const sanitizeProduits = useCallback((items) => {
    console.log('🔍 ITEMS BRUT:', items);
    
    return items
      .map(item => {
        const prix = parseFloat(item.prixClient || item.pv || item.prix || item.prixPromo || 0);
        console.log(`📦 ${item.nom}: prix=${prix}, id=${item.id}`);
        
        return {
          id: String(item.id || item.produitId || ''),
          nom: (item.nom || item.libelle || 'Produit inconnu').trim(),
          prixClient: prix,
          prixPromo: parseFloat(item.prixPromo || 0),
          quantity: parseInt(item.quantity || item.quantite || 1) || 1,
          categorie: item.categorie || 'general'
        };
      })
      .filter(p => {
        const valide = p.id && p.nom && p.prixClient > 0;
        console.log(`✅ ${p.nom}: ${valide ? 'OK' : 'KO'}`);
        return valide;
      });
  }, []);

  useEffect(() => {
    if (cartState.items.length === 0 && !success) {
      navigate(`/boutique/${urlBoutique}`);
      return;
    }
    
    const produitsValides = sanitizeProduits(cartState.items);
    console.log('🛒 PRODUITS SANITIZED:', produitsValides);
    
    setFormData(prev => ({
      ...prev,
      produits: produitsValides,
      prixTotal: cartState.totalAmount || 0
    }));
  }, [cartState, urlBoutique, navigate, success, sanitizeProduits]);

  const validateForm = () => {
    if (!formData.nom?.trim()) return 'Nom requis';
    if (!formData.telephone || formData.telephone.length < 9) return 'Téléphone valide requis (9+ chiffres)';
    if (!formData.quartier?.trim()) return 'Quartier requis';
    if (!formData.adresseLivraison?.trim()) return 'Adresse livraison requise';
    if (formData.produits.length === 0) return 'Panier vide';
    return null;
  };

  // ✅ GÉNÉRATION PDF + DOWNLOAD
  const generateAndDownloadPDF = useCallback(async () => {
    if (!recuRef.current || !commandeId) return;
    
    setPdfGenerating(true);
    try {
      const canvas = await html2canvas(recuRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        width: recuRef.current.scrollWidth,
        height: recuRef.current.scrollHeight
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save(`Recu_Commande_${commandeId}_${formData.nom.replace(/\s+/g, '_')}.pdf`);
      console.log('✅ PDF GÉNÉRÉ ET TÉLÉCHARGÉ');
      
      // Dans generateAndDownloadPDF, après pdf.save(...)
pdf.save(`Recu_Commande_${commandeId}_${formData.nom.replace(/\s+/g, '_')}.pdf`);
console.log('✅ PDF GÉNÉRÉ ET TÉLÉCHARGÉ');

// 🔥 AJOUTEZ CETTE LIGNE (CRITIQUE)
setPdfTelecharge(true);  // Active immédiatement le bouton Valider
      
      // 🔥 ACTIVER BOUTON VALIDATION
      setPdfTelecharge(true);
      
    } catch (err) {
      console.error('❌ ERREUR PDF:', err);
      alert('Erreur génération PDF');
    } finally {
      setPdfGenerating(false);
    }
  }, [commandeId, formData.nom]);

  // 🔥 NOUVELLE FONCTION : VALIDATION FINALE
// 🔥 handleValidation ADAPTÉ (remplacez la vôtre)
const handleValidation = async () => {
  if (!pdfTelecharge) {
    alert('📥 Téléchargez d\'abord votre reçu PDF !');
    return;
  }
  
  setValidationLoading(true);
  try {
    console.log('🔥 VALIDATION:', { commandeId, urlBoutique, telephone: formData.telephone });
    
    // ✅ CORRECT : /boutique/ (route existe)
    const response = await api.post(`/boutique/${urlBoutique}/commande/${commandeId}/valider`, {
      telephone: formData.telephone,
      recuTelecharge: true
    });
    
    console.log('✅ VALIDATION OK:', response.data);
    alert('🎉 Commande VALIDÉE !');
    navigate(`/boutique/${urlBoutique}`);
  } catch (error) {
    console.error('❌ ERROR:', error.response?.data);
    alert(error.response?.data?.error || 'Erreur');
  } finally {
    setValidationLoading(false);
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('🚀 SUBMIT DÉMARRÉ');
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');

    try {
      // GPS
      let coords = { lat: null, lng: null };
      try {
        const pos = await getCurrentLocation();
        coords = pos;
      } catch (err) { console.log("GPS non activé"); }

      const finalData = {
        nom: formData.nom.trim(),
        sexe: formData.sexe,
        telephone: formData.telephone.trim(),
        email: formData.email?.trim() || '',
        quartier: formData.quartier.trim(),
        adresseLivraison: formData.adresseLivraison.trim(),
        latitude: coords.lat,
        longitude: coords.lng,
        boutiqueUrl: urlBoutique,
        produits: formData.produits,
        prixTotal: parseFloat(formData.prixTotal) || 0,
        livraisonGratuite: formData.livraisonGratuite
      };

      console.log('📤 ENVOI FINAL:', finalData);

      // 🔥 1. CRÉER COMMANDE BROUILLON
      const response = await api.post(`/boutique/${urlBoutique}/commande`, finalData);
      
      if (response.data.success) {
        const newCommandeId = response.data.commandeId;
        console.log('✅ COMMANDE BROUILLON ID:', newCommandeId);
        
        setCommandeId(newCommandeId);
        
        // 🔥 Email simple de confirmation (optionnel)
        if (formData.email?.trim()) {
          try {
// Dans handleSubmit, après création commande :
await api.post(`/commande/${newCommandeId}/email-confirmation`, {
  commandeId: newCommandeId,
  email: formData.email,
  nom: formData.nom,
  total: formData.prixTotal,
  telephone: formData.telephone
});
            setEmailSent(true);
            console.log('✅ EMAIL CONFIRMATION ENVOYÉ!');
          } catch (emailErr) {
            console.error('⚠️ EMAIL ÉCHOUÉ:', emailErr.response?.status);
          }
        }
        
        // 🔥 ÉCRAN SUCCÈS - Panier préservé
        setSuccess(true);
        // dispatch({ type: 'CLEAR_CART' }); ❌ SUPPRIMÉ
        
        console.log('🔥 LIENS RESPONSE:', response.data.actions);
      }
    } catch (err) {
      console.error('❌ ERREUR:', err.response?.data || err);
      setError(err.response?.data?.error || 'Erreur création commande');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  // 🔥 ÉCRAN SUCCÈS MODIFIÉ - 3 ÉTAPES
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center p-4">
        <div className="bg-white/95 backdrop-blur-xl p-12 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          
          <CheckCircle className="w-24 h-24 text-emerald-500 mx-auto mb-8 bg-emerald-100 rounded-full p-6" />
          <h1 className="text-3xl font-black text-slate-900 mb-4 text-center">
            Commande #{commandeId?.slice(-8)} Créée !
          </h1>
          
          {/* RÉCAPITULATIF PDF */}
          <div ref={recuRef} className="bg-white p-8 rounded-2xl shadow-2xl border-4 border-emerald-200 mb-8 print:shadow-none">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-black text-emerald-600 mb-2">RÉCÉPISSÉ DE COMMANDE</h2>
              <p className="text-slate-600 uppercase tracking-wider font-bold">NEFER RITA - Yaoundé</p>
              <p className="text-2xl font-bold text-slate-900 mt-4">N° {commandeId?.slice(-8)}</p>
            </div>
            
            <div className="space-y-4 mb-8">
              <div className="grid grid-cols-2 font-bold text-slate-800">
                <span>Client:</span>
                <span className="text-right">{formData.nom}</span>
                <span>Téléphone:</span>
                <span className="text-right">{formData.telephone}</span>
                <span>Email:</span>
                <span className="text-right">{formData.email || 'Non fourni'}</span>
                <span>Quartier:</span>
                <span className="text-right">{formData.quartier}</span>
                <span>Adresse:</span>
                <span className="text-right">{formData.adresseLivraison}</span>
              </div>
            </div>
            
            <div className="border-t-2 border-slate-300 pt-6 mb-8">
              <h3 className="text-xl font-bold text-slate-900 mb-4">DÉTAIL DES PRODUITS</h3>
              <div className="space-y-3">
                {formData.produits.map((produit, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-slate-200">
                    <span className="font-medium">{produit.quantity}x {produit.nom}</span>
                    <span className="font-bold">{(produit.prixClient * produit.quantity).toLocaleString()} FCFA</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-300 mt-4 pt-4">
                <div className="flex justify-between text-2xl font-black text-emerald-600">
                  <span>TOTAL :</span>
                  <span>{formData.prixTotal.toLocaleString()} FCFA</span>
                </div>
                <p className="text-sm text-slate-500 mt-2">
                  Statut: <span className="font-bold text-amber-600">BROUILLON</span> • 
                  Paiement à la livraison
                </p>
              </div>
            </div>
            
            <div className="text-center text-xs text-slate-500 space-y-1">
              <p>Date: {new Date().toLocaleDateString('fr-FR')}</p>
              <p>📞 Contact: {formData.telephone}</p>
              <p>🚨 IMPORTANT: Téléchargez + Validez pour confirmation !</p>
            </div>
          </div>
          
          {/* 🔥 1. BOUTON PDF - Désactivé après téléchargement */}
          <button
            onClick={generateAndDownloadPDF}
            disabled={pdfGenerating || pdfTelecharge}
            className="w-full py-4 px-8 bg-gradient-to-r from-blue-500 to-indigo-600 
                       hover:from-blue-600 hover:to-indigo-700 
                       disabled:from-gray-400 disabled:to-gray-500 
                       text-white font-black rounded-xl shadow-xl mb-6
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {pdfGenerating ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin mr-2 inline" />
                Génération PDF...
              </>
            ) : pdfTelecharge ? (
              '✅ PDF Téléchargé !'
            ) : (
              <>
                <Download className="w-6 h-6 inline mr-2" />
                📥 TÉLÉCHARGER RÉCÉPISSÉ (PDF)
              </>
            )}
          </button>
          
          {/* 🔥 2. BOUTON VALIDATION FINALE - GRIS si pas PDF */}
          <button
            onClick={handleValidation}
            disabled={!pdfTelecharge || validationLoading}
            className="w-full py-4 px-8 bg-gradient-to-r from-green-600 to-emerald-700 
                       hover:from-green-700 hover:to-emerald-800 
                       disabled:from-gray-400 disabled:to-gray-500 
                       text-white font-black rounded-xl shadow-xl text-lg
                       disabled:opacity-50 disabled:cursor-not-allowed mb-6"
          >
            {validationLoading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin mr-2 inline" />
                Validation en cours...
              </>
            ) : (
              <>
                <CheckCircle className="w-6 h-6 inline mr-2" />
                ✅ VALIDER MA COMMANDE (Finalise + Email)
              </>
            )}
          </button>
          
          {/* 3. RETOUR BOUTIQUE */}
          <button
            onClick={() => navigate(`/boutique/${urlBoutique}`)}
            className="w-full py-4 px-8 bg-white/80 hover:bg-white text-slate-900 
                       font-bold rounded-xl shadow-xl border-2 border-white/50 
                       transition-all text-lg"
          >
            🏪 CONTINUER MES ACHATS
          </button>
          
          {/* Statut email */}
          {emailSent && (
            <p className="text-sm text-emerald-600 mt-4 flex items-center justify-center gap-2">
              <Send className="w-4 h-4" />
              📧 Email de confirmation envoyé
            </p>
          )}
          
          <p className="text-xs text-slate-500 mt-6 text-center">
            {pdfTelecharge 
              ? '✅ Étape 2/2: Cliquez VALIDATION pour finaliser !' 
              : '📋 Étape 1/2: Téléchargez votre reçu puis validez'
            }
          </p>
        </div>
      </div>
    );
  }

  // FORMULAIRE (INCHANGÉ)
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-4">
            Finaliser ma commande
          </h1>
          <p className="text-xl text-slate-600">Total: <strong>{formData.prixTotal.toLocaleString()} FCFA</strong></p>
        </div>

        <form id="commande-form" onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-slate-200 mb-8">
          {/* FORMULAIRE IDENTIQUE - inchangé */}
          <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3 justify-center">
            <User className="w-8 h-8 text-emerald-600" />
            Mes informations
          </h2>
          
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Nom, Sexe, Téléphone, Email, Quartier, Adresse - IDENTIQUE */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Nom complet *</label>
              <input
                type="text"
                placeholder="Nom complet *"
                value={formData.nom}
                onChange={(e) => handleInputChange('nom', e.target.value)}
                className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Sexe</label>
              <select
                value={formData.sexe}
                onChange={(e) => handleInputChange('sexe', e.target.value)}
                className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 bg-white"
              >
                <option value="M">👨 Homme</option>
                <option value="F">👩 Femme</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Téléphone *</label>
              <input
                type="tel"
                placeholder="691 XX XX XX *"
                value={formData.telephone}
                onChange={(e) => handleInputChange('telephone', e.target.value.replace(/\D/g, ''))}
                className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email (optionnel - pour confirmation)
              </label>
              <input
                type="email"
                placeholder="email@exemple.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Quartier *</label>
              <input
                type="text"
                placeholder="Ex: Efoulan, Mvan..."
                value={formData.quartier}
                onChange={(e) => handleInputChange('quartier', e.target.value)}
                className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 bg-white"
                required
              />
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Adresse de livraison précise *
              </label>
              <input
                type="text"
                placeholder="Rue, numéro, repères..."
                value={formData.adresseLivraison}
                onChange={(e) => handleInputChange('adresseLivraison', e.target.value)}
                className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 bg-white"
                required
              />
            </div>
          </div>
        </form>

        {error && (
          <div className="p-6 bg-red-100 border border-red-300 text-red-800 rounded-2xl flex items-center gap-3 max-w-4xl mx-auto mb-8">
            <AlertCircle className="w-6 h-6" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 max-w-4xl mx-auto">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 py-4 px-8 border-2 border-slate-200 bg-white text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all text-lg flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Modifier panier
          </button>
          <button
            type="submit"
            form="commande-form"
            disabled={loading || formData.produits.length === 0}
            className="flex-1 py-4 px-8 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 text-white font-black rounded-xl shadow-xl transition-all text-lg flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Traitement...
              </>
            ) : (
              <>
                <CreditCard className="w-6 h-6" />
                CONFIRMER MA COMMANDE
              </>
            )}
          </button>
        </div>

        {/* Résumé panier - IDENTIQUE */}
{/* Résumé panier - ULTRA LISIBLE POUR MAL-VOYA NTS */}
<div className="max-w-4xl mx-auto mt-12 p-8 bg-white border-4 border-slate-100 shadow-xl rounded-2xl">
  <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3 border-b-2 border-slate-200 pb-4">
    <ShoppingCart className="w-6 h-6 text-blue-700" />
    <span className="text-2xl">Résumé Panier</span>
    <span className="ml-auto text-lg font-bold text-blue-800 bg-white px-4 py-2 rounded-xl shadow-md border-2 border-blue-200">
      {formData.produits.length} article{formData.produits.length !== 1 ? 's' : ''}
    </span>
  </h3>
  
  <div className="space-y-4 text-lg">
    {formData.produits.map((p, i) => (
      <div key={i} className="flex justify-between items-center p-4 bg-slate-50/80 hover:bg-slate-50 border-l-4 border-blue-400 rounded-xl shadow-sm">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="font-bold text-blue-700 text-sm">{p.quantity}</span>
          </div>
          <span className="font-semibold text-slate-900 truncate">{p.nom}</span>
        </div>
        <span className="font-black text-xl text-blue-800 bg-white px-4 py-2 rounded-lg shadow-md border border-blue-200 min-w-[140px] text-right">
          {(p.prixClient * p.quantity).toLocaleString()} FCFA
        </span>
      </div>
    ))}
    
    <div className="border-t-4 border-blue-200 pt-6 mt-6 p-6 bg-gradient-to-r from-blue-50 to-slate-50/50 rounded-2xl shadow-lg">
      <div className="flex justify-between items-end text-2xl font-black">
        <span className="text-slate-900 tracking-wide uppercase">TOTAL :</span>
        <span className="text-3xl text-blue-800 bg-white px-6 py-3 rounded-2xl shadow-2xl border-4 border-blue-200">
          {formData.prixTotal.toLocaleString()} FCFA
        </span>
      </div>
      <p className="text-sm text-slate-600 mt-2 flex items-center gap-2 font-semibold">
        <CheckCircle className="w-4 h-4 text-emerald-600" />
        Paiement à la livraison - Livraison gratuite
      </p>
    </div>
  </div>
</div>
      </div>
    </div>
  );
};

export default CommandePage;

//la commande passe avec ceci.