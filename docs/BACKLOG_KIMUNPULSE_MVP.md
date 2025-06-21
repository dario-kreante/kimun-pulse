# 📋 KimunPulse MVP - Backlog Product Management

## 🎯 **Vision del MVP**
Sistema de trazabilidad post-cosecha que cumple 100% con normativa SAG chilena, proporcionando control de calidad, inventarios y reportes automáticos para empresas agrícolas exportadoras.

## 🔥 **Problema Principal**
Las empresas agrícolas chilenas requieren cumplir estricta normativa SAG para exportación, pero carecen de sistemas integrados que manejen trazabilidad, inventarios por ubicación, control de calidad y reportes automáticos de manera eficiente.

---

## 📊 **EPIC 1: Consistencia de Interfaz de Usuario (CRÍTICO)**
**Valor**: Alto | **Esfuerzo**: Bajo | **Dolor**: Alto
**Objetivo**: Unificar la experiencia de usuario entre todas las vistas

### 🔧 User Stories

#### US-001: Unificar UI de Eventos Dashboard y Página
- **Como** operador del sistema
- **Quiero** que los eventos se vean igual en el dashboard y en la página de eventos
- **Para** tener una experiencia consistente y profesional

**Criterios de Aceptación:**
- [ ] Eventos en dashboard usan el mismo diseño que página de eventos (timeline con iconos)
- [ ] Colores e iconos son consistentes en ambas vistas
- [ ] Información mostrada es idéntica (responsable, tiempo relativo, etc.)
- [ ] Navegación entre vistas mantiene contexto

**DoD:**
- [ ] UI identical entre vistas
- [ ] Tests de componentes actualizados
- [ ] Responsivo en mobile

---

## 📦 **EPIC 2: Sistema de Inventarios por Estado/Ubicación (ALTO VALOR)**
**Valor**: Muy Alto | **Esfuerzo**: Alto | **Dolor**: Muy Alto
**Objetivo**: Gestionar inventarios detallados por estado del proceso y ubicación física

### 🔧 User Stories

#### US-002: Inventario por Estado de Lote
- **Como** jefe de operaciones
- **Quiero** ver qué cantidad de producto tengo en cada estado del proceso
- **Para** optimizar flujo y detectar cuellos de botella

**Criterios de Aceptación:**
- [ ] Dashboard muestra inventario por cada estado (En Cosecha, En Packing, etc.)
- [ ] Cantidades se actualizan automáticamente al cambiar estado de lotes
- [ ] Alertas cuando inventario excede capacidad por estado
- [ ] Filtros por cultivo y variedad
- [ ] Exportar inventario a Excel/PDF

#### US-003: Inventario por Tipo de Evento
- **Como** supervisor de calidad
- **Quiero** rastrear productos en eventos específicos (Selección, Control Calidad)
- **Para** asegurar que no se acumulen productos sin procesar

**Criterios de Aceptación:**
- [ ] Vista de inventario por tipo de evento específico
- [ ] Tiempo promedio que productos permanecen en cada evento
- [ ] Alertas por productos que exceden tiempo estándar
- [ ] Drill-down a lotes específicos desde inventario

#### US-004: Reportes de Inventario para SAG
- **Como** encargado de exportaciones
- **Quiero** generar reportes de inventario que cumplan formato SAG
- **Para** facilitar inspecciones y auditorías

**Criterios de Aceptación:**
- [ ] Reporte de inventario actual por ubicación
- [ ] Reporte histórico de movimientos de inventario
- [ ] Formato compatible con requerimientos SAG
- [ ] Firma digital y timestamp en reportes
- [ ] Export automático en formatos requeridos

---

## ❄️ **EPIC 3: Gestión de Cámaras de Frío (ALTO VALOR)**
**Valor**: Alto | **Esfuerzo**: Medio | **Dolor**: Alto
**Objetivo**: Control detallado de cámaras frigoríficas con inventarios específicos

