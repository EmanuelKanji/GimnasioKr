"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = express_1.default.Router();
// Cambiar contraseña del usuario autenticado (cualquier rol)
router.put('/cambiar-password', auth_1.authenticateToken, (0, validation_1.validate)(validation_1.schemas.cambiarPassword), userController_1.cambiarPassword);
exports.default = router;
