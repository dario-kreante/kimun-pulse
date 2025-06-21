# Reglas de Desarrollo - KimunPulse 🔧

## 📋 **Reglas Críticas Obligatorias**

### **1. 🏷️ Formato de Códigos de Lotes**

**REGLA CRÍTICA**: Todos los códigos de lotes DEBEN seguir el formato **`LP-YYYY-CHIL-NNN`**

#### ✅ **Formato Correcto**
```
LP-YYYY-CHIL-NNN

Donde:
├── LP     = Lote de Producción (fijo)
├── YYYY   = Año de cosecha (4 dígitos)
├── CHIL   = Chile, código de país (fijo)
└── NNN    = Número secuencial (3 dígitos)
```

#### ❌ **Formatos Prohibidos**
- `L-YYYY-NNN` (formato anterior, PROHIBIDO)
- `LP-YY-CHIL-NNN` (año debe ser 4 dígitos)
- `LP-YYYY-CH-NNN` (país debe ser CHIL completo)
- Cualquier desviación sin documentación oficial

#### 📂 **Documentación Oficial**
- **[FORMATO_CODIGOS_LOTES.md](./FORMATO_CODIGOS_LOTES.md)** - Especificación completa
- **Implementación**: `src/components/ModalEscanearQR.tsx`
- **Validación**: `src/lib/qrUtils.ts`

---

### **2. 🔒 Autenticación y Seguridad**

#### **Row Level Security (RLS)**
- TODAS las tablas deben tener RLS habilitado
- Las políticas deben validar usuario autenticado
- NUNCA saltarse validaciones de seguridad

#### **Variables de Entorno**
- NUNCA hardcodear API keys o secrets
- Usar `.env` para todas las configuraciones
- Documentar variables requeridas en `.env.example`

---

### **3. 🎨 Estándares de UI/UX**

#### **Consistencia Visual**
- Seguir el design system existente
- Usar colores de `tailwind.config.js`
- Mobile-first approach OBLIGATORIO

#### **Accesibilidad**
- Todos los botones deben tener `aria-label`
- Inputs deben tener `title` descriptivo
- Contraste mínimo WCAG AA

---

### **4. 📝 Documentación**

#### **Cambios Críticos**
- TODO cambio en formato de datos requiere documentación
- Actualizar README.md cuando sea relevante
- Crear archivos `.md` para nuevas funcionalidades

#### **Comentarios en Código**
- Funciones complejas deben tener JSDoc
- Explicar decisiones no obvias
- Documentar workarounds temporales

---

### **5. 🧪 Testing y Validación**

#### **Validaciones Obligatorias**
- Frontend Y backend deben validar datos
- Patrones regex deben ser consistentes
- Mensajes de error deben ser descriptivos

#### **Testing**
- Funciones críticas requieren tests unitarios
- Componentes principales requieren tests de integración
- Mantener cobertura mínima del 70%

---

## 🚨 **Procedimiento para Cambios Críticos**

### **Cambios en Formato de Datos**

1. **Investigar**: Verificar formato actual en BD/código
2. **Documentar**: Crear/actualizar archivo de especificación
3. **Implementar**: Actualizar código y validaciones
4. **Probar**: Verificar compatibilidad con datos existentes
5. **Comunicar**: Actualizar documentación y README

### **Ejemplo - Cambio de Formato de Códigos**

```bash
# ❌ INCORRECTO - No investigar formato actual
echo "Voy a usar L-YYYY-NNN porque me parece más simple"

# ✅ CORRECTO - Proceso completo
grep -r "L-" src/                           # 1. Investigar
cat docs/DEMO_USER.md                       # 2. Verificar datos reales
vim docs/FORMATO_CODIGOS_LOTES.md          # 3. Documentar oficial
vim src/components/ModalEscanearQR.tsx     # 4. Implementar
npm test                                   # 5. Probar
git commit -m "fix: format códigos LP-"    # 6. Comunicar
```

---

## 📋 **Checklist Pre-Commit**

### **Antes de cada commit:**

- [ ] ¿Formato de códigos correcto en nuevos archivos?
- [ ] ¿Variables sensibles en `.env`?
- [ ] ¿Documentación actualizada si es necesario?
- [ ] ¿Mensajes de error descriptivos?
- [ ] ¿Accesibilidad considerada en UI?
- [ ] ¿Tests pasando?
- [ ] ¿Linting sin errores críticos?

### **Para cambios críticos:**

- [ ] ¿Investigué el estado actual antes de cambiar?
- [ ] ¿Documenté el cambio en archivo `.md`?
- [ ] ¿Actualicé todas las referencias?
- [ ] ¿Probé con datos reales/demo?
- [ ] ¿Comuniqué el cambio en commit message?

---

## 🎯 **Objetivo**

**Evitar inconsistencias como el formato L-YYYY-NNN vs LP-YYYY-CHIL-NNN que requieren corrección posterior.**

**Cada desarrollador es responsable de verificar el estado actual antes de implementar cambios.**

---

## 📞 **Escalación**

Si hay dudas sobre formatos o estándares:

1. Revisar documentación en `/docs`
2. Buscar en código existente: `grep -r "patron"`
3. Verificar datos demo en `docs/DEMO_USER.md`
4. Preguntar antes de asumir

**Es mejor preguntar 5 minutos que corregir 2 horas.**

## 7. 📦 Trazabilidad Post-Paletizado: Flujo del Mercado Chileno

### 7.1 🔄 Transición Lote → Pallet (Punto Crítico)

**REGLA FUNDAMENTAL**: Después del evento "Paletizado", la trazabilidad cambia de **nivel LOTE** a **nivel PALLET**.

