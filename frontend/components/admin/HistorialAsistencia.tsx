'use client';
import { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import type { Asistencia } from '../../../shared/types';
import styles from './HistorialAsistencia.module.css';

export default function HistorialAsistencia() {
  const [historial, setHistorial] = useState<Asistencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [rutSearch, setRutSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [nombreSearch, setNombreSearch] = useState('');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(process.env.NEXT_PUBLIC_API_URL + '/api/asistencias', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setHistorial(data);
        } else if (Array.isArray(data.historial)) {
          setHistorial(data.historial);
        } else {
          setHistorial([]);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Función para obtener estado del plan (comentada por no uso actual)
  // const obtenerEstadoPlan = (diasRestantes: number) => {
  //   if (diasRestantes === 0) return 'Vencido';
  //   if (diasRestantes <= 7) return 'Próximo a vencer';
  //   return 'Activo';
  // };

  const exportarExcel = async () => {
    setExporting(true);
    try {
      const workbook = XLSX.utils.book_new();
      
      // Función auxiliar para auto-ajustar columnas
      const autoAjustarColumnas = (worksheet: XLSX.WorkSheet) => {
        const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
        const colWidths: number[] = [];
        
        for (let C = range.s.c; C <= range.e.c; ++C) {
          let maxWidth = 10; // Ancho mínimo
          
          for (let R = range.s.r; R <= range.e.r; ++R) {
            const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
            const cell = worksheet[cellAddress];
            
            if (cell && cell.v) {
              const cellValue = String(cell.v);
              maxWidth = Math.max(maxWidth, cellValue.length);
            }
          }
          
          colWidths[C] = Math.min(maxWidth + 2, 50); // Máximo 50, +2 para margen
        }
        
        worksheet['!cols'] = colWidths.map(w => ({ wch: w }));
      };
      
      // ========== HOJA 1: Asistencias Diarias ==========
      const dataAsistencias = filtered.map(item => ({
        'Fecha': new Date(item.fecha).toLocaleDateString('es-CL'),
        'Nombre': item.nombre || 'N/A',
        'RUT': item.rut || 'N/A',
        'Email': item.email || 'N/A',
        'Plan': item.plan || 'N/A',
        'Teléfono': item.telefono || 'N/A'
      }));
      const wsAsistencias = XLSX.utils.json_to_sheet(dataAsistencias);
      autoAjustarColumnas(wsAsistencias);
      XLSX.utils.book_append_sheet(workbook, wsAsistencias, 'Asistencias Diarias');
      
      // ========== HOJA 2: Estadísticas Generales ==========
      const fechas = filtered.map(a => new Date(a.fecha));
      const fechaMin = fechas.length > 0 ? new Date(Math.min(...fechas.map(f => f.getTime()))) : new Date();
      const fechaMax = fechas.length > 0 ? new Date(Math.max(...fechas.map(f => f.getTime()))) : new Date();
      const alumnosUnicos = new Set(filtered.map(a => a.rut)).size;
      const diasUnicos = new Set(filtered.map(a => new Date(a.fecha).toDateString())).size;
      
      const dataGenerales = [
        { 'Métrica': 'Total de Asistencias', 'Valor': filtered.length },
        { 'Métrica': 'Período', 'Valor': `${fechaMin.toLocaleDateString('es-CL')} - ${fechaMax.toLocaleDateString('es-CL')}` },
        { 'Métrica': 'Alumnos Únicos', 'Valor': alumnosUnicos },
        { 'Métrica': 'Días con Asistencias', 'Valor': diasUnicos },
        { 'Métrica': 'Promedio por Día', 'Valor': diasUnicos > 0 ? (filtered.length / diasUnicos).toFixed(2) : '0' },
        { 'Métrica': 'Promedio por Alumno', 'Valor': alumnosUnicos > 0 ? (filtered.length / alumnosUnicos).toFixed(2) : '0' }
      ];
      const wsGenerales = XLSX.utils.json_to_sheet(dataGenerales);
      autoAjustarColumnas(wsGenerales);
      XLSX.utils.book_append_sheet(workbook, wsGenerales, 'Estadísticas Generales');
      
      // ========== HOJA 3: Estadísticas por Plan ==========
      const porPlan: Record<string, { count: number, alumnos: Set<string> }> = {};
      filtered.forEach(a => {
        const plan = a.plan || 'Sin Plan';
        if (!porPlan[plan]) {
          porPlan[plan] = { count: 0, alumnos: new Set() };
        }
        porPlan[plan].count++;
        porPlan[plan].alumnos.add(a.rut);
      });
      
      const dataPorPlan = Object.entries(porPlan).map(([plan, data]) => ({
        'Plan': plan,
        'Asistencias': data.count,
        'Porcentaje': `${((data.count / filtered.length) * 100).toFixed(2)}%`,
        'Alumnos Únicos': data.alumnos.size
      }));
      const wsPorPlan = XLSX.utils.json_to_sheet(dataPorPlan);
      autoAjustarColumnas(wsPorPlan);
      XLSX.utils.book_append_sheet(workbook, wsPorPlan, 'Estadísticas por Plan');
      
      // ========== HOJA 4: Estadísticas por Día de la Semana ==========
      const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      const porDia: Record<string, number> = {};
      diasSemana.forEach(d => porDia[d] = 0);
      
      filtered.forEach(a => {
        const dia = new Date(a.fecha).getDay();
        porDia[diasSemana[dia]]++;
      });
      
      const dataPorDia = diasSemana.map(dia => ({
        'Día': dia,
        'Asistencias': porDia[dia],
        'Porcentaje': filtered.length > 0 ? `${((porDia[dia] / filtered.length) * 100).toFixed(2)}%` : '0%'
      }));
      const wsPorDia = XLSX.utils.json_to_sheet(dataPorDia);
      autoAjustarColumnas(wsPorDia);
      XLSX.utils.book_append_sheet(workbook, wsPorDia, 'Estadísticas por Día');
      
      // ========== HOJA 5: Estadísticas por Alumno ==========
      const porAlumno: Record<string, {
        nombre: string;
        rut: string;
        email: string;
        plan: string;
        asistencias: Date[];
        fechaTerminoPlan?: string;
      }> = {};
      filtered.forEach(a => {
        if (!porAlumno[a.rut]) {
          porAlumno[a.rut] = {
            nombre: a.nombre || '',
            rut: a.rut,
            email: a.email || '',
            plan: a.plan || '',
            asistencias: [],
            fechaTerminoPlan: a.fechaTerminoPlan
          };
        }
        porAlumno[a.rut].asistencias.push(new Date(a.fecha));
      });
      
      const dataPorAlumno = Object.values(porAlumno).map((alumno) => {
        const fechas = alumno.asistencias.sort((a: Date, b: Date) => a.getTime() - b.getTime());
        const primera = fechas[0];
        const ultima = fechas[fechas.length - 1];
        const diasTranscurridos = Math.ceil((ultima.getTime() - primera.getTime()) / (1000 * 60 * 60 * 24));
        
        // Calcular días restantes del plan
        let diasRestantes = 0;
        let estadoPlan = 'Sin datos';
        if (alumno.fechaTerminoPlan) {
          const hoy = new Date();
          const fechaTermino = new Date(alumno.fechaTerminoPlan);
          diasRestantes = Math.ceil((fechaTermino.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
          
          if (diasRestantes < 0) {
            estadoPlan = 'Vencido';
          } else if (diasRestantes <= 7) {
            estadoPlan = 'Próximo a vencer';
          } else {
            estadoPlan = 'Activo';
          }
        }
        
        return {
          'Nombre': alumno.nombre,
          'RUT': alumno.rut,
          'Email': alumno.email,
          'Plan': alumno.plan,
          'Total Asistencias': alumno.asistencias.length,
          'Primera Asistencia': primera.toLocaleDateString('es-CL'),
          'Última Asistencia': ultima.toLocaleDateString('es-CL'),
          'Días Transcurridos': diasTranscurridos,
          'Días Restantes Plan': diasRestantes > 0 ? diasRestantes : 0,
          'Estado Plan': estadoPlan,
          'Fecha Término': alumno.fechaTerminoPlan ? new Date(alumno.fechaTerminoPlan).toLocaleDateString('es-CL') : 'N/A'
        };
      });
      const wsPorAlumno = XLSX.utils.json_to_sheet(dataPorAlumno);
      autoAjustarColumnas(wsPorAlumno);
      XLSX.utils.book_append_sheet(workbook, wsPorAlumno, 'Estadísticas por Alumno');
      
      // ========== HOJA 6: Alertas de Vencimiento ==========
      const alertas = dataPorAlumno
        .filter((a) => a['Días Restantes Plan'] > 0 && a['Días Restantes Plan'] <= 7)
        .map((a) => ({
          'Nombre': a.Nombre,
          'RUT': a.RUT,
          'Email': a.Email,
          'Plan': a.Plan,
          'Días Restantes': a['Días Restantes Plan'],
          'Estado': a['Estado Plan'],
          'Prioridad': a['Días Restantes Plan'] <= 3 ? 'Alta' : 'Media',
          'Fecha Término': a['Fecha Término']
        }))
        .sort((a, b) => a['Días Restantes'] - b['Días Restantes']);
      
      const wsAlertas = XLSX.utils.json_to_sheet(
        alertas.length > 0 ? alertas : [{ 'Mensaje': 'No hay planes próximos a vencer' }]
      );
      autoAjustarColumnas(wsAlertas);
      XLSX.utils.book_append_sheet(workbook, wsAlertas, 'Alertas de Vencimiento');
      
      // ========== Generar y Descargar Archivo ==========
      const fechaActual = new Date().toISOString().split('T')[0];
      const nombreArchivo = `Historial_Asistencias_${fechaActual}.xlsx`;
      
      XLSX.writeFile(workbook, nombreArchivo);
      
      console.log('✅ Excel exportado exitosamente:', nombreArchivo);
      
    } catch (error) {
      console.error('❌ Error al exportar Excel:', error);
      alert('Error al exportar el archivo. Inténtalo de nuevo.');
    } finally {
      setExporting(false);
    }
  };

  // Filtrado y paginación
  const filtered = historial.filter(item => {
    const rutMatch = rutSearch 
      ? (item.rut || '').replace(/\.|-/g, '').toUpperCase().includes(rutSearch)
      : true;
    
    const nombreMatch = nombreSearch
      ? (item.nombre || '').toLowerCase().includes(nombreSearch.toLowerCase())
      : true;
    
    return rutMatch && nombreMatch;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [rutSearch, nombreSearch]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <h2 className={styles.title}>Historial de Asistencia</h2>
        </div>
        <button 
          onClick={exportarExcel} 
          disabled={exporting || filtered.length === 0}
          className={styles.exportButton}
        >
          {exporting ? 'Exportando...' : '📊 Exportar Excel'}
        </button>
      </div>

      {/* Búsquedas */}
      <div className={styles.searchContainer}>
        <div className={styles.searchGroup}>
          <label htmlFor="rut-search" className={styles.searchLabel}>
            Buscar por RUT:
          </label>
          <input
            id="rut-search"
            type="text"
            value={rutSearch}
            onChange={e => setRutSearch(e.target.value.replace(/\D/g, '').toUpperCase())}
            placeholder="Ej: 12345678K"
            className={styles.searchInput}
          />
        </div>
        <div className={styles.searchGroup}>
          <label htmlFor="nombre-search" className={styles.searchLabel}>
            Buscar por Nombre:
          </label>
          <input
            id="nombre-search"
            type="text"
            value={nombreSearch}
            onChange={e => setNombreSearch(e.target.value)}
            placeholder="Ej: Juan"
            className={styles.searchInput}
          />
        </div>
      </div>

      {/* Estado de carga */}
      {loading ? (
        <div className={styles.loading}>
          <div className={styles.loadingText}>Cargando historial...</div>
        </div>
      ) : filtered.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📊</div>
          <div className={styles.emptyText}>No hay registros de asistencia</div>
          <div className={styles.emptySubtext}>
            {historial.length === 0 
              ? "Los registros aparecerán aquí cuando los alumnos marquen asistencia" 
              : "No se encontraron resultados para tu búsqueda"}
          </div>
        </div>
      ) : (
        <>
          {/* Información de resultados */}
          <div className={styles.resultsInfo}>
            Mostrando {paginated.length} de {filtered.length} registros
            {totalPages > 1 && ` - Página ${currentPage} de ${totalPages}`}
          </div>

          {/* Tabla */}
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead className={styles.tableHead}>
                <tr>
                  <th className={styles.tableHeader}>Nombre</th>
                  <th className={styles.tableHeader}>RUT</th>
                  <th className={styles.tableHeader}>Fecha y Hora</th>
                  <th className={styles.tableHeader}>Email</th>
                  <th className={styles.tableHeader}>Teléfono</th>
                  <th className={styles.tableHeader}>Plan</th>
                </tr>
              </thead>
              <tbody className={styles.tableBody}>
                {paginated.map((item, idx) => (
                  <tr key={`${item.rut}-${item.fecha}-${idx}`} className={styles.tableRow}>
                    <td className={styles.tableCell} data-label="Nombre">
                      {item.nombre || 'N/A'}
                    </td>
                    <td className={styles.tableCell} data-label="RUT">
                      {item.rut || 'N/A'}
                    </td>
                    <td className={styles.tableCell} data-label="Fecha">
                      {item.fecha ? new Date(item.fecha).toLocaleString('es-CL') : 'N/A'}
                    </td>
                    <td className={styles.tableCell} data-label="Email">
                      {item.email || 'N/A'}
                    </td>
                    <td className={styles.tableCell} data-label="Teléfono">
                      {item.telefono || 'N/A'}
                    </td>
                    <td 
                      className={`${styles.tableCell} ${styles.planCell}`} 
                      data-label="Plan"
                      data-plan={item.plan?.toLowerCase() || 'sin-plan'}
                    >
                      {item.plan || 'Sin plan'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                className={styles.paginationButton}
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                Primera
              </button>
              <button
                className={styles.paginationButton}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </button>
              
              <span className={styles.paginationInfo}>
                Página {currentPage} de {totalPages}
              </span>
              
              <button
                className={styles.paginationButton}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Siguiente
              </button>
              <button
                className={styles.paginationButton}
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                Última
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}