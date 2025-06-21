# Schema de Datos y Integración Supabase - KimunPulse 🗄️

## 📋 **Información del Proyecto Supabase**

### **Configuración del Proyecto**
- **Proyecto ID**: `etmbspkgeofygcowsylp`
- **Nombre**: `kimun-pulse`
- **Región**: `us-west-1`
- **Estado**: `ACTIVE_HEALTHY`
- **Base de Datos**: PostgreSQL 15.8.1.093
- **URL**: `https://etmbspkgeofygcowsylp.supabase.co`

### **Extensiones Habilitadas**
- `uuid-ossp` - Generación de UUIDs
- `pgcrypto` - Funciones criptográficas
- `pg_stat_statements` - Estadísticas de consultas
- `supabase_vault` - Gestión de secretos
- `pg_graphql` - Soporte GraphQL

---

## 🏗️ **Arquitectura del Schema**

### **Tipos ENUM Definidos**

#### **estado_lote**
```sql
CREATE TYPE estado_lote AS ENUM (
  'En Cosecha',        -- 1. Proceso de cosecha en campo
  'Cosecha Completa',  -- 2. Cosecha finalizada
  'En Packing',        -- 3. Recepción en planta de packing
  'Empacado',          -- 4. Producto empacado y etiquetado
  'En Cámara',         -- 5. Almacenamiento en frío
  'Listo Despacho',    -- 6. Preparado para envío
  'Despachado',        -- 7. Enviado a destino
  'Eliminado'          -- 8. Estado para eliminación lógica
);
```

#### **tipo_evento**
```sql
CREATE TYPE tipo_evento AS ENUM (
  'Inicio Cosecha',     -- 1. Comienzo del proceso de cosecha
  'Cosecha Completa',   -- 2. Finalización de cosecha
  'Recepción Packing',  -- 3. Llegada a planta de procesamiento
  'Selección',          -- 4. Clasificación y selección de producto
  'Empaque',            -- 5. Proceso de empaque y etiquetado
  'Paletizado',         -- 6. Organización en pallets (PUNTO CRÍTICO)
  'Enfriado',           -- 7. Proceso de enfriamiento
  'Control Calidad',    -- 8. Verificación de estándares
  'Despacho'            -- 9. Envío a destino final
);
```

#### **estado_pallet**
```sql
CREATE TYPE estado_pallet AS ENUM (
  'en_construccion',    -- Pallet siendo armado
  'completo',           -- Pallet completado
  'en_camara',          -- En cámara frigorífica
  'en_transito',        -- En proceso de envío
  'entregado',          -- Entregado al cliente
  'devuelto'            -- Devuelto por algún motivo
);
```

---

## 📊 **Tablas Principales**

### **1. usuarios**
**Propósito**: Gestión de usuarios del sistema con integración a Supabase Auth

```sql
CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  cargo TEXT,
  email TEXT UNIQUE,
  telefono TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Características**:
- ✅ RLS habilitado
- 🔗 Integración con `auth.users` de Supabase
- 📊 10 registros activos
- 🔑 Relación con `eventos_trazabilidad`

### **2. cultivos**
**Propósito**: Catálogo de cultivos agrícolas (Arándanos, Cerezas, Manzanas)

```sql
CREATE TABLE cultivos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL UNIQUE,
  descripcion TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Características**:
- ✅ RLS habilitado
- 📊 6 cultivos registrados
- 🔗 Relación con `lotes` y `variedades`

### **3. variedades**
**Propósito**: Variedades específicas por cultivo

```sql
CREATE TABLE variedades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cultivo_id UUID NOT NULL REFERENCES cultivos(id),
  nombre TEXT NOT NULL,
  descripcion TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Características**:
- ✅ RLS habilitado
- 📊 26 variedades registradas
- 🔗 FK a `cultivos`

### **4. cuarteles**
**Propósito**: Ubicaciones físicas de producción

```sql
CREATE TABLE cuarteles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL UNIQUE,
  ubicacion TEXT,
  area_total NUMERIC,
  descripcion TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Características**:
