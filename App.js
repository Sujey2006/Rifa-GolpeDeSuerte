import { StatusBar } from 'expo-status-bar';
import AppNavigator from './navigation/AppNavigator';
import AppProvider from './navigation/AppProvider';
import { NavigationContainer } from '@react-navigation/native';
import { Platform } from 'react-native';

export default function App() {
  return (
    <AppProvider>
      <NavigationContainer>
        <AppNavigator/>
        {Platform.OS !== 'web' && <StatusBar/>}
      </NavigationContainer>
    </AppProvider>
  );
}
