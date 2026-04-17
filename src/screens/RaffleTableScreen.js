import React, { useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal, TextInput, Alert, Dimensions } from 'react-native'
import { useRoute } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import sqliteService from '../services/sqliteService'
import colors from '../constants/colors'

const { width } = Dimensions.get('window');
const CELL_SIZE = 70; // Tamaño fijo más grande para cada celda

const RaffleTableScreen = () => {
  const [boletos, setBoletos] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedNumero, setSelectedNumero] = useState(null)
  const [selectedBoleto, setSelectedBoleto] = useState(null)
  const [nombre, setNombre] = useState('')
  const [estadoPago, setEstadoPago] = useState('pendiente')
  const route = useRoute()
  const { sorteoId } = route.params

  useEffect(() => {
    loadBoletos()
  }, [sorteoId])

  const loadBoletos = async () => {
    const data = await sqliteService.obtenerBoletosPorSorteo(sorteoId)
    setBoletos(data || [])
  }

  const getBoletoByNumero = (numero) => {
    return boletos.find(b => b.numero === numero)
  }

  const handleEdit = (numero) => {
    const boleto = getBoletoByNumero(numero)
    setSelectedNumero(numero)
    setSelectedBoleto(boleto)
    setNombre(boleto ? boleto.nombre_participante || '' : '')
    setEstadoPago(boleto ? boleto.estado_pago || 'pendiente' : 'pendiente')
    setModalVisible(true)
  }

  const handleSave = async () => {
    if (selectedBoleto) {
      const success = await sqliteService.actualizarBoleto(selectedBoleto.id, nombre, estadoPago)
      if (success) {
        Alert.alert('Éxito', 'Boleto actualizado')
        loadBoletos()
      }
    } else {
      const id = await sqliteService.agregarParticipante(sorteoId, nombre, selectedNumero, estadoPago)
      if (id) {
        Alert.alert('Éxito', 'Número reservado')
        loadBoletos()
      }
    }
    setModalVisible(false)
  }

  const renderCell = (numero) => {
    const boleto = getBoletoByNumero(numero)
    return (
      <TouchableOpacity
        key={`cell-${numero}`}
        style={[
            styles.cell,
            boleto && boleto.estado_pago === 'pagado' ? styles.cellPagado :
            boleto ? styles.cellPendiente : styles.cellLibre
        ]}
        onPress={() => handleEdit(numero)}
      >
        <Text style={[styles.numero, boleto ? styles.textWhite : null]}>
            {numero.toString().padStart(2, '0')}
        </Text>
        {boleto && (
          <Text style={styles.miniNombre} numberOfLines={1}>
            {boleto.nombre_participante || '...'}
          </Text>
        )}
      </TouchableOpacity>
    )
  }

  const renderRows = () => {
    const tableRows = []
    for (let r = 0; r < 10; r++) {
      const rowCells = []
      for (let c = 0; c < 10; c++) {
        rowCells.push(renderCell(r * 10 + c))
      }
      tableRows.push(
        <View key={`row-${r}`} style={styles.row}>
          {rowCells}
        </View>
      )
    }
    return tableRows
  }

  return (
    <View style={styles.mainContainer}>
      <View style={styles.legend}>
          <View style={styles.legendItem}><View style={[styles.dot, styles.cellLibre]} /><Text style={styles.legendText}>Libre</Text></View>
          <View style={styles.legendItem}><View style={[styles.dot, styles.cellPendiente]} /><Text style={styles.legendText}>Pendiente</Text></View>
          <View style={styles.legendItem}><View style={[styles.dot, styles.cellPagado]} /><Text style={styles.legendText}>Pagado</Text></View>
      </View>

      <ScrollView style={styles.container}>
        <ScrollView horizontal showsHorizontalScrollIndicator={true}>
          <View style={styles.table}>
            {renderRows()}
          </View>
        </ScrollView>
      </ScrollView>

      <Modal visible={modalVisible} animationType="fade" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Número {selectedNumero?.toString().padStart(2, '0')}</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Ionicons name="close-circle" size={30} color="#666" />
                </TouchableOpacity>
            </View>

            <Text style={styles.label}>Nombre Participante:</Text>
            <TextInput
              style={styles.input}
              placeholder="Escribe el nombre aquí..."
              value={nombre}
              onChangeText={setNombre}
            />

            <Text style={styles.label}>Estado del Pago:</Text>
            <View style={styles.statusToggle}>
                <TouchableOpacity
                    style={[styles.statusBtn, estadoPago === 'pendiente' && styles.statusBtnActive]}
                    onPress={() => setEstadoPago('pendiente')}
                >
                    <Text style={[styles.statusBtnText, estadoPago === 'pendiente' && styles.textWhite]}>PENDIENTE</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.statusBtn, estadoPago === 'pagado' && styles.statusBtnActive]}
                    onPress={() => setEstadoPago('pagado')}
                >
                    <Text style={[styles.statusBtnText, estadoPago === 'pagado' && styles.textWhite]}>PAGADO</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.buttonText}>Confirmar y Guardar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#f4f7f4',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendText: { fontSize: 12, color: '#666', fontWeight: '600' },
  dot: { width: 12, height: 12, borderRadius: 6, borderWidth: 1, borderColor: '#ddd' },
  container: {
    flex: 1,
  },
  table: {
    padding: 20,
    backgroundColor: '#f4f7f4',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  cellLibre: { backgroundColor: '#fff' },
  cellPendiente: { backgroundColor: '#f54343' },
  cellPagado: { backgroundColor: '#2d8f3a' },
  numero: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  textWhite: { color: '#fff' },
  miniNombre: {
    fontSize: 9,
    color: '#fff',
    width: '90%',
    textAlign: 'center',
    marginTop: 2,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 25,
    width: '90%',
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#164e24',
  },
  label: {
    fontSize: 14,
    color: '#777',
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#f0f2f0',
    padding: 15,
    borderRadius: 15,
    fontSize: 16,
    marginBottom: 20,
    color: '#333',
  },
  statusToggle: {
    flexDirection: 'row',
    backgroundColor: '#f0f2f0',
    borderRadius: 15,
    padding: 5,
    marginBottom: 30,
  },
  statusBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  statusBtnActive: {
      backgroundColor: '#2d8f3a',
  },
  statusBtnText: {
      fontWeight: 'bold',
      color: '#999',
  },
  saveButton: {
    backgroundColor: '#164e24',
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
})

export default RaffleTableScreen