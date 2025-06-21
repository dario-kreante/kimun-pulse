-- ================================
-- MIGRACIÓN: CÓDIGOS QR - KimunPulse
-- ================================
-- Fecha: 2025-01-02
-- Descripción: Crear tablas, vistas y funciones para eventos de códigos QR

-- ================================
-- 1. CREAR TABLAS
-- ================================

-- Tabla principal para eventos de códigos QR
CREATE TABLE IF NOT EXISTS eventos_codigos_qr (
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

-- Tabla para configuraciones de impresión personalizadas
CREATE TABLE IF NOT EXISTS configuraciones_impresion (
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
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ================================
-- 2. CREAR ÍNDICES
-- ================================

-- Índices para eventos_codigos_qr
CREATE INDEX IF NOT EXISTS idx_eventos_codigos_lote_id ON eventos_codigos_qr(lote_id);
CREATE INDEX IF NOT EXISTS idx_eventos_codigos_tipo ON eventos_codigos_qr(tipo_actividad);
CREATE INDEX IF NOT EXISTS idx_eventos_codigos_fecha ON eventos_codigos_qr(created_at);
CREATE INDEX IF NOT EXISTS idx_eventos_codigos_usuario ON eventos_codigos_qr(usuario);
CREATE INDEX IF NOT EXISTS idx_eventos_codigos_lote_fecha ON eventos_codigos_qr(lote_id, created_at DESC);

-- Índices para configuraciones_impresion
CREATE INDEX IF NOT EXISTS idx_config_impresion_usuario ON configuraciones_impresion(usuario);
CREATE INDEX IF NOT EXISTS idx_config_impresion_predeterminada ON configuraciones_impresion(es_predeterminada) WHERE es_predeterminada = true;

-- ================================
-- 3. CREAR FUNCIONES
-- ================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_eventos_codigos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Función para registrar evento de código QR
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

-- Función para obtener estadísticas de códigos por lote
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
    
    RETURN COALESCE(result, json_build_object(
        'lote_id', p_lote_id, 
        'total_escaneos', 0, 
        'total_impresiones', 0,
        'total_etiquetas', 0
    ));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener estadísticas generales de códigos
CREATE OR REPLACE FUNCTION obtener_estadisticas_codigos_generales()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_escaneos', COUNT(*) FILTER (WHERE tipo_actividad = 'escaneo'),
        'total_impresiones', COUNT(*) FILTER (WHERE tipo_actividad = 'impresion'),
        'total_etiquetas_impresas', COALESCE(SUM(cantidad_etiquetas) FILTER (WHERE tipo_actividad = 'impresion'), 0),
        'lotes_con_actividad', COUNT(DISTINCT lote_id),
        'actividad_hoy', COUNT(*) FILTER (WHERE DATE(created_at) = CURRENT_DATE),
        'actividad_semana', COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'),
        'usuarios_activos', COUNT(DISTINCT usuario),
        'formato_mas_usado', (
            SELECT formato_codigo 
            FROM eventos_codigos_qr 
            WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
            GROUP BY formato_codigo 
            ORDER BY COUNT(*) DESC 
            LIMIT 1
        )
    )
    INTO result
    FROM eventos_codigos_qr
    WHERE created_at >= CURRENT_DATE - INTERVAL '30 days';
    
    RETURN COALESCE(result, json_build_object(
        'total_escaneos', 0,
        'total_impresiones', 0,
        'total_etiquetas_impresas', 0,
        'lotes_con_actividad', 0,
        'actividad_hoy', 0
    ));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================
-- 4. CREAR TRIGGERS
-- ================================

-- Trigger para actualizar updated_at en eventos_codigos_qr
DROP TRIGGER IF EXISTS trigger_eventos_codigos_updated_at ON eventos_codigos_qr;
CREATE TRIGGER trigger_eventos_codigos_updated_at
    BEFORE UPDATE ON eventos_codigos_qr
    FOR EACH ROW
    EXECUTE FUNCTION update_eventos_codigos_updated_at();

-- Trigger para actualizar updated_at en configuraciones_impresion
DROP TRIGGER IF EXISTS trigger_config_impresion_updated_at ON configuraciones_impresion;
CREATE TRIGGER trigger_config_impresion_updated_at
    BEFORE UPDATE ON configuraciones_impresion
    FOR EACH ROW
    EXECUTE FUNCTION update_eventos_codigos_updated_at();

-- ================================
-- 5. CREAR VISTAS
-- ================================

-- Vista completa de actividad de códigos con información de lotes
CREATE OR REPLACE VIEW v_actividad_codigos_completa AS
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
    
    -- Información del lote desde la vista completa
    vc.cultivo,
    vc.variedad,
    vc.cuartel_origen,
    vc.area,
    vc.estado,
    
    -- Estadísticas calculadas
    COUNT(*) OVER (PARTITION BY ec.lote_id, ec.tipo_actividad) as total_eventos_tipo,
    ROW_NUMBER() OVER (PARTITION BY ec.lote_id ORDER BY ec.created_at DESC) as evento_numero
    
FROM eventos_codigos_qr ec
LEFT JOIN v_lotes_completos vc ON ec.lote_id = vc.id;

-- Vista de estadísticas agregadas recientes
CREATE OR REPLACE VIEW v_estadisticas_codigos_recientes AS
SELECT 
    COUNT(*) FILTER (WHERE tipo_actividad = 'escaneo') as total_escaneos,
    COUNT(*) FILTER (WHERE tipo_actividad = 'impresion') as total_impresiones,
    COALESCE(SUM(cantidad_etiquetas) FILTER (WHERE tipo_actividad = 'impresion'), 0) as total_etiquetas_impresas,
    COUNT(DISTINCT lote_id) as lotes_con_actividad,
    COUNT(*) FILTER (WHERE DATE(created_at) = CURRENT_DATE) as actividad_hoy,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as actividad_semana,
    COUNT(DISTINCT usuario) as usuarios_activos
FROM eventos_codigos_qr
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days';

-- ================================
-- 6. CONFIGURAR PERMISOS RLS
-- ================================

-- Habilitar RLS en las nuevas tablas
ALTER TABLE eventos_codigos_qr ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuraciones_impresion ENABLE ROW LEVEL SECURITY;

-- Política para eventos_codigos_qr: permitir todas las operaciones para usuarios autenticados
CREATE POLICY IF NOT EXISTS "Usuarios autenticados pueden gestionar eventos de códigos" 
ON eventos_codigos_qr FOR ALL 
TO authenticated 
USING (true)
WITH CHECK (true);

-- Política para configuraciones_impresion: usuarios solo ven sus propias configuraciones
CREATE POLICY IF NOT EXISTS "Usuarios solo ven sus configuraciones de impresión" 
ON configuraciones_impresion FOR ALL 
TO authenticated 
USING (auth.jwt() ->> 'email' = usuario OR auth.jwt() ->> 'user_metadata' ->> 'nombre' = usuario)
WITH CHECK (auth.jwt() ->> 'email' = usuario OR auth.jwt() ->> 'user_metadata' ->> 'nombre' = usuario);

-- ================================
-- 7. INSERTAR DATOS INICIALES
-- ================================

-- Insertar configuraciones predeterminadas
INSERT INTO configuraciones_impresion (
    nombre, usuario, formato, tamaño, incluir_texto, incluir_logo, es_predeterminada
) VALUES 
    ('Estándar QR + Texto', 'sistema', 'qr_texto', 'mediano', true, true, true),
    ('Solo QR Compacto', 'sistema', 'qr_simple', 'pequeño', false, false, false),
    ('QR Grande con Logo', 'sistema', 'qr_texto', 'grande', true, true, false)
ON CONFLICT DO NOTHING;

-- ================================
-- 8. VERIFICACIÓN
-- ================================

-- Verificar que las tablas se crearon correctamente
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'eventos_codigos_qr') THEN
        RAISE EXCEPTION 'Error: Tabla eventos_codigos_qr no se creó correctamente';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'configuraciones_impresion') THEN
        RAISE EXCEPTION 'Error: Tabla configuraciones_impresion no se creó correctamente';
    END IF;
    
    RAISE NOTICE 'Migración de códigos QR completada exitosamente';
