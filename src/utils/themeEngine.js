export const applyTheme = (theme) => {
  const root = document.documentElement;
  if (!theme) return;
  
  root.style.setProperty('--boutique-primary', theme.primaire || '#10b981');
  root.style.setProperty('--boutique-secondary', theme.secondaire || '#0f172a');
};
