import { Platform } from 'react-native'
import * as SQLite from 'expo-sqlite'

let db = null
let isReady = false
let initPromise = null

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const initDB = async () => {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    try {
      const instance = await SQLite.openDatabaseAsync('DB_GolpeDeSuerte_vFinal');
      if (Platform.OS === 'android') await delay(50);
      await instance.execAsync('PRAGMA foreign_keys = ON;');

      await instance.execAsync(`
        CREATE TABLE IF NOT EXISTS sorteos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nombre TEXT NOT NULL,
          premio TEXT NOT NULL,
          descripcion TEXT,
          fecha_inicio TEXT NOT NULL,
          fecha_fin TEXT NOT NULL,
          precio_boleto REAL NOT NULL,
          estado TEXT DEFAULT 'activo',
          numero_ganador INTEGER
        );
        CREATE TABLE IF NOT EXISTS boletos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          sorteo_id INTEGER NOT NULL,
          usuario_email TEXT NOT NULL,
          numero INTEGER NOT NULL,
          fecha_compra TEXT NOT NULL,
          nombre_participante TEXT,
          contacto TEXT,
          estado_pago TEXT DEFAULT 'pendiente',
          es_ganador INTEGER DEFAULT 0,
          FOREIGN KEY (sorteo_id) REFERENCES sorteos (id)
        );
      `);

      // Migraciones
      try { await instance.execAsync('ALTER TABLE boletos ADD COLUMN contacto TEXT;'); } catch(e){}
      try { await instance.execAsync('ALTER TABLE boletos ADD COLUMN es_ganador INTEGER DEFAULT 0;'); } catch(e){}

      db = instance;
      isReady = true;
      return instance;
    } catch (error) {
      initPromise = null;
      throw error;
    }
  })();
  return initPromise;
}

const getDatabase = async () => {
  if (isReady && db) return db;
  return await initDB();
}

const cleanParams = (params) => {
    if (!Array.isArray(params)) return [];
    return params.map(p => (p === undefined || p === null) ? null : p);
}

const ejecutarSQL = async (query, params = []) => {
  const database = await getDatabase();
  return await database.runAsync(query, cleanParams(params));
}

const obtenerSQL = async (query, params = []) => {
  const database = await getDatabase();
  return await database.getAllAsync(query, cleanParams(params));
}

const obtenerPrimeroSQL = async (query, params = []) => {
  const database = await getDatabase();
  return await database.getFirstAsync(query, cleanParams(params));
}

// --- FUNCIONES ---

const crearSorteo = async (nombre, premio, descripcion, fechaInicio, fechaFin, precioBoleto) => {
  const result = await ejecutarSQL(
    'INSERT INTO sorteos (nombre, premio, descripcion, fecha_inicio, fecha_fin, precio_boleto) VALUES (?, ?, ?, ?, ?, ?)',
    [nombre, premio, descripcion, fechaInicio, fechaFin, precioBoleto]
  )
  return result.lastInsertRowId || null
}

const obtenerSorteos = async () => {
  return await obtenerSQL("SELECT * FROM sorteos WHERE estado = 'activo' ORDER BY id DESC")
}

const obtenerSorteoPorId = async (id) => {
  return await obtenerPrimeroSQL('SELECT * FROM sorteos WHERE id = ?', [id])
}

const agregarParticipante = async (sorteoId, nombre, numero, estado, contacto = '') => {
  const fecha = new Date().toISOString()
  const result = await ejecutarSQL(
    'INSERT INTO boletos (sorteo_id, usuario_email, numero, fecha_compra, nombre_participante, contacto, estado_pago) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [sorteoId, '', numero, fecha, nombre, contacto, estado]
  )
  return result.lastInsertRowId || null
}

const obtenerBoletosPorSorteo = async (sorteoId) => {
  return await obtenerSQL('SELECT * FROM boletos WHERE sorteo_id = ? ORDER BY numero ASC', [sorteoId])
}

const obtenerTodosLosBoletos = async () => {
  return await obtenerSQL(`
    SELECT b.*, s.nombre AS sorteo_nombre, s.precio_boleto
    FROM boletos b
    JOIN sorteos s ON b.sorteo_id = s.id
    WHERE s.estado = 'activo'
    ORDER BY s.nombre ASC, b.numero ASC
  `);
}

const obtenerGanadores = async () => {
  return await obtenerSQL(`
    SELECT b.*, s.nombre AS sorteo_nombre, s.premio
    FROM boletos b
    JOIN sorteos s ON b.sorteo_id = s.id
    WHERE b.es_ganador = 1
    ORDER BY b.fecha_compra DESC
  `);
}

const actualizarBoleto = async (id, nombre, estado, contacto = '') => {
  await ejecutarSQL('UPDATE boletos SET nombre_participante = ?, estado_pago = ?, contacto = ? WHERE id = ?', [nombre, estado, contacto, id])
  return true
}

const actualizarSorteo = async (id, nombre, premio, fechaFin, precioBoleto) => {
    await ejecutarSQL('UPDATE sorteos SET nombre = ?, premio = ?, fecha_fin = ?, precio_boleto = ? WHERE id = ?', [nombre, premio, fechaFin, precioBoleto, id])
    return true
}

const eliminarBoleto = async (id) => {
  await ejecutarSQL('DELETE FROM boletos WHERE id = ?', [id]);
  return true;
}

const eliminarSorteo = async (sorteoId) => {
  const database = await getDatabase();
  try {
    await database.withTransactionAsync(async () => {
      await database.runAsync('DELETE FROM boletos WHERE sorteo_id = ?', [sorteoId])
      await database.runAsync('DELETE FROM sorteos WHERE id = ?', [sorteoId])
    });
    return true
  } catch (error) { return false }
}

const marcarGanadores = async (sorteoId, numeros) => {
    await ejecutarSQL('UPDATE sorteos SET estado = ?, numero_ganador = ? WHERE id = ?', ['cerrado', numeros[0], sorteoId]);
    for (const num of numeros) {
        await ejecutarSQL('UPDATE boletos SET es_ganador = 1 WHERE sorteo_id = ? AND numero = ?', [sorteoId, num]);
    }
    return true;
}

const seleccionarGanadorAleatorio = async (sorteoId) => {
  const boletos = await obtenerBoletosPorSorteo(sorteoId)
  if (!boletos || boletos.length === 0) return null
  const ganador = boletos[Math.floor(Math.random() * boletos.length)]
  return ganador.numero
}

export default {
  initDB,
  crearSorteo,
  obtenerSorteos,
  obtenerSorteoPorId,
  agregarParticipante,
  obtenerBoletosPorSorteo,
  obtenerTodosLosBoletos,
  obtenerGanadores,
  actualizarBoleto,
  actualizarParticipante: actualizarBoleto,
  actualizarSorteo,
  eliminarBoleto,
  eliminarSorteo,
  marcarGanadores,
  seleccionarGanadorAleatorio
}
