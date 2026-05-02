import { StatusBar } from 'expo-status-bar';
import AppNavigator from './navigation/AppNavigator';
import AppProvider from './navigation/AppProvider';
import { ThemeProvider } from './navigation/ThemeContext';
import { NavigationContainer } from '@react-navigation/native';
import { Platform } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';
import { useEffect } from 'react';

export default function App() {

  useEffect(() => {
    if (Platform.OS === 'android') {
      const configureSystemBars = async () => {
        // Ponemos la barra de navegación en modo "Deslizamiento" (oculta pero accesible)
        // 'sticky-immersive' es el mejor para que los botones no "empujen" el contenido
        await NavigationBar.setVisibilityAsync('hidden');
        await NavigationBar.setBehaviorAsync('sticky-immersive');

        // Hacemos que el fondo de la barra sea transparente por si aparece
        await NavigationBar.setBackgroundColorAsync('#00000000');
      };
      configureSystemBars();
    }
  }, []);

  return (
    <ThemeProvider>
      <AppProvider>
        <NavigationContainer>
          <AppNavigator/>
          {/* StatusBar transparente para que no interfiera visualmente */}
          <StatusBar style="light" translucent={true} />
        </NavigationContainer>
      </AppProvider>
    </ThemeProvider>
  );
}
