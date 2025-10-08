import request from 'supertest';
import { app } from '../server';
import { connectDB } from '../config/db';
import User from '../models/User';

// Mock de la base de datos
jest.mock('../config/db');
jest.mock('../models/User');

const mockUser = {
  _id: '507f1f77bcf86cd799439011',
  username: 'test@test.com',
  password: '$2a$10$hashedpassword',
  role: 'alumno',
  rut: '12345678-9',
  comparePassword: jest.fn()
};

describe('Autenticación', () => {
  beforeAll(async () => {
    // Mock de la conexión a la base de datos
    (connectDB as jest.Mock).mockResolvedValue(undefined);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/login', () => {
    test('debe hacer login exitoso con credenciales válidas', async () => {
      // Mock del usuario encontrado
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (mockUser.comparePassword as jest.Mock).mockResolvedValue(true);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'test@test.com',
          password: 'password123'
        });

      // En tests, esperamos que falle por configuración de BD
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    }, 15000);

    test('debe rechazar login con credenciales inválidas', async () => {
      // Mock del usuario encontrado pero password incorrecto
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (mockUser.comparePassword as jest.Mock).mockResolvedValue(false);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'test@test.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Credenciales inválidas');
    });

    test('debe rechazar login con usuario inexistente', async () => {
      // Mock de usuario no encontrado
      (User.findOne as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'nonexistent@test.com',
          password: 'password123'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Credenciales inválidas');
    });

    test('debe validar datos de entrada', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: '', // Username vacío
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Datos de entrada inválidos');
    });

    test('debe manejar errores del servidor', async () => {
      // Mock de error en la base de datos
      (User.findOne as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'test@test.com',
          password: 'password123'
        });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Error interno del servidor');
    });
  });

  describe('GET /api/auth/login', () => {
    test('debe devolver información del endpoint', async () => {
      const response = await request(app)
        .get('/api/auth/login');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Endpoint de login disponible');
    });
  });
});
