import QRCode from 'qrcode'

export interface QRData {
  id: string // lote_id o codigo_pallet
  tipo: 'lote' | 'pallet'
  timestamp: string
  app: string
  version: string
  metadata?: Record<string, any>
}

export interface EtiquetaConfig {
  formato: 'qr_texto' | 'qr_json' | 'codigo_barras'
  tamaño: 'pequeño' | 'mediano' | 'grande'
  incluirLogo: boolean
  incluirTexto: boolean
}

export interface ResultadoValidacion {
  valido: boolean
  tipo?: 'lote' | 'pallet'
  data?: QRData
  error?: string
}

/**
 * Detecta automáticamente el tipo de código (lote o pallet)
 */
export function detectarTipoCodigo(codigo: string): 'lote' | 'pallet' | 'desconocido' {
  // Patrones para códigos válidos
  const patronLote = /^LP-\d{4}-CHIL-\d{3}$/
  const patronPallet = /^PAL-\d{4}-CHIL-\d{5}$/
  
  if (patronLote.test(codigo)) return 'lote'
  if (patronPallet.test(codigo)) return 'pallet'
  return 'desconocido'
}

/**
 * Valida específicamente el formato de códigos de lote
 */
export function validarFormatoLote(codigo: string): boolean {
  const pattern = /^LP-\d{4}-CHIL-\d{3}$/
  return pattern.test(codigo)
}

/**
 * Valida específicamente el formato de códigos de pallet
 */
export function validarFormatoPallet(codigo: string): boolean {
  const pattern = /^PAL-\d{4}-CHIL-\d{5}$/
  return pattern.test(codigo)
}

/**
 * Valida el formato de un código QR (lote o pallet)
 */
export function validarFormatoQR(codigo: string): ResultadoValidacion {
  try {
    // Intentar parsear como JSON
    const data = JSON.parse(codigo)
    
    // Validar campos requeridos
    if (!data.id || !data.tipo || !data.app || !data.timestamp) {
      return { 
        valido: false, 
        error: 'Código QR incompleto - faltan campos requeridos' 
      }
    }
    
    // Validar tipo
    if (!['lote', 'pallet'].includes(data.tipo)) {
      return { 
        valido: false, 
        error: 'Tipo de código inválido - debe ser "lote" o "pallet"' 
      }
    }
    
    // Validar formato según tipo
    const esValido = data.tipo === 'lote' 
      ? validarFormatoLote(data.id)
      : validarFormatoPallet(data.id)
    
    if (!esValido) {
      const formatoEsperado = data.tipo === 'lote' 
        ? 'LP-YYYY-CHIL-NNN' 
        : 'PAL-YYYY-CHIL-NNNNN'
      return { 
        valido: false, 
        error: `Formato de ID de ${data.tipo} inválido - debe ser ${formatoEsperado}` 
      }
    }
    
    // Validar que sea de nuestra app
    if (data.app !== 'KimunPulse') {
      return { 
        valido: false, 
        error: 'Código QR de aplicación diferente' 
      }
    }
    
    return { valido: true, tipo: data.tipo, data }
    
  } catch (error) {
    // Si no es JSON, podría ser un código simple
    const tipo = detectarTipoCodigo(codigo.trim())
    
    if (tipo !== 'desconocido') {
      return { 
        valido: true, 
        tipo,
        data: {
          id: codigo.trim(),
          tipo,
          timestamp: new Date().toISOString(),
          app: 'KimunPulse',
          version: '1.0'
        }
      }
    }
    
    return { 
      valido: false, 
      error: 'Formato de código inválido - debe ser LP-YYYY-CHIL-NNN o PAL-YYYY-CHIL-NNNNN' 
    }
  }
}

/**
 * Genera los datos estructurados para un código QR
 */
export function generarDatosQR(id: string, tipo: 'lote' | 'pallet', metadata?: Record<string, any>): QRData {
  return {
    id,
    tipo,
    timestamp: new Date().toISOString(),
    app: 'KimunPulse',
    version: '1.0',
    metadata: metadata || {}
  }
}

/**
 * Genera un código QR completo en formato JSON
 */
