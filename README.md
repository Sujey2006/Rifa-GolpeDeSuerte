# 🍀 Golpe de Suerte - Sistema de Gestión de Rifas

Una aplicación moderna para gestionar sorteos y rifas, compatible con **Android, iOS y Web**.

## 📱 Características principales

- ✅ Crear y gestionar múltiples sorteos simultáneamente
- ✅ Agregar participantes con números (00-99)
- ✅ Tracking de pagos (pagado/pendiente)
- ✅ Tabla de números interactiva
- ✅ Panel de control con estadísticas en tiempo real
- ✅ Autenticación con Firebase
- ✅ Base de datos SQLite (móvil) / IndexedDB (web)
- ✅ Interfaz responsiva
- ✅ Tema verde con imagen de trébol

## 🚀 Inicio rápido

### Instalación
```bash
npm install
# o
yarn install
```

### Ejecución en móvil (Android)
```bash
npm run android
# o
npx expo start --android
```

### Ejecución en móvil (iOS)
```bash
npm run ios
# o
npx expo start --ios
```

### Ejecución en Web
```bash
npm run web
# o
npx expo start --web
```

Accede a: **http://localhost:19006**

### Ejecución general (elige la plataforma)
```bash
npm start
# Luego presiona:
# - 'a' para Android
# - 'i' para iOS
# - 'w' para Web
```

## 📋 Estructura del proyecto

```
GolpedeSuerte-2/
├── App.js                          # Punto de entrada
├── navigation/
│   ├── AppNavigator.js            # Stack y Tab navigation (web + móvil compatible)
│   ├── AppProvider.js             # Inicialización de BD
│   └── AuthContext.js             # Contexto de autenticación
├── src/
│   ├── screens/
│   │   ├── HomeScreen.js          # Panel principal con gestión de sorteos
│   │   ├── RaffleListScreen.js    # Lista de sorteos
│   │   ├── CreateRaffleScreen.js  # Crear nuevo sorteo
│   │   ├── RaffleDetailScreen.js  # Detalles del sorteo
│   │   ├── RaffleTableScreen.js   # Tabla de números 00-99
│   │   ├── UserScreen.js          # Perfil de usuario
│   │   ├── SettingsScreen.js      # Ajustes y cerrar sesión
│   │   └── auth/
│   │       ├── LoginScreen.js
│   │       └── RegisterScreen.js
│   ├── services/
│   │   ├── firebaseService.js     # Configuración Firebase
│   │   └── sqliteService.js       # Operaciones de base de datos
│   ├── constants/
│   │   └── colors.js              # Paleta de colores (tonos verdes)
│   └── utils/
│       └── platformUtils.js       # Helpers web/móvil compatibility
├── assets/
│   └── Logo.png                   # Logo de la app
└── package.json
```

## 🎨 Paleta de colores

- **Principal**: Verde trébol (#08a300)
- **Variantes verdes**: Tonos desde #006400 hasta #98FB98
- **Acentos**: Rojo (#FF6B6B), Naranja (#f7a819)
- **Fondos**: Blanco (#fff), Verde claro (#eaf7ea)

## 🔧 Compatibilidad

### Plataformas soportadas
| Plataforma | Estado | Notas |
|-----------|--------|-------|
| Android   | ✅ Full | Completa |
| iOS       | ✅ Full | Completa |
| Web       | ✅ Full | Responsive |

### Navegadores compatibles (Web)
- Chrome (recomendado)
- Firefox
- Safari
- Edge

## 📦 Dependencias principales

```json
{
  "@react-navigation/bottom-tabs": "^7.15.2",
  "@react-navigation/native": "^7.1.31",
  "@react-navigation/stack": "^7.8.2",
  "expo": "^55.0.14",
  "expo-sqlite": "~55.0.15",
  "firebase": "^12.12.0",
  "react-native": "0.83.4",
  "react-native-web": "^0.21.0"
}
```

## 🔐 Autenticación

La app usa **Firebase Authentication** para:
- Registro de usuarios
- Login seguro
- Persistencia de sesión

### Variables de entorno necesarias
Crear archivo `.env` en la raíz:
```
EXPO_PUBLIC_FIREBASE_API_KEY=tu_clave_aqui
EXPO_PUBLIC_AUTH_DOMAIN=tu_dominio.firebaseapp.com
EXPO_PUBLIC_PROJECT_ID=tu_proyecto
EXPO_PUBLIC_STORAGE_BUCKET=tu_storage.firebasestorage.app
EXPO_PUBLIC_MESSAGING_SENDER_ID=tu_id
EXPO_PUBLIC_APP_ID=tu_app_id
```

## 💾 Base de datos

### Móvil
- **SQLite** (expo-sqlite) con persistencia nativa

### Web
- **IndexedDB** (mediante expo-sqlite adapter)
- Datos almacenados localmente en el navegador

## 🌐 URLs de acceso

| Entorno | URL |
|---------|-----|
| Local Web | http://localhost:19006 |
| Red Local | http://tu-ip:19006 |

## 📝 Funcionalidades por pantalla

### HomeScreen (Panel Principal)
- Vista de todos los sorteos
- Selector de sorteo activo
- Panel de control con 5 cards de estadísticas
- Filtros (nombre, estado de pago)
- Agregar participantes
- Editar sorteo
- Editar participantes (tap en lista)

### RaffleListScreen
- Lista de sorteos activos
- Cards con información (premio, fecha, costo)
- Botón para crear nuevo sorteo

### CreateRaffleScreen
- Formulario para nuevo sorteo
- Campos: nombre, premio, descripción, fecha fin, costo boleto

### RaffleTableScreen
- Tabla interactiva 00-99
- Editar participante por número
- Modal para agregar/editar datos

## 🐛 Troubleshooting

### Error en web: "Imagen no carga"
- Verificar que `Logo.png` esté en `/assets/`
- Usar `require()` para referencias estáticas (ya está implementado)

### Error SQLite en web
- Expo SQLite usa IndexedDB automáticamente
- Los datos persisten en el navegador

### "Module not found" en web
- Ejecutar: `npm install`
- Limpiar cache: `rm -rf node_modules/.cache`
- Reiniciar servidor: `npm run web`

## 📱 Desarrollo

### Formato de código
- **Lenguaje**: JavaScript/React Native
- **Navegación**: React Navigation
- **Estilos**: StyleSheet de React Native
- **Base de datos**: SQLite (móvil) / IndexedDB (web)

### Testing
Para probar la app:
1. Crear usuario en Firebase Console
2. Crear sorteo desde RaffleListScreen
3. Agregar participantes
4. Verificar estadísticas en HomeScreen

## 🚀 Producción

### Build para Android
```bash
npx expo build --platform android
```

### Build para iOS
```bash
npx expo build --platform ios
```

### Export para Web
```bash
npx expo export --platform web
```

## 📄 Licencia

Proyecto personal - 2026

## 👨‍💻 Desarrollo

Desarrollado con:
- Expo
- React Native
- React Navigation
- Firebase
- SQLite

---

**🍀 ¡Buena suerte con tus rifas!** 🍀
