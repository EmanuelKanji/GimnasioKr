"use strict";
/**
 * Middleware de sanitización de inputs para prevenir XSS y SQL injection
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeFields = exports.sanitizeBody = exports.sanitizeInputs = void 0;
const validators_1 = require("../utils/validators");
/**
 * Middleware para sanitizar inputs del request
 * Limpia automáticamente todos los strings en req.body, req.query y req.params
 */
const sanitizeInputs = (req, res, next) => {
    try {
        // Sanitizar body
        if (req.body && typeof req.body === 'object') {
            req.body = (0, validators_1.sanitizarObjeto)(req.body);
        }
        // Sanitizar query parameters
        if (req.query && typeof req.query === 'object') {
            req.query = (0, validators_1.sanitizarObjeto)(req.query);
        }
        // Sanitizar params
        if (req.params && typeof req.params === 'object') {
            req.params = (0, validators_1.sanitizarObjeto)(req.params);
        }
        next();
    }
    catch (error) {
        console.error('Error en sanitización de inputs:', error);
        // En caso de error, continuar sin sanitizar para no romper la funcionalidad
        next();
    }
};
exports.sanitizeInputs = sanitizeInputs;
/**
 * Middleware específico para sanitizar solo el body
 * Útil para endpoints que solo necesitan sanitizar el body
 */
const sanitizeBody = (req, res, next) => {
    try {
        if (req.body && typeof req.body === 'object') {
            req.body = (0, validators_1.sanitizarObjeto)(req.body);
        }
        next();
    }
    catch (error) {
        console.error('Error en sanitización del body:', error);
        next();
    }
};
exports.sanitizeBody = sanitizeBody;
/**
 * Middleware para sanitizar solo campos específicos
 * @param fields Array de nombres de campos a sanitizar
 */
const sanitizeFields = (fields) => {
    return (req, res, next) => {
        try {
            if (req.body && typeof req.body === 'object') {
                fields.forEach(field => {
                    if (req.body[field] && typeof req.body[field] === 'string') {
                        req.body[field] = (0, validators_1.sanitizarObjeto)(req.body[field]);
                    }
                });
            }
            next();
        }
        catch (error) {
            console.error('Error en sanitización de campos específicos:', error);
            next();
        }
    };
};
exports.sanitizeFields = sanitizeFields;
