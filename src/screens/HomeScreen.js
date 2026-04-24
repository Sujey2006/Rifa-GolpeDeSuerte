import { useEffect, useMemo, useState, useCallback } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Modal, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import sqliteService from "../services/sqliteService";
import { useTheme } from "../../navigation/ThemeContext";

const STATUS_OPTIONS = [
  { value: "todos", label: "Todos" },
  { value: "pagado", label: "Pagado" },
  { value: "pendiente", label: "Pendiente" },
];

const HomeScreen = () => {
  const { mainColor } = useTheme();
  const navigation = useNavigation();
  const [sorteos, setSorteos] = useState([]);
  const [sorteoSeleccionado, setSorteoSeleccionado] = useState(null);
  const [participantes, setParticipantes] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");

  const [nombre, setNombre] = useState("");
  const [numero, setNumero] = useState("");
  const [contacto, setContacto] = useState("");
  const [estadoPago, setEstadoPago] = useState("pagado");

  const [modalEditarSorteo, setModalEditarSorteo] = useState(false);
  const [modalEditarParticipante, setModalEditarParticipante] = useState(false);
  const [sorteoDatos, setSorteoDatos] = useState({ nombre: "", premio: "", fechaFin: "", precioBoleto: "" });
  const [participanteEditar, setParticipanteEditar] = useState(null);

  const formatDate = (dateString) => {
    if (!dateString) return 'S/F';
    const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/);
    return match ? `${match[3]}/${match[2]}/${match[1]}` : dateString;
  };

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
      } else if (activos.length === 0) {
          setSorteoSeleccionado(null);
      }
    } catch (error) { console.error(error); }
  };

  const loadParticipantesPorSorteo = async () => {
    if (!sorteoSeleccionado) return;
    const data = await sqliteService.obtenerBoletosPorSorteo(sorteoSeleccionado);
    setParticipantes(data || []);
  };

  const handleEliminarSorteo = () => {
    if (!sorteoSeleccionado) return;
    Alert.alert("Eliminar Sorteo", "¿Esta seguro de borrar este sorteo?", [
        { text: "No" },
        { text: "Sí", style: "destructive", onPress: async () => {
            await sqliteService.eliminarSorteo(sorteoSeleccionado);
            setSorteoSeleccionado(null);
            loadSorteos();
        }}
    ]);
  };

  const handleGuardarSorteo = async () => {
    const success = await sqliteService.actualizarSorteo(sorteoSeleccionado, sorteoDatos.nombre, sorteoDatos.premio, sorteoDatos.fechaFin, parseFloat(sorteoDatos.precioBoleto));
    if (success) { setModalEditarSorteo(false); loadSorteos(); }
  };

  const handleAgregar = async () => {
    if (!sorteoSeleccionado) return;
    const valNum = parseInt(numero, 10);
    const id = await sqliteService.agregarParticipante(sorteoSeleccionado, nombre, valNum, estadoPago, contacto);
    if (id) { setNombre(""); setNumero(""); setContacto(""); loadParticipantesPorSorteo(); }
  };

  const handleEditarParticipante = (p) => {
    setParticipanteEditar(p);
    setNombre(p.nombre_participante || "");
    setContacto(p.contacto || "");
    setEstadoPago(p.estado_pago || "pendiente");
    setModalEditarParticipante(true);
  };

  const handleGuardarParticipante = async () => {
    const success = await sqliteService.actualizarParticipante(participanteEditar.id, nombre, estadoPago, contacto);
    if (success) { setModalEditarParticipante(false); loadParticipantesPorSorteo(); setNombre(""); setContacto(""); }
  };

  const filteredParticipantes = useMemo(() => {
    return participantes.filter((item) => {
      const matchesName = !searchName ? true : (item.nombre_participante?.toLowerCase().includes(searchName.toLowerCase()));
      const matchesStatus = filterStatus === "todos" || item.estado_pago === filterStatus;
      return matchesName && matchesStatus;
    });
  }, [participantes, searchName, filterStatus]);

  const sorteoActual = sorteos.find((s) => s.id === sorteoSeleccionado);

  return (
    <LinearGradient colors={["#f0f0f0", mainColor + '99']} style={styles.gradient}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>

        <TouchableOpacity style={[styles.settingsFab, { backgroundColor: mainColor }]} onPress={() => navigation.navigate('Settings')}>
            <Ionicons name="settings" size={24} color="#fff" />
        </TouchableOpacity>

        <View style={[styles.headerContainer, { borderColor: mainColor }]}>
          <Image source={require('../../assets/Logo.png')} style={styles.headerImage} resizeMode="contain" />
          <View style={styles.iconRow}><Text style={styles.emojiText}>🍀 💰</Text></View>
        </View>

        <View style={styles.panel}>
          <Text style={[styles.sectionTitle, { color: mainColor }]}>Sorteos Activos</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sorteoSelector}>
            {sorteos.map((s, index) => (
              <TouchableOpacity key={`sorteo-${s.id || index}`} style={[styles.sorteoButton, sorteoSeleccionado === s.id && { backgroundColor: mainColor }]} onPress={() => setSorteoSeleccionado(s.id)}>
                <Text style={sorteoSeleccionado === s.id ? styles.sorteoButtonTextActive : styles.sorteoButtonText}>{s.nombre}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {sorteoActual && (
          <View style={styles.panel}>
            <Text style={[styles.sectionTitle, { color: mainColor }]}>Información</Text>
            <Text style={styles.infoText}>🏆 Premio: {sorteoActual.premio}</Text>
            <Text style={styles.infoText}>💰 Costo: ${sorteoActual.precio_boleto}</Text>
            <Text style={styles.infoText}>📅 Fin: {formatDate(sorteoActual.fecha_fin)}</Text>
            <View style={styles.actionRow}>
                <TouchableOpacity style={[styles.actionBtn, {backgroundColor: mainColor + '22'}]} onPress={() => {
                    setSorteoDatos({ nombre: sorteoActual.nombre, premio: sorteoActual.premio, fechaFin: sorteoActual.fecha_fin, precioBoleto: sorteoActual.precio_boleto.toString() });
                    setModalEditarSorteo(true);
                }}>
                    <Ionicons name="pencil" size={18} color={mainColor} />
                    <Text style={[styles.actionBtnText, {color: mainColor}]}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, {backgroundColor: '#ffebee'}]} onPress={handleEliminarSorteo}>
                    <Ionicons name="trash" size={18} color="#fa4545" />
                    <Text style={[styles.actionBtnText, {color: '#fa4545'}]}>Eliminar</Text>
                </TouchableOpacity>
            </View>
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
          <Text style={[styles.sectionTitle, { color: mainColor }]}>Lista de Participantes</Text>
          <TextInput style={styles.input} placeholder="🔍 Buscar por nombre..." value={searchName} onChangeText={setSearchName} />
          {filteredParticipantes.map((p, index) => (
              <TouchableOpacity key={`part-${p.id || index}`} style={styles.rowItem} onPress={() => handleEditarParticipante(p)}>
                <Text style={[styles.rowTextNum, { color: mainColor }]}>#{p.numero.toString().padStart(2, '0')}</Text>
                <View style={{flex: 2}}><Text style={styles.rowTextMain}>{p.nombre_participante}</Text><Text style={styles.rowTextSub}>{p.contacto || 'S/C'}</Text></View>
                <Ionicons name={p.estado_pago === 'pagado' ? "checkmark-circle" : "time"} size={18} color={p.estado_pago === 'pagado' ? mainColor : "#fa4545"} />
              </TouchableOpacity>
            ))
          }
        </View>

        <View style={styles.panel}>
          <Text style={[styles.sectionTitle, { color: mainColor }]}>Registrar Nuevo</Text>
          <TextInput style={styles.input} placeholder="Nombre" value={nombre} onChangeText={setNombre} />
          <TextInput style={styles.input} placeholder="Contacto" value={contacto} onChangeText={setContacto} />
          <TextInput style={styles.input} placeholder="Número 00-99" value={numero} onChangeText={setNumero} keyboardType="numeric" />
          <TouchableOpacity style={[styles.addButton, { backgroundColor: mainColor }]} onPress={handleAgregar}>
            <Text style={styles.addButtonText}>Confirmar Registro</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* MODALES */}
      <Modal visible={modalEditarParticipante} animationType="fade" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={[styles.modalTitle, { color: mainColor }]}>Editar Datos</Text>
            <TextInput style={styles.input} value={nombre} onChangeText={setNombre} placeholder="Nombre" />
            <TextInput style={styles.input} value={contacto} onChangeText={setContacto} placeholder="Contacto" />
            <View style={styles.statusToggle}>
                <TouchableOpacity style={[styles.toggleBtn, estadoPago === 'pendiente' && {backgroundColor: '#fa4545'}]} onPress={() => setEstadoPago('pendiente')}>
                    <Text style={[styles.toggleText, estadoPago === 'pendiente' && {color: '#fff'}]}>PENDIENTE</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.toggleBtn, estadoPago === 'pagado' && {backgroundColor: mainColor}]} onPress={() => setEstadoPago('pagado')}>
                    <Text style={[styles.toggleText, estadoPago === 'pagado' && {color: '#fff'}]}>PAGADO</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.saveButton, { backgroundColor: mainColor }]} onPress={handleGuardarParticipante}><Text style={styles.buttonText}>Guardar</Text></TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => { setModalEditarParticipante(false); setNombre(""); setContacto(""); }}><Text style={styles.buttonText}>Cerrar</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={modalEditarSorteo} animationType="fade" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={[styles.modalTitle, { color: mainColor }]}>Editar Sorteo</Text>
            <TextInput style={styles.input} value={sorteoDatos.nombre} onChangeText={(t) => setSorteoDatos({...sorteoDatos, nombre: t})} />
            <TextInput style={styles.input} value={sorteoDatos.premio} onChangeText={(t) => setSorteoDatos({...sorteoDatos, premio: t})} />
            <TextInput style={styles.input} value={sorteoDatos.fechaFin} onChangeText={(t) => setSorteoDatos({...sorteoDatos, fechaFin: t})} />
            <TextInput style={styles.input} value={sorteoDatos.precioBoleto} onChangeText={(t) => setSorteoDatos({...sorteoDatos, precioBoleto: t})} keyboardType="numeric" />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.saveButton, { backgroundColor: mainColor }]} onPress={handleGuardarSorteo}><Text style={styles.buttonText}>Guardar</Text></TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalEditarSorteo(false)}><Text style={styles.buttonText}>Cerrar</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 }, container: { flex: 1 }, content: { padding: 20, paddingTop: 40 },
  settingsFab: { position: 'absolute', top: 20, right: 20, width: 45, height: 45, borderRadius: 22.5, justifyContent: 'center', alignItems: 'center', elevation: 5, zIndex: 10 },
  headerContainer: { alignItems: 'center', marginVertical: 30, backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: 80, padding: 20, borderWidth: 4 },
  headerImage: { width: 120, height: 120 }, emojiText: { fontSize: 30, marginTop: 10 },
  panel: { backgroundColor: 'rgba(255, 255, 255, 0.92)', borderRadius: 25, padding: 20, marginBottom: 15, elevation: 6 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 15, textTransform: 'uppercase', letterSpacing: 1 },
  sorteoSelector: { marginBottom: 10 },
  sorteoButton: { backgroundColor: '#f0f0f0', borderRadius: 12, padding: 12, marginRight: 8 },
  sorteoButtonText: { color: '#666', fontWeight: '600' }, sorteoButtonTextActive: { color: '#fff', fontWeight: 'bold' },
  infoText: { fontSize: 14, color: '#333', marginBottom: 6 },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 15 },
  actionBtn: { flexDirection: 'row', flex: 1, padding: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center', gap: 8 },
  actionBtnText: { fontWeight: 'bold', fontSize: 13 },
  cardRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { width: '48%', padding: 15, borderRadius: 18, marginBottom: 10, alignItems: 'center' },
  cardLabel: { fontSize: 11, color: '#333', fontWeight: 'bold' }, cardValue: { fontSize: 20, fontWeight: 'bold' },
  input: { backgroundColor: '#f9f9f9', padding: 14, borderRadius: 15, marginBottom: 12, borderWidth: 1, borderColor: '#eee' },
  rowItem: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 15, padding: 15, marginBottom: 10, alignItems: 'center', elevation: 2 },
  rowTextNum: { fontWeight: 'bold', fontSize: 16, marginRight: 12 },
  rowTextMain: { fontWeight: 'bold', color: '#333' }, rowTextSub: { fontSize: 10, color: '#999' },
  addButton: { borderRadius: 15, padding: 18, alignItems: 'center', elevation: 4 },
  addButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  statusToggle: { flexDirection: 'row', backgroundColor: '#f0f0f0', borderRadius: 12, padding: 5, marginBottom: 20 },
  toggleBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  toggleText: { fontSize: 12, fontWeight: 'bold', color: '#999' },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)' },
  modalContent: { backgroundColor: '#fff', padding: 25, borderRadius: 30, width: '85%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 15 },
  saveButton: { padding: 12, borderRadius: 12, flex: 1, marginRight: 10, alignItems: 'center' },
  cancelButton: { backgroundColor: '#fa4545', padding: 12, borderRadius: 12, flex: 1, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' }
});

export default HomeScreen;
