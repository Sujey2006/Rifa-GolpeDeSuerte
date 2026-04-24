import { StatusBar } from 'expo-status-bar';
import AppNavigator from './navigation/AppNavigator';
import AppProvider from './navigation/AppProvider';
import { ThemeProvider } from './navigation/ThemeContext';
import { NavigationContainer } from '@react-navigation/native';
import { Platform } from 'react-native';

export default function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <NavigationContainer>
          <AppNavigator/>
          {Platform.OS !== 'movil' && <StatusBar/>}
        </NavigationContainer>
      </AppProvider>
    </ThemeProvider>
  );
}
