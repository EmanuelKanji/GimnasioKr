import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import Alumno from '../models/Alumno';
import User from '../models/User';
import Profesor from '../models/Profesor';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Función para limpiar RUT
const limpiarRut = (r: string) => r.replace(/\.|-/g, '').toUpperCase();

async function verificarYCorregirRuts() {
  try {
    console.log('🔍 Conectando a la base de datos...');
    await connectDB();
    console.log('✅ Conectado a MongoDB');

    // Verificar alumnos
    console.log('\n📊 === VERIFICANDO ALUMNOS ===');
    const alumnos = await Alumno.find({}, 'rut nombre email');
    console.log(`Total de alumnos: ${alumnos.length}`);
    
    let alumnosCorregidos = 0;
    for (const alumno of alumnos) {
      const rutLimpio = limpiarRut(alumno.rut);
      if (alumno.rut !== rutLimpio) {
        console.log(`🔧 Corrigiendo alumno: ${alumno.nombre} (${alumno.rut} → ${rutLimpio})`);
        await Alumno.updateOne({ _id: alumno._id }, { rut: rutLimpio });
        alumnosCorregidos++;
      } else {
        console.log(`✅ Alumno OK: ${alumno.nombre} (${alumno.rut})`);
      }
    }

    // Verificar usuarios
    console.log('\n📊 === VERIFICANDO USUARIOS ===');
    const usuarios = await User.find({}, 'rut username role');
    console.log(`Total de usuarios: ${usuarios.length}`);
    
    let usuariosCorregidos = 0;
    for (const usuario of usuarios) {
      if (usuario.rut) {
        const rutLimpio = limpiarRut(usuario.rut);
        if (usuario.rut !== rutLimpio) {
          console.log(`🔧 Corrigiendo usuario: ${usuario.username} (${usuario.rut} → ${rutLimpio})`);
          await User.updateOne({ _id: usuario._id }, { rut: rutLimpio });
          usuariosCorregidos++;
        } else {
          console.log(`✅ Usuario OK: ${usuario.username} (${usuario.rut})`);
        }
      }
    }

    // Verificar profesores
    console.log('\n📊 === VERIFICANDO PROFESORES ===');
    const profesores = await Profesor.find({}, 'rut nombre email');
    console.log(`Total de profesores: ${profesores.length}`);
    
    let profesoresCorregidos = 0;
    for (const profesor of profesores) {
      const rutLimpio = limpiarRut(profesor.rut);
      if (profesor.rut !== rutLimpio) {
        console.log(`🔧 Corrigiendo profesor: ${profesor.nombre} (${profesor.rut} → ${rutLimpio})`);
        await Profesor.updateOne({ _id: profesor._id }, { rut: rutLimpio });
        profesoresCorregidos++;
      } else {
        console.log(`✅ Profesor OK: ${profesor.nombre} (${profesor.rut})`);
      }
    }

    // Buscar específicamente el RUT del QR
    console.log('\n🔍 === BUSCANDO RUT ESPECÍFICO ===');
    const rutQR = '229971034';
    console.log(`Buscando RUT: ${rutQR}`);
    
    const alumnoEncontrado = await Alumno.findOne({ rut: rutQR });
    if (alumnoEncontrado) {
      console.log(`✅ Alumno encontrado: ${alumnoEncontrado.nombre} (${alumnoEncontrado.rut})`);
    } else {
      console.log(`❌ Alumno NO encontrado con RUT: ${rutQR}`);
      
      // Buscar variaciones del RUT
      const variaciones = [
        `22.997.103-4`,
        `22997103-4`,
        `22.997103-4`,
        `229971034`,
        `22997103K`,
        `22.997.103-K`
      ];
      
      console.log('🔍 Buscando variaciones del RUT...');
      for (const variacion of variaciones) {
        const alumnoVariacion = await Alumno.findOne({ rut: variacion });
        if (alumnoVariacion) {
          console.log(`✅ Encontrado con variación: ${variacion} → ${alumnoVariacion.nombre}`);
          // Corregir a formato limpio
          await Alumno.updateOne({ _id: alumnoVariacion._id }, { rut: rutQR });
          console.log(`🔧 Corregido a formato limpio: ${rutQR}`);
        }
      }
    }

    console.log('\n📊 === RESUMEN ===');
    console.log(`Alumnos corregidos: ${alumnosCorregidos}`);
    console.log(`Usuarios corregidos: ${usuariosCorregidos}`);
    console.log(`Profesores corregidos: ${profesoresCorregidos}`);

    // Mostrar todos los RUTs de alumnos para verificación
    console.log('\n📋 === TODOS LOS RUTs DE ALUMNOS ===');
    const todosAlumnos = await Alumno.find({}, 'rut nombre').sort({ nombre: 1 });
    todosAlumnos.forEach((alumno, index) => {
      console.log(`${index + 1}. ${alumno.nombre} - ${alumno.rut}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('\n🔌 Desconectado de la base de datos');
    }
  }
}

// Ejecutar el script
verificarYCorregirRuts();