### 🔧 User Stories

#### US-005: Catálogo de Cámaras de Frío
- **Como** administrador del sistema
- **Quiero** gestionar un catálogo de cámaras frigoríficas
- **Para** asignar productos a ubicaciones específicas

**Criterios de Aceptación:**
- [ ] CRUD de cámaras (nombre, capacidad, temperatura objetivo)
- [ ] Estados: Activa, Mantenimiento, Fuera de Servicio
- [ ] Validación de capacidad máxima
- [ ] Integración con sistema de alertas

#### US-006: Inventario por Cámara de Frío
- **Como** operador de cámaras
- **Quiero** ver inventario detallado por cada cámara
- **Para** optimizar uso del espacio y controlar condiciones

**Criterios de Aceptación:**
- [ ] Vista de inventario por cámara específica
- [ ] Porcentaje de ocupación vs capacidad
- [ ] Lista de lotes con fecha de ingreso
- [ ] Tiempo promedio de permanencia
- [ ] Alertas por sobrecarga o productos vencidos

#### US-007: Asignación Automática de Cámaras
- **Como** sistema automático
- **Quiero** asignar lotes a cámaras disponibles
- **Para** optimizar uso de espacio y condiciones de almacenamiento

**Criterios de Aceptación:**
- [ ] Algoritmo de asignación por capacidad disponible
- [ ] Consideración de tipo de cultivo (temperaturas compatibles)
- [ ] Rotación FIFO (First In, First Out)
- [ ] Override manual por operador autorizado

#### US-008: Monitoreo de Condiciones de Cámaras
- **Como** supervisor de calidad
- **Quiero** monitorear condiciones ambientales de cámaras
- **Para** asegurar calidad del producto y cumplimiento SAG

**Criterios de Aceptación:**
- [ ] Registro de temperatura, humedad por cámara
- [ ] Alertas por condiciones fuera de rango
- [ ] Histórico de condiciones por cámara
- [ ] Reporte de eventos críticos (cortes de energía, fallas)
- [ ] Dashboard de estado en tiempo real

---

## 🔬 **EPIC 4: Control de Calidad SAG (CRÍTICO)**
**Valor**: Muy Alto | **Esfuerzo**: Alto | **Dolor**: Muy Alto
**Objetivo**: Sistema completo de control de calidad según normativa SAG

### 🔧 User Stories

#### US-009: Parámetros de Calidad por Cultivo
- **Como** inspector de calidad
- **Quiero** definir parámetros de calidad específicos por cultivo
- **Para** asegurar cumplimiento de estándares SAG

**Criterios de Aceptación:**
- [ ] Catálogo de parámetros por cultivo (calibre, color, defectos)
- [ ] Rangos aceptables y límites críticos
- [ ] Configuración de tolerancias por mercado destino
- [ ] Versionado de parámetros (cambios en normativa)

#### US-010: Registro de Control de Calidad
- **Como** operador de calidad
- **Quiero** registrar resultados de inspecciones de calidad
- **Para** documentar cumplimiento y detectar problemas

**Criterios de Aceptación:**
- [ ] Formulario de inspección por lote
- [ ] Captura de fotos/evidencia
- [ ] Cálculo automático de porcentajes de calidad
- [ ] Estados: Aprobado, Rechazado, Reproceso
- [ ] Trazabilidad de decisiones y responsables

#### US-011: Certificados de Calidad Automáticos
- **Como** encargado de exportaciones
- **Quiero** generar certificados de calidad automáticamente
- **Para** agilizar proceso de exportación

**Criterios de Aceptación:**
- [ ] Generación automática basada en resultados
- [ ] Formato oficial SAG
- [ ] Firma digital del inspector autorizado
- [ ] QR code para verificación
- [ ] Integración con sistema de despacho

#### US-012: Alertas de Calidad
- **Como** jefe de calidad
- **Quiero** recibir alertas por problemas de calidad
- **Para** tomar acciones correctivas inmediatas

