import React, { useState } from 'react';
import { 
  QrCode, 
  Plus, 
  ArrowLeft, 
  Clock,
  CheckCircle,
  Package,
  Truck,
  Leaf,
  Download,
  Menu,
  Home,
  FileText,
  User,
  Calendar,
  Bell,
  Settings,
  HelpCircle,
  X,
  Factory,
  Thermometer,
  ShoppingCart
} from 'lucide-react';
import './index.css';
import { useLotes, useLote, useDashboard, useCatalogos } from './hooks/useKimunPulse';
import type { LoteCompleto, EstadoLote, TipoEvento } from './types/database';

// Componente del Logo KimunPulse
const KimunPulseLogo: React.FC<{ size?: number; showText?: boolean }> = ({ 
  size = 32, 
  showText = true 
}) => (
  <div className="flex items-center space-x-3">
    <svg width={size} height={size} viewBox="0 0 64 64" className="drop-shadow-sm">
      {/* Fondo circular */}
      <circle cx="32" cy="32" r="30" fill="url(#logoGradient)" />
      
      {/* Hoja principal */}
      <path 
        d="M20 35 Q25 20 32 22 Q39 20 44 35 Q42 45 32 42 Q22 45 20 35 Z" 
        fill="#FFFFFF" 
        opacity="0.95"
      />
      
      {/* Ondas de pulso */}
      <path 
        d="M15 32 Q20 28 25 32 T35 32 T45 32 T55 32" 
        stroke="#A3E635" 
        strokeWidth="2" 
        fill="none" 
        opacity="0.8"
      />
      <path 
        d="M18 38 Q22 35 26 38 T34 38 T42 38 T50 38" 
        stroke="#A3E635" 
        strokeWidth="1.5" 
        fill="none" 
        opacity="0.6"
      />
      
      {/* Vena de la hoja */}
      <line x1="32" y1="22" x2="32" y2="42" stroke="#16A34A" strokeWidth="2" opacity="0.7" />
      
      {/* Degradado */}
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#16A34A" />
          <stop offset="50%" stopColor="#059669" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
      </defs>
    </svg>
    
    {showText && (
      <div className="flex flex-col">
        <span className="text-cultivo-600 font-inter font-bold text-lg">KimunPulse</span>
        <span className="text-gray-500 font-inter text-xs">El pulso vivo de tu campo</span>
      </div>
    )}
  </div>
);

// Interfaces para compatibilidad con el código existente
interface LoteTraceabilidad {
  id: string;
  cultivo: string;
  estado: EstadoLote;
  ultimoEvento: string;
  fechaUltimoEvento: string;
  area: number;
  cuartelOrigen: string;
  variedad: string;
  eventos: EventoTrazabilidad[];
}

interface EventoTrazabilidad {
  id: string;
  tipo: TipoEvento;
  fecha: string;
  descripcion: string;
  responsable: string;
  cuartel?: string;
}

interface NuevoLoteForm {
  id: string;
  cultivo: string;
  variedad: string;
  area: string;
  ubicacion: string;
  cuartelOrigen: string;
}

type Vista = 'panel' | 'lotes' | 'reportes' | 'perfil' | 'detalle' | 'nuevo' | 'eventos';

