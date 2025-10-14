/**
 * Script para ejecutar tests del QR y generar informe
 * Simula el QRService y ejecuta todos los casos de prueba
 */

// Simular el QRService exactamente como está en el código
class QRService {
    static processQR(qrData) {
        if (!qrData || qrData === 'undefined') {
            return {
                rut: '',
                qrData: null,
                isValid: false,
                type: 'unknown',
                originalData: qrData
            };
        }

        try {
            const datosQR = JSON.parse(qrData);
            
            if (datosQR.rut && datosQR.timestamp) {
                return {
                    rut: datosQR.rut,
                    qrData: qrData,
                    isValid: true,
                    type: 'new',
                    originalData: qrData
                };
            }
        } catch {
            const rutMatch = qrData.match(/(\d{1,2}\.??\d{3}\.??\d{3}-?[\dkK])/);
            if (rutMatch) {
                const rutLimpio = rutMatch[1].replace(/\.|-/g, '');
                return {
                    rut: rutLimpio,
                    qrData: null,
                    isValid: true,
                    type: 'legacy',
                    originalData: qrData
                };
            }
        }

        return {
            rut: '',
            qrData: null,
            isValid: false,
            type: 'unknown',
            originalData: qrData
        };
    }

    static processAndLogQR(qrData, type = 'detected') {
        const result = this.processQR(qrData);
        
        if (result.isValid) {
            if (result.type === 'new' && result.qrData) {
                try {
                    const parsedQR = JSON.parse(result.qrData);
                    this.logQR(parsedQR, type);
                } catch {
                    console.log(`📱 QR ${type === 'scanned' ? 'escaneado' : 'detectado'}:`, {
                        rut: result.rut,
                        type: result.type
                    });
                }
            } else if (result.type === 'legacy') {
                console.log('📱 QR formato legacy detectado (solo RUT):', result.rut);
            }
        } else {
            console.log('📱 QR formato desconocido:', qrData);
        }

        return result;
    }

    static logQR(qrData, type) {
        const prefix = type === 'scanned' ? '📱 QR nuevo formato escaneado' : '📱 QR nuevo formato detectado';
        
        console.log(prefix, {
            rut: qrData.rut,
            plan: qrData.plan,
            generado: new Date(qrData.timestamp).toISOString(),
            expira: new Date(qrData.expiraEn).toISOString()
        });
    }
}

// Casos de prueba
const testCases = [
    {
        name: "QR Nuevo Formato Válido (ISO)",
        input: JSON.stringify({
            rut: '1234567899',
            plan: 'PM 3X',
            validoDesde: '2025-10-13T00:00:00.000Z',
            validoHasta: '2025-11-13T00:00:00.000Z',
            timestamp: Date.now(),
            expiraEn: Date.now() + (10 * 60 * 1000),
            token: 'test123',
            version: '2.0'
        }),
        expectedValid: true,
        expectedType: 'new'
    },
    {
        name: "QR con Fechas en Formato Local (PROBLEMA)",
        input: JSON.stringify({
            rut: '1234567899',
            plan: 'PM 3X',
            validoDesde: '13-10-2025, 9:20:40 a. m.',
            validoHasta: '13-11-2025, 9:25:40 a. m.',
            timestamp: Date.now(),
            expiraEn: Date.now() + (10 * 60 * 1000),
            token: 'test123',
            version: '2.0'
        }),
        expectedValid: true,
        expectedType: 'new'
    },
    {
        name: "QR Legacy (Solo RUT)",
        input: '1234567899',
        expectedValid: true,
        expectedType: 'legacy'
    },
    {
        name: "RUT con Formato",
        input: '12.345.678-9',
        expectedValid: true,
        expectedType: 'legacy'
    },
    {
        name: "QR Inválido (JSON sin campos requeridos)",
        input: JSON.stringify({
            plan: 'PM 3X',
            timestamp: Date.now()
        }),
        expectedValid: false,
        expectedType: 'unknown'
    },
    {
        name: "QR Inválido (Texto aleatorio)",
        input: 'texto aleatorio sin sentido',
        expectedValid: false,
        expectedType: 'unknown'
    },
    {
        name: "QR Vacío",
        input: '',
        expectedValid: false,
        expectedType: 'unknown'
    },
    {
        name: "QR Undefined",
        input: 'undefined',
        expectedValid: false,
        expectedType: 'unknown'
    }
];

