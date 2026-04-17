# 🍀 Golpe de Suerte - Guía de Compatibilidad Web

# Instrucciones para ejecutar en Web

# 1. Iniciar en navegador web
```bash
npx expo start --web
```

# 2. Características soportadas en Web
- ✅ Autenticación Firebase
- ✅ SQLite (via expo-sqlite con IndexedDB)
- ✅ Interfaz responsive
- ✅ Todos los sorteos y participantes
- ✅ Edición de datos en tiempo real

# 3. Características optimizadas para web
- StatusBar deshabilitado en web (solo móvil)
- Navegación compatible con stack y bottom tabs
- Imágenes estáticas requieren import() - FUNCIONAN
- Modal compatible en web

# 4. URLs de acceso
- **Local**: http://localhost:19006
- **En red**: Tu IP:19006

# 5. Notas importantes
- Los datos se guardan en IndexedDB en web (no en SQLite nativo)
- La app es completamente responsiva
- Compatible con navegadores modernos: Chrome, Firefox, Safari, Edge

# 6. Comando para producción
```bash
npx expo export --web
```
Desarrollado con 🩷 usando Expo + React Native Web
