import React, { useState, useEffect } from 'react'
import { DatosEmpaque } from '../../types/eventSpecificData'
import { Package, Users, Tag, Layers } from 'lucide-react'

interface FormularioEmpaqueProps {
  datosIniciales?: Partial<DatosEmpaque>
  onDatosChange: (datos: DatosEmpaque | null) => void
  onValidacionChange: (esValido: boolean) => void
}

export default function FormularioEmpaque({
  datosIniciales,
  onDatosChange,
  onValidacionChange
}: FormularioEmpaqueProps) {
  const [datos, setDatos] = useState<Partial<DatosEmpaque>>({
    operario_nombre: '',
    turno: 'mañana',
    linea_empaque: '',
    tipo_empaque: '',
    formato_caja: '',
    etiquetas_utilizadas: [],
    codigo_plu: '',
    cantidad_cajas_producidas: 0,
    peso_promedio_caja_kg: 0,
    operarios_empaque: [],
    observaciones: '',
    ...datosIniciales
  })

  const validarFormulario = (datosActuales: Partial<DatosEmpaque>): boolean => {
    const camposRequeridos: (keyof DatosEmpaque)[] = [
      'operario_nombre',
      'turno',
      'linea_empaque',
      'tipo_empaque',
      'formato_caja',
      'cantidad_cajas_producidas',
      'peso_promedio_caja_kg'
    ]

    const todosCompletos = camposRequeridos.every(campo => {
      const valor = datosActuales[campo]
      if (typeof valor === 'string') {
        return valor.trim() !== ''
      }
      return valor !== undefined && valor !== null && valor !== 0
    })

    const cantidadValida = (datosActuales.cantidad_cajas_producidas || 0) > 0
    const pesoValido = (datosActuales.peso_promedio_caja_kg || 0) > 0

    return todosCompletos && cantidadValida && pesoValido
  }

  useEffect(() => {
    const esValido = validarFormulario(datos)
    onValidacionChange(esValido)
    
    if (esValido) {
      onDatosChange(datos as DatosEmpaque)
    } else {
      onDatosChange(null)
    }
  }, [datos, onDatosChange, onValidacionChange])

  const handleInputChange = (campo: keyof DatosEmpaque, valor: any) => {
    setDatos(prev => ({
      ...prev,
      [campo]: valor
    }))
  }

  // Función para calcular el peso total producido
  const calcularPesoTotalProducido = () => {
    const cajas = datos.cantidad_cajas_producidas || 0
    const peso = datos.peso_promedio_caja_kg || 0
    return cajas > 0 && peso > 0 ? (cajas * peso).toFixed(1) : '0'
  }

  const etiquetasComunes = [
    'Etiqueta orgánico',
    'Código de barras',
    'Etiqueta exportación',
    'Sello de calidad',
    'Certificación SAG',
    'Etiqueta trazabilidad'
  ]

  const toggleEtiqueta = (etiqueta: string) => {
    setDatos(prev => ({
      ...prev,
      etiquetas_utilizadas: prev.etiquetas_utilizadas?.includes(etiqueta)
        ? prev.etiquetas_utilizadas.filter(e => e !== etiqueta)
        : [...(prev.etiquetas_utilizadas || []), etiqueta]
    }))
  }

  const agregarOperario = () => {
    const nuevoOperario = prompt('Nombre del operario de empaque:')
    if (nuevoOperario?.trim()) {
      setDatos(prev => ({
        ...prev,
        operarios_empaque: [...(prev.operarios_empaque || []), nuevoOperario.trim()]
      }))
    }
  }

  const eliminarOperario = (index: number) => {
    setDatos(prev => ({
      ...prev,
      operarios_empaque: (prev.operarios_empaque || []).filter((_, i) => i !== index)
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

      {/* Línea de Empaque */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-4">
          <Package className="h-5 w-5 text-green-600" />
          <h5 className="font-medium text-gray-900">Línea de Empaque</h5>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Línea de Empaque *
            </label>
            <input
              type="text"
              value={datos.linea_empaque || ''}
              onChange={(e) => handleInputChange('linea_empaque', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Línea 1, Línea 2, etc."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Empaque *
            </label>
            <input
              type="text"
              value={datos.tipo_empaque || ''}
              onChange={(e) => handleInputChange('tipo_empaque', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Caja cartón, bandeja plástica, etc."
            />
          </div>
        </div>
      </div>

      {/* Formato y Especificaciones */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-4">
          <Layers className="h-5 w-5 text-yellow-600" />
          <h5 className="font-medium text-gray-900">Formato y Especificaciones</h5>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Formato de Caja *
            </label>
            <input
              type="text"
              value={datos.formato_caja || ''}
              onChange={(e) => handleInputChange('formato_caja', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              placeholder="caja 8.2kg, bandeja 500g"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Código PLU
            </label>
            <input
              type="text"
              value={datos.codigo_plu || ''}
              onChange={(e) => handleInputChange('codigo_plu', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              placeholder="4134, 3285, etc."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Peso Promedio Caja (kg) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={datos.peso_promedio_caja_kg || ''}
              onChange={(e) => handleInputChange('peso_promedio_caja_kg', parseFloat(e.target.value) || 0)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              placeholder="8.20"
              aria-label="Peso promedio de caja en kilogramos"
            />
          </div>
        </div>
      </div>

      {/* Etiquetas */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-4">
          <Tag className="h-5 w-5 text-purple-600" />
          <h5 className="font-medium text-gray-900">Etiquetas Utilizadas</h5>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {etiquetasComunes.map((etiqueta) => (
            <label key={etiqueta} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={datos.etiquetas_utilizadas?.includes(etiqueta) || false}
                onChange={() => toggleEtiqueta(etiqueta)}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">{etiqueta}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Producción */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-4">
          <Package className="h-5 w-5 text-orange-600" />
          <h5 className="font-medium text-gray-900">Producción</h5>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cantidad de Cajas Producidas *
          </label>
          <input
            type="number"
            min="1"
            value={datos.cantidad_cajas_producidas || ''}
            onChange={(e) => handleInputChange('cantidad_cajas_producidas', parseInt(e.target.value) || 0)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            placeholder="150"
            aria-label="Cantidad de cajas producidas"
          />
          <p className="text-xs text-gray-500 mt-1">
            Número total de cajas producidas en esta sesión
          </p>
          
          {/* Indicador calculado */}
          {datos.cantidad_cajas_producidas && datos.peso_promedio_caja_kg && (
            <div className="mt-3 p-2 bg-white rounded border border-orange-200">
              <p className="text-sm text-orange-700">
                <strong>Peso total producido:</strong> {calcularPesoTotalProducido()} kg
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Operarios de Empaque */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-4">
          <Users className="h-5 w-5 text-red-600" />
          <h5 className="font-medium text-gray-900">Operarios de Empaque</h5>
        </div>
        
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Equipo de Empaque
          </label>
          <button
            type="button"
            onClick={agregarOperario}
            className="text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded-lg flex items-center space-x-1 transition-colors"
          >
            <Users className="h-4 w-4" />
            <span>Agregar Operario</span>
          </button>
        </div>
        
        {datos.operarios_empaque && datos.operarios_empaque.length > 0 ? (
          <div className="space-y-2">
            {datos.operarios_empaque.map((operario, index) => (
              <div key={index} className="flex items-center justify-between bg-white border border-red-200 rounded-lg px-3 py-2">
                <span className="text-sm text-red-800">{operario}</span>
                <button
                  type="button"
                  onClick={() => eliminarOperario(index)}
                  className="text-red-600 hover:text-red-800 w-5 h-5 flex items-center justify-center rounded transition-colors"
                  aria-label="Eliminar operario"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">No hay operarios agregados aún</p>
        )}
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
          placeholder="Incidencias en la línea, calidad del empaque, problemas con etiquetas..."
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
            {!datos.linea_empaque?.trim() && <li>• Línea de empaque es requerida</li>}
            {!datos.tipo_empaque?.trim() && <li>• Tipo de empaque es requerido</li>}
            {!datos.formato_caja?.trim() && <li>• Formato de caja es requerido</li>}
            {!(datos.cantidad_cajas_producidas || 0 > 0) && <li>• Cantidad de cajas debe ser mayor a 0</li>}
            {!(datos.peso_promedio_caja_kg || 0 > 0) && <li>• Peso promedio por caja debe ser mayor a 0</li>}
          </ul>
        )}
      </div>
    </div>
  )
} 