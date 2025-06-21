import React, { useState, useEffect } from 'react'
import { DatosInicioCosecha } from '../../types/eventSpecificData'
import FormularioStepper, { StepData } from '../ui/FormularioStepper'
import { Scissors, Users, Clock, Sun, Wrench, User, Plus, X } from 'lucide-react'

interface FormularioInicioCosechaStepperProps {
  datosIniciales?: Partial<DatosInicioCosecha>
  onDatosChange: (datos: DatosInicioCosecha | null) => void
  onValidacionChange: (esValido: boolean) => void
  onComplete?: () => void
}

export default function FormularioInicioCosechaStepper({
  datosIniciales,
  onDatosChange,
  onValidacionChange,
  onComplete
}: FormularioInicioCosechaStepperProps) {
  const [datos, setDatos] = useState<Partial<DatosInicioCosecha>>({
    operario_nombre: '',
    turno: 'mañana',
    supervisor_campo: '',
    sector_cosecha: '',
    hora_inicio: '',
    condiciones_climaticas: 'soleado',
    metodo_cosecha: 'manual',
    cuadrilla_asignada: [],
    herramientas_utilizadas: [],
    observaciones: '',
    ...datosIniciales
  })

  const handleInputChange = (campo: keyof DatosInicioCosecha, valor: any) => {
    const nuevosDatos = { ...datos, [campo]: valor }
    setDatos(nuevosDatos)
    
    // Validar si todos los campos requeridos están completos
    const esValido = !!(
      nuevosDatos.operario_nombre?.trim() &&
      nuevosDatos.supervisor_campo?.trim() &&
      nuevosDatos.sector_cosecha?.trim() &&
      nuevosDatos.hora_inicio &&
      nuevosDatos.cuadrilla_asignada?.length &&
      nuevosDatos.herramientas_utilizadas?.length
    )
    
    onValidacionChange(esValido)
    onDatosChange(esValido ? nuevosDatos as DatosInicioCosecha : null)
  }

  const agregarTrabajador = () => {
    const nuevoTrabajador = `Trabajador ${(datos.cuadrilla_asignada?.length || 0) + 1}`
    handleInputChange('cuadrilla_asignada', [...(datos.cuadrilla_asignada || []), nuevoTrabajador])
  }

  const eliminarTrabajador = (index: number) => {
    const nuevaCuadrilla = datos.cuadrilla_asignada?.filter((_, i) => i !== index) || []
    handleInputChange('cuadrilla_asignada', nuevaCuadrilla)
  }

  const editarTrabajador = (index: number, nuevoNombre: string) => {
    const nuevaCuadrilla = [...(datos.cuadrilla_asignada || [])]
    nuevaCuadrilla[index] = nuevoNombre
    handleInputChange('cuadrilla_asignada', nuevaCuadrilla)
  }

  const toggleHerramienta = (herramienta: string) => {
    const herramientasActuales = datos.herramientas_utilizadas || []
    const nuevasHerramientas = herramientasActuales.includes(herramienta)
      ? herramientasActuales.filter(h => h !== herramienta)
      : [...herramientasActuales, herramienta]
    handleInputChange('herramientas_utilizadas', nuevasHerramientas)
  }

  // Paso 1: Información del operario y supervisor
  const PasoOperario = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <div className="flex items-center space-x-3 mb-4">
          <User className="h-6 w-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-blue-900">Personal Responsable</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Operario Responsable *
            </label>
            <input
              type="text"
              value={datos.operario_nombre || ''}
              onChange={(e) => handleInputChange('operario_nombre', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nombre del operario"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Supervisor de Campo *
            </label>
                         <input
               type="text"
               value={datos.supervisor_campo || ''}
               onChange={(e) => handleInputChange('supervisor_campo', e.target.value)}
               className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
               placeholder="Nombre del supervisor"
               required
             />
          </div>
        </div>
      </div>
    </div>
  )

  // Paso 2: Ubicación y condiciones
  const PasoUbicacion = () => (
    <div className="space-y-6">
      <div className="bg-green-50 rounded-lg p-4 border border-green-200">
        <div className="flex items-center space-x-3 mb-4">
          <Sun className="h-6 w-6 text-green-600" />
          <h3 className="text-lg font-semibold text-green-900">Ubicación y Condiciones</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sector de Cosecha *
            </label>
            <input
              type="text"
              value={datos.sector_cosecha || ''}
              onChange={(e) => handleInputChange('sector_cosecha', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Ej: Cuartel A-1, Sector Norte"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hora de Inicio *
            </label>
            <input
              type="time"
              value={datos.hora_inicio || ''}
              onChange={(e) => handleInputChange('hora_inicio', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
              aria-label="Hora de inicio de cosecha"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Condiciones Climáticas *
            </label>
            <select
              value={datos.condiciones_climaticas || 'soleado'}
              onChange={(e) => handleInputChange('condiciones_climaticas', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
              aria-label="Condiciones climáticas"
            >
              <option value="soleado">Soleado</option>
              <option value="nublado">Nublado</option>
              <option value="parcialmente_nublado">Parcialmente Nublado</option>
              <option value="lluvia_ligera">Lluvia Ligera</option>
              <option value="viento">Viento</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Método de Cosecha *
            </label>
            <select
              value={datos.metodo_cosecha || 'manual'}
              onChange={(e) => handleInputChange('metodo_cosecha', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
              aria-label="Método de cosecha"
            >
              <option value="manual">Manual</option>
              <option value="mecanizado">Mecanizado</option>
              <option value="mixto">Mixto</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )

  // Paso 3: Cuadrilla asignada
  const PasoCuadrilla = () => (
    <div className="space-y-6">
      <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
        <div className="flex items-center space-x-3 mb-4">
          <Users className="h-6 w-6 text-yellow-600" />
          <h3 className="text-lg font-semibold text-yellow-900">Cuadrilla Asignada</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Trabajadores asignados: {datos.cuadrilla_asignada?.length || 0}
            </p>
            <button
              type="button"
              onClick={agregarTrabajador}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Agregar Trabajador</span>
            </button>
          </div>

          <div className="space-y-3 max-h-60 overflow-y-auto">
            {datos.cuadrilla_asignada?.map((trabajador, index) => (
              <div key={index} className="flex items-center space-x-3 bg-white p-3 rounded-lg border border-gray-200">
                <div className="flex-1">
                  <input
                    type="text"
                    value={trabajador}
                    onChange={(e) => editarTrabajador(index, e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    placeholder="Nombre del trabajador"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => eliminarTrabajador(index)}
                  className="text-red-600 hover:text-red-800 p-1 rounded transition-colors"
                  aria-label="Eliminar trabajador"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )) || []}
          </div>

          {(!datos.cuadrilla_asignada || datos.cuadrilla_asignada.length === 0) && (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No hay trabajadores asignados</p>
              <p className="text-sm">Haz clic en "Agregar Trabajador" para comenzar</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  // Paso 4: Herramientas y observaciones
  const PasoHerramientas = () => {
    const herramientasDisponibles = [
      'Tijeras de podar',
      'Escaleras',
      'Bins de cosecha',
      'Carretillas',
      'Balanzas portátiles',
      'Guantes',
      'Canastos',
      'Etiquetas'
    ]

    return (
      <div className="space-y-6">
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center space-x-3 mb-4">
            <Wrench className="h-6 w-6 text-purple-600" />
            <h3 className="text-lg font-semibold text-purple-900">Herramientas y Equipos</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
            {herramientasDisponibles.map((herramienta) => (
              <label key={herramienta} className="flex items-center space-x-2 cursor-pointer">
                                 <input
                   type="checkbox"
                   checked={datos.herramientas_utilizadas?.includes(herramienta) || false}
                   onChange={() => toggleHerramienta(herramienta)}
                   className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                   aria-label={`Seleccionar ${herramienta}`}
                 />
                <span className="text-sm text-gray-700">{herramienta}</span>
              </label>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observaciones
            </label>
            <textarea
              value={datos.observaciones || ''}
              onChange={(e) => handleInputChange('observaciones', e.target.value)}
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="Observaciones adicionales sobre el inicio de cosecha..."
            />
          </div>
        </div>
      </div>
    )
  }

  const pasos: StepData[] = [
    {
      id: 'operario',
      titulo: 'Personal',
      descripcion: 'Operario y supervisor responsables',
      componente: <PasoOperario />,
      esValido: !!(datos.operario_nombre?.trim() && datos.supervisor_campo?.trim())
    },
    {
      id: 'ubicacion',
      titulo: 'Ubicación',
      descripcion: 'Sector y condiciones de cosecha',
      componente: <PasoUbicacion />,
      esValido: !!(datos.sector_cosecha?.trim() && datos.hora_inicio)
    },
    {
      id: 'cuadrilla',
      titulo: 'Cuadrilla',
      descripcion: 'Trabajadores asignados',
      componente: <PasoCuadrilla />,
      esValido: !!(datos.cuadrilla_asignada?.length)
    },
    {
      id: 'herramientas',
      titulo: 'Herramientas',
      descripcion: 'Equipos y observaciones',
      componente: <PasoHerramientas />,
      esValido: !!(datos.herramientas_utilizadas?.length)
    }
  ]

  const esValidoGeneral = pasos.every(paso => paso.esValido)

  useEffect(() => {
    onValidacionChange(esValidoGeneral)
    onDatosChange(esValidoGeneral ? datos as DatosInicioCosecha : null)
  }, [datos, esValidoGeneral, onValidacionChange, onDatosChange])

  return (
    <FormularioStepper
      pasos={pasos}
      tituloGeneral="Inicio de Cosecha"
      esValidoGeneral={esValidoGeneral}
      onComplete={onComplete}
    />
  )
} 