#### **Escenario Real del Mercado Chileno:**
```
Lote LP-2025-CHIL-022 (1,200 cajas, 9,600 kg)
    ↓ PALETIZADO
    ├── PAL-2025-CHIL-00047 (40 cajas, 320 kg) → Cliente A
    ├── PAL-2025-CHIL-00048 (40 cajas, 320 kg) → Cliente A  
    ├── PAL-2025-CHIL-00049 (35 cajas, 280 kg) → Cliente B
    └── ... (total 30 pallets)
```

### 7.2 🏭 Eventos Post-Paletizado (Nivel PALLET)

#### **Los siguientes eventos SE REGISTRAN POR PALLET:**

1. **Enfriado** → `PAL-2025-CHIL-00047` entra a cámara 3
2. **Control de Calidad** → Inspección de `PAL-2025-CHIL-00047`
3. **Almacenamiento** → `PAL-2025-CHIL-00047` en posición A-12
4. **Despacho** → `PAL-2025-CHIL-00047` sale en contenedor XYZ123

#### **¿Por qué pallets y no lotes?**
- **Logística eficiente**: Cámaras manejan pallets completos
- **Control de inventario**: Ubicación física por pallet
- **Despacho real**: Clientes reciben pallets, no lotes abstractos
- **Normativa SAG**: Trazabilidad mantenida via relación pallet→lote

### 7.3 🔍 Trazabilidad Bidireccional

#### **Hacia adelante (Lote → Producto Final):**
```sql
-- ¿Dónde está el lote LP-2025-CHIL-022?
SELECT p.codigo_pallet, p.ubicacion_actual, e.tipo_evento
FROM pallets p 
JOIN pallet_lotes pl ON p.id = pl.pallet_id
JOIN lotes l ON pl.lote_id = l.id
LEFT JOIN eventos_pallet e ON p.id = e.pallet_id
WHERE l.codigo = 'LP-2025-CHIL-022'
ORDER BY e.fecha_evento DESC;
```

#### **Hacia atrás (Producto → Origen):**
```sql
-- ¿De qué lote viene PAL-2025-CHIL-00047?
SELECT l.codigo, l.fecha_cosecha, l.productor, l.predio
FROM lotes l
JOIN pallet_lotes pl ON l.id = pl.lote_id  
JOIN pallets p ON pl.pallet_id = p.id
WHERE p.codigo = 'PAL-2025-CHIL-00047';
```

### 7.4 ⚖️ Gestión de Pesos y Envases

#### **Cuadre de Masas:**
```
Peso Lote Original = Σ(Peso de todos sus pallets)
Peso Pallet = Peso Fruta + Peso Envases + Tara Pallet

Ejemplo:
LP-2025-CHIL-022: 9,600 kg
├── Fruta neta: 9,600 kg
├── Envases (clamshells): 240 kg  
├── Pallets (30 x 25kg): 750 kg
└── Total bruto: 10,590 kg
```

#### **Tipos de Envases Rastreados:**
- **Primario**: Clamshells, bandejas, bolsas
- **Secundario**: Cajas de cartón
- **Terciario**: Pallets de madera
- **Cuaternario**: Contenedores (para exportación)

### 7.5 🚛 Flujo Operativo Real

#### **Día 1: Paletizado**
```
09:00 - Lote LP-2025-CHIL-022 inicia paletizado
10:30 - Se genera PAL-2025-CHIL-00047 (primer pallet)
11:00 - PAL-2025-CHIL-00047 → Evento "Enfriado" en cámara 3
```

#### **Día 2: Control de Calidad**  
```
08:00 - PAL-2025-CHIL-00047 → Evento "Control de Calidad"
       ├── Temperatura: 2°C ✓
       ├── Humedad: 90% ✓
       └── Estado fruta: Aceptable ✓
```

#### **Día 5: Despacho**
```
14:00 - PAL-2025-CHIL-00047 → Evento "Despacho"
       ├── Contenedor: TCLU-1234567
       ├── Destino: Puerto de Shanghai
       └── Cliente: Distribuidora Chen & Asociados
```

### 7.6 📱 Implementación en KimunPulse

#### **Cambios Requeridos:**

1. **Eventos duales**: Post-paletizado, mostrar opciones "Registrar en Lote" vs "Registrar en Pallet"
2. **Scanner inteligente**: Detectar si código escaneado es lote o pallet
3. **Vista consolidada**: Mostrar estado de todos los pallets de un lote
4. **Alertas de consistencia**: Validar que pesos cuadren entre lote y pallets

#### **Nuevos Eventos de Pallet:**
- `enfriado_pallet`
- `control_calidad_pallet`  
- `almacenamiento_pallet`
- `consolidacion_pallet` (para pallets mixtos)
- `despacho_pallet`

### 7.7 ⚠️ Puntos Críticos SAG

#### **Cumplimiento Normativo:**
- **Trazabilidad completa**: Poder rastrear desde consumidor final hasta predio de origen
- **Tiempos de cadena fría**: Registro de temperaturas por pallet en cámaras
- **Documentación de tratamientos**: Fumigación, gasificación por pallet
- **Control de residuos**: Análisis por lote, aplicable a todos sus pallets

#### **Casos Especiales:**
- **Pallets mixtos**: Múltiples lotes en un pallet (común en pedidos pequeños)
- **Re-paletizado**: Cambio de embalaje/cliente post-almacenamiento
- **Devoluciones**: Trazabilidad reversa pallet → lote → productor

---

**🎯 OBJETIVO**: Reflejar el flujo real del mercado chileno donde la industria opera a nivel de pallets post-paletizado, manteniendo trazabilidad completa SAG-compliant. 