import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, ScrollView, KeyboardAvoidingView, Platform } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { LinearGradient } from 'expo-linear-gradient'
import sqliteService from '../services/sqliteService'
import { useTheme } from '../../navigation/ThemeContext'

const CreateRaffleScreen = () => {
  const { mainColor } = useTheme();
  const [nombre, setNombre] = useState('')
  const [premio, setPremio] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [fechaFin, setEditFecha] = useState('')
  const [precioBoleto, setPrecioBoleto] = useState('')
  const navigation = useNavigation()

  const handleCreate = async () => {
    if (!nombre || !premio || !fechaFin || !precioBoleto) {
      Alert.alert('Error', 'Todos los campos son obligatorios')
      return
    }

    const fechaInicio = new Date().toISOString()
    try {
      const id = await sqliteService.crearSorteo(nombre, premio, descripcion, fechaInicio, fechaFin, parseFloat(precioBoleto))
      if (id) {
        Alert.alert('Éxito', 'Sorteo creado correctamente')
        navigation.goBack()
      }
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un error al guardar')
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">

        {/* CABECERA CON DEGRADADO NEGRO Y COLOR TEMA */}
        <LinearGradient colors={['#000000', mainColor]} style={styles.headerContainer}>
          <Image source={require('../../assets/Logo.png')} style={styles.headerImage} resizeMode="contain" />
          <Text style={styles.title}>Crear Nuevo Sorteo</Text>
        </LinearGradient>

        <View style={styles.formContainer}>
          <Text style={[styles.label, { color: mainColor }]}>Nombre del sorteo</Text>
          <TextInput style={styles.input} placeholder="Ej: Gran Rifa Solidaria" value={nombre} onChangeText={setNombre} />

          <Text style={[styles.label, { color: mainColor }]}>Premio</Text>
          <TextInput style={styles.input} placeholder="Ej: $1.000.000" value={premio} onChangeText={setPremio} />

          <Text style={[styles.label, { color: mainColor }]}>Descripción (opcional)</Text>
          <TextInput style={styles.input} placeholder="Detalles adicionales..." value={descripcion} onChangeText={setDescripcion} multiline />

          <Text style={[styles.label, { color: mainColor }]}>Fecha de Cierre</Text>
          <TextInput style={styles.input} placeholder="2024-12-31" value={fechaFin} onChangeText={setEditFecha} />

          <Text style={[styles.label, { color: mainColor }]}>Precio por boleto ($)</Text>
          <TextInput style={styles.input} placeholder="0.000" value={precioBoleto} onChangeText={setPrecioBoleto} keyboardType="numeric" />

          <TouchableOpacity style={styles.btnWrapper} onPress={handleCreate}>
            <LinearGradient colors={[mainColor, mainColor + 'cc']} start={{x:0, y:0}} end={{x:1, y:0}} style={styles.button}>
                <Text style={styles.buttonText}>Publicar Sorteo</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f7f4' },
  headerContainer: { alignItems: 'center', padding: 30, paddingTop: 60, borderBottomLeftRadius: 40, borderBottomRightRadius: 40, elevation: 10 },
  headerImage: { width: 80, height: 80, marginBottom: 15 },
  title: { fontSize: 24, color: '#fff', fontWeight: 'bold' },
  formContainer: { padding: 25, paddingBottom: 50 },
  label: { fontSize: 13, fontWeight: '900', marginBottom: 8, marginTop: 15, letterSpacing: 0.5 },
  input: { backgroundColor: '#fff', padding: 15, borderRadius: 15, fontSize: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
  btnWrapper: { marginTop: 35, borderRadius: 20, overflow: 'hidden', elevation: 8 },
  button: { padding: 20, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
})

export default CreateRaffleScreen
