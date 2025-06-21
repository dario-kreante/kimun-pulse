// Configuración de ambientes para KimunPulse
export type Environment = 'development' | 'testing' | 'production';

export interface EnvironmentConfig {
  name: string;
  supabase: {
    url: string;
    anonKey: string;
  };
  api: {
    baseUrl: string;
    timeout: number;
  };
  app: {
    name: string;
    version: string;
    debug: boolean;
    showDevTools: boolean;
  };
  features: {
    enableMockData: boolean;
    enableAnalytics: boolean;
    enableOfflineMode: boolean;
  };
}

// Configuración base común
const baseConfig = {
  app: {
    version: '1.0.0',
  },
  api: {
    timeout: 10000,
  },
};

// Configuraciones por ambiente
const environments: Record<Environment, EnvironmentConfig> = {
  development: {
    name: 'Desarrollo',
    supabase: {
      url: 'https://etmbspkgeofygcowsylp.supabase.co',
      anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0bWJzcGtnZW9meWdjb3dzeWxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyODczODIsImV4cCI6MjA2Mzg2MzM4Mn0.WU0DMnbx8Ro_AsQ3Y6SqhswLYp-mioLIqkW9rxkbv3M',
    },
    api: {
      baseUrl: 'http://localhost:3000',
      ...baseConfig.api,
    },
    app: {
      name: 'KimunPulse Dev',
      debug: true,
      showDevTools: true,
      ...baseConfig.app,
    },
    features: {
      enableMockData: false,
      enableAnalytics: false,
      enableOfflineMode: true,
    },
  },

  testing: {
    name: 'Testing',
    supabase: {
      // Por ahora usa el mismo proyecto, pero con datos de prueba
      url: 'https://etmbspkgeofygcowsylp.supabase.co',
      anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0bWJzcGtnZW9meWdjb3dzeWxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyODczODIsImV4cCI6MjA2Mzg2MzM4Mn0.WU0DMnbx8Ro_AsQ3Y6SqhswLYp-mioLIqkW9rxkbv3M',
    },
    api: {
      baseUrl: 'https://testing.kimunpulse.com',
      ...baseConfig.api,
    },
    app: {
      name: 'KimunPulse Test',
      debug: true,
      showDevTools: false,
      ...baseConfig.app,
    },
    features: {
      enableMockData: true,
      enableAnalytics: false,
      enableOfflineMode: true,
    },
  },

  production: {
    name: 'Producción',
    supabase: {
      url: 'https://etmbspkgeofygcowsylp.supabase.co',
      anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0bWJzcGtnZW9meWdjb3dzeWxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyODczODIsImV4cCI6MjA2Mzg2MzM4Mn0.WU0DMnbx8Ro_AsQ3Y6SqhswLYp-mioLIqkW9rxkbv3M',
    },
    api: {
      baseUrl: 'https://kimunpulse.com',
      ...baseConfig.api,
    },
    app: {
      name: 'KimunPulse',
      debug: false,
      showDevTools: false,
      ...baseConfig.app,
    },
    features: {
      enableMockData: false,
      enableAnalytics: true,
      enableOfflineMode: false,
    },
  },
};

// Detectar ambiente actual
const getCurrentEnvironment = (): Environment => {
  // Detecta por URL o variable de entorno
  const hostname = window.location.hostname;
  
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('ngrok')) {
    return 'development';
  }
  
  if (hostname.includes('testing') || hostname.includes('staging')) {
    return 'testing';
  }
  
  return 'production';
};

// Obtener configuración del ambiente actual
export const getCurrentConfig = (): EnvironmentConfig => {
  const environment = getCurrentEnvironment();
  return environments[environment];
};

// Exportar ambiente actual
export const currentEnvironment = getCurrentEnvironment();
export const config = getCurrentConfig();

// Helpers para verificar ambiente
export const isDevelopment = () => currentEnvironment === 'development';
export const isTesting = () => currentEnvironment === 'testing';
export const isProduction = () => currentEnvironment === 'production';

// Debug info
if (config.app.debug) {
  console.log('🌍 Ambiente actual:', currentEnvironment);
  console.log('⚙️ Configuración:', config);
} 