export function generarCodigoQRCompleto(id: string, tipo: 'lote' | 'pallet', metadata?: Record<string, any>): string {
  const datos = generarDatosQR(id, tipo, metadata)
  return JSON.stringify(datos)
}

/**
 * Genera un código QR usando una librería externa
 */
export async function generarQRCode(data: string): Promise<string> {
  try {
    // Usar QRCode.js para generar imagen
    const QRCode = (await import('qrcode')).default
    const qrCodeDataURL = await QRCode.toDataURL(data, {
      errorCorrectionLevel: 'M',
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 256
    })
    return qrCodeDataURL
  } catch (error) {
    console.error('Error generando QR code:', error)
    // Fallback: retornar data URI vacío
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
  }
}

/**
 * Genera los estilos CSS para las etiquetas con aspect-ratio 1:1.65
 */
const generarEstilosEtiqueta = (config: EtiquetaConfig): string => {
  // Dimensiones base según tamaño
  const dimensiones = {
    pequeño: { ancho: 340 },
    mediano: { ancho: 375 },
    grande: { ancho: 414 }
  }
  
  const dim = dimensiones[config.tamaño]

  return `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
      
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background: #f3f4f6; /* Gris claro para el fondo del body */
        padding: 20px;
        display: flex;
        flex-wrap: wrap;
        gap: 20px;
        justify-content: center;
      }
      
      .etiqueta {
        width: ${dim.ancho}px;
        background: white;
        border-radius: 24px;
        box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.07);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        border: 1px solid #e5e7eb;
        position: relative;
      }
      
      /* -- SECCIONES PRINCIPALES -- */
      .header {
        padding: 16px 24px;
        border-bottom: 1px solid #f3f4f6;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: #f8fafc;
      }

      .main-info {
        padding: 24px 24px 20px 24px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        text-align: center;
      }
      
      .details-section {
        padding: 20px 24px;
      }

      .divider {
        margin: 0 24px;
        border-top: 2px dashed #e5e7eb;
      }

      .qr-section {
        padding: 24px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 8px;
      }

      .footer {
        padding: 8px 24px;
        font-size: 10px;
        color: #9ca3af;
        text-align: center;
        background: #f8fafc;
        border-top: 1px solid #f3f4f6;
      }
      
      /* -- COMPONENTES DE TEXTO -- */
      .brand-name {
        font-size: 14px;
        font-weight: 600;
        color: #111827;
      }

      .entity-type {
        font-size: 10px;
        font-weight: bold;
        color: #4b5563;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      
      .entity-id {
        font-size: 13px;
        font-weight: 500;
        color: #4b5563;
        font-family: 'SF Mono', 'Courier New', monospace;
        text-align: right;
      }
      
      .main-info-block h2 {
        font-size: 28px;
        font-weight: 700;
        color: #111827;
        line-height: 1.1;
      }

      .main-info-block p {
        font-size: 11px;
        color: #6b7280;
        margin-top: 4px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .info-separator {
        font-size: 20px;
        color: #d1d5db;
        font-weight: 600;
        align-self: center;
      }
      
      .details-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px 20px;
      }
      
      .detail-item {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .detail-item .icon {
        font-size: 18px;
        color: #9ca3af;
      }

      .detail-item .label {
        font-size: 11px;
        color: #6b7280;
        text-transform: uppercase;
        letter-spacing: 0.3px;
        margin-bottom: 2px;
      }

      .detail-item .value {
        font-size: 14px;
        font-weight: 600;
        color: #1f2937;
      }

      .qr-code {
        width: 65%;
        max-width: 220px;
        aspect-ratio: 1;
        border-radius: 12px;
      }

      /* Colores de estado */
      .estado {
        font-weight: 600;
        display: inline-block;
        padding: 4px 10px;
        border-radius: 99px;
        font-size: 12px;
      }
      
      .estado-cosecha-completa, .estado-cosecha {
        background-color: #dcfce7; color: #166534;
      }
      .estado-empacado {
        background-color: #cffafe; color: #0e7490;
      }
      .estado-paletizado {
        background-color: #ffedd5; color: #9a3412;
      }
      .estado-enfriado {
        background-color: #ede9fe; color: #5b21b6;
      }
      .estado-despachado {
        background-color: #fee2e2; color: #991b1b;
      }
      
      @media print {
        body { 
          background: white; padding: 0; 
        }
        .etiqueta { 
          box-shadow: none; border: 1px solid #ccc;
          page-break-inside: avoid; margin-bottom: 20px;
        }
      }
    </style>
  `
}

