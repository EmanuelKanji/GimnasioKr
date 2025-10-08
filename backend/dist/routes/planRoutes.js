"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const planController_1 = require("../controllers/planController");
const validation_1 = require("../middleware/validation");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Todas las rutas requieren autenticación
router.use(auth_1.authenticateToken);
// Solo admin puede gestionar planes
router.get('/', (0, auth_1.requireRole)(['admin']), planController_1.obtenerPlanes);
router.post('/', (0, auth_1.requireRole)(['admin']), (0, validation_1.validate)(validation_1.schemas.createPlan), planController_1.crearPlan);
router.delete('/:id', (0, auth_1.requireRole)(['admin']), planController_1.eliminarPlan);
exports.default = router;
