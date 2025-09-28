"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const planController_1 = require("../controllers/planController");
const router = (0, express_1.Router)();
router.get('/', planController_1.obtenerPlanes);
router.post('/', planController_1.crearPlan);
router.delete('/:id', planController_1.eliminarPlan);
exports.default = router;