- ✅ RLS habilitado
- 📊 19 cuarteles registrados
- 🔗 Relación con `lotes`

### **5. lotes** ⭐ **TABLA CENTRAL**
**Propósito**: Lotes de producción con trazabilidad completa

```sql
CREATE TABLE lotes (
  id TEXT PRIMARY KEY,  -- Formato: LP-YYYY-CHIL-NNN
  cultivo_id UUID NOT NULL REFERENCES cultivos(id),
  variedad_id UUID NOT NULL REFERENCES variedades(id),
  cuartel_id UUID NOT NULL REFERENCES cuarteles(id),
  estado estado_lote NOT NULL DEFAULT 'En Cosecha',
  ultimo_evento TEXT,
  fecha_ultimo_evento TIMESTAMPTZ,
  area NUMERIC NOT NULL,
  observaciones TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Características**:
- ✅ RLS habilitado
- 📊 23 lotes activos
- 🏷️ **Formato de ID crítico**: `LP-YYYY-CHIL-NNN`
- 🔗 Múltiples FK a catálogos
- 📈 128 kB de datos

### **6. eventos_trazabilidad** ⭐ **TABLA DE EVENTOS**
**Propósito**: Historial completo de eventos de trazabilidad

```sql
CREATE TABLE eventos_trazabilidad (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lote_id TEXT NOT NULL REFERENCES lotes(id),
  tipo tipo_evento NOT NULL,
  fecha TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  descripcion TEXT NOT NULL,
  responsable_id UUID REFERENCES usuarios(id),
  responsable_nombre TEXT,
  datos_adicionales JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Características**:
- ✅ RLS habilitado
- 📊 133 eventos registrados
- 📈 184 kB de datos
- 🔗 FK a `lotes` y `usuarios`
- 📝 Campo JSONB para datos específicos SAG

### **7. pallets** 🆕 **SISTEMA POST-PALETIZADO**
**Propósito**: Gestión de pallets con códigos PAL-YYYY-CHIL-NNNNN

```sql
CREATE TABLE pallets (
  codigo_pallet TEXT PRIMARY KEY,  -- Formato: PAL-YYYY-CHIL-NNNNN
  fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
  estado estado_pallet DEFAULT 'en_construccion',
  tipo_pallet VARCHAR NOT NULL DEFAULT 'madera',
  peso_total_kg NUMERIC,
  cantidad_cajas_total INTEGER DEFAULT 0,
  destino_inicial TEXT,
  ubicacion_actual TEXT,
  temperatura_objetivo NUMERIC,
  observaciones TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT check_codigo_pallet 
    CHECK (codigo_pallet ~ '^PAL-\d{4}-CHIL-\d{5}$')
);
```

**Características**:
- ✅ RLS habilitado
- 📊 4 pallets registrados
- 🏷️ **Formato de código crítico**: `PAL-YYYY-CHIL-NNNNN`
- ✅ Validación regex en BD
- 📈 80 kB de datos

### **8. pallet_lotes** 🔗 **RELACIÓN MANY-TO-MANY**
**Propósito**: Relación entre pallets y lotes (pallets mixtos)

```sql
CREATE TABLE pallet_lotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codigo_pallet TEXT REFERENCES pallets(codigo_pallet),
  lote_id TEXT REFERENCES lotes(id),
  cantidad_cajas_lote INTEGER NOT NULL,
  peso_lote_kg NUMERIC NOT NULL,
  posicion_en_pallet INTEGER,  -- Posición física del lote
  fecha_agregado TIMESTAMPTZ DEFAULT NOW()
);
```

**Características**:
- ✅ RLS habilitado
- 📊 4 relaciones registradas
- 🔗 FK a `pallets` y `lotes`
- 📍 Control de posición física

---

## 🔍 **Vistas del Sistema**

### **v_lotes_completos**
**Propósito**: Vista consolidada de lotes con información completa

```sql
CREATE VIEW v_lotes_completos AS
SELECT 
  l.id,
  l.estado,
  l.ultimo_evento,
  l.fecha_ultimo_evento,
  l.area,
  l.observaciones,
  c.nombre AS cultivo,
  v.nombre AS variedad,
  cu.nombre AS cuartel_origen,
  cu.ubicacion AS ubicacion_cuartel,
  l.created_at,
  l.updated_at,
  (SELECT COUNT(*) FROM eventos_trazabilidad et WHERE et.lote_id = l.id) AS total_eventos,
  (SELECT MIN(et.fecha) FROM eventos_trazabilidad et WHERE et.lote_id = l.id) AS fecha_inicio,
  (SELECT MAX(et.fecha) FROM eventos_trazabilidad et WHERE et.lote_id = l.id) AS fecha_ultimo_evento_real
FROM lotes l
JOIN cultivos c ON l.cultivo_id = c.id
JOIN variedades v ON l.variedad_id = v.id
JOIN cuarteles cu ON l.cuartel_id = cu.id
WHERE l.activo = true;
```

### **v_dashboard_metricas**
**Propósito**: Métricas resumidas para dashboard en tiempo real

```sql
CREATE VIEW v_dashboard_metricas AS
SELECT 
  COUNT(*) AS total_lotes,
  COUNT(*) FILTER (WHERE estado = 'En Cosecha') AS lotes_en_cosecha,
  COUNT(*) FILTER (WHERE estado = 'Cosecha Completa') AS lotes_cosecha_completa,
  COUNT(*) FILTER (WHERE estado = 'En Packing') AS lotes_en_packing,
  COUNT(*) FILTER (WHERE estado = 'Empacado') AS lotes_empacados,
  COUNT(*) FILTER (WHERE estado = 'En Cámara') AS lotes_en_camara,
  COUNT(*) FILTER (WHERE estado = 'Listo Despacho') AS lotes_listo_despacho,
  COUNT(*) FILTER (WHERE estado = 'Despachado') AS lotes_despachados,
  SUM(area) AS area_total,
  AVG(area) AS area_promedio
FROM lotes
WHERE activo = true;
```

### **v_eventos_recientes**
**Propósito**: Eventos de los últimos 30 días con información completa

```sql
CREATE VIEW v_eventos_recientes AS
SELECT 
  et.id,
  et.lote_id,
  l.cultivo_id,
  c.nombre AS cultivo,
  v.nombre AS variedad,
  et.tipo,
  et.fecha,
  et.descripcion,
  COALESCE(u.nombre, et.responsable_nombre) AS responsable,
  et.datos_adicionales
FROM eventos_trazabilidad et
JOIN lotes l ON et.lote_id = l.id
JOIN cultivos c ON l.cultivo_id = c.id
JOIN variedades v ON l.variedad_id = v.id
LEFT JOIN usuarios u ON et.responsable_id = u.id
WHERE et.fecha >= (NOW() - INTERVAL '30 days')
ORDER BY et.fecha DESC;
```

### **v_pallets_completos** 🆕
**Propósito**: Vista consolidada de pallets con información de lotes

```sql
CREATE VIEW v_pallets_completos AS
SELECT 
  p.codigo_pallet,
  p.fecha_creacion,
  p.estado,
  p.tipo_pallet,
  p.peso_total_kg,
  p.cantidad_cajas_total,
  p.destino_inicial,
  p.ubicacion_actual,
  p.temperatura_objetivo,
  p.observaciones,
  p.activo,
  p.created_at,
  p.updated_at,
  COUNT(pl.lote_id) AS lotes_asociados,
  SUM(pl.cantidad_cajas_lote) AS cajas_calculadas,
  SUM(pl.peso_lote_kg) AS peso_calculado,
  ARRAY_AGG(pl.lote_id ORDER BY pl.fecha_agregado) FILTER (WHERE pl.lote_id IS NOT NULL) AS lotes_ids,
  STRING_AGG(DISTINCT l.cultivo, ', ' ORDER BY l.cultivo) AS cultivos,
  STRING_AGG(DISTINCT l.variedad, ', ' ORDER BY l.variedad) AS variedades
FROM pallets p
LEFT JOIN pallet_lotes pl ON p.codigo_pallet = pl.codigo_pallet
LEFT JOIN v_lotes_completos l ON pl.lote_id = l.id
GROUP BY p.codigo_pallet, p.fecha_creacion, p.estado, p.tipo_pallet, 
         p.peso_total_kg, p.cantidad_cajas_total, p.destino_inicial, 
         p.ubicacion_actual, p.temperatura_objetivo, p.observaciones, 
         p.activo, p.created_at, p.updated_at;
```

### **v_productividad_cuarteles**
**Propósito**: Métricas de productividad por cuartel

```sql
CREATE VIEW v_productividad_cuarteles AS
SELECT 
  cu.id AS cuartel_id,
  cu.nombre AS cuartel,
  cu.ubicacion,
  COUNT(l.id) AS total_lotes,
  SUM(l.area) AS area_total,
  c.nombre AS cultivo_principal,
  COUNT(*) FILTER (WHERE l.estado = 'Despachado') AS lotes_completados,
  ROUND(
    (COUNT(*) FILTER (WHERE l.estado = 'Despachado')::NUMERIC / COUNT(l.id)::NUMERIC) * 100, 
    2
  ) AS porcentaje_completados
FROM cuarteles cu
LEFT JOIN lotes l ON cu.id = l.cuartel_id AND l.activo = true
LEFT JOIN cultivos c ON l.cultivo_id = c.id
GROUP BY cu.id, cu.nombre, cu.ubicacion, c.nombre
ORDER BY SUM(l.area) DESC;
```

---

## ⚙️ **Funciones del Sistema**

### **Funciones de Gestión de Lotes**

#### **actualizar_estado_lote()**
**Propósito**: Trigger que actualiza automáticamente el estado del lote según el evento

```sql
CREATE OR REPLACE FUNCTION actualizar_estado_lote()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE lotes 
    SET estado = CASE NEW.tipo
        WHEN 'Inicio Cosecha' THEN 'En Cosecha'::estado_lote
        WHEN 'Cosecha Completa' THEN 'Cosecha Completa'::estado_lote
        WHEN 'Recepción Packing' THEN 'En Packing'::estado_lote
        WHEN 'Selección' THEN 'En Packing'::estado_lote
        WHEN 'Empaque' THEN 'Empacado'::estado_lote
        WHEN 'Paletizado' THEN 'Empacado'::estado_lote
        WHEN 'Enfriado' THEN 'En Cámara'::estado_lote
        WHEN 'Control Calidad' THEN 'Listo Despacho'::estado_lote
        WHEN 'Despacho' THEN 'Despachado'::estado_lote
        ELSE estado
    END,
    ultimo_evento = NEW.tipo,
    fecha_ultimo_evento = NEW.fecha,
    updated_at = NOW()
    WHERE id = NEW.lote_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

#### **eliminar_lote_logico(lote_id_param TEXT, motivo TEXT)**
**Propósito**: Eliminación lógica de lotes

```sql
CREATE OR REPLACE FUNCTION eliminar_lote_logico(
  lote_id_param TEXT, 
  motivo TEXT
) RETURNS BOOLEAN AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM lotes WHERE id = lote_id_param) THEN
        RAISE EXCEPTION 'El lote % no existe', lote_id_param;
    END IF;
    
    UPDATE lotes 
    SET 
        estado = 'Eliminado'::estado_lote,
        activo = false,
        observaciones = COALESCE(observaciones || E'\n\n', '') || 
                       'ELIMINADO: ' || motivo || ' (' || NOW()::DATE || ')',
        updated_at = NOW()
    WHERE id = lote_id_param;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
