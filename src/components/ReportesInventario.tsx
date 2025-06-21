import React, { useState, useEffect } from 'react'
import { 
  Snowflake, 
  Package, 
  AlertCircle, 
  TrendingUp, 
  BarChart3,
  RefreshCw
} from 'lucide-react'
import inventarioService from '../services/inventarioService'
import { 
  ReporteInventarioConsolidado, 
  InventarioCamara, 
  CamaraFrigorifica
} from '../types/inventario'
import { EstadoLote } from '../types/database'

interface ReportesInventarioProps {
  onClose: () => void
}

export default function ReportesInventario({ onClose }: ReportesInventarioProps) {
  const [reporteConsolidado, setReporteConsolidado] = useState<ReporteInventarioConsolidado | null>(null)
  const [camaras, setCamaras] = useState<CamaraFrigorifica[]>([])
  const [camaraSeleccionada, setCamaraSeleccionada] = useState<string>('')
  const [inventarioCamara, setInventarioCamara] = useState<InventarioCamara | null>(null)
  const [loading, setLoading] = useState(true)
  const [vistaActual, setVistaActual] = useState<'consolidado' | 'camaras' | 'estados'>('consolidado')

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    setLoading(true)
    try {
      const [reporte, camarasData] = await Promise.all([
        inventarioService.generarReporteConsolidado(),
        inventarioService.obtenerCamaras()
      ])
      
      setReporteConsolidado(reporte)
      setCamaras(camarasData)
    } catch (error) {
      console.error('Error al cargar datos de inventario:', error)
    } finally {
      setLoading(false)
    }
  }

  const cargarInventarioCamara = async (camaraId: string) => {
    if (!camaraId) {
      setInventarioCamara(null)
      return
    }
    
    try {
      const inventario = await inventarioService.obtenerInventarioCamara(camaraId)
      setInventarioCamara(inventario)
    } catch (error) {
      console.error('Error al cargar inventario de cámara:', error)
    }
  }

  const formatearPeso = (peso: number): string => {
    if (peso >= 1000) {
      return `${(peso / 1000).toFixed(1)}t`
    }
    return `${peso.toLocaleString()}kg`
  }

  const formatearFecha = (fecha: string): string => {
    return new Date(fecha).toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    })
  }

  const obtenerColorEstado = (estado: EstadoLote): string => {
    const colores = {
      'En Cosecha': 'bg-green-100 text-green-800',
      'Cosecha Completa': 'bg-blue-100 text-blue-800',
      'En Packing': 'bg-yellow-100 text-yellow-800',
      'Empacado': 'bg-purple-100 text-purple-800',
      'En Cámara': 'bg-cyan-100 text-cyan-800',
      'Listo Despacho': 'bg-orange-100 text-orange-800',
      'Despachado': 'bg-gray-100 text-gray-800',
      'Eliminado': 'bg-red-100 text-red-800'
    }
    return colores[estado] || 'bg-gray-100 text-gray-800'
  }

  const obtenerColorCalidad = (calidad: string): string => {
    const colores: Record<string, string> = {
      'optimo': 'bg-green-100 text-green-800',
      'bueno': 'bg-blue-100 text-blue-800', 
      'en_observacion': 'bg-yellow-100 text-yellow-800',
      'critico': 'bg-red-100 text-red-800'
    }
    return colores[calidad] || 'bg-gray-100 text-gray-800'
  }

  const obtenerColorAlerta = (nivel: string): string => {
    const colores: Record<string, string> = {
      'info': 'bg-blue-50 border-blue-200 text-blue-800',
      'warning': 'bg-yellow-50 border-yellow-200 text-yellow-800',
      'critical': 'bg-red-50 border-red-200 text-red-800'
    }
    return colores[nivel] || 'bg-gray-50 border-gray-200 text-gray-800'
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 flex items-center space-x-4">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-lg">Generando reportes de inventario...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-7xl max-h-[95vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Reportes de Inventario</h2>
              <p className="text-blue-100 mt-1">Gestión de inventarios y cámaras frigoríficas</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl font-bold"
            >
              ×
            </button>
          </div>
          
          {/* Navegación de vistas */}
          <div className="flex space-x-4 mt-4">
            <button
              onClick={() => setVistaActual('consolidado')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                vistaActual === 'consolidado' 
                  ? 'bg-white text-blue-600' 
                  : 'bg-blue-700 text-white hover:bg-blue-800'
              }`}
            >
              <BarChart3 className="w-4 h-4 inline mr-2" />
              Reporte Consolidado
            </button>
            <button
              onClick={() => setVistaActual('camaras')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                vistaActual === 'camaras' 
                  ? 'bg-white text-blue-600' 
                  : 'bg-blue-700 text-white hover:bg-blue-800'
              }`}
            >
              <Snowflake className="w-4 h-4 inline mr-2" />
              Inventario Cámaras
            </button>
            <button
              onClick={() => setVistaActual('estados')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                vistaActual === 'estados' 
                  ? 'bg-white text-blue-600' 
                  : 'bg-blue-700 text-white hover:bg-blue-800'
              }`}
            >
              <Package className="w-4 h-4 inline mr-2" />
              Por Estado
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {vistaActual === 'consolidado' && reporteConsolidado && (
            <div className="space-y-6">
              {/* Resumen Global */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                  Resumen Global
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {reporteConsolidado.resumen_global.total_lotes}
                    </div>
                    <div className="text-sm text-gray-600">Total Lotes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {formatearPeso(reporteConsolidado.resumen_global.peso_total_kg)}
                    </div>
                    <div className="text-sm text-gray-600">Peso Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {reporteConsolidado.resumen_global.area_total_hectareas}ha
                    </div>
                    <div className="text-sm text-gray-600">Área Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-cyan-600">
                      {formatearPeso(reporteConsolidado.resumen_global.capacidad_frigorifica_total)}
                    </div>
                    <div className="text-sm text-gray-600">Capacidad Frío</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {formatearPeso(reporteConsolidado.resumen_global.capacidad_frigorifica_utilizada)}
                    </div>
                    <div className="text-sm text-gray-600">Frío Utilizado</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-600">
                      {reporteConsolidado.resumen_global.eficiencia_operativa.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Eficiencia</div>
                  </div>
                </div>
              </div>

              {/* Alertas Activas */}
              {reporteConsolidado.alertas_activas.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2 text-red-500" />
                    Alertas Activas ({reporteConsolidado.alertas_activas.length})
                  </h3>
                  <div className="space-y-3">
                    {reporteConsolidado.alertas_activas.slice(0, 5).map((alerta) => (
                      <div
                        key={alerta.id}
                        className={`p-3 rounded-lg border ${obtenerColorAlerta(alerta.nivel)}`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">{alerta.mensaje}</div>
                            <div className="text-sm opacity-75">
                              {alerta.tipo} · {formatearFecha(alerta.fecha_creacion)}
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            alerta.nivel === 'critical' ? 'bg-red-100 text-red-700' :
                            alerta.nivel === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {alerta.nivel.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recomendaciones */}
              {reporteConsolidado.recomendaciones.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
                    Recomendaciones Operativas
                  </h3>
                  <ul className="space-y-2">
                    {reporteConsolidado.recomendaciones.map((rec, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {vistaActual === 'camaras' && (
            <div className="space-y-6">
              {/* Selector de Cámara */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Snowflake className="w-5 h-5 mr-2 text-cyan-500" />
                  Seleccionar Cámara Frigorífica
                </h3>
                                 <select
                   value={camaraSeleccionada}
                   onChange={(e) => {
                     setCamaraSeleccionada(e.target.value)
                     cargarInventarioCamara(e.target.value)
                   }}
                   className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                   aria-label="Seleccionar cámara frigorífica"
                 >
                  <option value="">Seleccione una cámara frigorífica</option>
                  {camaras.map((camara) => (
                    <option key={camara.id} value={camara.id}>
                      {camara.nombre} - {camara.ubicacion}
                      {camara.estado_operativo !== 'activa' && ` (${camara.estado_operativo})`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Información de la Cámara */}
              {inventarioCamara && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      {inventarioCamara.camara_nombre}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-cyan-600">
                          {inventarioCamara.capacidad_utilizada_porcentaje.toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-600">Capacidad Utilizada</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {formatearPeso(inventarioCamara.peso_total_actual_kg)}
                        </div>
                        <div className="text-sm text-gray-600">Peso Actual</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {inventarioCamara.temperatura_actual.toFixed(1)}°C
                        </div>
                        <div className="text-sm text-gray-600">Temperatura</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {inventarioCamara.humedad_actual.toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-600">Humedad</div>
                      </div>
                    </div>
                  </div>

                  {/* Lotes en Cámara */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <Package className="w-5 h-5 mr-2 text-orange-500" />
                      Lotes Almacenados ({inventarioCamara.lotes_almacenados.length})
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full table-auto">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Lote</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Cultivo/Variedad</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Peso</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Días en Cámara</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Estado Calidad</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Temp. Objetivo</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {inventarioCamara.lotes_almacenados.map((lote) => (
                            <tr key={lote.lote_id} className="hover:bg-gray-50">
                              <td className="px-4 py-2 text-sm text-gray-900 font-medium">{lote.lote_id}</td>
                              <td className="px-4 py-2 text-sm text-gray-700">
                                {lote.cultivo} - {lote.variedad}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-700">{formatearPeso(lote.peso_kg)}</td>
                              <td className="px-4 py-2 text-sm text-gray-700">{lote.dias_en_camara} días</td>
                              <td className="px-4 py-2">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${obtenerColorCalidad(lote.estado_calidad)}`}>
                                  {lote.estado_calidad.replace('_', ' ')}
                                </span>
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-700">{lote.temperatura_objetivo.toFixed(1)}°C</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {vistaActual === 'estados' && reporteConsolidado && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reporteConsolidado.inventario_por_estado.map((estado) => (
                  <div key={estado.estado} className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className={`px-3 py-1 rounded-lg text-sm font-medium ${obtenerColorEstado(estado.estado)}`}>
                        {estado.estado}
                      </span>
                      <span className="text-2xl font-bold text-gray-800">{estado.cantidad_lotes}</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Peso Total:</span>
                        <span className="text-sm font-medium">{formatearPeso(estado.peso_total_kg)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Área Total:</span>
                        <span className="text-sm font-medium">{estado.area_total_hectareas}ha</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Cultivos:</span>
                        <span className="text-sm font-medium">{estado.cultivos_involucrados.length}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t bg-gray-50 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {reporteConsolidado && (
              <>Último reporte: {formatearFecha(reporteConsolidado.fecha_generacion)}</>
            )}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={cargarDatos}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Actualizar</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 