// Función para ejecutar tests
function runTests() {
    console.log('🧪 INICIANDO TESTS DEL QRSERVICE');
    console.log('='.repeat(50));
    
    let passed = 0;
    let failed = 0;
    const results = [];
    
    testCases.forEach((testCase, index) => {
        console.log(`\n--- Test ${index + 1}: ${testCase.name} ---`);
        console.log('Input:', testCase.input);
        
        const result = QRService.processQR(testCase.input);
        
        console.log('Resultado:', result);
        
        const isValid = result.isValid === testCase.expectedValid;
        const typeCorrect = result.type === testCase.expectedType;
        
        const testResult = {
            name: testCase.name,
            input: testCase.input,
            expected: { valid: testCase.expectedValid, type: testCase.expectedType },
            actual: { valid: result.isValid, type: result.type },
            passed: isValid && typeCorrect,
            result: result
        };
        
        results.push(testResult);
        
        if (isValid && typeCorrect) {
            console.log('✅ PASS');
            passed++;
        } else {
            console.log('❌ FAIL');
            console.log(`  Esperado: valid=${testCase.expectedValid}, type=${testCase.expectedType}`);
            console.log(`  Obtenido: valid=${result.isValid}, type=${result.type}`);
            failed++;
        }
    });
    
    console.log('\n' + '='.repeat(50));
    console.log(`📊 RESUMEN DE RESULTADOS:`);
    console.log(`✅ Tests pasados: ${passed}`);
    console.log(`❌ Tests fallidos: ${failed}`);
    console.log(`📈 Porcentaje de éxito: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
    
    return { passed, failed, results };
}

// Función para generar informe detallado
function generateReport(testResults) {
    console.log('\n' + '='.repeat(50));
    console.log('📋 INFORME DETALLADO');
    console.log('='.repeat(50));
    
    const { passed, failed, results } = testResults;
    
    console.log('\n🎯 TESTS EXITOSOS:');
    results.filter(r => r.passed).forEach(r => {
        console.log(`✅ ${r.name}`);
    });
    
    console.log('\n❌ TESTS FALLIDOS:');
    results.filter(r => !r.passed).forEach(r => {
        console.log(`❌ ${r.name}`);
        console.log(`   Esperado: valid=${r.expected.valid}, type=${r.expected.type}`);
        console.log(`   Obtenido: valid=${r.actual.valid}, type=${r.actual.type}`);
    });
    
    console.log('\n🔍 ANÁLISIS DEL PROBLEMA:');
    
    // Buscar el test problemático
    const problemTest = results.find(r => 
        r.name.includes('Formato Local') && !r.passed
    );
    
    if (problemTest) {
        console.log('🚨 PROBLEMA IDENTIFICADO:');
        console.log('   El QR con fechas en formato local está fallando');
        console.log('   Esto explica por qué el usuario ve "QR inválido"');
        console.log('   El QRService está rechazando QRs con fechas locales');
    } else {
        console.log('✅ No se encontraron problemas con fechas locales');
    }
    
    console.log('\n💡 RECOMENDACIONES:');
    if (failed > 0) {
        console.log('1. Revisar la lógica de validación en QRService.processQR()');
        console.log('2. Verificar que las fechas se procesen correctamente');
        console.log('3. Asegurar que el formato de fechas sea consistente');
    } else {
        console.log('1. El QRService funciona correctamente');
        console.log('2. El problema puede estar en otra parte del flujo');
        console.log('3. Revisar la integración con el backend');
    }
}

// Ejecutar tests y generar informe
const testResults = runTests();
generateReport(testResults);

// Exportar resultados para análisis
module.exports = { testResults, QRService };
