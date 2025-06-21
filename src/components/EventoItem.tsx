import React from 'react';
import { 
  Scissors, 
  CheckCircle, 
  Truck, 
  Filter, 
  Package, 
  Grid3X3, 
  Snowflake, 
  ShieldCheck, 
  Send, 
  Activity, 
  User, 
  Clock, 
  ArrowRight 
} from 'lucide-react';
import type { EventoReciente } from '../types/database';

interface EventoItemProps {
  evento: EventoReciente;
  index: number;
  isCompact?: boolean;
  onClick?: (loteId: string) => void;
}

export const EventoItem: React.FC<EventoItemProps> = ({ 
  evento, 
  index, 
  isCompact = false, 
  onClick 
}) => {
  // Mapeo de iconos por tipo de evento
  const getEventoIcon = (tipo: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      'Inicio Cosecha': <Scissors className="h-4 w-4" />,
      'Cosecha Completa': <CheckCircle className="h-4 w-4" />,
      'Recepción Packing': <Truck className="h-4 w-4" />,
      'Selección': <Filter className="h-4 w-4" />,
      'Empaque': <Package className="h-4 w-4" />,
      'Paletizado': <Grid3X3 className="h-4 w-4" />,
      'Enfriado': <Snowflake className="h-4 w-4" />,
      'Control Calidad': <ShieldCheck className="h-4 w-4" />,
      'Despacho': <Send className="h-4 w-4" />
    };
    return iconMap[tipo] || <Activity className="h-4 w-4" />;
  };

  // Color por tipo de evento
  const getEventoColor = (tipo: string) => {
    const colorMap: Record<string, string> = {
      'Inicio Cosecha': 'bg-green-500',
      'Cosecha Completa': 'bg-green-600',
      'Recepción Packing': 'bg-blue-500',
      'Selección': 'bg-yellow-500',
      'Empaque': 'bg-purple-500',
      'Paletizado': 'bg-indigo-500',
      'Enfriado': 'bg-cyan-500',
      'Control Calidad': 'bg-orange-500',
      'Despacho': 'bg-red-500'
    };
    return colorMap[tipo] || 'bg-gray-500';
  };

  const fechaEvento = evento.fecha ? new Date(evento.fecha) : null;
  const esReciente = index < 3;

  const handleClick = () => {
    if (onClick && evento.lote_id) {
      onClick(evento.lote_id);
    }
  };

  return (
    <div 
      className={`p-4 hover:bg-gray-50 transition-colors ${onClick ? 'cursor-pointer' : ''}`}
      onClick={handleClick}
    >
      <div className="flex items-start space-x-4">
        <div className={`flex-shrink-0 w-10 h-10 ${getEventoColor(evento.tipo ?? 'Inicio Cosecha')} rounded-full flex items-center justify-center text-white ${esReciente ? 'ring-2 ring-cultivo-200' : ''}`}>
          {getEventoIcon(evento.tipo ?? 'Inicio Cosecha')}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h4 className="font-semibold text-gray-900">{evento.tipo ?? 'Sin tipo'}</h4>
                {esReciente && (
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                    Nuevo
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">{evento.descripcion}</p>
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <Package className="h-3 w-3" />
                  <span className="font-medium text-gray-700">Lote: {evento.lote_id || 'N/A'}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <User className="h-3 w-3" />
                  <span>{evento.responsable || 'Sin asignar'}</span>
                </div>
                {fechaEvento && (
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>Hace {Math.round((Date.now() - fechaEvento.getTime()) / (1000 * 60 * 60 * 24))} días</span>
                  </div>
                )}
              </div>
            </div>
            <div className="text-right ml-4">
              <p className="text-sm font-medium text-gray-900">
                {fechaEvento ? fechaEvento.toLocaleDateString('es-CL', { 
                  day: 'numeric', 
                  month: 'short'
                }) : '-'}
              </p>
              <p className="text-xs text-gray-500">
                {fechaEvento ? fechaEvento.toLocaleTimeString('es-CL', {
                  hour: '2-digit',
                  minute: '2-digit'
                }) : '-'}
              </p>
            </div>
          </div>
        </div>
        {onClick && (
          <div className="flex-shrink-0">
            <ArrowRight className="h-4 w-4 text-gray-400" />
          </div>
        )}
      </div>
    </div>
  );
}; 