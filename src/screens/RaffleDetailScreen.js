import React, { useEffect, useState, useCallback } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Modal, TextInput } from 'react-native'
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import sqliteService from '../services/sqliteService'

const RaffleDetailScreen = () => {
  const [sorteo, setSorteo] = useState(null)
  const [modalManual, setModalManual] = useState(false)
  const [numerosGanadores, setNumerosGanadores] = useState([])
  const [tempNumero, setTempTempNumero] = useState('')
  const [cantidadObjetivo, setCantidadObjetivo] = useState(1)

  const route = useRoute()
  const navigation = useNavigation()
  const { sorteoId } = route.params

  const formatDate = (dateString) => {
    if (!dateString) return 'S/F';
    const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/);
    return match ? `${match[3]}/${match[2]}/${match[1]}` : dateString;
  };

  // Actualización automática cada 3 segundos
  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, [sorteoId]);

  const loadData = async () => {
    const s = await sqliteService.obtenerSorteoPorId(sorteoId)
    if (s) setSorteo(s)
  }

  const handleFinalizarSorteo = () => {
    Alert.alert("Elegir Ganador", "¿Cómo deseas proceder?", [
        { text: "Cancelar", style: "cancel" },
        { text: "🎲 Aleatorio", onPress: () => preguntarDivision(true) },
        { text: "✍️ Manual", onPress: () => preguntarDivision(false) }
    ]);
  }

  const preguntarDivision = (esAleatorio) => {
    Alert.alert("Dividir Premio", "¿En cuántas partes se divide el premio?", [
        { text: "Solo 1", onPress: () => iniciarProceso(1, esAleatorio) },
        { text: "Entre 3", onPress: () => iniciarProceso(3, esAleatorio) },
        { text: "Entre 4", onPress: () => iniciarProceso(4, esAleatorio) }
    ]);
  }

  const iniciarProceso = async (cantidad, esAleatorio) => {
    setCantidadObjetivo(cantidad);
    if (esAleatorio) {
        const boletos = await sqliteService.obtenerBoletosPorSorteo(sorteoId);
        if (boletos.length < cantidad) {
            Alert.alert("Error", "No hay suficientes boletos vendidos para esa cantidad de ganadores");
            return;
        }
        const seleccionados = [];
        const copia = [...boletos];
        for (let i = 0; i < cantidad; i++) {
            const index = Math.floor(Math.random() * copia.length);
            seleccionados.push(copia.splice(index, 1)[0].numero);
        }
        await sqliteService.marcarGanadores(sorteoId, seleccionados);
        Alert.alert("¡Éxito!", `Ganadores seleccionados: ${seleccionados.join(', ')}`);
        loadData();
    } else {
        setNumerosGanadores([]);
        setTempTempNumero('');
        setModalManual(true);
    }
  }

  const agregarNumeroManual = async () => {
    const num = parseInt(tempNumero, 10);
    if (isNaN(num) || num < 0 || num > 99) {
        Alert.alert("Error", "Número inválido (00-99)"); return;
    }
    const nuevos = [...numerosGanadores, num];
    if (nuevos.length < cantidadObjetivo) {
        setNumerosGanadores(nuevos);
        setTempTempNumero('');
    } else {
        await sqliteService.marcarGanadores(sorteoId, nuevos);
        setModalManual(false);
        loadData();
        Alert.alert("¡Éxito!", "Ganadores establecidos correctamente");
    }
  }

  if (!sorteo) return <View style={styles.loading}><Text>Cargando...</Text></View>

  return (
    <ScrollView style={styles.container}>
      <LinearGradient colors={['#2d8f3a', '#164e24']} style={styles.header}>
        <View style={styles.iconCircle}><Ionicons name="trophy" size={50} color="#FFD700" /></View>
        <Text style={styles.title}>{sorteo.nombre}</Text>
        <View style={styles.statusBadge}><Text style={styles.statusText}>{sorteo.estado.toUpperCase()}</Text></View>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.card}>
            <Text style={styles.cardLabel}>🏆 PREMIO</Text>
            <Text style={styles.premioValue}>{sorteo.premio}</Text>
            <View style={styles.divider} />
            <Text style={styles.infoText}>💰 Costo: ${sorteo.precio_boleto}</Text>
            <Text style={styles.infoText}>📅 Fecha: {formatDate(sorteo.fecha_fin)}</Text>
        </View>

        {sorteo.numero_ganador !== null && (
            <LinearGradient colors={['#FFD700', '#FFA500']} style={styles.winnerCard}>
                <Text style={styles.winnerLabel}>NÚMERO GANADOR OFICIAL</Text>
                <Text style={styles.winnerNumber}>{sorteo.numero_ganador.toString().padStart(2, '0')}</Text>
            </LinearGradient>
        )}

        <TouchableOpacity style={styles.tableButton} onPress={() => navigation.navigate('RaffleTable', { sorteoId })}>
            <LinearGradient colors={['#2d8f3a', '#1b6b28']} style={styles.btnGradient}>
                <Ionicons name="grid-outline" size={24} color="#fff" />
                <Text style={styles.buttonText}>Tablero de Números</Text>
            </LinearGradient>
        </TouchableOpacity>

        {sorteo.estado === 'activo' && (
            <TouchableOpacity style={styles.winnerButton} onPress={handleFinalizarSorteo}>
                <Ionicons name="flash-outline" size={24} color="#fff" />
                <Text style={styles.buttonText}>Finalizar Sorteo</Text>
            </TouchableOpacity>
        )}
      </View>

      <Modal visible={modalManual} transparent animationType="fade">
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Ganador {numerosGanadores.length + 1} de {cantidadObjetivo}</Text>
                <TextInput style={styles.input} placeholder="00-99" keyboardType="numeric" maxLength={2} value={tempNumero} onChangeText={setTempTempNumero} />
                <TouchableOpacity style={styles.confirmBtn} onPress={agregarNumeroManual}>
                    <Text style={styles.btnTextConfirm}>Siguiente / Confirmar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{marginTop: 15}} onPress={() => setModalManual(false)}><Text style={{textAlign:'center', color: '#666'}}>Cancelar</Text></TouchableOpacity>
            </View>
        </View>
      </Modal>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f7f4' },
  header: { paddingTop: 50, paddingBottom: 30, alignItems: 'center', borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#fff', textAlign: 'center' },
  statusBadge: { backgroundColor: 'rgba(255,255,255,0.3)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 15, marginTop: 10 },
  statusText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  content: { padding: 20, marginTop: -20 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 20, elevation: 4, marginBottom: 15 },
  cardLabel: { fontSize: 10, color: '#999', fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  premioValue: { fontSize: 26, fontWeight: 'bold', color: '#164e24', textAlign: 'center' },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 15 },
  infoText: { fontSize: 14, color: '#444', marginBottom: 5 },
  winnerCard: { alignItems: 'center', padding: 15, borderRadius: 20, marginBottom: 15 },
  winnerLabel: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  winnerNumber: { fontSize: 40, fontWeight: 'bold', color: '#fff' },
  tableButton: { borderRadius: 15, overflow: 'hidden', marginBottom: 12 },
  btnGradient: { flexDirection: 'row', paddingVertical: 15, alignItems: 'center', justifyContent: 'center', gap: 10 },
  winnerButton: { backgroundColor: '#e74c3c', flexDirection: 'row', paddingVertical: 15, borderRadius: 15, alignItems: 'center', justifyContent: 'center', gap: 10 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', width: '80%', padding: 25, borderRadius: 20 },
  modalTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { backgroundColor: '#f0f0f0', padding: 15, borderRadius: 10, fontSize: 30, textAlign: 'center', marginBottom: 20 },
  confirmBtn: { backgroundColor: '#2d8f3a', padding: 15, borderRadius: 10, alignItems: 'center' },
  btnTextConfirm: { color: '#fff', fontWeight: 'bold' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});

export default RaffleDetailScreen