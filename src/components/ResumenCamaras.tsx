import React, { useState, useEffect } from 'react'
import { 
  Snowflake, 
  Thermometer, 
  CheckCircle, 
  AlertTriangle, 
  Wrench,
  Settings,
  Eye
} from 'lucide-react'
import gestionCamarasService from '../services/gestionCamarasService'
import inventarioService from '../services/inventarioService'
import { CamaraFrigorifica, InventarioCamara } from '../types/inventario'

interface ResumenCamarasProps {
  onVerMas?: () => void
}

export default function ResumenCamaras({ onVerMas }: ResumenCamarasProps) {
  const [camaras, setCamaras] = useState<CamaraFrigorifica[]>([])
  const [inventarios, setInventarios] = useState<InventarioCamara[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      setCargando(true)
      setError(null)
      
      const camarasData = await gestionCamarasService.obtenerCamarasDisponibles()
      setCamaras(camarasData)
      
      // Obtener inventarios para cada cámara activa
      const camarasActivas = camarasData.filter(c => c.estado_operativo === 'activa')
      const inventariosData = await Promise.all(
        camarasActivas.map(camara => inventarioService.obtenerInventarioCamara(camara.id))
      )
      
      setInventarios(inventariosData)
    } catch (err) {
      setError('Error al cargar datos de cámaras')
      console.error(err)
    } finally {
      setCargando(false)
    }
  }

  const getIconoEstado = (estado: string) => {
    switch (estado) {
      case 'activa': return <CheckCircle className="h-4 w-4 text-cultivo-600" />
      case 'mantenimiento': return <Wrench className="h-4 w-4 text-yellow-600" />
      case 'inactiva': return <AlertTriangle className="h-4 w-4 text-red-600" />
      default: return <Settings className="h-4 w-4 text-gray-600" />
    }
  }

  // Calcular métricas
  const totalCamaras = camaras.length
  const camarasActivas = camaras.filter(c => c.estado_operativo === 'activa').length
  const capacidadTotal = camaras.reduce((sum, c) => sum + c.capacidad_maxima_kg, 0)
  const ocupacionTotal = inventarios.reduce((sum, inv) => sum + inv.peso_total_actual_kg, 0)
  const porcentajeOcupacion = capacidadTotal > 0 ? (ocupacionTotal / capacidadTotal) * 100 : 0

  if (cargando) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-cultivo-100 rounded-lg">
            <Snowflake className="h-5 w-5 text-cultivo-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Resumen de Cámaras</h3>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin h-6 w-6 border-2 border-cultivo-600 border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Cargando datos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-red-100 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Resumen de Cámaras</h3>
        </div>
        <div className="text-center py-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-cultivo-100 rounded-lg">
            <Snowflake className="h-5 w-5 text-cultivo-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Resumen de Cámaras</h3>
        </div>
        {onVerMas && (
          <button
            onClick={onVerMas}
            className="flex items-center space-x-1 text-cultivo-600 hover:text-cultivo-700 text-sm font-medium transition-colors"
          >
            <span>Ver más</span>
            <Eye className="h-4 w-4" />
          </button>
        )}
      </div>

      {totalCamaras === 0 ? (
        <div className="text-center py-8">
          <Snowflake className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600">No hay cámaras configuradas</p>
          {onVerMas && (
            <button
              onClick={onVerMas}
              className="mt-3 text-cultivo-600 hover:text-cultivo-700 text-sm font-medium"
            >
              Crear primera cámara
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-cultivo-600">{totalCamaras}</div>
              <div className="text-xs text-gray-600">Total Cámaras</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{camarasActivas}</div>
              <div className="text-xs text-gray-600">Activas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-lima-600">
                {Math.round(porcentajeOcupacion)}%
              </div>
              <div className="text-xs text-gray-600">Ocupación</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {(capacidadTotal / 1000).toFixed(0)}t
              </div>
              <div className="text-xs text-gray-600">Capacidad</div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Ocupación total</span>
              <span>{ocupacionTotal.toLocaleString()} kg / {capacidadTotal.toLocaleString()} kg</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-cultivo-500 to-lima-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(porcentajeOcupacion, 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Estado por Cámara</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {camaras.slice(0, 6).map((camara) => {
                const inventario = inventarios.find(inv => inv.camara_id === camara.id)
                const ocupacion = inventario ? (inventario.peso_total_actual_kg / camara.capacidad_maxima_kg) * 100 : 0
                
                return (
                  <div 
                    key={camara.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {getIconoEstado(camara.estado_operativo)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {camara.nombre}
                        </p>
                        <p className="text-xs text-gray-600">
                          {camara.ubicacion}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 flex-shrink-0">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {Math.round(ocupacion)}%
                        </p>
                        <p className="text-xs text-gray-600">ocupado</p>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Thermometer className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-600">
                          {camara.temperatura_operacion_min}°-{camara.temperatura_operacion_max}°C
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            
            {camaras.length > 6 && (
              <div className="text-center pt-2">
                <button
                  onClick={onVerMas}
                  className="text-cultivo-600 hover:text-cultivo-700 text-sm font-medium"
                >
                  Ver todas las cámaras ({camaras.length})
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
} 