import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { firebaseConfigurado } from '../firebase/firestoreService';

function mensajeError(err) {
  const code = err && err.code ? err.code : '';
  if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found' || code === 'auth/invalid-email') {
    return 'Correo o contraseña incorrectos.';
  }
  if (code === 'auth/too-many-requests') return 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.';
  if (code === 'auth/network-request-failed') return 'No hay conexión con el servidor. Revisa tu internet.';
  if (code === 'auth/operation-not-allowed') return 'El acceso con correo y contraseña no está activado en el proyecto.';
  return 'No se pudo iniciar sesión. Inténtalo de nuevo.';
}

export default function PanelAcceso() {
  const { autoridad, cargandoAuth, iniciarSesionAutoridad } = useApp();
  const navigate = useNavigate();
  const [correo, setCorreo] = useState('');
  const [clave, setClave] = useState('');
  const [verClave, setVerClave] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);

  if (!cargandoAuth && autoridad) return <Navigate to="/panel" replace />;

  const enviar = async (e) => {
    e.preventDefault();
    if (enviando) return;
    setError(null);
    setEnviando(true);
    try {
      await iniciarSesionAutoridad(correo, clave);
      // Si la cuenta no está autorizada, la sesión se cierra sola y se queda aquí.
      navigate('/panel');
    } catch (err) {
      setError(mensajeError(err));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="w-full pt-32 sm:pt-40 pb-12 bg-background flex-1 px-4">
      <div className="max-w-[480px] mx-auto flex flex-col gap-4">
        <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30 overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-primary to-secondary" />
          <div className="p-5 sm:p-7 flex flex-col gap-5">
            <span className="self-start inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed text-[11px] font-bold tracking-wide">
              <span className="material-symbols-outlined text-[16px]">shield_person</span>
              USO INSTITUCIONAL · DEMOSTRACIÓN
            </span>

            <div className="flex flex-col gap-1.5">
              <h1 className="text-2xl sm:text-3xl font-bold text-on-surface leading-tight">Portal de autoridades</h1>
              <p className="text-sm text-on-surface-variant">
                Acceso para el personal autorizado del organismo del agua. Desde aquí se publican actualizaciones
                de atención que la ciudadanía verá en el mapa y en la ficha de cada colonia.
              </p>
            </div>

            {!firebaseConfigurado && (
              <div className="rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-sm p-3">
                Este portal necesita la conexión con Firebase, que no está configurada en este entorno.
              </div>
            )}

            <form onSubmit={enviar} className="flex flex-col gap-4">
              <label className="flex flex-col gap-1.5 text-sm font-semibold text-on-surface">
                Correo electrónico
                <div className="flex items-center gap-2 bg-surface-container rounded-xl px-3 border border-transparent focus-within:border-primary">
                  <span className="material-symbols-outlined text-on-surface-variant text-[20px]">mail</span>
                  <input
                    type="email"
                    required
                    autoComplete="username"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    className="flex-1 min-h-[48px] bg-transparent outline-none text-base font-normal"
                    placeholder="nombre@dominio.org"
                  />
                </div>
              </label>

              <label className="flex flex-col gap-1.5 text-sm font-semibold text-on-surface">
                Contraseña
                <div className="flex items-center gap-2 bg-surface-container rounded-xl px-3 border border-transparent focus-within:border-primary">
                  <span className="material-symbols-outlined text-on-surface-variant text-[20px]">lock</span>
                  <input
                    type={verClave ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={clave}
                    onChange={(e) => setClave(e.target.value)}
                    className="flex-1 min-h-[48px] bg-transparent outline-none text-base font-normal"
                  />
                  <button
                    type="button"
                    onClick={() => setVerClave(!verClave)}
                    className="text-on-surface-variant"
                    aria-label={verClave ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    <span className="material-symbols-outlined text-[20px]">{verClave ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </label>

              {error && (
                <div role="alert" className="rounded-xl bg-red-50 border border-red-300 text-red-900 text-sm p-3 font-medium">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={enviando || !firebaseConfigurado}
                className="min-h-[52px] rounded-xl bg-primary hover:bg-primary-container disabled:opacity-60 text-on-primary font-bold text-base inline-flex items-center justify-center gap-2 transition-colors"
              >
                {enviando ? 'Ingresando...' : 'Ingresar al portal'}
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </button>
            </form>

            <div className="rounded-xl bg-surface-container p-3.5 flex gap-3 text-sm">
              <span className="material-symbols-outlined text-on-surface-variant text-[22px] shrink-0">lock_person</span>
              <div className="flex flex-col gap-0.5">
                <span className="font-semibold text-on-surface">Acceso solo para cuentas autorizadas</span>
                <span className="text-on-surface-variant text-xs">
                  No hay registro público. Las cuentas se dan de alta manualmente. Este entorno es un prototipo
                  con datos de demostración.
                </span>
              </div>
            </div>
          </div>
        </div>

        <Link to="/" className="self-center inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Volver al portal ciudadano
        </Link>
      </div>
    </div>
  );
}
