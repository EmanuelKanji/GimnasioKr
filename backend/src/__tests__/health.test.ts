import request from 'supertest';
import { app } from '../server';
import { connectDB } from '../config/db';

// Mock de la base de datos
jest.mock('../config/db');

describe('Health Checks', () => {
  beforeAll(async () => {
    // Mock de la conexión a la base de datos
    (connectDB as jest.Mock).mockResolvedValue(undefined);
  });

  describe('GET /health', () => {
    test('debe devolver estado saludable', async () => {
      const response = await request(app)
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
      (connectDB as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .get('/ready');

      // En tests, la BD no está realmente conectada, por lo que esperamos 503
      expect(response.status).toBe(503);
      expect(response.body).toHaveProperty('status', 'NOT_READY');
    });

    test('debe devolver estado no listo cuando hay error en BD', async () => {
      // Mock de error en la base de datos
      (connectDB as jest.Mock).mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .get('/ready');

      expect(response.status).toBe(503);
      expect(response.body).toHaveProperty('status', 'NOT_READY');
      expect(response.body).toHaveProperty('reason');
    });
  });
});
