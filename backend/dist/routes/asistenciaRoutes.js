"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const asistenciaController_1 = require("../controllers/asistenciaController");
const router = (0, express_1.Router)();
router.post('/', asistenciaController_1.registrarAsistencia);
router.get('/', asistenciaController_1.obtenerHistorialAsistencia);
exports.default = router;
