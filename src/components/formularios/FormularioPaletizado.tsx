import React, { useState, useEffect } from 'react'
import { DatosPaletizado } from '../../types/eventSpecificData'
import { Grid3X3, Package, FileText, Scale, Users, MapPin, AlertTriangle, CheckCircle, Wand2, RefreshCw, Plus, Trash2 } from 'lucide-react'
import { generarProximoPallet, validarCodigo } from '../../utils/codigoGenerator'

interface FormularioPaletizadoProps {
  datosIniciales?: Partial<DatosPaletizado>
  onDatosChange: (datos: DatosPaletizado | null) => void
  onValidacionChange: (esValido: boolean) => void
}

// Interface para múltiples pallets
interface PalletIndividual {
  numero_pallet: string
  cantidad_cajas_lote: number
  peso_lote_en_pallet_kg: number
  pallet_mixto: boolean
  total_cajas_pallet?: number
  peso_total_pallet_kg?: number
  lotes_consolidados?: string[]
  posicion_en_pallet?: string
  estado_etiquetado: string
  observaciones_pallet?: string
}

export default function FormularioPaletizado({
  datosIniciales,
  onDatosChange,
  onValidacionChange
}: FormularioPaletizadoProps) {
  const [datos, setDatos] = useState<Partial<DatosPaletizado>>({
    operario_nombre: '',
    turno: 'mañana',
    tipo_pallet: 'madera',
    destino_inicial: '',
    control_peso_verificado: false,
    observaciones_paletizado: '',
    observaciones: '',
    ...datosIniciales
  })

  // Estado para múltiples pallets
  const [pallets, setPallets] = useState<PalletIndividual[]>([{
    numero_pallet: '',
    cantidad_cajas_lote: 0,
    peso_lote_en_pallet_kg: 0,
    pallet_mixto: false,
    estado_etiquetado: 'pendiente'
  }])

  const [generandoCodigo, setGenerandoCodigo] = useState<number | null>(null)
  const [validacionGeneral, setValidacionGeneral] = useState({
    valido: true,
    errores: [] as string[]
  })

  // Estado para evitar códigos duplicados en la misma sesión
  const [ultimoSecuencialGenerado, setUltimoSecuencialGenerado] = useState<number | null>(null)

  const validarFormulario = (): boolean => {
    const errores: string[] = []

    // Validar datos generales
    if (!datos.operario_nombre?.trim()) errores.push('Operario responsable es requerido')
    if (!datos.tipo_pallet?.trim()) errores.push('Tipo de pallet es requerido')
    if (!datos.destino_inicial?.trim()) errores.push('Destino inicial es requerido')

    // Validar cada pallet
    const palletsValidos = pallets.every((pallet, index) => {
      if (!pallet.numero_pallet?.trim()) {
        errores.push(`Pallet ${index + 1}: Número de pallet es requerido`)
        return false
      }
      if (pallet.cantidad_cajas_lote <= 0) {
        errores.push(`Pallet ${index + 1}: Cantidad de cajas debe ser mayor a 0`)
        return false
      }
      if (pallet.peso_lote_en_pallet_kg <= 0) {
        errores.push(`Pallet ${index + 1}: Peso debe ser mayor a 0`)
        return false
      }
      if (pallet.pallet_mixto) {
        if (!pallet.total_cajas_pallet || pallet.total_cajas_pallet < pallet.cantidad_cajas_lote) {
          errores.push(`Pallet ${index + 1}: Total de cajas en pallet mixto debe ser mayor o igual a las cajas del lote`)
          return false
        }
        if (!pallet.peso_total_pallet_kg || pallet.peso_total_pallet_kg < pallet.peso_lote_en_pallet_kg) {
          errores.push(`Pallet ${index + 1}: Peso total del pallet mixto debe ser mayor o igual al peso del lote`)
          return false
        }
      }
      return true
    })

    // Validar que no haya códigos duplicados
    const codigosPallet = pallets.map(p => p.numero_pallet).filter(c => c.trim())
    const codigosUnicos = new Set(codigosPallet)
    if (codigosPallet.length !== codigosUnicos.size) {
      errores.push('No puede haber códigos de pallet duplicados')
    }

    setValidacionGeneral({ valido: errores.length === 0, errores })
    return errores.length === 0 && palletsValidos
  }

  useEffect(() => {
    const esValido = validarFormulario()
    onValidacionChange(esValido)
    
    if (esValido && pallets.length > 0) {
      // Crear datos consolidados para el evento
      const datosConsolidados: DatosPaletizado = {
        ...datos,
        // Usar datos del primer pallet como referencia principal
        numero_pallet: pallets[0].numero_pallet,
        cantidad_cajas_lote: pallets.reduce((sum, p) => sum + p.cantidad_cajas_lote, 0),
        peso_lote_en_pallet_kg: pallets.reduce((sum, p) => sum + p.peso_lote_en_pallet_kg, 0),
        pallet_mixto: pallets.some(p => p.pallet_mixto),
        estado_etiquetado: pallets.every(p => p.estado_etiquetado === 'completo') ? 'completo' : 'pendiente',
        // Datos adicionales para múltiples pallets
        pallets_generados: pallets,
        cantidad_pallets_generados: pallets.length,
        resumen_pallets: pallets.map(p => ({
          codigo: p.numero_pallet,
          cajas: p.cantidad_cajas_lote,
          peso: p.peso_lote_en_pallet_kg,
          mixto: p.pallet_mixto
        }))
      } as DatosPaletizado

      onDatosChange(datosConsolidados)
    } else {
      onDatosChange(null)
    }
  }, [datos, pallets, onDatosChange, onValidacionChange])

  const handleDatosGeneralesChange = (campo: keyof DatosPaletizado, valor: any) => {
    setDatos(prev => ({ ...prev, [campo]: valor }))
  }

  const handlePalletChange = (index: number, campo: keyof PalletIndividual, valor: any) => {
    setPallets(prev => prev.map((pallet, i) => {
      if (i !== index) return pallet
      
      const newPallet = { ...pallet, [campo]: valor }
      
      // Auto-completar datos si no es pallet mixto
      if (campo === 'pallet_mixto' && !valor) {
        newPallet.total_cajas_pallet = newPallet.cantidad_cajas_lote || 0
        newPallet.peso_total_pallet_kg = newPallet.peso_lote_en_pallet_kg || 0
        newPallet.lotes_consolidados = []
      }
      
      return newPallet
    }))
  }

  const generarCodigoAutomatico = async (index: number): Promise<void> => {
    try {
      setGenerandoCodigo(index)
      
      // SOLUCIÓN: Generar código considerando secuenciales ya usados en esta sesión
      let secuencialAUsar = ultimoSecuencialGenerado
      
      if (secuencialAUsar === null) {
        // Primera vez: obtener desde la base de datos
      const resultado = await generarProximoPallet()
        if (!resultado.valido) {
          console.error('Error generando código:', resultado.errores)
          return
        }
        secuencialAUsar = resultado.secuencial
      } else {
        // Usar el siguiente secuencial disponible
        secuencialAUsar = secuencialAUsar + 1
      }
      
      // Generar código con secuencial específico
      const año = new Date().getFullYear()
      const codigoGenerado = `PAL-${año}-CHIL-${secuencialAUsar.toString().padStart(5, '0')}`
      
      // Verificar que no esté duplicado en los pallets actuales
      const codigosExistentes = pallets.map(p => p.numero_pallet).filter(c => c.trim())
      if (codigosExistentes.includes(codigoGenerado)) {
        // Si está duplicado, incrementar y volver a intentar
        setUltimoSecuencialGenerado(secuencialAUsar + 1)
        return generarCodigoAutomatico(index)
      }
      
      // Actualizar el último secuencial usado
      setUltimoSecuencialGenerado(secuencialAUsar)
      
      // Aplicar el código al pallet
      handlePalletChange(index, 'numero_pallet', codigoGenerado)
      
      console.log(`✅ Código generado para pallet ${index + 1}: ${codigoGenerado} (secuencial: ${secuencialAUsar})`)
      
    } catch (error) {
      console.error('Error generando código automático:', error)
      alert('Error al generar código automático. Por favor, ingrésalo manualmente.')
    } finally {
      setGenerandoCodigo(null)
    }
  }

  const agregarPallet = () => {
    setPallets(prev => [...prev, {
      numero_pallet: '',
      cantidad_cajas_lote: 0,
      peso_lote_en_pallet_kg: 0,
      pallet_mixto: false,
      estado_etiquetado: 'pendiente'
    }])
  }

  const eliminarPallet = (index: number) => {
    if (pallets.length > 1) {
      setPallets(prev => prev.filter((_, i) => i !== index))
    }
  }

  const calcularTotales = () => {
    return {
      totalCajas: pallets.reduce((sum, p) => sum + (p.cantidad_cajas_lote || 0), 0),
      totalPeso: pallets.reduce((sum, p) => sum + (p.peso_lote_en_pallet_kg || 0), 0),
      totalPallets: pallets.length,
      promedioKgPorCaja: pallets.length > 0 ? 
        (pallets.reduce((sum, p) => sum + (p.peso_lote_en_pallet_kg || 0), 0) / 
         pallets.reduce((sum, p) => sum + (p.cantidad_cajas_lote || 0), 1)).toFixed(2) : '0'
    }
  }

  const totales = calcularTotales()

  return (
    <div className="space-y-6">
      {/* Información General del Operario */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-4">
          <Users className="h-5 w-5 text-blue-600" />
          <h5 className="font-medium text-gray-900">Información General</h5>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Operario Responsable *
            </label>
            <input
              type="text"
              value={datos.operario_nombre || ''}
              onChange={(e) => handleDatosGeneralesChange('operario_nombre', e.target.value)}
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
              onChange={(e) => handleDatosGeneralesChange('turno', e.target.value)}
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
              Tipo de Pallet *
            </label>
            <select
              value={datos.tipo_pallet || 'madera'}
              onChange={(e) => handleDatosGeneralesChange('tipo_pallet', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              aria-label="Tipo de pallet"
            >
              <option value="madera">Madera</option>
              <option value="plastico">Plástico</option>
              <option value="carton">Cartón</option>
              <option value="mixto">Mixto</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Destino Inicial *
          </label>
          <input
            type="text"
            value={datos.destino_inicial || ''}
            onChange={(e) => handleDatosGeneralesChange('destino_inicial', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Cliente destino, puerto, etc."
          />
        </div>
      </div>

      {/* Resumen de Totales */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Scale className="h-5 w-5 text-indigo-600" />
          <h5 className="font-medium text-indigo-900">Resumen del Paletizado</h5>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="bg-white rounded p-3 border border-indigo-200">
            <p className="text-indigo-600 font-medium">Pallets Generados</p>
            <p className="text-2xl font-bold text-indigo-900">{totales.totalPallets}</p>
          </div>
          <div className="bg-white rounded p-3 border border-indigo-200">
            <p className="text-indigo-600 font-medium">Total Cajas</p>
            <p className="text-2xl font-bold text-indigo-900">{totales.totalCajas}</p>
          </div>
          <div className="bg-white rounded p-3 border border-indigo-200">
            <p className="text-indigo-600 font-medium">Peso Total</p>
            <p className="text-2xl font-bold text-indigo-900">{totales.totalPeso.toFixed(1)} kg</p>
          </div>
          <div className="bg-white rounded p-3 border border-indigo-200">
            <p className="text-indigo-600 font-medium">Promedio kg/caja</p>
            <p className="text-2xl font-bold text-indigo-900">{totales.promedioKgPorCaja}</p>
          </div>
        </div>
      </div>

      {/* Gestión de Pallets Individuales */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Grid3X3 className="h-5 w-5 text-green-600" />
            <h5 className="font-medium text-gray-900">Pallets Generados ({pallets.length})</h5>
          </div>
          <button
            type="button"
            onClick={agregarPallet}
            className="flex items-center space-x-2 bg-green-100 hover:bg-green-200 text-green-800 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Agregar Pallet</span>
          </button>
        </div>

        <div className="space-y-4">
          {pallets.map((pallet, index) => (
            <div key={index} className="border border-gray-300 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h6 className="font-medium text-gray-900">Pallet #{index + 1}</h6>
                {pallets.length > 1 && (
                  <button
                    type="button"
                    onClick={() => eliminarPallet(index)}
                    className="text-red-600 hover:text-red-800 p-1 rounded"
                    aria-label="Eliminar pallet"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Código de Pallet */}
                <div className="lg:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Código del Pallet *
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={pallet.numero_pallet || ''}
                      onChange={(e) => handlePalletChange(index, 'numero_pallet', e.target.value)}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="PAL-2025-CHIL-00001"
                    />
                    <button
                      type="button"
                      onClick={() => generarCodigoAutomatico(index)}
                      disabled={generandoCodigo === index}
                      className="flex items-center space-x-1 bg-green-100 hover:bg-green-200 disabled:opacity-50 text-green-800 px-3 py-2 rounded-lg text-sm transition-colors"
                    >
                      {generandoCodigo === index ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Wand2 className="h-4 w-4" />
                      )}
                      <span>Auto</span>
                    </button>
                  </div>
                </div>

                {/* Cantidad y Peso */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cajas del Lote *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={pallet.cantidad_cajas_lote || ''}
                    onChange={(e) => handlePalletChange(index, 'cantidad_cajas_lote', parseInt(e.target.value) || 0)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="120"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Peso del Lote (kg) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={pallet.peso_lote_en_pallet_kg || ''}
                    onChange={(e) => handlePalletChange(index, 'peso_lote_en_pallet_kg', parseFloat(e.target.value) || 0)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="984.0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado Etiquetado
                  </label>
                  <select
                    value={pallet.estado_etiquetado || 'pendiente'}
                    onChange={(e) => handlePalletChange(index, 'estado_etiquetado', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    aria-label="Estado del etiquetado del pallet"
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="en_proceso">En Proceso</option>
                    <option value="completo">Completo</option>
                  </select>
                </div>

                {/* Pallet Mixto */}
                <div className="lg:col-span-3">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pallet.pallet_mixto || false}
                      onChange={(e) => handlePalletChange(index, 'pallet_mixto', e.target.checked)}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Pallet Mixto (contiene fruta de otros lotes)</span>
                  </label>
                </div>

                {/* Campos adicionales para pallet mixto */}
                {pallet.pallet_mixto && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Total Cajas en Pallet
                      </label>
                      <input
                        type="number"
                        min={pallet.cantidad_cajas_lote || 0}
                        value={pallet.total_cajas_pallet || ''}
                        onChange={(e) => handlePalletChange(index, 'total_cajas_pallet', parseInt(e.target.value) || 0)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                        placeholder="150"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Peso Total Pallet (kg)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min={pallet.peso_lote_en_pallet_kg || 0}
                        value={pallet.peso_total_pallet_kg || ''}
                        onChange={(e) => handlePalletChange(index, 'peso_total_pallet_kg', parseFloat(e.target.value) || 0)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                        placeholder="1230.0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Otros Lotes Consolidados
                      </label>
                      <input
                        type="text"
                        value={pallet.lotes_consolidados?.join(', ') || ''}
                        onChange={(e) => {
                          const lotes = e.target.value.split(',').map(l => l.trim()).filter(l => l.length > 0)
                          handlePalletChange(index, 'lotes_consolidados', lotes)
                        }}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                        placeholder="LP-2025-CHIL-023, LP-2025-CHIL-024"
                      />
                    </div>
                  </>
                )}

                {/* Observaciones del pallet */}
                <div className="lg:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Observaciones del Pallet
                  </label>
                  <textarea
                    value={pallet.observaciones_pallet || ''}
                    onChange={(e) => handlePalletChange(index, 'observaciones_pallet', e.target.value)}
                    rows={2}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Observaciones específicas de este pallet..."
                  />
                </div>
              </div>

              {/* Indicadores calculados por pallet */}
              {pallet.cantidad_cajas_lote > 0 && pallet.peso_lote_en_pallet_kg > 0 && (
                <div className="mt-3 p-2 bg-white rounded border border-green-200">
                  <p className="text-sm text-green-700">
                    <strong>Promedio kg/caja:</strong> {(pallet.peso_lote_en_pallet_kg / pallet.cantidad_cajas_lote).toFixed(2)} kg
                    {pallet.pallet_mixto && pallet.total_cajas_pallet && (
                      <span className="ml-4">
                        <strong>Porcentaje del lote:</strong> {((pallet.cantidad_cajas_lote / pallet.total_cajas_pallet) * 100).toFixed(1)}%
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Control de Peso */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-4">
          <Scale className="h-5 w-5 text-purple-600" />
          <h5 className="font-medium text-gray-900">Control de Peso y Calidad</h5>
        </div>

        <div className="space-y-4">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={datos.control_peso_verificado || false}
              onChange={(e) => handleDatosGeneralesChange('control_peso_verificado', e.target.checked)}
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <span className="text-sm font-medium text-gray-700">Control de peso verificado</span>
          </label>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observaciones del Paletizado
            </label>
            <textarea
              value={datos.observaciones_paletizado || ''}
              onChange={(e) => handleDatosGeneralesChange('observaciones_paletizado', e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="Observaciones generales del proceso de paletizado..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observaciones Adicionales
            </label>
            <textarea
              value={datos.observaciones || ''}
              onChange={(e) => handleDatosGeneralesChange('observaciones', e.target.value)}
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="Otras observaciones..."
            />
          </div>
        </div>
      </div>

      {/* Indicador de validación */}
      <div className={`p-4 rounded-lg text-sm border ${
        validacionGeneral.valido
          ? 'bg-green-50 text-green-800 border-green-200' 
          : 'bg-red-50 text-red-800 border-red-200'
      }`}>
        <div className="flex items-center space-x-2 mb-2">
          <div className={`w-2 h-2 rounded-full ${
            validacionGeneral.valido ? 'bg-green-500' : 'bg-red-500'
          }`}></div>
          <span className="font-medium">
            {validacionGeneral.valido 
              ? `✓ Formulario completo - ${totales.totalPallets} pallet(s) listo(s) para crear`
              : 'Completa la información faltante'
            }
          </span>
        </div>
        {!validacionGeneral.valido && validacionGeneral.errores.length > 0 && (
          <ul className="ml-4 text-xs space-y-1">
            {validacionGeneral.errores.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
} 