END
$$;

-- ================================
-- 9. COMENTARIOS PARA DOCUMENTACIÓN
-- ================================

COMMENT ON TABLE eventos_codigos_qr IS 'Registro de todos los eventos relacionados con códigos QR: escaneos, impresiones y generaciones';
COMMENT ON TABLE configuraciones_impresion IS 'Configuraciones personalizadas de impresión de etiquetas por usuario';

COMMENT ON COLUMN eventos_codigos_qr.tipo_actividad IS 'Tipo de evento: escaneo, impresion, generacion';
COMMENT ON COLUMN eventos_codigos_qr.cantidad_etiquetas IS 'Número de etiquetas impresas (solo para tipo_actividad = impresion)';
COMMENT ON COLUMN eventos_codigos_qr.formato_codigo IS 'Formato del código: qr_simple, qr_texto, codigo_barras';
COMMENT ON COLUMN eventos_codigos_qr.datos_adicionales IS 'Datos adicionales en formato JSON (ubicación GPS, configuración de impresora, etc.)';

COMMENT ON FUNCTION registrar_evento_codigo_qr IS 'Registra un nuevo evento de código QR con validaciones';
COMMENT ON FUNCTION obtener_estadisticas_codigo_lote IS 'Obtiene estadísticas de códigos para un lote específico';
COMMENT ON FUNCTION obtener_estadisticas_codigos_generales IS 'Obtiene estadísticas generales de códigos QR';

-- Finalización exitosa
SELECT 'Migración de códigos QR completada exitosamente' as resultado; 