```

#### **restaurar_lote(lote_id_param TEXT)**
**Propósito**: Restauración de lotes eliminados

```sql
CREATE OR REPLACE FUNCTION restaurar_lote(lote_id_param TEXT) 
RETURNS BOOLEAN AS $$
DECLARE
    ultimo_estado_real estado_lote;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM lotes WHERE id = lote_id_param AND estado = 'Eliminado') THEN
        RAISE EXCEPTION 'El lote % no existe o no está eliminado', lote_id_param;
    END IF;
    
    -- Determinar último estado válido
    SELECT CASE 
        WHEN ultimo_evento = 'Inicio Cosecha' THEN 'En Cosecha'::estado_lote
        WHEN ultimo_evento = 'Cosecha Completa' THEN 'Cosecha Completa'::estado_lote
        WHEN ultimo_evento = 'Recepción Packing' THEN 'En Packing'::estado_lote
        WHEN ultimo_evento = 'Selección' THEN 'En Packing'::estado_lote
        WHEN ultimo_evento = 'Empaque' THEN 'Empacado'::estado_lote
        WHEN ultimo_evento = 'Paletizado' THEN 'Empacado'::estado_lote
        WHEN ultimo_evento = 'Enfriado' THEN 'En Cámara'::estado_lote
        WHEN ultimo_evento = 'Control Calidad' THEN 'Listo Despacho'::estado_lote
        WHEN ultimo_evento = 'Despacho' THEN 'Despachado'::estado_lote
        ELSE 'En Cosecha'::estado_lote
    END INTO ultimo_estado_real
    FROM lotes 
    WHERE id = lote_id_param;
    
    UPDATE lotes 
    SET 
        estado = ultimo_estado_real,
        activo = true,
        observaciones = COALESCE(observaciones || E'\n\n', '') || 
                       'RESTAURADO: ' || NOW()::DATE,
        updated_at = NOW()
    WHERE id = lote_id_param;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
