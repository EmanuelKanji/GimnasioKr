const request = require('supertest');
const app = require('../server');

describe('Health Checks', () => {
  test('GET /health should return 200', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);
    
    expect(response.body).toHaveProperty('status');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('uptime');
    expect(response.body).toHaveProperty('environment');
  });

  test('GET /ready should return 200 when DB is connected', async () => {
    const response = await request(app)
      .get('/ready')
      .expect(200);
    
    expect(response.body).toHaveProperty('status', 'READY');
  });

  test('GET / should return API info', async () => {
    const response = await request(app)
      .get('/')
      .expect(200);
    
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('version');
    expect(response.body).toHaveProperty('environment');
  });
});
