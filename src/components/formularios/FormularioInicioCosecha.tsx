import React, { useState, useEffect } from 'react'
import { DatosInicioCosecha } from '../../types/eventSpecificData'
import { Scissors, MapPin, Users, Clock, Thermometer, Sun } from 'lucide-react'

interface FormularioInicioCosechaProps {
  datosIniciales?: Partial<DatosInicioCosecha>
  onDatosChange: (datos: DatosInicioCosecha | null) => void
  onValidacionChange: (esValido: boolean) => void
}

export default function FormularioInicioCosecha({
  datosIniciales,
  onDatosChange,
  onValidacionChange
}: FormularioInicioCosechaProps) {
  const [datos, setDatos] = useState<Partial<DatosInicioCosecha>>({
    operario_nombre: '',
    turno: 'mañana',
    cuadrilla_asignada: [],
    supervisor_campo: '',
    hora_inicio: new Date().toTimeString().slice(0, 5),
    condiciones_climaticas: 'soleado',
    sector_cosecha: '',
    metodo_cosecha: 'manual',
    herramientas_utilizadas: [],
    observaciones: '',
    ...datosIniciales
  })

  const validarFormulario = (datosActuales: Partial<DatosInicioCosecha>): boolean => {
    const camposRequeridos: (keyof DatosInicioCosecha)[] = [
      'operario_nombre',
      'turno',
      'supervisor_campo',
      'hora_inicio',
      'sector_cosecha',
      'metodo_cosecha',
      'condiciones_climaticas'
    ]

    const todosCompletos = camposRequeridos.every(campo => {
      const valor = datosActuales[campo]
      if (typeof valor === 'string') {
        return valor.trim() !== ''
      }
      return valor !== undefined && valor !== null
    })

    const cuadrillaAsignada = (datosActuales.cuadrilla_asignada || []).length > 0

    return todosCompletos && cuadrillaAsignada
  }

  useEffect(() => {
    const esValido = validarFormulario(datos)
    onValidacionChange(esValido)
    
    if (esValido) {
      onDatosChange(datos as DatosInicioCosecha)
    } else {
      onDatosChange(null)
    }
  }, [datos, onDatosChange, onValidacionChange])

  const handleInputChange = (campo: keyof DatosInicioCosecha, valor: any) => {
    setDatos(prev => ({
      ...prev,
      [campo]: valor
    }))
  }

  const herramientasComunes = [
    'Tijeras de cosecha',
    'Canastillos',
    'Escaleras',
    'Carretillas',
    'Bins de cosecha',
    'Guantes',
    'Delantales',
    'Cuchillos'
  ]

  const toggleHerramienta = (herramienta: string) => {
    setDatos(prev => ({
      ...prev,
      herramientas_utilizadas: prev.herramientas_utilizadas?.includes(herramienta)
        ? prev.herramientas_utilizadas.filter(h => h !== herramienta)
        : [...(prev.herramientas_utilizadas || []), herramienta]
    }))
  }

  const agregarTrabajador = () => {
    const nombre = prompt('Nombre del trabajador:')
    if (nombre?.trim()) {
      setDatos(prev => ({
        ...prev,
        cuadrilla_asignada: [...(prev.cuadrilla_asignada || []), nombre.trim()]
      }))
    }
  }

  const eliminarTrabajador = (index: number) => {
    setDatos(prev => ({
      ...prev,
      cuadrilla_asignada: (prev.cuadrilla_asignada || []).filter((_, i) => i !== index)
    }))
  }

  return (
    <div className="space-y-6">
      {/* Información del Operario */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-4">
          <Users className="h-5 w-5 text-blue-600" />
          <h5 className="font-medium text-gray-900">Información del Operario</h5>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Operario Responsable *
            </label>
            <input
              type="text"
              value={datos.operario_nombre || ''}
              onChange={(e) => handleInputChange('operario_nombre', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nombre del operario responsable"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Turno *
            </label>
            <select
              value={datos.turno || 'mañana'}
              onChange={(e) => handleInputChange('turno', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              aria-label="Turno de trabajo"
            >
              <option value="mañana">Mañana</option>
              <option value="tarde">Tarde</option>
              <option value="noche">Noche</option>
            </select>
          </div>
        </div>
      </div>

      {/* Supervisión */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-4">
          <MapPin className="h-5 w-5 text-green-600" />
          <h5 className="font-medium text-gray-900">Supervisión de Campo</h5>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Supervisor de Campo *
            </label>
            <input
              type="text"
              value={datos.supervisor_campo || ''}
              onChange={(e) => handleInputChange('supervisor_campo', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Nombre del supervisor"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sector de Cosecha *
            </label>
            <input
              type="text"
              value={datos.sector_cosecha || ''}
              onChange={(e) => handleInputChange('sector_cosecha', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Cuartel A, Sector Norte, etc."
            />
          </div>
        </div>
      </div>

      {/* Horario y Condiciones */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-4">
          <Clock className="h-5 w-5 text-yellow-600" />
          <h5 className="font-medium text-gray-900">Horario y Condiciones</h5>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hora de Inicio *
            </label>
            <input
              type="time"
              value={datos.hora_inicio || ''}
              onChange={(e) => handleInputChange('hora_inicio', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              aria-label="Hora de inicio de cosecha"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Condiciones Climáticas *
            </label>
            <select
              value={datos.condiciones_climaticas || 'soleado'}
              onChange={(e) => handleInputChange('condiciones_climaticas', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              aria-label="Condiciones climáticas actuales"
            >
              <option value="soleado">Soleado</option>
              <option value="nublado">Nublado</option>
              <option value="parcialmente_nublado">Parcialmente Nublado</option>
              <option value="lluvia_ligera">Lluvia Ligera</option>
              <option value="viento">Viento</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Método de Cosecha *
            </label>
            <select
              value={datos.metodo_cosecha || 'manual'}
              onChange={(e) => handleInputChange('metodo_cosecha', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              aria-label="Método de cosecha empleado"
            >
              <option value="manual">Manual</option>
              <option value="mecanizado">Mecanizado</option>
              <option value="mixto">Mixto</option>
            </select>
          </div>
        </div>
      </div>

      {/* Cuadrilla Asignada */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-purple-600" />
            <h5 className="font-medium text-gray-900">Cuadrilla Asignada *</h5>
          </div>
          <button
            type="button"
            onClick={agregarTrabajador}
            className="text-sm bg-purple-100 hover:bg-purple-200 text-purple-800 px-3 py-1 rounded-lg flex items-center space-x-1"
          >
            <Users className="h-4 w-4" />
            <span>Agregar Trabajador</span>
          </button>
        </div>
        
        {datos.cuadrilla_asignada && datos.cuadrilla_asignada.length > 0 ? (
          <div className="space-y-2">
            {datos.cuadrilla_asignada.map((trabajador, index) => (
              <div key={index} className="flex items-center justify-between bg-white border border-purple-200 rounded-lg px-3 py-2">
                <span className="text-sm text-gray-700">{trabajador}</span>
                <button
                  type="button"
                  onClick={() => eliminarTrabajador(index)}
                  className="text-purple-600 hover:text-purple-800"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-gray-500 text-center py-4">
            No hay trabajadores asignados. Haz clic en "Agregar Trabajador" para añadir personal.
          </div>
        )}
      </div>

      {/* Herramientas Utilizadas */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-4">
          <Scissors className="h-5 w-5 text-orange-600" />
          <h5 className="font-medium text-gray-900">Herramientas Utilizadas</h5>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {herramientasComunes.map((herramienta) => (
            <label key={herramienta} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={datos.herramientas_utilizadas?.includes(herramienta) || false}
                onChange={() => toggleHerramienta(herramienta)}
                className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
              />
              <span className="text-sm text-gray-700">{herramienta}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Observaciones */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Observaciones Adicionales
        </label>
        <textarea
          value={datos.observaciones || ''}
          onChange={(e) => handleInputChange('observaciones', e.target.value)}
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Estado del campo, madurez de la fruta, condiciones especiales..."
        />
      </div>

      {/* Indicador de validación */}
      <div className={`p-3 rounded-lg text-sm ${
        validarFormulario(datos) 
          ? 'bg-green-50 text-green-800 border border-green-200' 
          : 'bg-red-50 text-red-800 border border-red-200'
      }`}>
        {validarFormulario(datos) 
          ? '✓ Formulario completo y válido para SAG'
          : '⚠ Completa todos los campos obligatorios marcados con * y asigna al menos un trabajador'
        }
      </div>
    </div>
  )
} 