-- ================================
-- MIGRACIÓN: CÁMARAS FRIGORÍFICAS - KimunPulse
-- ================================
-- Fecha: 2025-06-01
-- Descripción: Crear tablas, vistas y funciones para gestión de cámaras frigoríficas e inventarios

-- ================================
-- 1. CREAR TABLAS
-- ================================

-- Tabla principal para cámaras frigoríficas
CREATE TABLE IF NOT EXISTS camaras_frigorificas (
    id VARCHAR(20) PRIMARY KEY, -- CAM-001, CAM-002, etc.
    nombre VARCHAR(200) NOT NULL,
    capacidad_maxima_kg INTEGER NOT NULL CHECK (capacidad_maxima_kg > 0),
    temperatura_operacion_min DECIMAL(4,2) NOT NULL,
    temperatura_operacion_max DECIMAL(4,2) NOT NULL CHECK (temperatura_operacion_max > temperatura_operacion_min),
    humedad_optima_porcentaje INTEGER NOT NULL CHECK (humedad_optima_porcentaje >= 0 AND humedad_optima_porcentaje <= 100),
    tipo_control VARCHAR(20) NOT NULL CHECK (tipo_control IN ('automatico', 'manual', 'mixto')),
    estado_operativo VARCHAR(20) NOT NULL DEFAULT 'activa' CHECK (estado_operativo IN ('activa', 'mantenimiento', 'fuera_servicio')),
    ubicacion VARCHAR(300) NOT NULL,
    responsable VARCHAR(200) NOT NULL,
    ultima_revision TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para registrar lotes en cámaras (inventario)
CREATE TABLE IF NOT EXISTS lotes_en_camara (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lote_id VARCHAR(50) NOT NULL REFERENCES lotes(id) ON DELETE CASCADE,
    camara_id VARCHAR(20) NOT NULL REFERENCES camaras_frigorificas(id) ON DELETE CASCADE,
    peso_kg INTEGER NOT NULL CHECK (peso_kg > 0),
    fecha_ingreso TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_salida TIMESTAMP WITH TIME ZONE,
    temperatura_ingreso DECIMAL(4,2),
    temperatura_objetivo DECIMAL(4,2),
    estado_calidad VARCHAR(20) DEFAULT 'optimo' CHECK (estado_calidad IN ('optimo', 'bueno', 'en_observacion', 'critico')),
    fecha_vencimiento_estimado DATE,
    observaciones TEXT,
    activo BOOLEAN DEFAULT true,
    datos_adicionales JSONB, -- Para datos específicos del evento "Enfriado"
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraint: un lote no puede estar en múltiples cámaras al mismo tiempo
    CONSTRAINT unique_lote_activo_en_camara 
        EXCLUDE (lote_id WITH =) WHERE (activo = true AND fecha_salida IS NULL)
);

-- Tabla para alertas de cámaras
CREATE TABLE IF NOT EXISTS alertas_camaras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    camara_id VARCHAR(20) NOT NULL REFERENCES camaras_frigorificas(id) ON DELETE CASCADE,
    tipo VARCHAR(30) NOT NULL CHECK (tipo IN ('temperatura', 'humedad', 'capacidad', 'tiempo_almacenaje', 'mantenimiento', 'falla_sistema')),
    nivel VARCHAR(10) NOT NULL CHECK (nivel IN ('info', 'warning', 'critical')),
    mensaje TEXT NOT NULL,
    valor_actual DECIMAL(10,2),
    valor_limite DECIMAL(10,2),
    lote_id VARCHAR(50) REFERENCES lotes(id), -- Opcional, si la alerta es específica de un lote
    resuelto BOOLEAN DEFAULT false,
    fecha_resolucion TIMESTAMP WITH TIME ZONE,
    usuario_resolucion VARCHAR(200),
    notas_resolucion TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para métricas de cámaras (historial de temperatura, humedad, etc.)
CREATE TABLE IF NOT EXISTS metricas_camaras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    camara_id VARCHAR(20) NOT NULL REFERENCES camaras_frigorificas(id) ON DELETE CASCADE,
    temperatura DECIMAL(4,2) NOT NULL,
    humedad DECIMAL(5,2) NOT NULL,
    peso_actual_kg INTEGER DEFAULT 0,
    capacidad_utilizada_porcentaje DECIMAL(5,2) DEFAULT 0,
    energia_consumida_kwh DECIMAL(10,3),
    fecha_lectura TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fuente_datos VARCHAR(50) DEFAULT 'manual' CHECK (fuente_datos IN ('manual', 'automatico', 'sensor', 'estimado')),
    datos_adicionales JSONB
);