**Criterios de Aceptación:**
- [ ] Alertas en tiempo real por lotes rechazados
- [ ] Notificaciones por tendencias negativas
- [ ] Dashboard de indicadores de calidad
- [ ] Escalamiento automático a supervisores

---

## 📈 **EPIC 5: Reportes SAG Automatizados (CRÍTICO)**
**Valor**: Muy Alto | **Esfuerzo**: Medio | **Dolor**: Muy Alto
**Objetivo**: Generación automática de todos los reportes requeridos por SAG

### 🔧 User Stories

#### US-013: Reporte de Trazabilidad Completa
- **Como** auditor SAG
- **Quiero** generar reporte completo de trazabilidad de un lote
- **Para** verificar cumplimiento de proceso

**Criterios de Aceptación:**
- [ ] Historial completo desde origen hasta despacho
- [ ] Incluye todas las evidencias y responsables
- [ ] Formato oficial SAG
- [ ] Generación en < 30 segundos
- [ ] Export PDF y Excel

#### US-014: Reporte de Movimientos de Inventario
- **Como** inspector SAG
- **Quiero** reporte detallado de movimientos de inventario
- **Para** verificar flujos y detectar irregularidades

**Criterios de Aceptación:**
- [ ] Movimientos por fecha, cultivo, ubicación
- [ ] Conciliación de entradas vs salidas
- [ ] Identificación de discrepancias
- [ ] Drill-down a eventos específicos

#### US-015: Dashboard Ejecutivo SAG
- **Como** gerente general
- **Quiero** dashboard con métricas clave para cumplimiento SAG
- **Para** tomar decisiones estratégicas informadas

**Criterios de Aceptación:**
- [ ] KPIs de cumplimiento por cultivo
- [ ] Tendencias de calidad mensual/anual
- [ ] Tiempo promedio de proceso por etapa
- [ ] Alertas por riesgos de no cumplimiento
- [ ] Export automático para reportes corporativos

#### US-016: Integración con Sistema SAG
- **Como** sistema automático
- **Quiero** enviar reportes directamente a plataforma SAG
- **Para** eliminar trabajo manual y errores

**Criterios de Aceptación:**
- [ ] API de integración con sistema SAG
- [ ] Envío automático de reportes requeridos
- [ ] Confirmación de recepción
- [ ] Log de auditoría de envíos
- [ ] Retry automático en caso de fallos

---

## 🔍 **EPIC 6: Trazabilidad hacia Atrás (MEDIO VALOR)**
**Valor**: Medio | **Esfuerzo**: Alto | **Dolor**: Medio
**Objetivo**: Rastrear origen de productos hasta proveedores/campos

### 🔧 User Stories

#### US-017: Registro de Proveedores
- **Como** encargado de compras
- **Quiero** mantener catálogo de proveedores con certificaciones
- **Para** asegurar trazabilidad desde origen

#### US-018: Lotes con Origen Detallado
- **Como** operador
- **Quiero** registrar origen específico de cada lote
- **Para** cumplir requerimientos de trazabilidad completa

#### US-019: Reporte de Trazabilidad hacia Atrás
- **Como** auditor
- **Quiero** rastrear un producto hasta su origen
- **Para** investigar problemas de calidad o contaminación

---

## 🚨 **EPIC 7: Sistema de Alertas y Notificaciones (BAJO VALOR)**
**Valor**: Bajo | **Esfuerzo**: Medio | **Dolor**: Bajo
**Objetivo**: Notificaciones proactivas para optimizar operaciones

### 🔧 User Stories

#### US-020: Alertas de Tiempo de Proceso
- **Como** supervisor
- **Quiero** alertas cuando lotes excedan tiempo estándar
- **Para** evitar deterioro de producto

