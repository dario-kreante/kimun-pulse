import React, { useState } from 'react'
import { 
  Scissors, CheckCircle, Truck, Filter, Package, Grid3X3, 
  Snowflake, ShieldCheck, Send, Activity, User, Hash, Plus, Clock 
} from 'lucide-react'
import ModalDetallesEvento from './ModalDetallesEvento'

interface EventoTrazabilidad {
  id?: string
  tipo?: string
  descripcion?: string
  fecha?: string
  responsable_nombre?: string
  datos_adicionales?: any
}

interface TrazabilidadTimelineProps {
  eventos: EventoTrazabilidad[]
  loading?: boolean
  titulo?: string
  subtitulo?: string
  entidadId?: string
  tipoEntidad: 'lote' | 'pallet'
  onAgregarEvento?: () => void
  mostrarBotonAgregar?: boolean
  className?: string
}

const TimelineSkeleton = () => (
  <div className="space-y-8 animate-pulse">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="flex space-x-4">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
          {i < 2 && <div className="w-0.5 h-12 bg-gray-200 mt-2"></div>}
        </div>
        <div className="flex-1 pt-2">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    ))}
  </div>
);

export default function TrazabilidadTimeline({
  eventos,
  loading = false,
  titulo = "Trazabilidad",
  subtitulo = "Seguimiento completo del proceso",
  entidadId,
  tipoEntidad,
  onAgregarEvento,
  mostrarBotonAgregar = true,
  className = ""
}: TrazabilidadTimelineProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [eventoSeleccionado, setEventoSeleccionado] = useState<EventoTrazabilidad | null>(null)

  const handleVerDetalles = (evento: any) => {
    // Normalizar el evento para el modal
    const eventoNormalizado = {
      ...evento,
      id: evento.id || evento.evento_id, // Asegurar que el ID esté presente
      responsable_nombre: getResponsableEvento(evento) // Usar la lógica existente para el responsable
    };
    setEventoSeleccionado(eventoNormalizado)
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setEventoSeleccionado(null)
  }

  // Función para obtener el responsable correcto según prioridad
  const getResponsableEvento = (evento: EventoTrazabilidad): string => {
    // Prioridad 1: operario_nombre del formulario (datos_adicionales)
    if (evento.datos_adicionales?.operario_nombre) {
      return evento.datos_adicionales.operario_nombre
    }
    
    // Prioridad 2: responsable_nombre directo
    if (evento.responsable_nombre) {
      return evento.responsable_nombre
    }
    
    // Prioridad 3: responsable_nombre dentro de datos_adicionales (algunos eventos lo tienen ahí)
    if (evento.datos_adicionales?.responsable_nombre) {
      return evento.datos_adicionales.responsable_nombre
    }
    
    // Fallback
    return 'Sin responsable'
  }

  // Función para obtener el ID del evento formateado
  const getIdEvento = (evento: EventoTrazabilidad): string => {
    if (!evento.id) return 'N/A'
    
    // Para IDs largos (UUIDs), mostrar los últimos 8 caracteres
    if (evento.id.length > 12) {
      return evento.id.slice(-8)
    }
    
    // Para IDs cortos, mostrar completo
    return evento.id
  }

  // Mapeo de iconos por tipo de evento
  const getEventoIcon = (tipo: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      'Inicio Cosecha': <Scissors className="h-5 w-5" />,
      'Cosecha Completa': <CheckCircle className="h-5 w-5" />,
      'Recepción Packing': <Truck className="h-5 w-5" />,
      'Selección': <Filter className="h-5 w-5" />,
      'Empaque': <Package className="h-5 w-5" />,
      'Paletizado': <Grid3X3 className="h-5 w-5" />,
      'Enfriado': <Snowflake className="h-5 w-5" />,
      'Control Calidad': <ShieldCheck className="h-5 w-5" />,
      'Despacho': <Send className="h-5 w-5" />
    };
    return iconMap[tipo] || <Activity className="h-5 w-5" />;
  };

  // Color por tipo de evento
  const getEventoColor = (tipo: string) => {
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
    return colorMap[tipo] || 'bg-gray-500';
  };

  // Calcular progreso para lotes (pallets tienen flujo diferente)
  const calcularProgreso = () => {
    if (tipoEntidad === 'pallet') {
      // Para pallets, el progreso se basa en eventos post-paletizado
      const eventosPostPaletizado = ['Enfriado', 'Control Calidad', 'Despacho'];
      const eventosCompletados = eventos.filter(e => eventosPostPaletizado.includes(e.tipo || '')).length;
      return {
        completados: eventosCompletados,
        total: 3,
        porcentaje: (eventosCompletados / 3) * 100
      };
    } else {
      // Para lotes, progreso tradicional de 9 etapas
      return {
        completados: eventos.length,
        total: 9,
        porcentaje: (eventos.length / 9) * 100
      };
    }
  };

  const progreso = calcularProgreso();

  if (loading) {
    return (
      <div className={`bg-white p-6 rounded-lg border border-gray-200 ${className}`}>
        {titulo && <h3 className="text-lg font-semibold text-gray-900 mb-4">{titulo}</h3>}
        <TimelineSkeleton />
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{titulo}</h3>
          <p className="text-sm text-gray-500">{subtitulo}</p>
        </div>
        {eventos.length > 0 && (
          <div className="text-right">
            <p className="text-sm text-gray-500">Total de eventos</p>
            <p className="text-lg font-semibold text-cultivo-600">{eventos.length}</p>
          </div>
        )}
      </div>

      <div className="p-6">
        {eventos.length === 0 ? (
          /* Estado vacío */
          <div className="text-center py-12">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Clock className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Sin eventos registrados</h3>
            <p className="text-gray-500 mb-4">
              {tipoEntidad === 'pallet' 
                ? 'Inicia la trazabilidad del pallet agregando el primer evento.'
                : 'Inicia la trazabilidad agregando el primer evento del proceso.'
              }
            </p>
            {mostrarBotonAgregar && onAgregarEvento && (
              <button
                onClick={onAgregarEvento}
                className="bg-cultivo-600 hover:bg-cultivo-700 text-white px-4 py-2 rounded-lg transition-colors inline-flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Registrar Primer Evento</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Indicador de progreso */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Progreso del Proceso</span>
                <span>{progreso.completados}/{progreso.total} etapas completadas</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-cultivo-500 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${progreso.porcentaje}%` }}
                ></div>
              </div>
            </div>

            {/* Timeline de eventos */}
            <div className="relative">
              {/* Línea de tiempo vertical */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
              
              {eventos.map((evento, index) => {
                const fechaEvento = evento.fecha ? new Date(evento.fecha) : null;
                const esEventoReciente = index === 0;
                const responsableEvento = getResponsableEvento(evento);
                const idEvento = getIdEvento(evento);

                return (
                  <div key={evento.id || index} className="relative pb-8 last:pb-0">
                    {/* Icono del evento */}
                    <div className={`relative z-10 w-12 h-12 ${getEventoColor(evento.tipo ?? 'Inicio Cosecha')} rounded-full flex items-center justify-center text-white shadow-lg ${esEventoReciente ? 'ring-4 ring-cultivo-100' : ''}`}>
                      {getEventoIcon(evento.tipo ?? 'Inicio Cosecha')}
                    </div>
                    
                    {/* Contenido del evento */}
                    <div className="ml-16 -mt-12 pt-3">
                      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900 text-lg">{evento.tipo ?? 'Sin tipo'}</h4>
                            {esEventoReciente && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-cultivo-100 text-cultivo-800 mt-1">
                                Más reciente
                              </span>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">
                              {fechaEvento ? fechaEvento.toLocaleDateString('es-CL', { 
                                weekday: 'short',
                                day: 'numeric', 
                                month: 'short',
                                year: 'numeric'
                              }) : '-'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {fechaEvento ? fechaEvento.toLocaleTimeString('es-CL', {
                                hour: '2-digit',
                                minute: '2-digit'
                              }) : '-'}
                            </p>
                          </div>
                        </div>
                        
                        <p className="text-gray-700 mb-3 leading-relaxed">{evento.descripcion}</p>
                        
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-4 text-gray-500">
                            <div className="flex items-center space-x-1">
                              <User className="h-4 w-4" />
                              <span>{responsableEvento}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Hash className="h-4 w-4" />
                              <span className="font-mono text-xs">{idEvento}</span>
                            </div>
                          </div>
                          {evento.datos_adicionales && (
                            <button 
                              onClick={() => handleVerDetalles(evento)}
                              className="text-cultivo-600 hover:text-cultivo-700 text-xs font-medium transition-colors"
                            >
                              Ver detalles
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>


          </div>
        )}
      </div>

      {/* Modal de detalles del evento */}
      <ModalDetallesEvento
        isOpen={modalOpen}
        evento={eventoSeleccionado}
        onClose={handleCloseModal}
      />
    </div>
  );
} 