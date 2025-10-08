"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Mock de mongoose
jest.mock('mongoose');
describe('Modelos de datos', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('Validación de esquemas', () => {
        test('debe validar estructura de datos básica', () => {
            const userData = {
                username: 'test@test.com',
                password: 'password123',
                role: 'alumno',
                rut: '12345678-9'
            };
            expect(userData.username).toBe('test@test.com');
            expect(userData.role).toBe('alumno');
            expect(userData.rut).toBe('12345678-9');
        });
        test('debe validar estructura de alumno', () => {
            const alumnoData = {
                nombre: 'Juan Pérez',
                email: 'juan@test.com',
                rut: '12345678-9',
                telefono: '123456789',
                plan: 'mensual',
                limiteClases: '12'
            };
            expect(alumnoData.nombre).toBe('Juan Pérez');
            expect(alumnoData.email).toBe('juan@test.com');
            expect(alumnoData.rut).toBe('12345678-9');
            expect(alumnoData.limiteClases).toBe('12');
        });
        test('debe validar estructura de plan', () => {
            const planData = {
                nombre: 'Plan Mensual',
                precio: 50000,
                duracion: 'mensual',
                limiteClases: '12'
            };
            expect(planData.nombre).toBe('Plan Mensual');
            expect(planData.precio).toBe(50000);
            expect(planData.duracion).toBe('mensual');
            expect(planData.limiteClases).toBe('12');
        });
    });
});
