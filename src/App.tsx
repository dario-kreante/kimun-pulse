import React, { useState, useEffect } from 'react';
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
  FileText,
  User,
  Settings,
  X,
  Factory,
  BarChart3,
  Filter,
  MapPin,
  TrendingUp,
  Activity,
  Eye,
  Scissors,
  Grid3X3,
  Snowflake,
  ShieldCheck,
  Send,
  AlertCircle,
  Database,
  Thermometer,
  RefreshCw,
  Info,
  Hash,
  Scale,
  Printer,
  Boxes,
  ScanLine
} from 'lucide-react';
import TrazabilidadTimeline from './components/TrazabilidadTimeline';
import DetallePallet from './components/DetallePallet';
import './index.css';
import { useLotes, useLote, useDashboard, useCatalogos, useCodigos } from './hooks/useKimunPulse';
import { eventosService, lotesService, palletsService } from './lib/supabase';
import type { TipoEvento } from './types/database';
import { useAuth } from './hooks/useAuth';
import AuthContainer from './components/AuthContainer';
import LoadingScreen from './components/LoadingScreen';
import Header from './components/Header';
import { EventoItem } from './components/EventoItem';
import ModalEscanearQR from './components/ModalEscanearQR';
import ModalImprimirEtiquetas from './components/ModalImprimirEtiquetas';
import ModalHistorialLote from './components/ModalHistorialLote';
import FloatingActionButton from './components/FloatingActionButton';
import FormularioEventoEspecifico from './components/formularios/FormularioEventoEspecifico';
import ReportesProductivos from './components/ReportesProductivos';
import GeneradorLotesDemo from './components/GeneradorLotesDemo';
import ModalGestionCamaras from './components/ModalGestionCamaras';
import GestionCamaras from './components/GestionCamaras'
import GestionCamarasVista from './components/GestionCamarasVista';
import ResumenCamaras from './components/ResumenCamaras';
import ModalAgregarEvento from './components/ModalAgregarEvento';
import VistaPreviewEtiquetas from './components/VistaPreviewEtiquetas';
import { generarHTMLEtiquetas } from './lib/qrUtils';

// Tipos para las vistas de la aplicación

type Vista = 'panel' | 'lotes' | 'reportes' | 'camaras' | 'perfil' | 'detalle' | 'nuevo' | 'eventos' | 'codigos';

