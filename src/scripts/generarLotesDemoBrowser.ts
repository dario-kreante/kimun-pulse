// Script para generar lotes de demo adicionales para KimunPulse (versión browser)
// Utiliza datos realistas del contexto agrícola chileno

import { supabase } from '../lib/supabase'

// Datos chilenos realistas para cultivos y variedades
const CULTIVOS_CHILENOS = [
  {
    nombre: 'Manzana',
    variedades: ['Gala', 'Fuji', 'Red Delicious', 'Granny Smith', 'Cripps Pink', 'Royal Gala']
  },
  {
    nombre: 'Pera',
    variedades: ['Williams', 'Packham', 'Conference', 'Bosc', 'Red Anjou', 'Forelle']
  },
  {
    nombre: 'Cereza',
    variedades: ['Bing', 'Lapins', 'Sweetheart', 'Royal Dawn', 'Santina', 'Regina']
  },
  {
    nombre: 'Uva',
    variedades: ['Thompson', 'Red Globe', 'Flame', 'Superior', 'Crimson', 'Ruby']
  },
  {
    nombre: 'Arándano',
    variedades: ['Duke', 'Bluecrop', 'Berkeley', 'Legacy', 'Draper', 'Aurora']
  },
  {
    nombre: 'Ciruela',
    variedades: ['Santa Rosa', 'Angeleno', 'Black Beauty', 'Fortune', 'Friar', 'Simka']
  }
]

// Cuarteles típicos chilenos
const CUARTELES_CHILENOS = [
  'Cuartel Norte A', 'Cuartel Norte B', 'Cuartel Norte C',
  'Cuartel Sur A', 'Cuartel Sur B', 'Cuartel Sur C',
  'Cuartel Este A', 'Cuartel Este B', 'Cuartel Este C',
  'Cuartel Oeste A', 'Cuartel Oeste B', 'Cuartel Oeste C',
  'Sector Los Almendros', 'Sector El Roble', 'Sector Las Palmas',
  'Sector San Miguel', 'Sector Santa Elena', 'Sector Los Pinos',
  'Bloque Central', 'Bloque Nuevo'
]

// Estados posibles con probabilidades realistas
const ESTADOS_PROBABILIDADES = [
  { estado: 'En Cosecha', peso: 15 },
  { estado: 'Cosecha Completa', peso: 12 },
  { estado: 'En Packing', peso: 18 },
  { estado: 'Empacado', peso: 20 },
  { estado: 'En Cámara', peso: 25 },
  { estado: 'Listo Despacho', peso: 8 },
  { estado: 'Despachado', peso: 2 }
] as const

// Función para seleccionar item basado en probabilidades
function seleccionarPorPeso<T extends { peso: number }>(items: readonly T[]): T {
  const pesoTotal = items.reduce((sum, item) => sum + item.peso, 0)
  let random = Math.random() * pesoTotal
  
  for (const item of items) {
    random -= item.peso
    if (random <= 0) return item
  }
  
  return items[0] // fallback
}

// Generar ID de lote chileno realista
function generarIdLote(): string {
  const año = new Date().getFullYear()
  const mes = String(new Date().getMonth() + 1).padStart(2, '0')
  const numero = Math.floor(Math.random() * 9000) + 1000
  return `LT-${año}${mes}-${numero}`
}

// Generar área realista para Chile (en hectáreas)
function generarArea(): number {
  // La mayoría de lotes en Chile son entre 0.5 y 5 hectáreas
  const areas = [0.5, 0.8, 1.0, 1.2, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0]
  return areas[Math.floor(Math.random() * areas.length)]
}

