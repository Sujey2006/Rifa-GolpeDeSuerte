// Configuración para compatibilidad web
export const isWeb = typeof window !== 'undefined' && typeof window.document !== 'undefined';
export const isMobile = !isWeb;

// Adaptaciones para web y móvil
export const getPlatformConfig = () => {
  return {
    isWeb,
    isMobile,
    maxWidth: isWeb ? 600 : '100%',
    padding: isWeb ? 20 : 16,
  };
};

// Helper para imágenes que funciona en web y móvil
export const getImageSource = (imagePath) => {
  if (isWeb) {
    // En web, las imágenes estáticas necesitan ser importadas correctamente
    return imagePath;
  }
  return imagePath;
};
