import React, { useState, useEffect } from 'react'
import { X, Plus, Settings, Eye, Snowflake, Thermometer, AlertTriangle, CheckCircle, Wrench, Package } from 'lucide-react'
import { CamaraFrigorifica } from '../types/inventario'
import gestionCamarasService from '../services/gestionCamarasService'

interface ModalGestionCamarasProps {
  onClose: () => void
  onCamaraCreada?: (camara: CamaraFrigorifica) => void
}

type Vista = 'lista' | 'crear' | 'editar' | 'detalle'

export default function ModalGestionCamaras({ onClose, onCamaraCreada }: ModalGestionCamarasProps) {
  const [vista, setVista] = useState<Vista>('lista')
  const [camaras, setCamaras] = useState<CamaraFrigorifica[]>([])
  const [camaraSeleccionada, setCamaraSeleccionada] = useState<CamaraFrigorifica | null>(null)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Estados para formulario de nueva cámara
  const [formularioCamara, setFormularioCamara] = useState({
    nombre: '',
    capacidad_maxima_kg: 20000,
    temperatura_operacion_min: 0,
    temperatura_operacion_max: 4,
    humedad_optima_porcentaje: 90,
    tipo_control: 'automatico' as 'automatico' | 'manual' | 'mixto',
    ubicacion: '',
    responsable: ''
  })

  useEffect(() => {
    cargarCamaras()
  }, [])

  const cargarCamaras = async () => {
    try {
      setCargando(true)
      const camarasObtenidas = await gestionCamarasService.obtenerCamarasDisponibles()
      setCamaras(camarasObtenidas)
    } catch (err) {
      setError('Error al cargar las cámaras frigoríficas')
      console.error(err)
    } finally {
      setCargando(false)
    }
  }

  const crearCamara = async () => {
    try {
      setCargando(true)
      setError(null)
      
      const nuevaCamara = await gestionCamarasService.crearCamaraFrigorifica({
        ...formularioCamara,
        estado_operativo: 'activa',
        ultima_revision: new Date().toISOString()
      })
      
      setCamaras(prev => [...prev, nuevaCamara])
      onCamaraCreada?.(nuevaCamara)
      setVista('lista')
      resetFormulario()
      
    } catch (err: any) {
      setError(err.message || 'Error al crear la cámara frigorífica')
    } finally {
      setCargando(false)
    }
  }

  const resetFormulario = () => {
    setFormularioCamara({
      nombre: '',
      capacidad_maxima_kg: 20000,
      temperatura_operacion_min: 0,
      temperatura_operacion_max: 4,
      humedad_optima_porcentaje: 90,
      tipo_control: 'automatico',
      ubicacion: '',
      responsable: ''
    })
  }

  const handleInputChange = (campo: string, valor: any) => {
    setFormularioCamara(prev => ({
      ...prev,
      [campo]: valor
    }))
  }

  const validarFormulario = (): boolean => {
    return formularioCamara.nombre.trim().length >= 3 &&
           formularioCamara.capacidad_maxima_kg > 0 &&
           formularioCamara.temperatura_operacion_min < formularioCamara.temperatura_operacion_max &&
           formularioCamara.ubicacion.trim().length > 0 &&
           formularioCamara.responsable.trim().length > 0
  }

  const getIconoEstado = (estado: string) => {
    switch (estado) {
      case 'activa': return <CheckCircle className="h-5 w-5 text-cultivo-600" />
      case 'mantenimiento': return <Wrench className="h-5 w-5 text-yellow-600" />
      case 'inactiva': return <AlertTriangle className="h-5 w-5 text-red-600" />
      default: return <Settings className="h-5 w-5 text-gray-600" />
    }
  }

  const getColorEstado = (estado: string) => {
    switch (estado) {
      case 'activa': return 'bg-cultivo-50 text-cultivo-700 border-cultivo-200'
      case 'mantenimiento': return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      case 'inactiva': return 'bg-red-50 text-red-700 border-red-200'
      default: return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-xl">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-cultivo-600 to-lima-500 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                <Snowflake className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">
                  Gestión de Cámaras Frigoríficas
                </h2>
                <p className="text-cultivo-100 text-sm">
                  {vista === 'lista' && 'Administrar cámaras del sistema'}
                  {vista === 'crear' && 'Crear nueva cámara frigorífica'}
                  {vista === 'editar' && 'Editar configuración de cámara'}
                  {vista === 'detalle' && 'Detalles de la cámara seleccionada'}
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              aria-label="Cerrar modal de gestión de cámaras"
              title="Cerrar modal de gestión de cámaras"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>

        {/* Navegación */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-2">
            {vista !== 'lista' && (
              <button
                onClick={() => setVista('lista')}
                className="text-cultivo-600 hover:text-cultivo-700 text-sm font-medium transition-colors"
              >
                ← Volver a la lista
              </button>
            )}
          </div>
          
          {vista === 'lista' && (
            <button
              onClick={() => setVista('crear')}
              className="bg-cultivo-600 hover:bg-cultivo-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span>Nueva Cámara</span>
            </button>
          )}
        </div>

        {/* Contenido principal */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          
          {/* Vista: Lista de Cámaras */}
          {vista === 'lista' && (
            <div className="space-y-4">
              {cargando ? (
                <div className="text-center py-8">
                  <div className="animate-spin h-8 w-8 border-4 border-cultivo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-600">Cargando cámaras...</p>
                </div>
              ) : camaras.length === 0 ? (
                <div className="text-center py-12">
                  <Snowflake className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No hay cámaras configuradas</h3>
                  <p className="text-gray-600 mb-6">Crea tu primera cámara frigorífica para comenzar</p>
                  <button
                    onClick={() => setVista('crear')}
                    className="bg-cultivo-600 hover:bg-cultivo-700 text-white px-6 py-3 rounded-lg transition-colors shadow-sm"
                    aria-label="Crear primera cámara frigorífica"
                  >
                    Crear Primera Cámara
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {camaras.map((camara) => (
                    <div 
                      key={camara.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 bg-white"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-cultivo-50 rounded-lg">
                            <Snowflake className="h-5 w-5 text-cultivo-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{camara.nombre}</h3>
                            <p className="text-sm text-gray-600">{camara.ubicacion}</p>
                          </div>
                        </div>
                        
                        <div className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center space-x-1 ${getColorEstado(camara.estado_operativo)}`}>
                          {getIconoEstado(camara.estado_operativo)}
                          <span className="capitalize">{camara.estado_operativo}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-500">Capacidad</p>
                          <p className="text-sm font-medium">{camara.capacidad_maxima_kg.toLocaleString()} kg</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Temperatura</p>
                          <p className="text-sm font-medium">
                            {camara.temperatura_operacion_min}°C a {camara.temperatura_operacion_max}°C
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Humedad Óptima</p>
                          <p className="text-sm font-medium">{camara.humedad_optima_porcentaje}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Responsable</p>
                          <p className="text-sm font-medium">{camara.responsable}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          Control: {camara.tipo_control}
                        </span>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setCamaraSeleccionada(camara)
                              setVista('detalle')
                            }}
                            className="p-2 hover:bg-cultivo-50 rounded-lg text-gray-600 hover:text-cultivo-600 transition-colors"
                            aria-label={`Ver detalles de ${camara.nombre}`}
                            title={`Ver detalles de ${camara.nombre}`}
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setCamaraSeleccionada(camara)
                              setFormularioCamara({
                                nombre: camara.nombre,
                                capacidad_maxima_kg: camara.capacidad_maxima_kg,
                                temperatura_operacion_min: camara.temperatura_operacion_min,
                                temperatura_operacion_max: camara.temperatura_operacion_max,
                                humedad_optima_porcentaje: camara.humedad_optima_porcentaje,
                                tipo_control: camara.tipo_control,
                                ubicacion: camara.ubicacion,
                                responsable: camara.responsable
                              })
                              setVista('editar')
                            }}
                            className="p-2 hover:bg-cultivo-50 rounded-lg text-gray-600 hover:text-cultivo-600 transition-colors"
                            aria-label={`Editar configuración de ${camara.nombre}`}
                            title={`Editar configuración de ${camara.nombre}`}
                          >
                            <Settings className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Vista: Crear/Editar Cámara */}
          {(vista === 'crear' || vista === 'editar') && (
            <div className="space-y-6">
              
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-red-800 font-medium">Error</p>
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                </div>
              )}

              {/* Información básica */}
              <div className="bg-cultivo-50 rounded-lg p-6 border border-cultivo-200">
                <h4 className="font-medium text-cultivo-900 mb-4 flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Información Básica
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre de la Cámara *
                    </label>
                    <input
                      type="text"
                      value={formularioCamara.nombre}
                      onChange={(e) => handleInputChange('nombre', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cultivo-500 focus:border-cultivo-500 transition-colors"
                      placeholder="Ej: Cámara Frigorífica 1 - Manzanas"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ubicación *
                    </label>
                    <input
                      type="text"
                      value={formularioCamara.ubicacion}
                      onChange={(e) => handleInputChange('ubicacion', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cultivo-500 focus:border-cultivo-500 transition-colors"
                      placeholder="Ej: Sector A - Planta Principal"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Responsable *
                    </label>
                    <input
                      type="text"
                      value={formularioCamara.responsable}
                      onChange={(e) => handleInputChange('responsable', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cultivo-500 focus:border-cultivo-500 transition-colors"
                      placeholder="Nombre del técnico responsable"
                    />
                  </div>
                  
                                      <div>
                      <label htmlFor="capacidad-maxima" className="block text-sm font-medium text-gray-700 mb-2">
                        Capacidad Máxima (kg) *
                      </label>
                      <input
                        id="capacidad-maxima"
                        type="number"
                        value={formularioCamara.capacidad_maxima_kg}
                        onChange={(e) => handleInputChange('capacidad_maxima_kg', parseInt(e.target.value) || 0)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cultivo-500 focus:border-cultivo-500 transition-colors"
                        min="1000"
                        step="1000"
                        placeholder="20000"
                        title="Capacidad máxima de la cámara en kilogramos"
                      />
                    </div>
                </div>
              </div>

              {/* Parámetros técnicos */}
              <div className="bg-lima-50 rounded-lg p-6 border border-lima-200">
                <div className="flex items-center space-x-2 mb-4">
                  <Thermometer className="h-5 w-5 text-lima-600" />
                  <h4 className="font-medium text-lima-900">Parámetros Técnicos</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                      <div>
                      <label htmlFor="temp-min" className="block text-sm font-medium text-gray-700 mb-2">
                        Temperatura Mínima (°C) *
                      </label>
                      <input
                        id="temp-min"
                        type="number"
                        value={formularioCamara.temperatura_operacion_min}
                        onChange={(e) => handleInputChange('temperatura_operacion_min', parseFloat(e.target.value) || 0)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-lima-500 focus:border-lima-500 transition-colors"
                        step="0.1"
                        title="Temperatura mínima de operación en grados Celsius"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="temp-max" className="block text-sm font-medium text-gray-700 mb-2">
                        Temperatura Máxima (°C) *
                      </label>
                      <input
                        id="temp-max"
                        type="number"
                        value={formularioCamara.temperatura_operacion_max}
                        onChange={(e) => handleInputChange('temperatura_operacion_max', parseFloat(e.target.value) || 4)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-lima-500 focus:border-lima-500 transition-colors"
                        step="0.1"
                        title="Temperatura máxima de operación en grados Celsius"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="humedad" className="block text-sm font-medium text-gray-700 mb-2">
                        Humedad Óptima (%) *
                      </label>
                      <input
                        id="humedad"
                        type="number"
                        value={formularioCamara.humedad_optima_porcentaje}
                        onChange={(e) => handleInputChange('humedad_optima_porcentaje', parseInt(e.target.value) || 90)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-lima-500 focus:border-lima-500 transition-colors"
                        min="0"
                        max="100"
                        title="Humedad óptima en porcentaje"
                      />
                    </div>
                </div>
                
                                  <div className="mt-4">
                    <label htmlFor="tipo-control" className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Control *
                    </label>
                    <select
                      id="tipo-control"
                      value={formularioCamara.tipo_control}
                      onChange={(e) => handleInputChange('tipo_control', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-lima-500 focus:border-lima-500 transition-colors"
                      title="Seleccionar tipo de control de la cámara"
                    >
                      <option value="automatico">Automático</option>
                      <option value="manual">Manual</option>
                      <option value="mixto">Mixto</option>
                    </select>
                  </div>
              </div>

              {/* Botones */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setVista('lista')}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={crearCamara}
                  disabled={!validarFormulario() || cargando}
                  className="px-6 py-2 bg-cultivo-600 hover:bg-cultivo-700 disabled:bg-gray-300 text-white rounded-lg transition-colors flex items-center space-x-2 shadow-sm"
                >
                  {cargando && <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>}
                  <span>{vista === 'crear' ? 'Crear Cámara' : 'Guardar Cambios'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Vista: Detalle de Cámara */}
          {vista === 'detalle' && camaraSeleccionada && (
            <div className="space-y-6">
              {/* Información principal */}
              <div className="bg-gradient-to-r from-cultivo-50 to-lima-50 rounded-lg p-6 border border-cultivo-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-white rounded-xl shadow-sm border border-cultivo-200">
                      <Snowflake className="h-8 w-8 text-cultivo-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{camaraSeleccionada.nombre}</h3>
                      <p className="text-gray-600">{camaraSeleccionada.ubicacion}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        {getIconoEstado(camaraSeleccionada.estado_operativo)}
                        <span className="text-sm font-medium capitalize">{camaraSeleccionada.estado_operativo}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Especificaciones técnicas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="p-1 bg-cultivo-100 rounded">
                      <Package className="h-4 w-4 text-cultivo-600" />
                    </div>
                    <h4 className="font-medium text-gray-900">Capacidad</h4>
                  </div>
                  <p className="text-2xl font-bold text-cultivo-600">{camaraSeleccionada.capacidad_maxima_kg.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">kilogramos máximos</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="p-1 bg-lima-100 rounded">
                      <Thermometer className="h-4 w-4 text-lima-600" />
                    </div>
                    <h4 className="font-medium text-gray-900">Temperatura</h4>
                  </div>
                  <p className="text-2xl font-bold text-lima-600">
                    {camaraSeleccionada.temperatura_operacion_min}° a {camaraSeleccionada.temperatura_operacion_max}°C
                  </p>
                  <p className="text-sm text-gray-600">rango de operación</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="p-1 bg-green-100 rounded">
                      <Settings className="h-4 w-4 text-green-600" />
                    </div>
                    <h4 className="font-medium text-gray-900">Control</h4>
                  </div>
                  <p className="text-2xl font-bold text-green-600 capitalize">{camaraSeleccionada.tipo_control}</p>
                  <p className="text-sm text-gray-600">tipo de sistema</p>
                </div>
              </div>

              {/* Información adicional */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3">Información Adicional</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Responsable</p>
                    <p className="font-medium">{camaraSeleccionada.responsable}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Humedad Óptima</p>
                    <p className="font-medium">{camaraSeleccionada.humedad_optima_porcentaje}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Última Revisión</p>
                    <p className="font-medium">
                      {new Date(camaraSeleccionada.ultima_revision).toLocaleDateString('es-CL')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">ID Sistema</p>
                    <p className="font-medium font-mono text-cultivo-600">{camaraSeleccionada.id}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 