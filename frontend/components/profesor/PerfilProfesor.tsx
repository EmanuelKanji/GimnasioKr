'use client';

import { useState, useEffect } from 'react';
import styles from './PerfilProfesor.module.css';
import { HttpClient } from '../../lib/httpClient';

interface PerfilInfo {
  nombre: string;
  rut: string;
  email: string;
  telefono: string;
  direccion: string;
  fechaNacimiento: string;
  password?: string;
  confirmPassword?: string;
}

interface PerfilProfesorData {
  _id: string;
  nombre: string;
  rut: string;
  email: string;
  telefono: string;
  direccion: string;
  fechaNacimiento: string;
  misAlumnos: string[];
}

export default function PerfilProfesor() {
  const [editMode, setEditMode] = useState(false);
  const [changePasswordMode, setChangePasswordMode] = useState(false);

  const [form, setForm] = useState<PerfilInfo>({
    nombre: '',
    rut: '',
    email: '',
    telefono: '',
    direccion: '',
    fechaNacimiento: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Obtener perfil al cargar
  useEffect(() => {
    const cargarPerfil = async () => {
      try {
        setLoading(true);
        setError('');
        
        const response = await HttpClient.get<PerfilProfesorData>('/profesor/me');
        
        if (response.error) {
          throw new Error(response.error);
        }
        
        if (response.data) {
          setForm({
            nombre: response.data.nombre || '',
            rut: response.data.rut || '',
            email: response.data.email || '',
            telefono: response.data.telefono || '',
            direccion: response.data.direccion || '',
            fechaNacimiento: response.data.fechaNacimiento || '',
            password: '',
            confirmPassword: '',
          });
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error cargando perfil:', err);
        setError(err instanceof Error ? err.message : 'No se pudo cargar el perfil');
        setLoading(false);
      }
    };

    cargarPerfil();
  }, []);

  // Validación de formulario
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!form.nombre.trim()) {
      errors.nombre = 'El nombre es requerido';
    }
    
    if (!form.email.trim()) {
      errors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = 'El email no tiene un formato válido';
    }
    
    if (!form.telefono.trim()) {
      errors.telefono = 'El teléfono es requerido';
    } else if (!/^[0-9+\-\s()]+$/.test(form.telefono)) {
      errors.telefono = 'El teléfono solo puede contener números y caracteres especiales';
    }
    
    if (!form.direccion.trim()) {
      errors.direccion = 'La dirección es requerida';
    }
    
    if (!form.fechaNacimiento) {
      errors.fechaNacimiento = 'La fecha de nacimiento es requerida';
    } else {
      const fechaNac = new Date(form.fechaNacimiento);
      const hoy = new Date();
      const edad = hoy.getFullYear() - fechaNac.getFullYear();
      if (edad < 18 || edad > 100) {
        errors.fechaNacimiento = 'La edad debe estar entre 18 y 100 años';
      }
    }
    
    // Validación de contraseña si está en modo cambio
    if (changePasswordMode) {
      if (!form.password) {
        errors.password = 'La contraseña es requerida';
      } else if (form.password.length < 6) {
        errors.password = 'La contraseña debe tener al menos 6 caracteres';
      }
      
      if (!form.confirmPassword) {
        errors.confirmPassword = 'Confirma la contraseña';
      } else if (form.password !== form.confirmPassword) {
        errors.confirmPassword = 'Las contraseñas no coinciden';
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'rut') return; // No permitir editar rut
    
    setForm({ ...form, [name]: value });
    
    // Limpiar error de validación cuando el usuario empiece a escribir
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      setError('Por favor corrige los errores en el formulario');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      // Preparar datos para enviar (sin password si no está en modo cambio)
      const dataToSend = {
        nombre: form.nombre,
        email: form.email,
        telefono: form.telefono,
        direccion: form.direccion,
        fechaNacimiento: form.fechaNacimiento,
        ...(changePasswordMode && form.password && { password: form.password })
      };

      const response = await HttpClient.post<PerfilProfesorData>('/profesor/me', dataToSend);
      
      if (response.error) {
        throw new Error(response.error);
      }

      setSuccess('Información guardada correctamente');
      setEditMode(false);
      setChangePasswordMode(false);
      
      // Limpiar campos de contraseña
      setForm(prev => ({
        ...prev,
        password: '',
        confirmPassword: ''
      }));

    } catch (err) {
      console.error('Error guardando perfil:', err);
      setError(err instanceof Error ? err.message : 'No se pudo guardar la información');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    setChangePasswordMode(false);
    setValidationErrors({});
    setError('');
    setSuccess('');
    
    // Recargar datos originales
    window.location.reload();
  };

  const togglePasswordMode = () => {
    setChangePasswordMode(!changePasswordMode);
    if (!changePasswordMode) {
      setForm(prev => ({ ...prev, password: '', confirmPassword: '' }));
    }
  };


  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Mi Perfil</h2>
      
      {loading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Cargando perfil...</p>
        </div>
      ) : (
        <>
          {/* Mensajes de estado */}
          {error && (
            <div className={styles.errorMessage}>
              <span>⚠️ {error}</span>
            </div>
          )}
          {success && (
            <div className={styles.successMessage}>
              <span>✅ {success}</span>
            </div>
          )}

          <div className={styles.perfilBox}>
            {/* Información básica */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Información Personal</h3>
              
              <div className={styles.infoRow}>
                <span className={styles.label}>Nombre:</span>
                {editMode ? (
                  <div className={styles.inputGroup}>
                    <input 
                      name="nombre" 
                      value={form.nombre} 
                      onChange={handleChange} 
                      className={`${styles.input} ${validationErrors.nombre ? styles.inputError : ''}`}
                      placeholder="Ingresa tu nombre completo"
                    />
                    {validationErrors.nombre && (
                      <span className={styles.errorText}>{validationErrors.nombre}</span>
                    )}
                  </div>
                ) : (
                  <span className={styles.value}>{form.nombre || 'No especificado'}</span>
                )}
              </div>

              <div className={styles.infoRow}>
                <span className={styles.label}>RUT:</span>
                <input 
                  name="rut" 
                  value={form.rut} 
                  className={`${styles.input} ${styles.readOnly}`} 
                  readOnly 
                />
              </div>

              <div className={styles.infoRow}>
                <span className={styles.label}>Correo:</span>
                {editMode ? (
                  <div className={styles.inputGroup}>
                    <input 
                      name="email" 
                      type="email"
                      value={form.email} 
                      onChange={handleChange} 
                      className={`${styles.input} ${validationErrors.email ? styles.inputError : ''}`}
                      placeholder="correo@ejemplo.com"
                    />
                    {validationErrors.email && (
                      <span className={styles.errorText}>{validationErrors.email}</span>
                    )}
                  </div>
                ) : (
                  <span className={styles.value}>{form.email || 'No especificado'}</span>
                )}
              </div>

              <div className={styles.infoRow}>
                <span className={styles.label}>Teléfono:</span>
                {editMode ? (
                  <div className={styles.inputGroup}>
                    <input 
                      name="telefono" 
                      value={form.telefono} 
                      onChange={handleChange} 
                      className={`${styles.input} ${validationErrors.telefono ? styles.inputError : ''}`}
                      placeholder="+56 9 1234 5678"
                    />
                    {validationErrors.telefono && (
                      <span className={styles.errorText}>{validationErrors.telefono}</span>
                    )}
                  </div>
                ) : (
                  <span className={styles.value}>{form.telefono || 'No especificado'}</span>
                )}
              </div>

              <div className={styles.infoRow}>
                <span className={styles.label}>Dirección:</span>
                {editMode ? (
                  <div className={styles.inputGroup}>
                    <input 
                      name="direccion" 
                      value={form.direccion} 
                      onChange={handleChange} 
                      className={`${styles.input} ${validationErrors.direccion ? styles.inputError : ''}`}
                      placeholder="Calle 123, Comuna, Región"
                    />
                    {validationErrors.direccion && (
                      <span className={styles.errorText}>{validationErrors.direccion}</span>
                    )}
                  </div>
                ) : (
                  <span className={styles.value}>{form.direccion || 'No especificado'}</span>
                )}
              </div>

              <div className={styles.infoRow}>
                <span className={styles.label}>Fecha de nacimiento:</span>
                {editMode ? (
                  <div className={styles.inputGroup}>
                    <input 
                      name="fechaNacimiento" 
                      type="date" 
                      value={form.fechaNacimiento} 
                      onChange={handleChange} 
                      className={`${styles.input} ${validationErrors.fechaNacimiento ? styles.inputError : ''}`}
                    />
                    {validationErrors.fechaNacimiento && (
                      <span className={styles.errorText}>{validationErrors.fechaNacimiento}</span>
                    )}
                  </div>
                ) : (
                  <span className={styles.value}>
                    {form.fechaNacimiento ? new Date(form.fechaNacimiento).toLocaleDateString('es-CL') : 'No especificado'}
                  </span>
                )}
              </div>
            </div>

            {/* Cambio de contraseña */}
            {editMode && (
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h3 className={styles.sectionTitle}>Seguridad</h3>
                  <button 
                    type="button" 
                    onClick={togglePasswordMode}
                    className={styles.toggleButton}
                  >
                    {changePasswordMode ? 'Cancelar cambio' : 'Cambiar contraseña'}
                  </button>
                </div>

                {changePasswordMode && (
                  <>
                    <div className={styles.infoRow}>
                      <span className={styles.label}>Nueva contraseña:</span>
                      <div className={styles.inputGroup}>
                        <input 
                          name="password" 
                          type="password"
                          value={form.password} 
                          onChange={handleChange} 
                          className={`${styles.input} ${validationErrors.password ? styles.inputError : ''}`}
                          placeholder="Mínimo 6 caracteres"
                        />
                        {validationErrors.password && (
                          <span className={styles.errorText}>{validationErrors.password}</span>
                        )}
                      </div>
                    </div>

                    <div className={styles.infoRow}>
                      <span className={styles.label}>Confirmar contraseña:</span>
                      <div className={styles.inputGroup}>
                        <input 
                          name="confirmPassword" 
                          type="password"
                          value={form.confirmPassword} 
                          onChange={handleChange} 
                          className={`${styles.input} ${validationErrors.confirmPassword ? styles.inputError : ''}`}
                          placeholder="Repite la contraseña"
                        />
                        {validationErrors.confirmPassword && (
                          <span className={styles.errorText}>{validationErrors.confirmPassword}</span>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Botones de acción */}
          <div className={styles.actionButtons}>
            {editMode ? (
              <>
                <button 
                  className={`${styles.button} ${styles.saveButton}`} 
                  type="button" 
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? 'Guardando...' : 'Guardar información'}
                </button>
                <button 
                  className={`${styles.button} ${styles.cancelButton}`} 
                  type="button" 
                  onClick={handleCancel}
                >
                  Cancelar
                </button>
              </>
            ) : (
              <button 
                className={`${styles.button} ${styles.editButton}`} 
                type="button" 
                onClick={() => setEditMode(true)}
              >
                Editar información
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

