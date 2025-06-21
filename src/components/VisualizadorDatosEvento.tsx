import React from 'react'
import { 
  User, 
  Clock, 
  Thermometer, 
  Droplets, 
  Package, 
  Scale, 
  MapPin, 
  FileText, 
  Grid3X3,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react'

interface VisualizadorDatosEventoProps {
  datos: any
  tipoEvento: string
}

export default function VisualizadorDatosEvento({ datos, tipoEvento }: VisualizadorDatosEventoProps) {
  if (!datos || typeof datos !== 'object') {
    return (
      <div className="text-gray-500 text-sm italic">
        Sin datos adicionales
      </div>
    )
  }

  // Campos base comunes a todos los eventos
  const renderCamposBase = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {datos.operario_nombre && (
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4 text-blue-600 flex-shrink-0" />
          <div>
            <div className="text-xs text-gray-500">Operario</div>
            <div className="font-medium text-gray-900">{datos.operario_nombre}</div>
          </div>
        </div>
      )}
      
      {datos.turno && (
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-purple-600 flex-shrink-0" />
          <div>
            <div className="text-xs text-gray-500">Turno</div>
            <div className="font-medium text-gray-900 capitalize">{datos.turno}</div>
          </div>
        </div>
      )}
      
      {datos.temperatura_ambiente && (
        <div className="flex items-center space-x-2">
          <Thermometer className="h-4 w-4 text-red-600 flex-shrink-0" />
          <div>
            <div className="text-xs text-gray-500">Temperatura</div>
            <div className="font-medium text-gray-900">{datos.temperatura_ambiente}°C</div>
          </div>
        </div>
      )}
      
      {datos.humedad_relativa && (
        <div className="flex items-center space-x-2">
          <Droplets className="h-4 w-4 text-blue-600 flex-shrink-0" />
          <div>
            <div className="text-xs text-gray-500">Humedad</div>
            <div className="font-medium text-gray-900">{datos.humedad_relativa}%</div>
          </div>
        </div>
      )}
    </div>
  )

  // Renderizadores específicos por tipo de evento
  const renderDatosEnfriado = () => (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-900 flex items-center space-x-2">
        <Thermometer className="h-4 w-4 text-blue-600" />
        <span>Control de Enfriado</span>
      </h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {datos.camara_numero && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-xs text-blue-600 font-medium">CÁMARA</div>
            <div className="text-lg font-bold text-blue-900">#{datos.camara_numero}</div>
          </div>
        )}
        
        {datos.temperatura_inicial && (
          <div className="bg-red-50 p-3 rounded-lg">
            <div className="text-xs text-red-600 font-medium">TEMP. INICIAL</div>
            <div className="text-lg font-bold text-red-900">{datos.temperatura_inicial}°C</div>
          </div>
        )}
        
        {datos.temperatura_objetivo && (
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="text-xs text-green-600 font-medium">TEMP. OBJETIVO</div>
            <div className="text-lg font-bold text-green-900">{datos.temperatura_objetivo}°C</div>
          </div>
        )}
        
        {datos.tiempo_estimado_enfriado && (
          <div className="bg-purple-50 p-3 rounded-lg">
            <div className="text-xs text-purple-600 font-medium">TIEMPO ESTIMADO</div>
            <div className="text-lg font-bold text-purple-900">{datos.tiempo_estimado_enfriado}h</div>
          </div>
        )}
      </div>
      
      {datos.sistema_ventilacion && (
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span className="font-medium">Sistema de Ventilación</span>
          <span className="text-sm px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
            {datos.sistema_ventilacion}
          </span>
        </div>
      )}
    </div>
  )

  const renderDatosPaletizado = () => (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-900 flex items-center space-x-2">
        <Grid3X3 className="h-4 w-4 text-green-600" />
        <span>Información del Pallet</span>
      </h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {datos.numero_pallet && (
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="text-xs text-green-600 font-medium">CÓDIGO PALLET</div>
            <div className="text-lg font-bold text-green-900 font-mono">{datos.numero_pallet}</div>
          </div>
        )}
        
        {datos.cantidad_cajas_lote && (
          <div className="bg-orange-50 p-3 rounded-lg">
            <div className="text-xs text-orange-600 font-medium">CAJAS DEL LOTE</div>
            <div className="text-lg font-bold text-orange-900">{datos.cantidad_cajas_lote}</div>
          </div>
        )}
        
        {datos.peso_lote_en_pallet_kg && (
          <div className="bg-purple-50 p-3 rounded-lg">
            <div className="text-xs text-purple-600 font-medium">PESO LOTE</div>
            <div className="text-lg font-bold text-purple-900">{datos.peso_lote_en_pallet_kg} kg</div>
          </div>
        )}
        
        {datos.tipo_pallet && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-xs text-gray-600 font-medium">TIPO PALLET</div>
            <div className="text-lg font-bold text-gray-900 capitalize">{datos.tipo_pallet}</div>
          </div>
        )}
      </div>
      
      {datos.pallet_mixto && (
        <div className="flex items-center space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <div>
            <div className="font-medium text-yellow-800">Pallet Mixto</div>
            <div className="text-sm text-yellow-700">
              Total: {datos.total_cajas_pallet} cajas, {datos.peso_total_pallet_kg} kg
            </div>
          </div>
        </div>
      )}
      
      {datos.destino_inicial && (
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-blue-600" />
            <span className="font-medium">Destino</span>
          </div>
          <span className="text-sm px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
            {datos.destino_inicial}
          </span>
        </div>
      )}
    </div>
  )

  const renderDatosControlCalidad = () => (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-900 flex items-center space-x-2">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <span>Control de Calidad</span>
      </h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {datos.muestra_analizada && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-xs text-blue-600 font-medium">MUESTRA</div>
            <div className="text-lg font-bold text-blue-900">{datos.muestra_analizada}</div>
          </div>
        )}
        
        {datos.resultado_calidad && (
          <div className={`p-3 rounded-lg ${
            datos.resultado_calidad.toLowerCase().includes('aprobado') || datos.resultado_calidad.toLowerCase().includes('conforme')
              ? 'bg-green-50 text-green-900'
              : datos.resultado_calidad.toLowerCase().includes('rechazado') || datos.resultado_calidad.toLowerCase().includes('no conforme')
              ? 'bg-red-50 text-red-900'
              : 'bg-yellow-50 text-yellow-900'
          }`}>
            <div className="text-xs font-medium opacity-70">RESULTADO</div>
            <div className="text-lg font-bold">{datos.resultado_calidad}</div>
          </div>
        )}
      </div>
      
      {datos.observaciones_calidad && (
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-600 font-medium mb-1">OBSERVACIONES</div>
          <div className="text-sm text-gray-800">{datos.observaciones_calidad}</div>
        </div>
      )}
    </div>
  )

  const renderDatosDespacho = () => (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-900 flex items-center space-x-2">
        <Package className="h-4 w-4 text-purple-600" />
        <span>Información de Despacho</span>
      </h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {datos.vehiculo_patente && (
          <div className="bg-purple-50 p-3 rounded-lg">
            <div className="text-xs text-purple-600 font-medium">VEHÍCULO</div>
            <div className="text-lg font-bold text-purple-900 font-mono">{datos.vehiculo_patente}</div>
          </div>
        )}
        
        {datos.conductor_nombre && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-xs text-blue-600 font-medium">CONDUCTOR</div>
            <div className="text-lg font-bold text-blue-900">{datos.conductor_nombre}</div>
          </div>
        )}
        
        {datos.destino_final && (
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="text-xs text-green-600 font-medium">DESTINO</div>
            <div className="text-lg font-bold text-green-900">{datos.destino_final}</div>
          </div>
        )}
        
        {datos.numero_guia && (
          <div className="bg-orange-50 p-3 rounded-lg">
            <div className="text-xs text-orange-600 font-medium">GUÍA</div>
            <div className="text-lg font-bold text-orange-900 font-mono">{datos.numero_guia}</div>
          </div>
        )}
      </div>
    </div>
  )

  const renderDatosGenericos = () => {
    const camposEspeciales = new Set([
      'operario_nombre', 'turno', 'temperatura_ambiente', 'humedad_relativa',
      'observaciones', 'created_at', 'updated_at'
    ])
    
    const datosRestantes = Object.entries(datos).filter(([key]) => !camposEspeciales.has(key))
    
    if (datosRestantes.length === 0) return null
    
    return (
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900 flex items-center space-x-2">
          <Info className="h-4 w-4 text-gray-600" />
          <span>Información Adicional</span>
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {datosRestantes.map(([key, value]) => (
            <div key={key} className="bg-gray-50 p-3 rounded-lg">
              <div className="text-xs text-gray-600 font-medium mb-1">
                {key.replace(/_/g, ' ').toUpperCase()}
              </div>
              <div className="text-sm text-gray-900">
                {typeof value === 'boolean' ? (value ? 'Sí' : 'No') :
                 Array.isArray(value) ? value.join(', ') :
                 value != null ? String(value) : 'N/A'}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderObservaciones = () => {
    if (!datos.observaciones) return null
    
    return (
      <div className="space-y-2">
        <h4 className="font-medium text-gray-900 flex items-center space-x-2">
          <FileText className="h-4 w-4 text-gray-600" />
          <span>Observaciones</span>
        </h4>
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-sm text-gray-800 whitespace-pre-wrap">{datos.observaciones}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Campos base siempre visibles */}
      {renderCamposBase()}
      
      {/* Contenido específico por tipo de evento */}
      {tipoEvento === 'Enfriado' && renderDatosEnfriado()}
      {tipoEvento === 'Paletizado' && renderDatosPaletizado()}
      {tipoEvento === 'Control Calidad' && renderDatosControlCalidad()}
      {tipoEvento === 'Despacho' && renderDatosDespacho()}
      
      {/* Datos genéricos para otros tipos de evento */}
      {!['Enfriado', 'Paletizado', 'Control Calidad', 'Despacho'].includes(tipoEvento) && renderDatosGenericos()}
      
      {/* Observaciones al final */}
      {renderObservaciones()}
    </div>
  )
} 