import React, { useState } from 'react'
import { Plus, Database, RefreshCw, CheckCircle, AlertCircle, X } from 'lucide-react'
import { generarLotesDemo } from '../scripts/generarLotesDemoBrowser'

interface GeneradorLotesDemoProps {
  onClose: () => void
  onLotesGenerados?: () => void
}

export default function GeneradorLotesDemo({ onClose, onLotesGenerados }: GeneradorLotesDemoProps) {
  const [cantidad, setCantidad] = useState(20)
  const [generando, setGenerando] = useState(false)
  const [progreso, setProgreso] = useState<string>('')
  const [resultado, setResultado] = useState<{
    exitoso: boolean
    mensaje: string
  } | null>(null)

  const handleGenerar = async () => {
    setGenerando(true)
    setProgreso('Iniciando generación de lotes...')
    setResultado(null)

    try {
      setProgreso('Verificando cultivos y variedades...')
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setProgreso('Creando cuarteles necesarios...')
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setProgreso(`Generando ${cantidad} lotes con eventos...`)
      await generarLotesDemo(cantidad)
      
      setProgreso('Finalizando proceso...')
      await new Promise(resolve => setTimeout(resolve, 500))

      setResultado({
        exitoso: true,
        mensaje: `Se generaron exitosamente ${cantidad} lotes de demo`
      })

      onLotesGenerados?.()

    } catch (error) {
      setResultado({
        exitoso: false,
        mensaje: `Error: ${error instanceof Error ? error.message : 'Error desconocido'}`
      })
    } finally {
      setGenerando(false)
      setProgreso('')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-lg">
        <div className="p-6 border-b bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-t-lg">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">Generar Lotes de Demo</h2>
              <p className="text-green-100 text-sm mt-1">Datos realistas chilenos</p>
            </div>
            <button 
              onClick={onClose} 
              disabled={generando} 
              className="text-white hover:text-gray-200"
              aria-label="Cerrar modal"
              title="Cerrar modal"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {!resultado && (
            <>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Cantidad de lotes a generar
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={cantidad}
                  onChange={(e) => setCantidad(parseInt(e.target.value) || 20)}
                  disabled={generando}
                  placeholder="Ingrese cantidad de lotes"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-lg text-center focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-blue-900 mb-2 flex items-center">
                  <Database className="w-4 h-4 mr-2" />
                  Datos que se crearán:
                </h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Cultivos y variedades chilenas</li>
                  <li>• Cuarteles con nomenclatura local</li>
                  <li>• Lotes con eventos completos</li>
                  <li>• Estados distribuidos realísticamente</li>
                </ul>
              </div>

              {progreso && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center">
                    <RefreshCw className="w-5 h-5 text-yellow-600 animate-spin mr-3" />
                    <span className="text-yellow-800 font-medium">{progreso}</span>
                  </div>
                </div>
              )}
            </>
          )}

          {resultado && (
            <div className={`border rounded-lg p-4 mb-4 ${
              resultado.exitoso ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-start">
                {resultado.exitoso ? (
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5" />
                )}
                <div>
                  <p className={`font-medium ${resultado.exitoso ? 'text-green-800' : 'text-red-800'}`}>
                    {resultado.exitoso ? '¡Éxito!' : 'Error'}
                  </p>
                  <p className={`text-sm ${resultado.exitoso ? 'text-green-700' : 'text-red-700'}`}>
                    {resultado.mensaje}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t bg-gray-50 rounded-b-lg">
          <div className="flex space-x-3 justify-end">
            {!resultado && (
              <>
                <button
                  onClick={onClose}
                  disabled={generando}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleGenerar}
                  disabled={generando || cantidad < 1}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  {generando ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Generando...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Generar {cantidad} Lotes</span>
                    </>
                  )}
                </button>
              </>
            )}
            
            {resultado && (
              <button
                onClick={onClose}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Cerrar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 