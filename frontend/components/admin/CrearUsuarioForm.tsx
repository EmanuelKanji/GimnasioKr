import { useState } from 'react';
import styles from './CrearUsuarioForm.module.css';

type Props = unknown;

export default function CrearUsuarioForm(props: Props) {
  const [role, setRole] = useState<'alumno' | 'profesor'>('alumno');
  const [rut, setRut] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const token = localStorage.getItem('token');
  const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/usuarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username: email, rut, password, role })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('✅ Usuario creado correctamente');
        setRut('');
        setEmail('');
        setPassword('');
      } else {
        setMessage('❌ ' + (data.error || 'Error al crear usuario'));
      }
    } catch (err) {
      setMessage('❌ Error de red');
    }
    setLoading(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.formCard}>
        <div className={styles.header}>
          <h2 className={styles.title}>Crear Nuevo Usuario</h2>
          <div className={styles.titleUnderline}></div>
          <p className={styles.subtitle}>Gestión del sistema administrativo</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Selector de Rol */}
          <div className={styles.inputGroup}>
            <label htmlFor="role" className={styles.label}>
              Tipo de usuario
            </label>
            <div className={styles.selectWrapper}>
              <select 
                id="role"
                value={role} 
                onChange={e => setRole(e.target.value as 'alumno' | 'profesor')}
                className={styles.select}
                disabled={loading}
              >
                <option value="alumno">👤 Alumno</option>
                <option value="profesor">🏋️‍♂️ Profesor</option>
              </select>
              <div className={styles.selectIcon}>▼</div>
            </div>
          </div>

          {/* Campo RUT */}
          <div className={styles.inputGroup}>
            <label htmlFor="rut" className={styles.label}>
              RUT
            </label>
            <div className={styles.inputWrapper}>
              <input 
                id="rut"
                type="text" 
                value={rut} 
                onChange={e => setRut(e.target.value)} 
                placeholder="12.345.678-9"
                className={styles.input}
                required 
                disabled={loading}
                pattern="^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$"
                title="Formato RUT: 12.345.678-9"
              />
              <div className={styles.inputIcon}>🆔</div>
            </div>
          </div>

          {/* Campo Correo */}
          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>
              Correo electrónico
            </label>
            <div className={styles.inputWrapper}>
              <input 
                id="email"
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                placeholder="usuario@email.com"
                className={styles.input}
                required 
                disabled={loading}
              />
              <div className={styles.inputIcon}>✉️</div>
            </div>
          </div>

          {/* Campo Contraseña */}
          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>
              Contraseña
            </label>
            <div className={styles.inputWrapper}>
              <input 
                id="password"
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                placeholder="••••••••"
                className={styles.input}
                required 
                disabled={loading}
              />
              <div className={styles.inputIcon}>🔒</div>
            </div>
          </div>

          {/* Botón de envío */}
          <button 
            type="submit" 
            disabled={loading}
            className={`${styles.submitButton} ${loading ? styles.loading : ''}`}
          >
            <span className={styles.buttonText}>
              {loading ? '⏳ Creando...' : '🚀 Crear Usuario'}
            </span>
            <div className={styles.buttonIcon}>
              {loading ? '⏳' : '→'}
            </div>
          </button>

          {/* Mensaje de estado */}
          {message && (
            <div className={`${styles.message} ${message.includes('✅') ? styles.success : styles.error}`}>
              {message}
            </div>
          )}
        </form>

        {/* Información adicional */}
        <div className={styles.footer}>
          <div className={styles.infoBox}>
            <div className={styles.infoIcon}>💡</div>
            <div className={styles.infoText}>
              <strong>Nota:</strong> Los usuarios creados tendrán acceso inmediato al sistema según su rol asignado.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}