"use strict";
// Configuración global para tests
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-for-testing-only';
process.env.MONGODB_URI = 'mongodb://localhost:27017/gimnasio-test';
process.env.JWT_EXPIRES_IN = '1h';
process.env.PORT = '3001';
// Configurar timeout global
jest.setTimeout(10000);
// Mock de console para tests más limpios
const originalConsole = console;
global.console = {
    ...originalConsole,
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
};
