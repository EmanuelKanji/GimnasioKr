// Tests para utilidades compartidas
describe('Utilidades', () => {
  describe('Validación de RUT', () => {
    const validarRUT = (rut: string): boolean => {
      if (!/^[0-9]+-[0-9kK]$/.test(rut)) return false;
      
      const [numero, dv] = rut.split('-');
      const dvCalculado = calcularDV(numero);
      
      return dv.toLowerCase() === dvCalculado.toLowerCase();
    };

    const calcularDV = (numero: string): string => {
      let suma = 0;
      let multiplicador = 2;
      
      for (let i = numero.length - 1; i >= 0; i--) {
        suma += parseInt(numero[i]) * multiplicador;
        multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
      }
      
      const resto = suma % 11;
      const dv = 11 - resto;
      
      if (dv === 11) return '0';
      if (dv === 10) return 'k';
      return dv.toString();
    };

    test('debe validar RUT correcto', () => {
      // RUTs de prueba conocidos
      expect(validarRUT('11111111-1')).toBe(true);
      expect(validarRUT('12345678-5')).toBe(true);
    });

    test('debe rechazar RUT incorrecto', () => {
      expect(validarRUT('12345678-0')).toBe(false);
      expect(validarRUT('11111111-2')).toBe(false);
      expect(validarRUT('12345678-1')).toBe(false);
    });

    test('debe rechazar formato inválido', () => {
      expect(validarRUT('12345678')).toBe(false);
      expect(validarRUT('12345678-')).toBe(false);
      expect(validarRUT('-9')).toBe(false);
      expect(validarRUT('abc-def')).toBe(false);
    });
  });

  describe('Formateo de fechas', () => {
    const formatearFecha = (fecha: Date): string => {
      return fecha.toISOString().split('T')[0];
    };

    test('debe formatear fecha correctamente', () => {
      const fecha = new Date('2024-12-31T00:00:00.000Z');
      expect(formatearFecha(fecha)).toBe('2024-12-31');
    });

    test('debe manejar diferentes zonas horarias', () => {
      const fecha = new Date('2024-12-31T23:59:59.999Z');
      expect(formatearFecha(fecha)).toBe('2024-12-31');
    });
  });

  describe('Validación de email', () => {
    const validarEmail = (email: string): boolean => {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return regex.test(email);
    };

    test('debe validar emails correctos', () => {
      expect(validarEmail('test@test.com')).toBe(true);
      expect(validarEmail('user.name@domain.co.uk')).toBe(true);
      expect(validarEmail('user+tag@example.org')).toBe(true);
    });

    test('debe rechazar emails incorrectos', () => {
      expect(validarEmail('test@')).toBe(false);
      expect(validarEmail('@test.com')).toBe(false);
      expect(validarEmail('test.test.com')).toBe(false);
      expect(validarEmail('')).toBe(false);
    });
  });

  describe('Cálculo de límites de clases', () => {
    const calcularClasesDisponibles = (limiteClases: string, clasesUsadas: number): number => {
      if (limiteClases === 'todos_los_dias') return -1; // Ilimitado
      const limite = parseInt(limiteClases);
      return Math.max(0, limite - clasesUsadas);
    };

    test('debe calcular clases disponibles correctamente', () => {
      expect(calcularClasesDisponibles('12', 5)).toBe(7);
      expect(calcularClasesDisponibles('8', 3)).toBe(5);
      expect(calcularClasesDisponibles('12', 12)).toBe(0);
      expect(calcularClasesDisponibles('12', 15)).toBe(0);
    });

    test('debe manejar límite ilimitado', () => {
      expect(calcularClasesDisponibles('todos_los_dias', 100)).toBe(-1);
    });
  });
});
