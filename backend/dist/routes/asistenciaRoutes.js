"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const asistenciaController_1 = require("../controllers/asistenciaController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Todas las rutas requieren autenticación
router.use(auth_1.authenticateToken);
// Registrar asistencia (solo admin y profesor)
router.post('/', (0, auth_1.requireRole)(['admin', 'profesor']), asistenciaController_1.registrarAsistencia);
// Obtener historial de asistencia (solo admin)
router.get('/', (0, auth_1.requireRole)(['admin']), asistenciaController_1.obtenerHistorialAsistencia);
// Diagnosticar QR (solo admin)
router.post('/diagnosticar-qr', (0, auth_1.requireRole)(['admin']), asistenciaController_1.diagnosticarQR);
exports.default = router;
