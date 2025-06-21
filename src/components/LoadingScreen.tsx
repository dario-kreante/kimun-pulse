import React, { useState, useEffect } from 'react'
import { Leaf, AlertCircle } from 'lucide-react'

export default function LoadingScreen() {
  const [showDebug, setShowDebug] = useState(false)
  const [timeElapsed, setTimeElapsed] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeElapsed(prev => prev + 1)
    }, 1000)

    const timer = setTimeout(() => {
      setShowDebug(true)
    }, 5000) // Mostrar debug después de 5 segundos

    return () => {
      clearInterval(interval)
      clearTimeout(timer)
    }
  }, [])

  const handleReload = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-4">
          <div className="bg-green-600 p-4 rounded-full animate-pulse">
            <Leaf className="h-12 w-12 text-white" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">KimunPulse</h2>
        <p className="text-gray-600 mb-4">El pulso vivo de tu campo</p>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
        <p className="text-sm text-gray-500 mt-4">
          Cargando... ({timeElapsed}s)
        </p>
        
        {showDebug && (
          <div className="mt-6 p-4 bg-white rounded-lg border border-orange-200 text-left">
            <div className="flex items-center space-x-2 mb-3">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <h3 className="text-sm font-medium text-gray-900">Información de Diagnóstico</h3>
            </div>
            <div className="text-xs text-gray-600 space-y-1">
              <p>• Tiempo transcurrido: {timeElapsed} segundos</p>
              <p>• Verificando conexión con Supabase...</p>
              <p>• Revisar consola del navegador para más detalles</p>
            </div>
            <button 
              onClick={handleReload}
              className="mt-3 w-full bg-orange-600 hover:bg-orange-700 text-white text-sm px-4 py-2 rounded-lg transition-colors"
            >
              Recargar Página
            </button>
          </div>
        )}
        
        <div className="mt-4 text-xs text-gray-400">
          <p>Si la carga toma más de 30 segundos, hay un problema de conectividad.</p>
          <p className="mt-1">Presiona F12 y revisa la pestaña Console para más información.</p>
        </div>
      </div>
    </div>
  )
} 