#### US-021: Notificaciones de Capacidad
- **Como** operador
- **Quiero** alertas cuando cámaras estén cerca de capacidad
- **Para** planificar mejor los ingresos

---

## 📅 **PLANNING & PRIORIZACIÓN**

### **Sprint 1 (2 semanas) - CRÍTICO**
- US-001: Unificar UI Dashboard-Eventos
- US-009: Parámetros de Calidad por Cultivo
- **Valor Entregado**: Experiencia consistente + base para control calidad

### **Sprint 2 (2 semanas) - ALTO VALOR**
- US-002: Inventario por Estado de Lote
- US-005: Catálogo de Cámaras de Frío
- **Valor Entregado**: Visibilidad de inventarios + gestión básica cámaras

### **Sprint 3 (3 semanas) - ALTO VALOR**
- US-006: Inventario por Cámara
- US-010: Registro de Control de Calidad
- US-013: Reporte de Trazabilidad Completa
- **Valor Entregado**: Control total de ubicaciones + calidad básica + reporte principal SAG

### **Sprint 4 (2 semanas) - MEDIO-ALTO VALOR**
- US-003: Inventario por Tipo de Evento
- US-007: Asignación Automática de Cámaras
- US-014: Reporte de Movimientos
- **Valor Entregado**: Optimización de procesos + reportes adicionales SAG

### **Sprint 5 (3 semanas) - MEDIO VALOR**
- US-008: Monitoreo de Condiciones
- US-011: Certificados Automáticos
- US-015: Dashboard Ejecutivo SAG
- **Valor Entregado**: Automatización avanzada + visibilidad ejecutiva

### **Backlog Futuro (Post-MVP)**
- US-016: Integración Sistema SAG
- US-017-019: Trazabilidad hacia Atrás
- US-020-021: Sistema de Alertas

---

## 🎯 **MÉTRICAS DE ÉXITO MVP**

### **Operacionales**
- 100% de lotes con trazabilidad completa
- < 2 minutos para generar cualquier reporte SAG
- 95% precisión en inventarios por ubicación
- 0 rechazos SAG por documentación

### **Usuarios**
- < 30 segundos tiempo para registrar evento
- < 5 clicks para generar reporte
- 90% adopción por operadores
- < 2 horas training requerido

### **Negocio**
- 50% reducción tiempo generación reportes
- 30% mejora en utilización de cámaras
- 100% cumplimiento auditorías SAG
- ROI positivo en 6 meses

---

## 🔧 **DEUDA TÉCNICA IDENTIFICADA**

### **Alta Prioridad**
1. **Inconsistencia UI**: Dashboard vs página eventos (US-001)
2. **Faltan tipos en base de datos**: Cámaras, parámetros calidad
3. **Sin gestión de archivos**: Fotos, certificados, documentos
4. **Performance**: Queries sin optimizar para reportes grandes

### **Media Prioridad**
1. **Testing**: Cobertura < 60%
2. **Documentación**: API sin documentar
3. **Seguridad**: Sin roles y permisos granulares
4. **Monitoring**: Sin métricas de performance

---

## 📋 **DEFINICIÓN DE TERMINADO (DoD)**

### **Para cada User Story**
- [ ] Funcionalidad implementada según criterios
- [ ] Tests unitarios > 80% coverage
- [ ] Tests de integración pasando
- [ ] UI responsive (mobile + desktop)
- [ ] Documentación actualizada
- [ ] Code review aprobado
- [ ] QA testing completado
- [ ] Performance < 2s para acciones críticas

### **Para cada Epic**
- [ ] Todas las US completadas
- [ ] Tests E2E del flujo completo
- [ ] Documentación de usuario
- [ ] Training material creado
- [ ] Métricas de éxito definidas y medibles
- [ ] Plan de rollout definido

---

*Documento creado: Mayo 2025 | Próxima revisión: Cada sprint*
*Responsable Product: Equipo KimunPulse | Stakeholders: SAG, Operaciones, Calidad* 