// Generar eventos típicos para un lote según su estado
function generarEventosParaEstado(estado: string): Array<{
  tipo: string
  descripcion: string
  diasAtras: number
}> {
  const eventos: Array<{ tipo: string; descripcion: string; diasAtras: number }> = []
  
  // Todos los lotes empiezan con Inicio Cosecha
  eventos.push({
    tipo: 'Inicio Cosecha',
    descripcion: 'Inicio de cosecha en cuartel',
    diasAtras: Math.floor(Math.random() * 30) + 15
  })

  if (['Cosecha Completa', 'En Packing', 'Empacado', 'En Cámara', 'Listo Despacho', 'Despachado'].includes(estado)) {
    eventos.push({
      tipo: 'Cosecha Completa',
      descripcion: 'Cosecha finalizada - fruta transportada a packing',
      diasAtras: Math.floor(Math.random() * 25) + 10
    })
  }

  if (['En Packing', 'Empacado', 'En Cámara', 'Listo Despacho', 'Despachado'].includes(estado)) {
    eventos.push({
      tipo: 'Recepción Packing',
      descripcion: 'Fruta recepcionada en planta de packing',
      diasAtras: Math.floor(Math.random() * 20) + 8
    })
  }

  if (['Empacado', 'En Cámara', 'Listo Despacho', 'Despachado'].includes(estado)) {
    eventos.push({
      tipo: 'Selección',
      descripcion: 'Proceso de selección y clasificación',
      diasAtras: Math.floor(Math.random() * 15) + 6
    })
    
    eventos.push({
      tipo: 'Empaque',
      descripcion: 'Empaque finalizado - cajas listas',
      diasAtras: Math.floor(Math.random() * 12) + 4
    })
  }

  if (['En Cámara', 'Listo Despacho', 'Despachado'].includes(estado)) {
    eventos.push({
      tipo: 'Paletizado',
      descripcion: 'Paletizado completado para almacenamiento',
      diasAtras: Math.floor(Math.random() * 10) + 3
    })
    
    eventos.push({
      tipo: 'Enfriado',
      descripcion: 'Ingreso a cámara frigorífica',
      diasAtras: Math.floor(Math.random() * 8) + 2
    })
  }

  if (['Listo Despacho', 'Despachado'].includes(estado)) {
    eventos.push({
      tipo: 'Control Calidad',
      descripcion: 'Control de calidad aprobado',
      diasAtras: Math.floor(Math.random() * 5) + 1
    })
  }

  if (estado === 'Despachado') {
    eventos.push({
      tipo: 'Despacho',
      descripcion: 'Producto despachado a cliente',
      diasAtras: Math.floor(Math.random() * 3)
    })
  }

  return eventos
}