```

### **Funciones de Dashboard y Reportes**

#### **obtener_metricas_dashboard()**
**Propósito**: Métricas en tiempo real para dashboard

```sql
CREATE OR REPLACE FUNCTION obtener_metricas_dashboard()
RETURNS TABLE(
  total_lotes BIGINT,
  lotes_activos BIGINT,
  area_total NUMERIC,
  eventos_hoy BIGINT,
  lotes_por_estado JSONB,
  cultivos_activos JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM lotes WHERE activo = true) as total_lotes,
    (SELECT COUNT(*) FROM lotes WHERE activo = true AND estado != 'Despachado') as lotes_activos,
    (SELECT COALESCE(SUM(area), 0) FROM lotes WHERE activo = true) as area_total,
    (SELECT COUNT(*) FROM eventos_trazabilidad WHERE fecha::date = CURRENT_DATE) as eventos_hoy,
    (
      SELECT jsonb_object_agg(estado, cantidad)
      FROM (
        SELECT estado, COUNT(*) as cantidad
        FROM lotes 
        WHERE activo = true
        GROUP BY estado
      ) estados
    ) as lotes_por_estado,
    (
      SELECT jsonb_object_agg(cultivo, cantidad)
      FROM (
        SELECT c.nombre as cultivo, COUNT(l.id) as cantidad
        FROM cultivos c
        LEFT JOIN lotes l ON c.id = l.cultivo_id AND l.activo = true
        GROUP BY c.nombre
        HAVING COUNT(l.id) > 0
      ) cultivos
    ) as cultivos_activos;
