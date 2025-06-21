import React, { useState } from 'react'
import { LogOut, User, Settings, ChevronDown } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export default function Header() {
  const [showUserMenu, setShowUserMenu] = useState(false)
  const { usuario, logout, isLoading } = useAuth()

  const handleLogout = async () => {
    await logout()
    setShowUserMenu(false)
  }

  if (!usuario) return null

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo y título */}
          <div className="flex items-center space-x-3">
            <div className="bg-green-600 p-2 rounded-lg">
              <span className="text-white font-bold text-lg">KP</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">KimunPulse</h1>
              <p className="text-xs text-gray-500">Sistema de Trazabilidad</p>
            </div>
          </div>

          {/* Información del usuario */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 text-sm rounded-lg p-2 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <div className="bg-green-100 p-2 rounded-full">
                  <User className="h-4 w-4 text-green-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">{usuario.nombre}</p>
                  <p className="text-xs text-gray-500">{usuario.cargo}</p>
                </div>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>

            {/* Dropdown menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{usuario.nombre}</p>
                  <p className="text-sm text-gray-500">{usuario.email}</p>
                  <p className="text-xs text-gray-400 mt-1">{usuario.cargo}</p>
                </div>
                
                <div className="py-1">
                  <button
                    onClick={() => {
                      setShowUserMenu(false)
                      // Aquí podrías abrir un modal de perfil
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Settings className="h-4 w-4 mr-3 text-gray-400" />
                    Configuración
                  </button>
                  
                  <button
                    onClick={handleLogout}
                    disabled={isLoading}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    {isLoading ? 'Cerrando sesión...' : 'Cerrar sesión'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overlay para cerrar el menú */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </header>
  )
} 