// Función principal para generar los lotes (versión browser-safe)
export async function generarLotesDemo(cantidad: number = 20): Promise<void> {
  console.log(`🌱 Generando ${cantidad} lotes de demo...`)
  
  try {
    // 1. Obtener datos existentes de la DB
    console.log('📋 Obteniendo cultivos y cuarteles existentes...')
    
    const { data: cultivosExistentes } = await supabase
      .from('cultivos')
      .select('id, nombre')
    
    const { data: cuartelesExistentes } = await supabase
      .from('cuarteles')
      .select('id, nombre')
      
    const { data: usuariosExistentes } = await supabase
      .from('usuarios')
      .select('id, nombre')

    if (!cultivosExistentes || !cuartelesExistentes || !usuariosExistentes) {
      throw new Error('No se pudieron obtener los datos base de la DB')
    }

    // 2. Crear cultivos faltantes
    console.log('🌿 Creando cultivos faltantes...')
    const cultivosMap = new Map<string, string>()
    
    for (const cultivoInfo of CULTIVOS_CHILENOS) {
      let cultivo = cultivosExistentes.find(c => c.nombre === cultivoInfo.nombre)
      
      if (!cultivo) {
        const { data: nuevoCultivo } = await supabase
          .from('cultivos')
          .insert({
            nombre: cultivoInfo.nombre,
            descripcion: `Cultivo de ${cultivoInfo.nombre} - Región Chilena`,
            activo: true
          })
          .select()
          .single()
        
        if (nuevoCultivo) {
          cultivo = nuevoCultivo
          console.log(`  ✅ Creado cultivo: ${cultivoInfo.nombre}`)
        }
      }
      
      if (cultivo) {
        cultivosMap.set(cultivoInfo.nombre, cultivo.id)
        
        // Crear variedades para este cultivo
        const { data: variedadesExistentes } = await supabase
          .from('variedades')
          .select('nombre')
          .eq('cultivo_id', cultivo.id)
        
        const variedadesExistentesSet = new Set(variedadesExistentes?.map(v => v.nombre) || [])
        
        for (const variedad of cultivoInfo.variedades) {
          if (!variedadesExistentesSet.has(variedad)) {
            await supabase
              .from('variedades')
              .insert({
                nombre: variedad,
                cultivo_id: cultivo.id,
                descripcion: `Variedad ${variedad} de ${cultivoInfo.nombre}`,
                activo: true
              })
            console.log(`    ✅ Creada variedad: ${variedad}`)
          }
        }
      }
    }

    // 3. Crear cuarteles faltantes
    console.log('🏞️ Creando cuarteles faltantes...')
    const cuartelesMap = new Map<string, string>()
    
    for (const nombreCuartel of CUARTELES_CHILENOS) {
      let cuartel = cuartelesExistentes.find(c => c.nombre === nombreCuartel)
      
      if (!cuartel) {
        const { data: nuevoCuartel } = await supabase
          .from('cuarteles')
          .insert({
            nombre: nombreCuartel,
            descripcion: `Cuartel de producción - ${nombreCuartel}`,
            area_total: Math.floor(Math.random() * 20) + 10, // 10-30 hectáreas
            ubicacion: 'Región Metropolitana, Chile',
            activo: true
          })
          .select()
          .single()
        
        if (nuevoCuartel) {
          cuartel = nuevoCuartel
          console.log(`  ✅ Creado cuartel: ${nombreCuartel}`)
        }
      }
      
      if (cuartel) {
        cuartelesMap.set(nombreCuartel, cuartel.id)
      }
    }

    // 4. Generar los lotes
    console.log('📦 Generando lotes...')
    const lotesGenerados: any[] = []
    
    for (let i = 0; i < cantidad; i++) {
      const cultivoInfo = CULTIVOS_CHILENOS[Math.floor(Math.random() * CULTIVOS_CHILENOS.length)]
      const variedad = cultivoInfo.variedades[Math.floor(Math.random() * cultivoInfo.variedades.length)]
      const cuartelNombre = CUARTELES_CHILENOS[Math.floor(Math.random() * CUARTELES_CHILENOS.length)]
      const estado = seleccionarPorPeso(ESTADOS_PROBABILIDADES).estado
      
      const cultivoId = cultivosMap.get(cultivoInfo.nombre)
      const cuartelId = cuartelesMap.get(cuartelNombre)
      
      if (!cultivoId || !cuartelId) {
        console.warn(`⚠️  Saltando lote ${i + 1}: cultivo o cuartel no encontrado`)
        continue
      }

      // Obtener variedad ID
      const { data: variedadData } = await supabase
        .from('variedades')
        .select('id')
        .eq('cultivo_id', cultivoId)
        .eq('nombre', variedad)
        .single()

      if (!variedadData) {
        console.warn(`⚠️  Saltando lote ${i + 1}: variedad no encontrada`)
        continue
      }

      const loteId = generarIdLote()
      const area = generarArea()
      const fechaCreacion = new Date(Date.now() - Math.floor(Math.random() * 60) * 24 * 60 * 60 * 1000)

      // Crear el lote
      const nuevoLote = {
        id: loteId,
        cultivo_id: cultivoId,
        variedad_id: variedadData.id,
        cuartel_id: cuartelId,
        area: area,
        estado: estado,
        activo: true,
        created_at: fechaCreacion.toISOString(),
        observaciones: `Lote de demo - ${cultivoInfo.nombre} ${variedad} - Generado automáticamente`
      }

      lotesGenerados.push(nuevoLote)
      
      // Insertar lote en la base de datos
      const { error: loteError } = await supabase
        .from('lotes')
        .insert(nuevoLote)

      if (loteError) {
        console.error(`❌ Error creando lote ${loteId}:`, loteError)
        continue
      }

      // Generar eventos para el lote
      const eventos = generarEventosParaEstado(estado)
      const responsableId = usuariosExistentes[Math.floor(Math.random() * usuariosExistentes.length)].id

      for (const evento of eventos) {
        const fechaEvento = new Date(fechaCreacion.getTime() + evento.diasAtras * 24 * 60 * 60 * 1000)
        
        await supabase
          .from('eventos_trazabilidad')
          .insert({
            lote_id: loteId,
            tipo: evento.tipo as any, // Cast necesario para tipos de eventos
            descripcion: evento.descripcion,
            fecha: fechaEvento.toISOString(),
            responsable_id: responsableId,
            responsable_nombre: usuariosExistentes.find(u => u.id === responsableId)?.nombre || 'Operario Demo'
          })
      }

      console.log(`  ✅ Lote ${i + 1}/${cantidad}: ${loteId} (${cultivoInfo.nombre} ${variedad} - ${estado})`)
    }

    console.log(`🎉 Proceso completado! Se generaron ${lotesGenerados.length} lotes de demo`)
    console.log('📊 Resumen:')
    
    // Mostrar resumen por estado
    const resumenEstados = lotesGenerados.reduce((acc, lote) => {
      acc[lote.estado] = (acc[lote.estado] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    Object.entries(resumenEstados).forEach(([estado, cantidad]) => {
      console.log(`   ${estado}: ${cantidad} lotes`)
    })

  } catch (error) {
    console.error('❌ Error generando lotes de demo:', error)
    throw error
  }
} 