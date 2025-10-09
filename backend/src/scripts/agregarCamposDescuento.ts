import mongoose from 'mongoose';
import Alumno from '../models/Alumno';
import { connectDB } from '../config/db';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function agregarCamposDescuento() {
  try {
    await connectDB();
    console.log('🔗 Conectado a la base de datos');
    
    // Buscar alumnos que no tienen los campos de descuento
    const alumnos = await Alumno.find({ 
      $or: [
        { descuentoEspecial: { $exists: false } },
        { porcentajeDescuento: { $exists: false } }
      ]
    });
    
    console.log(`📊 Encontrados ${alumnos.length} alumnos sin campos de descuento`);
    
    if (alumnos.length === 0) {
      console.log('✅ Todos los alumnos ya tienen los campos de descuento');
      process.exit(0);
    }
    
    let actualizados = 0;
    
    for (const alumno of alumnos) {
      try {
        // Agregar campos con valores por defecto
        if (!alumno.descuentoEspecial) {
          (alumno as any).descuentoEspecial = 'ninguno';
        }
        if (alumno.porcentajeDescuento === undefined || alumno.porcentajeDescuento === null) {
          (alumno as any).porcentajeDescuento = 0;
        }
        
        await alumno.save();
        actualizados++;
        console.log(`✅ Actualizado: ${alumno.nombre} (${alumno.rut})`);
        
      } catch (error) {
        console.error(`❌ Error actualizando alumno ${alumno.rut}:`, error);
      }
    }
    
    console.log(`\n🎉 Migración completa: ${actualizados} alumnos actualizados`);
    
  } catch (error) {
    console.error('❌ Error en la migración:', error);
  } finally {
    mongoose.disconnect();
    process.exit(0);
  }
}

agregarCamposDescuento();
