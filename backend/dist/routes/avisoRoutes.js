"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const avisoController_1 = require("../controllers/avisoController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Crear aviso (solo profesor)
router.post('/', auth_1.authenticateToken, (0, auth_1.requireRole)(['profesor']), avisoController_1.crearAviso);
// Obtener avisos enviados por el profesor
router.get('/profesor', auth_1.authenticateToken, (0, auth_1.requireRole)(['profesor']), avisoController_1.obtenerAvisosProfesor);
// Obtener avisos para el alumno
router.get('/alumno', auth_1.authenticateToken, (0, auth_1.requireRole)(['alumno']), avisoController_1.obtenerAvisosAlumno);
exports.default = router;
