"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const adminController_1 = require("../controllers/adminController");
const alumnoController_1 = require("../controllers/alumnoController");
const profesorController_1 = require("../controllers/profesorController");
const authController_1 = require("../controllers/authController");
const validation_1 = require("../middleware/validation");
const router = express_1.default.Router();
// Ruta unificada para login (recomendada)
router.post('/login', (0, validation_1.validate)(validation_1.schemas.login), authController_1.loginUser);
// Rutas específicas por rol (mantener compatibilidad)
router.post('/login/admin', adminController_1.loginAdmin);
router.post('/login/alumno', alumnoController_1.loginAlumno);
router.post('/login/profesor', profesorController_1.loginProfesor);
exports.default = router;
