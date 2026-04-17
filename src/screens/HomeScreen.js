import { useEffect, useMemo, useState, useCallback } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Modal, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from '@react-navigation/native';
import colors from "../constants/colors";
import sqliteService from "../services/sqliteService";

const STATUS_OPTIONS = [
  { value: "todos", label: "Todos" },
  { value: "pagado", label: "Pagado" },
  { value: "pendiente", label: "Pendiente" },
];

const HomeScreen = () => {
  const [sorteos, setSorteos] = useState([]);0.
  const [sorteoSeleccionado, setSorteoSeleccionado] = useState(null);
  const [participantes, setParticipantes] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [nombre, setNombre] = useState("");
  const [numero, setNumero] = useState("");
  const [contacto, setContacto] = useState("");
  const [estadoPago, setEstadoPago] = useState("pagado");

  // Modales
  const [modalEditarSorteo, setModalEditarSorteo] = useState(false);
  const [modalEditarParticipante, setModalEditarParticipante] = useState(false);

  // Estados para editar sorteo
  const [sorteoDatos, setSorteoDatos] = useState({ nombre: "", premio: "", fechaFin: "", precioBoleto: "" });
  const [participanteEditar, setParticipanteEditar] = useState(null);

  const formatDate = (dateString) => {
    if (!dateString) return 'S/F';
    const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) return `${match[3]}/${match[2]}/${match[1]}`;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
  };

  // Sincronización automática
  useEffect(() => {
    loadSorteos();
    const interval = setInterval(() => { loadSorteos(); if(sorteoSeleccionado) loadParticipantesPorSorteo(); }, 3000);
    return () => clearInterval(interval);
  }, [sorteoSeleccionado]);

  useFocusEffect(useCallback(() => { loadSorteos(); }, []));

  const loadSorteos = async () => {
    try {
      const data = await sqliteService.obtenerSorteos();
      const activos = data || [];
      setSorteos(activos);
      if (activos.length > 0 && (!sorteoSeleccionado || !activos.some(s => s.id === sorteoSeleccionado))) {
          setSorteoSeleccionado(activos[0].id);
      }
    } catch (error) { console.error(error); }
  };

  const loadParticipantesPorSorteo = async () => {
    if (!sorteoSeleccionado) return;
    const data = await sqliteService.obtenerBoletosPorSorteo(sorteoSeleccionado);
    setParticipantes(data || []);
  };

  const handleGuardarSorteo = async () => {
    if (!sorteoDatos.nombre || !sorteoDatos.premio || !sorteoDatos.fechaFin || !sorteoDatos.precioBoleto) {
        Alert.alert("Error", "Completa todos los campos"); return;
    }
    const success = await sqliteService.actualizarSorteo(sorteoSeleccionado, sorteoDatos.nombre, sorteoDatos.premio, sorteoDatos.fechaFin, parseFloat(sorteoDatos.precioBoleto));
    if (success) {
      setModalEditarSorteo(false);
      loadSorteos();
      Alert.alert("Éxito", "Sorteo actualizado");
    }
  };

  const handleAgregar = async () => {
    if (!sorteoSeleccionado) { Alert.alert("Error", "Crea un sorteo primero"); return; }
    if (!nombre.trim() || !numero.trim()) { Alert.alert("Error", "Campos obligatorios"); return; }
    const valNum = parseInt(numero, 10);
    if (participantes.some(p => p.numero === valNum)) { Alert.alert("Error", "Número ocupado"); return; }
    const id = await sqliteService.agregarParticipante(sorteoSeleccionado, nombre, valNum, estadoPago, contacto);
    if (id) { setNombre(""); setNumero(""); setContacto(""); loadParticipantesPorSorteo(); }
  };

  const handleGuardarParticipante = async () => {
    const success = await sqliteService.actualizarParticipante(participanteEditar.id, nombre, estadoPago, contacto);
    if (success) { setModalEditarParticipante(false); loadParticipantesPorSorteo(); setNombre(""); setContacto(""); }
  };

  const sorteoActual = sorteos.find((s) => s.id === sorteoSeleccionado);

  return (
    <LinearGradient colors={["#ffffff", "#088321dd"]} style={styles.gradient}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>

        <View style={styles.headerContainer}>
          <Image source={require('../../assets/Logo.png')} style={styles.headerImage} resizeMode="contain" />
          <View style={styles.iconRow}><Text style={styles.emojiText}>🍀 💰</Text></View>
        </View>

        <View style={styles.panel}>
          <Text style={styles.sectionTitle}>Sorteos Disponibles</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sorteoSelector}>
            {sorteos.map((s, index) => (
              <TouchableOpacity key={`sorteo-${s.id || index}`} style={[styles.sorteoButton, sorteoSeleccionado === s.id && styles.sorteoButtonActive]} onPress={() => setSorteoSeleccionado(s.id)}>
                <Text style={sorteoSeleccionado === s.id ? styles.sorteoButtonTextActive : styles.sorteoButtonText}>{s.nombre}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {sorteoActual && (
          <View style={styles.panel}>
            <Text style={styles.sectionTitle}>Información del Sorteo</Text>
            <Text style={styles.infoText}>🏆 Premio: {sorteoActual.premio}</Text>
            <Text style={styles.infoText}>💰 Costo: ${sorteoActual.precio_boleto}</Text>
            <Text style={styles.infoText}>📅 Fin: {formatDate(sorteoActual.fecha_fin)}</Text>
            <TouchableOpacity style={styles.editButton} onPress={() => {
                setSorteoDatos({ nombre: sorteoActual.nombre, premio: sorteoActual.premio, fechaFin: sorteoActual.fecha_fin, precioBoleto: sorteoActual.precio_boleto.toString() });
                setModalEditarSorteo(true);
            }}>
              <Text style={styles.editButtonText}>✏️ Editar Sorteo</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.panel}>
          <View style={styles.cardRow}>
            <View style={[styles.card, {backgroundColor: '#FFD1DC'}]}><Text style={styles.cardLabel}>Boletos</Text><Text style={styles.cardValue}>{participantes.length}</Text></View>
            <View style={[styles.card, {backgroundColor: '#DCEDC8'}]}><Text style={styles.cardLabel}>Pagados</Text><Text style={styles.cardValue}>{participantes.filter(p => p.estado_pago === 'pagado').length}</Text></View>
            <View style={[styles.card, {backgroundColor: '#FFF9C4'}]}><Text style={styles.cardLabel}>Pendientes</Text><Text style={styles.cardValue}>{participantes.filter(p => p.estado_pago === 'pendiente').length}</Text></View>
            <View style={[styles.card, {backgroundColor: '#B3E5FC'}]}><Text style={styles.cardLabel}>Libres</Text><Text style={styles.cardValue}>{100 - participantes.length}</Text></View>
          </View>
        </View>

        <View style={styles.panel}>
          <Text style={styles.sectionTitle}>Participantes</Text>
          {participantes.filter(p => !searchName || p.nombre_participante.toLowerCase().includes(searchName.toLowerCase())).map((p, index) => (
            <TouchableOpacity key={`part-${p.id || index}`} style={styles.rowItem} onPress={() => { setParticipanteEditar(p); setNombre(p.nombre_participante); setContacto(p.contacto || ""); setEstadoPago(p.estado_pago); setModalEditarParticipante(true); }}>
              <Text style={styles.rowText}>#{p.numero.toString().padStart(2, '0')}</Text>
              <View style={{flex: 2}}><Text style={styles.rowTextMain}>{p.nombre_participante}</Text><Text style={styles.rowTextSub}>{p.contacto || 'S/C'}</Text></View>
              <Text style={[styles.rowText, p.estado_pago === 'pagado' ? styles.paidText : styles.pendingText]}>{p.estado_pago}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.panel}>
          <Text style={styles.sectionTitle}>Agregar Participante</Text>
          <TextInput style={styles.input} placeholder="Nombre" value={nombre} onChangeText={setNombre} />
          <TextInput style={styles.input} placeholder="Contacto" value={contacto} onChangeText={setContacto} />
          <TextInput style={styles.input} placeholder="Número 00-99" value={numero} onChangeText={setNumero} keyboardType="numeric" />
          <View style={styles.statusRow}>
            <TouchableOpacity style={[styles.statusOption, estadoPago === 'pagado' && styles.statusOptionActive]} onPress={() => setEstadoPago('pagado')}><Text style={estadoPago === 'pagado' ? styles.statusOptionTextActive : styles.statusOptionText}>Pagado</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.statusOption, estadoPago === 'pendiente' && styles.statusOptionActive]} onPress={() => setEstadoPago('pendiente')}><Text style={estadoPago === 'pendiente' ? styles.statusOptionTextActive : styles.statusOptionText}>Pendiente</Text></TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={handleAgregar}><Text style={styles.addButtonText}>Agregar</Text></TouchableOpacity>
        </View>
      </ScrollView>

      {/* MODAL EDITAR SORTEO */}
      <Modal visible={modalEditarSorteo} animationType="fade" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar Sorteo</Text>
            <TextInput style={styles.input} value={sorteoDatos.nombre} onChangeText={(t) => setSorteoDatos({...sorteoDatos, nombre: t})} placeholder="Nombre" />
            <TextInput style={styles.input} value={sorteoDatos.premio} onChangeText={(t) => setSorteoDatos({...sorteoDatos, premio: t})} placeholder="Premio" />
            <TextInput style={styles.input} value={sorteoDatos.fechaFin} onChangeText={(t) => setSorteoDatos({...sorteoDatos, fechaFin: t})} placeholder="Fecha (AAAA-MM-DD)" />
            <TextInput style={styles.input} value={sorteoDatos.precioBoleto} onChangeText={(t) => setSorteoDatos({...sorteoDatos, precioBoleto: t})} placeholder="Precio" keyboardType="numeric" />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.saveButton} onPress={handleGuardarSorteo}><Text style={styles.buttonText}>Guardar</Text></TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalEditarSorteo(false)}><Text style={styles.buttonText}>Cerrar</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL EDITAR PARTICIPANTE */}
      <Modal visible={modalEditarParticipante} animationType="fade" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar Datos</Text>
            <TextInput style={styles.input} value={nombre} onChangeText={setNombre} />
            <TextInput style={styles.input} value={contacto} onChangeText={setContacto} />
            <View style={styles.statusRow}>
              <TouchableOpacity style={[styles.statusOption, estadoPago === 'pagado' && styles.statusOptionActive]} onPress={() => setEstadoPago('pagado')}><Text style={estadoPago === 'pagado' ? styles.statusOptionTextActive : styles.statusOptionText}>Pagado</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.statusOption, estadoPago === 'pendiente' && styles.statusOptionActive]} onPress={() => setEstadoPago('pendiente')}><Text style={estadoPago === 'pendiente' ? styles.statusOptionTextActive : styles.statusOptionText}>Pendiente</Text></TouchableOpacity>
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.saveButton} onPress={handleGuardarParticipante}><Text style={styles.buttonText}>Guardar</Text></TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalEditarParticipante(false)}><Text style={styles.buttonText}>Cerrar</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 }, container: { flex: 1 }, content: { padding: 20 },
  headerContainer: { alignItems: 'center', marginVertical: 30, backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: 80, padding: 20, borderWidth: 4, borderColor: '#2d8f3a' },
  headerImage: { width: 120, height: 120 }, emojiText: { fontSize: 30 },
  panel: { backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: 20, padding: 20, marginBottom: 15, elevation: 5 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#164e24', marginBottom: 15 },
  sorteoSelector: { marginBottom: 10 },
  sorteoButton: { backgroundColor: '#f0f0f0', borderRadius: 10, padding: 12, marginRight: 8 },
  sorteoButtonActive: { backgroundColor: '#2d8f3a' },
  sorteoButtonText: { color: '#666' }, sorteoButtonTextActive: { color: '#fff', fontWeight: 'bold' },
  infoText: { fontSize: 15, color: '#333', marginBottom: 5 },
  editButton: { backgroundColor: '#5fadfb', borderRadius: 10, padding: 10, alignItems: 'center', marginTop: 10 },
  editButtonText: { color: '#fff', fontWeight: 'bold' },
  cardRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { width: '48%', padding: 15, borderRadius: 15, marginBottom: 10, alignItems: 'center' },
  cardLabel: { fontSize: 12, color: '#333', fontWeight: 'bold' }, cardValue: { fontSize: 22, fontWeight: 'bold' },
  input: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#eee' },
  rowItem: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 8, alignItems: 'center' },
  rowText: { flex: 1, textAlign: 'center' }, rowTextMain: { fontWeight: 'bold' }, rowTextSub: { fontSize: 10, color: '#999' },
  paidText: { color: '#2d8f3a', fontWeight: 'bold' }, pendingText: { color: '#ff6b6b', fontWeight: 'bold' },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  statusOption: { flex: 1, padding: 12, borderRadius: 10, backgroundColor: '#f9f9f9', alignItems: 'center', marginHorizontal: 5, borderWidth: 1, borderColor: '#eee' },
  statusOptionActive: { backgroundColor: '#2d8f3a' },
  statusOptionText: { color: '#999', fontWeight: 'bold' }, statusOptionTextActive: { color: '#fff' },
  addButton: { backgroundColor: '#164e24', borderRadius: 12, padding: 15, alignItems: 'center' },
  addButtonText: { color: '#fff', fontWeight: 'bold' },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)' },
  modalContent: { backgroundColor: '#fff', padding: 25, borderRadius: 25, width: '90%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#164e24' },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 },
  saveButton: { backgroundColor: '#2d8f3a', padding: 12, borderRadius: 10, flex: 1, marginRight: 10, alignItems: 'center' },
  cancelButton: { backgroundColor: '#ff6b6b', padding: 12, borderRadius: 10, flex: 1, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' }
});

export default HomeScreen;
