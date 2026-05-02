import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, FlatList, Linking, Alert, Image, ActivityIndicator, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { updateProfile } from 'firebase/auth';
import { auth } from '../services/firebaseService';
import sqliteService from '../services/sqliteService';
import { selectAndUploadImage } from '../services/cloudinaryService';
import { useTheme } from '../../navigation/ThemeContext';

// IMPORTACIÓN LEGACY: Obligatoria para downloadAsync en Expo SDK 52+
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

const UserScreen = () => {
    const { mainColor } = useTheme();
    const [user, setUser] = useState(auth.currentUser);
    const [ganancias, setGanancias] = useState(0);
    const [boletosTotales, setBoletosTotales] = useState([]);
    const [ganadoresAgrupados, setGanadoresAgrupados] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [isSharing, setIsSharing] = useState(false);

    const [modalBoletos, setModalBoletos] = useState(false);
    const [modalGanadores, setModalGanadores] = useState(false);

    useEffect(() => {
        loadAllData();
        const interval = setInterval(loadAllData, 5000);
        return () => clearInterval(interval);
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadAllData();
            setUser(auth.currentUser);
        }, [])
    );

    const loadAllData = async () => {
        try {
            const todos = await sqliteService.obtenerTodosLosBoletos();
            const ganadoresRaw = await sqliteService.obtenerGanadores();
            setBoletosTotales(todos || []);

            const agrupados = (ganadoresRaw || []).reduce((acc, curr) => {
                const found = acc.find(a => a.sorteo_id === curr.sorteo_id);
                if (found) {
                    found.ganadores.push({ nombre: curr.nombre_participante, numero: curr.numero, monto: curr.monto_ganado });
                } else {
                    acc.push({
                        sorteo_id: curr.sorteo_id,
                        sorteo_nombre: curr.sorteo_nombre,
                        premio: curr.premio,
                        ganadores: [{ nombre: curr.nombre_participante, numero: curr.numero, monto: curr.monto_ganado }]
                    });
                }
                return acc;
            }, []);

            setGanadoresAgrupados(agrupados);
            const total = (todos || []).reduce((acc, curr) => curr.estado_pago === 'pagado' ? acc + (curr.precio_boleto || 0) : acc, 0);
            setGanancias(total);
        } catch (error) {
            console.error("Error cargando datos:", error);
        }
    };

    const handleUpdatePhoto = async () => {
        if (uploading) return;
        try {
            setUploading(true);
            const imageUrl = await selectAndUploadImage();
            if (imageUrl) {
                await updateProfile(auth.currentUser, { photoURL: imageUrl });
                setUser({ ...auth.currentUser, photoURL: imageUrl });
                Alert.alert("Éxito", "Foto de perfil actualizada");
            }
        } catch (error) {
            Alert.alert("Error", "No se pudo actualizar la foto");
        } finally {
            setUploading(false);
        }
    };

    const handleShareAsImage = async (item) => {
        if (isSharing) return;

        try {
            setIsSharing(true);
            const isAvailable = await Sharing.isAvailableAsync();
            if (!isAvailable) {
                Alert.alert("Aviso", "La función de compartir no está disponible en este dispositivo.");
                setIsSharing(false);
                return;
            }

            const themeHex = mainColor.replace('#', '');

            const clean = (s) => (s || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9 ]/g, "").trim();

            const encodeCloudinaryText = (text) => {
                return encodeURIComponent(text)
                    .replace(/,/g, "%252C")
                    .replace(/\//g, "%252F")
                    .replace(/\./g, "%252E");
            };

            const sorteoText = encodeCloudinaryText(clean(item.sorteo_nombre).toUpperCase());

            const rows = item.ganadores.slice(0, 6).map(g => {
                const n = g.numero.toString().padStart(2, '0');
                const name = clean(g.nombre).substring(0, 10).padEnd(10, ' ');
                const prize = (g.monto || 0).toLocaleString('de-DE');
                return `${n}  ${name}  ${prize}`;
            }).join('\n');

            const winnersEncoded = encodeCloudinaryText(rows);

            const urlParts = [
                "https://res.cloudinary.com/dyxwdyqcz/image/upload",
                "w_1080,h_1350,c_fill",
                `e_colorize,co_rgb:${themeHex},o_35`,
                "e_brightness:-45",
                "l_text:Arial_75_bold:GOLPE%20DE%20SUERTE,co_white,g_north,y_100",
                "l_text:Arial_40_bold:RESULTADOS%20OFICIALES,co_black,b_rgb:FFD700,g_north,y_210,inner_padding_10_20,r_20",
                `l_text:Arial_90_bold:${sorteoText},co_white,g_north,y_350`,
                "l_text:Arial_10:.,w_920,h_620,c_fill,b_rgb:000000,o_85,g_center,y_180,r_60",
                `l_text:Courier_50_bold:${winnersEncoded},co_white,g_center,y_180`,
                "l_text:Arial_45_bold:FELICIDADES,co_white,g_south,y_130",
                "v1741125740/v7rscox2qon83eoyp0f0.jpg"
            ];

            const cloudinaryUrl = urlParts.join("/");

            const fileUri = `${FileSystem.cacheDirectory}ganadores_${Date.now()}.jpg`;
            const download = await FileSystem.downloadAsync(cloudinaryUrl, fileUri);

            if (download.status === 200) {
                await Sharing.shareAsync(download.uri, {
                    mimeType: 'image/jpeg',
                    dialogTitle: 'Compartir Resultados',
                    UTI: 'public.jpeg'
                });
            } else {
                Alert.alert("Error", "No se pudo generar la tarjeta. Intenta de nuevo.");
            }
        } catch (err) {
            console.error("Share Error:", err);
            Alert.alert("Error", "No se pudo procesar la imagen.");
        } finally {
            setIsSharing(false);
        }
    };

    const handleEliminarSorteoHistorial = (sorteoId, nombre) => {
        Alert.alert("Eliminar", `¿Borrar registro de ${nombre}?`, [
            { text: "No" },
            { text: "Sí", style: "destructive", onPress: async () => {
                await sqliteService.eliminarSorteo(sorteoId);
                loadAllData();
            }}
        ]);
    };

    const renderSorteoGanador = ({ item }) => (
        <View style={styles.ganadorContainer}>
            <LinearGradient colors={['#000', mainColor]} style={styles.ganadorCard}>
                <View style={styles.ganadorHeader}>
                    <View style={styles.headerTitleRow}>
                        <Ionicons name="trophy" size={16} color="#FFD700" />
                        <Text style={styles.ganadorTitle}>FINALIZADO</Text>
                    </View>
                    <View style={styles.actionRow}>
                        <TouchableOpacity
                            style={[styles.miniActionBtn, { backgroundColor: '#25D366' }]}
                            onPress={() => handleShareAsImage(item)}
                            disabled={isSharing}
                        >
                            <Ionicons name="logo-whatsapp" size={18} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.miniActionBtn} onPress={() => handleEliminarSorteoHistorial(item.sorteo_id, item.sorteo_nombre)}>
                            <Ionicons name="trash" size={18} color="#ff4d4d" />
                        </TouchableOpacity>
                    </View>
                </View>
                <Text style={styles.ganadorSorteo} numberOfLines={1}>{item.sorteo_nombre}</Text>
                <View style={styles.winnersList}>
                    {item.ganadores.map((g, idx) => (
                        <View key={idx} style={styles.winnerMiniRow}>
                            <View style={styles.winMainInfo}>
                                <Text style={styles.winNumber}>#{g.numero.toString().padStart(2, '0')}</Text>
                                <Text style={styles.winName} numberOfLines={1}>{g.nombre}</Text>
                            </View>
                            <Text style={styles.winAmount}>${g.monto?.toLocaleString() || '0'}.000</Text>
                        </View>
                    ))}
                </View>
            </LinearGradient>
        </View>
    );

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <LinearGradient colors={[mainColor, '#000']} style={styles.header}>
                <View style={styles.profileContainer}>
                    <View style={styles.avatarBox}>
                        {user?.photoURL ? (
                            <Image source={{ uri: user.photoURL }} style={styles.profileImage} />
                        ) : (
                            <Ionicons name="person" size={45} color="#fff" />
                        )}
                        {uploading && <ActivityIndicator color="#fff" style={styles.loader} />}
                    </View>
                    <TouchableOpacity style={[styles.cameraBtn, { backgroundColor: mainColor }]} onPress={handleUpdatePhoto} disabled={uploading}>
                        <Ionicons name="camera" size={16} color="#fff" />
                    </TouchableOpacity>
                </View>
                <Text style={styles.userName}>{user?.displayName || 'Administrador'}</Text>
                <Text style={styles.userEmail}>{user?.email}</Text>
            </LinearGradient>

            <View style={styles.gananciasCard}>
                <Text style={styles.gananciasLabel}>GANANCIAS</Text>
                <Text style={[styles.gananciasValue, { color: mainColor }]}>${ganancias.toLocaleString()}.000</Text>
            </View>

            <View style={styles.menu}>
                <TouchableOpacity style={styles.menuItem} onPress={() => setModalBoletos(true)}>
                    <View style={[styles.iconBox, { backgroundColor: mainColor + '15' }]}><Ionicons name="people" size={22} color={mainColor} /></View>
                    <View style={styles.menuTextCol}>
                        <Text style={styles.menuItemTitle}>Participantes Totales</Text>
                        <Text style={styles.menuItemSub}>{boletosTotales.length} registros</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#ccc" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={() => setModalGanadores(true)}>
                    <View style={[styles.iconBox, { backgroundColor: mainColor + '15' }]}><Ionicons name="star" size={22} color={mainColor} /></View>
                    <View style={styles.menuTextCol}>
                        <Text style={styles.menuItemTitle}>Historial de Premios</Text>
                        <Text style={styles.menuItemSub}>{ganadoresAgrupados.length} resultados</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#ccc" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={() => Linking.openURL('https://chat.whatsapp.com/IJeKo49xqcyEFawv4NX5Xy')}>
                    <View style={[styles.iconBox, { backgroundColor: '#ffffff' }]}><Ionicons name="logo-whatsapp" size={30} color="#25d366" /></View>
                    <View style={styles.menuTextCol}>
                        <Text style={styles.menuItemTitle}>WhatsApp</Text>
                        <Text style={styles.menuItemSub}>Grupo Oficial</Text>
                    </View>
                </TouchableOpacity>
            </View>

            {/* Modales */}
            <Modal visible={modalBoletos} animationType="slide">
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => setModalBoletos(false)}><Ionicons name="close" size={30} color="#333" /></TouchableOpacity>
                        <Text style={styles.modalHeaderTitle}>Participantes</Text><View style={{ width: 30 }} />
                    </View>
                    <FlatList
                        data={boletosTotales}
                        keyExtractor={item => item.id.toString()}
                        renderItem={({item}) => (
                            <View style={styles.pCard}>
                                <View style={[styles.pBadge, { backgroundColor: item.estado_pago === 'pagado' ? mainColor : '#eee' }]}>
                                    <Text style={[styles.pBadgeText, { color: item.estado_pago === 'pagado' ? '#fff' : '#888' }]}>{item.numero.toString().padStart(2, '0')}</Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.pName}>{item.nombre_participante || 'Anónimo'}</Text>
                                    <Text style={styles.pSub}>{item.sorteo_nombre}</Text>
                                </View>
                                <TouchableOpacity onPress={() => sqliteService.eliminarBoleto(item.id).then(loadAllData)}><Ionicons name="trash-outline" size={20} color="red" /></TouchableOpacity>
                            </View>
                        )}
                        contentContainerStyle={{ padding: 15 }}
                    />
                </View>
            </Modal>

            <Modal visible={modalGanadores} animationType="slide">
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => setModalGanadores(false)}><Ionicons name="close" size={30} color="#333" /></TouchableOpacity>
                        <Text style={styles.modalHeaderTitle}>Resultados</Text><View style={{ width: 30 }} />
                    </View>
                    <FlatList data={ganadoresAgrupados} keyExtractor={item => `winner-${item.sorteo_id}`} renderItem={renderSorteoGanador} contentContainerStyle={{ padding: 15 }} />
                </View>
            </Modal>

            {isSharing && (
                <View style={styles.sharingOverlay}>
                    <View style={styles.sharingContent}>
                        <ActivityIndicator size="large" color={mainColor} />
                        <Text style={styles.sharingText}>Generando Imagen...</Text>
                        <Text style={styles.sharingSubText}>Preparando tarjeta para WhatsApp</Text>
                    </View>
                </View>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f7f5' },
    header: { paddingTop: 60, paddingBottom: 40, alignItems: 'center', borderBottomLeftRadius: 35, borderBottomRightRadius: 35, elevation: 10 },
    profileContainer: { position: 'relative', marginBottom: 12 },
    avatarBox: { width: 85, height: 85, borderRadius: 42.5, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff', overflow: 'hidden' },
    profileImage: { width: '100%', height: '100%' },
    cameraBtn: { position: 'absolute', bottom: 0, right: 0, padding: 6, borderRadius: 15, borderWidth: 2, borderColor: '#fff', elevation: 5 },
    userName: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginTop: 5 },
    userEmail: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },
    gananciasCard: { backgroundColor: '#fff', marginHorizontal: 30, marginTop: -35, borderRadius: 25, padding: 22, alignItems: 'center', elevation: 10 },
    gananciasLabel: { fontSize: 11, fontWeight: '900', color: '#999', letterSpacing: 1.5, marginBottom: 5 },
    gananciasValue: { fontSize: 32, fontWeight: '900' },
    menu: { padding: 20, marginTop: 10 },
    menuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 18, borderRadius: 22, marginBottom: 12, elevation: 3 },
    iconBox: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    menuTextCol: { flex: 1 },
    menuItemTitle: { fontSize: 15, fontWeight: 'bold', color: '#333' },
    menuItemSub: { fontSize: 11, color: '#999', marginTop: 1 },
    modalContainer: { flex: 1, backgroundColor: '#f4f7f4' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18, paddingTop: 55, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    modalHeaderTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    pCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 14, borderRadius: 15, marginBottom: 10, elevation: 2 },
    pBadge: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    pBadgeText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
    pName: { fontWeight: 'bold', fontSize: 15, color: '#333' },
    pSub: { fontSize: 11, color: '#888', marginTop: 1 },
    ganadorContainer: { marginBottom: 15 },
    ganadorCard: { padding: 18, borderRadius: 25, elevation: 6 },
    ganadorHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
    headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    ganadorTitle: { color: '#FFD700', fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
    actionRow: { flexDirection: 'row', gap: 10 },
    miniActionBtn: { padding: 8, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)' },
    ganadorSorteo: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
    winnersList: { backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 15, padding: 12 },
    winnerMiniRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6, borderBottomWidth: 0.5, borderBottomColor: 'rgba(255,255,255,0.1)' },
    winMainInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    winNumber: { color: '#FFD700', fontWeight: 'bold', marginRight: 10, fontSize: 14 },
    winName: { color: '#fff', fontSize: 14, fontWeight: '500' },
    winAmount: { color: '#4CAF50', fontWeight: 'bold', fontSize: 13 },
    sharingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    sharingContent: { alignItems: 'center' },
    sharingText: { color: '#fff', marginTop: 15, fontWeight: 'bold', fontSize: 20 },
    sharingSubText: { color: 'rgba(255,255,255,0.6)', marginTop: 8, fontSize: 14 },
    loader: { position: 'absolute' }
});

export default UserScreen;
