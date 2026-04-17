import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, ScrollView, KeyboardAvoidingView, Platform } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import sqliteService from '../services/sqliteService'
import colors from '../constants/colors'

const CreateRaffleScreen = () => {
  const [nombre, setNombre] = useState('')
  const [premio, setPremio] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [fechaFin, setFechaFin] = useState('')
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
      } else {
        Alert.alert('Error', 'No se pudo crear el sorteo')
      }
    } catch (error) {
      console.error(error)
      Alert.alert('Error', 'Ocurrió un error al guardar en la base de datos')
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView
        style={styles.container}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View style={styles.headerContainer}>
          <Image
            source={require('../../assets/Logo.png')}
            style={styles.headerImage}
            resizeMode="contain"
          />
          <Text style={styles.title}>Crear Nuevo Sorteo</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.label}>Nombre del sorteo</Text>
          <TextInput
            style={styles.input}
            placeholder="Nombre del sorteo"
            value={nombre}
            onChangeText={setNombre}
            placeholderTextColor="#999"
          />

          <Text style={styles.label}>Premio</Text>
          <TextInput
            style={styles.input}
            placeholder="Premio"
            value={premio}
            onChangeText={setPremio}
            placeholderTextColor="#999"
          />

          <Text style={styles.label}>Descripción (opcional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Descripción (opcional)"
            value={descripcion}
            onChangeText={setDescripcion}
            multiline
            placeholderTextColor="#999"
          />

          <Text style={styles.label}>Fecha fin</Text>
          <TextInput
            style={styles.input}
            placeholder="Fecha fin (YY-MM-DD)"
            value={fechaFin}
            onChangeText={setFechaFin}
            placeholderTextColor="#999"
          />

          <Text style={styles.label}>Precio por boleto</Text>
          <TextInput
            style={styles.input}
            placeholder="Precio por boleto"
            value={precioBoleto}
            onChangeText={setPrecioBoleto}
            keyboardType="numeric"
            placeholderTextColor="#999"
          />

          <TouchableOpacity style={styles.button} onPress={handleCreate}>
            <Text style={styles.buttonText}>Crear Sorteo</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eaf7ea',
  },
  headerContainer: {
    alignItems: 'center',
    backgroundColor: '#2d8f3a',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  headerImage: {
    width: 70,
    height: 70,
    marginBottom: 10,
  },
  title: {
    fontSize: 26,
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  formContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#164e24',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#fff',
    padding: 14,
    marginBottom: 10,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#d0e8d0',
    color: '#111',
  },
  button: {
    backgroundColor: '#2a8f42',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
})

export default CreateRaffleScreen