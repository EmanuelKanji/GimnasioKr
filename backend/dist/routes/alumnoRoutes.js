"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const alumnoController_1 = require("../controllers/alumnoController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
// Rutas para administradores - gestión de alumnos
router.post('/', (0, auth_1.requireRole)(['admin']), (0, validation_1.validate)(validation_1.schemas.createAlumno), alumnoController_1.crearAlumno);
router.get('/', (0, auth_1.requireRole)(['admin', 'profesor']), alumnoController_1.obtenerAlumnos);
// Rutas para alumnos autenticados - sus propios datos
router.get('/me/perfil', (0, auth_1.requireRole)(['alumno', 'admin']), alumnoController_1.obtenerPerfilAlumno);
router.get('/me/plan', (0, auth_1.requireRole)(['alumno', 'admin']), alumnoController_1.obtenerPlanAlumno);
router.get('/me/asistencias', (0, auth_1.requireRole)(['alumno', 'admin']), alumnoController_1.obtenerAsistenciaAlumno);
router.get('/me/avisos', (0, auth_1.requireRole)(['alumno', 'admin']), alumnoController_1.obtenerAvisosAlumno);
// Rutas de renovación
router.post('/me/solicitar-renovacion', (0, auth_1.requireRole)(['alumno']), (0, validation_1.validate)(validation_1.schemas.solicitarRenovacion), alumnoController_1.solicitarRenovacion);
router.get('/me/estado-renovacion', (0, auth_1.requireRole)(['alumno']), alumnoController_1.obtenerEstadoRenovacion);
router.get('/para-renovar', (0, auth_1.requireRole)(['admin']), alumnoController_1.obtenerAlumnosParaRenovar);
router.post('/:id/renovar', (0, auth_1.requireRole)(['admin']), (0, validation_1.validate)(validation_1.schemas.renovarPlan), alumnoController_1.renovarPlanAlumno);
exports.default = router;