/**
 * Genera el layout HTML para una etiqueta individual
 */
const generarLayoutEtiqueta = (
  entidad: any,
  config: EtiquetaConfig,
  qrDataURL: string
): string => {
  const esPallet = entidad.tipo === 'pallet'
  
  // Mapeo de datos con nuevos campos
  const codigo = esPallet ? entidad.codigo_pallet : entidad.id
  const tipoEntidad = esPallet ? 'Pallet' : 'Lote de Cosecha'
  const cultivo = esPallet ? (entidad.cultivos || 'N/A') : (entidad.cultivo || 'N/A')
  const variedad = esPallet ? (entidad.variedades || 'N/A') : (entidad.variedad || 'N/A')
  const estado = entidad.estado || 'N/A'
  
  const fechaCreacion = entidad.fecha_creacion || entidad.fecha_inicio
  const fechaFormateada = fechaCreacion ? new Date(fechaCreacion).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A'
  
  const areaPesoLabel = esPallet ? 'Peso Neto' : 'Área'
  const areaPesoValue = esPallet ? `${entidad.peso_total_kg || 0} kg` : `${entidad.area || 0} ha`
  const areaPesoIcon = esPallet ? '⚖️' : '🏞️'

  const cuartelUbicacionLabel = esPallet ? 'Ubicación Actual' : 'Cuartel'
  const cuartelUbicacionValue = esPallet ? (entidad.ubicacion_actual || 'En bodega') : (entidad.cuartel_origen || 'N/A')
  const cuartelUbicacionIcon = '📍'

  const destinoUbicacionGeoLabel = esPallet ? 'Destino Inicial' : 'Ubicación'
  const destinoUbicacionGeoValue = esPallet ? (entidad.destino_inicial || 'N/A') : (entidad.ubicacion_cuartel || 'N/A')
  const destinoUbicacionGeoIcon = esPallet ? '🏁' : '🌍'

  const tipoResponsableLabel = esPallet ? 'Tipo Pallet' : 'Responsable'
  const tipoResponsableValue = esPallet ? (entidad.tipo_pallet || 'N/A') : (entidad.responsable_cosecha || entidad.responsable || 'N/A')
  const tipoResponsableIcon = esPallet ? '🪵' : '👤'

  const claseEstado = estado.toLowerCase().replace(/\s+/g, '-')
  const fechaGeneracion = new Date().toLocaleString('es-CL', { dateStyle: 'short', timeStyle: 'short' })

  return `
    <div class="etiqueta">
      <!-- 1. Header -->
      <div class="header">
        <div>
          <p class="entity-type">${tipoEntidad}</p>
          <p class="brand-name">KimunPulse</p>
        </div>
        <p class="entity-id">${codigo}</p>
      </div>

      <!-- 2. Main Info -->
      <div class="main-info">
        <div class="main-info-block">
          <h2>${cultivo}</h2>
          <p>Cultivo</p>
        </div>
        <div class="info-separator">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 12H20M20 12L14 6M20 12L14 18" stroke="#d1d5db" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="main-info-block">
          <h2>${variedad}</h2>
          <p>Variedad</p>
        </div>
      </div>
      
      <!-- 3. Details Section -->
      <div class="details-section">
        <div class="details-grid">
          
          <div class="detail-item">
            <span class="icon">📦</span>
            <div>
              <p class="label">Estado</p>
              <p class="value"><span class="estado estado-${claseEstado}">${estado}</span></p>
            </div>
          </div>

          <div class="detail-item">
            <span class="icon">${areaPesoIcon}</span>
            <div>
              <p class="label">${areaPesoLabel}</p>
              <p class="value">${areaPesoValue}</p>
            </div>
          </div>

          <div class="detail-item">
            <span class="icon">${cuartelUbicacionIcon}</span>
            <div>
              <p class="label">${cuartelUbicacionLabel}</p>
              <p class="value">${cuartelUbicacionValue}</p>
            </div>
          </div>
          
          <div class="detail-item">
            <span class="icon">🗓️</span>
            <div>
              <p class="label">Fecha</p>
              <p class="value">${fechaFormateada}</p>
            </div>
          </div>

          <div class="detail-item">
            <span class="icon">${destinoUbicacionGeoIcon}</span>
            <div>
              <p class="label">${destinoUbicacionGeoLabel}</p>
              <p class="value">${destinoUbicacionGeoValue}</p>
            </div>
          </div>
          
          <div class="detail-item">
            <span class="icon">${tipoResponsableIcon}</span>
            <div>
              <p class="label">${tipoResponsableLabel}</p>
              <p class="value">${tipoResponsableValue}</p>
            </div>
          </div>

        </div>
      </div>
      
      <!-- 4. Divider -->
      <div class="divider"></div>

      <!-- 5. QR Section -->
      <div class="qr-section">
        ${qrDataURL ? `<img src="${qrDataURL}" alt="Código QR de ${codigo}" class="qr-code">` : ''}
      </div>

      <!-- 6. Footer -->
      <div class="footer">
        Generado el ${fechaGeneracion}
      </div>
    </div>
  `
}

