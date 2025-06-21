// Generador inteligente de códigos para lotes y pallets
// Cumple con normativas SAG Chile y estándares internacionales

import { supabase } from '../lib/supabase'

export interface ResultadoGeneracion {
  codigo: string
  tipo: 'lote' | 'pallet'
  valido: boolean
  secuencial: number
  año: number
  errores: string[]
  mensaje?: string
}

export interface OpcionesGeneracion {
  año?: number
}

class CodigoGeneradorInteligente {
  private readonly LIMITE_PALLET = 99999
  private readonly LIMITE_LOTE = 999

  /**
   * Genera el próximo código de pallet único, verificando base de datos
   */
  async generarProximoPallet(opciones: OpcionesGeneracion = {}): Promise<ResultadoGeneracion> {
    try {
      const año = opciones.año || new Date().getFullYear()
      
      // Verificar límite
      if (año < 2020 || año > 2100) {
        throw new Error(`Año inválido: ${año}`)
      }
      
      // Obtener último secuencial desde la base de datos
      const ultimoSecuencial = await this.obtenerUltimoSecuencialPalletDB(año)
      
      // Calcular siguiente
      const siguienteSecuencial = ultimoSecuencial + 1
      
      // Verificar límite
      if (siguienteSecuencial > this.LIMITE_PALLET) {
        throw new Error(`Se alcanzó el límite máximo de pallets para el año ${año} (${this.LIMITE_PALLET.toLocaleString()})`)
      }
      
      const codigo = `PAL-${año}-CHIL-${siguienteSecuencial.toString().padStart(5, '0')}`
      
      // Verificar que no existe duplicado (doble verificación)
      const existe = await this.verificarCodigoExiste(codigo)
      if (existe) {
        console.warn(`⚠️ Código ${codigo} ya existe, regenerando...`)
        // Forzar siguiente secuencial
        return this.generarProximoPallet({ año: año })
      }
      
      return {
        codigo,
        tipo: 'pallet',
        valido: true,
        secuencial: siguienteSecuencial,
        año,
        errores: [],
        mensaje: `Código generado exitosamente. Secuencial: ${siguienteSecuencial}`
      }
    } catch (error) {
      console.error('Error generando código de pallet:', error)
      return {
        codigo: '',
        tipo: 'pallet',
        valido: false,
        secuencial: 0,
        año: opciones.año || new Date().getFullYear(),
        errores: [error instanceof Error ? error.message : 'Error desconocido'],
        mensaje: 'No se pudo generar el código de pallet'
      }
    }
  }

  /**
   * Genera el próximo código de lote único
   */
  async generarProximoLote(opciones: OpcionesGeneracion = {}): Promise<ResultadoGeneracion> {
    try {
      const año = opciones.año || new Date().getFullYear()
      
      // Obtener último secuencial desde la base de datos
      const ultimoSecuencial = await this.obtenerUltimoSecuencialLoteDB(año)
      
      // Calcular siguiente
      const siguienteSecuencial = ultimoSecuencial + 1
      
      // Verificar límite
      if (siguienteSecuencial > this.LIMITE_LOTE) {
        throw new Error(`Se alcanzó el límite máximo de lotes para el año ${año} (${this.LIMITE_LOTE})`)
      }
      
      const codigo = `LP-${año}-CHIL-${siguienteSecuencial.toString().padStart(3, '0')}`
      
      return {
        codigo,
        tipo: 'lote',
        valido: true,
        secuencial: siguienteSecuencial,
        año,
        errores: [],
        mensaje: `Código generado exitosamente. Secuencial: ${siguienteSecuencial}`
      }
    } catch (error) {
      console.error('Error generando código de lote:', error)
      return {
        codigo: '',
        tipo: 'lote',
        valido: false,
        secuencial: 0,
        año: opciones.año || new Date().getFullYear(),
        errores: [error instanceof Error ? error.message : 'Error desconocido'],
        mensaje: 'No se pudo generar el código de lote'
      }
    }
  }