export default function App() {
  // Hook para autenticación
  const { isAuthenticated, isLoading: authLoading } = useAuth()

  // Estados de la aplicación
  const [vistaActual, setVistaActual] = useState<Vista>('panel')
  const [loteSeleccionado, setLoteSeleccionado] = useState<string | null>(null)
  const [mostrarModalEvento, setMostrarModalEvento] = useState(false)
  const [palletSeleccionado, setPalletSeleccionado] = useState<string | null>(null)
  const [mostrandoDetallePallet, setMostrandoDetallePallet] = useState(false)
  const [mostrarModalEscanear, setMostrarModalEscanear] = useState(false)
  const [mostrarModalImprimir, setMostrarModalImprimir] = useState(false)
  const [mostrarModalHistorial, setMostrarModalHistorial] = useState(false)
  const [loteHistorial, setLoteHistorial] = useState<string | null>(null)
  const [mostrarReportesInventario, setMostrarReportesInventario] = useState(false)
  const [mostrarGeneradorDemo, setMostrarGeneradorDemo] = useState(false)
  const [mostrarGestionCamaras, setMostrarGestionCamaras] = useState(false)
  const [eventoParaPallet, setEventoParaPallet] = useState<{codigo: string, tipoEvento: string} | null>(null)
  const [eventosValidosPallets, setEventosValidosPallets] = useState<Record<string, any>>({})
  const [mostrarVistaPreviewEtiquetas, setMostrarVistaPreviewEtiquetas] = useState(false)

  // Hooks de datos (solo se ejecutan si está autenticado)
  const { lotes, loading: lotesLoading, error: lotesError, refrescar: refrescarLotes } = useLotes()
  const { lote, eventos, eventosValidos, loading: loteLoading, error: loteError, refrescar: refrescarLoteActual } = useLote(loteSeleccionado)
  const { metricas, eventosRecientes, loading: dashboardLoading } = useDashboard()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { cultivos, variedades, cuarteles, usuarios, cargarVariedadesPorCultivo } = useCatalogos()
  const { actividadReciente, estadisticas, loading: codigosLoading, error: codigosError } = useCodigos()

  // Estado para pallets (usado en VistaDetalleLote)
  const [pallets, setPallets] = useState<any[]>([])
  const [palletsLoading, setPalletsLoading] = useState(false)

  // Función para obtener el siguiente paso sugerido para un pallet
  const getSiguientePasoPallet = (pallet: any) => {
    // Usar los eventos válidos cargados desde la base de datos
    const eventosValidosPallet = eventosValidosPallets[pallet.codigo_pallet]
    return eventosValidosPallet?.siguiente_sugerido?.tipo || null
  }

  // Cargar pallets cuando estamos en vista detalle y el lote fue paletizado
  useEffect(() => {
    const cargarPallets = async () => {
      // Solo cargar si estamos en vista detalle, hay lote seleccionado y fue paletizado
      if (vistaActual === 'detalle' && loteSeleccionado && lote && fuePaletizado(lote, eventos)) {
        try {
          setPalletsLoading(true)
          const palletsData = await palletsService.obtenerPalletsPorLote(loteSeleccionado)
          setPallets(palletsData || [])
        } catch (error) {
          console.error('Error cargando pallets:', error)
          setPallets([])
        } finally {
          setPalletsLoading(false)
        }
      } else {
        // Limpiar pallets si no estamos en la vista correcta o el lote no fue paletizado
        setPallets([])
      }
    }

    cargarPallets()
  }, [vistaActual, loteSeleccionado, lote, eventos]) // Se ejecuta cuando cambian estos valores

  // Cargar eventos válidos para todos los pallets cuando cambian
  useEffect(() => {
    const cargarEventosValidosPallets = async () => {
      if (pallets.length > 0) {
        const eventosPromises = pallets.map(async (pallet) => {
          try {
            const eventosValidos = await eventosService.obtenerEventosValidosPallet(pallet.codigo_pallet)
            return { codigoPallet: pallet.codigo_pallet, eventosValidos }
          } catch (error) {
            console.error(`Error cargando eventos válidos para pallet ${pallet.codigo_pallet}:`, error)
            return { codigoPallet: pallet.codigo_pallet, eventosValidos: null }
          }
        })
        
        const resultados = await Promise.all(eventosPromises)
        const eventosValidosMap: Record<string, any> = {}
        
        resultados.forEach(({ codigoPallet, eventosValidos }) => {
          eventosValidosMap[codigoPallet] = eventosValidos
        })
        
        setEventosValidosPallets(eventosValidosMap)
      }
    }
    
    cargarEventosValidosPallets()
  }, [pallets]) // Se ejecuta cuando cambian los pallets

  // Función para detectar si un lote fue paletizado
  const fuePaletizado = (lote: any, eventos: any[]) => {
    const estadosPaletizados = ['Paletizado', 'En Cámara', 'Listo Despacho', 'Despachado']
    const eventosPaletizado = ['Paletizado']
    
    return estadosPaletizados.includes(lote?.estado || '') || 
           eventosPaletizado.includes(lote?.ultimo_evento || '') ||
           eventos.some(e => eventosPaletizado.includes(e.tipo))
  }

  // Funciones auxiliares
  const manejarEventoAgregado = () => {
    setMostrarModalEvento(false)
    // Forzar refresco de todos los datos relacionados
    refrescarLotes()
    
    // Si estamos en la vista de detalle, también refrescar los datos específicos del lote
    if (vistaActual === 'detalle' && loteSeleccionado && refrescarLoteActual) {
      refrescarLoteActual()
    }
    
    // Limpiar eventos válidos de pallets para forzar recarga
    setEventosValidosPallets({})
    
    // Los datos del dashboard y eventos se refrescarán automáticamente cuando se actualicen los lotes
  }

  const renderizarVista = () => {
    switch (vistaActual) {
      case 'panel':
        return <VistaPanel />
      case 'lotes':
        return <VistaLotes />
      case 'detalle':
        return <VistaDetalleLote />
      case 'eventos':
        return <VistaEventos />
      case 'reportes':
        return <VistaReportes />
      case 'camaras':
        return <VistaCamaras />
      case 'perfil':
        return <VistaPerfil />
      case 'nuevo':
        return <VistaNuevoLote />
      case 'codigos':
        return <VistaCodigos />
      default:
        return <VistaPanel />
    }
  }



  // Vista del Panel Principal
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
            <MapPin className="text-blue-600" size={24} />
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
                  setLoteSeleccionado(lote.id || '')
                  setVistaActual('detalle')
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Leaf className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium text-gray-900">{lote.id}</p>
                      <p className="text-sm text-gray-600">{lote.cultivo} - {lote.variedad}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {renderEstadoLote(lote.estado)}
                    <p className="text-xs text-gray-500 mt-1">{lote.cuartel_origen}</p>
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
              <EventoItem
                key={index}
                evento={evento}
                index={index}
                onClick={(loteId) => {
                  setLoteSeleccionado(loteId);
                  setVistaActual('detalle');
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Resumen de Cámaras Frigoríficas */}
      <ResumenCamaras onVerMas={() => setMostrarGestionCamaras(true)} />
    </div>
  )

  // Función para renderizar el estado del lote con colores apropiados
  const renderEstadoLote = (estado: string | null) => {
    const estadoSeguro = estado || 'En Cosecha'
    
    const estadoConfig = {
      'En Cosecha': {
        color: 'bg-yellow-100 text-yellow-800',
        icon: <Scissors className="h-3 w-3" />
      },
      'Cosecha Completa': {
        color: 'bg-green-100 text-green-800',
        icon: <CheckCircle className="h-3 w-3" />
      },
      'En Packing': {
        color: 'bg-blue-100 text-blue-800',
        icon: <Factory className="h-3 w-3" />
      },
      'Empacado': {
        color: 'bg-purple-100 text-purple-800',
        icon: <Package className="h-3 w-3" />
      },
      'En Cámara': {
        color: 'bg-cyan-100 text-cyan-800',
        icon: <Snowflake className="h-3 w-3" />
      },
      'Listo Despacho': {
        color: 'bg-orange-100 text-orange-800',
        icon: <Truck className="h-3 w-3" />
      },
      'Despachado': {
        color: 'bg-gray-100 text-gray-800',
        icon: <Send className="h-3 w-3" />
      },
      'Eliminado': {
        color: 'bg-red-100 text-red-800',
        icon: <X className="h-3 w-3" />
      }
    }

    const config = estadoConfig[estadoSeguro as keyof typeof estadoConfig] || {
      color: 'bg-gray-100 text-gray-800',
      icon: <Activity className="h-3 w-3" />
    }

    return (
      <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        {config.icon}
        <span>{estadoSeguro}</span>
      </span>
    )
  }

  // Vista de Lotes con filtros y ordenamiento
  const VistaLotes = () => {
    const [filtroEstado, setFiltroEstado] = useState<string>('')
    const [filtroCultivo, setFiltroCultivo] = useState<string>('')
    const [busqueda, setBusqueda] = useState<string>('')
    const [ordenamiento, setOrdenamiento] = useState<'fecha_desc' | 'fecha_asc' | 'estado' | 'cultivo' | 'area'>('fecha_desc')

    // Filtrar y ordenar lotes
    const lotesFiltrados = React.useMemo(() => {
      let lotesResultado = [...lotes]

      // Aplicar filtros
      if (filtroEstado) {
        lotesResultado = lotesResultado.filter(lote => lote.estado === filtroEstado)
      }
      if (filtroCultivo) {
        lotesResultado = lotesResultado.filter(lote => lote.cultivo === filtroCultivo)
      }
      if (busqueda) {
        lotesResultado = lotesResultado.filter(lote => 
          lote.id?.toLowerCase().includes(busqueda.toLowerCase()) ||
          lote.cultivo?.toLowerCase().includes(busqueda.toLowerCase()) ||
          lote.variedad?.toLowerCase().includes(busqueda.toLowerCase()) ||
          lote.cuartel_origen?.toLowerCase().includes(busqueda.toLowerCase())
        )
      }

      // Aplicar ordenamiento
      switch (ordenamiento) {
        case 'fecha_desc':
          return lotesResultado.sort((a, b) => 
            new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
          )
        case 'fecha_asc':
          return lotesResultado.sort((a, b) => 
            new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
          )
        case 'estado':
          return lotesResultado.sort((a, b) => (a.estado || '').localeCompare(b.estado || ''))
        case 'cultivo':
          return lotesResultado.sort((a, b) => (a.cultivo || '').localeCompare(b.cultivo || ''))
        case 'area':
          return lotesResultado.sort((a, b) => Number(b.area || 0) - Number(a.area || 0))
        default:
          return lotesResultado
      }
    }, [lotes, filtroEstado, filtroCultivo, busqueda, ordenamiento])

    // Obtener valores únicos para filtros
    const estadosUnicos = Array.from(new Set(lotes.map(l => l.estado).filter(Boolean)))
    const cultivosUnicos = Array.from(new Set(lotes.map(l => l.cultivo).filter(Boolean)))

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Gestión de Lotes</h2>
            <p className="text-gray-600">
              {lotesFiltrados.length} de {lotes.length} lotes
            </p>
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={() => setMostrarGeneradorDemo(true)}
              className="bg-lima-600 hover:bg-lima-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <Database className="h-4 w-4" />
              <span className="hidden sm:inline">Generar Demo</span>
            </button>
            <button 
              onClick={() => setVistaActual('nuevo')}
              className="bg-cultivo-600 hover:bg-cultivo-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Nuevo Lote</span>
            </button>
            <button 
              onClick={refrescarLotes}
              className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg transition-colors"
              title="Actualizar lista"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Búsqueda */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Buscar lotes
              </label>
              <input
                type="text"
                placeholder="ID, cultivo, variedad o cuartel..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cultivo-500 focus:border-cultivo-500"
              />
            </div>

            {/* Filtro por estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cultivo-500 focus:border-cultivo-500"
                title="Filtrar por estado"
              >
                <option value="">Todos los estados</option>
                {estadosUnicos.map(estado => (
                  <option key={estado} value={estado || ''}>{estado}</option>
                ))}
              </select>
            </div>

            {/* Filtro por cultivo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cultivo
              </label>
              <select
                value={filtroCultivo}
                onChange={(e) => setFiltroCultivo(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cultivo-500 focus:border-cultivo-500"
                title="Filtrar por cultivo"
              >
                <option value="">Todos los cultivos</option>
                {cultivosUnicos.map(cultivo => (
                  <option key={cultivo} value={cultivo || ''}>{cultivo}</option>
                ))}
              </select>
            </div>

            {/* Ordenamiento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ordenar por
              </label>
              <select
                value={ordenamiento}
                onChange={(e) => setOrdenamiento(e.target.value as any)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cultivo-500 focus:border-cultivo-500"
                title="Ordenar lotes"
              >
                <option value="fecha_desc">Más recientes</option>
                <option value="fecha_asc">Más antiguos</option>
                <option value="estado">Estado</option>
                <option value="cultivo">Cultivo</option>
                <option value="area">Área (mayor)</option>
              </select>
            </div>
          </div>

          {/* Resumen de filtros activos */}
          {(filtroEstado || filtroCultivo || busqueda) && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-500">Filtros activos:</span>
              {filtroEstado && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-cultivo-100 text-cultivo-800">
                  Estado: {filtroEstado}
                  <button 
                    onClick={() => setFiltroEstado('')}
                    className="ml-1 text-cultivo-600 hover:text-cultivo-900"
                  >
                    ×
                  </button>
                </span>
              )}
              {filtroCultivo && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-lima-100 text-lima-800">
                  Cultivo: {filtroCultivo}
                  <button 
                    onClick={() => setFiltroCultivo('')}
                    className="ml-1 text-lima-600 hover:text-lima-900"
                  >
                    ×
                  </button>
                </span>
              )}
              {busqueda && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  Buscar: {busqueda}
                  <button 
                    onClick={() => setBusqueda('')}
                    className="ml-1 text-gray-600 hover:text-gray-900"
                  >
                    ×
                  </button>
                </span>
              )}
              <button
                onClick={() => {
                  setFiltroEstado('')
                  setFiltroCultivo('')
                  setBusqueda('')
                }}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Limpiar filtros
              </button>
            </div>
          )}
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
          ) : lotesFiltrados.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {lotes.length === 0 ? 'No hay lotes' : 'No se encontraron lotes'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {lotes.length === 0 
                  ? 'Comienza creando tu primer lote.' 
                  : 'Intenta ajustar los filtros de búsqueda.'
                }
              </p>
              {lotes.length === 0 && (
                <button
                  onClick={() => setVistaActual('nuevo')}
                  className="mt-4 bg-cultivo-600 hover:bg-cultivo-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Crear Primer Lote
                </button>
              )}
            </div>
          ) : (
            lotesFiltrados.map((lote) => (
            <div key={lote.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <Leaf className="h-5 w-5 text-green-500" />
                  <div>
                    <h3 className="font-semibold text-gray-900">{lote.id}</h3>
                    <p className="text-sm text-gray-600">{lote.cultivo} - {lote.variedad}</p>
                  </div>
                </div>
                <div className="text-right">
                  {renderEstadoLote(lote.estado)}
                </div>
              </div>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm mb-4">
                <div>
                  <p className="text-gray-500">Cuartel</p>
                  <p className="font-medium">{lote.cuartel_origen}</p>
                </div>
                <div>
                  <p className="text-gray-500">Área</p>
                  <p className="font-medium">{lote.area} ha</p>
                </div>
                <div>
                  <p className="text-gray-500">Último Evento</p>
                  <p className="font-medium text-xs">{lote.ultimo_evento || 'Sin eventos'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Fecha</p>
                  <p className="font-medium text-xs">
                    {lote.fecha_ultimo_evento ? new Date(lote.fecha_ultimo_evento).toLocaleDateString('es-CL') : '-'}
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setLoteSeleccionado(lote.id || '')
                    setVistaActual('detalle')
                  }}
                  className="flex-1 bg-cultivo-600 hover:bg-cultivo-700 text-white px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-center space-x-2"
                >
                  <Eye className="h-4 w-4" />
                  <span>Ver Detalle</span>
                </button>
                <button
                  onClick={() => {
                    setLoteSeleccionado(lote.id || '')
                    setMostrarModalEvento(true)
                  }}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Evento</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
  }

  // Vista de Detalle de Lote
  const VistaDetalleLote = () => {

    // Función para manejar eventos de pallet
    const manejarEventoPallet = (codigoPallet: string, tipoEvento: string) => {
      console.log(`Registrar evento ${tipoEvento} para pallet ${codigoPallet}`)
      // Configurar el modal para evento de pallet
      if (tipoEvento === 'personalizado') {
        // Usuario quiere seleccionar un evento diferente
        setEventoParaPallet({ codigo: codigoPallet, tipoEvento: '' })
      } else {
        // Evento específico sugerido
        setEventoParaPallet({ codigo: codigoPallet, tipoEvento })
      }
      setMostrarModalEvento(true)
    }

      // Función para manejar acciones de pallet
  const manejarAccionPallet = (codigoPallet: string, accion: string) => {
    console.log(`Acción ${accion} en pallet ${codigoPallet}`)
    
    if (accion === 'ver_detalle') {
      setPalletSeleccionado(codigoPallet)
      setMostrandoDetallePallet(true)
    } else {
      // TODO: Implementar acciones específicas por pallet
      // - Enfriado: Abrir formulario de ingreso a cámara
      // - Control Calidad: Abrir formulario de inspección
      // - Despacho: Abrir formulario de asignación a contenedor
      console.log(`Implementar acción ${accion} para pallet ${codigoPallet}`)
    }
  }

  // Función para obtener el color del estado del pallet
  const getColorEstadoPallet = (estado: string) => {
    const colorMap: Record<string, string> = {
      'completo': 'bg-green-100 text-green-800',
      'en_camara': 'bg-blue-100 text-blue-800',
      'en_transito': 'bg-orange-100 text-orange-800',
      'entregado': 'bg-gray-100 text-gray-800'
    }
    return colorMap[estado] || 'bg-gray-100 text-gray-800'
  }

    // Si estamos mostrando detalle de pallet
    if (mostrandoDetallePallet && palletSeleccionado) {
      return (
        <DetallePallet
          codigoPallet={palletSeleccionado}
          onVolver={() => {
            setMostrandoDetallePallet(false)
            setPalletSeleccionado(null)
          }}
          onAgregarEvento={manejarEventoPallet}
        />
      )
    }

    if (loteLoading) {
      return (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cultivo-600 mx-auto"></div>
          <h3 className="mt-4 text-sm font-medium text-gray-900">Cargando detalles del lote...</h3>
          <p className="mt-1 text-sm text-gray-500">Un momento por favor.</p>
        </div>
      )
    }

    if (!loteSeleccionado || (!lote && !loteError)) {
      return (
        <div className="text-center py-8">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay lote seleccionado</h3>
          <p className="mt-1 text-sm text-gray-500">Selecciona un lote para ver sus detalles.</p>
          <button
            onClick={() => setVistaActual('lotes')}
            className="mt-4 bg-cultivo-600 hover:bg-cultivo-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Ver Lotes
          </button>
        </div>
      )
    }



    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setVistaActual('lotes')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Volver a la lista de lotes"
              title="Volver a la lista de lotes"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Detalle del Lote</h2>
              <p className="text-gray-600">{loteSeleccionado}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
                                  onClick={() => setMostrarVistaPreviewEtiquetas(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Printer className="h-4 w-4" />
              <span>Imprimir Etiqueta</span>
            </button>
          </div>
        </div>

        {/* Acción Rápida Sugerida */}
        {lote && eventosValidos?.siguiente_sugerido && !fuePaletizado(lote, eventos) && (
          <div className="bg-gradient-to-r from-cultivo-50 to-lima-50 border border-cultivo-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-cultivo-500 rounded-full flex items-center justify-center text-white">
                    {(() => {
                      const tipo = eventosValidos.siguiente_sugerido.tipo;
                      const iconMap: Record<string, React.ReactNode> = {
                        'Inicio Cosecha': <Scissors className="h-6 w-6" />,
                        'Cosecha Completa': <CheckCircle className="h-6 w-6" />,
                        'Recepción Packing': <Truck className="h-6 w-6" />,
                        'Selección': <Filter className="h-6 w-6" />,
                        'Empaque': <Package className="h-6 w-6" />,
                        'Paletizado': <Grid3X3 className="h-6 w-6" />,
                        'Enfriado': <Snowflake className="h-6 w-6" />,
                        'Control Calidad': <ShieldCheck className="h-6 w-6" />,
                        'Despacho': <Send className="h-6 w-6" />
                      };
                      return iconMap[tipo] || <Activity className="h-6 w-6" />;
                    })()}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-lg font-semibold text-gray-900">Siguiente paso sugerido</h3>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-cultivo-100 text-cultivo-800">
                      Recomendado
                    </span>
                  </div>
                  <p className="text-cultivo-700 font-medium">{eventosValidos.siguiente_sugerido.tipo}</p>
                  <p className="text-sm text-gray-600 mt-1">{eventosValidos.siguiente_sugerido.descripcion}</p>
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                <button
                  onClick={() => setMostrarModalEvento(true)}
                  className="bg-cultivo-600 hover:bg-cultivo-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2 font-medium"
                >
                  <CheckCircle className="h-5 w-5" />
                  <span>Registrar {eventosValidos.siguiente_sugerido.tipo}</span>
                </button>
                <div className="text-center">
                <button
                  onClick={() => setMostrarModalEvento(true)}
                    className="text-sm text-gray-500 hover:text-gray-700 underline transition-colors"
                >
                    ¿Necesitas registrar un evento diferente?
                </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Si el proceso está completo */}
        {eventosValidos?.proceso_completo && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white">
                  <CheckCircle className="h-6 w-6" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-green-900">Proceso Completado</h3>
                <p className="text-green-700">Este lote ha completado toda la secuencia de trazabilidad requerida.</p>
              </div>
              <div className="flex space-x-2">
                <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2">
                  <Download className="h-4 w-4" />
                  <span>Exportar</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {loteLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cultivo-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Cargando detalles del lote...</p>
          </div>
        ) : loteError ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">Error: {loteError}</p>
          </div>
        ) : lote ? (
          <div className="grid gap-6">
            {/* Información del Lote */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Información General</h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Cultivo</p>
                  <p className="font-medium text-gray-900">{lote.cultivo}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Variedad</p>
                  <p className="font-medium text-gray-900">{lote.variedad}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Área</p>
                  <p className="font-medium text-gray-900">{lote.area} ha</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Cuartel</p>
                  <p className="font-medium text-gray-900">{lote.cuartel_origen}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Estado</p>
                  {renderEstadoLote(lote.estado)}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Fecha Cosecha</p>
                  <p className="font-medium text-gray-900">
                    {lote.created_at ? new Date(lote.created_at).toLocaleDateString('es-CL') : '-'}
                  </p>
                </div>
              </div>
            </div>

            {/* NUEVA SECCIÓN: Gestión de Pallets para Lotes Paletizados */}
            {lote && fuePaletizado(lote, eventos) && (
              <div className="space-y-6">
                {/* Header de Pallets - Siguiendo el patrón de gradiente */}
                <div className="bg-gradient-to-r from-orange-50 to-cultivo-50 border border-orange-200 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white">
                          <Grid3X3 className="h-6 w-6" />
                </div>
                  </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900">Lote Paletizado</h3>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Ciclo Completado
                          </span>
              </div>
                        <p className="text-gray-600">
                          Gestiona cada pallet individualmente para continuar la trazabilidad
                        </p>
                    </div>
                    </div>
                    <div className="text-right hidden sm:block">
                      <p className="text-sm text-gray-500">Total Pallets</p>
                      <p className="text-2xl font-bold text-orange-600">{pallets.length}</p>
                    </div>
                  </div>
                </div>

                {/* Loading State */}
                                  {palletsLoading ? (
                  <div className="bg-white rounded-lg border border-gray-200 p-8">
                    <div className="flex items-center justify-center space-x-3">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cultivo-600"></div>
                      <span className="text-gray-600">Cargando pallets...</span>
                    </div>
                  </div>
                ) : pallets.length === 0 ? (
                  /* Estado sin pallets */
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="h-6 w-6 text-yellow-600 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-medium text-yellow-900">Pallets No Registrados</h4>
                        <p className="text-yellow-800 text-sm mt-1">
                          Este lote fue paletizado pero no tiene pallets registrados en el sistema.
                        </p>
                    <button
                          onClick={() => {
                            // TODO: Implementar modal para registrar pallets
                            console.log('Registrar pallets para lote:', loteSeleccionado)
                          }}
                          className="mt-3 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
                    >
                      <Plus className="h-4 w-4" />
                          <span>Registrar Pallets</span>
                    </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Métricas de Pallets - Siguiendo patrón de métricas */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Total Pallets</p>
                            <p className="text-2xl font-bold text-gray-900">{pallets.length}</p>
                      </div>
                          <Package className="text-cultivo-600" size={24} />
                      </div>
                    </div>

                      <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Total Cajas</p>
                            <p className="text-2xl font-bold text-lima-800">
                              {pallets.reduce((total, p) => total + (p.cantidad_cajas_total || 0), 0)}
                            </p>
                          </div>
                          <Grid3X3 className="text-lima-600" size={24} />
                        </div>
                            </div>
                            
                      <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                                  <div>
                            <p className="text-sm text-gray-600">Peso Total</p>
                            <p className="text-2xl font-bold text-orange-800">
                              {pallets.reduce((total, p) => total + (p.peso_total_kg || 0), 0).toFixed(1)} kg
                                    </p>
                          </div>
                          <Scale className="text-orange-600" size={24} />
                                  </div>
                                </div>
                                
                      <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">En Proceso</p>
                            <p className="text-2xl font-bold text-blue-800">
                              {pallets.filter(p => p.estado && !['entregado', 'despachado'].includes(p.estado)).length}
                            </p>
                                    </div>
                          <Activity className="text-blue-600" size={24} />
                                      </div>
                      </div>
                                  </div>
                                  
                    {/* Grid de Pallets Individuales */}
                    <div className="bg-white rounded-lg border border-gray-200">
                      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">Pallets Individuales</h4>
                          <p className="text-sm text-gray-500">Gestiona cada pallet de forma independiente</p>
                        </div>
                                    <button 
                                      onClick={() => {
                            // TODO: Implementar vista de gestión masiva
                            console.log('Gestión masiva de pallets')
                                      }}
                          className="bg-cultivo-600 hover:bg-cultivo-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 text-sm"
                                    >
                          <Settings className="h-4 w-4" />
                          <span className="hidden sm:inline">Gestión Masiva</span>
                                    </button>
                      </div>
                      <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {pallets.map((pallet) => (
                            <div
                              key={pallet.codigo_pallet}
                              className="border border-gray-200 rounded-lg p-4 hover:border-cultivo-300 hover:shadow-sm transition-all cursor-pointer"
                              onClick={() => {
                                setPalletSeleccionado(pallet.codigo_pallet)
                                setMostrandoDetallePallet(true)
                              }}
                            >
                              {/* Header del Pallet */}
                              <div className="flex items-center justify-between mb-3">
                                <span className="font-mono text-sm font-semibold text-gray-900">
                                  {pallet.codigo_pallet}
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getColorEstadoPallet(pallet.estado)}`}>
                                  {pallet.estado?.replace('_', ' ') || 'Sin estado'}
                                </span>
                              </div>

                              {/* Información del Pallet */}
                              <div className="space-y-2 text-sm text-gray-600 mb-4">
                                <div className="flex justify-between">
                                  <span>Cajas:</span>
                                  <span className="font-medium text-gray-900">{pallet.cantidad_cajas_total || 0}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Peso:</span>
                                  <span className="font-medium text-gray-900">{pallet.peso_total_kg || 0} kg</span>
                                </div>
                                {pallet.ubicacion_actual && (
                                  <div className="flex items-center space-x-1 text-xs text-blue-600 mt-2">
                                    <MapPin className="h-3 w-3" />
                                    <span>{pallet.ubicacion_actual}</span>
                                  </div>
                                  )}
                                </div>

                              {/* Botón de Acción Principal - UX Mejorado */}
                              <div className="mt-4">
                                {getSiguientePasoPallet(pallet) ? (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      // Configurar el modal para eventos de pallet
                                      setPalletSeleccionado(pallet.codigo_pallet)
                                      setEventoParaPallet({
                                        codigo: pallet.codigo_pallet,
                                        tipoEvento: getSiguientePasoPallet(pallet) || ''
                                      })
                                      setMostrarModalEvento(true)
                                    }}
                                    className="w-full bg-cultivo-600 hover:bg-cultivo-700 text-white px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2 shadow-sm"
                                  >
                                    {getSiguientePasoPallet(pallet) === 'Enfriado' && <Snowflake className="h-4 w-4" />}
                                    {getSiguientePasoPallet(pallet) === 'Control Calidad' && <ShieldCheck className="h-4 w-4" />}
                                    {getSiguientePasoPallet(pallet) === 'Despacho' && <Send className="h-4 w-4" />}
                                    <span>Registrar {getSiguientePasoPallet(pallet)}</span>
                                  </button>
                                ) : (
                                  <div className="w-full bg-green-100 text-green-800 px-4 py-3 rounded-lg text-sm font-medium text-center border border-green-200">
                                    <div className="flex items-center justify-center space-x-2">
                                      <CheckCircle className="h-4 w-4" />
                                      <span>Proceso Completo</span>
                                    </div>
                                  </div>
                                )}
                                
                                {/* Indicador visual de que el card es clickeable para ver detalles */}
                                <p className="text-xs text-gray-500 mt-2 text-center">
                                  Haz click en el card para ver detalles e historial
                                </p>
                              </div>
                            </div>
                          ))}
                          </div>
                    </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Trazabilidad del Lote usando componente reutilizable */}
            <TrazabilidadTimeline 
              eventos={eventos}
              loading={loteLoading}
              titulo="Trazabilidad del Lote"
              subtitulo="Seguimiento completo del proceso"
              entidadId={loteSeleccionado ?? ''}
              tipoEntidad="lote"
              onAgregarEvento={() => setMostrarModalEvento(true)}
              mostrarBotonAgregar={!fuePaletizado(lote, eventos)}
            />
          </div>
        ) : (
          <div className="text-center py-8">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Lote no encontrado</h3>
            <p className="mt-1 text-sm text-gray-500">El lote seleccionado no existe o no tienes permisos para verlo.</p>
          </div>
        )}

        {/* Modal Vista Preview Etiquetas */}
        {mostrarVistaPreviewEtiquetas && lote && lote.id && (
          <VistaPreviewEtiquetas
            entidades={[{ ...lote, id: lote.id, tipo: 'lote' as const }]}
            qrDataStrings={[lote.id]}
            config={{ 
              formato: 'qr_texto' as const,
              tamaño: 'grande' as const, 
              incluirLogo: false,
              incluirTexto: true
            }}
            onClose={() => setMostrarVistaPreviewEtiquetas(false)}
            onImprimir={() => {
              const entidadLote = { ...lote, id: lote.id!, tipo: 'lote' as const }
              const html = generarHTMLEtiquetas(
                [entidadLote], 
                { 
                  formato: 'qr_texto' as const,
                  tamaño: 'grande' as const, 
                  incluirLogo: false,
                  incluirTexto: true
                }, 
                [lote.id || '']
              )
              const ventana = window.open('', '_blank')
              if (ventana) {
                ventana.document.write(html)
                ventana.document.close()
                ventana.print()
              }
            }}
            onCambiarConfig={(config) => {
              // La configuración se maneja internamente
            }}
          />
        )}
      </div>
    )
  }

  // Vista de Eventos
  const VistaEventos = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Trazabilidad General</h2>
          <p className="text-gray-600">Seguimiento de todos los eventos en los lotes activos</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => {/* Implementar filtros */}}
            className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
          >
            <Filter className="h-4 w-4" />
            <span>Filtros</span>
          </button>
          <button 
            onClick={() => {/* Implementar export */}}
            className="bg-cultivo-600 hover:bg-cultivo-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Exportar</span>
          </button>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Activity className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Eventos Hoy</p>
              <p className="text-lg font-semibold text-gray-900">
                {eventosRecientes.filter(e => e.fecha && new Date(e.fecha).toDateString() === new Date().toDateString()).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Lotes Activos</p>
              <p className="text-lg font-semibold text-gray-900">
                {dashboardLoading ? '...' : metricas?.lotes_activos || 0}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Esta Semana</p>
              <p className="text-lg font-semibold text-gray-900">
                {eventosRecientes.filter(e => {
                  if (!e.fecha) return false;
                  const eventoFecha = new Date(e.fecha);
                  const haceUnaSemana = new Date();
                  haceUnaSemana.setDate(haceUnaSemana.getDate() - 7);
                  return eventoFecha >= haceUnaSemana;
                }).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Eventos</p>
              <p className="text-lg font-semibold text-gray-900">{eventosRecientes.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Eventos Recientes</h3>
          <p className="text-sm text-gray-500">Actividad más reciente en todos los lotes</p>
        </div>
        <div className="divide-y divide-gray-200">
          {eventosRecientes.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Activity className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay eventos registrados</h3>
              <p className="text-gray-500">Los eventos aparecerán aquí cuando se registren en los lotes.</p>
            </div>
          ) : (
            eventosRecientes.map((evento, index) => (
              <EventoItem
                key={index}
                evento={evento}
                index={index}
                onClick={(loteId) => {
                  setLoteSeleccionado(loteId);
                  setVistaActual('detalle');
                }}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )

    // Vista de Análisis
  const VistaReportes = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Análisis Productivo</h2>
          <p className="text-gray-600">Reportes y métricas de rendimiento operativo</p>
        </div>
        <button 
          onClick={() => setMostrarReportesInventario(true)}
          className="bg-cultivo-600 hover:bg-cultivo-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
        >
          <BarChart3 className="h-4 w-4" />
          <span>Ver Análisis</span>
        </button>
      </div>

      {/* Métricas rápidas */}
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
              <p className="text-2xl font-bold text-cultivo-800">
                {dashboardLoading ? '...' : metricas?.lotes_activos || 0}
              </p>
            </div>
            <TrendingUp className="text-cultivo-600" size={24} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Área Total</p>
              <p className="text-2xl font-bold text-lima-800">
                {dashboardLoading ? '...' : `${Number(metricas?.area_total || 0).toFixed(1)} ha`}
              </p>
            </div>
            <MapPin className="text-lima-600" size={24} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Eventos Hoy</p>
              <p className="text-2xl font-bold text-orange-800">
                {dashboardLoading ? '...' : metricas?.eventos_hoy || 0}
              </p>
            </div>
            <Clock className="text-orange-600" size={24} />
          </div>
        </div>
      </div>

      {/* Reportes disponibles */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Reportes de Trazabilidad</h3>
        <div className="grid gap-4">
          <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Reporte de Lotes</h4>
                <p className="text-sm text-gray-600">Información completa de todos los lotes</p>
              </div>
              <FileText className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Reporte de Trazabilidad</h4>
                <p className="text-sm text-gray-600">Historial completo de eventos por lote</p>
              </div>
              <QrCode className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Reporte SAG</h4>
                <p className="text-sm text-gray-600">Documentación oficial para cumplimiento SAG</p>
              </div>
              <Thermometer className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // Vista de Camaras
  const VistaCamaras = () => (
    <div className="space-y-6">
      {/* Header de la sección */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Cámaras Frigoríficas</h2>
          <p className="text-gray-600">Monitoreo en tiempo real de temperatura y humedad</p>
        </div>
      </div>

      {/* Componente de gestión de cámaras */}
      <GestionCamarasVista />
    </div>
  )

  // Vista de Perfil
  const VistaPerfil = () => {
    const { usuario } = useAuth()
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Perfil de Usuario</h2>
          <button 
            onClick={() => {/* Implementar edición de perfil */}}
            className="bg-cultivo-600 hover:bg-cultivo-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
          >
            <Settings className="h-4 w-4" />
            <span>Editar</span>
          </button>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="bg-cultivo-100 p-4 rounded-full">
              <User className="h-8 w-8 text-cultivo-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{usuario?.nombre}</h3>
              <p className="text-gray-600">{usuario?.cargo}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Información Personal</h4>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">{usuario?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Teléfono</p>
                  <p className="font-medium text-gray-900">{usuario?.telefono || 'No especificado'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Cargo</p>
                  <p className="font-medium text-gray-900">{usuario?.cargo}</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Configuración</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Notificaciones</span>
                  <button 
                    className="bg-cultivo-600 relative inline-flex h-6 w-11 items-center rounded-full"
                    aria-label="Activar notificaciones"
                    title="Activar notificaciones"
                  >
                    <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition"></span>
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Modo oscuro</span>
                  <button 
                    className="bg-gray-200 relative inline-flex h-6 w-11 items-center rounded-full"
                    aria-label="Activar modo oscuro"
                    title="Activar modo oscuro"
                  >
                    <span className="translate-x-1 inline-block h-4 w-4 transform rounded-full bg-white transition"></span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Vista de Nuevo Lote
  const VistaNuevoLote = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Crear Nuevo Lote</h2>
        <button 
          onClick={() => setVistaActual('lotes')}
          className="text-gray-600 hover:text-gray-800 transition-colors flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Volver</span>
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ID del Lote
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cultivo-500 focus:border-cultivo-500"
                placeholder="LP-2025-CHIL-004"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cultivo
              </label>
              <select 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cultivo-500 focus:border-cultivo-500"
                aria-label="Seleccionar cultivo"
              >
                <option value="">Seleccionar cultivo</option>
                <option value="Arándanos">Arándanos</option>
                <option value="Cerezas">Cerezas</option>
                <option value="Manzanas">Manzanas</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Variedad
              </label>
              <select 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cultivo-500 focus:border-cultivo-500"
                aria-label="Seleccionar variedad"
              >
                <option value="">Seleccionar variedad</option>
                <option value="Duke">Duke</option>
                <option value="Sweet Heart">Sweet Heart</option>
                <option value="Golden Delicious">Golden Delicious</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Área (hectáreas)
              </label>
              <input
                type="number"
                step="0.1"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cultivo-500 focus:border-cultivo-500"
                placeholder="2.5"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cuartel de Origen
              </label>
              <select 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cultivo-500 focus:border-cultivo-500"
                aria-label="Seleccionar cuartel"
              >
                <option value="">Seleccionar cuartel</option>
                <option value="Cuartel 1">Cuartel 1</option>
                <option value="Cuartel 2">Cuartel 2</option>
                <option value="Cuartel 3">Cuartel 3</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Cosecha
              </label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cultivo-500 focus:border-cultivo-500"
                aria-label="Fecha de cosecha"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setVistaActual('lotes')}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-cultivo-600 hover:bg-cultivo-700 text-white rounded-lg transition-colors"
            >
              Crear Lote
            </button>
          </div>
        </form>
      </div>
    </div>
  )

  // Vista de Códigos QR y Códigos de Barras
  const VistaCodigos = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Códigos</h1>
        <p className="text-gray-600 mt-1">Genera e imprime códigos QR y de barras para tus lotes y pallets.</p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200 flex items-center">
          <div className="bg-blue-100 text-blue-600 p-3 rounded-lg mr-4">
            <QrCode className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Escaneos</p>
            <p className="text-2xl font-bold">0</p>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200 flex items-center">
          <div className="bg-green-100 text-green-600 p-3 rounded-lg mr-4">
            <Printer className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Etiquetas Impresas</p>
            <p className="text-2xl font-bold">0</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 flex items-center">
          <div className="bg-teal-100 text-teal-600 p-3 rounded-lg mr-4">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Lotes con Códigos</p>
            <p className="text-2xl font-bold">0</p>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200 flex items-center">
          <div className="bg-purple-100 text-purple-600 p-3 rounded-lg mr-4">
            <Boxes className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Pallets con Códigos</p>
            <p className="text-2xl font-bold">0</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div 
          className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md hover:border-blue-500 transition-all cursor-pointer"
          onClick={() => setMostrarModalEscanear(true)}
        >
          <div className="flex items-center">
            <div className="bg-blue-100 text-blue-600 p-3 rounded-lg mr-4">
              <QrCode className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Escanear Código</h2>
              <p className="text-gray-600">Usa la cámara para escanear códigos QR de lotes o pallets.</p>
            </div>
          </div>
        </div>
        <div 
          className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md hover:border-green-500 transition-all cursor-pointer"
          onClick={() => setMostrarModalImprimir(true)}
        >
          <div className="flex items-center">
            <div className="bg-green-100 text-green-600 p-3 rounded-lg mr-4">
              <Printer className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Imprimir Etiquetas</h2>
              <p className="text-gray-600">Genera e imprime etiquetas para tus lotes o pallets.</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h2 className="text-lg font-semibold mb-4 text-gray-900">Actividad Reciente</h2>
        <div className="text-center py-12">
          <div className="bg-gray-100 p-4 rounded-full inline-block">
            <ScanLine className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-800">No hay actividad de códigos aún</h3>
          <p className="mt-1 text-gray-500">Escanea o imprime códigos para ver la actividad aquí.</p>
        </div>
      </div>
    </div>
  )

  // Si está cargando la autenticación, mostrar pantalla de carga
  if (authLoading) {
    return <LoadingScreen />
  }

  // Si no está autenticado, mostrar formularios de autenticación
  if (!isAuthenticated) {
    return <AuthContainer />
  }

  // Si está autenticado, mostrar la aplicación principal
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header con información del usuario */}
      <Header />
      
      {/* Contenido principal */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:bg-white lg:border-r lg:border-gray-200">
          <nav className="flex-1 p-4 space-y-2">
            <button
              onClick={() => {
                setVistaActual('panel')
                setLoteSeleccionado(null)
              }}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                vistaActual === 'panel' 
                  ? 'bg-cultivo-50 text-cultivo-700 border border-cultivo-200' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <BarChart3 className="h-5 w-5" />
              <span className="font-medium">Dashboard</span>
            </button>
            
            <button
              onClick={() => {
                setVistaActual('lotes')
                setLoteSeleccionado(null)
              }}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                vistaActual === 'lotes' 
                  ? 'bg-cultivo-50 text-cultivo-700 border border-cultivo-200' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Package className="h-5 w-5" />
              <span className="font-medium">Lotes</span>
            </button>

            <button
              onClick={() => {
                setVistaActual('eventos')
                setLoteSeleccionado(null)
              }}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                vistaActual === 'eventos' 
                  ? 'bg-cultivo-50 text-cultivo-700 border border-cultivo-200' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Activity className="h-5 w-5" />
              <span className="font-medium">Eventos</span>
            </button>

            <button
              onClick={() => {
                setVistaActual('codigos')
                setLoteSeleccionado(null)
              }}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                vistaActual === 'codigos' 
                  ? 'bg-cultivo-50 text-cultivo-700 border border-cultivo-200' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <QrCode className="h-5 w-5" />
              <span className="font-medium">Códigos</span>
            </button>

            <button
              onClick={() => {
                setVistaActual('reportes')
                setLoteSeleccionado(null)
              }}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                vistaActual === 'reportes' 
                  ? 'bg-cultivo-50 text-cultivo-700 border border-cultivo-200' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <BarChart3 className="h-5 w-5" />
              <span className="font-medium">Análisis</span>
            </button>

            <button
              onClick={() => {
                setVistaActual('camaras')
                setLoteSeleccionado(null)
              }}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                vistaActual === 'camaras' 
                  ? 'bg-cultivo-50 text-cultivo-700 border border-cultivo-200' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
                             <Snowflake className="h-5 w-5" />
               <span className="font-medium">Cámaras</span>
            </button>

            <button
              onClick={() => {
                setVistaActual('perfil')
                setLoteSeleccionado(null)
              }}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                vistaActual === 'perfil' 
                  ? 'bg-cultivo-50 text-cultivo-700 border border-cultivo-200' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <User className="h-5 w-5" />
              <span className="font-medium">Perfil</span>
            </button>

            {/* Separador */}
            <div className="border-t border-gray-200 my-4"></div>

            <button
              onClick={() => {
                setVistaActual('nuevo')
                setLoteSeleccionado(null)
              }}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                vistaActual === 'nuevo' 
                  ? 'bg-cultivo-50 text-cultivo-700 border border-cultivo-200' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Plus className="h-5 w-5" />
              <span className="font-medium">Nuevo Lote</span>
            </button>

            <div className="mt-auto pt-4">
              <div className="text-xs text-gray-500 px-3">
                <p>KimunPulse v1.0</p>
                <p>Sistema de Trazabilidad</p>
              </div>
            </div>
          </nav>
        </aside>

        {/* Contenido principal */}
        <main className="flex-1 p-4 lg:p-6 pb-20 lg:pb-6">
          {renderizarVista()}
        </main>
      </div>

      {/* Bottom Navigation para móviles */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around">
          <button
            onClick={() => {
              setVistaActual('panel')
              setLoteSeleccionado(null)
            }}
            className={`flex flex-col items-center space-y-1 px-2 py-2 rounded-lg transition-colors ${
              vistaActual === 'panel' 
                ? 'text-cultivo-600' 
                : 'text-gray-500'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span className="text-xs font-medium">Panel</span>
          </button>
          
          <button
            onClick={() => {
              setVistaActual('lotes')
              setLoteSeleccionado(null)
            }}
            className={`flex flex-col items-center space-y-1 px-2 py-2 rounded-lg transition-colors ${
              vistaActual === 'lotes' 
                ? 'text-cultivo-600' 
                : 'text-gray-500'
            }`}
          >
            <Package className="h-4 w-4" />
            <span className="text-xs font-medium">Lotes</span>
          </button>

          <button
            onClick={() => {
              setVistaActual('eventos')
              setLoteSeleccionado(null)
            }}
            className={`flex flex-col items-center space-y-1 px-2 py-2 rounded-lg transition-colors ${
              vistaActual === 'eventos' 
                ? 'text-cultivo-600' 
                : 'text-gray-500'
            }`}
          >
            <Activity className="h-4 w-4" />
            <span className="text-xs font-medium">Eventos</span>
          </button>

          <button
            onClick={() => {
              setVistaActual('codigos')
              setLoteSeleccionado(null)
            }}
            className={`flex flex-col items-center space-y-1 px-2 py-2 rounded-lg transition-colors ${
              vistaActual === 'codigos' 
                ? 'text-cultivo-600' 
                : 'text-gray-500'
            }`}
          >
            <QrCode className="h-4 w-4" />
            <span className="text-xs font-medium">QR</span>
          </button>

          <button
            onClick={() => {
              setVistaActual('camaras')
              setLoteSeleccionado(null)
            }}
            className={`flex flex-col items-center space-y-1 px-2 py-2 rounded-lg transition-colors ${
              vistaActual === 'camaras' 
                ? 'text-cultivo-600' 
                : 'text-gray-500'
            }`}
          >
            <Snowflake className="h-4 w-4" />
             <span className="text-xs font-medium">Cámaras</span>
          </button>
        </div>
      </nav>

      {/* Modal para agregar evento */}
      <ModalAgregarEvento
        isOpen={mostrarModalEvento}
        loteId={loteSeleccionado || ''}
        onClose={() => {
          setMostrarModalEvento(false)
          setEventoParaPallet(null)
        }}
        onEventoAgregado={manejarEventoAgregado}
        eventosValidosData={eventosValidos}
        loteActual={lotes.find(l => l.id === loteSeleccionado)}
        eventoParaPallet={eventoParaPallet}
      />

      {/* Modal para escanear QR */}
      <ModalEscanearQR
        isOpen={mostrarModalEscanear}
        onClose={() => setMostrarModalEscanear(false)}
        onSuccess={(resultado) => {
          console.log('Código escaneado:', resultado)
          setMostrarModalEscanear(false)
        }}
        onNavigateToDetail={(id, tipo) => {
          if (tipo === 'lote') {
            setLoteSeleccionado(id)
            setVistaActual('detalle')
          } else if (tipo === 'pallet') {
            // Para pallets, navegar directamente al detalle del pallet
            setPalletSeleccionado(id)
            setMostrandoDetallePallet(true)
            setVistaActual('detalle') // Asegurarse de estar en la vista correcta
          }
          setMostrarModalEscanear(false)
        }}
        onNavigateToHistory={(id, tipo) => {
          if (tipo === 'lote') {
            setLoteHistorial(id)
            setMostrarModalHistorial(true)
          } else if (tipo === 'pallet') {
            // Para pallets, podrías implementar un modal de historial de pallet
            console.log('Historial de pallet:', id)
          }
          setMostrarModalEscanear(false)
        }}
        onAddEvent={(id, tipo) => {
          if (tipo === 'lote') {
            setLoteSeleccionado(id)
            setMostrarModalEvento(true)
          } else if (tipo === 'pallet') {
            // Para pallets, configurar evento específico de pallet
            setEventoParaPallet({ codigo: id, tipoEvento: 'gestion' })
            setMostrarModalEvento(true)
          }
          setMostrarModalEscanear(false)
        }}
      />

      {/* Modal para imprimir etiquetas */}
      <ModalImprimirEtiquetas
        isOpen={mostrarModalImprimir}
        onClose={() => setMostrarModalImprimir(false)}
        onSuccess={(resultado) => {
          console.log('Etiquetas impresas:', resultado)
        }}
      />

      {/* Modal para historial de lote */}
      {mostrarModalHistorial && loteHistorial && (
        <ModalHistorialLote
          isOpen={mostrarModalHistorial}
          onClose={() => {
            setMostrarModalHistorial(false)
            setLoteHistorial(null)
          }}
          loteId={loteHistorial}
        />
      )}

      {/* Modal para reportes de inventario */}
              {mostrarReportesInventario && (
          <ReportesProductivos
            onClose={() => setMostrarReportesInventario(false)}
          />
        )}

      {/* Modal para generar lotes de demo */}
      {mostrarGeneradorDemo && (
        <GeneradorLotesDemo
          onClose={() => setMostrarGeneradorDemo(false)}
          onLotesGenerados={() => {
            refrescarLotes()
            setMostrarGeneradorDemo(false)
          }}
        />
      )}

      {/* Modal para gestión de cámaras */}
      {mostrarGestionCamaras && (
        <GestionCamaras
          onClose={() => setMostrarGestionCamaras(false)}
        />
      )}

      {/* Floating Action Button - solo visible en el dashboard y vista de lotes */}
      {(vistaActual === 'panel' || vistaActual === 'lotes') && (
        <FloatingActionButton
          onScanClick={() => setMostrarModalEscanear(true)}
          onAddEventClick={loteSeleccionado ? () => setMostrarModalEvento(true) : undefined}
        />
      )}
    </div>
  )
}
