"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const profesorController_1 = require("../controllers/profesorController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Obtener perfil del profesor
router.get('/me', auth_1.authenticateToken, (0, auth_1.requireRole)(['profesor']), profesorController_1.obtenerPerfilProfesor);
// Actualizar perfil del profesor
router.post('/me', auth_1.authenticateToken, (0, auth_1.requireRole)(['profesor']), profesorController_1.actualizarPerfilProfesor);
exports.default = router;
