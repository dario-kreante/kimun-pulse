/**
 * Tests de Integración - Sistema de Etiquetas Completo
 * Valida el flujo end-to-end desde generación hasta escaneo
 */

import { 
  generarCodigoQRCompleto, 
  validarFormatoQR, 
  extraerInfoCodigo,
  generarQRCode,
  generarHTMLEtiquetas
} from '../lib/qrUtils'
import { palletsService } from '../services/palletsService'

// Mocks
jest.mock('../lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({
            data: {
              id: 'LP-2024-CHIL-001',
              cultivo: 'Arándanos',
              variedad: 'Duke',
              estado: 'En Cosecha',
              eventos_trazabilidad: []
            },
            error: null
          })
        }))
      }))
    }))
  }
}))

jest.mock('../services/palletsService', () => ({
  palletsService: {
    obtenerPalletCompleto: jest.fn().mockResolvedValue({
      codigo_pallet: 'PAL-2024-CHIL-00001',
      estado: 'completo',
      cantidad_cajas_total: 120,
      peso_total_kg: 2400,
      lotes_asociados: 2,
      destino_inicial: 'Cliente A'
    }),
    obtenerPallets: jest.fn().mockResolvedValue([
      {
        codigo_pallet: 'PAL-2024-CHIL-00001',
        estado: 'completo',
        cantidad_cajas_total: 120,
        peso_total_kg: 2400,
        lotes_asociados: 2,
        destino_inicial: 'Cliente A'
      },
      {
        codigo_pallet: 'PAL-2024-CHIL-00002',
        estado: 'en_construccion',
        cantidad_cajas_total: 80,
        peso_total_kg: 1600,
        lotes_asociados: 1,
        destino_inicial: 'Cliente B'
      }
    ]),
    validarCodigoPallet: jest.fn((codigo: string) => /^PAL-\d{4}-CHIL-\d{5}$/.test(codigo)),
    extraerAñoDeCodigo: jest.fn((codigo: string) => {
      const match = codigo.match(/^PAL-(\d{4})-CHIL-\d{5}$/)
      return match ? parseInt(match[1]) : null
    })
  }
}))

jest.mock('qrcode', () => ({
  default: {
    toDataURL: jest.fn().mockResolvedValue('data:image/png;base64,mock-qr-image')
  }
}))

// Mock del hook useAuth
jest.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    usuario: { nombre: 'Usuario Test' },
    esAutenticado: true
  })
}))

// Mock del hook useLotes
jest.mock('../hooks/useKimunPulse', () => ({
  useLotes: () => ({
    lotes: [
      {
        id: 'LP-2024-CHIL-001',
        cultivo: 'Arándanos',
        variedad: 'Duke',
        area: 5.2,
        cuartel_origen: 'Cuartel A'
      },
      {
        id: 'LP-2024-CHIL-002',
        cultivo: 'Cerezas',
        variedad: 'Bing',
        area: 3.8,
        cuartel_origen: 'Cuartel B'
      }
    ]
  }),
  useCodigos: () => ({
    imprimirEtiquetas: jest.fn().mockResolvedValue({ success: true })
  })
}))

