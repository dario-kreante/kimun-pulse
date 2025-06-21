import React, { useState, useEffect } from 'react'
import { DatosControlCalidad } from '../../types/eventSpecificData'
import { ShieldCheck, User, FileText, Scale, BarChart3, Users } from 'lucide-react'

interface FormularioControlCalidadProps {
  datosIniciales?: Partial<DatosControlCalidad>
  onDatosChange: (datos: DatosControlCalidad | null) => void
  onValidacionChange: (esValido: boolean) => void
  contexto?: 'lote' | 'pallet'
  codigoPallet?: string
}

export default function FormularioControlCalidad({
  datosIniciales,
  onDatosChange,
  onValidacionChange,
  contexto = 'lote',
  codigoPallet
}: FormularioControlCalidadProps) {
  const [datos, setDatos] = useState<Partial<DatosControlCalidad>>({
    operario_nombre: '',
    turno: 'mañana',
    inspector_calidad: '',
    certificacion_inspector: '',
    muestra_analizada_kg: 0,
    parametros_evaluados: {
      firmeza_kg_cm2: 0,
      brix_grados: 0,
      acidez_porcentaje: 0,
      peso_promedio_g: 0,
      diametro_mm: 0,
      defectos_externos_porcentaje: 0,
      defectos_internos_porcentaje: 0,
      maduracion_escala: 5
    },
    resultado_general: 'aprobado',
    certificado_calidad: '',
    observaciones_tecnicas: '',
    tratamientos_requeridos: [],
    observaciones: '',
    ...datosIniciales
  })

  const validarFormulario = (datosActuales: Partial<DatosControlCalidad>): boolean => {
    const camposRequeridos: (keyof DatosControlCalidad)[] = [
      'operario_nombre',
      'turno',
      'inspector_calidad',
      'muestra_analizada_kg',
      'resultado_general'
    ]

    const todosCompletos = camposRequeridos.every(campo => {
      const valor = datosActuales[campo]
      if (typeof valor === 'string') {
        return valor.trim() !== ''
      }
      return valor !== undefined && valor !== null && valor !== 0
    })

    const muestraValida = (datosActuales.muestra_analizada_kg || 0) > 0

    return todosCompletos && muestraValida
  }

  useEffect(() => {
    const esValido = validarFormulario(datos)
    onValidacionChange(esValido)
    
    if (esValido) {
      onDatosChange(datos as DatosControlCalidad)
    } else {
      onDatosChange(null)
    }
  }, [datos, onDatosChange, onValidacionChange])

  const handleInputChange = (campo: keyof DatosControlCalidad, valor: any) => {
    setDatos(prev => ({
      ...prev,
      [campo]: valor
    }))
  }

  const handleParametroChange = (parametro: string, valor: number) => {
    setDatos(prev => ({
      ...prev,
      parametros_evaluados: {
        ...prev.parametros_evaluados,
        [parametro]: valor
      }
    }))
  }

  const tratamientosList = [
    'Lavado con hipoclorito',
    'Aplicación de cera',
    'Tratamiento antifúngico',
    'Clasificación adicional',
    'Reposo en cámara',
    'Control de humedad'
  ]

  const toggleTratamiento = (tratamiento: string) => {
    setDatos(prev => ({
      ...prev,
      tratamientos_requeridos: prev.tratamientos_requeridos?.includes(tratamiento)
        ? prev.tratamientos_requeridos.filter(t => t !== tratamiento)
        : [...(prev.tratamientos_requeridos || []), tratamiento]
    }))
  }

  return (
    <div className="space-y-6">
      {/* Información del Personal */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-4">
          <Users className="h-5 w-5 text-blue-600" />
          <h5 className="font-medium text-gray-900">Personal Responsable</h5>
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

      {/* Inspector de Calidad */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-4">
          <User className="h-5 w-5 text-green-600" />
          <h5 className="font-medium text-gray-900">Inspector de Calidad</h5>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Inspector de Calidad *
            </label>
            <input
              type="text"
              value={datos.inspector_calidad || ''}
              onChange={(e) => handleInputChange('inspector_calidad', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Nombre del inspector certificado"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Certificación del Inspector
            </label>
            <input
              type="text"
              value={datos.certificacion_inspector || ''}
              onChange={(e) => handleInputChange('certificacion_inspector', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Número de certificación"
            />
          </div>
        </div>
      </div>

      {/* Muestra y Análisis */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-4">
          <Scale className="h-5 w-5 text-yellow-600" />
          <h5 className="font-medium text-gray-900">Muestra y Análisis</h5>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Muestra Analizada (kg) *
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={datos.muestra_analizada_kg || ''}
              onChange={(e) => handleInputChange('muestra_analizada_kg', parseFloat(e.target.value) || 0)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              placeholder="5.0"
              aria-label="Peso de la muestra analizada en kilogramos"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Resultado General *
            </label>
            <select
              value={datos.resultado_general || 'aprobado'}
              onChange={(e) => handleInputChange('resultado_general', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              aria-label="Resultado general del control de calidad"
            >
              <option value="aprobado">Aprobado</option>
              <option value="condicionado">Condicionado</option>
              <option value="rechazado">Rechazado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Parámetros Evaluados */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-4">
          <BarChart3 className="h-5 w-5 text-orange-600" />
          <h5 className="font-medium text-gray-900">Parámetros de Calidad</h5>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Firmeza (kg/cm²)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={datos.parametros_evaluados?.firmeza_kg_cm2 || ''}
              onChange={(e) => handleParametroChange('firmeza_kg_cm2', parseFloat(e.target.value) || 0)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="6.5"
              aria-label="Firmeza en kilogramos por centímetro cuadrado"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Grados Brix (°Bx)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={datos.parametros_evaluados?.brix_grados || ''}
              onChange={(e) => handleParametroChange('brix_grados', parseFloat(e.target.value) || 0)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="12.5"
              aria-label="Grados Brix"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Acidez (%)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={datos.parametros_evaluados?.acidez_porcentaje || ''}
              onChange={(e) => handleParametroChange('acidez_porcentaje', parseFloat(e.target.value) || 0)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="0.85"
              aria-label="Acidez en porcentaje"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Peso Promedio (g)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={datos.parametros_evaluados?.peso_promedio_g || ''}
              onChange={(e) => handleParametroChange('peso_promedio_g', parseFloat(e.target.value) || 0)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="180.5"
              aria-label="Peso promedio en gramos"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Diámetro (mm)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={datos.parametros_evaluados?.diametro_mm || ''}
              onChange={(e) => handleParametroChange('diametro_mm', parseFloat(e.target.value) || 0)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="65.2"
              aria-label="Diámetro en milímetros"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Escala de Maduración (1-10)
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={datos.parametros_evaluados?.maduracion_escala || ''}
              onChange={(e) => handleParametroChange('maduracion_escala', parseInt(e.target.value) || 5)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="5"
              aria-label="Escala de maduración del 1 al 10"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Defectos Externos (%)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={datos.parametros_evaluados?.defectos_externos_porcentaje || ''}
              onChange={(e) => handleParametroChange('defectos_externos_porcentaje', parseFloat(e.target.value) || 0)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="2.5"
              aria-label="Porcentaje de defectos externos"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Defectos Internos (%)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={datos.parametros_evaluados?.defectos_internos_porcentaje || ''}
              onChange={(e) => handleParametroChange('defectos_internos_porcentaje', parseFloat(e.target.value) || 0)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="1.2"
              aria-label="Porcentaje de defectos internos"
            />
          </div>
        </div>
      </div>

      {/* Certificaciones */}
      <div className="bg-purple-50 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-4">
          <FileText className="h-5 w-5 text-purple-600" />
          <h5 className="font-medium text-purple-900">Certificaciones</h5>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Certificado de Calidad
          </label>
          <input
            type="text"
            value={datos.certificado_calidad || ''}
            onChange={(e) => handleInputChange('certificado_calidad', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            placeholder="CC-2025-001"
          />
        </div>
      </div>

      {/* Tratamientos Requeridos */}
      <div className="bg-red-50 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-4">
          <ShieldCheck className="h-5 w-5 text-red-600" />
          <h5 className="font-medium text-red-900">Tratamientos Requeridos</h5>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {tratamientosList.map((tratamiento) => (
            <label key={tratamiento} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={datos.tratamientos_requeridos?.includes(tratamiento) || false}
                onChange={() => toggleTratamiento(tratamiento)}
                className="rounded border-gray-300 text-red-600 focus:ring-red-500"
              />
              <span className="text-sm text-gray-700">{tratamiento}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Observaciones */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Observaciones Técnicas
          </label>
          <textarea
            value={datos.observaciones_tecnicas || ''}
            onChange={(e) => handleInputChange('observaciones_tecnicas', e.target.value)}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Observaciones técnicas específicas del análisis de calidad..."
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Observaciones Adicionales
          </label>
          <textarea
            value={datos.observaciones || ''}
            onChange={(e) => handleInputChange('observaciones', e.target.value)}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Observaciones generales del proceso de control de calidad..."
          />
        </div>
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
            {!datos.inspector_calidad?.trim() && <li>• Inspector de calidad es requerido</li>}
            {!(datos.muestra_analizada_kg || 0 > 0) && <li>• Muestra analizada debe ser mayor a 0</li>}
            {!datos.resultado_general?.trim() && <li>• Resultado general es requerido</li>}
          </ul>
        )}
      </div>
    </div>
  )
} 