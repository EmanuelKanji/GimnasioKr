const request = require('supertest');
const app = require('../server');

describe('Authentication', () => {
  test('POST /api/auth/login should validate required fields', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({})
      .expect(400);
    
    expect(response.body).toHaveProperty('error');
    expect(response.body).toHaveProperty('details');
  });

  test('POST /api/auth/login should validate email format', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'invalid-email',
        password: 'password123'
      })
      .expect(400);
    
    expect(response.body).toHaveProperty('error');
    expect(response.body.details).toContain('email');
  });

  test('POST /api/auth/login should validate password length', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'test@example.com',
        password: '123'
      })
      .expect(400);
    
    expect(response.body).toHaveProperty('error');
    expect(response.body.details).toContain('6 caracteres');
  });

  test('POST /api/auth/login with non-existent user should return 401', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'nonexistent@example.com',
        password: 'password123'
      })
      .expect(401);
    
    expect(response.body).toHaveProperty('error', 'Credenciales inválidas');
  });
});