-- ================================
-- 2. CREAR ÍNDICES
-- ================================

-- Índices para camaras_frigorificas
CREATE INDEX IF NOT EXISTS idx_camaras_estado ON camaras_frigorificas(estado_operativo);
CREATE INDEX IF NOT EXISTS idx_camaras_activo ON camaras_frigorificas(activo);
CREATE INDEX IF NOT EXISTS idx_camaras_responsable ON camaras_frigorificas(responsable);

-- Índices para lotes_en_camara
CREATE INDEX IF NOT EXISTS idx_lotes_camara_lote_id ON lotes_en_camara(lote_id);
CREATE INDEX IF NOT EXISTS idx_lotes_camara_camara_id ON lotes_en_camara(camara_id);
CREATE INDEX IF NOT EXISTS idx_lotes_camara_activo ON lotes_en_camara(activo) WHERE activo = true;
CREATE INDEX IF NOT EXISTS idx_lotes_camara_fecha_ingreso ON lotes_en_camara(fecha_ingreso);
CREATE INDEX IF NOT EXISTS idx_lotes_camara_fecha_salida ON lotes_en_camara(fecha_salida) WHERE fecha_salida IS NOT NULL;

-- Índices para alertas_camaras
CREATE INDEX IF NOT EXISTS idx_alertas_camara_id ON alertas_camaras(camara_id);
CREATE INDEX IF NOT EXISTS idx_alertas_resuelto ON alertas_camaras(resuelto);
CREATE INDEX IF NOT EXISTS idx_alertas_nivel ON alertas_camaras(nivel);
CREATE INDEX IF NOT EXISTS idx_alertas_fecha ON alertas_camaras(created_at);

-- Índices para metricas_camaras
CREATE INDEX IF NOT EXISTS idx_metricas_camara_id ON metricas_camaras(camara_id);
CREATE INDEX IF NOT EXISTS idx_metricas_fecha ON metricas_camaras(fecha_lectura);
CREATE INDEX IF NOT EXISTS idx_metricas_camara_fecha ON metricas_camaras(camara_id, fecha_lectura DESC);

