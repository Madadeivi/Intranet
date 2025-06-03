#!/bin/bash

echo "🚀 Simulando deployment de Vercel..."

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ No se encontró package.json. Ejecuta desde la raíz del proyecto.${NC}"
    exit 1
fi

echo -e "${YELLOW}📦 Paso 1: Instalando dependencias...${NC}"
npm install

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error instalando dependencias${NC}"
    exit 1
fi

echo -e "${YELLOW}🔍 Paso 2: Verificando archivos que Vercel ignoraría...${NC}"
if [ -f ".vercelignore" ]; then
    echo "✅ .vercelignore encontrado"
    echo "Archivos que se ignorarán:"
    cat .vercelignore | grep -v "^#" | grep -v "^$"
else
    echo -e "${RED}⚠️  No se encontró .vercelignore${NC}"
fi

echo -e "${YELLOW}🔧 Paso 3: Compilando TypeScript (API)...${NC}"
if [ -f "api/index.ts" ]; then
    npx tsc --noEmit api/index.ts
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ API TypeScript compilado correctamente${NC}"
    else
        echo -e "${RED}❌ Error compilando API TypeScript${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ No se encontró api/index.ts${NC}"
    exit 1
fi

echo -e "${YELLOW}🏗️  Paso 4: Ejecutando build de Next.js...${NC}"
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build de Next.js exitoso${NC}"
else
    echo -e "${RED}❌ Error en build de Next.js${NC}"
    exit 1
fi

echo -e "${YELLOW}🧪 Paso 5: Iniciando servidor para testing...${NC}"
echo "Iniciando servidor en http://localhost:3000"
echo "Presiona Ctrl+C para detener"

npm start &
SERVER_PID=$!

# Esperar un momento para que el servidor inicie
sleep 5

echo -e "${YELLOW}🔍 Paso 6: Testing endpoints...${NC}"

# Test health check
echo "Testing /api/health..."
curl -s -f http://localhost:3000/api/health > /dev/null
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ /api/health responde correctamente${NC}"
else
    echo -e "${RED}❌ /api/health no responde${NC}"
fi

# Test main page
echo "Testing página principal..."
curl -s -f http://localhost:3000 > /dev/null
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Página principal responde correctamente${NC}"
else
    echo -e "${RED}❌ Página principal no responde${NC}"
fi

echo -e "${GREEN}🎉 Simulación de deployment completada!${NC}"
echo "El servidor sigue ejecutándose en http://localhost:3000"
echo "Presiona Ctrl+C para detener"

# Mantener el script activo hasta que el usuario lo detenga
wait $SERVER_PID