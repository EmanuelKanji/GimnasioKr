'use client';

import { useState, useEffect } from 'react';
import styles from './PerfilProfesor.module.css';
import mobileStyles from './PerfilProfesor-mobile.module.css';
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
  const [isMobile, setIsMobile] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [changePasswordMode, setChangePasswordMode] = useState(false);

  // Detectar dispositivo móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
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

  const currentStyles = isMobile ? mobileStyles : styles;

  return (
    <div className={currentStyles.container}>
      <h2 className={currentStyles.title}>Mi Perfil</h2>
      
      {loading ? (
        <div className={currentStyles.loadingContainer}>
          <div className={currentStyles.loadingSpinner}></div>
          <p>Cargando perfil...</p>
        </div>
      ) : (
        <>
          {/* Mensajes de estado */}
          {error && (
            <div className={currentStyles.errorMessage}>
              <span>⚠️ {error}</span>
            </div>
          )}
          {success && (
            <div className={currentStyles.successMessage}>
              <span>✅ {success}</span>
            </div>
          )}

          <div className={currentStyles.perfilBox}>
            {/* Información básica */}
            <div className={currentStyles.section}>
              <h3 className={currentStyles.sectionTitle}>Información Personal</h3>
              
              <div className={currentStyles.infoRow}>
                <span className={currentStyles.label}>Nombre:</span>
                {editMode ? (
                  <div className={currentStyles.inputGroup}>
                    <input 
                      name="nombre" 
                      value={form.nombre} 
                      onChange={handleChange} 
                      className={`${currentStyles.input} ${validationErrors.nombre ? currentStyles.inputError : ''}`}
                      placeholder="Ingresa tu nombre completo"
                    />
                    {validationErrors.nombre && (
                      <span className={currentStyles.errorText}>{validationErrors.nombre}</span>
                    )}
                  </div>
                ) : (
                  <span className={currentStyles.value}>{form.nombre || 'No especificado'}</span>
                )}
              </div>

              <div className={currentStyles.infoRow}>
                <span className={currentStyles.label}>RUT:</span>
                <input 
                  name="rut" 
                  value={form.rut} 
                  className={`${currentStyles.input} ${currentStyles.readOnly}`} 
                  readOnly 
                />
              </div>

              <div className={currentStyles.infoRow}>
                <span className={currentStyles.label}>Correo:</span>
                {editMode ? (
                  <div className={currentStyles.inputGroup}>
                    <input 
                      name="email" 
                      type="email"
                      value={form.email} 
                      onChange={handleChange} 
                      className={`${currentStyles.input} ${validationErrors.email ? currentStyles.inputError : ''}`}
                      placeholder="correo@ejemplo.com"
                    />
                    {validationErrors.email && (
                      <span className={currentStyles.errorText}>{validationErrors.email}</span>
                    )}
                  </div>
                ) : (
                  <span className={currentStyles.value}>{form.email || 'No especificado'}</span>
                )}
              </div>

              <div className={currentStyles.infoRow}>
                <span className={currentStyles.label}>Teléfono:</span>
                {editMode ? (
                  <div className={currentStyles.inputGroup}>
                    <input 
                      name="telefono" 
                      value={form.telefono} 
                      onChange={handleChange} 
                      className={`${currentStyles.input} ${validationErrors.telefono ? currentStyles.inputError : ''}`}
                      placeholder="+56 9 1234 5678"
                    />
                    {validationErrors.telefono && (
                      <span className={currentStyles.errorText}>{validationErrors.telefono}</span>
                    )}
                  </div>
                ) : (
                  <span className={currentStyles.value}>{form.telefono || 'No especificado'}</span>
                )}
              </div>

              <div className={currentStyles.infoRow}>
                <span className={currentStyles.label}>Dirección:</span>
                {editMode ? (
                  <div className={currentStyles.inputGroup}>
                    <input 
                      name="direccion" 
                      value={form.direccion} 
                      onChange={handleChange} 
                      className={`${currentStyles.input} ${validationErrors.direccion ? currentStyles.inputError : ''}`}
                      placeholder="Calle 123, Comuna, Región"
                    />
                    {validationErrors.direccion && (
                      <span className={currentStyles.errorText}>{validationErrors.direccion}</span>
                    )}
                  </div>
                ) : (
                  <span className={currentStyles.value}>{form.direccion || 'No especificado'}</span>
                )}
              </div>

              <div className={currentStyles.infoRow}>
                <span className={currentStyles.label}>Fecha de nacimiento:</span>
                {editMode ? (
                  <div className={currentStyles.inputGroup}>
                    <input 
                      name="fechaNacimiento" 
                      type="date" 
                      value={form.fechaNacimiento} 
                      onChange={handleChange} 
                      className={`${currentStyles.input} ${validationErrors.fechaNacimiento ? currentStyles.inputError : ''}`}
                    />
                    {validationErrors.fechaNacimiento && (
                      <span className={currentStyles.errorText}>{validationErrors.fechaNacimiento}</span>
                    )}
                  </div>
                ) : (
                  <span className={currentStyles.value}>
                    {form.fechaNacimiento ? new Date(form.fechaNacimiento).toLocaleDateString('es-CL') : 'No especificado'}
                  </span>
                )}
              </div>
            </div>

            {/* Cambio de contraseña */}
            {editMode && (
              <div className={currentStyles.section}>
                <div className={currentStyles.sectionHeader}>
                  <h3 className={currentStyles.sectionTitle}>Seguridad</h3>
                  <button 
                    type="button" 
                    onClick={togglePasswordMode}
                    className={currentStyles.toggleButton}
                  >
                    {changePasswordMode ? 'Cancelar cambio' : 'Cambiar contraseña'}
                  </button>
                </div>

                {changePasswordMode && (
                  <>
                    <div className={currentStyles.infoRow}>
                      <span className={currentStyles.label}>Nueva contraseña:</span>
                      <div className={currentStyles.inputGroup}>
                        <input 
                          name="password" 
                          type="password"
                          value={form.password} 
                          onChange={handleChange} 
                          className={`${currentStyles.input} ${validationErrors.password ? currentStyles.inputError : ''}`}
                          placeholder="Mínimo 6 caracteres"
                        />
                        {validationErrors.password && (
                          <span className={currentStyles.errorText}>{validationErrors.password}</span>
                        )}
                      </div>
                    </div>

                    <div className={currentStyles.infoRow}>
                      <span className={currentStyles.label}>Confirmar contraseña:</span>
                      <div className={currentStyles.inputGroup}>
                        <input 
                          name="confirmPassword" 
                          type="password"
                          value={form.confirmPassword} 
                          onChange={handleChange} 
                          className={`${currentStyles.input} ${validationErrors.confirmPassword ? currentStyles.inputError : ''}`}
                          placeholder="Repite la contraseña"
                        />
                        {validationErrors.confirmPassword && (
                          <span className={currentStyles.errorText}>{validationErrors.confirmPassword}</span>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Botones de acción */}
          <div className={currentStyles.actionButtons}>
            {editMode ? (
              <>
                <button 
                  className={`${currentStyles.button} ${currentStyles.saveButton}`} 
                  type="button" 
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? 'Guardando...' : 'Guardar información'}
                </button>
                <button 
                  className={`${currentStyles.button} ${currentStyles.cancelButton}`} 
                  type="button" 
                  onClick={handleCancel}
                >
                  Cancelar
                </button>
              </>
            ) : (
              <button 
                className={`${currentStyles.button} ${currentStyles.editButton}`} 
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