-- ================================
-- 3. CREAR FUNCIONES
-- ================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_camaras_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Función para procesar ingreso de lote a cámara
CREATE OR REPLACE FUNCTION procesar_ingreso_lote_camara(
    p_lote_id VARCHAR(50),
    p_camara_id VARCHAR(20),
    p_peso_kg INTEGER,
    p_temperatura_ingreso DECIMAL(4,2) DEFAULT NULL,
    p_temperatura_objetivo DECIMAL(4,2) DEFAULT NULL,
    p_datos_adicionales JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    registro_id UUID;
    capacidad_maxima INTEGER;
    peso_actual INTEGER;
    capacidad_utilizada DECIMAL(5,2);
BEGIN
    -- Validar que la cámara existe y está activa
    SELECT capacidad_maxima_kg INTO capacidad_maxima
    FROM camaras_frigorificas 
    WHERE id = p_camara_id AND activo = true AND estado_operativo = 'activa';
    
    IF capacidad_maxima IS NULL THEN
        RAISE EXCEPTION 'Cámara % no encontrada o no disponible', p_camara_id;
    END IF;
    
    -- Verificar que el lote no esté ya en otra cámara
    IF EXISTS (SELECT 1 FROM lotes_en_camara WHERE lote_id = p_lote_id AND activo = true AND fecha_salida IS NULL) THEN
        RAISE EXCEPTION 'Lote % ya está en una cámara frigorífica', p_lote_id;
    END IF;
    
    -- Calcular peso actual en la cámara
    SELECT COALESCE(SUM(peso_kg), 0) INTO peso_actual
    FROM lotes_en_camara 
    WHERE camara_id = p_camara_id AND activo = true AND fecha_salida IS NULL;
    
    -- Verificar capacidad disponible
    capacidad_utilizada := ((peso_actual + p_peso_kg) * 100.0) / capacidad_maxima;
    IF capacidad_utilizada > 95 THEN
        RAISE EXCEPTION 'Cámara % al %.1f%% de capacidad. No hay espacio para % kg adicionales', 
            p_camara_id, capacidad_utilizada, p_peso_kg;
    END IF;
    
    -- Registrar ingreso del lote
    INSERT INTO lotes_en_camara (
        lote_id, camara_id, peso_kg, 
        temperatura_ingreso, temperatura_objetivo, 
        datos_adicionales
    )
    VALUES (
        p_lote_id, p_camara_id, p_peso_kg, 
        p_temperatura_ingreso, p_temperatura_objetivo, 
        p_datos_adicionales
    )
    RETURNING id INTO registro_id;
    
    -- Actualizar estado del lote
    UPDATE lotes SET estado = 'En Cámara' WHERE id = p_lote_id;
    
    -- Crear alerta informativa
    INSERT INTO alertas_camaras (camara_id, tipo, nivel, mensaje, lote_id)
    VALUES (
        p_camara_id, 'capacidad', 'info', 
        FORMAT('Lote %s ingresado. Capacidad actual: %.1f%%', p_lote_id, capacidad_utilizada),
        p_lote_id
    );
    
    RETURN registro_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para procesar salida de lote de cámara
CREATE OR REPLACE FUNCTION procesar_salida_lote_camara(
    p_lote_id VARCHAR(50),
    p_nuevo_estado VARCHAR(20) DEFAULT 'Listo Despacho',
    p_motivo TEXT DEFAULT 'Despacho programado'
)
RETURNS BOOLEAN AS $$
DECLARE
    registro_camara RECORD;
BEGIN
    -- Buscar el registro activo del lote en cámara
    SELECT lec.*, cf.nombre as camara_nombre 
    INTO registro_camara
    FROM lotes_en_camara lec
    JOIN camaras_frigorificas cf ON lec.camara_id = cf.id
    WHERE lec.lote_id = p_lote_id AND lec.activo = true AND lec.fecha_salida IS NULL;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Lote % no se encuentra en ninguna cámara activa', p_lote_id;
    END IF;
    
    -- Registrar salida
    UPDATE lotes_en_camara 
    SET 
        fecha_salida = CURRENT_TIMESTAMP,
        activo = false,
        observaciones = COALESCE(observaciones || ' | ', '') || p_motivo,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = registro_camara.id;
    
    -- Actualizar estado del lote
    UPDATE lotes SET estado = p_nuevo_estado::estado_lote WHERE id = p_lote_id;
    
    -- Crear alerta informativa
    INSERT INTO alertas_camaras (camara_id, tipo, nivel, mensaje, lote_id)
    VALUES (
        registro_camara.camara_id, 'capacidad', 'info', 
        FORMAT('Lote %s retirado de %s. Motivo: %s', p_lote_id, registro_camara.camara_nombre, p_motivo),
        p_lote_id
    );
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener inventario de una cámara
CREATE OR REPLACE FUNCTION obtener_inventario_camara(p_camara_id VARCHAR(20))
RETURNS JSON AS $$
DECLARE
    result JSON;
    capacidad_maxima INTEGER;
    peso_actual INTEGER;
    capacidad_utilizada DECIMAL(5,2);
    temperatura_actual DECIMAL(4,2);
    humedad_actual DECIMAL(5,2);
BEGIN
    -- Obtener información básica de la cámara
    SELECT capacidad_maxima_kg INTO capacidad_maxima
    FROM camaras_frigorificas 
    WHERE id = p_camara_id AND activo = true;
    
    IF capacidad_maxima IS NULL THEN
        RAISE EXCEPTION 'Cámara % no encontrada', p_camara_id;
    END IF;
    
    -- Calcular peso actual
    SELECT COALESCE(SUM(peso_kg), 0) INTO peso_actual
    FROM lotes_en_camara 
    WHERE camara_id = p_camara_id AND activo = true AND fecha_salida IS NULL;
    
    capacidad_utilizada := (peso_actual * 100.0) / capacidad_maxima;
    
    -- Obtener últimas métricas
    SELECT temperatura, humedad 
    INTO temperatura_actual, humedad_actual
    FROM metricas_camaras 
    WHERE camara_id = p_camara_id 
    ORDER BY fecha_lectura DESC 
    LIMIT 1;
    
    -- Construir respuesta JSON
    SELECT json_build_object(
        'camara_id', p_camara_id,
        'capacidad_maxima_kg', capacidad_maxima,
        'peso_actual_kg', peso_actual,
        'capacidad_utilizada_porcentaje', ROUND(capacidad_utilizada, 2),
        'temperatura_actual', COALESCE(temperatura_actual, 0.0),
        'humedad_actual', COALESCE(humedad_actual, 0.0),
        'total_lotes', (
            SELECT COUNT(*) 
            FROM lotes_en_camara 
            WHERE camara_id = p_camara_id AND activo = true AND fecha_salida IS NULL
        ),
        'lotes_almacenados', (
            SELECT COALESCE(json_agg(
                json_build_object(
                    'lote_id', lec.lote_id,
                    'peso_kg', lec.peso_kg,
                    'fecha_ingreso', lec.fecha_ingreso,
                    'dias_en_camara', EXTRACT(day FROM CURRENT_TIMESTAMP - lec.fecha_ingreso),
                    'temperatura_objetivo', lec.temperatura_objetivo,
                    'estado_calidad', lec.estado_calidad,
                    'cultivo', l.cultivo_id,
                    'variedad', l.variedad_id
                ) ORDER BY lec.fecha_ingreso DESC
            ), '[]'::json)
            FROM lotes_en_camara lec
            JOIN lotes l ON lec.lote_id = l.id
            WHERE lec.camara_id = p_camara_id AND lec.activo = true AND lec.fecha_salida IS NULL
        ),
        'alertas_activas', (
            SELECT COALESCE(json_agg(
                json_build_object(
                    'id', id,
                    'tipo', tipo,
                    'nivel', nivel,
                    'mensaje', mensaje,
                    'fecha_creacion', created_at
                ) ORDER BY created_at DESC
            ), '[]'::json)
            FROM alertas_camaras 
            WHERE camara_id = p_camara_id AND resuelto = false
        ),
        'fecha_actualizacion', CURRENT_TIMESTAMP
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener métricas de eficiencia de cámara
CREATE OR REPLACE FUNCTION obtener_metricas_eficiencia_camara(
    p_camara_id VARCHAR(20),
    p_dias_atras INTEGER DEFAULT 30
)
RETURNS JSON AS $$
DECLARE
    result JSON;
    fecha_inicio TIMESTAMP WITH TIME ZONE;
BEGIN
    fecha_inicio := CURRENT_TIMESTAMP - (p_dias_atras || ' days')::INTERVAL;
    
    SELECT json_build_object(
        'camara_id', p_camara_id,
        'periodo_dias', p_dias_atras,
        'utilizacion_promedio_porcentaje', (
            SELECT ROUND(AVG(capacidad_utilizada_porcentaje), 2)
            FROM metricas_camaras 
            WHERE camara_id = p_camara_id AND fecha_lectura >= fecha_inicio
        ),
        'tiempo_promedio_almacenaje_dias', (
            SELECT ROUND(AVG(EXTRACT(day FROM COALESCE(fecha_salida, CURRENT_TIMESTAMP) - fecha_ingreso)), 1)
            FROM lotes_en_camara 
            WHERE camara_id = p_camara_id AND fecha_ingreso >= fecha_inicio
        ),
        'total_lotes_procesados', (
            SELECT COUNT(*)
            FROM lotes_en_camara 
            WHERE camara_id = p_camara_id AND fecha_ingreso >= fecha_inicio
        ),
        'total_peso_procesado_kg', (
            SELECT COALESCE(SUM(peso_kg), 0)
            FROM lotes_en_camara 
            WHERE camara_id = p_camara_id AND fecha_ingreso >= fecha_inicio
        ),
        'alertas_generadas', (
            SELECT COUNT(*)
            FROM alertas_camaras 
            WHERE camara_id = p_camara_id AND created_at >= fecha_inicio
        ),
        'temperatura_estabilidad_porcentaje', (
            SELECT CASE 
                WHEN COUNT(*) = 0 THEN 0
                ELSE ROUND((COUNT(*) FILTER (
                    WHERE temperatura BETWEEN 
                        (SELECT temperatura_operacion_min FROM camaras_frigorificas WHERE id = p_camara_id) AND 
                        (SELECT temperatura_operacion_max FROM camaras_frigorificas WHERE id = p_camara_id)
                ) * 100.0) / COUNT(*), 2)
            END
            FROM metricas_camaras 
            WHERE camara_id = p_camara_id AND fecha_lectura >= fecha_inicio
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================
-- 4. CREAR TRIGGERS
-- ================================

-- Triggers para actualizar updated_at
DROP TRIGGER IF EXISTS trigger_camaras_updated_at ON camaras_frigorificas;
CREATE TRIGGER trigger_camaras_updated_at
    BEFORE UPDATE ON camaras_frigorificas
    FOR EACH ROW
    EXECUTE FUNCTION update_camaras_updated_at();

DROP TRIGGER IF EXISTS trigger_lotes_camara_updated_at ON lotes_en_camara;
CREATE TRIGGER trigger_lotes_camara_updated_at
    BEFORE UPDATE ON lotes_en_camara
    FOR EACH ROW
    EXECUTE FUNCTION update_camaras_updated_at();

DROP TRIGGER IF EXISTS trigger_alertas_updated_at ON alertas_camaras;
CREATE TRIGGER trigger_alertas_updated_at
    BEFORE UPDATE ON alertas_camaras
    FOR EACH ROW
    EXECUTE FUNCTION update_camaras_updated_at();

-- ================================
-- 5. CREAR VISTAS
-- ================================

-- Vista completa de inventario de cámaras
CREATE OR REPLACE VIEW v_inventario_camaras AS
SELECT 
    cf.id as camara_id,
    cf.nombre as camara_nombre,
    cf.capacidad_maxima_kg,
    cf.temperatura_operacion_min,
    cf.temperatura_operacion_max,
    cf.humedad_optima_porcentaje,
    cf.tipo_control,
    cf.estado_operativo,
    cf.ubicacion,
    cf.responsable,
    
    -- Métricas actuales
    COALESCE(SUM(lec.peso_kg) FILTER (WHERE lec.activo = true AND lec.fecha_salida IS NULL), 0) as peso_actual_kg,
    ROUND((COALESCE(SUM(lec.peso_kg) FILTER (WHERE lec.activo = true AND lec.fecha_salida IS NULL), 0) * 100.0) / cf.capacidad_maxima_kg, 2) as capacidad_utilizada_porcentaje,
    COUNT(lec.id) FILTER (WHERE lec.activo = true AND lec.fecha_salida IS NULL) as total_lotes_activos,
    
    -- Últimas métricas de sensores
    (SELECT temperatura FROM metricas_camaras WHERE camara_id = cf.id ORDER BY fecha_lectura DESC LIMIT 1) as temperatura_actual,
    (SELECT humedad FROM metricas_camaras WHERE camara_id = cf.id ORDER BY fecha_lectura DESC LIMIT 1) as humedad_actual,
    
    -- Alertas activas
    (SELECT COUNT(*) FROM alertas_camaras WHERE camara_id = cf.id AND resuelto = false) as alertas_activas,
    
    cf.updated_at as fecha_actualizacion
    
FROM camaras_frigorificas cf
LEFT JOIN lotes_en_camara lec ON cf.id = lec.camara_id
WHERE cf.activo = true
GROUP BY cf.id, cf.nombre, cf.capacidad_maxima_kg, cf.temperatura_operacion_min, cf.temperatura_operacion_max,
         cf.humedad_optima_porcentaje, cf.tipo_control, cf.estado_operativo, cf.ubicacion, cf.responsable, cf.updated_at;

-- Vista de alertas críticas
CREATE OR REPLACE VIEW v_alertas_criticas_camaras AS
SELECT 
    ac.id,
    ac.camara_id,
    cf.nombre as camara_nombre,
    ac.tipo,
    ac.nivel,
    ac.mensaje,
    ac.valor_actual,
    ac.valor_limite,
    ac.lote_id,
    ac.created_at as fecha_alerta,
    EXTRACT(hour FROM CURRENT_TIMESTAMP - ac.created_at) as horas_sin_resolver
FROM alertas_camaras ac
JOIN camaras_frigorificas cf ON ac.camara_id = cf.id
WHERE ac.resuelto = false AND ac.nivel IN ('warning', 'critical')
ORDER BY 
    CASE ac.nivel 
        WHEN 'critical' THEN 1 
        WHEN 'warning' THEN 2 
        ELSE 3 
    END,
    ac.created_at DESC;

-- ================================
-- 6. INSERTAR DATOS INICIALES
-- ================================

-- Insertar cámaras de demostración (solo si no existen)
INSERT INTO camaras_frigorificas (id, nombre, capacidad_maxima_kg, temperatura_operacion_min, temperatura_operacion_max, humedad_optima_porcentaje, tipo_control, ubicacion, responsable) 
VALUES 
    ('CAM-001', 'Cámara Frigorífica 1 - Manzanas', 25000, 0.0, 4.0, 90, 'automatico', 'Sector A - Planta Principal', 'Carlos Mendoza'),
    ('CAM-002', 'Cámara Frigorífica 2 - Peras', 20000, -1.0, 2.0, 92, 'automatico', 'Sector B - Planta Principal', 'Ana Torres'),
    ('CAM-003', 'Cámara Frigorífica 3 - Uvas', 15000, 0.0, 1.0, 95, 'mixto', 'Sector C - Planta Principal', 'Luis Ramirez'),
    ('CAM-004', 'Cámara Frigorífica 4 - Multiuso', 30000, -2.0, 4.0, 88, 'automatico', 'Sector D - Planta Secundaria', 'Patricia Silva')
ON CONFLICT (id) DO NOTHING;

-- Comentarios de documentación
COMMENT ON TABLE camaras_frigorificas IS 'Información maestra de cámaras frigoríficas del sistema';
COMMENT ON TABLE lotes_en_camara IS 'Registro de lotes almacenados en cámaras frigoríficas';
COMMENT ON TABLE alertas_camaras IS 'Sistema de alertas para monitoreo de cámaras';
COMMENT ON TABLE metricas_camaras IS 'Historial de métricas de temperatura, humedad y capacidad';

COMMENT ON FUNCTION procesar_ingreso_lote_camara IS 'Procesa el ingreso de un lote a cámara frigorífica con validaciones';
COMMENT ON FUNCTION procesar_salida_lote_camara IS 'Procesa la salida de un lote de cámara frigorífica';
COMMENT ON FUNCTION obtener_inventario_camara IS 'Obtiene inventario completo de una cámara específica';
COMMENT ON FUNCTION obtener_metricas_eficiencia_camara IS 'Calcula métricas de eficiencia operativa de una cámara'; 