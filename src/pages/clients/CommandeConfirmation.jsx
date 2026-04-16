import React, { useEffect } from 'react';
import { CheckCircle, Phone, MapPin } from 'lucide-react';
import ReceiptPDF from '../../components/clients/ReceiptPDF';
import { useSearchParams } from 'react-router-dom';

const CommandeConfirmation = () => {
  const [searchParams] = useSearchParams();
  const commandeData = searchParams.get('data') ? JSON.parse(decodeURIComponent(searchParams.get('data'))) : null;

  useEffect(() => {
    // Scroll top
    window.scrollTo(0, 0);
  }, []);

  if (!commandeData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 py-20">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="w-24 h-24 bg-red-100 rounded-2xl mx-auto mb-6 flex items-center justify-center">
            <div className="text-red-500 text-3xl">!</div>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Commande non trouvée</h1>
          <a href="/boutique" className="text-emerald-600 hover:underline font-medium">
            Retour boutiques
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* HEADER SUCCÈS */}
        <div className="text-center mb-12">
          <div className="w-28 h-28 bg-emerald-100 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-2xl">
            <CheckCircle className="w-16 h-16 text-emerald-600" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-4">
            Commande confirmée !
          </h1>
          <p className="text-xl text-slate-600 mb-2">N° {commandeData.commandeId.slice(-8).toUpperCase()}</p>
          <div className="bg-emerald-100 p-4 rounded-xl max-w-sm mx-auto">
            <p className="font-bold text-emerald-800 text-lg">
              {commandeData.total.toLocaleString()} FCFA
            </p>
          </div>
        </div>

        {/* ACTIONS PRINCIPALES */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <ReceiptPDF commandeId={commandeData.commandeId} className="w-full" />
          <a
            href={`https://wa.me/237${commandeData.client.telephone.replace(/\D/g, '')}?text=Bonjour%20je%20viens%20de%20passer%20une%20commande%20N°${commandeData.commandeId.slice(-8)}`}
            className="group flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            <Phone className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
            Contacter par WhatsApp
          </a>
        </div>

        {/* DÉTAILS */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
            <MapPin className="w-8 h-8 text-emerald-600" />
            Infos livraison
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div>
              <p className="text-slate-700 font-medium mb-1">Client</p>
              <p className="font-bold text-slate-900">{commandeData.client.nom}</p>
            </div>
            <div>
              <p className="text-slate-700 font-medium mb-1">Téléphone</p>
              <p className="font-mono text-emerald-700">{commandeData.client.telephone}</p>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-200">
            <p className="text-slate-600 text-center">
              📦 Livraison gratuite dans Yaoundé Centre sous 24-48h<br/>
              💰 Paiement à la livraison<br/>
              🧾 Présentez votre reçu PDF au livreur
            </p>
          </div>
        </div>

        {/* BOUTONS SECONDAIRES */}
        <div className="flex flex-col sm:flex-row gap-4 mt-12">
          <a
            href={`/boutique/${window.location.pathname.split('/')[2]}`}
            className="flex-1 text-center py-4 px-8 border-2 border-emerald-200 bg-emerald-50 text-emerald-700 font-bold rounded-xl hover:bg-emerald-100 transition-all"
          >
            ← Continuer achats
          </a>
          <a
            href="/boutique"
            className="flex-1 text-center py-4 px-8 border-2 border-slate-200 bg-white text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all"
          >
            Autres boutiques
          </a>
        </div>
      </div>
    </div>
  );
};

export default CommandeConfirmation;