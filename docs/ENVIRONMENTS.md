# Configuración de Ambientes - KimunPulse

## 🌍 Ambientes Disponibles

### 1. **Development** (Desarrollo)
- **URL**: `http://localhost:3000`
- **Supabase**: Proyecto principal con datos de desarrollo
- **Features**: Debug activo, herramientas de desarrollo, modo offline
- **Uso**: Desarrollo local y pruebas

### 2. **Testing** (Pruebas)
- **URL**: `https://testing.kimunpulse.com`
- **Supabase**: Mismo proyecto, datos de prueba
- **Features**: Mock data habilitado, sin analytics
- **Uso**: Pruebas de integración y QA

### 3. **Production** (Producción)
- **URL**: `https://kimunpulse.com`
- **Supabase**: Proyecto principal con datos reales
- **Features**: Analytics habilitado, sin debug
- **Uso**: Ambiente de producción

## 🚀 Comandos de Desarrollo

```bash
# Desarrollo
npm start                # Modo desarrollo (por defecto)
npm run start:dev        # Explícitamente desarrollo
npm run start:testing    # Modo testing local

# Builds
npm run build:dev        # Build de desarrollo
npm run build:testing    # Build de testing
npm run build:prod       # Build de producción

# Tests
npm run test:coverage    # Tests con cobertura
npm run test:ci          # Tests para CI/CD

# Deploy
npm run deploy:testing   # Deploy a testing
npm run deploy:prod      # Deploy a producción
```

## 🔧 Configuración

### Detección Automática de Ambiente
El sistema detecta automáticamente el ambiente basado en:

```typescript
const getCurrentEnvironment = (): Environment => {
  const hostname = window.location.hostname;
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'development';
  }
  
  if (hostname.includes('testing') || hostname.includes('staging')) {
    return 'testing';
  }
  
  return 'production';
};
```

### Configuración por Ambiente

#### Development
```typescript
{
  name: 'Desarrollo',
  app: {
    debug: true,
    showDevTools: true,
  },
  features: {
    enableMockData: false,
    enableAnalytics: false,
    enableOfflineMode: true,
  }
}
```

#### Testing
```typescript
{
  name: 'Testing',
  app: {
    debug: true,
    showDevTools: false,
  },
  features: {
    enableMockData: true,
    enableAnalytics: false,
    enableOfflineMode: true,
  }
}
```

#### Production
```typescript
{
  name: 'Producción',
  app: {
    debug: false,
    showDevTools: false,
  },
  features: {
    enableMockData: false,
    enableAnalytics: true,
    enableOfflineMode: false,
  }
}
```

## 📊 Supabase - Gestión de Ambientes

### Estrategia Actual
- **Un solo proyecto**: `kimun-pulse` 
- **Separación por datos**: Diferentes datasets para cada ambiente
- **Headers de identificación**: `X-Environment` y `X-App-Version`

### Configuración de Seguridad (RLS)
```sql
-- Política para separar datos por ambiente
CREATE POLICY "ambiente_separation" ON lotes
FOR ALL USING (
  (current_setting('request.headers')::json->>'x-environment')::text = 'production'
  OR auth.role() = 'service_role'
);
```

### Future: Proyectos Separados
Cuando sea necesario, migrar a:
- `kimun-pulse-production`
- `kimun-pulse-testing`
- `kimun-pulse-development`

## 🔍 Debugging y Monitoreo

### Indicador Visual de Ambiente
- **Badge**: Esquina superior derecha en dev/testing
- **Colores**: 
  - 🔵 Azul: Development
  - 🟡 Amarillo: Testing
  - (Sin badge): Production

### Logs de Configuración
En desarrollo se muestran logs:
```javascript
console.log('🌍 Ambiente actual:', currentEnvironment);
console.log('⚙️ Configuración:', config);
console.log('🔗 Supabase conectado:', {...});
```

## 🛠️ Scripts de Deploy

### Deploy Manual
```bash
# Testing
./deploy/deploy.sh testing

# Production
./deploy/deploy.sh production
```

### Deploy Automático (CI/CD)
```yaml
# GitHub Actions example
- name: Deploy to Testing
  if: github.ref == 'refs/heads/develop'
  run: |
    npm run build:testing
    # Deploy commands

- name: Deploy to Production
  if: github.ref == 'refs/heads/main'
  run: |
    npm run build:prod
    # Deploy commands
```

## 🔐 Variables de Entorno Sensibles

Para datos sensibles, usar variables de entorno del sistema:

```bash
# .env.local (no commitear)
REACT_APP_ANALYTICS_KEY=your-analytics-key
REACT_APP_SENTRY_DSN=your-sentry-dsn
```

## 📝 Mejores Prácticas

1. **Nunca** hardcodear configuraciones
2. **Siempre** usar el sistema de ambientes
3. **Validar** configuración al startup
4. **Separar** datos sensibles en variables de entorno
5. **Testear** en ambiente de testing antes de producción
6. **Monitorear** logs y métricas por ambiente

## 🚨 Troubleshooting

### Problema: Ambiente incorrecto
```bash
# Verificar detección
console.log(window.location.hostname);

# Forzar ambiente (solo desarrollo)
localStorage.setItem('forceEnvironment', 'testing');
```

### Problema: Configuración de Supabase
```bash
# Verificar conexión
console.log(supabase.supabaseUrl);
console.log(supabase.supabaseKey);
```

### Problema: Build falla
```bash
# Limpiar cache
rm -rf node_modules package-lock.json
npm install

# Build verbose
npm run build:dev -- --verbose
``` 