END;
$$ LANGUAGE plpgsql;
```

#### **generar_reporte_lote(lote_id_param TEXT)**
**Propósito**: Reporte completo de trazabilidad por lote

```sql
CREATE OR REPLACE FUNCTION generar_reporte_lote(lote_id_param TEXT)
RETURNS TABLE(
  lote_id TEXT,
  cultivo TEXT,
  variedad TEXT,
  cuartel TEXT,
  area NUMERIC,
  estado estado_lote,
  fecha_creacion TIMESTAMPTZ,
  total_eventos BIGINT,
  fecha_inicio TIMESTAMPTZ,
  fecha_ultimo_evento TIMESTAMPTZ,
  dias_en_proceso INTEGER,
  historial_eventos JSONB
) AS $$
BEGIN
  RETURN QUERY
  WITH lote_info AS (
    SELECT 
      l.id as lote_id,
      c.nombre as cultivo,
      v.nombre as variedad,
      cu.nombre as cuartel,
      l.area,
      l.estado,
      l.created_at as fecha_creacion
    FROM lotes l
    JOIN cultivos c ON l.cultivo_id = c.id
    JOIN variedades v ON l.variedad_id = v.id
    JOIN cuarteles cu ON l.cuartel_id = cu.id
    WHERE l.id = lote_id_param
  ),
  eventos_stats AS (
    SELECT 
      COUNT(*) as total_eventos,
      MIN(fecha) as fecha_inicio,
      MAX(fecha) as fecha_ultimo_evento,
      EXTRACT(days FROM (MAX(fecha) - MIN(fecha))) as dias_en_proceso
    FROM eventos_trazabilidad
    WHERE lote_id = lote_id_param
  ),
  eventos_detalle AS (
    SELECT jsonb_agg(
      jsonb_build_object(
        'tipo', tipo,
        'fecha', fecha,
        'descripcion', descripcion,
        'responsable', COALESCE(u.nombre, et.responsable_nombre),
        'datos_adicionales', datos_adicionales
      ) ORDER BY fecha
    ) as historial_eventos
    FROM eventos_trazabilidad et
    LEFT JOIN usuarios u ON et.responsable_id = u.id
    WHERE et.lote_id = lote_id_param
  )
  SELECT 
    li.lote_id,
    li.cultivo,
    li.variedad,
    li.cuartel,
    li.area,
    li.estado,
    li.fecha_creacion,
    es.total_eventos,
    es.fecha_inicio,
    es.fecha_ultimo_evento,
    es.dias_en_proceso::INTEGER,
    ed.historial_eventos
  FROM lote_info li
  CROSS JOIN eventos_stats es
  CROSS JOIN eventos_detalle ed;
