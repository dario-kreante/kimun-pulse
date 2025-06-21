# Schema de Base de Datos - Códigos QR

## Nuevas Tablas Requeridas

### 1. `eventos_codigos_qr`
Tabla para registrar todos los eventos relacionados con códigos QR (escaneos, impresiones, etc.)

```sql
CREATE TABLE eventos_codigos_qr (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lote_id VARCHAR(50) NOT NULL REFERENCES lotes(id) ON DELETE CASCADE,
    tipo_actividad VARCHAR(20) NOT NULL CHECK (tipo_actividad IN ('escaneo', 'impresion', 'generacion')),
    usuario VARCHAR(100) NOT NULL,
    ubicacion VARCHAR(200),
    cantidad_etiquetas INTEGER DEFAULT 1 CHECK (cantidad_etiquetas > 0),
    formato_codigo VARCHAR(20) DEFAULT 'qr_texto' CHECK (formato_codigo IN ('qr_simple', 'qr_texto', 'codigo_barras')),
    datos_adicionales JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para optimizar consultas
CREATE INDEX idx_eventos_codigos_lote_id ON eventos_codigos_qr(lote_id);
CREATE INDEX idx_eventos_codigos_tipo ON eventos_codigos_qr(tipo_actividad);
CREATE INDEX idx_eventos_codigos_fecha ON eventos_codigos_qr(created_at);
CREATE INDEX idx_eventos_codigos_usuario ON eventos_codigos_qr(usuario);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_eventos_codigos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_eventos_codigos_updated_at
    BEFORE UPDATE ON eventos_codigos_qr
    FOR EACH ROW
    EXECUTE FUNCTION update_eventos_codigos_updated_at();
```

### 2. `configuraciones_impresion`
Tabla para guardar configuraciones de impresión personalizadas

```sql
CREATE TABLE configuraciones_impresion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) NOT NULL,
    usuario VARCHAR(100) NOT NULL,
    formato VARCHAR(20) NOT NULL CHECK (formato IN ('qr_simple', 'qr_texto', 'codigo_barras')),
    tamaño VARCHAR(20) NOT NULL CHECK (tamaño IN ('pequeño', 'mediano', 'grande')),
    incluir_texto BOOLEAN DEFAULT true,
    incluir_logo BOOLEAN DEFAULT true,
    configuracion_adicional JSONB,
    es_predeterminada BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Solo una configuración predeterminada por usuario
    CONSTRAINT unique_predeterminada_por_usuario 
        EXCLUDE (usuario WITH =) WHERE (es_predeterminada = true)
);

-- Índices
CREATE INDEX idx_config_impresion_usuario ON configuraciones_impresion(usuario);
CREATE INDEX idx_config_impresion_predeterminada ON configuraciones_impresion(es_predeterminada) WHERE es_predeterminada = true;
```

## Vistas para Consultas Optimizadas

### 1. `v_actividad_codigos_completa`
Vista que combina eventos de códigos con información de lotes

```sql
CREATE VIEW v_actividad_codigos_completa AS
SELECT 
    ec.id,
    ec.lote_id,
    ec.tipo_actividad,
    ec.usuario,
    ec.ubicacion,
    ec.cantidad_etiquetas,
    ec.formato_codigo,
    ec.datos_adicionales,
    ec.created_at as fecha_evento,
    
    -- Información del lote
    l.cultivo_id,
    l.variedad_id,
    l.cuartel_id,
    l.area,
    l.estado as estado_lote,
    
    -- Información de catálogos
    c.nombre as cultivo,
    v.nombre as variedad,
    cu.nombre as cuartel_origen,
    
    -- Estadísticas calculadas
    COUNT(*) OVER (PARTITION BY ec.lote_id, ec.tipo_actividad) as total_eventos_tipo,
    ROW_NUMBER() OVER (PARTITION BY ec.lote_id ORDER BY ec.created_at DESC) as evento_numero
    
FROM eventos_codigos_qr ec
JOIN lotes l ON ec.lote_id = l.id
LEFT JOIN cultivos c ON l.cultivo_id = c.id
LEFT JOIN variedades v ON l.variedad_id = v.id
LEFT JOIN cuarteles cu ON l.cuartel_id = cu.id
WHERE l.activo = true;
```

