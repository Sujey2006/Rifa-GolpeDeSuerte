import { Platform } from 'react-native'
import * as SQLite from 'expo-sqlite'

let db = null
let isInitialized = false
let initPromise = null

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const initDB = async () => {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    try {
      const instance = await SQLite.openDatabaseAsync('DB_GolpeDeSuerte_vF');
      if (Platform.OS === 'android') await delay(100);

      await instance.execAsync(`
        PRAGMA foreign_keys = ON;
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
          monto_ganado REAL DEFAULT 0,
          FOREIGN KEY (sorteo_id) REFERENCES sorteos (id)
        );
      `);

      // Migraciones
      try { await instance.execAsync('ALTER TABLE boletos ADD COLUMN monto_ganado REAL DEFAULT 0;'); } catch(e){}

      db = instance;
      isInitialized = true;
      return db;
    } catch (error) {
      initPromise = null;
      throw error;
    }
  })();
  return initPromise;
}

const getDB = async () => {
  if (isInitialized && db) return db;
  return await initDB();
}

const cleanParams = (params) => {
    if (!Array.isArray(params)) return [];
    return params.map(p => (p === undefined || p === null) ? null : p);
}

const ejecutarSQL = async (query, params = []) => {
  const database = await getDB();
  return await database.runAsync(query, cleanParams(params));
}

const obtenerSQL = async (query, params = []) => {
  const database = await getDB();
  return await database.getAllAsync(query, cleanParams(params));
}

const obtenerPrimeroSQL = async (query, params = []) => {
  const database = await getDB();
  return await database.getFirstAsync(query, cleanParams(params));
}

const crearSorteo = async (n, p, d, fi, ff, pr) => {
  const res = await ejecutarSQL('INSERT INTO sorteos (nombre, premio, descripcion, fecha_inicio, fecha_fin, precio_boleto) VALUES (?, ?, ?, ?, ?, ?)', [n, p, d, fi, ff, pr]);
  return res.lastInsertRowId;
}

const obtenerSorteos = async () => obtenerSQL("SELECT * FROM sorteos WHERE estado = 'activo' ORDER BY id DESC");

const obtenerSorteoPorId = async (id) => obtenerPrimeroSQL('SELECT * FROM sorteos WHERE id = ?', [id]);

const agregarParticipante = async (sId, n, num, e, c = '') => {
  const f = new Date().toISOString();
  const res = await ejecutarSQL('INSERT INTO boletos (sorteo_id, usuario_email, numero, fecha_compra, nombre_participante, contacto, estado_pago) VALUES (?, ?, ?, ?, ?, ?, ?)', [sId, '', num, f, n, c, e]);
  return res.lastInsertRowId;
}

const obtenerBoletosPorSorteo = async (id) => obtenerSQL('SELECT * FROM boletos WHERE sorteo_id = ? ORDER BY numero ASC', [id]);

const obtenerTodosLosBoletos = async () => obtenerSQL("SELECT b.*, s.nombre AS sorteo_nombre, s.precio_boleto FROM boletos b JOIN sorteos s ON b.sorteo_id = s.id WHERE s.estado = 'activo' ORDER BY s.nombre ASC, b.numero ASC");

const obtenerGanadores = async () => {
    return await obtenerSQL(`
        SELECT b.*, s.nombre AS sorteo_nombre, s.premio
        FROM boletos b
        JOIN sorteos s ON b.sorteo_id = s.id
        WHERE b.es_ganador = 1
        ORDER BY b.fecha_compra DESC
    `);
}

const actualizarBoleto = async (id, n, e, c = '') => {
  await ejecutarSQL('UPDATE boletos SET nombre_participante = ?, estado_pago = ?, contacto = ? WHERE id = ?', [n, e, c, id]);
  return true;
}

const actualizarSorteo = async (id, n, p, f, pr) => {
  await ejecutarSQL('UPDATE sorteos SET nombre = ?, premio = ?, fecha_fin = ?, precio_boleto = ? WHERE id = ?', [n, p, f, pr, id]);
  return true;
}

const eliminarBoleto = async (id) => {
  await ejecutarSQL('DELETE FROM boletos WHERE id = ?', [id]);
  return true;
}

const eliminarSorteo = async (id) => {
  const database = await getDB();
  await database.withTransactionAsync(async () => {
    await database.runAsync('DELETE FROM boletos WHERE sorteo_id = ?', [id]);
    await database.runAsync('DELETE FROM sorteos WHERE id = ?', [id]);
  });
  return true;
}

const marcarGanadoresConMonto = async (id, ganadoresList) => {
    // Cerramos el sorteo con el primer ganador como referencia principal
    await ejecutarSQL('UPDATE sorteos SET estado = ?, numero_ganador = ? WHERE id = ?', ['cerrado', ganadoresList[0].numero, id]);

    // Marcamos cada ganador con su monto respectivo
    for (const g of ganadoresList) {
        await ejecutarSQL('UPDATE boletos SET es_ganador = 1, monto_ganado = ? WHERE sorteo_id = ? AND numero = ?', [parseFloat(g.monto), id, g.numero]);
    }
    return true;
}

export default {
  initDB, crearSorteo, obtenerSorteos, obtenerSorteoPorId, agregarParticipante,
  obtenerBoletosPorSorteo, obtenerTodosLosBoletos, obtenerGanadores,
  actualizarBoleto, actualizarParticipante: actualizarBoleto,
  actualizarSorteo, eliminarBoleto, eliminarSorteo, marcarGanadoresConMonto
}
