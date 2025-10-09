"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const profesorController_1 = require("../controllers/profesorController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
// Crear profesor (solo admin)
router.post('/', auth_1.authenticateToken, (0, auth_1.requireRole)(['admin']), (0, validation_1.validate)(validation_1.schemas.crearProfesor), profesorController_1.crearProfesor);
// Obtener perfil del profesor
router.get('/me', auth_1.authenticateToken, (0, auth_1.requireRole)(['profesor']), profesorController_1.obtenerPerfilProfesor);
// Actualizar perfil del profesor
router.post('/me', auth_1.authenticateToken, (0, auth_1.requireRole)(['profesor']), (0, validation_1.validate)(validation_1.schemas.actualizarPerfilProfesor), profesorController_1.actualizarPerfilProfesor);
// Gestión de "mis alumnos"
router.get('/mis-alumnos', auth_1.authenticateToken, (0, auth_1.requireRole)(['profesor']), profesorController_1.obtenerMisAlumnos);
router.post('/mis-alumnos/agregar', auth_1.authenticateToken, (0, auth_1.requireRole)(['profesor']), profesorController_1.agregarMiAlumno);
router.post('/mis-alumnos/eliminar', auth_1.authenticateToken, (0, auth_1.requireRole)(['profesor']), profesorController_1.eliminarMiAlumno);
// Estadísticas del profesor
router.get('/estadisticas', auth_1.authenticateToken, (0, auth_1.requireRole)(['profesor']), profesorController_1.obtenerEstadisticasProfesor);
exports.default = router;