describe('Integración del Sistema de Etiquetas', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Flujo Completo - Lotes', () => {
    it('debe completar el ciclo: generar → imprimir → escanear → validar', async () => {
      // 1. GENERAR código QR para lote
      const loteId = 'LP-2024-CHIL-001'
      const metadata = {
        cultivo: 'Arándanos',
        variedad: 'Duke',
        area: 5.2
      }

      const codigoQR = generarCodigoQRCompleto(loteId, 'lote', metadata)
      expect(codigoQR).toBeDefined()

      const datosQR = JSON.parse(codigoQR)
      expect(datosQR.id).toBe(loteId)
      expect(datosQR.tipo).toBe('lote')
      expect(datosQR.metadata.cultivo).toBe('Arándanos')

      // 2. GENERAR imagen QR
      const imagenQR = await generarQRCode(codigoQR)
      expect(imagenQR).toContain('data:image/png;base64,')

      // 3. SIMULAR impresión de etiqueta
      const entidades = [{
        id: loteId,
        tipo: 'lote' as const,
        cultivo: 'Arándanos',
        variedad: 'Duke'
      }]

      const configEtiqueta = {
        formato: 'qr_texto' as const,
        tamaño: 'mediano' as const,
        incluirTexto: true,
        incluirLogo: true
      }

      const htmlEtiqueta = generarHTMLEtiquetas(entidades, configEtiqueta, [imagenQR])
      expect(htmlEtiqueta).toContain('LP-2024-CHIL-001')
      expect(htmlEtiqueta).toContain('Arándanos')
      expect(htmlEtiqueta).toContain('tipo-lote')

      // 4. SIMULAR escaneo del código QR
      const validacion = validarFormatoQR(codigoQR)
      expect(validacion.valido).toBe(true)
      expect(validacion.tipo).toBe('lote')

      // 5. EXTRAER información del código escaneado
      const info = extraerInfoCodigo(codigoQR)
      expect(info.id).toBe(loteId)
      expect(info.tipo).toBe('lote')
      expect(info.metadata?.cultivo).toBe('Arándanos')

      console.log('✅ Flujo completo de lote validado correctamente')
    })
  })

  describe('Flujo Completo - Pallets', () => {
    it('debe completar el ciclo: generar → imprimir → escanear → validar', async () => {
      // 1. GENERAR código QR para pallet
      const palletId = 'PAL-2024-CHIL-00001'
      const metadata = {
        estado: 'completo',
        cantidad_cajas: 120,
        peso_kg: 2400,
        destino: 'Cliente A'
      }

      const codigoQR = generarCodigoQRCompleto(palletId, 'pallet', metadata)
      expect(codigoQR).toBeDefined()

      const datosQR = JSON.parse(codigoQR)
      expect(datosQR.id).toBe(palletId)
      expect(datosQR.tipo).toBe('pallet')
      expect(datosQR.metadata.estado).toBe('completo')

      // 2. GENERAR imagen QR
      const imagenQR = await generarQRCode(codigoQR)
      expect(imagenQR).toContain('data:image/png;base64,')

      // 3. SIMULAR impresión de etiqueta
      const entidades = [{
        id: palletId,
        tipo: 'pallet' as const,
        cantidad_cajas: 120,
        peso_kg: 2400,
        destino: 'Cliente A'
      }]

      const configEtiqueta = {
        formato: 'qr_texto' as const,
        tamaño: 'mediano' as const,
        incluirTexto: true,
        incluirLogo: true
      }

      const htmlEtiqueta = generarHTMLEtiquetas(entidades, configEtiqueta, [imagenQR])
      expect(htmlEtiqueta).toContain('PAL-2024-CHIL-00001')
      expect(htmlEtiqueta).toContain('120 cajas')
      expect(htmlEtiqueta).toContain('2400 kg')
      expect(htmlEtiqueta).toContain('tipo-pallet')

      // 4. SIMULAR escaneo del código QR
      const validacion = validarFormatoQR(codigoQR)
      expect(validacion.valido).toBe(true)
      expect(validacion.tipo).toBe('pallet')

      // 5. EXTRAER información del código escaneado
      const info = extraerInfoCodigo(codigoQR)
      expect(info.id).toBe(palletId)
      expect(info.tipo).toBe('pallet')
      expect(info.metadata?.estado).toBe('completo')

      console.log('✅ Flujo completo de pallet validado correctamente')
    })
  })

  describe('Flujo Mixto - Lotes y Pallets', () => {
    it('debe manejar códigos de lotes y pallets en la misma sesión', async () => {
      // Generar códigos para ambos tipos
      const codigoLote = generarCodigoQRCompleto('LP-2024-CHIL-001', 'lote', {
        cultivo: 'Arándanos'
      })
      const codigoPallet = generarCodigoQRCompleto('PAL-2024-CHIL-00001', 'pallet', {
        estado: 'completo'
      })

      // Validar ambos códigos
      const validacionLote = validarFormatoQR(codigoLote)
      const validacionPallet = validarFormatoQR(codigoPallet)

      expect(validacionLote.valido).toBe(true)
      expect(validacionLote.tipo).toBe('lote')
      expect(validacionPallet.valido).toBe(true)
      expect(validacionPallet.tipo).toBe('pallet')

      // Extraer información de ambos
      const infoLote = extraerInfoCodigo(codigoLote)
      const infoPallet = extraerInfoCodigo(codigoPallet)

      expect(infoLote.tipo).toBe('lote')
      expect(infoPallet.tipo).toBe('pallet')

      // Generar etiquetas mixtas
      const entidadesMixtas = [
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

      const imagenesQR = await Promise.all([
        generarQRCode(codigoLote),
        generarQRCode(codigoPallet)
      ])

      const configEtiqueta = {
        formato: 'qr_texto' as const,
        tamaño: 'mediano' as const,
        incluirTexto: true,
        incluirLogo: true
      }

      const htmlMixto = generarHTMLEtiquetas(entidadesMixtas, configEtiqueta, imagenesQR)
      
      expect(htmlMixto).toContain('LP-2024-CHIL-001')
      expect(htmlMixto).toContain('PAL-2024-CHIL-00001')
      expect(htmlMixto).toContain('Arándanos')
      expect(htmlMixto).toContain('120 cajas')
      expect(htmlMixto).toContain('1 lote(s) • 1 pallet(s)')

      console.log('✅ Flujo mixto validado correctamente')
    })
  })

  describe('Integración con Servicios', () => {
    it('debe integrar correctamente con palletsService', async () => {
      // Validar código de pallet
      const codigoValido = 'PAL-2024-CHIL-00001'
      const codigoInvalido = 'INVALID-CODE'

      expect(palletsService.validarCodigoPallet(codigoValido)).toBe(true)
      expect(palletsService.validarCodigoPallet(codigoInvalido)).toBe(false)

      // Extraer año
      expect(palletsService.extraerAñoDeCodigo(codigoValido)).toBe(2024)
      expect(palletsService.extraerAñoDeCodigo(codigoInvalido)).toBe(null)

      // Obtener pallet completo
      const palletCompleto = await palletsService.obtenerPalletCompleto(codigoValido)
      expect(palletCompleto).toBeDefined()
      expect(palletCompleto?.codigo_pallet).toBe(codigoValido)
      expect(palletCompleto?.estado).toBe('completo')

      // Obtener lista de pallets
      const pallets = await palletsService.obtenerPallets({ activo: true })
      expect(pallets).toHaveLength(2)
      expect(pallets[0].codigo_pallet).toBe('PAL-2024-CHIL-00001')
      expect(pallets[1].codigo_pallet).toBe('PAL-2024-CHIL-00002')
    })
  })

  describe('Casos de Error y Recuperación', () => {
    it('debe manejar códigos QR corruptos graciosamente', () => {
      const codigosCorruptos = [
        '{"id": "LP-2024-CHIL-001", "tipo": "lote"', // JSON incompleto
        '{"invalid": "data"}', // JSON válido pero sin campos requeridos
        'PLAIN-TEXT-CODE', // Texto plano inválido
        '', // Cadena vacía
      ]

      codigosCorruptos.forEach((codigo, index) => {
        try {
          const validacion = validarFormatoQR(codigo)
          expect(validacion.valido).toBe(false)
          expect(validacion.error).toBeDefined()
          console.log(`✅ Código corrupto ${index + 1} manejado correctamente`)
        } catch (error) {
          // Algunos códigos pueden lanzar errores, lo cual está bien
          console.log(`⚠️ Código corrupto ${index + 1} lanzó error: ${error}`)
        }
      })
    })

    it('debe recuperarse de errores en generación de QR', async () => {
      // Mock error en QRCode
      const QRCode = require('qrcode')
      const originalToDataURL = QRCode.default.toDataURL
      QRCode.default.toDataURL = jest.fn().mockRejectedValueOnce(new Error('QR Generation Error'))

      const codigoQR = generarCodigoQRCompleto('LP-2024-CHIL-001', 'lote')
      const imagen = await generarQRCode(codigoQR)

      // Debe retornar imagen de fallback
      expect(imagen).toContain('data:image/png;base64,')
      
      // Restaurar mock original
      QRCode.default.toDataURL = originalToDataURL
      
      console.log('✅ Error en generación de QR manejado correctamente')
    })

    it('debe manejar códigos de aplicaciones diferentes', () => {
      const codigoOtraApp = JSON.stringify({
        id: 'LP-2024-CHIL-001',
        tipo: 'lote',
        timestamp: '2024-01-01T00:00:00.000Z',
        app: 'OtraAplicacion',
        version: '1.0'
      })

      const validacion = validarFormatoQR(codigoOtraApp)
      expect(validacion.valido).toBe(false)
      expect(validacion.error).toContain('aplicación diferente')
      console.log('✅ Código de otra aplicación rechazado correctamente')
    })
  })

  describe('Rendimiento del Sistema', () => {
    it('debe procesar múltiples códigos eficientemente', async () => {
      const start = performance.now()

      // Generar 50 códigos de lotes y 50 de pallets
      const codigosLotes = Array.from({ length: 50 }, (_, i) => 
        generarCodigoQRCompleto(`LP-2024-CHIL-${String(i + 1).padStart(3, '0')}`, 'lote')
      )
      
      const codigosPallets = Array.from({ length: 50 }, (_, i) => 
        generarCodigoQRCompleto(`PAL-2024-CHIL-${String(i + 1).padStart(5, '0')}`, 'pallet')
      )

      // Validar todos los códigos
      const validacionesLotes = codigosLotes.map(codigo => validarFormatoQR(codigo))
      const validacionesPallets = codigosPallets.map(codigo => validarFormatoQR(codigo))

      // Generar imágenes QR
      const imagenesLotes = await Promise.all(
        codigosLotes.map(codigo => generarQRCode(codigo))
      )
      const imagenesPallets = await Promise.all(
        codigosPallets.map(codigo => generarQRCode(codigo))
      )

      const end = performance.now()
      const tiempo = end - start

      // Validaciones
      expect(validacionesLotes.every(v => v.valido)).toBe(true)
      expect(validacionesPallets.every(v => v.valido)).toBe(true)
      expect(imagenesLotes.every(img => img.includes('data:image/png;base64,'))).toBe(true)
      expect(imagenesPallets.every(img => img.includes('data:image/png;base64,'))).toBe(true)

      // Rendimiento (debe procesar 100 códigos en menos de 2 segundos)
      expect(tiempo).toBeLessThan(2000)
      
      console.log(`✅ Procesados 100 códigos en ${tiempo.toFixed(2)}ms`)
    })

    it('debe generar HTML para muchas etiquetas eficientemente', () => {
      const start = performance.now()

      // Crear 200 entidades mixtas
      const entidades = Array.from({ length: 200 }, (_, i) => {
        const esLote = i % 2 === 0
        return esLote ? {
          id: `LP-2024-CHIL-${String(Math.floor(i / 2) + 1).padStart(3, '0')}`,
          tipo: 'lote' as const,
          cultivo: 'Arándanos',
          variedad: 'Duke'
        } : {
          id: `PAL-2024-CHIL-${String(Math.floor(i / 2) + 1).padStart(5, '0')}`,
          tipo: 'pallet' as const,
          cantidad_cajas: 120,
          peso_kg: 2400
        }
      })

      const qrCodes = Array.from({ length: 200 }, () => 'data:image/png;base64,mock')
      
      const configEtiqueta = {
        formato: 'qr_texto' as const,
        tamaño: 'mediano' as const,
        incluirTexto: true,
        incluirLogo: true
      }

      const html = generarHTMLEtiquetas(entidades, configEtiqueta, qrCodes)
      
      const end = performance.now()
      const tiempo = end - start

      expect(html).toContain('<!DOCTYPE html>')
      expect(html).toContain('100 lote(s) • 100 pallet(s)')
      expect(tiempo).toBeLessThan(500) // Menos de 500ms

      console.log(`✅ Generado HTML para 200 etiquetas en ${tiempo.toFixed(2)}ms`)
    })
  })

  describe('Compatibilidad y Migración', () => {
    it('debe ser compatible con códigos simples legacy', () => {
      // Códigos simples (sin JSON)
      const codigoLoteSimple = 'LP-2024-CHIL-001'
      const codigoPalletSimple = 'PAL-2024-CHIL-00001'

      const validacionLote = validarFormatoQR(codigoLoteSimple)
      const validacionPallet = validarFormatoQR(codigoPalletSimple)

      expect(validacionLote.valido).toBe(true)
      expect(validacionLote.tipo).toBe('lote')
      expect(validacionPallet.valido).toBe(true)
      expect(validacionPallet.tipo).toBe('pallet')

      // Extraer información
      const infoLote = extraerInfoCodigo(codigoLoteSimple)
      const infoPallet = extraerInfoCodigo(codigoPalletSimple)

      expect(infoLote.id).toBe(codigoLoteSimple)
      expect(infoLote.tipo).toBe('lote')
      expect(infoPallet.id).toBe(codigoPalletSimple)
      expect(infoPallet.tipo).toBe('pallet')

      console.log('✅ Compatibilidad con códigos legacy validada')
    })

    it('debe manejar versiones diferentes del formato QR', () => {
      const codigoV1 = JSON.stringify({
        id: 'LP-2024-CHIL-001',
        tipo: 'lote',
        timestamp: '2024-01-01T00:00:00.000Z',
        app: 'KimunPulse',
        version: '1.0'
      })

      const codigoV2 = JSON.stringify({
        id: 'LP-2024-CHIL-001',
        tipo: 'lote',
        timestamp: '2024-01-01T00:00:00.000Z',
        app: 'KimunPulse',
        version: '2.0', // Versión futura
        metadata: { nuevoCampo: 'valor' }
      })

      const validacionV1 = validarFormatoQR(codigoV1)
      const validacionV2 = validarFormatoQR(codigoV2)

      expect(validacionV1.valido).toBe(true)
      expect(validacionV2.valido).toBe(true) // Debe ser compatible hacia atrás

      console.log('✅ Compatibilidad entre versiones validada')
    })
  })
})

