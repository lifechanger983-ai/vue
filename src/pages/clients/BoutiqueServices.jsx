import { useOutletContext, useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, ShoppingBag, HeartPulse, Package } from 'lucide-react';

const ServiceCard = ({ service, onClick }) => {
  // Fonction pour détecter si l'image est accessible
  const handleImageError = (e) => {
    e.target.style.display = 'none'; // Cache l'img en erreur
    e.target.nextElementSibling.style.display = 'flex'; // Affiche l'icône
  };

  return (
    <button
      onClick={() => onClick(service)}
      className="group relative w-full h-80 bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-xl border-2 border-slate-800/50 rounded-3xl p-8 flex flex-col items-center justify-center text-center hover:border-[var(--boutique-primary)] hover:shadow-2xl hover:shadow-[var(--boutique-primary)]/30 transition-all duration-500 hover:scale-[1.02]"
    >
      {/* Image Service depuis DB avec fallback */}
      <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-r from-[var(--boutique-primary)]/20 to-white/10 rounded-3xl flex items-center justify-center border-4 border-[var(--boutique-primary)]/30 group-hover:border-[var(--boutique-primary)] group-hover:bg-[var(--boutique-primary)]/30 transition-all relative overflow-hidden">
        
        {/* Image principale depuis service.photo */}
        {service.photo && (
          <img 
            src={service.photo} 
            alt={service.nom}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={handleImageError}
            loading="lazy"
          />
        )}
        
        {/* Fallback icônes (caché si image OK) */}
        <div 
          className={`absolute inset-0 w-full h-full flex items-center justify-center ${
            service.photo ? 'hidden' : 'flex'
          }`}
        >
          {service.nom.includes('LONG RICH') && <ShoppingBag className="w-20 h-20 text-[var(--boutique-primary)] drop-shadow-lg" />}
          {service.nom.includes('SANTE') && <HeartPulse className="w-20 h-20 text-[var(--boutique-primary)] drop-shadow-lg" />}
          {service.nom.includes('AUTRE') && <Package className="w-20 h-20 text-[var(--boutique-primary)] drop-shadow-lg" />}
        </div>
      </div>
      
      <h3 className="text-2xl font-black text-white mb-4 group-hover:text-[var(--boutique-primary)] transition-colors">
        {service.nom.replace('SERVICE_', '').replace(/_/g, ' ')}
      </h3>
      <p className="text-slate-400 text-sm mb-8 max-w-sm leading-relaxed">
        {service.description}
      </p>
      
      <div className="flex items-center gap-2 text-lg font-bold text-[var(--boutique-primary)] opacity-0 group-hover:opacity-100 transition-all duration-300">
        <span>Découvrir</span>
        <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
      </div>
    </button>
  );
};


const BoutiqueServices = () => {
  const { boutiqueConfig } = useOutletContext();
  const { proprietaire } = boutiqueConfig || {};
  const navigate = useNavigate();
  const { urlBoutique } = useParams();

  const handleServiceClick = (service) => {
    console.log('🛒 Service cliqué:', service.nom);
    
    if (service.nom.includes('LONG RICH')) {
      navigate(`/boutique/${urlBoutique}/produits-longrich`);
    } else if (service.nom.includes('SANTE')) {
      alert('Packs Santé - Prochainement disponible');
    } else {
      alert('Autres Produits - Prochainement disponible');
    }
  };

  console.log('📋 Services boutique:', boutiqueConfig?.services);  // ✅ DEBUG

  return (
    <div className="max-w-4xl mx-auto space-y-20">
      {/* Photo Propriétaire */}
      {proprietaire && (
        <div className="text-center space-y-6">
          <div className="w-36 h-36 mx-auto rounded-full overflow-hidden border-4 border-[var(--boutique-primary)] shadow-2xl ring-4 ring-[var(--boutique-primary)]/20">
            <img 
              src={proprietaire.photo || 'https://via.placeholder.com/300/10b981/ffffff?text=Photo'} 
              alt={proprietaire.nom}
              className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
              onError={(e) => e.target.src = 'https://via.placeholder.com/300/10b981/ffffff?text=Photo'}
            />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-[var(--boutique-primary)] to-emerald-400 bg-clip-text text-transparent mb-2">
              {proprietaire.sexe === 'F' ? 'Mme' : 'M.'} {proprietaire.nom}
            </h1>
            <p className="text-xl text-slate-400">Partenaire officiel Longrich</p>
          </div>
        </div>
      )}

      {/* Grille Services */}
      <div className="space-y-12">
        <div className="text-center">
          <h2 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent mb-6 tracking-tight">
            Services Disponibles
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Cliquez pour explorer les produits de chaque service
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {boutiqueConfig?.services?.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onClick={handleServiceClick}
            />
          ))}
        </div>

        {(!boutiqueConfig?.services || boutiqueConfig.services.length === 0) && (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-8 bg-slate-800/50 rounded-3xl flex items-center justify-center">
              <svg className="w-12 h-12 text-slate-500" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>
            <h3 className="text-3xl font-bold text-slate-400 mb-4">Aucun service activé</h3>
            <p className="text-slate-500 max-w-md mx-auto">
              Le propriétaire n'a activé aucun service pour cette boutique
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BoutiqueServices;
