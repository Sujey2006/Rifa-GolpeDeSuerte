import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebaseService';
import colors from '../constants/colors';

const SettingsScreen = () => {
    const [notifications, setNotifications] = useState(true);
    const [darkMode, setDarkMode] = useState(false);

    const handleSignOut = async () => {
        Alert.alert(
            "Cerrar Sesión",
            "¿Estás seguro de que quieres salir?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Salir",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await signOut(auth);
                        } catch (error) {
                            Alert.alert("Error", "No se pudo cerrar la sesión.");
                        }
                    }
                }
            ]
        );
    };

    const SettingItem = ({ icon, title, type = 'chevron', value, onValueChange, onPress, color = '#444' }) => (
        <TouchableOpacity
            style={styles.settingItem}
            onPress={onPress}
            disabled={type === 'switch'}
        >
            <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
                <Ionicons name={icon} size={22} color={color} />
            </View>
            <Text style={styles.settingTitle}>{title}</Text>
            {type === 'switch' ? (
                <Switch
                    value={value}
                    onValueChange={onValueChange}
                    trackColor={{ false: "#ddd", true: "#2d8f3a" }}
                />
            ) : (
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
            )}
        </TouchableOpacity>
    );

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Ajustes</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionLabel}>Cuenta</Text>
                <SettingItem
                    icon="person-outline"
                    title="Editar Perfil"
                    color="#2d8f3a"
                    onPress={() => {}}
                />
                <SettingItem
                    icon="lock-closed-outline"
                    title="Seguridad"
                    color="#1976d2"
                    onPress={() => {}}
                />
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionLabel}>Preferencias</Text>
                <SettingItem
                    icon="notifications-outline"
                    title="Notificaciones"
                    type="switch"
                    value={notifications}
                    onValueChange={setNotifications}
                    color="#f57c00"
                />
                <SettingItem
                    icon="moon-outline"
                    title="Modo Oscuro"
                    type="switch"
                    value={darkMode}
                    onValueChange={setDarkMode}
                    color="#673ab7"
                />
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionLabel}>Más información</Text>
                <SettingItem
                    icon="help-circle-outline"
                    title="Ayuda y Soporte"
                    color="#009688"
                />
                <SettingItem
                    icon="document-text-outline"
                    title="Términos y Privacidad"
                    color="#607d8b"
                />
            </View>

            <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
                <Ionicons name="log-out-outline" size={22} color="#e74c3c" />
                <Text style={styles.signOutText}>Cerrar Sesión</Text>
            </TouchableOpacity>

            <Text style={styles.versionText}>Versión 5.0.5</Text>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: '#fff',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
    },
    section: {
        marginTop: 25,
        paddingHorizontal: 20,
    },
    sectionLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#999',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 10,
        marginLeft: 5,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 15,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOpacity: 0.03,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    settingTitle: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    signOutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        marginHorizontal: 20,
        marginTop: 35,
        padding: 16,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#ffcdd2',
    },
    signOutText: {
        marginLeft: 10,
        fontSize: 16,
        fontWeight: 'bold',
        color: '#e74c3c',
    },
    versionText: {
        textAlign: 'center',
        color: '#bbb',
        fontSize: 12,
        marginTop: 20,
        marginBottom: 40,
    },
});

export default SettingsScreen;
