"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const validation_1 = require("../middleware/validation");
const router = express_1.default.Router();
const auth_1 = require("../middleware/auth");
router.post('/', (0, validation_1.validate)(validation_1.schemas.createUser), userController_1.createUser);
// Obtener datos del usuario logueado
router.get('/me', auth_1.authenticateToken, async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: 'No autenticado' });
        res.json(req.user);
    }
    catch {
        res.status(500).json({ error: 'Error al obtener usuario' });
    }
});
exports.default = router;