  /**
   * Obtiene el último secuencial de pallet desde la base de datos
   */
  private async obtenerUltimoSecuencialPalletDB(año: number): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('pallets')
        .select('codigo_pallet')
        .like('codigo_pallet', `PAL-${año}-CHIL-%`)
        .order('codigo_pallet', { ascending: false })
        .limit(1)
        .single()
      
      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.warn('Error consultando últimos pallets:', error)
        return this.obtenerUltimoSecuencialPalletFallback(año)
      }
      
      if (!data) {
        console.log(`🎯 No hay pallets para el año ${año}, comenzando desde 0`)
        return 0
      }
      
      // Extraer secuencial del código
      const match = data.codigo_pallet.match(/PAL-\d{4}-CHIL-(\d{5})$/)
      if (!match) {
        console.warn('Formato de código inválido:', data.codigo_pallet)
        return this.obtenerUltimoSecuencialPalletFallback(año)
      }
      
      const secuencial = parseInt(match[1])
      console.log(`📊 Último pallet ${año}: ${data.codigo_pallet} (secuencial: ${secuencial})`)
      return secuencial
      
    } catch (error) {
      console.warn('Error obteniendo último secuencial de pallet desde BD:', error)
      return this.obtenerUltimoSecuencialPalletFallback(año)
    }
  }

  /**
   * Obtiene el último secuencial de lote desde la base de datos
   */
  private async obtenerUltimoSecuencialLoteDB(año: number): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('lotes')
        .select('id')
        .like('id', `LP-${año}-CHIL-%`)
        .order('id', { ascending: false })
        .limit(1)
        .single()
      
      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.warn('Error consultando últimos lotes:', error)
        return this.obtenerUltimoSecuencialLoteFallback(año)
      }
      
      if (!data) {
        console.log(`🎯 No hay lotes para el año ${año}, comenzando desde 0`)
        return 0
      }
      
      // Extraer secuencial del código
      const match = data.id.match(/LP-\d{4}-CHIL-(\d{3})$/)
      if (!match) {
        console.warn('Formato de código de lote inválido:', data.id)
        return this.obtenerUltimoSecuencialLoteFallback(año)
      }
      
      const secuencial = parseInt(match[1])
      console.log(`📊 Último lote ${año}: ${data.id} (secuencial: ${secuencial})`)
      return secuencial
      
    } catch (error) {
      console.warn('Error obteniendo último secuencial de lote desde BD:', error)
      return this.obtenerUltimoSecuencialLoteFallback(año)
    }
  }

  /**
   * Verifica si un código ya existe en la base de datos
   */
  private async verificarCodigoExiste(codigo: string): Promise<boolean> {
    try {
      if (codigo.startsWith('PAL-')) {
        const { data, error } = await supabase
          .from('pallets')
          .select('codigo_pallet')
          .eq('codigo_pallet', codigo)
          .single()
        
        return !error && !!data
      } else if (codigo.startsWith('LP-')) {
        const { data, error } = await supabase
          .from('lotes')
          .select('id')
          .eq('id', codigo)
          .single()
        
        return !error && !!data
      }
      
      return false
    } catch (error) {
      console.warn('Error verificando existencia de código:', error)
      return false // Asumir que no existe para no bloquear operación
    }
  }

  /**
   * Fallback a localStorage si falla la consulta a BD
   */
  private obtenerUltimoSecuencialPalletFallback(año: number): number {
    try {
      const key = `ultimo_pallet_${año}`
      const storedValue = localStorage.getItem(key)
      const valor = storedValue ? parseInt(storedValue) : 0
      
      if (isNaN(valor)) {
        console.warn(`Valor de localStorage inválido para ${key}:`, storedValue)
        return 0
      }
      
      console.log(`🔄 Usando fallback localStorage para pallets ${año}: ${valor}`)
      return valor
    } catch (error) {
      console.warn('Error en fallback localStorage para pallets:', error)
      return 0
    }
  }

  /**
   * Fallback a localStorage si falla la consulta a BD para lotes
   */
  private obtenerUltimoSecuencialLoteFallback(año: number): number {
    try {
      const key = `ultimo_lote_${año}`
      const storedValue = localStorage.getItem(key)
      const valor = storedValue ? parseInt(storedValue) : 0
      
      if (isNaN(valor)) {
        console.warn(`Valor de localStorage inválido para ${key}:`, storedValue)
        return 0
      }
      
      console.log(`🔄 Usando fallback localStorage para lotes ${año}: ${valor}`)
      return valor
    } catch (error) {
      console.warn('Error en fallback localStorage para lotes:', error)
      return 0
    }
  }

  /**
   * Actualiza el contador en localStorage (para compatibilidad)
   */
  async actualizarContador(codigo: string): Promise<void> {
    try {
      const match = codigo.match(/(PAL|LP)-(\d{4})-CHIL-(\d{3,5})$/)
      if (!match) return
      
      const [, tipo, año, secuencialStr] = match
      const secuencial = parseInt(secuencialStr)
      
      if (tipo === 'PAL') {
        localStorage.setItem(`ultimo_pallet_${año}`, secuencial.toString())
        console.log(`✅ Contador pallet ${año} actualizado: ${secuencial}`)
      } else if (tipo === 'LP') {
        localStorage.setItem(`ultimo_lote_${año}`, secuencial.toString())
        console.log(`✅ Contador lote ${año} actualizado: ${secuencial}`)
      }
    } catch (error) {
      console.warn('Error actualizando contador:', error)
    }
  }
}

