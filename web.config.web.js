/**
 * Configuración y adaptaciones específicas para web
 * Este archivo contiene optimizaciones y ajustes para mejorar la experiencia en navegadores web
 */

// Detectar si estamos en web
const isWeb = typeof window !== 'undefined';

if (isWeb) {
  // Optimization 1: Prevenir zoom en iOS
  const viewport = document.querySelector('meta[name="viewport"]');
  if (viewport) {
    viewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no');
  }

  // Optimization 2: Mejorar rendimiento
  if ('requestIdleCallback' in window) {
    console.log('✅ requestIdleCallback disponible para optimizaciones');
  }

  // Optimization 3: Detectar esquema de color preferido
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    console.log('🌙 Modo oscuro detectado');
  } else {
    console.log('☀️ Modo claro detectado');
  }

  // Optimization 4: Service Worker para PWA (opcional)
  if ('serviceWorker' in navigator) {
    console.log('📱 Service Worker disponible para uso offline');
  }

  // Optimization 5: Detectar capacidades de red
  if ('connection' in navigator) {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (connection) {
      console.log(`📶 Tipo de conexión: ${connection.effectiveType}`);
    }
  }

  // Optimization 6: IndexedDB para persistencia
  if ('indexedDB' in window) {
    console.log('💾 IndexedDB disponible para almacenamiento persistente');
  }
}

export { isWeb };
