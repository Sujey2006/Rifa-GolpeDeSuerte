import React, { useEffect, useState, useCallback } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import sqliteService from '../services/sqliteService'

const RaffleListScreen = () => {
  const [sorteos, setSorteos] = useState([])
  const navigation = useNavigation()

  const formatDate = (dateString) => {
    if (!dateString) return 'S/F';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  useFocusEffect(
    useCallback(() => {
      loadSorteos()
    }, [])
  )

  const loadSorteos = async () => {
    const data = await sqliteService.obtenerSorteos()
    setSorteos(data)
  }

  const renderSorteo = ({ item }) => (
    <TouchableOpacity
      style={styles.sorteoItem}
      onPress={() => navigation.navigate('RaffleDetail', { sorteoId: item.id })}
    >
      <View style={styles.itemHeader}>
        <Image 
          source={require('../../assets/Logo.png')}
          style={styles.itemImage}
          resizeMode="contain"
        />
        <Text style={styles.nombre}>{item.nombre}</Text>
      </View>
      <Text style={styles.premio}>🏆 Premio: {item.premio}</Text>
      <Text style={styles.fecha}>📅 Finaliza: {formatDate(item.fecha_fin)}</Text>
      <Text style={styles.precio}>💰 Boleto: ${item.precio_boleto}</Text>
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Image source={require('../../assets/Logo.png')} style={styles.headerImage} resizeMode="contain" />
        <Text style={styles.title}>Sorteos Activos</Text>
      </View>
      <FlatList
        data={sorteos.filter(s => s.estado === 'activo')}
        renderItem={renderSorteo}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={<Text style={styles.empty}>No hay sorteos activos</Text>}
        contentContainerStyle={styles.listContent}
      />
      <TouchableOpacity style={styles.createButton} onPress={() => navigation.navigate('CreateRaffle')}>
        <Text style={styles.createButtonText}>Crear Nuevo Sorteo</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#eaf7ea' },
  headerContainer: { alignItems: 'center', backgroundColor: '#2d8f3a', borderBottomLeftRadius: 20, borderBottomRightRadius: 20, padding: 20 },
  headerImage: { width: 70, height: 70, marginBottom: 10 },
  title: { fontSize: 26, color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  listContent: { padding: 16, paddingBottom: 100 },
  sorteoItem: { backgroundColor: '#fff', padding: 16, marginBottom: 12, borderRadius: 14, borderLeftWidth: 4, borderLeftColor: '#2a8f42', elevation: 3 },
  itemHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  itemImage: { width: 40, height: 40, marginRight: 12 },
  nombre: { fontSize: 18, fontWeight: 'bold', color: '#164e24', flex: 1 },
  premio: { fontSize: 15, color: '#1b6b28', fontWeight: '600', marginBottom: 6 },
  fecha: { fontSize: 14, color: '#666', marginBottom: 6 },
  precio: { fontSize: 14, color: '#2a8f42', fontWeight: '700' },
  empty: { textAlign: 'center', color: '#666', marginTop: 40 },
  createButton: { position: 'absolute', bottom: 20, left: 16, right: 16, backgroundColor: '#2a8f42', padding: 16, borderRadius: 14, alignItems: 'center' },
  createButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
})

export default RaffleListScreen
