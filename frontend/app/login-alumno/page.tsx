'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import styles from './LoginAlumno.module.css';

export default function LoginAlumnoPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password) {
      setError('Por favor completa todos los campos');
      return;
    }

    const result = await login(formData);
    
    if (!result.success) {
      setError(result.error || 'Error al iniciar sesión');
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.loginContainer}>
        <div className={styles.loginCard}>
          {/* Header con gradiente */}
          <div className={styles.header}>
            <h1 className={styles.title}>Login Alumno</h1>
            <div className={styles.titleUnderline}></div>
            <p className={styles.subtitle}>Accede a tu cuenta personal</p>
          </div>
          
          {/* Formulario */}
          <form className={styles.form} onSubmit={handleSubmit}>
            {error && (
              <div className={styles.errorMessage}>
                {error}
              </div>
            )}
            
            <div className={styles.inputGroup}>
              <label htmlFor="username" className={styles.label}>
                Usuario
              </label>
              <input
                id="username"
                name="username"
                type="text"
                placeholder="usuario123"
                className={styles.input}
                value={formData.username}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
              <div className={styles.inputIcon}>👤</div>
            </div>
            
            <div className={styles.inputGroup}>
              <label htmlFor="password" className={styles.label}>
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                className={styles.input}
                value={formData.password}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
              <div className={styles.inputIcon}>🔒</div>
            </div>
            
            <div className={styles.rememberForgot}>
              <label className={styles.rememberMe}>
                <input type="checkbox" className={styles.checkbox} />
                <span className={styles.checkmark}></span>
                Recordar sesión
              </label>
              <a href="#" className={styles.forgotLink}>
                ¿Olvidaste tu contraseña?
              </a>
            </div>
            
            <button 
              type="submit" 
              className={styles.loginButton}
              disabled={isLoading}
            >
              <span className={styles.buttonText}>
                {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
              </span>
              <div className={styles.buttonIcon}>
                {isLoading ? '⏳' : '💪'}
              </div>
            </button>
          </form>
          
          {/* Footer */}
          <div className={styles.footer}>
            <div className={styles.divider}>
              <span className={styles.dividerText}>Gym Access</span>
            </div>
            <p className={styles.footerText}>
              ¿Nuevo en el gimnasio? <a href="#" className={styles.registerLink}>Regístrate aquí</a>
            </p>
          </div>
        </div>
        
        {/* Efecto de fondo decorativo */}
        <div className={styles.backgroundEffect}></div>
      </div>
    </main>
  );
}