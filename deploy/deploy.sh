#!/bin/bash

# Script de deploy para KimunPulse
# Uso: ./deploy.sh [testing|production]

set -e

ENVIRONMENT=${1:-testing}
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BUILD_DIR="build_${ENVIRONMENT}_${TIMESTAMP}"

echo "🚀 Iniciando deploy para ambiente: $ENVIRONMENT"

# Validar ambiente
if [[ "$ENVIRONMENT" != "testing" && "$ENVIRONMENT" != "production" ]]; then
    echo "❌ Ambiente inválido. Usar: testing o production"
    exit 1
fi

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm ci

# Ejecutar tests
echo "🧪 Ejecutando tests..."
npm run test:ci

# Build para el ambiente específico
echo "🔨 Construyendo para $ENVIRONMENT..."
if [[ "$ENVIRONMENT" == "testing" ]]; then
    npm run build:testing
elif [[ "$ENVIRONMENT" == "production" ]]; then
    npm run build:prod
fi

# Renombrar directorio de build
mv build $BUILD_DIR

echo "✅ Build completado: $BUILD_DIR"

# Aquí agregar comandos específicos de deploy
case $ENVIRONMENT in
    testing)
        echo "🔄 Desplegando a testing..."
        # rsync -avz $BUILD_DIR/ user@testing-server:/var/www/kimunpulse-testing/
        echo "📍 Testing URL: https://testing.kimunpulse.com"
        ;;
    production)
        echo "🔄 Desplegando a producción..."
        # rsync -avz $BUILD_DIR/ user@prod-server:/var/www/kimunpulse/
        echo "📍 Production URL: https://kimunpulse.com"
        ;;
esac

echo "🎉 Deploy completado exitosamente!"
echo "📁 Build guardado en: $BUILD_DIR" 