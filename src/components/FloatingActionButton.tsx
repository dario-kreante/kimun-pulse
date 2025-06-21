import React, { useState } from 'react'
import { QrCode, Plus, X } from 'lucide-react'

interface FloatingActionButtonProps {
  onScanClick: () => void
  onAddEventClick?: () => void
}

export default function FloatingActionButton({ 
  onScanClick, 
  onAddEventClick 
}: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleScanClick = () => {
    setIsOpen(false)
    onScanClick()
  }

  const handleAddEventClick = () => {
    setIsOpen(false)
    if (onAddEventClick) {
      onAddEventClick()
    }
  }

  return (
    <div className="fixed bottom-20 right-4 z-40">
      {/* Opciones del menú */}
      {isOpen && (
        <div className="space-y-3 mb-3 animate-in slide-in-from-bottom-2 duration-200">
          {onAddEventClick && (
            <div className="flex items-center space-x-3">
              <span className="bg-gray-900 text-white text-sm px-3 py-1 rounded-lg whitespace-nowrap">
                Nuevo Evento
              </span>
              <button
                onClick={handleAddEventClick}
                className="bg-purple-600 hover:bg-purple-700 text-white rounded-full p-3 shadow-lg 
                           transition-all duration-200 transform hover:scale-105 active:scale-95
                           focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
                aria-label="Agregar nuevo evento"
                title="Agregar nuevo evento"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          )}
          
          <div className="flex items-center space-x-3">
            <span className="bg-gray-900 text-white text-sm px-3 py-1 rounded-lg whitespace-nowrap">
              Escanear Código
            </span>
            <button
              onClick={handleScanClick}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg 
                         transition-all duration-200 transform hover:scale-105 active:scale-95
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              aria-label="Escanear código QR"
              title="Escanear código QR"
            >
              <QrCode className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Botón principal */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          bg-green-600 hover:bg-green-700 text-white rounded-full p-4 shadow-lg 
          transition-all duration-300 transform hover:scale-105 active:scale-95
          focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50
          ${isOpen ? 'rotate-45' : 'rotate-0'}
          w-14 h-14 flex items-center justify-center
        `}
        aria-label={isOpen ? "Cerrar menú de acciones" : "Abrir menú de acciones"}
        title={isOpen ? "Cerrar menú de acciones" : "Abrir menú de acciones"}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <QrCode className="h-6 w-6" />
        )}
      </button>

      {/* Overlay para cerrar el menú */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[-1]" 
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  )
} 