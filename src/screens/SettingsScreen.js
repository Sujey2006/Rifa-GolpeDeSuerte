import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, Linking, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebaseService';
import { useTheme } from '../../navigation/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';

const SettingsScreen = () => {
    const { mainColor, changeMainColor } = useTheme();
    const [notifications, setNotifications] = useState(true);
    const [biometrics, setBiometrics] = useState(false);
    const [language, setLanguage] = useState('Español');

    const colorGroups = [
        { label: 'Naturales', colors: ['#2d8f3a', '#1976d2', '#7b1fa2', '#d32f2f', '#ffa000'] },
        { label: 'Pasteles', colors: ['#f06292', '#4db6ac', '#ff8a65', '#90a4ae', '#81c784'] },
        { label: 'Vibrantes', colors: ['#e91e63', '#00bcd4', '#ffeb3b', '#673ab7', '#3f51b5'] }
    ];

    const handleSignOut = async () => {
        Alert.alert("Cerrar Sesión", "¿Seguro que quieres salir?", [
            { text: "No" },
            { text: "Sí", style: "destructive", onPress: async () => {
                try { await signOut(auth); } catch (e) {}
            }}
        ]);
    };

    const onShare = async () => {
        try {
            await Share.share({
                message: '¡Organiza tus rifas con Golpe de Suerte! Descarga la app aquí: https://github.com/Sujey2006/Rifa-GolpeDeSuerte',
            });
        } catch (error) { console.error(error); }
    };

    const SettingItem = ({ icon, title, subtitle, onPress, toggle, value, onValueChange, color = mainColor }) => (
        <TouchableOpacity style={styles.item} onPress={onPress} disabled={toggle}>
            <LinearGradient
                colors={[color + '33', color + '11']}
                style={styles.iconBox}
            >
                <Ionicons name={icon} size={20} color={color} />
            </LinearGradient>
            <View style={styles.itemInfo}>
                <Text style={styles.itemTitle}>{title}</Text>
                {subtitle && <Text style={styles.itemSub}>{subtitle}</Text>}
            </View>
            {toggle ? (
                <Switch value={value} onValueChange={onValueChange} trackColor={{ true: mainColor }} />
            ) : (
                <Ionicons name="chevron-forward" size={18} color="#000000" />
            )}
        </TouchableOpacity>
    );

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* CABECERA CON DEGRADADO NEGRO Y COLOR DEL TEMA */}
            <LinearGradient colors={['#000000', mainColor]} style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Configuración</Text>
                    <Text style={styles.headerDesc}>Panel administrativo personalizado</Text>
                </View>
                <LinearGradient
                    colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
                    style={styles.headerIconBg}
                >
                    <Ionicons name="options-outline" size={28} color="#fff" />
                </LinearGradient>
            </LinearGradient>

            <View style={styles.content}>
                {/* APARIENCIA */}
                <Text style={styles.sectionTitle}>APARIENCIA Y ESTILO</Text>
                <View style={styles.card}>
                    <Text style={styles.cardInfo}>Elige el color de identidad de tu App</Text>
                    {colorGroups.map((group, idx) => (
                        <View key={idx} style={styles.paletteGroup}>
                            <View style={styles.paletteGrid}>
                                {group.colors.map((color) => (
                                    <TouchableOpacity
                                        key={color}
                                        onPress={() => changeMainColor(color)}
                                    >
                                        <LinearGradient
                                            colors={[color, color + '99']}
                                            style={[styles.colorCircle, mainColor === color && styles.activeCircle]}
                                        >
                                            {mainColor === color && <Ionicons name="checkmark" size={16} color="#fff" />}
                                        </LinearGradient>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    ))}
                    <View style={styles.divider} />
                    <SettingItem
                        icon="language-outline"
                        title="Idioma"
                        subtitle={language}
                        onPress={() => Alert.alert("Idioma", "Próximamente más idiomas disponibles.")}
                        color={mainColor}
                    />
                </View>

                {/* SEGURIDAD */}
                <Text style={styles.sectionTitle}>SEGURIDAD</Text>
                <View style={styles.card}>
                    <SettingItem
                        icon="lock-closed-outline"
                        title="Cambiar Contraseña"
                        subtitle="Se enviará un correo seguro"
                        onPress={() => Alert.alert("Seguridad", "Se enviará un enlace de recuperación a tu correo.")}
                    />
                    <SettingItem
                        icon="shield-checkmark-outline"
                        title="Verificación en dos pasos"
                        toggle
                        value={biometrics}
                        onValueChange={setBiometrics}
                        color={mainColor}
                    />
                </View>

                {/* APLICACIÓN */}
                <Text style={styles.sectionTitle}>SISTEMA Y AYUDA</Text>
                <View style={styles.card}>
                    <SettingItem
                        icon="notifications-outline"
                        title="Notificaciones"
                        toggle
                        value={notifications}
                        onValueChange={setNotifications}
                        color={mainColor}
                    />
                    <SettingItem
                        icon="cloud-upload-outline"
                        title="Copia de Seguridad"
                        subtitle="Sincronizar datos con la nube"
                        onPress={() => Alert.alert("Cloud", "Tus datos se sincronizan automáticamente con Firebase.")}
                        color="#4a90e2"
                    />
                    <SettingItem
                        icon="share-social-outline"
                        title="Compartir Aplicación"
                        onPress={onShare}
                        color="#4a90e2"
                    />
                    <SettingItem
                        icon="logo-github"
                        title="GitHub"
                        subtitle="Ver código fuente"
                        onPress={() => Linking.openURL('https://github.com/Sujey2006/Rifa-GolpeDeSuerte')}
                    />
                </View>

                {/* CUENTA */}
                <Text style={styles.sectionTitle}>CUENTA</Text>
                <View style={styles.card}>
                    <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
                        <LinearGradient
                            colors={['#d62231', '#ffbfbf']}
                            start={{x:0, y:0}} end={{x:1, y:0}}
                            style={styles.signOutGradient}
                        >
                            <Ionicons name="log-out-outline" size={22} color="#fff" />
                            <Text style={styles.signOutText}>Cerrar Sesión</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                <Text style={styles.footerText}>Golpe de Suerte v5.0.0 • 2026</Text>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f4f7f4' },
    header: { padding: 30, paddingTop: 60, borderBottomLeftRadius: 40, borderBottomRightRadius: 40, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 15, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 12 },
    headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
    headerDesc: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
    headerIconBg: { width: 55, height: 55, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    content: { padding: 20 },
    sectionTitle: { fontSize: 10, fontWeight: '900', color: '#999', letterSpacing: 1.5, marginBottom: 10, marginLeft: 10, marginTop: 15 },
    card: { backgroundColor: '#fff', borderRadius: 25, padding: 8, elevation: 3, marginBottom: 12, shadowColor: '#000000', shadowOpacity: 0.05, shadowRadius: 10 },
    cardInfo: { fontSize: 12, color: '#aaa', textAlign: 'center', marginVertical: 10, fontWeight: '500' },
    paletteGroup: { marginBottom: 10 },
    paletteGrid: { flexDirection: 'row', justifyContent: 'center', gap: 12, flexWrap: 'wrap', paddingBottom: 5 },
    colorCircle: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center', elevation: 5 },
    activeCircle: { borderWidth: 3, borderColor: 'rgba(255,255,255,0.9)', transform: [{scale: 1.15}] },
    divider: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 10, marginHorizontal: 15 },
    item: { flexDirection: 'row', alignItems: 'center', padding: 15 },
    iconBox: { width: 42, height: 42, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    itemInfo: { flex: 1, marginLeft: 15 },
    itemTitle: { fontSize: 15, fontWeight: 'bold', color: '#333' },
    itemSub: { fontSize: 11, color: '#999', marginTop: 1 },
    signOutBtn: { borderRadius: 20, overflow: 'hidden' },
    signOutGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 18, gap: 10 },
    signOutText: { color: '#fafafa', fontWeight: 'bold', fontSize: 16 },
    footerText: { textAlign: 'center', color: '#000000', fontSize: 10, marginTop: 10, marginBottom: 40, letterSpacing: 1 }
});

export default SettingsScreen;
