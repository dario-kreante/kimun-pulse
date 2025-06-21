import React, { useState, useEffect } from 'react'
import { DatosEnfriado } from '../../types/eventSpecificData'
import FormularioStepper, { StepData } from '../ui/FormularioStepper'
import { Snowflake, Thermometer, Clock, Settings, Users, AlertTriangle } from 'lucide-react'

interface FormularioEnfriadoStepperProps {
  datosIniciales?: Partial<DatosEnfriado>
  onDatosChange: (datos: DatosEnfriado | null) => void
  onValidacionChange: (esValido: boolean) => void
  onComplete?: () => void
  contexto?: 'lote' | 'pallet'
  codigoPallet?: string
}

export default function FormularioEnfriadoStepper({
  datosIniciales,
  onDatosChange,
  onValidacionChange,
  onComplete,
  contexto = 'lote',
  codigoPallet
}: FormularioEnfriadoStepperProps) {
  const [datos, setDatos] = useState<Partial<DatosEnfriado>>({
    operario_nombre: '',
    turno: 'mañana',
    camara_frigorifica: '',
    temperatura_inicial: 20,
    temperatura_objetivo: 2,
    tiempo_enfriado_horas: 24,
    humedad_relativa_porcentaje: 85,
    velocidad_aire_ms: 1.5,
    sistema_control: 'automatico',
    alarmas_activadas: [],
    responsable_camara: '',
    numero_registros_temperatura: 0,
    temperatura_minima_alcanzada: 0,
    temperatura_maxima_registrada: 0,
    observaciones: '',
    ...datosIniciales
  })

  const [validacionPasos, setValidacionPasos] = useState({
    personal: false,
    camara: false,
    temperatura: false,
    ambiental: false,
    alarmas: true // Este paso es opcional
  })

  const handleInputChange = (campo: keyof DatosEnfriado, valor: any) => {
    setDatos(prev => ({
      ...prev,
      [campo]: valor
    }))
  }

  // Validaciones por paso
  useEffect(() => {
    setValidacionPasos({
      personal: !!(datos.operario_nombre?.trim() && datos.responsable_camara?.trim()),
      camara: !!(datos.camara_frigorifica?.trim() && datos.sistema_control),
      temperatura: !!(
        datos.temperatura_inicial !== undefined &&
        datos.temperatura_objetivo !== undefined &&
        datos.tiempo_enfriado_horas !== undefined &&
        datos.numero_registros_temperatura !== undefined &&
        datos.temperatura_minima_alcanzada !== undefined &&
        datos.temperatura_maxima_registrada !== undefined &&
        (datos.tiempo_enfriado_horas || 0) > 0 &&
        (datos.numero_registros_temperatura || 0) > 0
      ),
      ambiental: !!(datos.humedad_relativa_porcentaje !== undefined),
      alarmas: true // Siempre válido porque es opcional
    })
  }, [datos])

  // Validación general
  const esValidoGeneral = validacionPasos.personal && validacionPasos.camara && validacionPasos.temperatura && validacionPasos.ambiental

  useEffect(() => {
    onValidacionChange(esValidoGeneral)
    if (esValidoGeneral) {
      onDatosChange(datos as DatosEnfriado)
    } else {
      onDatosChange(null)
    }
  }, [datos, esValidoGeneral, onDatosChange, onValidacionChange])

  const alarmasComunes = [
    'Temperatura alta', 'Temperatura baja', 'Humedad alta', 'Humedad baja',
    'Falla de ventilador', 'Falla de compresor', 'Puerta abierta', 'Corte de energía'
  ]

  const toggleAlarma = (alarma: string) => {
    setDatos(prev => ({
      ...prev,
      alarmas_activadas: prev.alarmas_activadas?.includes(alarma)
        ? prev.alarmas_activadas.filter(a => a !== alarma)
        : [...(prev.alarmas_activadas || []), alarma]
    }))
  }

  const pasos: StepData[] = [
    {
      id: 'personal',
      titulo: 'Personal',
      descripcion: 'Información del personal responsable del proceso de enfriado',
      esValido: validacionPasos.personal,
      componente: (
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-4">
            <Users className="h-5 w-5 text-blue-600" />
            <h5 className="font-medium text-blue-900">Personal Responsable</h5>
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
                Responsable de Cámara *
              </label>
              <input
                type="text"
                value={datos.responsable_camara || ''}
                onChange={(e) => handleInputChange('responsable_camara', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Técnico especialista"
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
      id: 'camara',
      titulo: 'Cámara',
      descripcion: 'Identificación y configuración de la cámara frigorífica',
      esValido: validacionPasos.camara,
      componente: (
        <div className="bg-cyan-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-4">
            <Snowflake className="h-5 w-5 text-cyan-600" />
            <h5 className="font-medium text-cyan-900">Cámara Frigorífica</h5>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cámara Frigorífica *
              </label>
              <input
                type="text"
                value={datos.camara_frigorifica || ''}
                onChange={(e) => handleInputChange('camara_frigorifica', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                placeholder="Cámara A, CF-001, etc."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sistema de Control *
              </label>
                             <select
                 value={datos.sistema_control || 'automatico'}
                 onChange={(e) => handleInputChange('sistema_control', e.target.value)}
                 className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                 aria-label="Sistema de control de temperatura"
               >
                <option value="automatico">Automático</option>
                <option value="manual">Manual</option>
                <option value="mixto">Mixto</option>
              </select>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'temperatura',
      titulo: 'Temperatura',
      descripcion: 'Control crítico de temperatura requerido por SAG',
      esValido: validacionPasos.temperatura,
      componente: (
        <div className="bg-red-50 rounded-lg p-4 border-2 border-red-200">
          <div className="flex items-center space-x-2 mb-4">
            <Thermometer className="h-5 w-5 text-red-600" />
            <h5 className="font-medium text-red-900">Control de Temperatura (CRÍTICO SAG)</h5>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Temperatura Inicial (°C) *
              </label>
              <input
                type="number"
                step="0.1"
                value={datos.temperatura_inicial || ''}
                onChange={(e) => handleInputChange('temperatura_inicial', parseFloat(e.target.value) || 20)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="20.0"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Temperatura Objetivo (°C) *
              </label>
              <input
                type="number"
                step="0.1"
                value={datos.temperatura_objetivo || ''}
                onChange={(e) => handleInputChange('temperatura_objetivo', parseFloat(e.target.value) || 2)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="2.0"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tiempo de Enfriado (horas) *
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={datos.tiempo_enfriado_horas || ''}
                onChange={(e) => handleInputChange('tiempo_enfriado_horas', parseFloat(e.target.value) || 24)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="24.0"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Temperatura Mínima Alcanzada (°C) *
              </label>
              <input
                type="number"
                step="0.1"
                value={datos.temperatura_minima_alcanzada || ''}
                onChange={(e) => handleInputChange('temperatura_minima_alcanzada', parseFloat(e.target.value) || 0)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="1.8"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Temperatura Máxima Registrada (°C) *
              </label>
              <input
                type="number"
                step="0.1"
                value={datos.temperatura_maxima_registrada || ''}
                onChange={(e) => handleInputChange('temperatura_maxima_registrada', parseFloat(e.target.value) || 0)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="2.5"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                N° Registros de Temperatura *
              </label>
              <input
                type="number"
                min="1"
                value={datos.numero_registros_temperatura || ''}
                onChange={(e) => handleInputChange('numero_registros_temperatura', parseInt(e.target.value) || 0)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="48"
              />
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'ambiental',
      titulo: 'Ambiente',
      descripcion: 'Control de condiciones ambientales de la cámara',
      esValido: validacionPasos.ambiental,
      componente: (
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-4">
            <Settings className="h-5 w-5 text-green-600" />
            <h5 className="font-medium text-green-900">Control Ambiental</h5>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Humedad Relativa (%) *
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={datos.humedad_relativa_porcentaje || ''}
                onChange={(e) => handleInputChange('humedad_relativa_porcentaje', parseInt(e.target.value) || 85)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="85"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Velocidad del Aire (m/s)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={datos.velocidad_aire_ms || ''}
                onChange={(e) => handleInputChange('velocidad_aire_ms', parseFloat(e.target.value) || 1.5)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="1.5"
              />
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'alarmas',
      titulo: 'Alarmas',
      descripcion: 'Registro de alarmas y observaciones (opcional)',
      esValido: validacionPasos.alarmas,
      esOpcional: true,
      componente: (
        <div className="space-y-6">
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <h5 className="font-medium text-orange-900">Alarmas Activadas</h5>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {alarmasComunes.map((alarma) => (
                <label key={alarma} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={datos.alarmas_activadas?.includes(alarma) || false}
                    onChange={() => toggleAlarma(alarma)}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="text-sm text-gray-700">{alarma}</span>
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
              placeholder="Incidencias durante el enfriado, comportamiento del equipo, anomalías detectadas..."
            />
          </div>
        </div>
      )
    }
  ]

  const tituloGeneral = contexto === 'pallet' && codigoPallet
    ? `Enfriado - Pallet ${codigoPallet}`
    : "Registro de Enfriado"

  return (
    <div className="space-y-4">
      {/* Información específica del contexto */}
      {contexto === 'pallet' && codigoPallet && (
        <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Snowflake className="h-5 w-5 text-cyan-600" />
            <h5 className="font-medium text-cyan-900">Enfriado - Pallet Individual</h5>
          </div>
          <p className="text-sm text-cyan-700 mt-1">
            Configurando proceso de enfriado para pallet específico: <span className="font-medium">{codigoPallet}</span>
          </p>
        </div>
      )}

      <FormularioStepper
        pasos={pasos}
        tituloGeneral={tituloGeneral}
        esValidoGeneral={esValidoGeneral}
        onComplete={onComplete}
      />
    </div>
  )
} 