import React, { useState, useEffect } from 'react'
import { DatosSeleccion } from '../../types/eventSpecificData'
import { Filter, BarChart3, Target, Users, Scale } from 'lucide-react'

interface FormularioSeleccionProps {
  datosIniciales?: Partial<DatosSeleccion>
  onDatosChange: (datos: DatosSeleccion | null) => void
  onValidacionChange: (esValido: boolean) => void
}

export default function FormularioSeleccion({
  datosIniciales,
  onDatosChange,
  onValidacionChange
}: FormularioSeleccionProps) {
  const [datos, setDatos] = useState<Partial<DatosSeleccion>>({
    operario_nombre: '',
    turno: 'mañana',
    linea_seleccion: '',
    velocidad_linea_cajas_hora: 1000,
    personal_seleccionadores: 5,
    criterios_seleccion: [],
    porcentaje_descarte: 5,
    defectos_principales: [],
    peso_seleccionado_kg: 0,
    observaciones: '',
    ...datosIniciales
  })

  const validarFormulario = (datosActuales: Partial<DatosSeleccion>): boolean => {
    const camposRequeridos: (keyof DatosSeleccion)[] = [
      'operario_nombre',
      'turno',
      'linea_seleccion',
      'velocidad_linea_cajas_hora',
      'personal_seleccionadores',
      'porcentaje_descarte',
      'peso_seleccionado_kg'
    ]

    const todosCompletos = camposRequeridos.every(campo => {
      const valor = datosActuales[campo]
      if (typeof valor === 'string') {
        return valor.trim() !== ''
      }
      return valor !== undefined && valor !== null && valor !== 0
    })

    const velocidadValida = (datosActuales.velocidad_linea_cajas_hora || 0) > 0
    const personalValido = (datosActuales.personal_seleccionadores || 0) > 0
    const pesoValido = (datosActuales.peso_seleccionado_kg || 0) > 0
    const porcentajeValido = (datosActuales.porcentaje_descarte || 0) >= 0 && (datosActuales.porcentaje_descarte || 0) <= 100

    return todosCompletos && velocidadValida && personalValido && pesoValido && porcentajeValido
  }

  useEffect(() => {
    const esValido = validarFormulario(datos)
    onValidacionChange(esValido)
    
    if (esValido) {
      onDatosChange(datos as DatosSeleccion)
    } else {
      onDatosChange(null)
    }
  }, [datos, onDatosChange, onValidacionChange])

  const handleInputChange = (campo: keyof DatosSeleccion, valor: any) => {
    setDatos(prev => ({
      ...prev,
      [campo]: valor
    }))
  }

  // Funciones para cálculos automáticos
  const calcularProductividadPorPersona = () => {
    const velocidad = datos.velocidad_linea_cajas_hora || 0
    const personal = datos.personal_seleccionadores || 1
    return personal > 0 ? (velocidad / personal).toFixed(0) : '0'
  }

  const calcularPesoDescartado = () => {
    const pesoTotal = datos.peso_seleccionado_kg || 0
    const porcentaje = datos.porcentaje_descarte || 0
    const pesoDescarte = (pesoTotal * porcentaje) / (100 - porcentaje)
    return pesoDescarte.toFixed(1)
  }

  const criteriosComunes = [
    'Tamaño grande',
    'Color verde claro',
    'Firmeza adecuada',
    'Sin defectos externos',
    'Sin defectos internos',
    'Madurez óptima'
  ]

  const defectosComunes = [
    'Golpes superficiales',
    'Rayones',
    'Manchas',
    'Deformaciones',
    'Pudrición',
    'Plagas'
  ]

  const toggleCriterio = (criterio: string) => {
    setDatos(prev => ({
      ...prev,
      criterios_seleccion: prev.criterios_seleccion?.includes(criterio)
        ? prev.criterios_seleccion.filter(c => c !== criterio)
        : [...(prev.criterios_seleccion || []), criterio]
    }))
  }

  const toggleDefecto = (defecto: string) => {
    setDatos(prev => ({
      ...prev,
      defectos_principales: prev.defectos_principales?.includes(defecto)
        ? prev.defectos_principales.filter(d => d !== defecto)
        : [...(prev.defectos_principales || []), defecto]
    }))
  }

  return (
    <div className="space-y-6">
      {/* Información del Personal */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-4">
          <Users className="h-5 w-5 text-blue-600" />
          <h5 className="font-medium text-gray-900">Información del Personal</h5>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Personal Seleccionadores *
            </label>
            <input
              type="number"
              min="1"
              value={datos.personal_seleccionadores || ''}
              onChange={(e) => handleInputChange('personal_seleccionadores', parseInt(e.target.value) || 5)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="5"
              aria-label="Número de personal en selección"
            />
          </div>
        </div>
      </div>

      {/* Línea de Selección */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="h-5 w-5 text-green-600" />
          <h5 className="font-medium text-gray-900">Línea de Selección</h5>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Línea de Selección *
            </label>
            <input
              type="text"
              value={datos.linea_seleccion || ''}
              onChange={(e) => handleInputChange('linea_seleccion', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Línea A, Línea B, etc."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Velocidad Línea (cajas/hora) *
            </label>
            <input
              type="number"
              min="1"
              value={datos.velocidad_linea_cajas_hora || ''}
              onChange={(e) => handleInputChange('velocidad_linea_cajas_hora', parseInt(e.target.value) || 1000)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="1000"
              aria-label="Velocidad de procesamiento en cajas por hora"
            />
          </div>
        </div>

        {/* Indicador de productividad */}
        {datos.velocidad_linea_cajas_hora && datos.personal_seleccionadores && (
          <div className="mt-3 p-2 bg-white rounded border border-green-200">
            <p className="text-sm text-green-700">
              <strong>Productividad por persona:</strong> {calcularProductividadPorPersona()} cajas/hora/persona
            </p>
          </div>
        )}
      </div>

      {/* Criterios de Selección */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-4">
          <Target className="h-5 w-5 text-yellow-600" />
          <h5 className="font-medium text-gray-900">Criterios de Selección</h5>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {criteriosComunes.map((criterio) => (
            <label key={criterio} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={datos.criterios_seleccion?.includes(criterio) || false}
                onChange={() => toggleCriterio(criterio)}
                className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
              />
              <span className="text-sm text-gray-700">{criterio}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Peso y Descarte */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-4">
          <Scale className="h-5 w-5 text-purple-600" />
          <h5 className="font-medium text-gray-900">Peso y Descarte</h5>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Peso Seleccionado (kg) *
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={datos.peso_seleccionado_kg || ''}
              onChange={(e) => handleInputChange('peso_seleccionado_kg', parseFloat(e.target.value) || 0)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="1500.5"
              aria-label="Peso del producto seleccionado en kilogramos"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Porcentaje de Descarte (%) *
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={datos.porcentaje_descarte || ''}
              onChange={(e) => handleInputChange('porcentaje_descarte', parseFloat(e.target.value) || 5)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="5.0"
              aria-label="Porcentaje de producto descartado"
            />
          </div>
        </div>

        {/* Indicador de descarte calculado */}
        {datos.peso_seleccionado_kg && datos.porcentaje_descarte && (
          <div className="mt-3 p-2 bg-white rounded border border-purple-200">
            <p className="text-sm text-purple-700">
              <strong>Peso descartado estimado:</strong> {calcularPesoDescartado()} kg
            </p>
          </div>
        )}
      </div>

      {/* Defectos Principales */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-4">
          <BarChart3 className="h-5 w-5 text-orange-600" />
          <h5 className="font-medium text-gray-900">Defectos Principales</h5>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {defectosComunes.map((defecto) => (
            <label key={defecto} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={datos.defectos_principales?.includes(defecto) || false}
                onChange={() => toggleDefecto(defecto)}
                className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
              />
              <span className="text-sm text-gray-700">{defecto}</span>
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
          placeholder="Problemas en la línea, observaciones sobre calidad, incidencias del turno..."
        />
      </div>

      {/* Indicador de validación mejorado */}
      <div className={`p-3 rounded-lg text-sm border ${
        validarFormulario(datos) 
          ? 'bg-green-50 text-green-800 border-green-200' 
          : 'bg-red-50 text-red-800 border-red-200'
      }`}>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${
            validarFormulario(datos) ? 'bg-green-500' : 'bg-red-500'
          }`}></div>
          <span className="font-medium">
            {validarFormulario(datos) 
              ? 'Formulario completo y válido para SAG'
              : 'Completa todos los campos obligatorios marcados con *'
            }
          </span>
        </div>
        {!validarFormulario(datos) && (
          <ul className="mt-2 ml-4 text-xs space-y-1">
            {!datos.operario_nombre?.trim() && <li>• Nombre del operario es requerido</li>}
            {!datos.linea_seleccion?.trim() && <li>• Línea de selección es requerida</li>}
            {!(datos.velocidad_linea_cajas_hora || 0 > 0) && <li>• Velocidad de línea debe ser mayor a 0</li>}
            {!(datos.personal_seleccionadores || 0 > 0) && <li>• Número de personal debe ser mayor a 0</li>}
            {!(datos.peso_seleccionado_kg || 0 > 0) && <li>• Peso seleccionado debe ser mayor a 0</li>}
            {!((datos.porcentaje_descarte || 0) >= 0 && (datos.porcentaje_descarte || 0) <= 100) && <li>• Porcentaje de descarte debe estar entre 0% y 100%</li>}
          </ul>
        )}
      </div>
    </div>
  )
} 