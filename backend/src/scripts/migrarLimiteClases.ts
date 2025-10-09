import Alumno from '../models/Alumno';
import Plan from '../models/Plan';
import { connectDB } from '../config/db';

async function migrarLimiteClases() {
  try {
    await connectDB();
    console.log('🔗 Conectado a la base de datos');
    
    // Buscar alumnos que no tienen limiteClases definido
    const alumnos = await Alumno.find({ 
      $or: [
        { limiteClases: { $exists: false } },
        { limiteClases: null },
        { limiteClases: '' }
      ]
    });
    
    console.log(`📊 Encontrados ${alumnos.length} alumnos sin limiteClases`);
    
    if (alumnos.length === 0) {
      console.log('✅ Todos los alumnos ya tienen limiteClases definido');
      process.exit(0);
    }
    
    let migrados = 0;
    let errores = 0;
    
    for (const alumno of alumnos) {
      try {
        let limiteClases = 'todos_los_dias';
        
        // Intentar obtener del plan en la colección Plan
        const plan = await Plan.findOne({ nombre: alumno.plan });
        if (plan?.limiteClases) {
          limiteClases = plan.limiteClases;
          console.log(`📋 Plan encontrado: ${plan.nombre} -> ${limiteClases}`);
        } else {
          // Inferir del nombre del plan
          const nombrePlan = alumno.plan.toLowerCase();
          if (nombrePlan.includes('12')) {
            limiteClases = '12';
          } else if (nombrePlan.includes('8')) {
            limiteClases = '8';
          }
          console.log(`🔍 Inferido del nombre: ${alumno.plan} -> ${limiteClases}`);
        }
        
        // Actualizar el alumno
        alumno.limiteClases = limiteClases as any;
        await alumno.save();
        
        migrados++;
        console.log(`✅ Migrado: ${alumno.nombre} (${alumno.rut}) -> ${limiteClases}`);
        
      } catch (error) {
        errores++;
        console.error(`❌ Error migrando alumno ${alumno.rut}:`, error);
      }
    }
    
    console.log(`\n🎉 Migración completa:`);
    console.log(`   ✅ Alumnos migrados: ${migrados}`);
    console.log(`   ❌ Errores: ${errores}`);
    console.log(`   📊 Total procesados: ${alumnos.length}`);
    
  } catch (error) {
    console.error('❌ Error en la migración:', error);
  } finally {
    process.exit(0);
  }
}

// Ejecutar migración
migrarLimiteClases();
