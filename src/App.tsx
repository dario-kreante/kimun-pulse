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

interface LoteTraceabilidad {
  id: string;
  cultivo: string;
  estado: 'En Cosecha' | 'Cosecha Completa' | 'En Packing' | 'Empacado' | 'En Cámara' | 'Listo Despacho' | 'Despachado';
  ultimoEvento: string;
  fechaUltimoEvento: string;
  area: number;
  cuartelOrigen: string;
  variedad: string;
  eventos: EventoTrazabilidad[];
}

interface EventoTrazabilidad {
  id: string;
  tipo: 'Inicio Cosecha' | 'Cosecha Completa' | 'Recepción Packing' | 'Selección' | 'Empaque' | 'Paletizado' | 'Enfriado' | 'Control Calidad' | 'Despacho';
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
  const [loteSeleccionado, setLoteSeleccionado] = useState<LoteTraceabilidad | null>(null);
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
  
  // Datos mock
  const [lotes, setLotes] = useState<LoteTraceabilidad[]>([
    {
      id: 'LP-2025-CHIL-001',
      cultivo: 'Arándanos',
      estado: 'En Packing',
      ultimoEvento: 'Recepción en planta de packing',
      fechaUltimoEvento: '2025-01-15 10:30',
      area: 2.5,
      cuartelOrigen: 'Cuartel 1',
      variedad: 'Duke',
      eventos: [
        {
          id: 'E001',
          tipo: 'Inicio Cosecha',
          fecha: '2025-01-12',
          descripcion: 'Inicio cosecha manual arándanos var. Duke - Cuadrilla A',
          responsable: 'Juan Pérez - Supervisor',
          cuartel: 'Cuartel 1'
        },
        {
          id: 'E002',
          tipo: 'Cosecha Completa',
          fecha: '2025-01-14',
          descripcion: 'Finalización cosecha - 850 kg obtenidos',
          responsable: 'Juan Pérez - Supervisor',
          cuartel: 'Cuartel 1'
        },
        {
          id: 'E003',
          tipo: 'Recepción Packing',
          fecha: '2025-01-15',
          descripcion: 'Recepción en planta packing - Control temperatura 2°C',
          responsable: 'María González - Jefe Packing',
          cuartel: 'Cuartel 1'
        }
      ]
    },
    {
      id: 'LP-2025-CHIL-002',
      cultivo: 'Cerezas',
      estado: 'En Cámara',
      ultimoEvento: 'Enfriado hidrocooling completado',
      fechaUltimoEvento: '2025-01-12 14:45',
      area: 3.2,
      cuartelOrigen: 'Cuartel 2',
      variedad: 'Sweet Heart',
      eventos: [
        {
          id: 'E004',
          tipo: 'Inicio Cosecha',
          fecha: '2025-01-10',
          descripcion: 'Inicio cosecha manual cerezas Sweet Heart',
          responsable: 'Carlos Silva - Supervisor',
          cuartel: 'Cuartel 2'
        },
        {
          id: 'E005',
          tipo: 'Cosecha Completa',
          fecha: '2025-01-11',
          descripcion: 'Cosecha finalizada - 1,200 kg var. Sweet Heart',
          responsable: 'Carlos Silva - Supervisor',
          cuartel: 'Cuartel 2'
        },
        {
          id: 'E006',
          tipo: 'Recepción Packing',
          fecha: '2025-01-11',
          descripcion: 'Recepción en packing - Análisis brix 18.5°',
          responsable: 'Ana Morales - Control Calidad',
          cuartel: 'Cuartel 2'
        },
        {
          id: 'E007',
          tipo: 'Selección',
          fecha: '2025-01-12',
          descripcion: 'Selección por calibre - Cat. I: 75%, Cat. II: 25%',
          responsable: 'Ana Morales - Control Calidad',
          cuartel: 'Cuartel 2'
        },
        {
          id: 'E008',
          tipo: 'Enfriado',
          fecha: '2025-01-12',
          descripcion: 'Proceso hidrocooling completado - Temp. pulpa 1°C',
          responsable: 'Roberto Díaz - Operador',
          cuartel: 'Cuartel 2'
        }
      ]
    },
    {
      id: 'LP-2025-CHIL-003',
      cultivo: 'Manzanas',
      estado: 'Listo Despacho',
      ultimoEvento: 'Control calidad final aprobado',
      fechaUltimoEvento: '2025-01-10 16:20',
      area: 4.1,
      cuartelOrigen: 'Cuartel 3',
      variedad: 'Golden Delicious',
      eventos: [
        {
          id: 'E009',
          tipo: 'Inicio Cosecha',
          fecha: '2025-01-08',
          descripcion: 'Inicio cosecha manzanas Golden Delicious',
          responsable: 'Luis Herrera - Supervisor',
          cuartel: 'Cuartel 3'
        },
        {
          id: 'E010',
          tipo: 'Cosecha Completa',
          fecha: '2025-01-09',
          descripcion: 'Cosecha completada - 2,100 kg obtenidos',
          responsable: 'Luis Herrera - Supervisor',
          cuartel: 'Cuartel 3'
        },
        {
          id: 'E011',
          tipo: 'Recepción Packing',
          fecha: '2025-01-09',
          descripcion: 'Recepción y pesaje en planta packing',
          responsable: 'Patricia Ruiz - Recepción',
          cuartel: 'Cuartel 3'
        },
        {
          id: 'E012',
          tipo: 'Selección',
          fecha: '2025-01-09',
          descripcion: 'Clasificación por calibre y defectos visuales',
          responsable: 'Patricia Ruiz - Control Calidad',
          cuartel: 'Cuartel 3'
        },
        {
          id: 'E013',
          tipo: 'Empaque',
          fecha: '2025-01-10',
          descripcion: 'Empaque en cajas de cartón 18.1 kg para exportación',
          responsable: 'Miguel Torres - Empaque',
          cuartel: 'Cuartel 3'
        },
        {
          id: 'E014',
          tipo: 'Paletizado',
          fecha: '2025-01-10',
          descripcion: 'Paletizado estándar export - 42 cajas por pallet',
          responsable: 'Miguel Torres - Empaque',
          cuartel: 'Cuartel 3'
        },
        {
          id: 'E015',
          tipo: 'Control Calidad',
          fecha: '2025-01-10',
          descripcion: 'Control calidad final - Temperatura, etiquetado, trazabilidad',
          responsable: 'Sandra López - Jefe Calidad',
          cuartel: 'Cuartel 3'
        }
      ]
    }
  ]);

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
      case 'En Cosecha': return 'bg-green-100 text-green-800 border-green-200';
      case 'Cosecha Completa': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'En Packing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Empacado': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'En Cámara': return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      case 'Listo Despacho': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Despachado': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const manejarEscaneo = () => {
    // Simula escaneo exitoso
    alert('¡Código escaneado! Redirigiendo a lote LP-2025-CHIL-001');
    const lote = lotes.find(l => l.id === 'LP-2025-CHIL-001');
    if (lote) {
      setLoteSeleccionado(lote);
      setVistaActual('detalle');
    }
  };

  const generarReporte = (lote: LoteTraceabilidad) => {
    // Simula generación de reporte
    const reporte = {
      lote: lote.id,
      cultivo: lote.cultivo,
      eventos: lote.eventos.length,
      fecha: new Date().toLocaleDateString('es-CL')
    };
    alert(`Reporte generado para ${lote.id}\nEventos: ${reporte.eventos}\nFecha: ${reporte.fecha}`);
  };

  const agregarEvento = (tipo: EventoTrazabilidad['tipo'], descripcion: string) => {
    if (!loteSeleccionado) return;

    const nuevoEvento: EventoTrazabilidad = {
      id: `E${Date.now()}`,
      tipo,
      fecha: new Date().toISOString().split('T')[0],
      descripcion,
      responsable: 'Usuario actual',
      cuartel: loteSeleccionado.cuartelOrigen
    };

    const lotesActualizados = lotes.map(lote => 
      lote.id === loteSeleccionado.id 
        ? { 
            ...lote, 
            eventos: [...lote.eventos, nuevoEvento],
            ultimoEvento: descripcion,
            fechaUltimoEvento: new Date().toLocaleString('es-CL')
          }
        : lote
    );

    setLotes(lotesActualizados);
    setLoteSeleccionado(prev => prev ? { ...prev, eventos: [...prev.eventos, nuevoEvento] } : null);
    setMostrarFormularioEvento(false);
  };

  // Componente Header
  const Header = () => (
    <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo y menú */}
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setMostrarSidebar(true)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Abrir menú"
          >
            <Menu size={20} />
          </button>
          <KimunPulseLogo size={28} showText={false} />
        </div>

        {/* Acciones principales */}
        <div className="flex items-center space-x-2">
          <button
            onClick={manejarEscaneo}
            className="p-2 bg-cultivo-500 text-white rounded-lg hover:bg-cultivo-600 transition-colors"
            aria-label="Escanear código"
          >
            <QrCode size={18} />
          </button>
          <button
            onClick={() => setVistaActual('nuevo')}
            className="p-2 bg-lima-400 text-white rounded-lg hover:bg-lima-500 transition-colors"
            aria-label="Nuevo lote"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>
    </div>
  );

  // Componente Navbar inferior
  const BottomNavbar = () => {
    const navItems = [
      { id: 'panel' as Vista, icon: Home, label: 'Panel' },
      { id: 'lotes' as Vista, icon: Package, label: 'Lotes' },
      { id: 'reportes' as Vista, icon: FileText, label: 'Reportes' },
      { id: 'perfil' as Vista, icon: User, label: 'Perfil' },
    ];

    return (
      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm bg-white border-t border-gray-200 shadow-lg z-40">
        <div className="flex">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = vistaActual === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setVistaActual(item.id)}
                className={`flex-1 flex flex-col items-center py-3 px-1 transition-colors ${
                  isActive
                    ? 'text-cultivo-500'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Icon size={20} className="mb-1" />
                <span className="text-xs font-inter font-medium">
                  {item.label}
                </span>
                {isActive && (
                  <div className="w-1 h-1 bg-cultivo-500 rounded-full mt-1"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // Componente Sidebar
  const Sidebar = () => {
    const sidebarItems = [
      { id: 'eventos', icon: Calendar, label: 'Eventos', desc: 'Historial completo' },
      { id: 'notificaciones', icon: Bell, label: 'Notificaciones', desc: 'Alertas pendientes' },
      { id: 'configuracion', icon: Settings, label: 'Configuración', desc: 'Preferencias' },
      { id: 'ayuda', icon: HelpCircle, label: 'Ayuda & Soporte', desc: 'FAQs y contacto' },
    ];

    return (
      <>
        {/* Overlay */}
        {mostrarSidebar && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={() => setMostrarSidebar(false)}
          />
        )}
        
        {/* Sidebar */}
        <div className={`fixed top-0 left-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 ${
          mostrarSidebar ? 'translate-x-0' : '-translate-x-full'
        }`}>
          {/* Header del sidebar */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <KimunPulseLogo size={24} />
              <button
                onClick={() => setMostrarSidebar(false)}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                aria-label="Cerrar menú"
              >
                <X size={20} />
              </button>
            </div>
          </div>
          
          {/* Contenido del sidebar */}
          <div className="p-4 space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    // Aquí manejarías la navegación a cada módulo
                    alert(`Navegando a ${item.label} - Próximamente disponible`);
                    setMostrarSidebar(false);
                  }}
                  className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Icon size={20} className="text-gray-600" />
                  <div>
                    <div className="font-inter font-medium text-gray-900">{item.label}</div>
                    <div className="text-xs text-gray-500">{item.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </>
    );
  };

  // Vista de Panel (Dashboard principal)
  if (vistaActual === 'panel') {
    return (
      <div className="mobile-container">
        <Header />
        <Sidebar />
        
        <div className="p-4 pb-20">
          {/* Bienvenida */}
          <div className="mb-6">
            <h1 className="text-2xl font-inter font-bold text-gray-900 mb-2">
              ¡Bienvenido a KimunPulse!
            </h1>
            <p className="text-gray-600 font-inter">
              El pulso vivo de tu campo - Trazabilidad de lotes de producción
            </p>
            <p className="text-xs text-gray-500 font-inter mt-1">
              Seguimiento desde cosecha hasta despacho según normativas SAG
            </p>
          </div>

          {/* KPIs rápidos */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-md">
              <div className="flex items-center space-x-2 mb-2">
                <Package className="text-cultivo-500" size={20} />
                <span className="font-inter font-medium text-gray-900">Lotes de Producción</span>
              </div>
              <div className="text-2xl font-bold text-cultivo-600">{lotes.length}</div>
              <div className="text-xs text-gray-500">Activos en trazabilidad</div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-md">
              <div className="flex items-center space-x-2 mb-2">
                <FileText className="text-blue-500" size={20} />
                <span className="font-inter font-medium text-gray-900">Eventos Hoy</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">12</div>
              <div className="text-xs text-gray-500">Registros de trazabilidad</div>
            </div>
          </div>

          {/* Últimos lotes */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-inter font-semibold text-gray-900">
                Últimos Lotes de Producción
              </h2>
              <button
                onClick={() => setVistaActual('lotes')}
                className="text-cultivo-500 font-inter text-sm hover:text-cultivo-600"
              >
                Ver todos
              </button>
            </div>

            <div className="space-y-3">
              {lotes.slice(0, 3).map((lote) => (
                <div
                  key={lote.id}
                  onClick={() => {
                    setLoteSeleccionado(lote);
                    setVistaActual('detalle');
                  }}
                  className="bg-white p-4 rounded-lg shadow-md border border-gray-100 cursor-pointer hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-inter font-semibold text-gray-900">{lote.id}</h3>
                    <span className={`px-2 py-1 rounded-md text-xs font-medium border ${obtenerColorEstado(lote.estado)}`}>
                      {lote.estado}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-1">{lote.cultivo} • {lote.variedad}</p>
                  <p className="text-xs text-gray-500 mb-2">{lote.cuartelOrigen} • {lote.area} ha</p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      {obtenerIconoEstado(lote.estado)}
                      <span>{lote.ultimoEvento}</span>
                    </div>
                    <span>{lote.fechaUltimoEvento}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <BottomNavbar />
      </div>
    );
  }

  // Vista de Lotes
  if (vistaActual === 'lotes') {
    return (
      <div className="mobile-container">
        <Header />
        <Sidebar />
        
        <div className="p-4 pb-20">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-xl font-inter font-bold text-gray-900">
                Lotes de Producción
              </h1>
              <button
                onClick={() => setVistaActual('nuevo')}
                className="flex items-center space-x-2 bg-lima-400 text-white px-4 py-2 rounded-lg hover:bg-lima-500 transition-colors"
              >
                <Plus size={16} />
                <span className="font-inter text-sm">Nuevo</span>
              </button>
            </div>
            <p className="text-sm text-gray-600 font-inter">
              Batches de fruta desde cosecha hasta despacho
            </p>
          </div>

          <div className="space-y-3">
            {lotes.map((lote) => (
              <div
                key={lote.id}
                onClick={() => {
                  setLoteSeleccionado(lote);
                  setVistaActual('detalle');
                }}
                className="bg-white p-4 rounded-lg shadow-md border border-gray-100 cursor-pointer hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-inter font-semibold text-gray-900">{lote.id}</h3>
                  <span className={`px-2 py-1 rounded-md text-xs font-medium border ${obtenerColorEstado(lote.estado)}`}>
                    {lote.estado}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-1">{lote.cultivo} • {lote.variedad}</p>
                <p className="text-xs text-gray-500 mb-2">{lote.cuartelOrigen} • {lote.area} ha</p>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    {obtenerIconoEstado(lote.estado)}
                    <span>{lote.ultimoEvento}</span>
                  </div>
                  <span>{lote.fechaUltimoEvento}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <BottomNavbar />
      </div>
    );
  }

  // Vista de Reportes
  if (vistaActual === 'reportes') {
    return (
      <div className="mobile-container">
        <Header />
        <Sidebar />
        
        <div className="p-4 pb-20">
          <h1 className="text-xl font-inter font-bold text-gray-900 mb-6">
            Reportes de Trazabilidad
          </h1>
          
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <FileText className="mx-auto mb-4 text-gray-400" size={48} />
            <h3 className="font-inter font-semibold text-gray-900 mb-2">
              Módulo de Reportes
            </h3>
            <p className="text-gray-600 font-inter text-sm mb-4">
              Genera reportes PDF y CSV de trazabilidad completa
            </p>
            <button className="bg-cultivo-500 text-white px-6 py-2 rounded-lg font-inter font-semibold hover:bg-cultivo-600 transition-colors">
              Próximamente
            </button>
          </div>
        </div>
        
        <BottomNavbar />
      </div>
    );
  }

  // Vista de Perfil
  if (vistaActual === 'perfil') {
    return (
      <div className="mobile-container">
        <Header />
        <Sidebar />
        
        <div className="p-4 pb-20">
          <h1 className="text-xl font-inter font-bold text-gray-900 mb-6">
            Perfil y Configuración
          </h1>
          
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <User className="mx-auto mb-4 text-gray-400" size={48} />
            <h3 className="font-inter font-semibold text-gray-900 mb-2">
              Gestión de Perfil
            </h3>
            <p className="text-gray-600 font-inter text-sm mb-4">
              Datos de empresa y preferencias de usuario
            </p>
            <button className="bg-cultivo-500 text-white px-6 py-2 rounded-lg font-inter font-semibold hover:bg-cultivo-600 transition-colors">
              Próximamente
            </button>
          </div>
        </div>
        
        <BottomNavbar />
      </div>
    );
  }

  // Vista de Detalle del Lote (sin cambios mayores, solo header actualizado)
  if (vistaActual === 'detalle' && loteSeleccionado) {
    return (
      <div className="mobile-container">
        {/* Header simplificado para detalle */}
        <div className="sticky top-0 z-50 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-4">
            <button
              onClick={() => setVistaActual('lotes')}
              className="p-2 hover:bg-gray-100 rounded-lg"
              aria-label="Volver a lotes"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="font-inter font-semibold">{loteSeleccionado.id}</h1>
            <button
              onClick={() => generarReporte(loteSeleccionado)}
              className="p-2 text-cultivo-500 hover:bg-gray-100 rounded-lg"
              aria-label="Generar reporte"
            >
              <Download size={20} />
            </button>
          </div>
        </div>

        <div className="p-4">
          {/* Info del lote */}
          <div className="bg-white p-4 rounded-lg shadow-md mb-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-inter font-semibold text-lg">{loteSeleccionado.cultivo} • {loteSeleccionado.variedad}</h2>
              <span className={`px-3 py-1 rounded-md text-sm font-medium border ${obtenerColorEstado(loteSeleccionado.estado)}`}>
                {loteSeleccionado.estado}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500 font-inter">Área:</span>
                <span className="text-gray-900 font-inter ml-1">{loteSeleccionado.area} ha</span>
              </div>
              <div>
                <span className="text-gray-500 font-inter">Cuartel:</span>
                <span className="text-gray-900 font-inter ml-1">{loteSeleccionado.cuartelOrigen}</span>
              </div>
            </div>
            <p className="text-gray-500 text-xs mt-2">
              Último evento: {loteSeleccionado.ultimoEvento} • {loteSeleccionado.fechaUltimoEvento}
            </p>
          </div>

          {/* Botón nuevo evento */}
          <button
            onClick={() => setMostrarFormularioEvento(true)}
            className="w-full bg-lima-400 text-white p-3 rounded-lg flex items-center justify-center space-x-2 mb-4 hover:bg-lima-500 transition-colors"
          >
            <Plus size={20} />
            <span className="font-inter font-semibold">Nuevo Evento</span>
          </button>

          {/* Lista de eventos */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-inter font-semibold">Historial de Eventos</h3>
            </div>
            <div className="space-y-3 p-4">
              {loteSeleccionado.eventos.map((evento) => (
                <div key={evento.id} className="border-l-4 border-cultivo-300 pl-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-inter font-medium text-sm">{evento.tipo}</span>
                    <span className="text-xs text-gray-500">{evento.fecha}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{evento.descripcion}</p>
                  <p className="text-xs text-gray-500">Por: {evento.responsable}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal formulario nuevo evento */}
        {mostrarFormularioEvento && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50">
            <div className="bg-white w-full rounded-t-xl p-4 max-h-80">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-inter font-semibold">Nuevo Evento</h3>
                <button
                  onClick={() => setMostrarFormularioEvento(false)}
                  className="text-gray-500"
                  aria-label="Cerrar formulario"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-3">
                {['Inicio Cosecha', 'Cosecha Completa', 'Recepción Packing', 'Selección', 'Empaque', 'Paletizado', 'Enfriado', 'Control Calidad', 'Despacho'].map((tipo) => (
                  <button
                    key={tipo}
                    onClick={() => agregarEvento(tipo as EventoTrazabilidad['tipo'], `${tipo} realizado`)}
                    className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <span className="font-inter">{tipo}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Vista de Nuevo Lote
  if (vistaActual === 'nuevo') {
    const crearLote = () => {
      const nuevoLote: LoteTraceabilidad = {
        id: formulario.id || `LP-2025-CHIL-${String(lotes.length + 1).padStart(3, '0')}`,
        cultivo: formulario.cultivo,
        estado: 'En Cosecha',
        ultimoEvento: 'Lote creado',
        fechaUltimoEvento: new Date().toLocaleString('es-CL'),
        area: parseFloat(formulario.area) || 0,
        cuartelOrigen: formulario.cuartelOrigen,
        variedad: formulario.variedad,
        eventos: [{
          id: 'E001',
          tipo: 'Inicio Cosecha',
          fecha: new Date().toISOString().split('T')[0],
          descripcion: `Inicio cosecha manual ${formulario.cultivo} var. ${formulario.variedad} - ${formulario.cuartelOrigen}`,
          responsable: 'Usuario actual',
          cuartel: formulario.cuartelOrigen
        }]
      };

      setLotes([...lotes, nuevoLote]);
      setVistaActual('lotes');
      // Reset formulario
      setFormulario({ id: '', cultivo: '', variedad: '', area: '', ubicacion: '', cuartelOrigen: '' });
    };

    return (
      <div className="mobile-container">
        <div className="sticky top-0 z-50 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-4">
            <button
              onClick={() => setVistaActual('lotes')}
              className="p-2 hover:bg-gray-100 rounded-lg"
              aria-label="Volver a lotes"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="font-inter font-semibold">Nuevo Lote</h1>
            <div></div>
          </div>
        </div>

        <div className="p-4">
          {/* Explicación del concepto */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h3 className="font-inter font-semibold text-blue-900 mb-2">
              ¿Qué es un Lote de Producción?
            </h3>
            <p className="text-sm text-blue-800 font-inter">
              Batch de fruta que comparte mismo origen, fecha y variedad, rastreado desde cosecha hasta despacho según normativas SAG.
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-md space-y-4">
            {/* Identificación */}
            <div className="border-b border-gray-100 pb-4">
              <h4 className="font-inter font-medium text-gray-900 mb-3">Identificación del Lote</h4>
              
              <div>
                <label className="block text-sm font-inter font-medium text-gray-700 mb-2">
                  ID del Lote de Producción
                </label>
                <input
                  type="text"
                  placeholder="LP-2025-CHIL-004"
                  value={formulario.id}
                  onChange={(e) => setFormulario({...formulario, id: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cultivo-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Código único para trazabilidad según SAG</p>
              </div>
            </div>

            {/* Producto */}
            <div className="border-b border-gray-100 pb-4">
              <h4 className="font-inter font-medium text-gray-900 mb-3">Características del Producto</h4>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-inter font-medium text-gray-700 mb-2">
                    Cultivo
                  </label>
                  <select
                    value={formulario.cultivo}
                    onChange={(e) => setFormulario({...formulario, cultivo: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cultivo-500 focus:border-transparent"
                    title="Seleccionar tipo de cultivo"
                  >
                    <option value="">Seleccionar cultivo</option>
                    <option value="Arándanos">Arándanos</option>
                    <option value="Cerezas">Cerezas</option>
                    <option value="Manzanas">Manzanas</option>
                    <option value="Uvas">Uvas</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-inter font-medium text-gray-700 mb-2">
                    Variedad
                  </label>
                  <select
                    value={formulario.variedad}
                    onChange={(e) => setFormulario({...formulario, variedad: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cultivo-500 focus:border-transparent"
                    title="Seleccionar variedad"
                  >
                    <option value="">Seleccionar variedad</option>
                    <option value="Duke">Duke</option>
                    <option value="Bluecrop">Bluecrop</option>
                    <option value="Sweet Heart">Sweet Heart</option>
                    <option value="Golden Delicious">Golden Delicious</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Origen */}
            <div className="border-b border-gray-100 pb-4">
              <h4 className="font-inter font-medium text-gray-900 mb-3">Origen y Ubicación</h4>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-inter font-medium text-gray-700 mb-2">
                    Área (hectáreas)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="2.5"
                    value={formulario.area}
                    onChange={(e) => setFormulario({...formulario, area: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cultivo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-inter font-medium text-gray-700 mb-2">
                    Cuartel de Origen
                  </label>
                  <select
                    value={formulario.cuartelOrigen}
                    onChange={(e) => setFormulario({...formulario, cuartelOrigen: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cultivo-500 focus:border-transparent"
                    title="Seleccionar cuartel de origen"
                  >
                    <option value="">Seleccionar cuartel</option>
                    <option value="Cuartel 1">Cuartel 1</option>
                    <option value="Cuartel 2">Cuartel 2</option>
                    <option value="Cuartel 3">Cuartel 3</option>
                    <option value="Cuartel 4">Cuartel 4</option>
                    <option value="Bloque Norte">Bloque Norte</option>
                    <option value="Bloque Sur">Bloque Sur</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Subdivisión del predio donde se cosechó</p>
                </div>
              </div>

              <div className="mt-3">
                <label className="block text-sm font-inter font-medium text-gray-700 mb-2">
                  Ubicación del Predio
                </label>
                <input
                  type="text"
                  placeholder="Fundo Las Nieves, Chillán"
                  value={formulario.ubicacion}
                  onChange={(e) => setFormulario({...formulario, ubicacion: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cultivo-500 focus:border-transparent"
                />
              </div>
            </div>

            <button
              onClick={crearLote}
              disabled={!formulario.cultivo || !formulario.variedad || !formulario.area || !formulario.cuartelOrigen}
              className="w-full bg-cultivo-500 text-white p-3 rounded-lg font-inter font-semibold hover:bg-cultivo-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Crear Lote de Producción
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default App;
