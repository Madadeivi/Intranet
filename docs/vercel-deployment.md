# Configuración de Despliegue Vercel - Monorepo

## Estructura del Despliegue

- **Cliente**: Se despliega como sitio estático con Vite
- **API**: Se despliega como función serverless de Node.js

## URLs en Producción

- Cliente: `https://tu-dominio.vercel.app`
- API: `https://tu-dominio.vercel.app/api`
- Health Check: `https://tu-dominio.vercel.app/api/health`

## Variables de Entorno Requeridas

### ⚠️ CRÍTICO: Configuración de Seguridad

**JWT_SECRET** es extremadamente importante para la seguridad:
- **DEBE** tener al menos 32 caracteres de longitud
- **DEBE** ser único y aleatorio 
- **NUNCA** usar valores predecibles como "secret", "password", etc.

#### Generar JWT_SECRET Seguro:
```bash
# Opción 1: Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Opción 2: OpenSSL  
openssl rand -hex 64

# Opción 3: Python
python3 -c "import secrets; print(secrets.token_hex(64))"
```

### Para la API (Todas requeridas en Vercel)
- **JWT_SECRET** - Token de seguridad (generado arriba)
- **EMAIL_HOST** - smtp.gmail.com
- **EMAIL_PORT** - 587
- **EMAIL_SECURE** - false
- **EMAIL_USER** - support@coacharte.mx
- **EMAIL_PASS** - App Password de Gmail
- **ZOHO_API_URL** - https://www.zohoapis.com/crm/v2/
- **ZOHO_CLIENT_ID** - ID de cliente Zoho CRM
- **ZOHO_CLIENT_SECRET** - Secret de cliente Zoho CRM
- **ZOHO_REFRESH_TOKEN** - Token de refresh Zoho CRM
- **ZOHO_DESK_DOMAIN** - coacharte
- **ZOHO_DESK_CLIENT_ID** - ID de cliente Zoho Desk
- **ZOHO_DESK_CLIENT_SECRET** - Secret de cliente Zoho Desk
- **ZOHO_DESK_REFRESH_TOKEN** - Token de refresh Zoho Desk
- **ZOHO_DESK_COACHARTE_DEPARTMENT_ID** - ID del departamento

### Para el Cliente
- **VITE_API_BASE_URL** - /api

## Verificación Post-Despliegue

1. Accede a `/api/health` para verificar que la API funciona
2. Prueba el login desde el cliente
3. Verifica que las llamadas a la API funcionen correctamente

## Troubleshooting

- Si las llamadas a la API fallan, verifica VITE_API_BASE_URL
- Si hay errores de CORS, revisa la configuración del servidor
- Los logs de funciones serverless están en Vercel Dashboard > Functions

## 🔒 Auditoría de Seguridad Completada (Junio 2025)

**Estado:** ✅ **TODAS LAS VULNERABILIDADES CRÍTICAS CORREGIDAS**

### Vulnerabilidades Críticas Corregidas

- ✅ **4 Inyecciones SQL** en `zohoCRMService.ts` completamente mitigadas
- ✅ **Secretos hardcodeados** eliminados de userController.ts y authMiddleware.ts
- ✅ **Validación robusta** de JWT_SECRET implementada
- ✅ **Sanitización de entrada** implementada para todas las consultas COQL

### Funciones de Seguridad Implementadas

- ✅ `sanitizeStringForCOQL()` - Sanitización general para consultas COQL
- ✅ `validateAndSanitizeEmail()` - Validación y sanitización específica para emails
- ✅ `validateAndSanitizeToken()` - Validación y sanitización específica para tokens

### Documentación de Seguridad

- ✅ Reporte completo de auditoría: `docs/security-audit-report.md`
- ✅ Documentación actualizada en `.env.example`
- ✅ Guías de mejores prácticas de seguridad implementadas

**Nivel de Seguridad Actual:** 🟢 **ALTO**

---
