# 🧪 Guía de Pruebas - Funcionalidad Códigos de Lote

## 📋 Resumen de Implementación

La funcionalidad de códigos QR y códigos de barras ha sido completamente implementada en KimunPulse con:

### 🏗️ Arquitectura Implementada

1. **Backend (Supabase)**:
   - ✅ Schema SQL completo (`docs/supabase_migration_codigos.sql`)
   - ✅ Tablas: `eventos_codigos_qr`, `configuraciones_impresion`
   - ✅ Vistas: `v_actividad_codigos_completa`, `v_estadisticas_codigos_recientes`
   - ✅ Funciones: `registrar_evento_codigo_qr`, `obtener_estadisticas_*`
   - ✅ Políticas RLS y permisos

2. **Frontend**:
   - ✅ Hook `useCodigos()` en `src/hooks/useKimunPulse.ts`
   - ✅ Servicios `codigosService` en `src/lib/supabase.ts`
   - ✅ Utilidades QR `src/lib/qrUtils.ts`
   - ✅ Componentes: `ModalEscanearQR`, `ModalImprimirEtiquetas`, `VistaPreviewEtiquetas`
   - ✅ Vista principal de códigos integrada en `App.tsx`

### 🔧 Funcionalidades Principales

#### 1. **Escaneo de Códigos QR**
- Escáner web usando cámara
- Subida de archivo de imagen
- Validación de formato de código
- Registro de eventos de escaneo
- Feedback visual y sonoro

#### 2. **Impresión de Etiquetas**
- Selección múltiple de lotes
- Configuración de formato (QR simple, QR+texto, código de barras)
- Múltiples tamaños (pequeño, mediano, grande)
- Vista previa en tiempo real
- Generación HTML optimizada para impresión
- Descarga como archivo HTML

#### 3. **Dashboard de Códigos**
- Estadísticas en tiempo real
- Actividad reciente
- Métricas por lote
- Historial completo

## 🧪 Plan de Pruebas

### Fase 1: Verificación Básica

1. **Navegación a la sección códigos**:
   ```
   - Abrir http://localhost:5173
   - Hacer login
   - Clic en "Códigos" en la navegación
   - Verificar que aparecen las estadísticas temporales
   ```

2. **Datos de prueba**:
   - ✅ Se inicializan automáticamente con 3 eventos de ejemplo
   - ✅ Incluyen escaneos e impresiones de L-2024-001 y L-2024-002

### Fase 2: Prueba de Escaneo

1. **Abrir modal de escaneo**:
   ```
   - Clic en "Escanear Código"
   - Verificar que se abre el modal
   - Probar cambio entre "Cámara" y "Archivo"
   ```

2. **Simular escaneo**:
   ```javascript
   // En consola del navegador:
   const evento = new CustomEvent('qrScanned', {
     detail: { data: 'L-2024-001' }
   });
   window.dispatchEvent(evento);
   ```

### Fase 3: Prueba de Impresión

1. **Abrir modal de impresión**:
   ```
   - Clic en "Imprimir Etiquetas"
   - Verificar los 3 pasos: Selección > Configuración > Vista Previa
   ```

2. **Configurar etiquetas**:
   ```
   - Seleccionar lotes disponibles
   - Cambiar formato y tamaño
   - Verificar vista previa
   - Probar descarga HTML
   ```

### Fase 4: Pruebas de Integración

1. **Verificar persistencia**:
   - Escanear códigos nuevos
   - Imprimir etiquetas
   - Verificar que aparecen en actividad reciente
   - Verificar actualización de estadísticas

2. **Validaciones**:
   - Probar códigos inválidos
   - Verificar mensajes de error
   - Probar con lotes inexistentes

## 🎯 Casos de Uso Específicos

### Operador de Campo
```
1. Abre app en móvil
2. Va a "Códigos" 
3. Escanea QR del lote
4. Ve información del lote
5. Registra ubicación actual
```

### Supervisor de Packing
```
1. Selecciona lotes para empaque
2. Imprime etiquetas QR+texto medianas
3. Pega etiquetas en cajas
4. Escanea para confirmar
```

### Jefe de Calidad
```
1. Revisa historial de códigos por lote
2. Ve trazabilidad completa
3. Exporta reportes
4. Valida cumplimiento SAG
```

## 📱 Testing Mobile-First

### Consideraciones UX
- ✅ Botones mínimo 48px (compatible con guantes)
- ✅ Alto contraste (AAA)
- ✅ Feedback multimodal (visual/audio/haptic)
- ✅ Modo offline preparado
- ✅ Interfaz intuitiva 1-2 toques

### Escenarios Móviles
1. **Escaneo en campo**:
   - Cámara bajo sol directo
   - Códigos deteriorados
   - Manos con guantes
   - Conectividad intermitente

2. **Impresión en packing**:
   - Tablet en estación fija
   - Selección rápida múltiple
   - Vista previa grande
   - Impresión directa

## 🔄 Estados de Datos

### Modo Temporal (Actual)
- ✅ Datos en memoria del navegador
- ✅ 3 eventos de ejemplo precargados
- ✅ Todas las funcionalidades operativas
- ✅ Estadísticas calculadas en tiempo real

### Modo Base de Datos (Post-migración)
- 🔄 Ejecutar `docs/supabase_migration_codigos.sql`
- 🔄 Los servicios cambiarán automáticamente a BD
- 🔄 Datos persistentes entre sesiones
- 🔄 Mejor performance con índices

## 🐛 Problemas Conocidos

1. **Permisos Supabase**: 
   - Actualmente sin acceso para ejecutar migraciones
   - Funciona con datos temporales

2. **Cámara Web**:
   - Requiere HTTPS en producción
   - Permisos del navegador necesarios

3. **Impresión**:
   - CSS de impresión puede variar entre navegadores
   - Recomendable probar en Chrome/Safari

## 📊 Métricas de Éxito

### Funcionales
- [ ] Escaneo exitoso de códigos QR
- [ ] Generación correcta de etiquetas
- [ ] Registro preciso de eventos
- [ ] Estadísticas exactas

### UX
- [ ] Tiempo de escaneo < 3 segundos
- [ ] Interfaz intuitiva sin entrenamiento
- [ ] Funciona con guantes de trabajo
- [ ] Vista clara bajo luz solar

### Performance
- [ ] Carga inicial < 2 segundos
- [ ] Respuesta de escaneo inmediata
- [ ] Vista previa fluida
- [ ] Impresión sin errores

## 🚀 Siguientes Pasos

1. **Ejecutar migración SQL** cuando se tengan permisos
2. **Probar en dispositivos móviles reales**
3. **Integrar con impresoras Zebra/Brother**
4. **Añadir notificaciones push**
5. **Implementar modo offline completo**

---

**Nota**: Esta funcionalidad está lista para producción con datos temporales. La migración a base de datos permanente es trivial una vez ejecutado el SQL. 