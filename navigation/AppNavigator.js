import React, { createContext, useContext, useEffect, useState } from 'react';
import { Image, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { onAuthStateChanged } from "firebase/auth";
import "firebase/auth"
import { auth } from '../src/services/firebaseService';

import SplashScreen from '../src/screens/SplashScreen';
import RegisterScreen from '../src/screens/auth/RegisterScreen';
import LoginScreen from '../src/screens/auth/LoginScreen';
import HomeScreen from '../src/screens/HomeScreen';
import UserScreen from '../src/screens/UserScreen';
import SettingsScreen from '../src/screens/SettingsScreen';
import RaffleListScreen from '../src/screens/RaffleListScreen';
import CreateRaffleScreen from '../src/screens/CreateRaffleScreen';
import RaffleDetailScreen from '../src/screens/RaffleDetailScreen';
import RaffleTableScreen from '../src/screens/RaffleTableScreen';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const TabNavigator = () => {
    const { user } = useAuth();

    return(
        <Tab.Navigator
            initialRouteName="Home"
            screenOptions={({route})=>({
                tabBarIcon: ({color, size, focused})=>{
                    let iconName;

                    if (route.name === "Home") {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if(route.name === "Raffles"){
                        iconName = focused ? 'trophy' : 'trophy-outline';
                    } else if(route.name === "User"){
                        if (user?.photoURL) {
                            return (
                                <Image
                                    source={{ uri: user.photoURL }}
                                    style={{
                                        width: size,
                                        height: size,
                                        borderRadius: size / 2,
                                        borderWidth: focused ? 2 : 0,
                                        borderColor: focused ? '#b60098' : 'transparent',
                                    }}
                                />
                            );
                        }
                        // Mostrar el icono por defecto
                        return <Ionicons name={focused ? 'person' : 'person-outline'} size={size} color={color} />;
                    } 
                    
                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#37b600',
                tabBarInactiveTintColor: 'gray',
                headerShown: false,
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} options={{tabBarLabel:'Home'}}/>
            <Tab.Screen name="Raffles" component={RaffleListScreen} options={{tabBarLabel:'Rifas'}}/>
            <Tab.Screen name="User" component={UserScreen} options={{tabBarLabel:'Usuario'}}/>
            <Tab.Screen name="Settings" component={SettingsScreen} options={{tabBarLabel:'Ajustes'}}/>
        </Tab.Navigator>
    )
}   

const AppNavigator = () => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const unsuscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setIsLoading(false);
        });
        return () => unsuscribe();
    },[]);

    const authContextValue = {
        user,
        setUser,
        isLoading,
        setIsLoading,
    };

    if(isLoading){
        return <SplashScreen/>;
    }

    return (
        <AuthContext.Provider value={authContextValue}>
            <Stack.Navigator initialRouteName={user ? 'Main' : 'Login'}>
                {user ? (
                    <>
                        <Stack.Screen name="Main" component={TabNavigator} options={{headerShown: false}} />
                        <Stack.Screen name="CreateRaffle" component={CreateRaffleScreen} options={{ title: 'Crear Sorteo' }} />
                        <Stack.Screen name="RaffleDetail" component={RaffleDetailScreen} options={{ title: 'Detalles del Sorteo' }} />
                        <Stack.Screen name="RaffleTable" component={RaffleTableScreen} options={{ title: 'Tabla de Números' }} />
                    </>
                ) : (
                    <>
                        <Stack.Screen name="Login" component={LoginScreen} options={{headerShown: false}} />
                        <Stack.Screen name="Register" component={RegisterScreen} options={{headerShown: false}} />
                    </>
                )}
            </Stack.Navigator>
        </AuthContext.Provider>   
    );
}

export default AppNavigator;