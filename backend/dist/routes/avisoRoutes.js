"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const avisoController_1 = require("../controllers/avisoController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Crear aviso (profesor y admin)
router.post('/', auth_1.authenticateToken, (0, auth_1.requireRole)(['profesor', 'admin']), avisoController_1.crearAviso);
// Obtener avisos enviados por el profesor (profesor y admin)
router.get('/profesor', auth_1.authenticateToken, (0, auth_1.requireRole)(['profesor', 'admin']), avisoController_1.obtenerAvisosProfesor);
// Obtener avisos para el alumno
router.get('/alumno', auth_1.authenticateToken, (0, auth_1.requireRole)(['alumno']), avisoController_1.obtenerAvisosAlumno);
// Verificar planes próximos a vencer (solo admin)
router.post('/verificar-planes', auth_1.authenticateToken, (0, auth_1.requireRole)(['admin']), avisoController_1.verificarPlanesVencimiento);
exports.default = router;