### 2. `v_estadisticas_codigos`
Vista para estadísticas agregadas de códigos

```sql
CREATE VIEW v_estadisticas_codigos AS
SELECT 
    COUNT(*) FILTER (WHERE tipo_actividad = 'escaneo') as total_escaneos,
    COUNT(*) FILTER (WHERE tipo_actividad = 'impresion') as total_impresiones,
    SUM(cantidad_etiquetas) FILTER (WHERE tipo_actividad = 'impresion') as total_etiquetas_impresas,
    COUNT(DISTINCT lote_id) as lotes_con_actividad,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) as actividad_hoy,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as actividad_semana,
    COUNT(DISTINCT usuario) as usuarios_activos,
    
    -- Top formatos
    MODE() WITHIN GROUP (ORDER BY formato_codigo) as formato_mas_usado,
    
    -- Actividad por hora (útil para gráficos)
    json_agg(
        json_build_object(
            'hora', EXTRACT(hour FROM created_at),
            'cantidad', COUNT(*)
        ) ORDER BY EXTRACT(hour FROM created_at)
    ) FILTER (WHERE created_at >= CURRENT_DATE) as actividad_por_hora_hoy

FROM eventos_codigos_qr
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days';
```

## Funciones Almacenadas

### 1. Registrar evento de código QR
```sql
CREATE OR REPLACE FUNCTION registrar_evento_codigo_qr(
    p_lote_id VARCHAR(50),
    p_tipo_actividad VARCHAR(20),
    p_usuario VARCHAR(100),
    p_ubicacion VARCHAR(200) DEFAULT NULL,
    p_cantidad_etiquetas INTEGER DEFAULT 1,
    p_formato_codigo VARCHAR(20) DEFAULT 'qr_texto',
    p_datos_adicionales JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    evento_id UUID;
BEGIN
    -- Validar que el lote existe y está activo
    IF NOT EXISTS (SELECT 1 FROM lotes WHERE id = p_lote_id AND activo = true) THEN
        RAISE EXCEPTION 'Lote no encontrado o inactivo: %', p_lote_id;
    END IF;
    
    -- Insertar evento
    INSERT INTO eventos_codigos_qr (
        lote_id, tipo_actividad, usuario, ubicacion, 
        cantidad_etiquetas, formato_codigo, datos_adicionales
    )
    VALUES (
        p_lote_id, p_tipo_actividad, p_usuario, p_ubicacion,
        p_cantidad_etiquetas, p_formato_codigo, p_datos_adicionales
    )
    RETURNING id INTO evento_id;
    
    RETURN evento_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 2. Obtener estadísticas de códigos por lote
```sql
CREATE OR REPLACE FUNCTION obtener_estadisticas_codigo_lote(p_lote_id VARCHAR(50))
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'lote_id', p_lote_id,
        'total_escaneos', COUNT(*) FILTER (WHERE tipo_actividad = 'escaneo'),
        'total_impresiones', COUNT(*) FILTER (WHERE tipo_actividad = 'impresion'),
        'total_etiquetas', COALESCE(SUM(cantidad_etiquetas) FILTER (WHERE tipo_actividad = 'impresion'), 0),
        'primer_evento', MIN(created_at),
        'ultimo_evento', MAX(created_at),
        'usuarios_unicos', COUNT(DISTINCT usuario),
        'formatos_usados', array_agg(DISTINCT formato_codigo),
        'eventos_por_dia', json_agg(
            json_build_object(
                'fecha', DATE(created_at),
                'cantidad', COUNT(*)
            ) ORDER BY DATE(created_at)
        )
    )
    INTO result
    FROM eventos_codigos_qr
    WHERE lote_id = p_lote_id
    GROUP BY lote_id;
    
    RETURN COALESCE(result, '{"lote_id": "'||p_lote_id||'", "total_escaneos": 0, "total_impresiones": 0}'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 3. Limpiar eventos antiguos (opcional)
```sql
CREATE OR REPLACE FUNCTION limpiar_eventos_codigos_antiguos(dias_retencion INTEGER DEFAULT 365)
RETURNS INTEGER AS $$
DECLARE
    registros_eliminados INTEGER;
BEGIN
    DELETE FROM eventos_codigos_qr 
    WHERE created_at < CURRENT_DATE - INTERVAL '1 day' * dias_retencion;
    
    GET DIAGNOSTICS registros_eliminados = ROW_COUNT;
    
    RETURN registros_eliminados;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Permisos y Seguridad

```sql
-- Crear rol específico para la aplicación
CREATE ROLE kimun_pulse_app;

-- Permisos para las nuevas tablas
GRANT SELECT, INSERT, UPDATE ON eventos_codigos_qr TO kimun_pulse_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON configuraciones_impresion TO kimun_pulse_app;

-- Permisos para las vistas
GRANT SELECT ON v_actividad_codigos_completa TO kimun_pulse_app;
GRANT SELECT ON v_estadisticas_codigos TO kimun_pulse_app;

-- Permisos para las funciones
GRANT EXECUTE ON FUNCTION registrar_evento_codigo_qr TO kimun_pulse_app;
GRANT EXECUTE ON FUNCTION obtener_estadisticas_codigo_lote TO kimun_pulse_app;
GRANT EXECUTE ON FUNCTION limpiar_eventos_codigos_antiguos TO kimun_pulse_app;

-- RLS (Row Level Security) - opcional para multi-tenant
ALTER TABLE eventos_codigos_qr ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuraciones_impresion ENABLE ROW LEVEL SECURITY;

-- Política ejemplo: usuarios solo ven sus propios eventos
CREATE POLICY eventos_codigos_usuario_policy ON eventos_codigos_qr
    FOR ALL USING (usuario = current_setting('app.current_user', true));

CREATE POLICY config_impresion_usuario_policy ON configuraciones_impresion
    FOR ALL USING (usuario = current_setting('app.current_user', true));
```

## Migración de Datos Temporales

Para migrar los datos que están actualmente en memoria a la base de datos:

```sql
-- Script de migración (ejecutar después de crear las tablas)
INSERT INTO eventos_codigos_qr (
    lote_id, tipo_actividad, usuario, ubicacion, 
    cantidad_etiquetas, formato_codigo, datos_adicionales, created_at
)
SELECT 
    datos_temporales->>'lote_id',
    datos_temporales->>'tipo_actividad',
    datos_temporales->>'usuario',
    datos_temporales->>'ubicacion',
    COALESCE((datos_temporales->>'cantidad_etiquetas')::INTEGER, 1),
    COALESCE(datos_temporales->>'formato_codigo', 'qr_texto'),
    datos_temporales->'datos_adicionales',
    (datos_temporales->>'fecha')::TIMESTAMP WITH TIME ZONE
FROM (
    -- Aquí se insertarían los datos temporales desde la aplicación
    SELECT jsonb_array_elements('[...]'::jsonb) as datos_temporales
) migrar_datos;
```

## Índices Adicionales para Performance

```sql
-- Índice compuesto para consultas de actividad por lote y fecha
CREATE INDEX idx_eventos_codigos_lote_fecha ON eventos_codigos_qr(lote_id, created_at DESC);

-- Índice para búsquedas por ubicación
CREATE INDEX idx_eventos_codigos_ubicacion ON eventos_codigos_qr USING gin(ubicacion gin_trgm_ops);

-- Índice para datos adicionales (JSONB)
CREATE INDEX idx_eventos_codigos_datos_gin ON eventos_codigos_qr USING gin(datos_adicionales);

-- Estadísticas automáticas
CREATE INDEX idx_eventos_codigos_stats ON eventos_codigos_qr(tipo_actividad, created_at, cantidad_etiquetas);
```

Este schema está diseñado para:
- **Escalabilidad**: Soporta millones de eventos de códigos
- **Performance**: Índices optimizados para consultas frecuentes  
- **Flexibilidad**: JSONB para datos adicionales
- **Seguridad**: RLS y permisos granulares
- **Mantenimiento**: Funciones para limpieza automática
- **Análisis**: Vistas pre-calculadas para dashboards 