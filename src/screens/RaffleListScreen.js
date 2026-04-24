import React, { useEffect, useState, useCallback } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import sqliteService from '../services/sqliteService'
import { useTheme } from '../../navigation/ThemeContext'

const RaffleListScreen = () => {
  const { mainColor } = useTheme();
  const [sorteos, setSorteos] = useState([])
  const navigation = useNavigation()

  const formatDate = (dateString) => {
    if (!dateString) return 'S/F';
    const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/);
    return match ? `${match[3]}/${match[2]}/${match[1]}` : dateString;
  };

  useFocusEffect(
    useCallback(() => {
      loadSorteos()
    }, [])
  )

  const loadSorteos = async () => {
    const data = await sqliteService.obtenerSorteos()
    setSorteos(data || [])
  }

  const renderSorteo = ({ item }) => (
    <TouchableOpacity
      style={[styles.sorteoItem, { borderLeftColor: mainColor }]}
      onPress={() => navigation.navigate('RaffleDetail', { sorteoId: item.id })}
    >
      <View style={styles.itemHeader}>
        <LinearGradient
            colors={[mainColor + '33', mainColor + '11']}
            style={styles.iconBox}
        >
            <Ionicons name="trophy" size={24} color={mainColor} />
        </LinearGradient>
        <View style={{flex: 1}}>
            <Text style={styles.nombre}>{item.nombre}</Text>
            <Text style={styles.fecha}>📅 Finaliza: {formatDate(item.fecha_fin)}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      </View>

      <View style={styles.divider} />

      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>PREMIO</Text>
            <Text style={[styles.detailValue, { color: mainColor }]}>🎁 {item.premio}</Text>
        </View>
        <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>BOLETO</Text>
            <Text style={styles.detailValue}>💰 ${item.precio_boleto}</Text>
        </View>
      </View>
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      {/* CABECERA CON DEGRADADO NEGRO Y COLOR TEMA */}
      <LinearGradient colors={['#000000', mainColor]} style={styles.headerContainer}>
        <View>
            <Text style={styles.title}>Sorteos Activos</Text>
            <Text style={styles.subtitle}>{sorteos.length} rifas disponibles ahora</Text>
        </View>
        <Ionicons name="gift-outline" size={40} color="rgba(255,255,255,0.3)" />
      </LinearGradient>

      <FlatList
        data={sorteos}
        renderItem={renderSorteo}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={<Text style={styles.empty}>No hay sorteos activos</Text>}
        contentContainerStyle={styles.listContent}
      />

      {/* BOTÓN CON DEGRADADO */}
      <TouchableOpacity
        style={styles.createButtonWrapper}
        onPress={() => navigation.navigate('CreateRaffle')}
      >
        <LinearGradient
          colors={[mainColor, mainColor + 'dd']}
          start={{x: 0, y: 0}} end={{x: 1, y: 0}}
          style={styles.createButton}
        >
            <Ionicons name="add-circle-outline" size={24} color="#fff" />
            <Text style={styles.createButtonText}>Crear Nuevo Sorteo</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f7f4' },
  headerContainer: { padding: 30, paddingTop: 60, borderBottomLeftRadius: 40, borderBottomRightRadius: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', elevation: 12, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 15 },
  title: { fontSize: 26, color: '#fff', fontWeight: 'bold' },
  subtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 4 },
  listContent: { padding: 16, paddingBottom: 130 },
  sorteoItem: { backgroundColor: '#fff', padding: 20, marginBottom: 15, borderRadius: 25, borderLeftWidth: 6, elevation: 5, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  itemHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  iconBox: { width: 50, height: 50, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  nombre: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  fecha: { fontSize: 11, color: '#999', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#f0f0f0', marginBottom: 15 },
  detailsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  detailItem: { flex: 1 },
  detailLabel: { fontSize: 9, color: '#bbb', fontWeight: '900', letterSpacing: 1, marginBottom: 4 },
  detailValue: { fontSize: 15, fontWeight: 'bold', color: '#444' },
  empty: { textAlign: 'center', color: '#999', marginTop: 60, fontSize: 16 },
  createButtonWrapper: { position: 'absolute', bottom: 30, left: 25, right: 25, borderRadius: 20, overflow: 'hidden', elevation: 8, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10 },
  createButton: { flexDirection: 'row', padding: 18, alignItems: 'center', justifyContent: 'center', gap: 10 },
  createButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold', letterSpacing: 0.5 },
})

export default RaffleListScreen
