import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, FlatList, Linking, Alert, Image, ActivityIndicator, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { updateProfile } from 'firebase/auth';
import { auth } from '../services/firebaseService';
import sqliteService from '../services/sqliteService';
import { pickImage, uploadImageToCloudinary } from '../services/cloudinaryService';
import { useTheme } from '../../navigation/ThemeContext';

const UserScreen = () => {
    const { mainColor } = useTheme();
    const [user, setUser] = useState(auth.currentUser);
    const [ganancias, setGanancias] = useState(0);
    const [boletosTotales, setBoletosTotales] = useState([]);
    const [ganadoresAgrupados, setGanadoresAgrupados] = useState([]);
    const [uploading, setUploading] = useState(false);

    const [modalBoletos, setModalBoletos] = useState(false);
    const [modalGanadores, setModalGanadores] = useState(false);

    useEffect(() => {
        loadAllData();
        const interval = setInterval(loadAllData, 2000);
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
        } catch (error) { console.error(error); }
    };

    const handleUpdatePhoto = async () => {
        try {
            const imageAsset = await pickImage();
            if (!imageAsset) return;
            setUploading(true);
            const imageUrl = await uploadImageToCloudinary(imageAsset.uri);
            if (imageUrl) {
                await updateProfile(auth.currentUser, { photoURL: imageUrl });
                setUser({ ...auth.currentUser, photoURL: imageUrl });
                Alert.alert("Éxito", "Foto de perfil actualizada");
            }
        } catch (error) { console.error(error); } finally { setUploading(false); }
    };

    const handleEliminarParticipante = (boletoId, nombre) => {
        Alert.alert("Eliminar", `¿Borrar a ${nombre}?`, [
            { text: "No" },
            { text: "Sí", style: "destructive", onPress: async () => {
                await sqliteService.eliminarBoleto(boletoId);
                loadAllData();
            }}
        ]);
    };

    const renderSorteoGanador = ({ item }) => (
        <View style={styles.ganadorContainer}>
            <LinearGradient colors={['#000', mainColor]} style={styles.ganadorCard}>
                <View style={styles.ganadorHeader}>
                    <Ionicons name="trophy" size={16} color="#FFD700" />
                    <Text style={styles.ganadorTitle}>FINALIZADO</Text>
                    <TouchableOpacity onPress={() => sqliteService.eliminarSorteo(item.sorteo_id).then(loadAllData)}>
                        <Ionicons name="trash" size={16} color="#ff4d4d" />
                    </TouchableOpacity>
                </View>
                <Text style={styles.ganadorSorteo}>{item.sorteo_nombre}</Text>
                <View style={styles.winnersList}>
                    {item.ganadores.map((g, idx) => (
                        <View key={idx} style={styles.winnerMiniRow}>
                            <Text style={styles.winNumber}>#{g.numero.toString().padStart(2, '0')}</Text>
                            <Text style={styles.winName} numberOfLines={1}>{g.nombre}</Text>
                            <Text style={styles.winAmount}>+ ${g.monto}</Text>
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
                    <TouchableOpacity style={[styles.cameraBtn, { backgroundColor: mainColor }]} onPress={handleUpdatePhoto}>
                        <Ionicons name="camera" size={16} color="#fff" />
                    </TouchableOpacity>
                </View>
                <Text style={styles.userName}>{user?.displayName || 'Administrador'}</Text>
                <Text style={styles.userEmail}>{user?.email}</Text>
            </LinearGradient>

            <View style={styles.gananciasCard}>
                <Text style={styles.gananciasLabel}>    GANANCIAS (PAGADOS)</Text>
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
                    <View style={[styles.iconBox, { backgroundColor: '#25d36533' }]}><Ionicons name="chatbubbles" size={22} color="#25D366" /></View>
                    <View style={styles.menuTextCol}>
                        <Text style={styles.menuItemTitle}>WhatsApp</Text>
                        <Text style={styles.menuItemSub}>Grupo Oficial de WhatsApp</Text>
                    </View>
                    <Ionicons name="logo-whatsapp" size={30} color="#25D366" />
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
                                <TouchableOpacity onPress={() => handleEliminarParticipante(item.id, item.nombre_participante)}><Ionicons name="trash-outline" size={20} color="red" /></TouchableOpacity>
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
                        <Text style={styles.modalHeaderTitle}>Ganadores</Text><View style={{ width: 30 }} />
                    </View>
                    <FlatList data={ganadoresAgrupados} keyExtractor={item => `sorteo-${item.sorteo_id}`} renderItem={renderSorteoGanador} contentContainerStyle={{ padding: 15 }} />
                </View>
            </Modal>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f7f5' },
    header: { paddingTop: 60, paddingBottom: 40, alignItems: 'center', borderBottomLeftRadius: 35, borderBottomRightRadius: 35 },
    profileContainer: { position: 'relative', marginBottom: 12 },
    avatarBox: { width: 85, height: 85, borderRadius: 42.5, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff', overflow: 'hidden' },
    profileImage: { width: '100%', height: '100%' },
    cameraBtn: { position: 'absolute', bottom: 0, right: 0, padding: 6, borderRadius: 15, borderWidth: 2, borderColor: '#fff' },
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
    pCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 14, borderRadius: 15, marginBottom: 10 },
    pBadge: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    pBadgeText: { fontWeight: 'bold', fontSize: 14 },
    pName: { fontWeight: 'bold', fontSize: 15, color: '#333' },
    pSub: { fontSize: 11, color: '#888', marginTop: 1 },
    ganadorContainer: { marginBottom: 15 },
    ganadorCard: { padding: 18, borderRadius: 25 },
    ganadorHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
    ganadorTitle: { color: '#fff', fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
    ganadorSorteo: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
    winnersList: { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 15, padding: 12 },
    winnerMiniRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
    winNumber: { color: '#fff', fontWeight: 'bold', fontSize: 13, width: 35 },
    winName: { color: '#fff', fontSize: 13, flex: 1 },
    winAmount: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
    loader: { position: 'absolute' }
});

export default UserScreen;
