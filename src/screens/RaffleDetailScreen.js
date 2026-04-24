import React, { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Modal, TextInput } from 'react-native'
import { useRoute, useNavigation } from '@react-navigation/native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import sqliteService from '../services/sqliteService'
import { useTheme } from '../../navigation/ThemeContext'

const RaffleDetailScreen = () => {
  const { mainColor } = useTheme();
  const [sorteo, setSorteo] = useState(null)
  const [modalManual, setModalManual] = useState(false)

  const [ganadoresTemp, setGanadoresTemp] = useState([])
  const [tempNum, setTempNum] = useState('')
  const [tempMonto, setTempMonto] = useState('')
  const [cantidadObjetivo, setCantidadObjetivo] = useState(1)

  const route = useRoute()
  const navigation = useNavigation()
  const { sorteoId } = route.params

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, [sorteoId]);

  const loadData = async () => {
    const s = await sqliteService.obtenerSorteoPorId(sorteoId)
    if (s) setSorteo(s)
  }

  const handleFinalizar = () => {
    Alert.alert("Dividir Premio", "¿En cuántas partes se divide?", [
        { text: "Solo 1", onPress: () => prepararIngreso(1) },
        { text: "Entre 3", onPress: () => prepararIngreso(3) },
        { text: "Entre 4", onPress: () => prepararIngreso(4) },
        { text: "Cancelar", style: "cancel" }
    ]);
  }

  const prepararIngreso = (cant) => {
    setCantidadObjetivo(cant);
    setGanadoresTemp([]);
    setTempNum('');
    setTempMonto('');
    setModalManual(true);
  }

  const agregarGanador = async () => {
    if (!tempNum || !tempMonto) {
        Alert.alert("Error", "Ingresa número y monto"); return;
    }

    const n = parseInt(tempNum, 10);
    const boletos = await sqliteService.obtenerBoletosPorSorteo(sorteoId);
    const boletoEncontrado = boletos.find(b => b.numero === n);

    if (!boletoEncontrado) {
        Alert.alert("Error", "Este número no ha sido comprado.");
        return;
    }

    if (boletoEncontrado.estado_pago !== 'pagado') {
        Alert.alert("⚠️ Pago Pendiente", "Solo los números pagados pueden ganar.");
        return;
    }

    const nuevos = [...ganadoresTemp, { numero: n, monto: parseFloat(tempMonto) }];

    if (nuevos.length < cantidadObjetivo) {
        setGanadoresTemp(nuevos);
        setTempNum('');
        setTempMonto('');
    } else {
        await sqliteService.marcarGanadoresConMonto(sorteoId, nuevos);
        setModalManual(false);
        loadData();
        Alert.alert("¡Éxito!", "Sorteo finalizado.");
    }
  }

  return (
    <ScrollView style={styles.container}>
      {/* CABECERA CON DEGRADADO NEGRO Y COLOR DINÁMICO */}
      <LinearGradient colors={['#000000', mainColor]} style={styles.header}>
        <TouchableOpacity style={styles.settingsHeaderBtn} onPress={() => navigation.navigate('Settings')}>
            <Ionicons name="settings-outline" size={24} color="#fff" />
        </TouchableOpacity>

        <View style={styles.iconCircle}>
            <Ionicons name="trophy" size={50} color="#FFD700" />
        </View>

        <Text style={styles.title}>{sorteo?.nombre}</Text>

        <View style={[styles.statusBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
            <Text style={styles.statusText}>{sorteo?.estado.toUpperCase()}</Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.card}>
            <Text style={styles.cardLabel}>🏆 PREMIO</Text>
            <Text style={[styles.premioValue, { color: mainColor }]}>{sorteo?.premio}</Text>
        </View>

        {sorteo?.estado === 'activo' ? (
            <TouchableOpacity style={styles.finishBtn} onPress={handleFinalizar}>
                <Ionicons name="flash-outline" size={24} color="#fff" />
                <Text style={styles.btnText}>Repartir Premio y Finalizar</Text>
            </TouchableOpacity>
        ) : (
            <View style={styles.closedCard}>
                <Ionicons name="lock-closed" size={24} color="#999" />
                <Text style={styles.closedText}>Este sorteo ya ha finalizado</Text>
            </View>
        )}

        <TouchableOpacity
            style={[styles.tableButton, { backgroundColor: mainColor }]}
            onPress={() => navigation.navigate('RaffleTable', { sorteoId })}
        >
            <Text style={styles.btnText}>Ver Tablero de Números</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={modalManual} transparent animationType="slide">
        <View style={styles.overlay}>
            <View style={styles.modal}>
                <Text style={[styles.mTitle, { color: mainColor }]}>Ganador {ganadoresTemp.length + 1} de {cantidadObjetivo}</Text>
                <Text style={styles.label}>Número (00-99):</Text>
                <TextInput style={styles.input} keyboardType="numeric" maxLength={2} value={tempNum} onChangeText={setTempNum} placeholder="00" />
                <Text style={styles.label}>Monto Ganado ($):</Text>
                <TextInput style={styles.input} keyboardType="numeric" value={tempMonto} onChangeText={setTempMonto} placeholder="0.00" />
                <TouchableOpacity style={[styles.confirmBtn, { backgroundColor: mainColor }]} onPress={agregarGanador}>
                    <Text style={styles.confirmText}>{ganadoresTemp.length + 1 === cantidadObjetivo ? "Finalizar" : "Siguiente"}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setModalManual(false)} style={{marginTop: 15}}>
                    <Text style={{color: 'red', textAlign:'center'}}>Cancelar</Text>
                </TouchableOpacity>
            </View>
        </View>
      </Modal>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { paddingTop: 60, paddingBottom: 40, alignItems: 'center', borderBottomLeftRadius: 40, borderBottomRightRadius: 40, position: 'relative' },
  settingsHeaderBtn: { position: 'absolute', top: 50, right: 20, backgroundColor: 'rgba(255,255,255,0.2)', padding: 10, borderRadius: 20 },
  iconCircle: { width: 85, height: 85, borderRadius: 42.5, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', textAlign: 'center' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 15, marginTop: 10 },
  statusText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  content: { padding: 20, marginTop: -30 },
  card: { backgroundColor: '#fff', padding: 25, borderRadius: 25, elevation: 5, marginBottom: 20 },
  cardLabel: { fontSize: 10, color: '#999', textAlign: 'center', fontWeight: 'bold' },
  premioValue: { fontSize: 30, fontWeight: 'bold', textAlign: 'center', marginTop: 10 },
  finishBtn: { backgroundColor: '#fa4545', flexDirection: 'row', padding: 18, borderRadius: 20, alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 15, elevation: 4 },
  tableButton: { padding: 18, borderRadius: 20, alignItems: 'center', elevation: 4 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  closedCard: { backgroundColor: '#eee', padding: 20, borderRadius: 15, flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 15 },
  closedText: { color: '#999', fontWeight: 'bold' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  modal: { backgroundColor: '#fff', width: '85%', padding: 25, borderRadius: 25 },
  mTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 12, color: '#666', marginBottom: 5 },
  input: { backgroundColor: '#f0f0f0', padding: 15, borderRadius: 12, fontSize: 18, marginBottom: 15 },
  confirmBtn: { padding: 15, borderRadius: 12, alignItems: 'center' },
  confirmText: { color: '#fff', fontWeight: 'bold' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});

export default RaffleDetailScreen