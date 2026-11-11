import { signInAnonymously, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  where,
  writeBatch,
} from 'firebase/firestore';
import { auth, db, firebaseConfigurado } from './config';
import { CONFIG } from '../config';

export { firebaseConfigurado };

function aFechaISO(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dia}`;
}

/** Asegura una sesión anónima (sin cuentas ni datos personales). */
function asegurarSesion() {
  return new Promise((resolve, reject) => {
    if (auth.currentUser) {
      resolve(auth.currentUser);
      return;
    }
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        unsub();
        resolve(user);
      }
    });
    signInAnonymously(auth).catch((err) => {
      unsub();
      reject(err);
    });
  });
}

/**
 * Escucha los reportes públicos de los últimos días (datos agregados, sin coordenadas).
 * Devuelve la función para cancelar la suscripción.
 */
export function suscribirReportes(callback, onError) {
  if (!firebaseConfigurado) return () => {};

  const desde = new Date();
  desde.setDate(desde.getDate() - (CONFIG.VENTANA_DIAS + 5));

  const q = query(
    collection(db, 'reportes_publicos'),
    where('fecha', '>=', Timestamp.fromDate(desde)),
    orderBy('fecha', 'desc')
  );

  return onSnapshot(
    q,
    (snap) => {
      const reportes = snap.docs.map((d) => {
        const x = d.data();
        const fecha = x.fecha && x.fecha.toDate ? x.fecha.toDate() : new Date();
        return {
          id: d.id,
          colonia: x.colonia,
          tipo: x.tipo,
          sintomas: x.sintomas === undefined ? null : x.sintomas,
          fecha: aFechaISO(fecha),
          timestamp: fecha.getTime(),
          simulado: x.simulado === true,
          origen: 'firestore',
        };
      });
      callback(reportes);
    },
    (err) => {
      console.error('Error escuchando reportes en Firestore:', err);
      if (onError) onError(err);
    }
  );
}

/** Consulta el límite de 48 h de este dispositivo (sesión anónima). */
export async function verificarLimiteFirestore() {
  const user = await asegurarSesion();
  const snap = await getDoc(doc(db, 'limites', user.uid));
  if (!snap.exists()) return { permitido: true, horasRestantes: 0 };

  const ultimo = snap.data().ultimoReporte;
  const fecha = ultimo && ultimo.toDate ? ultimo.toDate() : null;
  if (!fecha) return { permitido: true, horasRestantes: 0 };

  const horas = (Date.now() - fecha.getTime()) / (1000 * 60 * 60);
  if (horas >= CONFIG.LIMITE_HORAS) return { permitido: true, horasRestantes: 0 };
  return { permitido: false, horasRestantes: Math.ceil(CONFIG.LIMITE_HORAS - horas) };
}

/**
 * Crea un reporte real: se escribe junto con el registro del límite de 48 h
 * en una sola operación (las reglas de Firestore lo exigen).
 * Solo se guarda colonia, tipo, síntomas (true/false/null), fecha y simulado:false.
 */
export async function crearReporteFirestore({ colonia, tipo, sintomas }) {
  const user = await asegurarSesion();

  const limRef = doc(db, 'limites', user.uid);
  const repRef = doc(collection(db, 'reportes_publicos'));

  const batch = writeBatch(db);
  batch.set(limRef, { ultimoReporte: serverTimestamp() });
  batch.set(repRef, {
    colonia,
    tipo,
    sintomas: sintomas === undefined ? null : sintomas,
    fecha: serverTimestamp(),
    simulado: false,
  });
  await batch.commit();

  return {
    id: repRef.id,
    colonia,
    tipo,
    sintomas: sintomas === undefined ? null : sintomas,
    fecha: aFechaISO(new Date()),
    timestamp: Date.now(),
    simulado: false,
    origen: 'firestore',
  };
}

/* ------------------------------------------------------------------ */
/* Portal de autoridades: sesión y actualizaciones públicas            */
/* ------------------------------------------------------------------ */

/**
 * Escucha la sesión de la persona autorizada. Llama a callback con
 * { uid, nombre, cargo } si la cuenta está en /autoridades, o con null.
 * Las sesiones anónimas (ciudadanía) se ignoran.
 */
export function escucharAutoridad(callback) {
  if (!firebaseConfigurado) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, async (user) => {
    if (!user || user.isAnonymous) {
      callback(null);
      return;
    }
    try {
      const snap = await getDoc(doc(db, 'autoridades', user.uid));
      if (snap.exists()) {
        const d = snap.data();
        callback({ uid: user.uid, nombre: d.nombre || 'Personal autorizado', cargo: d.cargo || '' });
      } else {
        await signOut(auth); // cuenta válida en Firebase pero no autorizada para este portal
        callback(null);
      }
    } catch (err) {
      console.error('Error verificando autorización:', err);
      callback(null);
    }
  });
}

export async function iniciarSesionAutoridad(correo, clave) {
  if (!firebaseConfigurado) throw new Error('sin_firebase');
  await signInWithEmailAndPassword(auth, correo.trim(), clave);
}

export async function cerrarSesionAutoridad() {
  if (!firebaseConfigurado) return;
  await signOut(auth);
}

/** Escucha las actualizaciones públicas (más recientes primero). */
export function suscribirActualizaciones(callback, onError) {
  if (!firebaseConfigurado) return () => {};
  const q = query(collection(db, 'actualizaciones'), orderBy('fecha', 'desc'));
  return onSnapshot(
    q,
    (snap) => {
      callback(
        snap.docs.map((d) => {
          const x = d.data();
          const f = x.fecha && x.fecha.toDate ? x.fecha.toDate() : new Date();
          return {
            id: d.id,
            colonia: x.colonia,
            tipoProblema: x.tipoProblema,
            estado: x.estado,
            accion: x.accion,
            nota: x.nota,
            autorNombre: x.autorNombre,
            corrigeA: x.corrigeA || null,
            timestamp: f.getTime(),
            origen: 'firestore',
          };
        })
      );
    },
    (err) => {
      console.error('Error escuchando actualizaciones:', err);
      if (onError) onError(err);
    }
  );
}

/** Publica una actualización (solo cuentas autorizadas; las reglas lo verifican). */
export async function crearActualizacionFirestore(datos, autor) {
  if (!firebaseConfigurado) throw new Error('sin_firebase');
  const payload = {
    colonia: datos.colonia,
    tipoProblema: datos.tipoProblema,
    estado: datos.estado,
    accion: datos.accion,
    nota: datos.nota.trim(),
    fecha: serverTimestamp(),
    autorUid: autor.uid,
    autorNombre: autor.nombre,
  };
  if (datos.corrigeA) payload.corrigeA = datos.corrigeA;
  const ref = await addDoc(collection(db, 'actualizaciones'), payload);
  return ref.id;
}
