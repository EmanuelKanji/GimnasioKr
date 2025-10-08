"use strict";
// Tests simples para verificar que Jest funciona
describe('Tests básicos', () => {
    test('debe sumar correctamente', () => {
        expect(2 + 2).toBe(4);
    });
    test('debe validar strings', () => {
        expect('hello').toContain('ll');
    });
    test('debe validar arrays', () => {
        const arr = [1, 2, 3];
        expect(arr).toHaveLength(3);
        expect(arr).toContain(2);
    });
    test('debe validar objetos', () => {
        const obj = { name: 'test', value: 123 };
        expect(obj).toHaveProperty('name', 'test');
        expect(obj.value).toBe(123);
    });
});
