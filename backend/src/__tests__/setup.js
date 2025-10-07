// Configuración global para tests
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret_key_for_testing_only';
process.env.MONGODB_URI = 'mongodb://localhost:27017/gimnasio_test';

// Configurar timeout global
jest.setTimeout(10000);
