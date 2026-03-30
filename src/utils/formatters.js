export const formatPrixCFA = (prix) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XAF',
    minimumFractionDigits: 0
  }).format(prix);
};

export const formatDate = (date) => {
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(date));
};

export const getCategorieLabel = (categorie) => {
  const labels = {
    soin_sante: 'Soin Santé',
    cosmetique: 'Cosmétique',
    complement_alimentaire: 'Complément Alimentaire',
    electronique: 'Électronique',
    electromenager: 'Électroménager',
    agroalimentaire: 'Agroalimentaire',
    usage_quotidien: 'Usage Quotidien',
    textile: 'Textile'
  };
  return labels[categorie] || categorie;
};

export const getPrixAffiche = (produit) => {
  if (produit.promoActive && produit.prixPromo) {
    return produit.prixPromo;
  }
  return produit.prixClient;
};