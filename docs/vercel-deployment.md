# Configuración de Despliegue Vercel - Monorepo

## Estructura del Despliegue

- **Cliente**: Se despliega como sitio estático con Vite
- **API**: Se despliega como función serverless de Node.js

## URLs en Producción

- Cliente: `https://tu-dominio.vercel.app`
- API: `https://tu-dominio.vercel.app/api`
- Health Check: `https://tu-dominio.vercel.app/api/health`

## Variables de Entorno Requeridas

### Para la API
- EMAIL_HOST, EMAIL_PORT, EMAIL_SECURE, EMAIL_USER, EMAIL_PASS, EMAIL_FROM
- ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN, etc.
- JWT_SECRET

### Para el Cliente
- VITE_API_BASE_URL=/api

## Verificación Post-Despliegue

1. Accede a `/api/health` para verificar que la API funciona
2. Prueba el login desde el cliente
3. Verifica que las llamadas a la API funcionen correctamente

## Troubleshooting

- Si las llamadas a la API fallan, verifica VITE_API_BASE_URL
- Si hay errores de CORS, revisa la configuración del servidor
- Los logs de funciones serverless están en Vercel Dashboard > Functions
