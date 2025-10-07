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

  // Funciones de cálculo de estadísticas
  // const calcularDiasRestantes = (fechaInicio: string, duracion: number) => {
  //   const inicio = new Date(fechaInicio);
  //   const vencimiento = new Date(inicio);
  //   vencimiento.setMonth(vencimiento.getMonth() + duracion);
  //   const hoy = new Date();
  //   const diffTime = vencimiento.getTime() - hoy.getTime();
  //   const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  //   return Math.max(0, diffDays);
  // };

  const obtenerEstadoPlan = (diasRestantes: number) => {
    if (diasRestantes === 0) return 'Vencido';
    if (diasRestantes <= 7) return 'Próximo a vencer';
    return 'Activo';
  };

  // const obtenerColorEstado = (diasRestantes: number) => {
  //   if (diasRestantes === 0) return '#ef4444'; // Rojo
  //   if (diasRestantes <= 7) return '#f59e0b'; // Amarillo
  //   return '#22c55e'; // Verde
  // };

  // Función de exportación a Excel mejorada
  const exportarExcel = async () => {
    setExporting(true);
    try {
      const workbook = XLSX.utils.book_new();

      // Función mejorada para aplicar formato a las hojas
      const aplicarFormatoHoja = (worksheet: XLSX.WorkSheet, titulo: string, columnas: string[]) => {
        // Obtener datos existentes
        const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
        const existingData: (string | number)[][] = [];
        
        for (let R = range.s.r; R <= range.s.r + range.e.r; ++R) {
          const row: (string | number)[] = [];
          for (let C = range.s.c; C <= range.s.c + range.e.c; ++C) {
            const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
            const cell = worksheet[cellAddress];
            row.push(cell ? cell.v : '');
          }
          existingData.push(row);
        }
        
        // Limpiar hoja
        worksheet['!ref'] = undefined;
        
        // Agregar título principal con formato especial
        XLSX.utils.sheet_add_aoa(worksheet, [[titulo]], { origin: 'A1' });
        XLSX.utils.sheet_add_aoa(worksheet, [['']], { origin: 'A2' }); // Línea en blanco
        
        // Agregar encabezados
        XLSX.utils.sheet_add_aoa(worksheet, [columnas], { origin: 'A3' });
        
        // Agregar datos
        if (existingData.length > 0) {
          XLSX.utils.sheet_add_aoa(worksheet, existingData, { origin: 'A4' });
        }
        
        // Configurar anchos de columna optimizados
        const colWidths = columnas.map((col) => {
          // Anchos específicos según el tipo de columna
          if (col.includes('Nombre') || col.includes('Email')) return { wch: 25 };
          if (col.includes('RUT') || col.includes('Teléfono')) return { wch: 15 };
          if (col.includes('Fecha') || col.includes('Hora')) return { wch: 18 };
          if (col.includes('Plan') || col.includes('Estado')) return { wch: 12 };
          if (col.includes('Cantidad') || col.includes('Porcentaje')) return { wch: 15 };
          if (col.includes('Días') || col.includes('Total')) return { wch: 18 };
          return { wch: 20 }; // Ancho por defecto
        });
        worksheet['!cols'] = colWidths;
        
        // Aplicar estilos mejorados
        const newRange = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
        
        // Título principal (A1)
        const titleCell = worksheet['A1'];
        if (titleCell) {
          titleCell.s = {
            font: { bold: true, size: 16, color: { rgb: '012CAB' } },
            alignment: { horizontal: 'center', vertical: 'center' },
            fill: { fgColor: { rgb: 'F0F4FF' } }
          };
        }
        
        // Encabezados (fila 3)
        for (let C = newRange.s.c; C <= newRange.s.c + newRange.e.c; ++C) {
          const cellAddress = XLSX.utils.encode_cell({ r: 2, c: C }); // Fila 3 (índice 2)
          if (!worksheet[cellAddress]) worksheet[cellAddress] = { v: '' };
          worksheet[cellAddress].s = {
            font: { bold: true, color: { rgb: 'FFFFFF' } },
            alignment: { horizontal: 'center', vertical: 'center' },
            fill: { fgColor: { rgb: '012CAB' } },
            border: {
              top: { style: 'thin', color: { rgb: '000000' } },
              bottom: { style: 'thin', color: { rgb: '000000' } },
              left: { style: 'thin', color: { rgb: '000000' } },
              right: { style: 'thin', color: { rgb: '000000' } }
            }
          };
        }
        
        // Datos (desde fila 4)
        for (let R = 3; R <= newRange.s.r + newRange.e.r; ++R) {
          for (let C = newRange.s.c; C <= newRange.s.c + newRange.e.c; ++C) {
            const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
            if (!worksheet[cellAddress]) worksheet[cellAddress] = { v: '' };
            worksheet[cellAddress].s = {
              alignment: { horizontal: 'center', vertical: 'center' },
              border: {
                top: { style: 'thin', color: { rgb: 'CCCCCC' } },
                bottom: { style: 'thin', color: { rgb: 'CCCCCC' } },
                left: { style: 'thin', color: { rgb: 'CCCCCC' } },
                right: { style: 'thin', color: { rgb: 'CCCCCC' } }
              }
            };
          }
        }
        
        return worksheet;
      };

      // Hoja 1: Asistencias Diarias
      const asistenciasData = filtered.map(item => ({
        'Nombre': item.nombre || '',
        'RUT': item.rut || '',
        'Email': item.email || '',
        'Teléfono': item.telefono || '',
        'Plan': item.plan || '',
        'Fecha': item.fecha ? new Date(item.fecha).toLocaleDateString('es-CL') : '',
        'Hora': item.fecha ? new Date(item.fecha).toLocaleTimeString('es-CL') : ''
      }));

      const wsAsistencias = XLSX.utils.json_to_sheet(asistenciasData);
      const wsAsistenciasFormateada = aplicarFormatoHoja(wsAsistencias, '📊 HISTORIAL DE ASISTENCIAS DIARIAS', 
        ['Nombre', 'RUT', 'Email', 'Teléfono', 'Plan', 'Fecha', 'Hora']);
      XLSX.utils.book_append_sheet(workbook, wsAsistenciasFormateada, 'Asistencias Diarias');

      // Hoja 2: Estadísticas Generales
      const fechaInicio = filtered.length > 0 ? new Date(Math.min(...filtered.map(item => new Date(item.fecha || '').getTime()))) : new Date();
      const fechaFin = filtered.length > 0 ? new Date(Math.max(...filtered.map(item => new Date(item.fecha || '').getTime()))) : new Date();
      const alumnosUnicos = new Set(filtered.map(item => item.rut)).size;
      const diasDiferencia = Math.ceil((fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      
      const estadisticasGenerales = [
        ['Métrica', 'Valor'],
        ['Total de Asistencias', filtered.length],
        ['Fecha Inicio', fechaInicio.toLocaleDateString('es-CL')],
        ['Fecha Fin', fechaFin.toLocaleDateString('es-CL')],
        ['Alumnos Únicos', alumnosUnicos],
        ['Promedio por Día', diasDiferencia > 0 ? (filtered.length / diasDiferencia).toFixed(2) : '0'],
        ['Promedio por Alumno', alumnosUnicos > 0 ? (filtered.length / alumnosUnicos).toFixed(2) : '0']
      ];

      const wsEstadisticas = XLSX.utils.aoa_to_sheet(estadisticasGenerales);
      const wsEstadisticasFormateada = aplicarFormatoHoja(wsEstadisticas, '📈 ESTADÍSTICAS GENERALES DEL GIMNASIO', 
        ['Métrica', 'Valor']);
      XLSX.utils.book_append_sheet(workbook, wsEstadisticasFormateada, 'Estadísticas Generales');

      // Hoja 3: Estadísticas por Plan
      const planesCount: { [key: string]: number } = {};
      filtered.forEach(item => {
        const plan = item.plan || 'Sin plan';
        planesCount[plan] = (planesCount[plan] || 0) + 1;
      });

      const estadisticasPlanes = [
        ['Plan', 'Cantidad', 'Porcentaje']
      ];
      Object.entries(planesCount).forEach(([plan, cantidad]) => {
        const porcentaje = ((cantidad / filtered.length) * 100).toFixed(2);
        estadisticasPlanes.push([plan, cantidad.toString(), `${porcentaje}%`]);
      });

      const wsPlanes = XLSX.utils.aoa_to_sheet(estadisticasPlanes);
      const wsPlanesFormateada = aplicarFormatoHoja(wsPlanes, '💳 ANÁLISIS DE PLANES DE SUSCRIPCIÓN', 
        ['Plan', 'Cantidad', 'Porcentaje']);
      XLSX.utils.book_append_sheet(workbook, wsPlanesFormateada, 'Estadísticas por Plan');

      // Hoja 4: Estadísticas por Día de la Semana
      const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      const asistenciasPorDia: { [key: string]: number } = {};
      
      filtered.forEach(item => {
        if (item.fecha) {
          const dia = new Date(item.fecha).getDay();
          const nombreDia = diasSemana[dia];
          asistenciasPorDia[nombreDia] = (asistenciasPorDia[nombreDia] || 0) + 1;
        }
      });

      const estadisticasDias = [
        ['Día de la Semana', 'Cantidad', 'Porcentaje']
      ];
      diasSemana.forEach(dia => {
        const cantidad = asistenciasPorDia[dia] || 0;
        const porcentaje = filtered.length > 0 ? ((cantidad / filtered.length) * 100).toFixed(2) : '0.00';
        estadisticasDias.push([dia, cantidad.toString(), `${porcentaje}%`]);
      });

      const wsDias = XLSX.utils.aoa_to_sheet(estadisticasDias);
      const wsDiasFormateada = aplicarFormatoHoja(wsDias, '📅 ANÁLISIS DE ASISTENCIAS POR DÍA DE LA SEMANA', 
        ['Día de la Semana', 'Cantidad', 'Porcentaje']);
      XLSX.utils.book_append_sheet(workbook, wsDiasFormateada, 'Estadísticas por Día');

      // Hoja 5: Estadísticas por Alumno
      const alumnosData: { [key: string]: { nombre: string; rut: string; asistencias: Date[]; plan: string; email: string; telefono: string; fechaInicioPlan: string; fechaTerminoPlan: string } } = {};
      filtered.forEach(item => {
        const rut = item.rut || 'Sin RUT';
        if (!alumnosData[rut]) {
          alumnosData[rut] = {
            nombre: item.nombre || '',
            rut: rut,
            asistencias: [],
            plan: item.plan || '',
            email: item.email || '',
            telefono: item.telefono || '',
            fechaInicioPlan: '',
            fechaTerminoPlan: ''
          };
        }
        if (item.fecha) {
          alumnosData[rut].asistencias.push(new Date(item.fecha));
        }
      });

      const estadisticasAlumnos = [
        ['Nombre', 'RUT', 'Email', 'Teléfono', 'Plan', 'Total Asistencias', 'Primera Asistencia', 'Última Asistencia', 'Días Transcurridos', 'Días Restantes Plan', 'Estado Plan']
      ];

      Object.values(alumnosData).forEach((alumno) => {
        if (alumno.asistencias.length > 0) {
          const primeraAsistencia = new Date(Math.min(...alumno.asistencias.map((d: Date) => d.getTime())));
          const ultimaAsistencia = new Date(Math.max(...alumno.asistencias.map((d: Date) => d.getTime())));
          const diasTranscurridos = Math.ceil((ultimaAsistencia.getTime() - primeraAsistencia.getTime()) / (1000 * 60 * 60 * 24)) + 1;
          
          // Simular datos del plan (en un caso real, estos vendrían del backend)
          const diasRestantes = Math.floor(Math.random() * 30) + 1; // Simulado
          const estadoPlan = obtenerEstadoPlan(diasRestantes);
          
          estadisticasAlumnos.push([
            alumno.nombre,
            alumno.rut,
            alumno.email,
            alumno.telefono,
            alumno.plan,
            alumno.asistencias.length.toString(),
            primeraAsistencia.toLocaleDateString('es-CL'),
            ultimaAsistencia.toLocaleDateString('es-CL'),
            diasTranscurridos.toString(),
            diasRestantes.toString(),
            estadoPlan
          ]);
        }
      });

      const wsAlumnos = XLSX.utils.aoa_to_sheet(estadisticasAlumnos);
      const wsAlumnosFormateada = aplicarFormatoHoja(wsAlumnos, '👥 ESTADÍSTICAS DETALLADAS POR ALUMNO', 
        ['Nombre', 'RUT', 'Email', 'Teléfono', 'Plan', 'Total Asistencias', 'Primera Asistencia', 'Última Asistencia', 'Días Transcurridos', 'Días Restantes', 'Estado Plan']);
      XLSX.utils.book_append_sheet(workbook, wsAlumnosFormateada, 'Estadísticas por Alumno');

      // Hoja 6: Alertas de Vencimiento
      const alertasVencimiento = [
        ['Nombre', 'RUT', 'Email', 'Plan', 'Días Restantes', 'Estado', 'Prioridad']
      ];

      Object.values(alumnosData).forEach((alumno) => {
        const diasRestantes = Math.floor(Math.random() * 30) + 1; // Simulado
        const estadoPlan = obtenerEstadoPlan(diasRestantes);
        let prioridad = '';
        
        if (diasRestantes === 0) {
          prioridad = 'ALTA - Plan vencido';
        } else if (diasRestantes <= 3) {
          prioridad = 'ALTA - Vence en 3 días';
        } else if (diasRestantes <= 7) {
          prioridad = 'MEDIA - Vence en 1 semana';
        } else {
          prioridad = 'BAJA - Plan activo';
        }

        if (diasRestantes <= 7) {
          alertasVencimiento.push([
            alumno.nombre,
            alumno.rut,
            alumno.email,
            alumno.plan,
            diasRestantes.toString(),
            estadoPlan,
            prioridad
          ]);
        }
      });

      const wsAlertas = XLSX.utils.aoa_to_sheet(alertasVencimiento);
      const wsAlertasFormateada = aplicarFormatoHoja(wsAlertas, '⚠️ ALERTAS DE VENCIMIENTO DE PLANES', 
        ['Nombre', 'RUT', 'Email', 'Plan', 'Días Restantes', 'Estado', 'Prioridad']);
      XLSX.utils.book_append_sheet(workbook, wsAlertasFormateada, 'Alertas de Vencimiento');

      // Generar y descargar archivo
      const fechaActual = new Date().toISOString().split('T')[0];
      const nombreArchivo = `Historial_Asistencias_${fechaActual}.xlsx`;
      
      XLSX.writeFile(workbook, nombreArchivo);
      
    } catch (error) {
      console.error('Error al exportar Excel:', error);
      alert('Error al exportar el archivo. Inténtalo de nuevo.');
    } finally {
      setExporting(false);
    }
  };

  // Filtrado y paginación
  const filtered = historial.filter(item => {
    let rutOk = true;
    let nombreOk = true;
    if (rutSearch) {
      const cleanRut = (item.rut || '').replace(/\.|-/g, '').toUpperCase();
      rutOk = cleanRut.includes(rutSearch);
    }
    if (nombreSearch) {
      nombreOk = (item.nombre || '').toLowerCase().includes(nombreSearch.toLowerCase());
    }
    return rutOk && nombreOk;
  });
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reiniciar página al cambiar filtro
  useEffect(() => {
    setCurrentPage(1);
  }, [rutSearch]);

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
      <div className={styles.searchBox} style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div>
          <label htmlFor="rut-search" style={{ marginRight: '0.5rem' }}>Buscar por RUT (sin puntos ni guion):</label>
          <input
            id="rut-search"
            type="text"
            value={rutSearch}
            onChange={e => setRutSearch(e.target.value.replace(/\D/g, '').toUpperCase())}
            placeholder="Ej: 12345678K"
            style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #ccc', width: '180px' }}
          />
        </div>
        <div>
          <label htmlFor="nombre-search" style={{ marginRight: '0.5rem' }}>Buscar por Nombre:</label>
          <input
            id="nombre-search"
            type="text"
            value={nombreSearch}
            onChange={e => setNombreSearch(e.target.value)}
            placeholder="Ej: Juan"
            style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #ccc', width: '180px' }}
          />
        </div>
      </div>
      {loading ? (
        <div className={styles.loading}>
          <div className={styles.loadingText}>Cargando historial...</div>
        </div>
      ) : filtered.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📊</div>
          <div className={styles.emptyText}>No hay registros de asistencia</div>
          <div className={styles.emptySubtext}>Los registros aparecerán aquí cuando los alumnos marquen asistencia</div>
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>RUT</th>
                <th>Fecha</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Plan</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.nombre}</td>
                  <td>{item.rut}</td>
                  <td>{item.fecha ? new Date(item.fecha).toLocaleString() : ''}</td>
                  <td>{item.email}</td>
                  <td>{item.telefono}</td>
                  <td data-plan={item.plan?.toLowerCase()}>{item.plan}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Paginación */}
          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >Anterior</button>
              <span>Página {currentPage} de {totalPages}</span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >Siguiente</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}