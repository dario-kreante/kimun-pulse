import React from 'react'
import { LucideIcon } from 'lucide-react'

interface QuickActionProps {
  icon: LucideIcon
  label: string
  color: 'blue' | 'green' | 'purple' | 'gray'
  onClick: () => void
  disabled?: boolean
}

export default function QuickAction({ 
  icon: Icon, 
  label, 
  color, 
  onClick, 
  disabled = false 
}: QuickActionProps) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-700 hover:bg-blue-200 active:bg-blue-300',
    green: 'bg-green-100 text-green-700 hover:bg-green-200 active:bg-green-300',
    purple: 'bg-purple-100 text-purple-700 hover:bg-purple-200 active:bg-purple-300',
    gray: 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
  }

  const disabledClasses = disabled 
    ? 'bg-gray-50 text-gray-400 cursor-not-allowed' 
    : colorClasses[color]

  const handleClick = () => {
    if (disabled) return
    
    // Feedback háptico para dispositivos móviles
    if (navigator.vibrate) {
      navigator.vibrate(50)
    }
    
    onClick()
  }

  return (
    <button 
      onClick={handleClick}
      disabled={disabled}
      className={`
        flex flex-col items-center justify-center
        p-4 rounded-lg transition-all duration-200
        min-h-[88px] space-y-2
        ${disabledClasses}
        ${!disabled && 'transform hover:scale-105 active:scale-95 active:bg-opacity-80'}
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
        touch-manipulation select-none
      `}
      style={{ 
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation'
      }}
    >
      <Icon className={`h-7 w-7 transition-transform ${!disabled && 'group-hover:scale-110'}`} />
      <span className="text-sm font-medium text-center leading-tight px-1">
        {label}
      </span>
    </button>
  )
} 