END;
$$ LANGUAGE plpgsql;
```

### **Funciones del Sistema de Pallets** 🆕

#### **agregar_lote_a_pallet()**
**Propósito**: Agregar lotes a pallets con validaciones

```sql
CREATE OR REPLACE FUNCTION agregar_lote_a_pallet(
  p_codigo_pallet TEXT,
  p_lote_id TEXT,
  p_cantidad_cajas INTEGER,
  p_peso_kg NUMERIC,
  p_posicion INTEGER DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  pallet_existe BOOLEAN;
  lote_existe BOOLEAN;
BEGIN
  -- Verificar que el pallet existe y está activo
  SELECT EXISTS(
    SELECT 1 FROM pallets 
    WHERE codigo_pallet = p_codigo_pallet AND activo = true
  ) INTO pallet_existe;
  
  IF NOT pallet_existe THEN
    RAISE EXCEPTION 'Pallet % no encontrado o inactivo', p_codigo_pallet;
  END IF;
  
  -- Verificar que el lote existe y está activo
  SELECT EXISTS(
    SELECT 1 FROM lotes 
    WHERE id = p_lote_id AND activo = true
  ) INTO lote_existe;
  
  IF NOT lote_existe THEN
    RAISE EXCEPTION 'Lote % no encontrado o inactivo', p_lote_id;
  END IF;
  
  -- Insertar la relación
  INSERT INTO pallet_lotes (
    codigo_pallet, 
    lote_id, 
    cantidad_cajas_lote, 
    peso_lote_kg, 
    posicion_en_pallet
  ) VALUES (
    p_codigo_pallet, 
    p_lote_id, 
    p_cantidad_cajas, 
    p_peso_kg, 
    p_posicion
  );
  
  -- Actualizar totales del pallet
  UPDATE pallets 
  SET 
    cantidad_cajas_total = (
      SELECT SUM(cantidad_cajas_lote) 
      FROM pallet_lotes 
      WHERE codigo_pallet = p_codigo_pallet
    ),
    peso_total_kg = (
      SELECT SUM(peso_lote_kg) 
      FROM pallet_lotes 
      WHERE codigo_pallet = p_codigo_pallet
    ),
    updated_at = NOW()
  WHERE codigo_pallet = p_codigo_pallet;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
```

#### **obtener_trazabilidad_lote(p_lote_id TEXT)**
**Propósito**: Trazabilidad completa incluyendo información de pallets

```sql
CREATE OR REPLACE FUNCTION obtener_trazabilidad_lote(p_lote_id TEXT)
RETURNS JSON AS $$
DECLARE
  resultado JSON;
BEGIN
  SELECT json_build_object(
    'lote_id', p_lote_id,
    'lote_info', (
      SELECT row_to_json(l)
      FROM v_lotes_completos l
      WHERE l.id = p_lote_id
    ),
    'pallet_actual', (
      SELECT json_build_object(
        'codigo_pallet', p.codigo_pallet,
        'estado', p.estado,
        'ubicacion_actual', p.ubicacion_actual,
        'fecha_agregado', pl.fecha_agregado,
        'cantidad_cajas_en_pallet', pl.cantidad_cajas_lote,
        'peso_en_pallet', pl.peso_lote_kg,
        'posicion_en_pallet', pl.posicion_en_pallet
      )
      FROM pallets p
      JOIN pallet_lotes pl ON p.codigo_pallet = pl.codigo_pallet
      WHERE pl.lote_id = p_lote_id
        AND p.activo = true
      ORDER BY pl.fecha_agregado DESC
      LIMIT 1
    ),
    'historial_pallets', (
      SELECT json_agg(
        json_build_object(
          'codigo_pallet', p.codigo_pallet,
          'estado', p.estado,
          'fecha_agregado', pl.fecha_agregado,
          'cantidad_cajas', pl.cantidad_cajas_lote,
          'peso_kg', pl.peso_lote_kg
        ) ORDER BY pl.fecha_agregado DESC
      )
      FROM pallets p
      JOIN pallet_lotes pl ON p.codigo_pallet = pl.codigo_pallet
      WHERE pl.lote_id = p_lote_id
    )
  ) INTO resultado;
  
  RETURN resultado;
END;
$$ LANGUAGE plpgsql;
```

---

## 🔐 **Row Level Security (RLS)**

### **Políticas Implementadas**

Todas las tablas tienen RLS habilitado con políticas que requieren usuario autenticado:

```sql
-- Ejemplo de política estándar
CREATE POLICY "Usuarios autenticados pueden ver lotes" 
ON lotes FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden insertar lotes" 
ON lotes FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden actualizar lotes" 
ON lotes FOR UPDATE 
USING (auth.role() = 'authenticated');
```

### **Tablas con RLS Habilitado**
- ✅ `usuarios`
- ✅ `cultivos`
- ✅ `variedades`
- ✅ `cuarteles`
- ✅ `lotes`
- ✅ `eventos_trazabilidad`
- ✅ `pallets`
- ✅ `pallet_lotes`

---

## 🔄 **Triggers del Sistema**

### **Trigger de Actualización de Estado**
```sql
CREATE TRIGGER trigger_actualizar_estado_lote
    AFTER INSERT ON eventos_trazabilidad
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_estado_lote();
```

### **Trigger de Validación de Eventos**
```sql
CREATE TRIGGER trigger_validacion_eventos
    BEFORE INSERT ON eventos_trazabilidad
    FOR EACH ROW
    EXECUTE FUNCTION validar_secuencia_eventos();
```

---

## 📈 **Historial de Migraciones**

### **Migraciones Aplicadas**
1. `20250526075459_create_initial_schema` - Schema inicial
2. `20250526075526_create_update_lote_estado_function` - Función de actualización de estado
3. `20250526075556_insert_sample_data` - Datos de prueba
4. `20250526080956_insert_trazabilidad_events` - Eventos de trazabilidad
5. `20250526111016_create_useful_views` - Vistas del sistema
6. `20250526111119_create_report_functions` - Funciones de reportes
7. `20250526113814_create_rls_policies` - Políticas RLS
8. `20250529055838_actualizar_estado_lote_automatico` - Automatización de estados
9. `20250529060210_funciones_gestion_lotes` - Funciones de gestión
10. `20250529060708_validacion_secuencia_eventos` - Validación de secuencias
11. `20250529060729_trigger_validacion_eventos` - Triggers de validación
12. `20250602071037_create_pallets_system` - **Sistema de pallets** 🆕

---

## 🔗 **Integración con Frontend TypeScript**

### **Generación de Tipos**

Para mantener la sincronización entre el schema de BD y TypeScript:

```bash
# Generar tipos desde Supabase
supabase gen types typescript --project-id etmbspkgeofygcowsylp --schema public > src/types/database.ts
```

### **Cliente Supabase Tipado**

```typescript
import { createClient } from '@supabase/supabase-js'
import { Database } from './types/database'

const supabase = createClient<Database>(
  process.env.REACT_APP_SUPABASE_URL!,
  process.env.REACT_APP_SUPABASE_ANON_KEY!
)

// Uso tipado
const { data: lotes, error } = await supabase
  .from('lotes')
  .select(`
    id,
    estado,
    cultivo:cultivos(nombre),
    variedad:variedades(nombre),
    cuartel:cuarteles(nombre)
  `)
```

### **Tipos Helper Generados**

```typescript
// Tipos automáticos generados por Supabase CLI
export type Tables<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Row']

export type Enums<T extends keyof Database['public']['Enums']> = 
  Database['public']['Enums'][T]

// Uso en componentes
type Lote = Tables<'lotes'>
type EstadoLote = Enums<'estado_lote'>
type TipoEvento = Enums<'tipo_evento'>
```

---

## 📊 **Estadísticas Actuales del Schema**

### **Volumen de Datos**
- **Lotes**: 23 registros activos (128 kB)
- **Eventos**: 133 eventos (184 kB)
- **Usuarios**: 10 usuarios activos (48 kB)
- **Cultivos**: 6 cultivos (48 kB)
- **Variedades**: 26 variedades (48 kB)
- **Cuarteles**: 19 cuarteles (48 kB)
- **Pallets**: 4 pallets (80 kB) 🆕
- **Pallet-Lotes**: 4 relaciones (80 kB) 🆕

### **Relaciones Clave**
- `lotes` ← `eventos_trazabilidad` (1:N)
- `cultivos` ← `variedades` (1:N)
- `cultivos` ← `lotes` (1:N)
- `variedades` ← `lotes` (1:N)
- `cuarteles` ← `lotes` (1:N)
- `usuarios` ← `eventos_trazabilidad` (1:N)
- `pallets` ← `pallet_lotes` ← `lotes` (M:N) 🆕

---

## 🚀 **Próximas Mejoras del Schema**

### **Funcionalidades Planificadas**
1. **Cámaras frigoríficas**: Tabla `camaras` con ubicaciones específicas
2. **Control de calidad**: Tablas para parámetros y resultados de calidad
3. **Inventarios**: Vistas y funciones para inventario por ubicación
4. **Alertas**: Sistema de notificaciones automáticas
5. **Auditoría**: Logs detallados de cambios críticos

### **Optimizaciones Técnicas**
1. **Índices**: Optimización de consultas frecuentes
2. **Particionamiento**: Para tablas de eventos por fecha
3. **Archivado**: Estrategia para datos históricos
4. **Backup**: Políticas de respaldo automático

---

## 📞 **Mantenimiento y Soporte**

### **Comandos Útiles MCP**

```bash
# Listar tablas
mcp_supabase_list_tables --project_id etmbspkgeofygcowsylp

# Ejecutar consulta
mcp_supabase_execute_sql --project_id etmbspkgeofygcowsylp --query "SELECT * FROM v_dashboard_metricas"

# Ver logs
mcp_supabase_get_logs --project_id etmbspkgeofygcowsylp --service postgres

# Generar tipos TypeScript
supabase gen types typescript --project-id etmbspkgeofygcowsylp > types/database.ts
```

### **Monitoreo de Performance**

- **Extensión activa**: `pg_stat_statements` para análisis de consultas
- **Métricas clave**: Tiempo de respuesta de vistas y funciones
- **Alertas**: Configurar para uso de CPU y memoria

---

**✨ El schema de KimunPulse está optimizado para trazabilidad agrícola SAG con soporte completo para el flujo post-paletizado y integración TypeScript nativa.**