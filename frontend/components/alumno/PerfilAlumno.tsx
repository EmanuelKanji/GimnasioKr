import styles from './PerfilAlumno.module.css';
import { useState } from 'react';
import { usePerfil } from '../../hooks/usePerfil';

export default function PerfilAlumno() {
  const { perfil, loading } = usePerfil();
  const [mostrarFormularioPassword, setMostrarFormularioPassword] = useState(false);
  const [cambiandoPassword, setCambiandoPassword] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error', texto: string } | null>(null);
  
  const [formularioPassword, setFormularioPassword] = useState({
    passwordActual: '',
    passwordNueva: '',
    confirmarPassword: ''
  });

  const handleCambiarPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones del frontend
    if (!formularioPassword.passwordActual || !formularioPassword.passwordNueva || !formularioPassword.confirmarPassword) {
      setMensaje({ tipo: 'error', texto: 'Todos los campos son requeridos' });
      return;
    }

    if (formularioPassword.passwordNueva.length < 6) {
      setMensaje({ tipo: 'error', texto: 'La nueva contraseña debe tener al menos 6 caracteres' });
      return;
    }

    if (formularioPassword.passwordNueva !== formularioPassword.confirmarPassword) {
      setMensaje({ tipo: 'error', texto: 'Las contraseñas nuevas no coinciden' });
      return;
    }

    setCambiandoPassword(true);
    setMensaje(null);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/cambiar-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          passwordActual: formularioPassword.passwordActual,
          passwordNueva: formularioPassword.passwordNueva
        })
      });

      const data = await res.json();

      if (res.ok) {
        setMensaje({ tipo: 'success', texto: 'Contraseña cambiada exitosamente' });
        setFormularioPassword({ passwordActual: '', passwordNueva: '', confirmarPassword: '' });
        setMostrarFormularioPassword(false);
      } else {
        setMensaje({ tipo: 'error', texto: data.error || 'Error al cambiar contraseña' });
      }
    } catch {
      setMensaje({ tipo: 'error', texto: 'Error de conexión' });
    } finally {
      setCambiandoPassword(false);
    }
  };

  if (loading) return <div className={styles.container}>Cargando perfil...</div>;
  if (!perfil) return <div className={styles.container}>No se encontró el perfil.</div>;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Mi perfil</h2>
      
      {/* Mensaje de éxito/error */}
      {mensaje && (
        <div className={`${styles.mensaje} ${styles[mensaje.tipo]}`}>
          {mensaje.tipo === 'success' ? '✅' : '❌'} {mensaje.texto}
        </div>
      )}

      <div className={styles.perfilBox}>
        <div className={styles.infoRow}><span className={styles.label}>Nombre:</span> {perfil.nombre}</div>
        <div className={styles.infoRow}><span className={styles.label}>RUT:</span> {perfil.rut}</div>
        <div className={styles.infoRow}><span className={styles.label}>Correo:</span> {perfil.email}</div>
        <div className={styles.infoRow}><span className={styles.label}>Teléfono:</span> {perfil.telefono}</div>
        <div className={styles.infoRow}><span className={styles.label}>Dirección:</span> {perfil.direccion}</div>
        <div className={styles.infoRow}><span className={styles.label}>Fecha de nacimiento:</span> {new Date(perfil.fechaNacimiento).toLocaleDateString('es-CL')}</div>
      </div>

      <button 
        className={styles.editBtn} 
        type="button"
        onClick={() => setMostrarFormularioPassword(!mostrarFormularioPassword)}
      >
        {mostrarFormularioPassword ? '❌ Cancelar' : '🔐 Cambiar Contraseña'}
      </button>

      {/* Formulario de cambio de contraseña */}
      {mostrarFormularioPassword && (
        <div className={styles.formularioPassword}>
          <h3>Cambiar Contraseña</h3>
          <form onSubmit={handleCambiarPassword}>
            <div className={styles.formGroup}>
              <label htmlFor="passwordActual">Contraseña Actual:</label>
              <input
                id="passwordActual"
                type="password"
                value={formularioPassword.passwordActual}
                onChange={(e) => setFormularioPassword({...formularioPassword, passwordActual: e.target.value})}
                required
                disabled={cambiandoPassword}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="passwordNueva">Nueva Contraseña:</label>
              <input
                id="passwordNueva"
                type="password"
                value={formularioPassword.passwordNueva}
                onChange={(e) => setFormularioPassword({...formularioPassword, passwordNueva: e.target.value})}
                required
                disabled={cambiandoPassword}
                minLength={6}
              />
              <small>Mínimo 6 caracteres</small>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="confirmarPassword">Confirmar Nueva Contraseña:</label>
              <input
                id="confirmarPassword"
                type="password"
                value={formularioPassword.confirmarPassword}
                onChange={(e) => setFormularioPassword({...formularioPassword, confirmarPassword: e.target.value})}
                required
                disabled={cambiandoPassword}
              />
            </div>

            <div className={styles.formActions}>
              <button 
                type="submit" 
                className={styles.confirmarBtn}
                disabled={cambiandoPassword}
              >
                {cambiandoPassword ? '⏳ Cambiando...' : '✅ Cambiar Contraseña'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
