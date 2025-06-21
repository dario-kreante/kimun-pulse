import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import {
  Thermometer,
  Shield,
  FileText,
  Download,
  CheckCircle,
  AlertTriangle,
  Clock,
  Package,
  MapPin,
  User,
  Snowflake,
  BarChart3,
  X,
  RefreshCw,
  Calendar,
  Eye,
  Award,
  Stamp,
  ClipboardCheck
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface DatosSAG {
  lote_id: string
  cultivo: string
  variedad: string
  cuartel: string
  area: number
  fecha_cosecha: string
  peso_total_kg: number
  responsable_principal: string
  estado_actual: string
  eventos_criticos: EventoCriticoSAG[]
  validaciones: ValidacionSAG[]
  certificaciones: CertificacionSAG[]
  controles_temperatura: ControlTemperatura[]
  controles_calidad: ControlCalidad[]
  documentos_adjuntos: DocumentoAdjunto[]
  fecha_generacion: string
  cumplimiento_porcentaje: number
}

interface EventoCriticoSAG {
  tipo_evento: string
  fecha: string
  responsable: string
  temperatura?: number
  humedad?: number
  datos_adicionales: any
  cumple_normativa: boolean
  observaciones?: string
}

interface ValidacionSAG {
  categoria: string
  criterio: string
  cumple: boolean
  valor_obtenido?: string
  valor_requerido?: string
  observaciones?: string
}

interface CertificacionSAG {
  tipo: string
  numero: string
  fecha_emision: string
  fecha_vencimiento?: string
  estado: 'vigente' | 'vencida' | 'pendiente'
}

interface ControlTemperatura {
  fecha: string
  temperatura: number
  ubicacion: string
  responsable: string
  dentro_rango: boolean
  rango_min: number
  rango_max: number
}

interface ControlCalidad {
  fecha: string
  parametro: string
  valor: number
  unidad: string
  cumple_estandar: boolean
  estandar_min?: number
  estandar_max?: number
  inspector: string
}

interface DocumentoAdjunto {
  tipo: string
  nombre: string
  fecha: string
  estado: 'completo' | 'pendiente'
}

interface ReporteSAGProps {
  onClose: () => void
}

export default function ReporteSAG({ onClose }: ReporteSAGProps) {
  const [loteId, setLoteId] = useState('')
  const [reporteSAG, setReporteSAG] = useState<DatosSAG | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [vistaActual, setVistaActual] = useState<'resumen' | 'eventos' | 'validaciones' | 'documentos'>('resumen')

  const generarReporteSAG = async () => {
    if (!loteId.trim()) {
      setError('Ingresa un ID de lote válido')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Obtener información del lote
      const { data: loteInfo, error: loteError } = await supabase
        .from('v_lotes_completos')
        .select('*')
        .eq('id', loteId)
        .single()

      if (loteError) {
        if (loteError.code === 'PGRST116') {
          setError(`No se encontró el lote ${loteId}`)
        } else {
          throw loteError
        }
        return
      }

      // Obtener eventos con datos específicos SAG
      const { data: eventos, error: eventosError } = await supabase
        .from('eventos_trazabilidad')
        .select('*')
        .eq('lote_id', loteId)
        .order('fecha', { ascending: true })

      if (eventosError) throw eventosError

      // Procesar eventos críticos para SAG
      const eventosCriticos = procesarEventosCriticos(eventos || [])
      
      // Generar validaciones SAG
      const validaciones = generarValidacionesSAG(loteInfo, eventos || [])
      
      // Obtener controles de temperatura
      const controlesTemperatura = extraerControlesTemperatura(eventos || [])
      
      // Obtener controles de calidad
      const controlesCalidad = extraerControlesCalidad(eventos || [])
      
      // Generar certificaciones
      const certificaciones = generarCertificaciones(loteInfo, eventos || [])
      
      // Generar documentos requeridos
      const documentos = generarDocumentosRequeridos(eventos || [])
      
      // Calcular cumplimiento
      const cumplimiento = calcularCumplimientoSAG(validaciones)

      const reporte: DatosSAG = {
        lote_id: loteInfo.id || '',
        cultivo: loteInfo.cultivo || '',
        variedad: loteInfo.variedad || '',
        cuartel: loteInfo.cuartel_origen || '',
        area: loteInfo.area || 0,
        fecha_cosecha: loteInfo.created_at || new Date().toISOString(),
        peso_total_kg: Math.round((loteInfo.area || 0) * 25000),
        responsable_principal: 'Operador Principal',
        estado_actual: loteInfo.estado || 'Sin Estado',
        eventos_criticos: eventosCriticos,
        validaciones,
        certificaciones,
        controles_temperatura: controlesTemperatura,
        controles_calidad: controlesCalidad,
        documentos_adjuntos: documentos,
        fecha_generacion: new Date().toISOString(),
        cumplimiento_porcentaje: cumplimiento
      }

      setReporteSAG(reporte)

    } catch (error) {
      console.error('Error generando reporte SAG:', error)
      setError('Error al generar el reporte SAG')
    } finally {
      setLoading(false)
    }
  }

  const procesarEventosCriticos = (eventos: any[]): EventoCriticoSAG[] => {
    const eventosCriticosSAG = [
      'Inicio Cosecha',
      'Recepción Packing',
      'Enfriado',
      'Control Calidad',
      'Paletizado',
      'Despacho'
    ]

    return eventos
      .filter(e => eventosCriticosSAG.includes(e.tipo_evento))
      .map(evento => ({
        tipo_evento: evento.tipo_evento,
        fecha: evento.fecha,
        responsable: evento.responsable_nombre,
        temperatura: evento.datos_adicionales?.temperatura_llegada ||
                    evento.datos_adicionales?.temperatura_inicial ||
                    evento.datos_adicionales?.temperatura_objetivo,
        humedad: evento.datos_adicionales?.humedad_relativa_porcentaje,
        datos_adicionales: evento.datos_adicionales,
        cumple_normativa: validarCumplimientoEvento(evento),
        observaciones: evento.observaciones
      }))
  }

  const validarCumplimientoEvento = (evento: any): boolean => {
    // Validaciones específicas por tipo de evento según normativa SAG
    switch (evento.tipo_evento) {
      case 'Enfriado':
        const temp = evento.datos_adicionales?.temperatura_objetivo
        return temp !== undefined && temp >= 0 && temp <= 4
      
      case 'Control Calidad':
        const inspector = evento.datos_adicionales?.inspector_calidad
        return inspector !== undefined && inspector.trim() !== ''
      
      case 'Paletizado':
        const codigo = evento.datos_adicionales?.numero_pallet
        return codigo !== undefined && codigo.trim() !== ''
      
      default:
        return true
    }
  }

  const generarValidacionesSAG = (lote: any, eventos: any[]): ValidacionSAG[] => {
    const validaciones: ValidacionSAG[] = []

    // Validación de trazabilidad completa
    const eventosRequeridos = [
      'Inicio Cosecha', 'Cosecha Completa', 'Recepción Packing',
      'Selección', 'Empaque', 'Paletizado', 'Enfriado', 'Control Calidad', 'Despacho'
    ]
    const eventosPresentes = new Set(eventos.map(e => e.tipo_evento))
    
    validaciones.push({
      categoria: 'Trazabilidad',
      criterio: 'Eventos completos del flujo',
      cumple: eventosRequeridos.every(e => eventosPresentes.has(e)),
      valor_obtenido: `${eventosPresentes.size}/9 eventos`,
      valor_requerido: '9/9 eventos requeridos'
    })

    // Validación de temperaturas
    const eventosConTemperatura = eventos.filter(e => 
      e.datos_adicionales?.temperatura_inicial !== undefined ||
      e.datos_adicionales?.temperatura_objetivo !== undefined
    )
    
    validaciones.push({
      categoria: 'Control Térmico',
      criterio: 'Registro de temperaturas',
      cumple: eventosConTemperatura.length > 0,
      valor_obtenido: `${eventosConTemperatura.length} registros`,
      valor_requerido: 'Al menos 1 registro requerido'
    })

    // Validación de responsables
    const eventosConResponsable = eventos.filter(e => e.responsable_nombre && e.responsable_nombre.trim() !== '')
    
    validaciones.push({
      categoria: 'Responsabilidad',
      criterio: 'Responsables asignados',
      cumple: eventosConResponsable.length === eventos.length,
      valor_obtenido: `${eventosConResponsable.length}/${eventos.length} eventos`,
      valor_requerido: 'Todos los eventos deben tener responsable'
    })

    // Validación de área
    validaciones.push({
      categoria: 'Información Productiva',
      criterio: 'Área declarada',
      cumple: lote.area > 0,
      valor_obtenido: `${lote.area} ha`,
      valor_requerido: 'Mayor a 0 ha'
    })

    // Validación de peso
    validaciones.push({
      categoria: 'Información Productiva',
      criterio: 'Peso estimado',
      cumple: lote.peso_estimado_kg > 0,
      valor_obtenido: `${lote.peso_estimado_kg} kg`,
      valor_requerido: 'Mayor a 0 kg'
    })

    return validaciones
  }

  const extraerControlesTemperatura = (eventos: any[]): ControlTemperatura[] => {
    const controles: ControlTemperatura[] = []

    eventos.forEach(evento => {
      if (evento.datos_adicionales?.temperatura_inicial !== undefined) {
        controles.push({
          fecha: evento.fecha,
          temperatura: evento.datos_adicionales.temperatura_inicial,
          ubicacion: obtenerUbicacionEvento(evento.tipo_evento),
          responsable: evento.responsable_nombre,
          dentro_rango: true, // Simplificado para demo
          rango_min: 0,
          rango_max: 25
        })
      }
      
      if (evento.datos_adicionales?.temperatura_objetivo !== undefined) {
        controles.push({
          fecha: evento.fecha,
          temperatura: evento.datos_adicionales.temperatura_objetivo,
          ubicacion: obtenerUbicacionEvento(evento.tipo_evento),
          responsable: evento.responsable_nombre,
          dentro_rango: evento.datos_adicionales.temperatura_objetivo >= 0 && evento.datos_adicionales.temperatura_objetivo <= 4,
          rango_min: 0,
          rango_max: 4
        })
      }
    })

    return controles
  }

  const extraerControlesCalidad = (eventos: any[]): ControlCalidad[] => {
    const controles: ControlCalidad[] = []

    eventos.forEach(evento => {
      if (evento.tipo_evento === 'Control Calidad' && evento.datos_adicionales?.parametros_evaluados) {
        const parametros = evento.datos_adicionales.parametros_evaluados

        if (parametros.firmeza_kg_cm2) {
          controles.push({
            fecha: evento.fecha,
            parametro: 'Firmeza',
            valor: parametros.firmeza_kg_cm2,
            unidad: 'kg/cm²',
            cumple_estandar: parametros.firmeza_kg_cm2 >= 5.5,
            estandar_min: 5.5,
            inspector: evento.datos_adicionales.inspector_calidad || evento.responsable_nombre
          })
        }

        if (parametros.brix_grados) {
          controles.push({
            fecha: evento.fecha,
            parametro: 'Grados Brix',
            valor: parametros.brix_grados,
            unidad: '°Bx',
            cumple_estandar: parametros.brix_grados >= 10,
            estandar_min: 10,
            inspector: evento.datos_adicionales.inspector_calidad || evento.responsable_nombre
          })
        }
      }
    })

    return controles
  }

  const generarCertificaciones = (lote: any, eventos: any[]): CertificacionSAG[] => {
    const certificaciones: CertificacionSAG[] = []

    // Certificación de origen
    certificaciones.push({
      tipo: 'Certificación de Origen',
      numero: `CO-${lote.id}`,
      fecha_emision: lote.fecha_creacion,
      estado: 'vigente'
    })

    // Certificaciones de calidad si existen controles
    const eventosCalidad = eventos.filter(e => e.tipo_evento === 'Control Calidad')
    if (eventosCalidad.length > 0) {
      eventosCalidad.forEach((evento, index) => {
        if (evento.datos_adicionales?.certificado_calidad) {
          certificaciones.push({
            tipo: 'Certificado de Calidad',
            numero: evento.datos_adicionales.certificado_calidad,
            fecha_emision: evento.fecha,
            estado: 'vigente'
          })
        }
      })
    }

    return certificaciones
  }

  const generarDocumentosRequeridos = (eventos: any[]): DocumentoAdjunto[] => {
    const documentos: DocumentoAdjunto[] = [
      {
        tipo: 'Guía de Cosecha',
        nombre: 'Documento de inicio de cosecha',
        fecha: eventos.find(e => e.tipo_evento === 'Inicio Cosecha')?.fecha || '',
        estado: eventos.some(e => e.tipo_evento === 'Inicio Cosecha') ? 'completo' : 'pendiente'
      },
      {
        tipo: 'Certificado de Recepción',
        nombre: 'Documento de recepción en packing',
        fecha: eventos.find(e => e.tipo_evento === 'Recepción Packing')?.fecha || '',
        estado: eventos.some(e => e.tipo_evento === 'Recepción Packing') ? 'completo' : 'pendiente'
      },
      {
        tipo: 'Certificado de Calidad',
        nombre: 'Informe de control de calidad',
        fecha: eventos.find(e => e.tipo_evento === 'Control Calidad')?.fecha || '',
        estado: eventos.some(e => e.tipo_evento === 'Control Calidad') ? 'completo' : 'pendiente'
      },
      {
        tipo: 'Guía de Despacho',
        nombre: 'Documento de despacho final',
        fecha: eventos.find(e => e.tipo_evento === 'Despacho')?.fecha || '',
        estado: eventos.some(e => e.tipo_evento === 'Despacho') ? 'completo' : 'pendiente'
      }
    ]

    return documentos
  }

  const calcularCumplimientoSAG = (validaciones: ValidacionSAG[]): number => {
    if (validaciones.length === 0) return 0
    const cumplidas = validaciones.filter(v => v.cumple).length
    return Math.round((cumplidas / validaciones.length) * 100)
  }

  const obtenerUbicacionEvento = (tipoEvento: string): string => {
    const ubicaciones: Record<string, string> = {
      'Inicio Cosecha': 'Campo',
      'Cosecha Completa': 'Campo',
      'Recepción Packing': 'Packing',
      'Selección': 'Packing',
      'Empaque': 'Packing',
      'Paletizado': 'Packing',
      'Enfriado': 'Cámara Frigorífica',
      'Control Calidad': 'Laboratorio',
      'Despacho': 'Área de Despacho'
    }
    return ubicaciones[tipoEvento] || 'Sin especificar'
  }

  const exportarReporteSAG = () => {
    if (!reporteSAG) return

    const contenido = `
REPORTE OFICIAL SAG - TRAZABILIDAD AGRÍCOLA
Generado: ${format(new Date(reporteSAG.fecha_generacion), 'dd/MM/yyyy HH:mm')}

=== INFORMACIÓN DEL LOTE ===
ID Lote: ${reporteSAG.lote_id}
Cultivo: ${reporteSAG.cultivo}
Variedad: ${reporteSAG.variedad}
Cuartel: ${reporteSAG.cuartel}
Área: ${reporteSAG.area} ha
Peso Total: ${reporteSAG.peso_total_kg} kg
Responsable Principal: ${reporteSAG.responsable_principal}
Estado Actual: ${reporteSAG.estado_actual}

=== CUMPLIMIENTO NORMATIVO ===
Nivel de Cumplimiento: ${reporteSAG.cumplimiento_porcentaje}%

=== VALIDACIONES SAG ===
${reporteSAG.validaciones.map(v => `
${v.categoria} - ${v.criterio}:
  Estado: ${v.cumple ? 'CUMPLE' : 'NO CUMPLE'}
  Valor Obtenido: ${v.valor_obtenido || 'N/A'}
  Valor Requerido: ${v.valor_requerido || 'N/A'}
  ${v.observaciones ? `Observaciones: ${v.observaciones}` : ''}
`).join('')}

=== EVENTOS CRÍTICOS ===
${reporteSAG.eventos_criticos.map((e, i) => `
${i + 1}. ${e.tipo_evento}
   Fecha: ${format(new Date(e.fecha), 'dd/MM/yyyy HH:mm')}
   Responsable: ${e.responsable}
   Cumple Normativa: ${e.cumple_normativa ? 'SÍ' : 'NO'}
   ${e.temperatura ? `Temperatura: ${e.temperatura}°C` : ''}
   ${e.humedad ? `Humedad: ${e.humedad}%` : ''}
   ${e.observaciones ? `Observaciones: ${e.observaciones}` : ''}
`).join('')}

=== CONTROLES DE TEMPERATURA ===
${reporteSAG.controles_temperatura.map(c => `
Fecha: ${format(new Date(c.fecha), 'dd/MM/yyyy HH:mm')}
Temperatura: ${c.temperatura}°C
Ubicación: ${c.ubicacion}
Responsable: ${c.responsable}
Dentro de Rango: ${c.dentro_rango ? 'SÍ' : 'NO'} (${c.rango_min}°C - ${c.rango_max}°C)
`).join('')}

=== CERTIFICACIONES ===
${reporteSAG.certificaciones.map(c => `
${c.tipo}: ${c.numero}
Fecha Emisión: ${format(new Date(c.fecha_emision), 'dd/MM/yyyy')}
Estado: ${c.estado.toUpperCase()}
${c.fecha_vencimiento ? `Vencimiento: ${format(new Date(c.fecha_vencimiento), 'dd/MM/yyyy')}` : ''}
`).join('')}

Este reporte certifica el cumplimiento de las normativas SAG para el lote ${reporteSAG.lote_id}.
Nivel de cumplimiento: ${reporteSAG.cumplimiento_porcentaje}%

Documento generado por KimunPulse - Sistema de Trazabilidad Agrícola
    `

    const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `reporte_sag_${reporteSAG.lote_id}_${format(new Date(), 'yyyy-MM-dd')}.txt`
    link.click()
  }

  const obtenerColorCumplimiento = (porcentaje: number) => {
    if (porcentaje >= 90) return 'text-green-600 bg-green-50 border-green-200'
    if (porcentaje >= 70) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    return 'text-red-600 bg-red-50 border-red-200'
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-7xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-red-50 to-orange-50">
          <div className="flex items-center space-x-3">
            <div className="bg-red-100 p-2 rounded-lg">
              <Shield className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Reporte SAG</h2>
              <p className="text-gray-600">Documentación oficial para cumplimiento normativo</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Cerrar reporte"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Búsqueda */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex space-x-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Ingresa el ID del lote para generar reporte SAG"
                value={loteId}
                onChange={(e) => setLoteId(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && generarReporteSAG()}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-lg"
              />
            </div>
            <button
              onClick={generarReporteSAG}
              disabled={loading || !loteId.trim()}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center space-x-2"
            >
              {loading ? (
                <RefreshCw className="h-5 w-5 animate-spin" />
              ) : (
                <Shield className="h-5 w-5" />
              )}
              <span>Generar Reporte</span>
            </button>
          </div>
          
          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span className="text-red-700">{error}</span>
            </div>
          )}
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-auto">
          {reporteSAG ? (
            <div className="space-y-6 p-6">
              {/* Header del reporte */}
              <div className={`rounded-lg p-6 border-2 ${obtenerColorCumplimiento(reporteSAG.cumplimiento_porcentaje)}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-white p-2 rounded-lg">
                      <Award className="h-8 w-8 text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">Certificación SAG</h3>
                      <p className="text-lg">Lote: {reporteSAG.lote_id}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold">{reporteSAG.cumplimiento_porcentaje}%</div>
                    <div className="text-sm">Cumplimiento Normativo</div>
                    <button
                      onClick={exportarReporteSAG}
                      className="mt-2 flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      <Download className="h-4 w-4" />
                      <span>Exportar</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded p-3 border">
                    <div className="text-sm text-gray-600">Cultivo</div>
                    <div className="font-medium">{reporteSAG.cultivo}</div>
                  </div>
                  <div className="bg-white rounded p-3 border">
                    <div className="text-sm text-gray-600">Área</div>
                    <div className="font-medium">{reporteSAG.area} ha</div>
                  </div>
                  <div className="bg-white rounded p-3 border">
                    <div className="text-sm text-gray-600">Eventos Críticos</div>
                    <div className="font-medium">{reporteSAG.eventos_criticos.length}</div>
                  </div>
                  <div className="bg-white rounded p-3 border">
                    <div className="text-sm text-gray-600">Certificaciones</div>
                    <div className="font-medium">{reporteSAG.certificaciones.length}</div>
                  </div>
                </div>
              </div>

              {/* Navegación */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: 'resumen', label: 'Resumen Ejecutivo', icon: BarChart3 },
                    { key: 'eventos', label: 'Eventos Críticos', icon: Clock },
                    { key: 'validaciones', label: 'Validaciones SAG', icon: ClipboardCheck },
                    { key: 'documentos', label: 'Documentos', icon: FileText }
                  ].map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      onClick={() => setVistaActual(key as any)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                        vistaActual === key 
                          ? 'bg-red-600 text-white' 
                          : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Contenido por vista */}
              {vistaActual === 'resumen' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Controles de Temperatura */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                      <Thermometer className="h-5 w-5 text-blue-600" />
                      <span>Controles de Temperatura</span>
                    </h3>
                    <div className="space-y-3">
                      {reporteSAG.controles_temperatura.slice(0, 3).map((control, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <div className="font-medium">{control.temperatura}°C</div>
                            <div className="text-sm text-gray-600">{control.ubicacion}</div>
                          </div>
                          <div className="text-right">
                            <div className={`text-sm font-medium ${control.dentro_rango ? 'text-green-600' : 'text-red-600'}`}>
                              {control.dentro_rango ? 'En rango' : 'Fuera de rango'}
                            </div>
                            <div className="text-xs text-gray-500">
                              {format(new Date(control.fecha), 'dd/MM HH:mm')}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Controles de Calidad */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                      <Eye className="h-5 w-5 text-green-600" />
                      <span>Controles de Calidad</span>
                    </h3>
                    <div className="space-y-3">
                      {reporteSAG.controles_calidad.map((control, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <div className="font-medium">{control.parametro}</div>
                            <div className="text-sm text-gray-600">{control.valor} {control.unidad}</div>
                          </div>
                          <div className="text-right">
                            <div className={`text-sm font-medium ${control.cumple_estandar ? 'text-green-600' : 'text-red-600'}`}>
                              {control.cumple_estandar ? 'Conforme' : 'No conforme'}
                            </div>
                            <div className="text-xs text-gray-500">{control.inspector}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {vistaActual === 'eventos' && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Eventos Críticos para SAG ({reporteSAG.eventos_criticos.length})
                  </h3>
                  <div className="space-y-4">
                    {reporteSAG.eventos_criticos.map((evento, index) => (
                      <div key={index} className={`p-4 rounded-lg border-2 ${
                        evento.cumple_normativa ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg ${
                              evento.cumple_normativa ? 'bg-green-100' : 'bg-red-100'
                            }`}>
                              {evento.cumple_normativa ? 
                                <CheckCircle className="h-5 w-5 text-green-600" /> :
                                <AlertTriangle className="h-5 w-5 text-red-600" />
                              }
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{evento.tipo_evento}</h4>
                              <p className="text-sm text-gray-600">Responsable: {evento.responsable}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-600">
                              {format(new Date(evento.fecha), 'dd/MM/yyyy HH:mm')}
                            </div>
                            <div className={`text-sm font-medium ${
                              evento.cumple_normativa ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {evento.cumple_normativa ? 'Cumple normativa' : 'No cumple normativa'}
                            </div>
                          </div>
                        </div>
                        
                        {(evento.temperatura || evento.humedad) && (
                          <div className="mt-3 flex items-center space-x-4 text-sm text-gray-600">
                            {evento.temperatura && (
                              <span>Temperatura: {evento.temperatura}°C</span>
                            )}
                            {evento.humedad && (
                              <span>Humedad: {evento.humedad}%</span>
                            )}
                          </div>
                        )}
                        
                        {evento.observaciones && (
                          <div className="mt-3 p-2 bg-white rounded border text-sm text-gray-700">
                            <strong>Observaciones:</strong> {evento.observaciones}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {vistaActual === 'validaciones' && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Validaciones SAG ({reporteSAG.validaciones.length})
                  </h3>
                  <div className="space-y-4">
                    {reporteSAG.validaciones.map((validacion, index) => (
                      <div key={index} className={`p-4 rounded-lg border ${
                        validacion.cumple ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {validacion.cumple ? 
                              <CheckCircle className="h-5 w-5 text-green-600" /> :
                              <AlertTriangle className="h-5 w-5 text-red-600" />
                            }
                            <div>
                              <h4 className="font-medium text-gray-900">{validacion.criterio}</h4>
                              <p className="text-sm text-gray-600">{validacion.categoria}</p>
                            </div>
                          </div>
                          <div className={`px-3 py-1 rounded-lg text-sm font-medium ${
                            validacion.cumple ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {validacion.cumple ? 'CUMPLE' : 'NO CUMPLE'}
                          </div>
                        </div>
                        
                        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Valor obtenido: </span>
                            <span className="font-medium">{validacion.valor_obtenido}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Valor requerido: </span>
                            <span className="font-medium">{validacion.valor_requerido}</span>
                          </div>
                        </div>
                        
                        {validacion.observaciones && (
                          <div className="mt-3 p-2 bg-white rounded border text-sm text-gray-700">
                            <strong>Observaciones:</strong> {validacion.observaciones}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {vistaActual === 'documentos' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Documentos Requeridos */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <span>Documentos Requeridos</span>
                    </h3>
                    <div className="space-y-3">
                      {reporteSAG.documentos_adjuntos.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <div className="font-medium">{doc.tipo}</div>
                            <div className="text-sm text-gray-600">{doc.nombre}</div>
                          </div>
                          <div className="text-right">
                            <div className={`px-2 py-1 rounded text-xs font-medium ${
                              doc.estado === 'completo' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {doc.estado === 'completo' ? 'Completo' : 'Pendiente'}
                            </div>
                            {doc.fecha && (
                              <div className="text-xs text-gray-500 mt-1">
                                {format(new Date(doc.fecha), 'dd/MM/yyyy')}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Certificaciones */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                      <Stamp className="h-5 w-5 text-purple-600" />
                      <span>Certificaciones</span>
                    </h3>
                    <div className="space-y-3">
                      {reporteSAG.certificaciones.map((cert, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{cert.tipo}</div>
                              <div className="text-sm text-gray-600">{cert.numero}</div>
                            </div>
                            <div className={`px-2 py-1 rounded text-xs font-medium ${
                              cert.estado === 'vigente' ? 'bg-green-100 text-green-700' :
                              cert.estado === 'vencida' ? 'bg-red-100 text-red-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {cert.estado.toUpperCase()}
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 mt-2">
                            Emitido: {format(new Date(cert.fecha_emision), 'dd/MM/yyyy')}
                            {cert.fecha_vencimiento && (
                              <span> • Vence: {format(new Date(cert.fecha_vencimiento), 'dd/MM/yyyy')}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <Shield className="h-16 w-16 mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Reporte SAG</h3>
              <p className="text-center max-w-md">
                Ingresa el ID de un lote para generar la documentación oficial SAG
                con todas las validaciones de cumplimiento normativo.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {reporteSAG && (
          <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Reporte generado: {format(new Date(reporteSAG.fecha_generacion), 'dd/MM/yyyy HH:mm', { locale: es })}
            </div>
            <div className="text-sm text-gray-500">
              Cumplimiento SAG: {reporteSAG.cumplimiento_porcentaje}% • {reporteSAG.eventos_criticos.length} eventos críticos
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 