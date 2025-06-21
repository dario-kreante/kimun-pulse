export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      cuarteles: {
        Row: {
          activo: boolean | null
          area_total: number | null
          created_at: string | null
          descripcion: string | null
          id: string
          nombre: string
          ubicacion: string | null
          updated_at: string | null
        }
        Insert: {
          activo?: boolean | null
          area_total?: number | null
          created_at?: string | null
          descripcion?: string | null
          id?: string
          nombre: string
          ubicacion?: string | null
          updated_at?: string | null
        }
        Update: {
          activo?: boolean | null
          area_total?: number | null
          created_at?: string | null
          descripcion?: string | null
          id?: string
          nombre?: string
          ubicacion?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      cultivos: {
        Row: {
          activo: boolean | null
          created_at: string | null
          descripcion: string | null
          id: string
          nombre: string
          updated_at: string | null
        }
        Insert: {
          activo?: boolean | null
          created_at?: string | null
          descripcion?: string | null
          id?: string
          nombre: string
          updated_at?: string | null
        }
        Update: {
          activo?: boolean | null
          created_at?: string | null
          descripcion?: string | null
          id?: string
          nombre?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      eventos_pallet: {
        Row: {
          id: string
          codigo_pallet: string
          tipo: Database["public"]["Enums"]["tipo_evento"]
          descripcion: string
          responsable_nombre: string
          datos_adicionales: Json | null
          fecha: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          codigo_pallet: string
          tipo: Database["public"]["Enums"]["tipo_evento"]
          descripcion: string
          responsable_nombre: string
          datos_adicionales?: Json | null
          fecha?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          codigo_pallet?: string
          tipo?: Database["public"]["Enums"]["tipo_evento"]
          descripcion?: string
          responsable_nombre?: string
          datos_adicionales?: Json | null
          fecha?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "eventos_pallet_codigo_pallet_fkey"
            columns: ["codigo_pallet"]
            isOneToOne: false
            referencedRelation: "pallets"
            referencedColumns: ["codigo_pallet"]
          }
        ]
      }
      eventos_trazabilidad: {
        Row: {
          created_at: string | null
          datos_adicionales: Json | null
          descripcion: string
          fecha: string
          id: string
          lote_id: string
          responsable_id: string | null
          responsable_nombre: string | null
          tipo: Database["public"]["Enums"]["tipo_evento"]
        }
        Insert: {
          created_at?: string | null
          datos_adicionales?: Json | null
          descripcion: string
          fecha?: string
          id?: string
          lote_id: string
          responsable_id?: string | null
          responsable_nombre?: string | null
          tipo: Database["public"]["Enums"]["tipo_evento"]
        }
        Update: {
          created_at?: string | null
          datos_adicionales?: Json | null
          descripcion?: string
          fecha?: string
          id?: string
          lote_id?: string
          responsable_id?: string | null
          responsable_nombre?: string | null
          tipo?: Database["public"]["Enums"]["tipo_evento"]
        }
        Relationships: [
          {
            foreignKeyName: "eventos_trazabilidad_lote_id_fkey"
            columns: ["lote_id"]
            isOneToOne: false
            referencedRelation: "lotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eventos_trazabilidad_lote_id_fkey"
            columns: ["lote_id"]
            isOneToOne: false
            referencedRelation: "v_lotes_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eventos_trazabilidad_responsable_id_fkey"
            columns: ["responsable_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      lotes: {
        Row: {
          activo: boolean | null
          area: number
          created_at: string | null
          cuartel_id: string
          cultivo_id: string
          estado: Database["public"]["Enums"]["estado_lote"]
          fecha_ultimo_evento: string | null
          id: string
          observaciones: string | null
          ultimo_evento: string | null
          updated_at: string | null
          variedad_id: string
        }
        Insert: {
          activo?: boolean | null
          area: number
          created_at?: string | null
          cuartel_id: string
          cultivo_id: string
          estado?: Database["public"]["Enums"]["estado_lote"]
          fecha_ultimo_evento?: string | null
          id: string
          observaciones?: string | null
          ultimo_evento?: string | null
          updated_at?: string | null
          variedad_id: string
        }
        Update: {
          activo?: boolean | null
          area?: number
          created_at?: string | null
          cuartel_id?: string
          cultivo_id?: string
          estado?: Database["public"]["Enums"]["estado_lote"]
          fecha_ultimo_evento?: string | null
          id?: string
          observaciones?: string | null
          ultimo_evento?: string | null
          updated_at?: string | null
          variedad_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lotes_cuartel_id_fkey"
            columns: ["cuartel_id"]
            isOneToOne: false
            referencedRelation: "cuarteles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lotes_cuartel_id_fkey"
            columns: ["cuartel_id"]
            isOneToOne: false
            referencedRelation: "v_productividad_cuarteles"
            referencedColumns: ["cuartel_id"]
          },
          {
            foreignKeyName: "lotes_cultivo_id_fkey"
            columns: ["cultivo_id"]
            isOneToOne: false
            referencedRelation: "cultivos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lotes_variedad_id_fkey"
            columns: ["variedad_id"]
            isOneToOne: false
            referencedRelation: "variedades"
            referencedColumns: ["id"]
          },
        ]
      }
      pallet_lotes: {
        Row: {
          cantidad_cajas_lote: number
          codigo_pallet: string | null
          fecha_agregado: string | null
          id: string
          lote_id: string | null
          peso_lote_kg: number
          posicion_en_pallet: number | null
        }
        Insert: {
          cantidad_cajas_lote: number
          codigo_pallet?: string | null
          fecha_agregado?: string | null
          id?: string
          lote_id?: string | null
          peso_lote_kg: number
          posicion_en_pallet?: number | null
        }
        Update: {
          cantidad_cajas_lote?: number
          codigo_pallet?: string | null
          fecha_agregado?: string | null
          id?: string
          lote_id?: string | null
          peso_lote_kg?: number
          posicion_en_pallet?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pallet_lotes_codigo_pallet_fkey"
            columns: ["codigo_pallet"]
            isOneToOne: false
            referencedRelation: "pallets"
            referencedColumns: ["codigo_pallet"]
          },
          {
            foreignKeyName: "pallet_lotes_codigo_pallet_fkey"
            columns: ["codigo_pallet"]
            isOneToOne: false
            referencedRelation: "v_pallets_completos"
            referencedColumns: ["codigo_pallet"]
          },
          {
            foreignKeyName: "pallet_lotes_lote_id_fkey"
            columns: ["lote_id"]
            isOneToOne: false
            referencedRelation: "lotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pallet_lotes_lote_id_fkey"
            columns: ["lote_id"]
            isOneToOne: false
            referencedRelation: "v_lotes_completos"
            referencedColumns: ["id"]
          },
        ]
      }
      pallets: {
        Row: {
          activo: boolean | null
          cantidad_cajas_total: number | null
          codigo_pallet: string
          created_at: string | null
          destino_inicial: string | null
          estado: Database["public"]["Enums"]["estado_pallet"] | null
          fecha_creacion: string | null
          observaciones: string | null
          peso_total_kg: number | null
          temperatura_objetivo: number | null
          tipo_pallet: string
          ubicacion_actual: string | null
          updated_at: string | null
        }
        Insert: {
          activo?: boolean | null
          cantidad_cajas_total?: number | null
          codigo_pallet: string
          created_at?: string | null
          destino_inicial?: string | null
          estado?: Database["public"]["Enums"]["estado_pallet"] | null
          fecha_creacion?: string | null
          observaciones?: string | null
          peso_total_kg?: number | null
          temperatura_objetivo?: number | null
          tipo_pallet?: string
          ubicacion_actual?: string | null
          updated_at?: string | null
        }
        Update: {
          activo?: boolean | null
          cantidad_cajas_total?: number | null
          codigo_pallet?: string
          created_at?: string | null
          destino_inicial?: string | null
          estado?: Database["public"]["Enums"]["estado_pallet"] | null
          fecha_creacion?: string | null
          observaciones?: string | null
          peso_total_kg?: number | null
          temperatura_objetivo?: number | null
          tipo_pallet?: string
          ubicacion_actual?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      usuarios: {
        Row: {
          activo: boolean | null
          cargo: string | null
          created_at: string | null
          email: string | null
          id: string
          nombre: string
          telefono: string | null
          updated_at: string | null
        }
        Insert: {
          activo?: boolean | null
          cargo?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          nombre: string
          telefono?: string | null
          updated_at?: string | null
        }
        Update: {
          activo?: boolean | null
          cargo?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          nombre?: string
          telefono?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      variedades: {
        Row: {
          activo: boolean | null
          created_at: string | null
          cultivo_id: string
          descripcion: string | null
          id: string
          nombre: string
          updated_at: string | null
        }
        Insert: {
          activo?: boolean | null
          created_at?: string | null
          cultivo_id: string
          descripcion?: string | null
          id?: string
          nombre: string
          updated_at?: string | null
        }
        Update: {
          activo?: boolean | null
          created_at?: string | null
          cultivo_id?: string
          descripcion?: string | null
          id?: string
          nombre?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "variedades_cultivo_id_fkey"
            columns: ["cultivo_id"]
            isOneToOne: false
            referencedRelation: "cultivos"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      v_dashboard_metricas: {
        Row: {
          area_promedio: number | null
          area_total: number | null
          lotes_cosecha_completa: number | null
          lotes_despachados: number | null
          lotes_empacados: number | null
          lotes_en_camara: number | null
          lotes_en_cosecha: number | null
          lotes_en_packing: number | null
          lotes_listo_despacho: number | null
          total_lotes: number | null
        }
        Relationships: []
      }
      v_eventos_recientes: {
        Row: {
          cultivo: string | null
          cultivo_id: string | null
          datos_adicionales: Json | null
          descripcion: string | null
          fecha: string | null
          id: string | null
          lote_id: string | null
          responsable: string | null
          tipo: Database["public"]["Enums"]["tipo_evento"] | null
          variedad: string | null
        }
        Relationships: [
          {
            foreignKeyName: "eventos_trazabilidad_lote_id_fkey"
            columns: ["lote_id"]
            isOneToOne: false
            referencedRelation: "lotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eventos_trazabilidad_lote_id_fkey"
            columns: ["lote_id"]
            isOneToOne: false
            referencedRelation: "v_lotes_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lotes_cultivo_id_fkey"
            columns: ["cultivo_id"]
            isOneToOne: false
            referencedRelation: "cultivos"
            referencedColumns: ["id"]
          },
        ]
      }
      v_lotes_completos: {
        Row: {
          area: number | null
          created_at: string | null
          cuartel_origen: string | null
          cultivo: string | null
          estado: Database["public"]["Enums"]["estado_lote"] | null
          fecha_inicio: string | null
          fecha_ultimo_evento: string | null
          fecha_ultimo_evento_real: string | null
          id: string | null
          observaciones: string | null
          total_eventos: number | null
          ubicacion_cuartel: string | null
          ultimo_evento: string | null
          updated_at: string | null
          variedad: string | null
        }
        Relationships: []
      }
      v_pallets_completos: {
        Row: {
          activo: boolean | null
          cajas_calculadas: number | null
          cantidad_cajas_total: number | null
          codigo_pallet: string | null
          created_at: string | null
          cultivos: string | null
          destino_inicial: string | null
          estado: Database["public"]["Enums"]["estado_pallet"] | null
          fecha_creacion: string | null
          lotes_asociados: number | null
          lotes_ids: string[] | null
          observaciones: string | null
          peso_calculado: number | null
          peso_total_kg: number | null
          temperatura_objetivo: number | null
          tipo_pallet: string | null
          ubicacion_actual: string | null
          updated_at: string | null
          variedades: string | null
        }
        Relationships: []
      }
      v_productividad_cuarteles: {
        Row: {
          area_total: number | null
          cuartel: string | null
          cuartel_id: string | null
          cultivo_principal: string | null
          lotes_completados: number | null
          porcentaje_completados: number | null
          total_lotes: number | null
          ubicacion: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      agregar_evento_validado: {
        Args: { 
          lote_id_param: string
          tipo_param: Database["public"]["Enums"]["tipo_evento"]
          descripcion_param: string
          responsable_param?: string
          datos_adicionales_param?: Json
        }
        Returns: Json
      }
      agregar_lote_a_pallet: {
        Args: {
          p_codigo_pallet: string
          p_lote_id: string
          p_cantidad_cajas: number
          p_peso_kg: number
          p_posicion?: number
        }
        Returns: boolean
      }
      crear_pallet: {
        Args: {
          p_tipo_pallet?: string
          p_destino_inicial?: string
          p_observaciones?: string
        }
        Returns: string
      }
      eliminar_lote_logico: {
        Args: { lote_id_param: string; motivo?: string }
        Returns: boolean
      }
      generar_reporte_lote: {
        Args: { lote_id_param: string }
        Returns: {
          lote_id: string
          cultivo: string
          variedad: string
          cuartel: string
          area: number
          estado: Database["public"]["Enums"]["estado_lote"]
          fecha_creacion: string
          total_eventos: number
          fecha_inicio: string
          fecha_ultimo_evento: string
          dias_en_proceso: number
          historial_eventos: Json
        }[]
      }
      generar_siguiente_codigo_pallet: {
        Args: { año_param?: number }
        Returns: string
      }
      obtener_eventos_validos: {
        Args: { lote_id_param: string }
        Returns: Json
      }
      obtener_historial_lote: {
        Args: { lote_id_param: string }
        Returns: {
          evento_id: string
          tipo: Database["public"]["Enums"]["tipo_evento"]
          fecha: string
          descripcion: string
          responsable: string
          datos_adicionales: Json
        }[]
      }
      obtener_metricas_dashboard: {
        Args: Record<PropertyKey, never>
        Returns: {
          total_lotes: number
          lotes_activos: number
          area_total: number
          eventos_hoy: number
          lotes_por_estado: Json
          cultivos_activos: Json
        }[]
      }
      obtener_progreso_lote: {
        Args: { lote_id_param: string }
        Returns: Json
      }
      obtener_trazabilidad_lote: {
        Args: { p_lote_id: string }
        Returns: Json
      }
      restaurar_lote: {
        Args: { lote_id_param: string }
        Returns: boolean
      }
      validar_secuencia_evento: {
        Args: { 
          lote_id_param: string
          nuevo_tipo_evento: Database["public"]["Enums"]["tipo_evento"]
        }
        Returns: Json
      }
    }
    Enums: {
      estado_lote:
        | "En Cosecha"
        | "Cosecha Completa"
        | "En Packing"
        | "Empacado"
        | "En Cámara"
        | "Listo Despacho"
        | "Despachado"
        | "Eliminado"
      estado_pallet:
        | "en_construccion"
        | "completo"
        | "en_camara"
        | "en_transito"
        | "entregado"
        | "devuelto"
      tipo_evento:
        | "Inicio Cosecha"
        | "Cosecha Completa"
        | "Recepción Packing"
        | "Selección"
        | "Empaque"
        | "Paletizado"
        | "Enfriado"
        | "Control Calidad"
        | "Despacho"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      estado_lote: [
        "En Cosecha",
        "Cosecha Completa",
        "En Packing",
        "Empacado",
        "En Cámara",
        "Listo Despacho",
        "Despachado",
        "Eliminado",
      ],
      estado_pallet: [
        "en_construccion",
        "completo",
        "en_camara",
        "en_transito",
        "entregado",
        "devuelto",
      ],
      tipo_evento: [
        "Inicio Cosecha",
        "Cosecha Completa",
        "Recepción Packing",
        "Selección",
        "Empaque",
        "Paletizado",
        "Enfriado",
        "Control Calidad",
        "Despacho",
      ],
    },
  },
} as const

// Tipos específicos para KimunPulse
export type EstadoLote = Database["public"]["Enums"]["estado_lote"]
export type TipoEvento = Database["public"]["Enums"]["tipo_evento"]
export type EstadoPallet = Database["public"]["Enums"]["estado_pallet"]
export type LoteCompleto = Tables<"v_lotes_completos">
export type PalletCompleto = Tables<"v_pallets_completos">
export type DashboardMetricas = Tables<"v_dashboard_metricas">
export type EventoReciente = Tables<"v_eventos_recientes">

// Tipos para las funciones
export type ReporteLote = Database["public"]["Functions"]["generar_reporte_lote"]["Returns"][0]
export type HistorialEvento = Database["public"]["Functions"]["obtener_historial_lote"]["Returns"][0]
export type MetricasDashboard = Database["public"]["Functions"]["obtener_metricas_dashboard"]["Returns"][0] 