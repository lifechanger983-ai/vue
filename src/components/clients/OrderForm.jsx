import React, { useState } from 'react';
import { useCart } from '../../contexts/CartContext';
import api from '../../api/axiosConfig';

const OrderForm = ({ boutiqueUrl, onSuccess }) => {
  const { items, clearCart, totalPrice } = useCart();
  const [formData, setFormData] = useState({
    nom: '',
    sexe: 'M',
    telephone: '',
    email: '',
    quartier: '',
    adresseLivraison: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nom || !formData.telephone) {
      setError('Nom et téléphone obligatoires');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const produits = items.map(item => ({
        id: item.id,
        nom: item.nom,
        prixClient: item.prixClient,
        prixPromo: item.prixPromo || 0,
        promoActive: item.promoActive || false,
        quantity: item.quantity
      }));

      const response = await api.post('/client/commandes', {
        ...formData,
        boutiqueUrl,
        produits,
        prixTotal: totalPrice
      });

      if (response.data.success) {
        clearCart();
        onSuccess(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur commande');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-slate-200">
      <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">
        Finaliser Commande
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-xl text-sm">
            {error}
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Nom complet *
          </label>
          <input
            type="text"
            value={formData.nom}
            onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Sexe</label>
            <select
              value={formData.sexe}
              onChange={(e) => setFormData({ ...formData, sexe: e.target.value })}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
            >
              <option value="M">M</option>
              <option value="F">F</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Téléphone *
            </label>
            <input
              type="tel"
              value={formData.telephone}
              onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Quartier</label>
          <input
            type="text"
            value={formData.quartier}
            onChange={(e) => setFormData({ ...formData, quartier: e.target.value })}
            placeholder="Ex: Bastos, Hippodrome..."
            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Adresse livraison
          </label>
          <textarea
            value={formData.adresseLivraison}
            onChange={(e) => setFormData({ ...formData, adresseLivraison: e.target.value })}
            rows="2"
            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 resize-none"
            placeholder="Rue, N°, Repères..."
          />
        </div>

        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
          <div className="flex justify-between text-lg font-bold text-slate-900">
            <span>Total:</span>
            <span>{totalPrice.toLocaleString()} FCFA</span>
          </div>
          <div className="text-sm text-emerald-700 mt-1">
            Livraison gratuite Yaoundé Centre
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || items.length === 0}
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              Création commande...
            </>
          ) : (
            '✅ Passer commande'
          )}
        </button>
      </form>
    </div>
  );
};

export default OrderForm;