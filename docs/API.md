# API Documentation

## Overview
This document describes the main services and endpoints available in the KimunPulse project. For a visual overview of the database schema, see the diagram in the [README.md](../README.md).

---

## Lotes Service

- `lotesService.obtenerLotesCompletos()`
  - Returns all lots with full information.
- `lotesService.obtenerLotePorId(id)`
  - Returns a specific lot by ID.
- `lotesService.crearLote(lote)`
  - Creates a new lot.
- `lotesService.eliminarLote(loteId, motivo)`
  - Logically deletes a lot.
- `lotesService.restaurarLote(loteId)`
  - Restores a logically deleted lot.

## Eventos Service

- `eventosService.obtenerHistorialLote(loteId)`
  - Returns the event history for a lot.
- `eventosService.agregarEvento(evento)`
  - Adds a new traceability event.
- `eventosService.agregarEventoValidado(...)`
  - Adds a validated event (with sequence validation).
- `eventosService.obtenerEventosRecientes(limite)`
  - Returns recent events.

## Dashboard Service

- `dashboardService.obtenerMetricas()`
  - Returns dashboard metrics.
- `dashboardService.generarReporteLote(loteId)`
  - Generates a full report for a lot.

## Catálogos Service

- `catalogosService.obtenerCultivos()`
- `catalogosService.obtenerVariedades(cultivoId)`
- `catalogosService.obtenerCuarteles()`
- `catalogosService.obtenerUsuarios()`

---

## Error Handling
All API responses follow a consistent error format. See the README for details on error handling and security.

---

## Database Schema Diagram
See the [README.md](../README.md#diagrama-de-entidades-schema) for a Mermaid diagram of the main entities and relationships. 