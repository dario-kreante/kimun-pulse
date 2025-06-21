import React from 'react'
import { 
  X, 
  Calendar, 
  User, 
  Hash, 
  Thermometer, 
  Scale, 
  Clock, 
  MapPin, 
  Truck, 
  FileText,
  Shield,
  Package,
  CheckCircle,
  AlertTriangle,
  Info,
  Scissors,
  Droplets,
  Target,
  Filter,
  Grid3X3,
  Snowflake,
  ShieldCheck,
  Send,
  Activity
} from 'lucide-react'

interface EventoTrazabilidad {
  id?: string
  tipo?: string
  descripcion?: string
  fecha?: string
  responsable_nombre?: string
  datos_adicionales?: any
}

interface ModalDetallesEventoProps {
  isOpen: boolean
  evento: EventoTrazabilidad | null
  onClose: () => void
}

export default function ModalDetallesEvento({ isOpen, evento, onClose }: ModalDetallesEventoProps) {
  if (!isOpen || !evento) return null

  // 🔍 DEBUG TEMPORAL
  console.log('🔍 MODAL DEBUG - Evento recibido:', {
    id: evento.id,
    tipo: evento.tipo,
    id_exists: !!evento.id,
    id_type: typeof evento.id,
    id_length: evento.id ? evento.id.length : 'N/A',
    full_evento: evento
  })

  const getResponsableEvento = (evento: EventoTrazabilidad): string => {
    if (evento.datos_adicionales?.operario_nombre) {
      return evento.datos_adicionales.operario_nombre
    }
    
    if (evento.responsable_nombre) {
      return evento.responsable_nombre
    }
    
    if (evento.datos_adicionales?.responsable_nombre) {
      return evento.datos_adicionales.responsable_nombre
    }
    
    if (evento.datos_adicionales?.inspector_calidad) {
      return evento.datos_adicionales.inspector_calidad
    }
    
    return 'Sin responsable'
  }

  const getIdEvento = (evento: EventoTrazabilidad): string => {
    if (!evento.id) return 'N/A'
    
    // Para UUIDs (36 chars), mostrar los últimos 8 caracteres
    if (evento.id.length > 12) {
      return evento.id.slice(-8)
    }
    
    return evento.id
  }

  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha)
    return {
      fecha: date.toLocaleDateString('es-CL', { 
        weekday: 'long',
        day: 'numeric', 
        month: 'long',
        year: 'numeric'
      }),
      hora: date.toLocaleTimeString('es-CL', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    }
  }

  const getEventoIcon = () => {
    const iconMap: Record<string, React.ReactNode> = {
      'Inicio Cosecha': <Scissors className="h-6 w-6" />,
      'Cosecha Completa': <CheckCircle className="h-6 w-6" />,
      'Recepción Packing': <Truck className="h-6 w-6" />,
      'Selección': <Filter className="h-6 w-6" />,
      'Empaque': <Package className="h-6 w-6" />,
      'Paletizado': <Grid3X3 className="h-6 w-6" />,
      'Enfriado': <Snowflake className="h-6 w-6" />,
      'Control Calidad': <ShieldCheck className="h-6 w-6" />,
      'Despacho': <Send className="h-6 w-6" />
    };
    return iconMap[evento.tipo || ''] || <Activity className="h-6 w-6" />;
  };

  const getEventoColor = () => {
    const colorMap: Record<string, string> = {
      'Inicio Cosecha': 'bg-green-500',
      'Cosecha Completa': 'bg-green-600',
      'Recepción Packing': 'bg-blue-500',
      'Selección': 'bg-yellow-500',
      'Empaque': 'bg-purple-500',
      'Paletizado': 'bg-indigo-500',
      'Enfriado': 'bg-cyan-500',
      'Control Calidad': 'bg-orange-500',
      'Despacho': 'bg-red-500'
    };
    return colorMap[evento.tipo || ''] || 'bg-gray-500';
  };

  const renderDatosEspecificos = () => {
    if (!evento.datos_adicionales) {
      return (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h4 className="font-semibold text-gray-800 mb-2">Datos del Evento</h4>
          <p className="text-gray-600 text-sm">No hay datos adicionales registrados para este evento.</p>
        </div>
      )
    }

    const datos = evento.datos_adicionales

    switch (evento.tipo) {
      case 'Inicio Cosecha':
        return (
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <h4 className="font-semibold text-green-800 mb-3 flex items-center">
              <Scissors className="h-5 w-5 mr-2" />
              Detalles del Inicio de Cosecha
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {datos.turno && (
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Turno</p>
                    <p className="font-medium text-gray-900 capitalize">{datos.turno}</p>
                  </div>
                </div>
              )}
              {datos.temperatura_ambiente && (
                <div className="flex items-center space-x-2">
                  <Thermometer className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Temperatura Ambiente</p>
                    <p className="font-medium text-gray-900">{datos.temperatura_ambiente}°C</p>
                  </div>
                </div>
              )}
              {datos.humedad_relativa && (
                <div className="flex items-center space-x-2">
                  <Info className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Humedad Relativa</p>
                    <p className="font-medium text-gray-900">{datos.humedad_relativa}%</p>
                  </div>
                </div>
              )}
            </div>
            
            {datos.observaciones && (
              <div className="mt-4 p-3 bg-white rounded border">
                <p className="text-sm text-gray-600 mb-1 font-medium">Observaciones</p>
                <p className="text-gray-900 text-sm">{datos.observaciones}</p>
              </div>
            )}
          </div>
        )

      case 'Enfriado':
        return (
          <div className="bg-cyan-50 rounded-lg p-4 border border-cyan-200">
            <h4 className="font-semibold text-cyan-800 mb-3 flex items-center">
              <Snowflake className="h-5 w-5 mr-2" />
              Detalles del Enfriado
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              {datos.camara_frigorifica && (
                <div className="flex items-center space-x-2">
                  <Package className="h-4 w-4 text-cyan-600" />
                  <div>
                    <p className="text-sm text-gray-600">Cámara Frigorífica</p>
                    <p className="font-medium text-gray-900">{datos.camara_frigorifica}</p>
                  </div>
                </div>
              )}
              {datos.temperatura_inicial && (
                <div className="flex items-center space-x-2">
                  <Thermometer className="h-4 w-4 text-cyan-600" />
                  <div>
                    <p className="text-sm text-gray-600">Temperatura Inicial</p>
                    <p className="font-medium text-gray-900">{datos.temperatura_inicial}°C</p>
                  </div>
                </div>
              )}
              {datos.temperatura_objetivo && (
                <div className="flex items-center space-x-2">
                  <Thermometer className="h-4 w-4 text-cyan-600" />
                  <div>
                    <p className="text-sm text-gray-600">Temperatura Objetivo</p>
                    <p className="font-medium text-gray-900">{datos.temperatura_objetivo}°C</p>
                  </div>
                </div>
              )}
              {datos.tiempo_enfriado_horas && (
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-cyan-600" />
                  <div>
                    <p className="text-sm text-gray-600">Tiempo de Enfriado</p>
                    <p className="font-medium text-gray-900">{datos.tiempo_enfriado_horas} horas</p>
                  </div>
                </div>
              )}
              {datos.humedad_relativa_porcentaje && (
                <div className="flex items-center space-x-2">
                  <Info className="h-4 w-4 text-cyan-600" />
                  <div>
                    <p className="text-sm text-gray-600">Humedad Relativa</p>
                    <p className="font-medium text-gray-900">{datos.humedad_relativa_porcentaje}%</p>
                  </div>
                </div>
              )}
              {datos.responsable_camara && (
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-cyan-600" />
                  <div>
                    <p className="text-sm text-gray-600">Responsable Cámara</p>
                    <p className="font-medium text-gray-900">{datos.responsable_camara}</p>
                  </div>
                </div>
              )}
            </div>

            {(datos.sistema_control || datos.velocidad_ventilacion || datos.presion_atmosferica) && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {datos.sistema_control && (
                  <div className="bg-white p-3 rounded border text-center">
                    <p className="text-xs text-gray-600">Sistema Control</p>
                    <p className="font-bold text-cyan-800">{datos.sistema_control}</p>
                  </div>
                )}
                {datos.velocidad_ventilacion && (
                  <div className="bg-white p-3 rounded border text-center">
                    <p className="text-xs text-gray-600">Ventilación</p>
                    <p className="font-bold text-cyan-800">{datos.velocidad_ventilacion} m/s</p>
                  </div>
                )}
                {datos.presion_atmosferica && (
                  <div className="bg-white p-3 rounded border text-center">
                    <p className="text-xs text-gray-600">Presión</p>
                    <p className="font-bold text-cyan-800">{datos.presion_atmosferica} hPa</p>
                  </div>
                )}
              </div>
            )}

            {datos.observaciones && (
              <div className="p-3 bg-white rounded border">
                <p className="text-sm text-gray-600 mb-1 font-medium">Observaciones</p>
                <p className="text-gray-900 text-sm">{datos.observaciones}</p>
              </div>
            )}
          </div>
        )

      case 'Control Calidad':
        return (
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
            <h4 className="font-semibold text-orange-800 mb-3 flex items-center">
              <ShieldCheck className="h-5 w-5 mr-2" />
              Detalles del Control de Calidad
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {datos.inspector_calidad && (
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-orange-600" />
                  <div>
                    <p className="text-sm text-gray-600">Inspector de Calidad</p>
                    <p className="font-medium text-gray-900">{datos.inspector_calidad}</p>
                  </div>
                </div>
              )}
              {datos.certificacion && (
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-orange-600" />
                  <div>
                    <p className="text-sm text-gray-600">Certificación</p>
                    <p className="font-medium text-gray-900">{datos.certificacion}</p>
                  </div>
                </div>
              )}
              {datos.muestra_analizada_kg && (
                <div className="flex items-center space-x-2">
                  <Scale className="h-4 w-4 text-orange-600" />
                  <div>
                    <p className="text-sm text-gray-600">Muestra Analizada</p>
                    <p className="font-medium text-gray-900">{datos.muestra_analizada_kg} kg</p>
                  </div>
                </div>
              )}
              {datos.resultado_general && (
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-orange-600" />
                  <div>
                    <p className="text-sm text-gray-600">Resultado General</p>
                    <p className={`font-medium ${datos.resultado_general === 'Aprobado' ? 'text-green-700' : 'text-red-700'}`}>
                      {datos.resultado_general}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {datos.parametros_evaluados && (
              <div className="mb-4">
                <h5 className="font-medium text-orange-800 mb-3">Parámetros Evaluados</h5>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                     {Object.entries(datos.parametros_evaluados).map(([key, value]) => (
                     <div key={key} className="bg-white p-3 rounded border text-center">
                       <p className="text-xs text-gray-600 capitalize">{key.replace('_', ' ')}</p>
                       <p className="font-bold text-orange-800">{String(value)}</p>
                     </div>
                   ))}
                </div>
              </div>
            )}

            {datos.certificado_calidad && (
              <div className="p-3 bg-white rounded border">
                <p className="text-sm text-gray-600 mb-1 font-medium">Certificado de Calidad</p>
                <p className="text-gray-900 text-sm font-mono">{datos.certificado_calidad}</p>
              </div>
            )}
          </div>
        )

      case 'Selección':
        return (
          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <h4 className="font-semibold text-yellow-800 mb-3 flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Detalles de Selección
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {datos.linea_seleccion && (
                <div className="flex items-center space-x-2">
                  <Info className="h-4 w-4 text-yellow-600" />
                  <div>
                    <p className="text-sm text-gray-600">Línea de Selección</p>
                    <p className="font-medium text-gray-900">{datos.linea_seleccion}</p>
                  </div>
                </div>
              )}
              {datos.turno && (
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  <div>
                    <p className="text-sm text-gray-600">Turno</p>
                    <p className="font-medium text-gray-900 capitalize">{datos.turno}</p>
                  </div>
                </div>
              )}
              {datos.peso_entrada_kg && (
                <div className="flex items-center space-x-2">
                  <Scale className="h-4 w-4 text-yellow-600" />
                  <div>
                    <p className="text-sm text-gray-600">Peso de Entrada</p>
                    <p className="font-medium text-gray-900">{datos.peso_entrada_kg} kg</p>
                  </div>
                </div>
              )}
              {datos.peso_descarte_kg && (
                <div className="flex items-center space-x-2">
                  <Scale className="h-4 w-4 text-yellow-600" />
                  <div>
                    <p className="text-sm text-gray-600">Peso de Descarte</p>
                    <p className="font-medium text-gray-900">{datos.peso_descarte_kg} kg</p>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              {datos.porcentaje_categoria_1 && (
                <div className="bg-white p-3 rounded border text-center">
                  <p className="text-xs text-gray-600">Categoría 1</p>
                  <p className="font-bold text-yellow-800">{datos.porcentaje_categoria_1}%</p>
                </div>
              )}
              {datos.porcentaje_categoria_2 && (
                <div className="bg-white p-3 rounded border text-center">
                  <p className="text-xs text-gray-600">Categoría 2</p>
                  <p className="font-bold text-yellow-800">{datos.porcentaje_categoria_2}%</p>
                </div>
              )}
              {datos.porcentaje_descarte && (
                <div className="bg-white p-3 rounded border text-center">
                  <p className="text-xs text-gray-600">Descarte</p>
                  <p className="font-bold text-red-700">{datos.porcentaje_descarte}%</p>
                </div>
              )}
              {datos.eficiencia_linea && (
                <div className="bg-white p-3 rounded border text-center">
                  <p className="text-xs text-gray-600">Eficiencia</p>
                  <p className="font-bold text-green-700">{datos.eficiencia_linea}%</p>
                </div>
              )}
            </div>

            {datos.operarios_seleccion && datos.operarios_seleccion.length > 0 && (
              <div className="mb-4">
                <h5 className="font-medium text-yellow-800 mb-2 flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Operarios de Selección
                </h5>
                <div className="flex flex-wrap gap-2">
                  {datos.operarios_seleccion.map((operario: string, index: number) => (
                    <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {operario}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {datos.observaciones && (
              <div className="p-3 bg-white rounded border">
                <p className="text-sm text-gray-600 mb-1 font-medium">Observaciones</p>
                <p className="text-gray-900 text-sm">{datos.observaciones}</p>
              </div>
            )}
          </div>
        )

      case 'Cosecha Completa':
      case 'Recepción Packing':
      case 'Empaque':
        return (
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
              {getEventoIcon()}
              <span className="ml-2">Detalles de {evento.tipo}</span>
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              {datos.turno && (
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600">Turno</p>
                    <p className="font-medium text-gray-900 capitalize">{datos.turno}</p>
                  </div>
                </div>
              )}
              {datos.temperatura_ambiente && (
                <div className="flex items-center space-x-2">
                  <Thermometer className="h-4 w-4 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600">Temperatura</p>
                    <p className="font-medium text-gray-900">{datos.temperatura_ambiente}°C</p>
                  </div>
                </div>
              )}
              {datos.humedad_relativa && (
                <div className="flex items-center space-x-2">
                  <Info className="h-4 w-4 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600">Humedad</p>
                    <p className="font-medium text-gray-900">{datos.humedad_relativa}%</p>
                  </div>
                </div>
              )}
            </div>

            {Object.entries(datos)
              .filter(([key]) => !['turno', 'temperatura_ambiente', 'humedad_relativa', 'operario_nombre', 'observaciones'].includes(key))
              .length > 0 && (
              <div className="mb-4">
                <h5 className="font-medium text-gray-800 mb-2">Información Adicional</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(datos)
                    .filter(([key]) => !['turno', 'temperatura_ambiente', 'humedad_relativa', 'operario_nombre', 'observaciones'].includes(key))
                    .map(([key, value]) => (
                      <div key={key} className="bg-white p-3 rounded border">
                        <p className="text-xs text-gray-600 capitalize">{key.replace(/_/g, ' ')}</p>
                        {renderDetalleValor(value)}
                      </div>
                    ))}
                </div>
              </div>
            )}

            {datos.observaciones && (
              <div className="p-3 bg-white rounded border">
                <p className="text-sm text-gray-600 mb-1 font-medium">Observaciones</p>
                <p className="text-gray-900 text-sm">{datos.observaciones}</p>
              </div>
            )}
          </div>
        )

      case 'Paletizado':
        return (
          <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
            <h4 className="font-semibold text-indigo-800 mb-3 flex items-center">
              <Grid3X3 className="h-5 w-5 mr-2" />
              Detalles del Paletizado
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              {Object.entries(datos)
                .filter(([key, value]) => typeof value !== 'object' && value !== null)
                .map(([key, value]) => (
                  <div key={key} className="bg-white p-3 rounded border">
                    <p className="text-xs text-gray-600 capitalize">{key.replace(/_/g, ' ')}</p>
                    <p className="font-medium text-gray-900">{String(value)}</p>
                  </div>
                ))}
            </div>

            {datos.resumen_pallets && (
              <div className="mb-4">
                <h5 className="font-medium text-indigo-800 mb-2">Resumen de Pallets Generados</h5>
                <div className="bg-white p-3 rounded border">
                  <pre className="text-xs text-gray-700 overflow-auto max-h-48">
                    {JSON.stringify(datos.resumen_pallets, null, 2)}
                  </pre>
                </div>
              </div>
            )}
            
            {datos.observaciones_paletizado && (
              <div className="p-3 bg-white rounded border">
                <p className="text-sm text-gray-600 mb-1 font-medium">Observaciones</p>
                <p className="text-gray-900 text-sm">{datos.observaciones_paletizado}</p>
              </div>
            )}
          </div>
        )

      case 'Despacho':
        return (
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
              {getEventoIcon()}
              <span className="ml-2">Detalles de {evento.tipo}</span>
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              {datos.turno && (
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600">Turno</p>
                    <p className="font-medium text-gray-900 capitalize">{datos.turno}</p>
                  </div>
                </div>
              )}
              {datos.temperatura_ambiente && (
                <div className="flex items-center space-x-2">
                  <Thermometer className="h-4 w-4 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600">Temperatura</p>
                    <p className="font-medium text-gray-900">{datos.temperatura_ambiente}°C</p>
                  </div>
                </div>
              )}
              {datos.humedad_relativa && (
                <div className="flex items-center space-x-2">
                  <Info className="h-4 w-4 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600">Humedad</p>
                    <p className="font-medium text-gray-900">{datos.humedad_relativa}%</p>
                  </div>
                </div>
              )}
            </div>

            {Object.entries(datos)
              .filter(([key]) => !['turno', 'temperatura_ambiente', 'humedad_relativa', 'operario_nombre', 'observaciones'].includes(key))
              .length > 0 && (
              <div className="mb-4">
                <h5 className="font-medium text-gray-800 mb-2">Información Adicional</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(datos)
                    .filter(([key]) => !['turno', 'temperatura_ambiente', 'humedad_relativa', 'operario_nombre', 'observaciones'].includes(key))
                    .map(([key, value]) => (
                      <div key={key} className="bg-white p-3 rounded border">
                        <p className="text-xs text-gray-600 capitalize">{key.replace(/_/g, ' ')}</p>
                        {renderDetalleValor(value)}
                      </div>
                    ))}
                </div>
              </div>
            )}

            {datos.observaciones && (
              <div className="p-3 bg-white rounded border">
                <p className="text-sm text-gray-600 mb-1 font-medium">Observaciones</p>
                <p className="text-gray-900 text-sm">{datos.observaciones}</p>
              </div>
            )}
          </div>
        )

      default:
        return (
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h4 className="font-semibold text-gray-800 mb-3">Datos Adicionales</h4>
            <pre className="text-sm text-gray-700 bg-white p-3 rounded border overflow-auto max-h-64">
              {JSON.stringify(datos, null, 2)}
            </pre>
          </div>
        )
    }
  }
  
  const renderDetalleValor = (valor: any) => {
    if (typeof valor === 'object' && valor !== null) {
      return (
        <pre className="text-xs bg-gray-100 p-2 rounded mt-1 font-mono">
          {JSON.stringify(valor, null, 2)}
        </pre>
      );
    }
    return <p className="font-medium text-gray-900">{String(valor)}</p>;
  };

  const fechaFormateada = evento.fecha ? formatearFecha(evento.fecha) : null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className={`${getEventoColor()} text-white p-6`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                {getEventoIcon()}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{evento.tipo || 'Evento'}</h2>
                <p className="text-white/80">Detalles completos del evento</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl font-bold p-1"
              title="Cerrar modal"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="h-5 w-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Fecha y Hora</h3>
              </div>
              {fechaFormateada ? (
                <div>
                  <p className="font-medium text-gray-900">{fechaFormateada.fecha}</p>
                  <p className="text-sm text-gray-600">{fechaFormateada.hora}</p>
                </div>
              ) : (
                <p className="text-gray-500">No disponible</p>
              )}
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <User className="h-5 w-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Responsable</h3>
              </div>
              <p className="font-medium text-gray-900">
                {getResponsableEvento(evento)}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Hash className="h-5 w-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">ID Evento</h3>
              </div>
              <p className="font-mono text-sm text-gray-900">
                {getIdEvento(evento)}
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Descripción</h3>
            <p className="text-gray-700 leading-relaxed">{evento.descripcion || 'Sin descripción disponible'}</p>
          </div>

          {renderDatosEspecificos()}
        </div>

        <div className="p-6 border-t bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
} 