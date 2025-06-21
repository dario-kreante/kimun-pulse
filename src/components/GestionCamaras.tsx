import React, { useState, useEffect, useCallback } from 'react'
import { 
  Thermometer, 
  Droplet, 
  AlertCircle, 
  Clock,
  Eye,
  Settings,
  RefreshCw,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown
} from 'lucide-react'

interface GestionCamarasProps {
  onClose: () => void
}

interface CamaraStatus {
  id: string
  nombre: string
  ubicacion: string
  temperatura_actual: number
  temperatura_objetivo: number
  humedad_actual: number
  humedad_objetivo: number
  estado_operativo: 'activa' | 'mantenimiento' | 'inactiva'
  capacidad_total_kg: number
  capacidad_utilizada_kg: number
  ultimo_control: string
  alertas_activas: number
  lotes_almacenados: number
}

interface AlertaCamara {
  id: string
  camara_id: string
  camara_nombre: string
  tipo: 'temperatura' | 'humedad' | 'capacidad' | 'sistema'
  nivel: 'info' | 'warning' | 'critical'
  mensaje: string
  timestamp: string
}

export default function GestionCamaras({ onClose }: GestionCamarasProps) {
  const [loading, setLoading] = useState(true)
  const [camaras, setCamaras] = useState<CamaraStatus[]>([])
  const [alertas, setAlertas] = useState<AlertaCamara[]>([])
  const [camaraSeleccionada] = useState<string | null>(null)
  const [vistaActual, setVistaActual] = useState<'general' | 'detalle' | 'alertas'>('general')

    const cargarDatos = useCallback(async () => {
    setLoading(true)
    try {
      await Promise.all([
        cargarEstadoCamaras(),
        cargarAlertas()
      ])
    } catch (error) {
      console.error('Error al cargar datos de cámaras:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    cargarDatos()
    // Auto-refresh cada 30 segundos para datos en tiempo real
    const interval = setInterval(cargarDatos, 30000)
    return () => clearInterval(interval)
  }, [cargarDatos])

  const cargarEstadoCamaras = async () => {
    // Simulamos datos de cámaras ya que no tenemos tabla específica
    const camarasDemo: CamaraStatus[] = [
      {
        id: 'CAM-001',
        nombre: 'Cámara Central A',
        ubicacion: 'Edificio Principal - Sector Norte',
        temperatura_actual: -0.5,
        temperatura_objetivo: 0.0,
        humedad_actual: 90.2,
        humedad_objetivo: 90.0,
        estado_operativo: 'activa',
        capacidad_total_kg: 50000,
        capacidad_utilizada_kg: 32450,
        ultimo_control: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        alertas_activas: 0,
        lotes_almacenados: 8
      },
      {
        id: 'CAM-002',
        nombre: 'Cámara Central B',
        ubicacion: 'Edificio Principal - Sector Sur',
        temperatura_actual: 1.2,
        temperatura_objetivo: 0.0,
        humedad_actual: 87.8,
        humedad_objetivo: 90.0,
        estado_operativo: 'activa',
        capacidad_total_kg: 50000,
        capacidad_utilizada_kg: 41200,
        ultimo_control: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
        alertas_activas: 2,
        lotes_almacenados: 12
      },
      {
        id: 'CAM-003',
        nombre: 'Cámara Anexo',
        ubicacion: 'Edificio Anexo',
        temperatura_actual: -0.1,
        temperatura_objetivo: 0.0,
        humedad_actual: 91.5,
        humedad_objetivo: 90.0,
        estado_operativo: 'activa',
        capacidad_total_kg: 30000,
        capacidad_utilizada_kg: 18750,
        ultimo_control: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        alertas_activas: 1,
        lotes_almacenados: 5
      }
    ]

    setCamaras(camarasDemo)
  }

  const cargarAlertas = async () => {
    const alertasDemo: AlertaCamara[] = [
      {
        id: 'ALT-001',
        camara_id: 'CAM-002',
        camara_nombre: 'Cámara Central B',
        tipo: 'temperatura',
        nivel: 'warning',
        mensaje: 'Temperatura por encima del objetivo (1.2°C vs 0.0°C)',
        timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString()
      },
      {
        id: 'ALT-002',
        camara_id: 'CAM-002',
        camara_nombre: 'Cámara Central B',
        tipo: 'humedad',
        nivel: 'info',
        mensaje: 'Humedad ligeramente por debajo del objetivo',
        timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString()
      },
      {
        id: 'ALT-003',
        camara_id: 'CAM-003',
        camara_nombre: 'Cámara Anexo',
        tipo: 'humedad',
        nivel: 'warning',
        mensaje: 'Humedad por encima del objetivo (91.5% vs 90.0%)',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString()
      }
    ]

    setAlertas(alertasDemo)
  }

  const obtenerColorEstado = (estado: string): string => {
    switch (estado) {
      case 'activa': return 'bg-green-100 text-green-800 border-green-200'
      case 'mantenimiento': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'inactiva': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const obtenerColorAlerta = (nivel: string): string => {
    switch (nivel) {
      case 'info': return 'bg-blue-50 border-blue-200 text-blue-800'
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      case 'critical': return 'bg-red-50 border-red-200 text-red-800'
      default: return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  const formatearFecha = (fecha: string): string => {
    return new Date(fecha).toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const calcularPorcentajeUso = (utilizada: number, total: number): number => {
    return Math.round((utilizada / total) * 100)
  }

  const obtenerIconoTendencia = (actual: number, objetivo: number) => {
    if (Math.abs(actual - objetivo) <= 0.2) {
      return <CheckCircle className="w-4 h-4 text-green-500" />
    } else if (actual > objetivo) {
      return <TrendingUp className="w-4 h-4 text-red-500" />
    } else {
      return <TrendingDown className="w-4 h-4 text-blue-500" />
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 flex items-center space-x-4">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-lg">Cargando estado de cámaras...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-7xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-cyan-600 to-blue-600 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Gestión de Cámaras Frigoríficas</h2>
              <p className="text-cyan-100 mt-1">Control en tiempo real de temperatura y humedad</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl font-bold"
            >
              ×
            </button>
          </div>
          
          {/* Navegación */}
          <div className="flex flex-wrap gap-2 mt-4">
            {[
              { key: 'general', label: 'Vista General', icon: Eye },
              { key: 'detalle', label: 'Detalle Cámaras', icon: Settings },
              { key: 'alertas', label: 'Alertas Activas', icon: AlertCircle }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setVistaActual(key as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  vistaActual === key 
                    ? 'bg-white text-cyan-600' 
                    : 'bg-cyan-700 text-white hover:bg-cyan-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto p-6">
          {vistaActual === 'general' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {camaras.map((camara) => (
                <div key={camara.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-800">{camara.nombre}</h3>
                      <p className="text-sm text-gray-600">{camara.ubicacion}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-lg text-sm font-medium border ${obtenerColorEstado(camara.estado_operativo)}`}>
                      {camara.estado_operativo}
                    </span>
                  </div>

                  {/* Métricas principales */}
                  <div className="space-y-4">
                    {/* Temperatura */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Thermometer className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-medium">Temperatura</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-blue-600">{camara.temperatura_actual.toFixed(1)}°C</span>
                        {obtenerIconoTendencia(camara.temperatura_actual, camara.temperatura_objetivo)}
                      </div>
                    </div>

                    {/* Humedad */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Droplet className="w-4 h-4 text-cyan-500" />
                        <span className="text-sm font-medium">Humedad</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-cyan-600">{camara.humedad_actual.toFixed(1)}%</span>
                        {obtenerIconoTendencia(camara.humedad_actual, camara.humedad_objetivo)}
                      </div>
                    </div>

                    {/* Capacidad */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">Capacidad</span>
                        <span className="text-sm text-gray-600">
                          {calcularPorcentajeUso(camara.capacidad_utilizada_kg, camara.capacidad_total_kg)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${calcularPorcentajeUso(camara.capacidad_utilizada_kg, camara.capacidad_total_kg)}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {(camara.capacidad_utilizada_kg / 1000).toFixed(1)}t / {(camara.capacidad_total_kg / 1000).toFixed(1)}t
                      </div>
                    </div>

                    {/* Estado y alertas */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {formatearFecha(camara.ultimo_control)}
                        </span>
                      </div>
                      {camara.alertas_activas > 0 && (
                        <div className="flex items-center space-x-1">
                          <AlertCircle className="w-4 h-4 text-orange-500" />
                          <span className="text-sm font-medium text-orange-600">
                            {camara.alertas_activas}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {vistaActual === 'detalle' && (
            <div className="space-y-6">
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Cámara</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Estado</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Temperatura</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Humedad</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Capacidad</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Lotes</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Último Control</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {camaras.map((camara) => (
                      <tr key={camara.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div>
                            <div className="font-medium text-gray-900">{camara.nombre}</div>
                            <div className="text-sm text-gray-500">{camara.ubicacion}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-1 rounded text-xs font-medium border ${obtenerColorEstado(camara.estado_operativo)}`}>
                            {camara.estado_operativo}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center space-x-1">
                            <span className="font-medium">{camara.temperatura_actual.toFixed(1)}°C</span>
                            {obtenerIconoTendencia(camara.temperatura_actual, camara.temperatura_objetivo)}
                          </div>
                          <div className="text-xs text-gray-500">obj: {camara.temperatura_objetivo.toFixed(1)}°C</div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center space-x-1">
                            <span className="font-medium">{camara.humedad_actual.toFixed(1)}%</span>
                            {obtenerIconoTendencia(camara.humedad_actual, camara.humedad_objetivo)}
                          </div>
                          <div className="text-xs text-gray-500">obj: {camara.humedad_objetivo.toFixed(1)}%</div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="font-medium">
                            {calcularPorcentajeUso(camara.capacidad_utilizada_kg, camara.capacidad_total_kg)}%
                          </div>
                          <div className="text-xs text-gray-500">
                            {(camara.capacidad_utilizada_kg / 1000).toFixed(1)}t / {(camara.capacidad_total_kg / 1000).toFixed(1)}t
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center font-medium">{camara.lotes_almacenados}</td>
                        <td className="px-4 py-3 text-center text-sm text-gray-500">
                          {formatearFecha(camara.ultimo_control)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {vistaActual === 'alertas' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Alertas Activas ({alertas.length})</h3>
              {alertas.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <p className="text-gray-600">No hay alertas activas</p>
                  <p className="text-sm text-gray-500">Todas las cámaras operan dentro de parámetros normales</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {alertas.map((alerta) => (
                    <div
                      key={alerta.id}
                      className={`p-4 rounded-lg border ${obtenerColorAlerta(alerta.nivel)}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <AlertCircle className="w-4 h-4" />
                            <span className="font-medium">{alerta.camara_nombre}</span>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              alerta.nivel === 'critical' ? 'bg-red-100 text-red-700' :
                              alerta.nivel === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {alerta.tipo.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm">{alerta.mensaje}</p>
                          <p className="text-xs opacity-75 mt-1">
                            {formatearFecha(alerta.timestamp)}
                          </p>
                        </div>
                        <button 
                          className="text-gray-400 hover:text-gray-600 ml-4"
                          title="Descartar alerta"
                          aria-label="Descartar alerta"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Actualización automática cada 30 segundos
          </div>
          <div className="flex space-x-3">
            <button
              onClick={cargarDatos}
              className="flex items-center space-x-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
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