// Instancia singleton
export const codigoGenerator = new CodigoGeneradorInteligente()

// Funciones públicas para compatibilidad
export const generarProximoPallet = (opciones?: OpcionesGeneracion) => 
  codigoGenerator.generarProximoPallet(opciones)

export const generarProximoLote = (opciones?: OpcionesGeneracion) => 
  codigoGenerator.generarProximoLote(opciones)

/**
 * Valida y normaliza códigos de lote y pallet
 */
export function validarCodigo(codigo: string): ResultadoGeneracion {
  const codigoLimpio = codigo.trim().toUpperCase()
  
  // Intentar normalizar códigos parciales
  const normalizado = normalizarCodigo(codigoLimpio)
  
  // Validar formato de pallet
  const palletMatch = normalizado.match(/^PAL-(\d{4})-CHIL-(\d{5})$/)
  if (palletMatch) {
    const [, año, secuencial] = palletMatch
    return {
      codigo: normalizado,
      tipo: 'pallet',
      valido: true,
      secuencial: parseInt(secuencial),
      año: parseInt(año),
      errores: [],
      mensaje: 'Código de pallet válido'
    }
  }
  
  // Validar formato de lote
  const loteMatch = normalizado.match(/^LP-(\d{4})-CHIL-(\d{3})$/)
  if (loteMatch) {
    const [, año, secuencial] = loteMatch
    return {
      codigo: normalizado,
      tipo: 'lote',
      valido: true,
      secuencial: parseInt(secuencial),
      año: parseInt(año),
      errores: [],
      mensaje: 'Código de lote válido'
    }
  }
  
  // Código inválido
  const errores = ['Formato de código inválido']
  if (!normalizado.includes('CHIL')) {
    errores.push('Debe contener CHIL para códigos chilenos')
  }
  if (!normalizado.match(/\d{4}/)) {
    errores.push('Debe contener un año de 4 dígitos')
  }
  
  return {
    codigo: '',
    tipo: 'pallet', // Default
    valido: false,
    secuencial: 0,
    año: new Date().getFullYear(),
    errores,
    mensaje: 'Código inválido'
  }
}

/**
 * Normaliza códigos parciales a formato completo
 */
function normalizarCodigo(codigo: string): string {
  // PAL20250001 -> PAL-2025-CHIL-00001
  if (/^PAL\d{8}$/.test(codigo)) {
    const año = codigo.substring(3, 7)
    const secuencial = codigo.substring(7).padStart(5, '0')
    return `PAL-${año}-CHIL-${secuencial}`
  }
  
  // PAL-2025-1 -> PAL-2025-CHIL-00001
  if (/^PAL-\d{4}-\d{1,5}$/.test(codigo)) {
    const parts = codigo.split('-')
    const secuencial = parts[2].padStart(5, '0')
    return `PAL-${parts[1]}-CHIL-${secuencial}`
  }
  
  // P20251234 -> PAL-2025-CHIL-01234
  if (/^P\d{8}$/.test(codigo)) {
    const año = codigo.substring(1, 5)
    const secuencial = codigo.substring(5).padStart(5, '0')
    return `PAL-${año}-CHIL-${secuencial}`
  }
  
  // Casos similares para lotes...
  if (/^LP\d{7}$/.test(codigo)) {
    const año = codigo.substring(2, 6)
    const secuencial = codigo.substring(6).padStart(3, '0')
    return `LP-${año}-CHIL-${secuencial}`
  }
  
  return codigo
}

/**
 * Genera sugerencias de códigos según el contexto
 */
export async function generarSugerencias(opciones: {
  tipoEvento?: string
  añoActual?: number
}): Promise<string[]> {
  const año = opciones.añoActual || new Date().getFullYear()
  
  if (opciones.tipoEvento === 'Paletizado') {
    const resultado = await generarProximoPallet({ año })
    return resultado.valido ? [resultado.codigo] : []
  }
  
  if (opciones.tipoEvento === 'Inicio Cosecha') {
    const resultado = await generarProximoLote({ año })
    return resultado.valido ? [resultado.codigo] : []
  }
  
  // Sugerencias generales
  const sugerencias = []
  const lote = await generarProximoLote({ año })
  const pallet = await generarProximoPallet({ año })
  
  if (lote.valido) sugerencias.push(lote.codigo)
  if (pallet.valido) sugerencias.push(pallet.codigo)
  
  return sugerencias
} 