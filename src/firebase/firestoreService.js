import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import {
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
