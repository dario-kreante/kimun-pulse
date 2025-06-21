import React, { useState, useEffect } from 'react'
import { DatosDespacho } from '../../types/eventSpecificData'
import FormularioStepper, { StepData } from '../ui/FormularioStepper'
import { Send, Truck, FileText, User, Clock, Users, Package } from 'lucide-react'

interface FormularioDespachoStepperProps {
  datosIniciales?: Partial<DatosDespacho>
  onDatosChange: (datos: DatosDespacho | null) => void
  onValidacionChange: (esValido: boolean) => void
  onComplete?: () => void
}

export default function FormularioDespachoStepper({
  datosIniciales,
  onDatosChange,
  onValidacionChange,
  onComplete
}: FormularioDespachoStepperProps) {
  const [datos, setDatos] = useState<Partial<DatosDespacho>>({
    operario_nombre: '',
    turno: 'mañana',
    numero_factura: '',
    numero_guia_despacho: '',
    transportista: '',
    patente_vehiculo: '',
    conductor_nombre: '',
    conductor_licencia: '',
    destino_cliente: '',
    cantidad_pallets_despachados: 0,
    peso_total_despacho_kg: 0,
    temperatura_despacho: 2,
    hora_despacho: new Date().toTimeString().slice(0, 5),
    sello_seguridad: '',
    documentos_adjuntos: [],
    observaciones: '',
    ...datosIniciales
  })

  const [validacionPasos, setValidacionPasos] = useState({
    operario: false,
    documentacion: false,
    transporte: false,
    carga: false,
    control: false
  })

  const handleInputChange = (campo: keyof DatosDespacho, valor: any) => {
    setDatos(prev => ({
      ...prev,
      [campo]: valor
    }))
  }

  // Validaciones por paso
  useEffect(() => {
    setValidacionPasos({
      operario: !!(datos.operario_nombre?.trim()),
      documentacion: !!(datos.numero_factura?.trim() && datos.numero_guia_despacho?.trim()),
      transporte: !!(datos.transportista?.trim() && datos.patente_vehiculo?.trim() && datos.conductor_nombre?.trim() && datos.conductor_licencia?.trim()),
      carga: !!(datos.destino_cliente?.trim() && (datos.cantidad_pallets_despachados || 0) > 0 && (datos.peso_total_despacho_kg || 0) > 0),
      control: !!(datos.hora_despacho?.trim() && datos.temperatura_despacho !== undefined)
    })
  }, [datos])

  // Validación general
  const esValidoGeneral = validacionPasos.operario && validacionPasos.documentacion && validacionPasos.transporte && validacionPasos.carga && validacionPasos.control

  useEffect(() => {
    onValidacionChange(esValidoGeneral)
    if (esValidoGeneral) {
      onDatosChange(datos as DatosDespacho)
    } else {
      onDatosChange(null)
    }
  }, [datos, esValidoGeneral, onDatosChange, onValidacionChange])

  const documentosComunes = [
    'Guía de despacho', 'Factura comercial', 'Certificado SAG',
    'Packing list', 'Certificado de origen', 'Documento de transporte'
  ]

  const toggleDocumento = (documento: string) => {
    setDatos(prev => ({
      ...prev,
      documentos_adjuntos: prev.documentos_adjuntos?.includes(documento)
        ? prev.documentos_adjuntos.filter(d => d !== documento)
        : [...(prev.documentos_adjuntos || []), documento]
    }))
  }

  const pasos: StepData[] = [
    {
      id: 'operario',
      titulo: 'Operario',
      descripcion: 'Información del operario responsable del despacho',
      esValido: validacionPasos.operario,
      componente: (
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-4">
            <Users className="h-5 w-5 text-blue-600" />
            <h5 className="font-medium text-blue-900">Información del Operario</h5>
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
                Turno
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
      )
    },
    {
      id: 'documentacion',
      titulo: 'Documentos',
      descripcion: 'Documentación oficial requerida para el despacho',
      esValido: validacionPasos.documentacion,
      componente: (
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-4">
            <FileText className="h-5 w-5 text-green-600" />
            <h5 className="font-medium text-green-900">Documentación de Despacho</h5>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de Factura *
              </label>
              <input
                type="text"
                value={datos.numero_factura || ''}
                onChange={(e) => handleInputChange('numero_factura', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="FAC-2025-001"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de Guía de Despacho *
              </label>
              <input
                type="text"
                value={datos.numero_guia_despacho || ''}
                onChange={(e) => handleInputChange('numero_guia_despacho', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="GD-2025-001"
              />
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'transporte',
      titulo: 'Transporte',
      descripcion: 'Información del transporte y conductor',
      esValido: validacionPasos.transporte,
      componente: (
        <div className="space-y-6">
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-4">
              <Truck className="h-5 w-5 text-yellow-600" />
              <h5 className="font-medium text-yellow-900">Información del Transporte</h5>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transportista *
                </label>
                <input
                  type="text"
                  value={datos.transportista || ''}
                  onChange={(e) => handleInputChange('transportista', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  placeholder="Empresa de transporte"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Patente del Vehículo *
                </label>
                <input
                  type="text"
                  value={datos.patente_vehiculo || ''}
                  onChange={(e) => handleInputChange('patente_vehiculo', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  placeholder="ABCD-12"
                />
              </div>
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-4">
              <User className="h-5 w-5 text-purple-600" />
              <h5 className="font-medium text-purple-900">Información del Conductor</h5>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Conductor *
                </label>
                <input
                  type="text"
                  value={datos.conductor_nombre || ''}
                  onChange={(e) => handleInputChange('conductor_nombre', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Nombre completo del conductor"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Licencia de Conducir *
                </label>
                <input
                  type="text"
                  value={datos.conductor_licencia || ''}
                  onChange={(e) => handleInputChange('conductor_licencia', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Número de licencia"
                />
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'carga',
      titulo: 'Carga',
      descripcion: 'Información del destino y carga a despachar',
      esValido: validacionPasos.carga,
      componente: (
        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-4">
            <Package className="h-5 w-5 text-orange-600" />
            <h5 className="font-medium text-orange-900">Destino y Carga</h5>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Destino Cliente *
              </label>
              <input
                type="text"
                value={datos.destino_cliente || ''}
                onChange={(e) => handleInputChange('destino_cliente', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Nombre y dirección del cliente"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cantidad de Pallets *
              </label>
              <input
                type="number"
                min="1"
                value={datos.cantidad_pallets_despachados || ''}
                onChange={(e) => handleInputChange('cantidad_pallets_despachados', parseInt(e.target.value) || 0)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="10"
                aria-label="Cantidad de pallets despachados"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Peso Total (kg) *
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={datos.peso_total_despacho_kg || ''}
                onChange={(e) => handleInputChange('peso_total_despacho_kg', parseFloat(e.target.value) || 0)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="3936.0"
                aria-label="Peso total del despacho en kilogramos"
              />
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'control',
      titulo: 'Control Final',
      descripcion: 'Control final del despacho y documentos adicionales',
      esValido: validacionPasos.control,
      componente: (
        <div className="space-y-6">
          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-4">
              <Clock className="h-5 w-5 text-red-600" />
              <h5 className="font-medium text-red-900">Control de Despacho</h5>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hora de Despacho *
                </label>
                <input
                  type="time"
                  value={datos.hora_despacho || ''}
                  onChange={(e) => handleInputChange('hora_despacho', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  aria-label="Hora de despacho"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Temperatura de Despacho (°C) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={datos.temperatura_despacho || ''}
                  onChange={(e) => handleInputChange('temperatura_despacho', parseFloat(e.target.value) || 2)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="2.0"
                  aria-label="Temperatura al momento del despacho"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sello de Seguridad
                </label>
                <input
                  type="text"
                  value={datos.sello_seguridad || ''}
                  onChange={(e) => handleInputChange('sello_seguridad', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="SEL-2025-001"
                />
              </div>
            </div>
          </div>

          <div className="bg-cyan-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-4">
              <Send className="h-5 w-5 text-cyan-600" />
              <h5 className="font-medium text-cyan-900">Documentos Adjuntos</h5>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {documentosComunes.map((documento) => (
                <label key={documento} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={datos.documentos_adjuntos?.includes(documento) || false}
                    onChange={() => toggleDocumento(documento)}
                    className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                  />
                  <span className="text-sm text-gray-700">{documento}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observaciones Adicionales
            </label>
            <textarea
              value={datos.observaciones || ''}
              onChange={(e) => handleInputChange('observaciones', e.target.value)}
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Estado del vehículo, condiciones de carga, instrucciones especiales..."
            />
          </div>
        </div>
      )
    }
  ]

  return (
    <FormularioStepper
      pasos={pasos}
      tituloGeneral="Registro de Despacho"
      esValidoGeneral={esValidoGeneral}
      onComplete={onComplete}
    />
  )
} 