function App() {
  const [vistaActual, setVistaActual] = useState<Vista>('panel');
  const [loteSeleccionadoId, setLoteSeleccionadoId] = useState<string | null>(null);
  const [mostrarFormularioEvento, setMostrarFormularioEvento] = useState(false);
  const [mostrarSidebar, setMostrarSidebar] = useState(false);
  const [formulario, setFormulario] = useState<NuevoLoteForm>({
    id: '',
    cultivo: '',
    variedad: '',
    area: '',
    ubicacion: '',
    cuartelOrigen: ''
  });

  // Hooks para datos reales
  const { lotes: lotesReales, loading: lotesLoading, error: lotesError, refrescar: refrescarLotes } = useLotes();
  const { lote, eventos, loading: loteLoading, agregarEvento } = useLote(loteSeleccionadoId);
  const { metricas, eventosRecientes, loading: dashboardLoading } = useDashboard();
  const { cultivos, variedades, cuarteles, usuarios, cargarVariedadesPorCultivo } = useCatalogos();

  // Transformar datos de Supabase al formato esperado por la UI
  const transformarLoteCompleto = (loteCompleto: LoteCompleto): LoteTraceabilidad => ({
    id: loteCompleto.id || '',
    cultivo: loteCompleto.cultivo || '',
    estado: loteCompleto.estado || 'En Cosecha',
    ultimoEvento: loteCompleto.ultimo_evento || '',
    fechaUltimoEvento: loteCompleto.fecha_ultimo_evento || '',
    area: Number(loteCompleto.area) || 0,
    cuartelOrigen: loteCompleto.cuartel_origen || '',
    variedad: loteCompleto.variedad || '',
    eventos: [] // Los eventos se cargan por separado
  });

  const transformarEventos = (eventosDB: any[]): EventoTrazabilidad[] => {
    return eventosDB.map(evento => ({
      id: evento.evento_id,
      tipo: evento.tipo,
      fecha: new Date(evento.fecha).toLocaleDateString('es-CL'),
      descripcion: evento.descripcion,
      responsable: evento.responsable,
      cuartel: ''
    }));
  };

  // Datos transformados para la UI
  const lotes: LoteTraceabilidad[] = lotesReales.map(transformarLoteCompleto);
  const loteSeleccionado = lote ? {
    ...transformarLoteCompleto(lote),
    eventos: transformarEventos(eventos)
  } : null;

  const obtenerIconoEstado = (estado: string) => {
    switch (estado) {
      case 'En Cosecha': return <Leaf className="text-green-500" size={16} />;
      case 'Cosecha Completa': return <CheckCircle className="text-emerald-600" size={16} />;
      case 'En Packing': return <Factory className="text-blue-500" size={16} />;
      case 'Empacado': return <Package className="text-purple-500" size={16} />;
      case 'En Cámara': return <Thermometer className="text-cyan-500" size={16} />;
      case 'Listo Despacho': return <ShoppingCart className="text-orange-500" size={16} />;
      case 'Despachado': return <Truck className="text-gray-500" size={16} />;
      default: return <Clock className="text-gray-400" size={16} />;
    }
  };

  const obtenerColorEstado = (estado: string) => {
    switch (estado) {
      case 'En Cosecha': return 'bg-green-100 text-green-800';
      case 'Cosecha Completa': return 'bg-emerald-100 text-emerald-800';
      case 'En Packing': return 'bg-blue-100 text-blue-800';
      case 'Empacado': return 'bg-purple-100 text-purple-800';
      case 'En Cámara': return 'bg-cyan-100 text-cyan-800';
      case 'Listo Despacho': return 'bg-orange-100 text-orange-800';
      case 'Despachado': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const manejarEscaneo = () => {
    const qrCode = prompt("Escanear código QR (Simular ingreso del código):");
    if (qrCode) {
      const loteEncontrado = lotes.find(l => l.id === qrCode);
      if (loteEncontrado) {
        setLoteSeleccionadoId(loteEncontrado.id);
        setVistaActual('detalle');
      } else {
        alert("Lote no encontrado");
      }
    }
  };

  const generarReporte = (lote: LoteTraceabilidad) => {
    const reporte = `
REPORTE DE TRAZABILIDAD
=======================
ID Lote: ${lote.id}
Cultivo: ${lote.cultivo} - ${lote.variedad}
Cuartel: ${lote.cuartelOrigen}
Área: ${lote.area} ha
Estado: ${lote.estado}
Último Evento: ${lote.ultimoEvento}

HISTORIAL DE EVENTOS:
${lote.eventos.map(e => `${e.fecha} - ${e.tipo}: ${e.descripcion} (${e.responsable})`).join('\n')}
    `;
    
    const blob = new Blob([reporte], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte_${lote.id}.txt`;
    a.click();
  };

  const manejarAgregarEvento = async (tipo: TipoEvento, descripcion: string) => {
    if (!loteSeleccionadoId) return;

    try {
      await agregarEvento(tipo, descripcion, 'Usuario Actual');
      setMostrarFormularioEvento(false);
      // Los datos se refrescan automáticamente gracias al hook
    } catch (error) {
      alert('Error al agregar evento: ' + (error as Error).message);
    }
  };

  // Resto del componente se mantiene igual...
  const Header = () => (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <button 
          onClick={() => setMostrarSidebar(!mostrarSidebar)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
          aria-label="Abrir menú de navegación"
          title="Abrir menú"
        >
          <Menu size={20} className="text-gray-600" />
        </button>
        
        <KimunPulseLogo size={28} showText={false} />
        <h1 className="text-xl font-bold text-gray-800 hidden sm:block">KimunPulse</h1>
      </div>

      <div className="flex items-center space-x-2">
        <button 
          onClick={manejarEscaneo}
          className="bg-cultivo-600 hover:bg-cultivo-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200 transform hover:scale-105"
        >
          <QrCode size={18} />
          <span className="hidden sm:inline">Escanear</span>
        </button>
        
        <button 
          onClick={() => {
            setVistaActual('nuevo');
            setLoteSeleccionadoId(null);
          }}
          className="bg-lima-500 hover:bg-lima-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200 transform hover:scale-105"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">Nuevo Lote</span>
        </button>
      </div>
    </header>
  );

  const BottomNavbar = () => {
    const navItems = [
      { icon: Home, label: 'Panel', vista: 'panel' as Vista },
      { icon: Package, label: 'Lotes', vista: 'lotes' as Vista },
      { icon: FileText, label: 'Reportes', vista: 'reportes' as Vista },
      { icon: User, label: 'Perfil', vista: 'perfil' as Vista }
    ];

    return (
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around">
          {navItems.map(({ icon: Icon, label, vista }) => (
            <button
              key={vista}
              onClick={() => {
                setVistaActual(vista);
                setLoteSeleccionadoId(null);
              }}
              className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-colors ${
                vistaActual === vista 
                  ? 'text-cultivo-600 bg-cultivo-50' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon size={20} />
              <span className="text-xs font-medium">{label}</span>
            </button>
          ))}
        </div>
      </nav>
    );
  };

  const Sidebar = () => {
    const sidebarItems = [
      { icon: Home, label: 'Panel', vista: 'panel' as Vista },
      { icon: Package, label: 'Lotes', vista: 'lotes' as Vista },
      { icon: FileText, label: 'Reportes', vista: 'reportes' as Vista },
      { icon: User, label: 'Perfil', vista: 'perfil' as Vista }
    ];

    const sidebarSecundario = [
      { icon: Calendar, label: 'Calendario', action: () => alert('Calendario próximamente') },
      { icon: Bell, label: 'Notificaciones', action: () => alert('Notificaciones próximamente') },
      { icon: Settings, label: 'Configuración', action: () => alert('Configuración próximamente') },
      { icon: HelpCircle, label: 'Ayuda', action: () => alert('Ayuda próximamente') }
    ];

    return (
      <>
        {/* Overlay móvil */}
        {mostrarSidebar && (
          <div 
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setMostrarSidebar(false)}
          />
        )}
        
        {/* Sidebar */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out
          ${mostrarSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="flex flex-col h-full">
            {/* Header del sidebar */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <KimunPulseLogo size={32} showText={true} />
                <button 
                  onClick={() => setMostrarSidebar(false)}
                  className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
                  aria-label="Cerrar menú de navegación"
                  title="Cerrar menú"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
            </div>

            {/* Navegación principal */}
            <nav className="flex-1 p-4">
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Principal
                </h3>
                {sidebarItems.map(({ icon: Icon, label, vista }) => (
                  <button
                    key={vista}
                    onClick={() => {
                      setVistaActual(vista);
                      setLoteSeleccionadoId(null);
                      setMostrarSidebar(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      vistaActual === vista 
                        ? 'bg-cultivo-50 text-cultivo-700 border-r-2 border-cultivo-600' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{label}</span>
                  </button>
                ))}
              </div>

              <div className="mt-8 space-y-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Herramientas
                </h3>
                {sidebarSecundario.map(({ icon: Icon, label, action }) => (
                  <button
                    key={label}
                    onClick={action}
                    className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                  >
                    <Icon size={20} />
                    <span className="font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </nav>

            {/* Footer del sidebar */}
            <div className="p-4 border-t border-gray-200">
              <div className="text-xs text-gray-500">
                <p className="font-semibold">KimunPulse v1.0</p>
                <p>Trazabilidad Agrícola</p>
              </div>
            </div>
          </div>
        </aside>
      </>
    );
  };

  // Vista del Panel Principal con datos reales
  const VistaPanel = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-cultivo-600 to-lima-500 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">¡Bienvenido a KimunPulse!</h2>
        <p className="text-cultivo-100">El pulso vivo de tu campo - Monitoreo y trazabilidad en tiempo real</p>
      </div>

      {/* Métricas del Dashboard */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Lotes</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardLoading ? '...' : metricas?.total_lotes || 0}
              </p>
            </div>
            <Package className="text-cultivo-600" size={24} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Lotes Activos</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardLoading ? '...' : metricas?.lotes_activos || 0}
              </p>
            </div>
            <Leaf className="text-green-600" size={24} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Área Total</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardLoading ? '...' : `${Number(metricas?.area_total || 0).toFixed(1)} ha`}
              </p>
            </div>
            <Factory className="text-blue-600" size={24} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Eventos Hoy</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardLoading ? '...' : metricas?.eventos_hoy || 0}
              </p>
            </div>
            <Clock className="text-orange-600" size={24} />
          </div>
        </div>
      </div>

      {/* Lotes Recientes */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Lotes Recientes</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {lotesLoading ? (
            <div className="p-4 text-center text-gray-500">Cargando lotes...</div>
          ) : lotes.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No hay lotes disponibles</div>
          ) : (
            lotes.slice(0, 3).map((lote) => (
              <div 
                key={lote.id} 
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => {
                  setLoteSeleccionadoId(lote.id);
                  setVistaActual('detalle');
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {obtenerIconoEstado(lote.estado)}
                    <div>
                      <p className="font-medium text-gray-900">{lote.id}</p>
                      <p className="text-sm text-gray-600">{lote.cultivo} - {lote.variedad}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${obtenerColorEstado(lote.estado)}`}>
                      {lote.estado}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">{lote.cuartelOrigen}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Eventos Recientes */}
      {eventosRecientes && eventosRecientes.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Eventos Recientes</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {eventosRecientes.slice(0, 5).map((evento, index) => (
              <div key={index} className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className={`w-3 h-3 rounded-full mt-1 ${
                      index === 0 ? 'bg-cultivo-500' : 'bg-gray-300'
                    }`}></div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">{evento.descripcion}</h4>
                      <span className="text-sm text-gray-500">{evento.fecha}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Vista de Lotes con datos reales
  const VistaLotes = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Gestión de Lotes</h2>
        <button 
          onClick={refrescarLotes}
          className="bg-cultivo-600 hover:bg-cultivo-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Actualizar
        </button>
      </div>

      {lotesError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: {lotesError}</p>
        </div>
      )}

      <div className="grid gap-4">
        {lotesLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cultivo-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Cargando lotes...</p>
          </div>
        ) : lotes.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay lotes</h3>
            <p className="mt-1 text-sm text-gray-500">Comienza creando tu primer lote.</p>
          </div>
        ) : (
          lotes.map((lote) => (
            <div key={lote.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  {obtenerIconoEstado(lote.estado)}
                  <div>
                    <h3 className="font-semibold text-gray-900">{lote.id}</h3>
                    <p className="text-sm text-gray-600">{lote.cultivo} - {lote.variedad}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${obtenerColorEstado(lote.estado)}`}>
                  {lote.estado}
                </span>
              </div>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm mb-4">
                <div>
                  <p className="text-gray-500">Cuartel</p>
                  <p className="font-medium">{lote.cuartelOrigen}</p>
                </div>
                <div>
                  <p className="text-gray-500">Área</p>
                  <p className="font-medium">{lote.area} ha</p>
                </div>
                <div>
                  <p className="text-gray-500">Último Evento</p>
                  <p className="font-medium text-xs">{lote.ultimoEvento || 'Sin eventos'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Fecha</p>
                  <p className="font-medium text-xs">
                    {lote.fechaUltimoEvento ? new Date(lote.fechaUltimoEvento).toLocaleDateString('es-CL') : '-'}
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button 
                  onClick={() => {
                    setLoteSeleccionadoId(lote.id);
                    setVistaActual('detalle');
                  }}
                  className="flex-1 bg-cultivo-600 hover:bg-cultivo-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                >
                  Ver Detalle
                </button>
                <button 
                  onClick={() => generarReporte(lote)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                  aria-label="Descargar reporte"
                  title="Descargar reporte"
                >
                  <Download size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  // Vista de Detalle del Lote con datos reales
  const VistaDetalle = () => {
    if (!loteSeleccionado) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-600">No hay lote seleccionado</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => setVistaActual('lotes')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            aria-label="Volver a lotes"
          >
            <ArrowLeft size={20} />
            <span>Volver a lotes</span>
          </button>
          <button 
            onClick={() => generarReporte(loteSeleccionado)}
            className="bg-cultivo-600 hover:bg-cultivo-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <Download size={16} />
            <span>Exportar</span>
          </button>
        </div>

        {loteLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cultivo-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Cargando detalle del lote...</p>
          </div>
        ) : (
          <>
            {/* Información del Lote */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  {obtenerIconoEstado(loteSeleccionado.estado)}
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{loteSeleccionado.id}</h2>
                    <p className="text-gray-600">{loteSeleccionado.cultivo} - {loteSeleccionado.variedad}</p>
                  </div>
                </div>
                <span className={`px-4 py-2 rounded-full font-medium ${obtenerColorEstado(loteSeleccionado.estado)}`}>
                  {loteSeleccionado.estado}
                </span>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Cuartel de Origen</p>
                  <p className="text-lg font-semibold text-gray-900">{loteSeleccionado.cuartelOrigen}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Área</p>
                  <p className="text-lg font-semibold text-gray-900">{loteSeleccionado.area} ha</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Total Eventos</p>
                  <p className="text-lg font-semibold text-gray-900">{loteSeleccionado.eventos.length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Último Evento</p>
                  <p className="text-sm text-gray-900">
                    {loteSeleccionado.fechaUltimoEvento ? 
                      new Date(loteSeleccionado.fechaUltimoEvento).toLocaleDateString('es-CL') : 
                      'Sin eventos'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Historial de Eventos */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Historial de Trazabilidad</h3>
                <button 
                  onClick={() => setMostrarFormularioEvento(true)}
                  className="bg-lima-500 hover:bg-lima-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                >
                  <Plus size={16} />
                  <span>Agregar Evento</span>
                </button>
              </div>
              
              <div className="divide-y divide-gray-200">
                {loteSeleccionado.eventos.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <Clock className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                    <p>No hay eventos registrados para este lote</p>
                  </div>
                ) : (
                  loteSeleccionado.eventos.map((evento, index) => (
                    <div key={evento.id} className="p-4">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className={`w-3 h-3 rounded-full mt-1 ${
                            index === 0 ? 'bg-cultivo-500' : 'bg-gray-300'
                          }`}></div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-gray-900">{evento.tipo}</h4>
                            <span className="text-sm text-gray-500">{evento.fecha}</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{evento.descripcion}</p>
                          <p className="text-xs text-gray-500 mt-2">Responsable: {evento.responsable}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}

        {/* Modal para agregar evento */}
        {mostrarFormularioEvento && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Agregar Evento</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const tipo = formData.get('tipo') as TipoEvento;
                const descripcion = formData.get('descripcion') as string;
                
                if (tipo && descripcion) {
                  manejarAgregarEvento(tipo, descripcion);
                }
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Evento
                    </label>
                    <select 
                      name="tipo"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cultivo-500 focus:border-cultivo-500"
                      required
                      aria-label="Tipo de evento"
                    >
                      <option value="">Seleccionar tipo</option>
                      <option value="Inicio Cosecha">Inicio Cosecha</option>
                      <option value="Cosecha Completa">Cosecha Completa</option>
                      <option value="Recepción Packing">Recepción Packing</option>
                      <option value="Selección">Selección</option>
                      <option value="Empaque">Empaque</option>
                      <option value="Paletizado">Paletizado</option>
                      <option value="Enfriado">Enfriado</option>
                      <option value="Control Calidad">Control Calidad</option>
                      <option value="Despacho">Despacho</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción
                    </label>
                    <textarea 
                      name="descripcion"
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cultivo-500 focus:border-cultivo-500"
                      placeholder="Descripción del evento..."
                      required
                    />
                  </div>
                </div>
                
                <div className="flex space-x-3 mt-6">
                  <button 
                    type="button"
                    onClick={() => setMostrarFormularioEvento(false)}
                    className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-cultivo-600 hover:bg-cultivo-700 text-white px-4 py-2 rounded-lg"
                  >
                    Agregar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Resto de las vistas se mantienen igual...
  const VistaNuevoLote = () => {
    const crearLote = async () => {
      if (!formulario.id || !formulario.cultivo || !formulario.variedad || !formulario.area || !formulario.cuartelOrigen) {
        alert('Por favor completa todos los campos');
        return;
      }

      try {
        // Aquí iría la lógica para crear el lote en Supabase
        alert('Lote creado exitosamente (funcionalidad pendiente)');
        setVistaActual('lotes');
        setFormulario({
          id: '',
          cultivo: '',
          variedad: '',
          area: '',
          ubicacion: '',
          cuartelOrigen: ''
        });
      } catch (error) {
        alert('Error al crear lote: ' + (error as Error).message);
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Crear Nuevo Lote</h2>
          <button 
            onClick={() => setVistaActual('lotes')}
            className="text-gray-600 hover:text-gray-900"
            aria-label="Volver a lotes"
          >
            <ArrowLeft size={20} />
          </button>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="grid gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ID del Lote
              </label>
              <input 
                type="text"
                value={formulario.id}
                onChange={(e) => setFormulario({...formulario, id: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cultivo-500 focus:border-cultivo-500"
                placeholder="Ej: LP-2025-CHIL-004"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cultivo
                </label>
                <select 
                  value={formulario.cultivo}
                  onChange={(e) => {
                    setFormulario({...formulario, cultivo: e.target.value, variedad: ''});
                    const cultivoSeleccionado = cultivos.find(c => c.nombre === e.target.value);
                    if (cultivoSeleccionado) {
                      cargarVariedadesPorCultivo(cultivoSeleccionado.id);
                    }
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cultivo-500 focus:border-cultivo-500"
                  aria-label="Cultivo"
                >
                  <option value="">Seleccionar cultivo</option>
                  {cultivos.map(cultivo => (
                    <option key={cultivo.id} value={cultivo.nombre}>{cultivo.nombre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Variedad
                </label>
                <select 
                  value={formulario.variedad}
                  onChange={(e) => setFormulario({...formulario, variedad: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cultivo-500 focus:border-cultivo-500"
                  disabled={!formulario.cultivo}
                  aria-label="Variedad"
                >
                  <option value="">Seleccionar variedad</option>
                  {variedades.map(variedad => (
                    <option key={variedad.id} value={variedad.nombre}>{variedad.nombre}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Área (hectáreas)
                </label>
                <input 
                  type="number"
                  step="0.1"
                  value={formulario.area}
                  onChange={(e) => setFormulario({...formulario, area: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cultivo-500 focus:border-cultivo-500"
                  placeholder="Ej: 2.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cuartel de Origen
                </label>
                <select 
                  value={formulario.cuartelOrigen}
                  onChange={(e) => setFormulario({...formulario, cuartelOrigen: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cultivo-500 focus:border-cultivo-500"
                  aria-label="Cuartel de origen"
                >
                  <option value="">Seleccionar cuartel</option>
                  {cuarteles.map(cuartel => (
                    <option key={cuartel.id} value={cuartel.nombre}>{cuartel.nombre}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ubicación/Observaciones
              </label>
              <textarea 
                value={formulario.ubicacion}
                onChange={(e) => setFormulario({...formulario, ubicacion: e.target.value})}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cultivo-500 focus:border-cultivo-500"
                placeholder="Información adicional sobre la ubicación..."
              />
            </div>

            <div className="flex space-x-4">
              <button 
                onClick={() => setVistaActual('lotes')}
                className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button 
                onClick={crearLote}
                className="flex-1 bg-cultivo-600 hover:bg-cultivo-700 text-white px-4 py-2 rounded-lg"
              >
                Crear Lote
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const VistaReportes = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Reportes y Análisis</h2>
      
      <div className="grid gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Reportes Avanzados</h3>
          <p className="text-gray-600 mb-4">Funcionalidad de reportes en desarrollo</p>
          <button className="bg-cultivo-600 hover:bg-cultivo-700 text-white px-4 py-2 rounded-lg">
            Próximamente
          </button>
        </div>
      </div>
    </div>
  );

  const VistaPerfil = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Perfil de Usuario</h2>
      
      <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
        <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Gestión de Perfil</h3>
        <p className="text-gray-600 mb-4">Configuración de usuario en desarrollo</p>
        <button className="bg-cultivo-600 hover:bg-cultivo-700 text-white px-4 py-2 rounded-lg">
          Próximamente
        </button>
      </div>
    </div>
  );

  const renderizarVista = () => {
    switch (vistaActual) {
      case 'panel': return <VistaPanel />;
      case 'lotes': return <VistaLotes />;
      case 'detalle': return <VistaDetalle />;
      case 'nuevo': return <VistaNuevoLote />;
      case 'reportes': return <VistaReportes />;
      case 'perfil': return <VistaPerfil />;
      default: return <VistaPanel />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      
      <div className="flex-1 flex flex-col lg:ml-0">
        <Header />
        
        <main className="flex-1 p-4 lg:p-6 pb-20 lg:pb-6">
          {renderizarVista()}
        </main>
        
        <BottomNavbar />
      </div>
    </div>
  );
}

export default App;
