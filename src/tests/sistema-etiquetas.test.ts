/**
 * Tests Unitarios - Sistema de Etiquetas y Códigos QR
 * Valida las funciones principales del sistema de códigos
 */

import {
  detectarTipoCodigo,
  validarFormatoQR,
  generarCodigoQRCompleto,
  extraerInfoCodigo,
  generarQRCode,
  generarHTMLEtiquetas
} from '../lib/qrUtils'

// Mock de QRCode
jest.mock('qrcode', () => ({
  default: {
    toDataURL: jest.fn().mockResolvedValue('data:image/png;base64,mock-qr-code')
  }
}))

describe('Sistema de Etiquetas - Tests Unitarios', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('detectarTipoCodigo', () => {
    it('debe detectar códigos de lote correctamente', () => {
      const codigosLote = [
        'LP-2024-CHIL-001',
        'LP-2023-CHIL-999',
        'LP-2025-CHIL-123'
      ]

      codigosLote.forEach(codigo => {
        expect(detectarTipoCodigo(codigo)).toBe('lote')
      })
    })

    it('debe detectar códigos de pallet correctamente', () => {
      const codigosPallet = [
        'PAL-2024-CHIL-00001',
        'PAL-2023-CHIL-99999',
        'PAL-2025-CHIL-12345'
      ]

      codigosPallet.forEach(codigo => {
        expect(detectarTipoCodigo(codigo)).toBe('pallet')
      })
    })

    it('debe rechazar códigos con formato incorrecto', () => {
      const codigosInvalidos = [
        'LP-24-CHIL-001', // Año incompleto
        'PAL-2024-CHIL-1', // Número de pallet muy corto
        'XX-2024-CHIL-001', // Prefijo incorrecto
        'LP-2024-PERU-001', // País incorrecto
        'LP2024CHIL001', // Sin guiones
        '', // Vacío
        'INVALID-CODE'
      ]

      codigosInvalidos.forEach(codigo => {
        expect(detectarTipoCodigo(codigo)).toBe('desconocido')
      })
    })

    it('debe manejar códigos JSON complejos', () => {
      const codigoLoteJSON = JSON.stringify({
        id: 'LP-2024-CHIL-001',
        tipo: 'lote',
        timestamp: '2024-01-01T00:00:00.000Z'
      })

      const codigoPalletJSON = JSON.stringify({
        id: 'PAL-2024-CHIL-00001',
        tipo: 'pallet',
        timestamp: '2024-01-01T00:00:00.000Z'
      })

      expect(detectarTipoCodigo(codigoLoteJSON)).toBe('lote')
      expect(detectarTipoCodigo(codigoPalletJSON)).toBe('pallet')
    })
  })

  describe('validarFormatoQR', () => {
    it('debe validar códigos simples de lote', () => {
      const codigo = 'LP-2024-CHIL-001'
      const resultado = validarFormatoQR(codigo)

      expect(resultado.valido).toBe(true)
      expect(resultado.tipo).toBe('lote')
      expect(resultado.data?.id).toBe(codigo)
      expect(resultado.error).toBeUndefined()
    })

    it('debe validar códigos simples de pallet', () => {
      const codigo = 'PAL-2024-CHIL-00001'
      const resultado = validarFormatoQR(codigo)

      expect(resultado.valido).toBe(true)
      expect(resultado.tipo).toBe('pallet')
      expect(resultado.data?.id).toBe(codigo)
      expect(resultado.error).toBeUndefined()
    })

    it('debe validar códigos JSON complejos', () => {
      const codigoJSON = JSON.stringify({
        id: 'LP-2024-CHIL-001',
        tipo: 'lote',
        timestamp: '2024-01-01T00:00:00.000Z',
        app: 'KimunPulse',
        version: '1.0',
        metadata: {
          cultivo: 'Arándanos',
          variedad: 'Duke'
        }
      })

      const resultado = validarFormatoQR(codigoJSON)

      expect(resultado.valido).toBe(true)
      expect(resultado.tipo).toBe('lote')
      expect(resultado.data?.id).toBe('LP-2024-CHIL-001')
      expect(resultado.data?.metadata?.cultivo).toBe('Arándanos')
    })

    it('debe rechazar códigos con formato inválido', () => {
      const codigosInvalidos = [
        'INVALID-CODE',
        'LP-24-CHIL-001', // Año incompleto
        '{"invalid": "json"}', // JSON sin campos requeridos
        '{"id": "LP-2024-CHIL-001"}', // JSON sin tipo
        '', // Vacío
      ]

      codigosInvalidos.forEach(codigo => {
        const resultado = validarFormatoQR(codigo)
        expect(resultado.valido).toBe(false)
        expect(resultado.error).toBeDefined()
      })
    })

    it('debe rechazar códigos de aplicaciones diferentes', () => {
      const codigoOtraApp = JSON.stringify({
        id: 'LP-2024-CHIL-001',
        tipo: 'lote',
        app: 'OtraAplicacion',
        version: '1.0'
      })

      const resultado = validarFormatoQR(codigoOtraApp)
      expect(resultado.valido).toBe(false)
      expect(resultado.error).toContain('aplicación diferente')
    })

    it('debe manejar JSON malformado', () => {
      const jsonMalformado = '{"id": "LP-2024-CHIL-001", "tipo": "lote"' // Sin cerrar

      const resultado = validarFormatoQR(jsonMalformado)
      expect(resultado.valido).toBe(false)
      expect(resultado.error).toBeDefined()
    })
  })

  describe('generarCodigoQRCompleto', () => {
    it('debe generar código QR para lote con metadata', () => {
      const id = 'LP-2024-CHIL-001'
      const metadata = {
        cultivo: 'Arándanos',
        variedad: 'Duke',
        area: 5.2
      }

      const codigoQR = generarCodigoQRCompleto(id, 'lote', metadata)
      const datos = JSON.parse(codigoQR)

      expect(datos.id).toBe(id)
      expect(datos.tipo).toBe('lote')
      expect(datos.app).toBe('KimunPulse')
      expect(datos.version).toBe('1.0')
      expect(datos.metadata.cultivo).toBe('Arándanos')
      expect(datos.timestamp).toBeDefined()
    })

    it('debe generar código QR para pallet con metadata', () => {
      const id = 'PAL-2024-CHIL-00001'
      const metadata = {
        estado: 'completo',
        cantidad_cajas: 120,
        peso_kg: 2400
      }

      const codigoQR = generarCodigoQRCompleto(id, 'pallet', metadata)
      const datos = JSON.parse(codigoQR)

      expect(datos.id).toBe(id)
      expect(datos.tipo).toBe('pallet')
      expect(datos.metadata.estado).toBe('completo')
      expect(datos.metadata.cantidad_cajas).toBe(120)
    })

    it('debe generar código QR sin metadata', () => {
      const id = 'LP-2024-CHIL-001'
      const codigoQR = generarCodigoQRCompleto(id, 'lote')
      const datos = JSON.parse(codigoQR)

      expect(datos.id).toBe(id)
      expect(datos.tipo).toBe('lote')
      expect(datos.metadata).toEqual({})
    })

    it('debe incluir timestamp válido', () => {
      const codigoQR = generarCodigoQRCompleto('LP-2024-CHIL-001', 'lote')
      const datos = JSON.parse(codigoQR)

      const timestamp = new Date(datos.timestamp)
      const ahora = new Date()
      const diferencia = Math.abs(ahora.getTime() - timestamp.getTime())

      // Debe estar dentro de los últimos 1000ms
      expect(diferencia).toBeLessThan(1000)
    })
  })

  describe('extraerInfoCodigo', () => {
    it('debe extraer información de código simple', () => {
      const codigo = 'LP-2024-CHIL-001'
      const info = extraerInfoCodigo(codigo)

      expect(info.id).toBe(codigo)
      expect(info.tipo).toBe('lote')
      expect(info.metadata).toEqual({})
      expect(info.timestamp).toBeDefined()
    })

    it('debe extraer información de código JSON complejo', () => {
      const codigoJSON = JSON.stringify({
        id: 'PAL-2024-CHIL-00001',
        tipo: 'pallet',
        timestamp: '2024-01-01T00:00:00.000Z',
        app: 'KimunPulse',
        version: '1.0',
        metadata: {
          estado: 'completo',
          cantidad_cajas: 120
        }
      })

      const info = extraerInfoCodigo(codigoJSON)

      expect(info.id).toBe('PAL-2024-CHIL-00001')
      expect(info.tipo).toBe('pallet')
      expect(info.metadata?.estado).toBe('completo')
      expect(info.metadata?.cantidad_cajas).toBe(120)
      expect(info.timestamp).toBe('2024-01-01T00:00:00.000Z')
    })

    it('debe manejar códigos inválidos graciosamente', () => {
      const codigosInvalidos = ['INVALID-CODE', '', '{"malformed": json}']

      codigosInvalidos.forEach(codigo => {
        const info = extraerInfoCodigo(codigo)
        expect(info.id).toBe('')
        expect(info.tipo).toBe('desconocido')
        expect(info.metadata).toEqual({})
      })
    })
  })

  describe('generarQRCode', () => {
    it('debe generar imagen QR correctamente', async () => {
      const codigo = 'LP-2024-CHIL-001'
      const imagen = await generarQRCode(codigo)

      expect(imagen).toContain('data:image/png;base64,')
      expect(imagen).toContain('mock-qr-code')
    })

    it('debe manejar errores de generación', async () => {
      // Mock error
      const QRCode = require('qrcode')
      QRCode.default.toDataURL = jest.fn().mockRejectedValueOnce(new Error('QR Error'))

      const codigo = 'LP-2024-CHIL-001'
      const imagen = await generarQRCode(codigo)

      // Debe devolver imagen de fallback
      expect(imagen).toContain('data:image/png;base64,')
    })

    it('debe generar QR para códigos complejos', async () => {
      const codigoComplejo = JSON.stringify({
        id: 'LP-2024-CHIL-001',
        tipo: 'lote',
        metadata: { cultivo: 'Arándanos' }
      })

      const imagen = await generarQRCode(codigoComplejo)
      expect(imagen).toContain('data:image/png;base64,')
    })
  })

  describe('generarHTMLEtiquetas', () => {
    const entidadesEjemplo = [
      {
        id: 'LP-2024-CHIL-001',
        tipo: 'lote' as const,
        cultivo: 'Arándanos',
        variedad: 'Duke'
      },
      {
        id: 'PAL-2024-CHIL-00001',
        tipo: 'pallet' as const,
        cantidad_cajas: 120,
        peso_kg: 2400
      }
    ]

    const qrCodesEjemplo = [
      'data:image/png;base64,mock1',
      'data:image/png;base64,mock2'
    ]

    it('debe generar HTML básico correctamente', () => {
      const config = {
        formato: 'qr_texto' as const,
        tamaño: 'mediano' as const,
        incluirTexto: true,
        incluirLogo: false
      }

      const html = generarHTMLEtiquetas(entidadesEjemplo, config, qrCodesEjemplo)

      expect(html).toContain('<!DOCTYPE html>')
      expect(html).toContain('LP-2024-CHIL-001')
      expect(html).toContain('PAL-2024-CHIL-00001')
      expect(html).toContain('Arándanos')
      expect(html).toContain('120 cajas')
      expect(html).toContain('tipo-lote')
      expect(html).toContain('tipo-pallet')
    })

    it('debe incluir logo cuando se especifica', () => {
      const config = {
        formato: 'qr_texto' as const,
        tamaño: 'mediano' as const,
        incluirTexto: true,
        incluirLogo: true
      }

      const html = generarHTMLEtiquetas(entidadesEjemplo, config, qrCodesEjemplo)

      expect(html).toContain('KimunPulse')
      expect(html).toContain('🌱')
    })

    it('debe manejar diferentes tamaños', () => {
      const tamaños = ['pequeño', 'mediano', 'grande'] as const

      tamaños.forEach(tamaño => {
        const config = {
          formato: 'qr_texto' as const,
          tamaño,
          incluirTexto: true,
          incluirLogo: false
        }

        const html = generarHTMLEtiquetas(entidadesEjemplo, config, qrCodesEjemplo)
        expect(html).toContain(`tamaño-${tamaño}`)
      })
    })

    it('debe manejar formato QR con JSON', () => {
      const config = {
        formato: 'qr_json' as const,
        tamaño: 'mediano' as const,
        incluirTexto: false,
        incluirLogo: false
      }

      const html = generarHTMLEtiquetas(entidadesEjemplo, config, qrCodesEjemplo)

      expect(html).toContain('data:image/png;base64,mock1')
      expect(html).toContain('LP-2024-CHIL-001')
    })

    it('debe generar resumen correcto', () => {
      const html = generarHTMLEtiquetas(entidadesEjemplo, {
        formato: 'qr_texto' as const,
        tamaño: 'mediano' as const,
        incluirTexto: true,
        incluirLogo: false
      }, qrCodesEjemplo)

      expect(html).toContain('1 lote(s) • 1 pallet(s)')
    })

    it('debe manejar listas vacías', () => {
      const html = generarHTMLEtiquetas([], {
        formato: 'qr_texto' as const,
        tamaño: 'mediano' as const,
        incluirTexto: true,
        incluirLogo: false
      }, [])

      expect(html).toContain('<!DOCTYPE html>')
      expect(html).toContain('0 lote(s) • 0 pallet(s)')
    })

    it('debe incluir estilos CSS correctos', () => {
      const html = generarHTMLEtiquetas(entidadesEjemplo, {
        formato: 'qr_texto' as const,
        tamaño: 'mediano' as const,
        incluirTexto: true,
        incluirLogo: false
      }, qrCodesEjemplo)

      expect(html).toContain('<style>')
      expect(html).toContain('.etiqueta')
      expect(html).toContain('.qr-code')
      expect(html).toContain('@media print')
    })
  })

  describe('Casos Edge y Rendimiento', () => {
    it('debe manejar códigos muy largos', () => {
      const codigoLargo = 'A'.repeat(1000)
      const tipo = detectarTipoCodigo(codigoLargo)
      expect(tipo).toBe('desconocido')
    })

    it('debe procesar múltiples códigos eficientemente', () => {
      const start = performance.now()

      const codigos = Array.from({ length: 100 }, (_, i) => 
        `LP-2024-CHIL-${String(i + 1).padStart(3, '0')}`
      )

      const resultados = codigos.map(codigo => {
        const tipo = detectarTipoCodigo(codigo)
        const validacion = validarFormatoQR(codigo)
        return { codigo, tipo, validacion }
      })

      const end = performance.now()
      const tiempo = end - start

      expect(resultados).toHaveLength(100)
      expect(resultados.every(r => r.tipo === 'lote')).toBe(true)
      expect(resultados.every(r => r.validacion.valido)).toBe(true)
      expect(tiempo).toBeLessThan(100) // Menos de 100ms

      console.log(`✅ Procesados 100 códigos en ${tiempo.toFixed(2)}ms`)
    })

    it('debe manejar caracteres especiales', () => {
      const codigosEspeciales = [
        'LP-2024-CHIL-001\n', // Con salto de línea
        ' LP-2024-CHIL-001 ', // Con espacios
        'LP-2024-CHIL-001\t', // Con tab
        'LP-2024-CHIL-001\r\n' // Con CRLF
      ]

      codigosEspeciales.forEach(codigo => {
        const tipo = detectarTipoCodigo(codigo.trim())
        expect(tipo).toBe('lote')
      })
    })

    it('debe ser case-sensitive para prefijos', () => {
      const codigosCaseSensitive = [
        'lp-2024-chil-001', // Minúsculas
        'Lp-2024-Chil-001', // Mixto
        'LP-2024-chil-001', // CHIL en minúsculas
      ]

      codigosCaseSensitive.forEach(codigo => {
        const tipo = detectarTipoCodigo(codigo)
        expect(tipo).toBe('desconocido')
      })
    })
  })
}) 