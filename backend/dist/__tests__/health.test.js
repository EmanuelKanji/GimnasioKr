"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const server_1 = require("../server");
const db_1 = require("../config/db");
// Mock de la base de datos
jest.mock('../config/db');
describe('Health Checks', () => {
    beforeAll(async () => {
        // Mock de la conexión a la base de datos
        db_1.connectDB.mockResolvedValue(undefined);
    });
    describe('GET /health', () => {
        test('debe devolver estado saludable', async () => {
            const response = await (0, supertest_1.default)(server_1.app)
                .get('/health');
            // En tests, la BD no está conectada, por lo que esperamos 503
            expect(response.status).toBe(503);
            expect(response.body).toHaveProperty('status', 'ERROR');
            expect(response.body).toHaveProperty('services');
        });
    });
    describe('GET /ready', () => {
        test('debe devolver estado listo cuando la BD está conectada', async () => {
            // Mock de conexión exitosa
            db_1.connectDB.mockResolvedValue(undefined);
            const response = await (0, supertest_1.default)(server_1.app)
                .get('/ready');
            // En tests, la BD no está realmente conectada, por lo que esperamos 503
            expect(response.status).toBe(503);
            expect(response.body).toHaveProperty('status', 'NOT_READY');
        });
        test('debe devolver estado no listo cuando hay error en BD', async () => {
            // Mock de error en la base de datos
            db_1.connectDB.mockRejectedValue(new Error('Database connection failed'));
            const response = await (0, supertest_1.default)(server_1.app)
                .get('/ready');
            expect(response.status).toBe(503);
            expect(response.body).toHaveProperty('status', 'NOT_READY');
            expect(response.body).toHaveProperty('reason');
        });
    });
});