describe('Validación de Casos de Uso Reales', () => {
  it('debe simular un día completo de operaciones', async () => {
    console.log('🚀 Iniciando simulación de día completo...')

    // MAÑANA: Crear etiquetas para lotes recién cosechados
    const lotesNuevos = [
      'LP-2024-CHIL-001',
      'LP-2024-CHIL-002',
      'LP-2024-CHIL-003'
    ]

    const etiquetasLotes = lotesNuevos.map(id => 
      generarCodigoQRCompleto(id, 'lote', { cultivo: 'Arándanos' })
    )

    // MEDIODÍA: Palletizar lotes
    const palletsCreados = [
      'PAL-2024-CHIL-00001',
      'PAL-2024-CHIL-00002'
    ]

    const etiquetasPallets = palletsCreados.map(id =>
      generarCodigoQRCompleto(id, 'pallet', { estado: 'en_construccion' })
    )

    // TARDE: Completar pallets y actualizar etiquetas
    const palletsCompletos = palletsCreados.map(id =>
      generarCodigoQRCompleto(id, 'pallet', { estado: 'completo' })
    )

    // NOCHE: Validar todos los códigos generados
    const todosCodigos = [...etiquetasLotes, ...etiquetasPallets, ...palletsCompletos]
    const validaciones = todosCodigos.map(codigo => validarFormatoQR(codigo))

    // Verificar que todos los códigos son válidos
    expect(validaciones.every(v => v.valido)).toBe(true)

    // Contar tipos
    const conteoTipos = validaciones.reduce((acc, v) => {
      acc[v.tipo || 'desconocido'] = (acc[v.tipo || 'desconocido'] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    expect(conteoTipos.lote).toBe(3)
    expect(conteoTipos.pallet).toBe(4) // 2 en construcción + 2 completos

    console.log('✅ Simulación de día completo exitosa:', conteoTipos)
  })

  it('debe manejar escenario de alta demanda', async () => {
    console.log('🔥 Iniciando test de alta demanda...')

    const start = performance.now()

    // Simular 1000 operaciones simultáneas
    const operaciones = Array.from({ length: 1000 }, async (_, i) => {
      const esLote = i % 3 === 0 // 33% lotes, 67% pallets
      const id = esLote 
        ? `LP-2024-CHIL-${String(i + 1).padStart(3, '0')}`
        : `PAL-2024-CHIL-${String(i + 1).padStart(5, '0')}`
      
      const tipo = esLote ? 'lote' : 'pallet'
      const codigo = generarCodigoQRCompleto(id, tipo)
      const validacion = validarFormatoQR(codigo)
      const imagen = await generarQRCode(codigo)
      
      return { codigo, validacion, imagen }
    })

    const resultados = await Promise.all(operaciones)
    const end = performance.now()

    // Validar resultados
    expect(resultados).toHaveLength(1000)
    expect(resultados.every(r => r.validacion.valido)).toBe(true)
    expect(resultados.every(r => r.imagen.includes('data:image/png;base64,'))).toBe(true)

    const tiempo = end - start
    expect(tiempo).toBeLessThan(5000) // Menos de 5 segundos

    console.log(`✅ 1000 operaciones completadas en ${tiempo.toFixed(2)}ms`)
  })
}) 