import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, FlatList, Linking, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { auth } from '../services/firebaseService';
import sqliteService from '../services/sqliteService';

const UserScreen = () => {
    const user = auth.currentUser;
    const [ganancias, setGanancias] = useState(0);
    const [boletosTotales, setBoletosTotales] = useState([]);
    const [ganadoresAgrupados, setGanadoresAgrupados] = useState([]);

    const [modalBoletos, setModalBoletos] = useState(false);
    const [modalGanadores, setModalGanadores] = useState(false);

    useEffect(() => {
        loadAllData();
        const interval = setInterval(() => { loadAllData(); }, 2000);
        return () => clearInterval(interval);
    }, []);

    useFocusEffect(useCallback(() => { loadAllData(); }, []));

    const loadAllData = async () => {
        const todos = await sqliteService.obtenerTodosLosBoletos();
        const ganadoresRaw = await sqliteService.obtenerGanadores();

        setBoletosTotales(todos);

        // Agrupar ganadores por sorteo
        const agrupados = ganadoresRaw.reduce((acc, curr) => {
            const found = acc.find(a => a.sorteo_id === curr.sorteo_id);
            if (found) {
                found.ganadores.push({ nombre: curr.nombre_participante, numero: curr.numero });
            } else {
                acc.push({
                    sorteo_id: curr.sorteo_id,
                    sorteo_nombre: curr.sorteo_nombre,
                    premio: curr.premio,
                    ganadores: [{ nombre: curr.nombre_participante, numero: curr.numero }]
                });
            }
            return acc;
        }, []);
        setGanadoresAgrupados(agrupados);

        const total = todos.reduce((acc, curr) => {
            return curr.estado_pago === 'pagado' ? acc + (curr.precio_boleto || 0) : acc;
        }, 0);
        setGanancias(total);
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

    const handleBorrarSorteoHistorial = (sorteoId, nombreSorteo) => {
        Alert.alert("Eliminar", `¿Borrar "${nombreSorteo}" del historial?`, [
            { text: "No" },
            { text: "Sí", style: "destructive", onPress: async () => {
                await sqliteService.eliminarSorteo(sorteoId);
                loadAllData();
            }}
        ]);
    };

    const renderBoletoGlobal = ({ item }) => (
        <View style={styles.globalBoletoCard}>
            <View style={styles.numeroBadge}><Text style={styles.numeroText}>{item.numero.toString().padStart(2, '0')}</Text></View>
            <View style={styles.infoCol}>
                <Text style={styles.participanteName}>{item.nombre_participante || 'Anónimo'}</Text>
                <Text style={styles.sorteoName}>{item.sorteo_nombre}</Text>
                {item.contacto ? <Text style={styles.contactoText}>📞 {item.contacto}</Text> : null}
            </View>
            <View style={styles.actionCol}>
                <Ionicons name={item.estado_pago === 'pagado' ? "checkmark-circle" : "time"} size={22} color={item.estado_pago === 'pagado' ? "#2d8f3a" : "#f39c12"} />
                <TouchableOpacity onPress={() => handleEliminarParticipante(item.id, item.nombre_participante)}><Ionicons name="trash-outline" size={20} color="#e74c3c" /></TouchableOpacity>
            </View>
        </View>
    );

    const renderSorteoGanador = ({ item }) => (
        <View style={styles.ganadorContainer}>
            <LinearGradient colors={['#000', '#08920a']} style={styles.ganadorCard}>
                <View style={styles.ganadorHeader}>
                    <View style={styles.headerTitleRow}>
                        <Ionicons name="trophy" size={16} color="#FFD700" />
                        <Text style={styles.ganadorTitle}>FINALIZADO</Text>
                    </View>
                    <TouchableOpacity onPress={() => handleBorrarSorteoHistorial(item.sorteo_id, item.sorteo_nombre)}>
                        <Ionicons name="trash" size={16} color="#ff4d4d" />
                    </TouchableOpacity>
                </View>

                <Text style={styles.ganadorSorteo} numberOfLines={1}>{item.sorteo_nombre}</Text>
                <Text style={styles.premioText} numberOfLines={1}>🎁 {item.premio}</Text>

                <View style={styles.winnersList}>
                    {item.ganadores.map((g, idx) => (
                        <View key={idx} style={styles.winnerMiniRow}>
                            <Text style={styles.winNumber}>{g.numero.toString().padStart(2, '0')}</Text>
                            <Text style={styles.winName} numberOfLines={1}>{g.nombre || 'S/N'}</Text>
                        </View>
                    ))}
                </View>
            </LinearGradient>
        </View>
    );

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <LinearGradient colors={['#164e24', '#2d8f3a']} style={styles.header}>
                <View style={styles.avatar}><Ionicons name="person" size={50} color="#fff" /></View>
                <Text style={styles.userName}>{user?.displayName || 'Administrador'}</Text>
                <Text style={styles.userEmail}>{user?.email}</Text>
            </LinearGradient>

            <View style={styles.gananciasCard}>
                <Text style={styles.gananciasLabel}>Ganancias </Text>
                <Text style={styles.gananciasValue}>${ganancias.toLocaleString()}</Text>
            </View>

            <View style={styles.menu}>
                <TouchableOpacity style={styles.menuItem} onPress={() => setModalBoletos(true)}>
                    <View style={[styles.iconBox, { backgroundColor: '#e8f5e9' }]}><Ionicons name="people" size={24} color="#2d8f3a" /></View>
                    <View style={styles.menuTextCol}>
                        <Text style={styles.menuItemTitle}>Participantes Totales</Text>
                        <Text style={styles.menuItemSub}>{boletosTotales.length} registros</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#ccc" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={() => setModalGanadores(true)}>
                    <View style={[styles.iconBox, { backgroundColor: '#fff3e0' }]}><Ionicons name="star" size={24} color="#f39c12" /></View>
                    <View style={styles.menuTextCol}>
                        <Text style={styles.menuItemTitle}>Ganadores (Todos los sorteos)</Text>
                        <Text style={styles.menuItemSub}>{ganadoresAgrupados.length} sorteos cerrados</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#ccc" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={() => Linking.openURL('https://chat.whatsapp.com/IJeKo49xqcyEFawv4NX5Xy')}>
                    <View style={[styles.iconBox, { backgroundColor: '#e3f2fd' }]}><Ionicons name="chatbubbles" size={24} color="#1976d2" /></View>
                    <View style={styles.menuTextCol}>
                        <Text style={styles.menuItemTitle}>Soporte</Text>
                        <Text style={styles.menuItemSub}>WhatsApp</Text>
                    </View>
                    <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
                </TouchableOpacity>
            </View>

            <Modal visible={modalBoletos} animationType="slide">
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => setModalBoletos(false)}><Ionicons name="close" size={30} color="#333" /></TouchableOpacity>
                        <Text style={styles.modalHeaderTitle}>Participantes</Text><View style={{width: 30}} />
                    </View>
                    <FlatList data={boletosTotales} keyExtractor={item => item.id.toString()} renderItem={renderBoletoGlobal} contentContainerStyle={{ padding: 15 }} ListEmptyComponent={<Text style={styles.empty}>Vacío</Text>} />
                </View>
            </Modal>

            <Modal visible={modalGanadores} animationType="slide">
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => setModalGanadores(false)}><Ionicons name="close" size={30} color="#333" /></TouchableOpacity>
                        <Text style={styles.modalHeaderTitle}>Historial</Text><View style={{width: 30}} />
                    </View>
                    <FlatList data={ganadoresAgrupados} keyExtractor={item => `sorteo-${item.sorteo_id}`} renderItem={renderSorteoGanador} contentContainerStyle={{ padding: 15 }} ListEmptyComponent={<Text style={styles.empty}>Sin resultados</Text>} />
                </View>
            </Modal>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f4f7f4' },
    header: { paddingTop: 60, paddingBottom: 40, alignItems: 'center', borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
    avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff', marginBottom: 10 },
    userName: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
    userEmail: { fontSize: 13, color: 'rgba(255,255,255,0.7)' },
    gananciasCard: { backgroundColor: '#fff', marginHorizontal: 30, marginTop: -30, borderRadius: 20, padding: 20, alignItems: 'center', elevation: 8 },
    gananciasLabel: { fontSize: 10, fontWeight: 'bold', color: '#999', letterSpacing: 1 },
    gananciasValue: { fontSize: 30, fontWeight: '900', color: '#164e24' },
    menu: { padding: 20 },
    menuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 15, borderRadius: 15, marginBottom: 12, elevation: 2 },
    iconBox: { width: 45, height: 45, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    menuTextCol: { flex: 1 },
    menuItemTitle: { fontSize: 15, fontWeight: 'bold', color: '#333' },
    menuItemSub: { fontSize: 11, color: '#999' },
    modalContainer: { flex: 1, backgroundColor: '#f4f7f4' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, paddingTop: 50, backgroundColor: '#fff' },
    modalHeaderTitle: { fontSize: 18, fontWeight: 'bold' },
    globalBoletoCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 12, borderRadius: 12, marginBottom: 8, elevation: 1 },
    numeroBadge: { width: 35, height: 35, borderRadius: 17.5, backgroundColor: '#164e24', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    numeroText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
    infoCol: { flex: 1 },
    participanteName: { fontSize: 14, fontWeight: 'bold', color: '#333' },
    sorteoName: { fontSize: 11, color: '#666' },
    contactoText: { fontSize: 10, color: '#2d8f3a' },
    actionCol: { flexDirection: 'row', alignItems: 'center', gap: 15 },
    ganadorContainer: { marginBottom: 10 },
    ganadorCard: { padding: 12, borderRadius: 15 },
    ganadorHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
    headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    ganadorTitle: { color: '#fff', fontSize: 9, fontWeight: 'bold', letterSpacing: 1 },
    ganadorSorteo: { fontSize: 15, fontWeight: 'bold', color: '#fff' },
    premioText: { color: '#FFD700', fontSize: 12, fontWeight: 'bold', marginBottom: 8 },
    winnersList: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: 8 },
    winnerMiniRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    winNumber: { color: '#fff', fontWeight: 'bold', fontSize: 12, width: 30 },
    winName: { color: '#fff', fontSize: 12, flex: 1 },
    empty: { textAlign: 'center', marginTop: 50, color: '#999' }
});

export default UserScreen;
