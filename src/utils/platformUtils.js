import { Platform } from 'react-native';

/**
 * Detecta si la app está corriendo en web
 */
export const isWeb = Platform.OS === 'web';
export const isMobile = Platform.OS !== 'web';

/**
 * Obtiene la dimensión máxima para responsividad en web
 */
export const getMaxWidth = () => {
  return isWeb ? 1200 : '100%';
};

/**
 * Obtiene el padding basado en la plataforma
 */
export const getPadding = (mobileValue = 16, webValue = 20) => {
  return isWeb ? webValue : mobileValue;
};

/**
 * Helper para estilos responsivos
 */
export const getResponsiveStyle = (style) => {
  if (!isWeb) return style;
  
  return {
    ...style,
    maxWidth: getMaxWidth(),
    marginLeft: 'auto',
    marginRight: 'auto',
  };
};

/**
 * Obtiene el tamaño de fuente responsivo
 */
export const getResponsiveFontSize = (baseFontSize) => {
  if (!isWeb) return baseFontSize;
  // En web, podemos hacer fonalizar un poco más pequeño
  return baseFontSize * 0.95;
};

/**
 * Log de información según plataforma
 */
export const logPlatform = () => {
  console.log(`🍀 Golpe de Suerte ejecutándose en: ${isWeb ? 'WEB' : 'MÓVIL'}`);
};

export default {
  isWeb,
  isMobile,
  getMaxWidth,
  getPadding,
  getResponsiveStyle,
  getResponsiveFontSize,
  logPlatform,
};