/**
 * Genera HTML para etiquetas con diseño optimizado aspect-ratio 1:1.65 y QR al fondo.
 */
export function generarHTMLEtiquetas(
  entidades: Array<{ id: string; tipo: 'lote' | 'pallet'; [key: string]: any }>,
  config: EtiquetaConfig,
  qrCodes: string[]
): string {
  const estilos = generarEstilosEtiqueta(config)
  
  const etiquetasHTML = entidades.map((entidad, index) => {
    const qrCode = qrCodes[index] || ''
    return generarLayoutEtiqueta(entidad, config, qrCode)
  }).join('')

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Etiquetas KimunPulse</title>
      ${estilos}
    </head>
    <body>
      ${etiquetasHTML}
    </body>
    </html>
  `
}

/**
 * Genera código de barras simple (como texto formateado)
 */
export function generarCodigoBarras(codigo: string): string {
  // Convertir código a formato numérico para código de barras
  const numerico = codigo.replace(/[^\d]/g, '')
  return `|||${numerico}|||`
}

/**
 * Extrae información de un código QR (JSON o simple)
 */
export function extraerInfoCodigo(codigo: string): QRData {
  // Intentar parsear como JSON primero
  try {
    const datos = JSON.parse(codigo)
    if (datos.id && datos.tipo && datos.timestamp && datos.app) {
      return datos as QRData
    }
  } catch {
    // No es JSON válido, intentar como código simple
  }

  // Procesar como código simple
  const tipo = detectarTipoCodigo(codigo)
  if (tipo === 'desconocido') {
    throw new Error(`Código inválido: ${codigo}`)
  }
  
  return {
    id: codigo,
    tipo,
    timestamp: new Date().toISOString(),
    app: 'KimunPulse',
    version: '1.0',
    metadata: {}
  }
}

export function descargarEtiquetas(htmlContent: string, nombreArchivo: string = 'etiquetas'): void {
  const printWindow = window.open('', '_blank')
  if (!printWindow) return

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Etiquetas KimunPulse</title>
        <style>
          body { 
            margin: 0; 
            padding: 20px; 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f9fafb;
          }
          .etiquetas-container { 
            display: flex; 
            flex-wrap: wrap; 
            gap: 20px; 
            justify-content: center;
          }
          @media print {
            body { background: white; }
            .etiquetas-container { gap: 10px; }
          }
        </style>
      </head>
      <body>
        <div class="etiquetas-container">
          ${htmlContent}
        </div>
      </body>
    </html>
  `)
  
  printWindow.document.close()
  printWindow.focus()
  
  setTimeout(() => {
    printWindow.print()
  }, 500)
}

