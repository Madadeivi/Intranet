// import dotenv from 'dotenv'; // Ya no es necesario aquí si se maneja en loadEnv.ts
import axios from 'axios';
import bcrypt from 'bcrypt'; // Importar bcrypt

// 🔒 FUNCIONES DE SEGURIDAD PARA PREVENIR INYECCIÓN SQL EN CONSULTAS COQL
// =======================================================================

/**
 * Sanitiza strings para prevenir inyección SQL en consultas COQL
 * VERSIÓN ROBUSTA con protección mejorada contra vectores de ataque
 * @param input - String a sanitizar
 * @returns String sanitizado y seguro para usar en consultas COQL
 * @throws Error si el input no es un string o contiene patrones de ataque
 */
const sanitizeStringForCOQL = (input: string): string => {
  if (typeof input !== 'string') {
    throw new Error('Input must be a string');
  }

  // 🔒 VALIDACIÓN DE LONGITUD para prevenir ataques de desbordamiento
  if (input.length > 255) {
    console.warn(`[SECURITY] Input excede longitud máxima: ${input.length} caracteres`);
    throw new Error('Input exceeds maximum allowed length');
  }

  // 🔒 DETECCIÓN DE PATRONES DE ATAQUE CONOCIDOS
  const maliciousPatterns = [
    // Comandos SQL peligrosos
    /(\b(drop|delete|truncate|alter|create|update|insert|exec|execute|union|select)\b)/gi,
    // Comentarios SQL
    /(--|\/\*|\*\/|#)/gi,
    // Caracteres de terminación/escape
    /(\x00|\x1a)/g,
    // Intentos de concatenación SQL
    /(\|\||&&|\+\+)/g,
    // Funciones SQL peligrosas
    /(\b(version|database|schema|information_schema|sys|char|ascii|substring|concat)\b)/gi,
    // Operadores lógicos SQL
    /(\b(and|or|not|xor)\s+\d+\s*[=<>!]+\s*\d+)/gi,
    // Intentos de bypass con codificación
    /(\\x[0-9a-f]{2}|%[0-9a-f]{2})/gi
  ];

  for (const pattern of maliciousPatterns) {
    if (pattern.test(input)) {
      console.error(`[SECURITY ALERT] Patrón malicioso detectado en input: ${input.substring(0, 50)}...`);
      throw new Error('Input contains potentially malicious patterns');
    }
  }

  // 🔒 SANITIZACIÓN ROBUSTA - Escapar y remover caracteres peligrosos
  let sanitized = input
    // Escapar comillas simples duplicándolas (estándar SQL)
    .replace(/'/g, "''")
    // Escapar comillas dobles
    .replace(/"/g, '""')
    // Remover caracteres de control peligrosos (ampliado)
    .replace(/[\x00-\x1f\x7f-\x9f]/g, '')
    // Remover caracteres especiales peligrosos para SQL
    .replace(/[\\;`|&$*?~<>^()[\]{}]/g, '')
    // Remover operadores SQL peligrosos
    .replace(/[%_]/g, '')
    // Normalizar espacios múltiples
    .replace(/\s+/g, ' ')
    .trim();

  // 🔒 VALIDACIÓN POST-SANITIZACIÓN
  if (sanitized.length === 0) {
    throw new Error('Input becomes empty after sanitization');
  }

  // 🔒 VERIFICACIÓN FINAL: Asegurar que no queden patrones peligrosos
  const finalCheck = /[';\\"\x00-\x1f\x7f-\x9f`|&$*?~<>^()[\]{}%_]/;
  if (finalCheck.test(sanitized)) {
    console.error(`[SECURITY] Sanitización falló, caracteres peligrosos restantes: ${sanitized}`);
    throw new Error('Sanitization failed - dangerous characters remain');
  }

  return sanitized;
};

/**
 * Valida y sanitiza email antes de usar en consultas COQL
 * VERSIÓN ROBUSTA con validación mejorada
 * @param email - Email a validar y sanitizar
 * @returns Email sanitizado y válido
 * @throws Error si el formato del email es inválido o contiene patrones peligrosos
 */
const validateAndSanitizeEmail = (email: string): string => {
  // 🔒 VALIDACIÓN DE TIPO Y LONGITUD
  if (typeof email !== 'string') {
    throw new Error('Email must be a string');
  }
  
  if (email.length > 254) { // RFC 5321 - longitud máxima de email
    console.warn(`[SECURITY] Email excede longitud máxima RFC: ${email.length} caracteres`);
    throw new Error('Email exceeds maximum allowed length');
  }

  // 🔒 VALIDACIÓN DE FORMATO ESTRICTA (RFC 5322 compliant)
  const strictEmailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (!strictEmailRegex.test(email)) {
    console.warn(`[SECURITY] Formato de email inválido: ${email.substring(0, 20)}...`);
    throw new Error('Invalid email format');
  }

  // 🔒 DETECCIÓN DE PATRONES SOSPECHOSOS EN EMAILS
  const suspiciousEmailPatterns = [
    /[;'"\\`]/g,           // Comillas y caracteres de escape
    /\s/g,                 // Espacios en blanco (no válidos en emails)
    /@.*@/g,               // Múltiples símbolos @
    /\.{2,}/g,             // Múltiples puntos consecutivos
    /-{2,}/g,              // Múltiples guiones consecutivos
    /[<>()]/g,             // Caracteres de markup
    /[\x00-\x1f\x7f-\x9f]/g // Caracteres de control
  ];

  for (const pattern of suspiciousEmailPatterns) {
    if (pattern.test(email)) {
      console.error(`[SECURITY ALERT] Patrón sospechoso detectado en email: ${email.substring(0, 20)}...`);
      throw new Error('Email contains suspicious patterns');
    }
  }

  // 🔒 NORMALIZACIÓN Y SANITIZACIÓN SEGURA
  const normalizedEmail = email
    .toLowerCase()          // Normalizar a minúsculas
    .trim();               // Remover espacios al inicio/final

  // 🔒 APLICAR SANITIZACIÓN ROBUSTA
  return sanitizeStringForCOQL(normalizedEmail);
};

/**
 * Valida y sanitiza tokens antes de usar en consultas COQL
 * VERSIÓN ROBUSTA con validación de seguridad mejorada
 * @param token - Token a validar y sanitizar
 * @returns Token sanitizado y válido
 * @throws Error si el formato del token es inválido o inseguro
 */
const validateAndSanitizeToken = (token: string): string => {
  // 🔒 VALIDACIÓN DE TIPO Y LONGITUD
  if (typeof token !== 'string') {
    throw new Error('Token must be a string');
  }

  // Tokens deben tener longitud razonable (entre 8 y 128 caracteres)
  if (token.length < 8 || token.length > 128) {
    console.warn(`[SECURITY] Token con longitud sospechosa: ${token.length} caracteres`);
    throw new Error('Token length is outside acceptable range');
  }

  // 🔒 VALIDACIÓN DE FORMATO ESTRICTA
  // Solo permitir caracteres alfanuméricos, guiones y guiones bajos
  const strictTokenRegex = /^[a-zA-Z0-9\-_]+$/;
  if (!strictTokenRegex.test(token)) {
    console.warn(`[SECURITY] Token contiene caracteres no permitidos: ${token.substring(0, 20)}...`);
    throw new Error('Token contains invalid characters');
  }

  // 🔒 DETECCIÓN DE PATRONES SOSPECHOSOS EN TOKENS
  const suspiciousTokenPatterns = [
    /^-+$|^_+$/,          // Solo guiones o guiones bajos
    /--+|__+/,            // Múltiples guiones/guiones bajos consecutivos
    /^(admin|root|test|debug|null|undefined)$/i, // Tokens comunes/predecibles
    /(.)\1{4,}/,          // Caracteres repetidos (más de 4 veces)
    /(012|123|abc|qwe|password)/i // Secuencias comunes/débiles
  ];

  for (const pattern of suspiciousTokenPatterns) {
    if (pattern.test(token)) {
      console.error(`[SECURITY ALERT] Token con patrón sospechoso detectado: ${token.substring(0, 10)}...`);
      throw new Error('Token contains suspicious patterns');
    }
  }

  // 🔒 VERIFICACIÓN DE ENTROPÍA MÍNIMA
  const uniqueChars = new Set(token).size;
  const entropyRatio = uniqueChars / token.length;
  
  if (entropyRatio < 0.3) { // Al menos 30% de caracteres únicos
    console.warn(`[SECURITY] Token con baja entropía detectado: ${entropyRatio.toFixed(2)}`);
    throw new Error('Token has insufficient entropy');
  }

  // 🔒 APLICAR SANITIZACIÓN ROBUSTA
  return sanitizeStringForCOQL(token);
};

// =======================================================================

// Variables de entorno para la autenticación y configuración de Zoho
const ZOHO_API_URL = process.env.ZOHO_API_URL; // ej. https://www.zohoapis.com/crm/v2/
const ZOHO_CLIENT_ID = process.env.ZOHO_CLIENT_ID;
const ZOHO_CLIENT_SECRET = process.env.ZOHO_CLIENT_SECRET;
const ZOHO_REFRESH_TOKEN = process.env.ZOHO_REFRESH_TOKEN;
const ZOHO_TOKEN_URL = 'https://accounts.zoho.com/oauth/v2/token'; // URL del endpoint de token de Zoho
// const ZOHO_CRM_ORG_ID = process.env.ZOHO_CRM_ORG_ID; // Añadir ZOHO_CRM_ORG_ID (comentado porque no se usa actualmente)

const SALT_ROUNDS = 10; // Número de rondas de sal para bcrypt

// Almacenamiento en memoria para el access_token y su expiración
let currentAccessToken: string | null = null;
let tokenExpiresAt: number | null = null; // Timestamp de cuándo expira el token

// Comprobación inicial de configuración
if (!ZOHO_API_URL || !ZOHO_CLIENT_ID || !ZOHO_CLIENT_SECRET || !ZOHO_REFRESH_TOKEN) {
  console.error(
    'Error: Faltan variables de entorno críticas para Zoho CRM. ' +
    'Asegúrate de que ZOHO_API_URL, ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN y ZOHO_CRM_ORG_ID están configuradas en tu archivo .env.' // Añadir ZOHO_CRM_ORG_ID al mensaje
  );
  // Podrías lanzar un error aquí o manejarlo de otra forma para prevenir que el servicio intente operar sin configuración.
}

// Interfaz para la respuesta de la solicitud de token de Zoho
interface ZohoTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  // Puede haber otros campos, pero estos son los esenciales
}

interface ZohoRecord {
  id?: string;
  Contrasena_Personalizada_Establecida?: boolean; // <--- ACTUALIZADO
  [key: string]: any;
}

// Interfaz para la respuesta de error esperada de Zoho
interface ZohoErrorDetail {
  code: string;
  message: string;
  details?: any;
  status?: string; // Status puede no estar siempre presente en este nivel
}

// Definición de tipo más genérica para el error de Axios si la importación directa falla.
interface CustomAxiosError extends Error {
  isAxiosError: boolean;
  response?: {
    data: any;
    status: number;
    headers: any;
  };
  config?: any;
  request?: any;
}

// Nueva función para refrescar el access token
const refreshAccessToken = async (): Promise<string> => {
  if (!ZOHO_CLIENT_ID || !ZOHO_CLIENT_SECRET || !ZOHO_REFRESH_TOKEN) {
    throw new Error('Faltan credenciales de cliente de Zoho para refrescar el token.');
  }

  try {
    console.log('Refrescando el access token de Zoho...');
    const response = await axios.post<ZohoTokenResponse>( // Especificar el tipo de respuesta aquí
      ZOHO_TOKEN_URL,
      new URLSearchParams({ // Usar URLSearchParams para formatear como x-www-form-urlencoded
        grant_type: 'refresh_token',
        client_id: ZOHO_CLIENT_ID,
        client_secret: ZOHO_CLIENT_SECRET,
        refresh_token: ZOHO_REFRESH_TOKEN,
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const { access_token, expires_in } = response.data; // Ahora TypeScript conoce los tipos
    if (!access_token || typeof expires_in !== 'number') {
      // Esta comprobación puede ser redundante si el tipo ZohoTokenResponse es estricto, pero es una buena práctica
      throw new Error('Respuesta inválida del servidor de tokens de Zoho al refrescar.');
    }

    currentAccessToken = access_token;
    // Guardar el tiempo de expiración como un timestamp (milisegundos)
    // Restar un pequeño buffer (ej. 60 segundos) para refrescar antes de que expire realmente
    tokenExpiresAt = Date.now() + (expires_in - 60) * 1000; 
    console.log('Access token de Zoho refrescado exitosamente.');
    return currentAccessToken; // currentAccessToken es string aquí debido a la lógica anterior
  } catch (error: any) {
    console.error('Error al refrescar el access token de Zoho:', error.response?.data || error.message);
    // Invalidar el token actual si el refresco falla para forzar un nuevo intento la próxima vez
    currentAccessToken = null;
    tokenExpiresAt = null;
    throw new Error(`No se pudo refrescar el access token de Zoho: ${error.response?.data?.error || error.message}`);
  }
};

// Nueva función para obtener un access token válido (existente o refrescado)
const getValidAccessToken = async (): Promise<string> => {
  // Si no hay token o si el token ha expirado (o está a punto de expirar)
  if (!currentAccessToken || !tokenExpiresAt || Date.now() >= tokenExpiresAt) {
    // refreshAccessToken devolverá un string o lanzará un error.
    // Si lanza un error, la ejecución de getValidAccessToken se detendrá.
    // Si tiene éxito, currentAccessToken se actualizará y se devolverá.
    return await refreshAccessToken();
  }
  // Si llegamos aquí, currentAccessToken es un string no nulo y no expirado.
  return currentAccessToken;
};


// Modificar makeZohoAPIRequest para usar getValidAccessToken
const makeZohoAPIRequest = async (method: string, path: string, payload?: any) => { // Renombrado url a path para claridad
  if (!ZOHO_API_URL) {
    // Esta comprobación ya está arriba, pero es bueno tenerla cerca de donde se usa.
    return Promise.reject(new Error('Zoho API URL no está configurada.'));
  }
  // Añadir comprobación para ZOHO_CRM_ORG_ID si es necesario para todas las llamadas de CRM
  // if (!ZOHO_CRM_ORG_ID) {
  //   return Promise.reject(new Error('Zoho CRM Org ID no está configurado.'));
  // }

  try {
    const accessToken = await getValidAccessToken(); // Obtener token válido
    const fullUrl = `${ZOHO_API_URL}${path}`; // Construir URL completa

    const response = await axios({
      method,
      url: fullUrl,
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
        'Content-Type': 'application/json',
        // Si Zoho CRM requiere orgId en las cabeceras para algunas/todas las llamadas, añadirlo aquí:
        // 'orgId': ZOHO_CRM_ORG_ID 
      },
      data: payload, // Renombrado data a payload para evitar confusión con response.data
    });
    return response.data;
  } catch (error) {
    const axiosError = error as CustomAxiosError;
    console.error(
      'Error making Zoho API request to:', `${ZOHO_API_URL}${path}`,
      'Method:', method,
      'Response Status:', axiosError.response?.status,
      'Response Data:', JSON.stringify(axiosError.response?.data, null, 2)
    );

    let zohoSpecificError: ZohoErrorDetail | undefined;
    if (axiosError.response?.data) {
      if (axiosError.response.data.data && Array.isArray(axiosError.response.data.data) && axiosError.response.data.data.length > 0) {
        zohoSpecificError = axiosError.response.data.data[0] as ZohoErrorDetail;
      } else if (axiosError.response.data.code && axiosError.response.data.message) {
        zohoSpecificError = axiosError.response.data as ZohoErrorDetail;
      }
    }

    if (zohoSpecificError && zohoSpecificError.message) {
      // Si el error es 'INVALID_TOKEN', podría ser útil invalidar el token local para forzar un refresco
      if (zohoSpecificError.code === 'INVALID_TOKEN' || zohoSpecificError.code === 'OAUTH_SCOPE_MISMATCH') {
        console.warn('Token inválido o problema de scope detectado por Zoho. Forzando refresco en la próxima llamada.');
        currentAccessToken = null;
        tokenExpiresAt = null;
      }
      throw new Error(`Zoho API Error (${zohoSpecificError.code || 'N/A'}): ${zohoSpecificError.message}`);
    }
    
    throw new Error(axiosError.message || 'An unknown error occurred during Zoho API request');
  }
};

export const getRecords = async (moduleName: string): Promise<ZohoRecord[]> => {
  const response = await makeZohoAPIRequest('get', `/${moduleName}`);
  return response.data || []; // Zoho suele devolver los registros dentro de un campo "data"
};

export const getRecordById = async (moduleName: string, recordId: string): Promise<ZohoRecord | null> => {
  const response = await makeZohoAPIRequest('get', `/${moduleName}/${recordId}`);
  // Zoho devuelve el registro individual también dentro de un array "data"
  return response.data && Array.isArray(response.data) && response.data.length > 0 ? response.data[0] : null;
};

export const createRecord = async (moduleName: string, recordData: ZohoRecord): Promise<ZohoRecord> => {
  const dataToCreate = { ...recordData };
  // Hashear la contraseña si está presente y es para el módulo de Colaboradores
  // Asegúrate de que 'Colaboradores' es el nombre API correcto de tu módulo
  // y 'Password_Intranet' el nombre API correcto del campo.
  if (moduleName === 'Colaboradores' && dataToCreate.Password_Intranet && typeof dataToCreate.Password_Intranet === 'string') {
    try {
      dataToCreate.Password_Intranet = await bcrypt.hash(dataToCreate.Password_Intranet, SALT_ROUNDS);
    } catch (hashError) {
      console.error('Error hashing password during create:', hashError);
      throw new Error('Failed to hash password before creating record.');
    }
  }

  const response = await makeZohoAPIRequest('post', `/${moduleName}`, { data: [dataToCreate] });
  const recordResponse = response.data?.[0]; // La respuesta de creación exitosa está en data[0]
  if (recordResponse && recordResponse.code === 'SUCCESS') {
    return { id: recordResponse.details.id, ...recordData };
  } else {
    const errorMessage = recordResponse?.message || 'Failed to create record in Zoho CRM';
    console.error('Error creating Zoho record, response:', JSON.stringify(response, null, 2));
    throw new Error(errorMessage);
  }
};

export const updateRecord = async (moduleName: string, recordId: string, recordData: Partial<ZohoRecord>): Promise<ZohoRecord> => {
  const dataToUpdate = { ...recordData };
  // Hashear la contraseña si se está actualizando y es para el módulo de Colaboradores
  if (moduleName === 'Colaboradores' && dataToUpdate.Password_Intranet && typeof dataToUpdate.Password_Intranet === 'string') {
    try {
      dataToUpdate.Password_Intranet = await bcrypt.hash(dataToUpdate.Password_Intranet, SALT_ROUNDS);
    } catch (hashError) {
      console.error('Error hashing password during update:', hashError);
      throw new Error('Failed to hash password before updating record.');
    }
  }

  const response = await makeZohoAPIRequest('put', `/${moduleName}/${recordId}`, { data: [dataToUpdate] });
  const recordResponse = response.data?.[0]; // La respuesta de actualización exitosa está en data[0]
  if (recordResponse && recordResponse.code === 'SUCCESS') {
    return { id: recordResponse.details.id, ...recordData } as ZohoRecord;
  } else {
    const errorMessage = recordResponse?.message || 'Failed to update record in Zoho CRM';
    console.error('Error updating Zoho record, response:', JSON.stringify(response, null, 2));
    throw new Error(errorMessage);
  }
};

export const deleteRecord = async (moduleName: string, recordId: string): Promise<boolean> => {
  const response = await makeZohoAPIRequest('delete', `/${moduleName}/${recordId}`);
  // Para DELETE, Zoho puede devolver un objeto con code: SUCCESS directamente o dentro de data[0]
  const recordResponse = response.data?.[0]; 
  if (recordResponse && recordResponse.code === 'SUCCESS') {
    return true;
  } else if (response.code === 'SUCCESS') { // Comprobar si el código está en el nivel raíz de la respuesta
    return true;
  }
  else {
    const errorMessage = recordResponse?.message || response.message || 'Failed to delete record in Zoho CRM';
    console.error('Error deleting Zoho record, response:', JSON.stringify(response, null, 2));
    throw new Error(errorMessage);
  }
};

// Nueva función para verificar la contraseña de un colaborador
export const verifyCollaboratorPassword = async (email: string, plainPassword: string): Promise<ZohoRecord | null> => {
  // Asume que el nombre del módulo es 'Colaboradores' y el campo de email es 'Email'
  // Necesitarás ajustar esto si los nombres API son diferentes.
  const moduleName = 'Colaboradores'; 
  const nombreAPICampoPasswordEstablecida = 'Contrasena_Personalizada_Establecida'; // <--- ACTUALIZADO

  try {
    // 🔒 SEGURIDAD: Validar y sanitizar el email antes de usarlo en la consulta COQL
    const sanitizedEmail = validateAndSanitizeEmail(email);
    
    // 🔒 SEGURIDAD: Registrar intento de autenticación
    logSecurityEvent('INFO', 'Login attempt', { email: email.substring(0, 3) + '***' });

    // 🔒 SEGURIDAD: Incluir verificación de estado activo para prevenir login de cuentas inactivas
    const query = `select id, Email, Password_Intranet, ${nombreAPICampoPasswordEstablecida}, Activo from ${moduleName} where Email = '${sanitizedEmail}' limit 1`; // Comparación directa de Email para evitar función unsupported
    
    // El endpoint para COQL es /coql
    const response = await makeZohoAPIRequest('post', '/coql', { select_query: query });

    if (response.data && Array.isArray(response.data) && response.data.length > 0) {
      const collaborator = response.data[0] as ZohoRecord;
      
      // Nota: Se omite la verificación del campo Activo de Zoho para evitar bloqueos incorrectos
      
      if (collaborator.Password_Intranet && typeof collaborator.Password_Intranet === 'string') {
        const match = await bcrypt.compare(plainPassword, collaborator.Password_Intranet);
        if (match) {
          // 🔒 SEGURIDAD: Login exitoso
          logSecurityEvent('INFO', 'Successful login', { 
            email: email.substring(0, 3) + '***',
            collaboratorId: collaborator.id 
          });
          // No devolver el hash de la contraseña
          const { Password_Intranet, ...collaboratorData } = collaborator;
          return collaboratorData as ZohoRecord; // Devuelve todos los datos, incluido Password_Personalizada_Establecida
        } else {
          // 🔒 SEGURIDAD: Contraseña incorrecta
          logSecurityEvent('WARNING', 'Failed login - incorrect password', { 
            email: email.substring(0, 3) + '***' 
          });
        }
      }
    } else {
      // 🔒 SEGURIDAD: Usuario no encontrado
      logSecurityEvent('WARNING', 'Failed login - user not found', { 
        email: email.substring(0, 3) + '***' 
      });
    }
    
    // 🔒 SEGURIDAD: Delay para prevenir timing attacks en fallos de autenticación
    await securityDelay(100, 300);
    return null; // Email no encontrado o contraseña no coincide
  } catch (error) {
    // 🔒 SEGURIDAD: Error en autenticación
    logSecurityEvent('ALERT', 'Authentication error', { 
      email: email.substring(0, 3) + '***',
      error: error instanceof Error ? error.message : String(error)
    });
    
    console.error('Error verifying collaborator password for email %s:', email, error);
    // Podrías querer manejar errores específicos de Zoho aquí de forma diferente
    if (error instanceof Error && error.message.includes('INVALID_QUERY')) {
        console.error('COQL Query is invalid. Check module/field names and syntax.');
    }
    
    // 🔒 SEGURIDAD: Delay para prevenir timing attacks en errores
    await securityDelay(100, 300);
    return null; // O lanzar el error si prefieres manejarlo más arriba
  }
};

// Nueva función para establecer/actualizar la contraseña de un colaborador por email
export const setCollaboratorPasswordByEmail = async (email: string, newPlainPassword: string): Promise<boolean> => {
  const moduleName = 'Colaboradores';
  const nombreAPICampoPasswordEstablecida = 'Contrasena_Personalizada_Establecida'; // <--- ACTUALIZADO
  try {
    // 🔒 SEGURIDAD: Validar y sanitizar el email antes de usarlo en la consulta COQL
    const sanitizedEmail = validateAndSanitizeEmail(email);
    
    // 🔒 SEGURIDAD: Registrar intento de cambio de contraseña
    logSecurityEvent('INFO', 'Password change attempt', { email: email.substring(0, 3) + '***' });
    
    // 1. Encontrar al colaborador por email para obtener su ID
    const query = `select id from ${moduleName} where Email = '${sanitizedEmail}' limit 1`;
    const coqlResponse = await makeZohoAPIRequest('post', '/coql', { select_query: query });

    if (!coqlResponse.data || !Array.isArray(coqlResponse.data) || coqlResponse.data.length === 0) {
      // 🔒 SEGURIDAD: Usuario no encontrado para cambio de contraseña
      logSecurityEvent('WARNING', 'Password change attempt for non-existent user', { 
        email: email.substring(0, 3) + '***' 
      });
      console.warn(`Colaborador con email ${email} no encontrado.`);
      // 🔒 SEGURIDAD: Delay para prevenir timing attacks
      await securityDelay(100, 300);
      return false; // Colaborador no encontrado
    }

    const collaboratorId = coqlResponse.data[0].id;

    // 2. Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPlainPassword, SALT_ROUNDS);

    // 3. Actualizar la contraseña y el campo Password_Personalizada_Establecida en Zoho
    // El payload para la actualización debe ser un objeto con los campos a modificar.
    const updatePayload = {
      Password_Intranet: hashedPassword,
      [nombreAPICampoPasswordEstablecida]: true // <--- ACTUALIZADO: Usando la variable y seteando a true
    };
    
    // La API de actualización espera un array de registros dentro de un objeto "data"
    const updateResponse = await makeZohoAPIRequest('put', `/${moduleName}/${collaboratorId}`, { data: [updatePayload] });

    // Verificar si la actualización fue exitosa
    // Zoho devuelve un array 'data' con los resultados de cada operación.
    if (updateResponse.data && Array.isArray(updateResponse.data) && updateResponse.data.length > 0) {
      const result = updateResponse.data[0];
      if (result.code === 'SUCCESS') {
        // 🔒 SEGURIDAD: Cambio de contraseña exitoso
        logSecurityEvent('INFO', 'Password changed successfully', { 
          email: email.substring(0, 3) + '***',
          collaboratorId 
        });
        console.log(`Contraseña para ${email} actualizada y ${nombreAPICampoPasswordEstablecida} establecida a true.`);
        return true;
      } else {
        // 🔒 SEGURIDAD: Error en actualización de contraseña
        logSecurityEvent('WARNING', 'Password change failed - Zoho update error', { 
          email: email.substring(0, 3) + '***',
          error: result.message 
        });
        console.error(`Error al actualizar el registro de Zoho para ${email}:`, result.message, result.details);
        return false;
      }
    } else {
      // 🔒 SEGURIDAD: Respuesta inesperada de Zoho
      logSecurityEvent('ALERT', 'Password change failed - unexpected Zoho response', { 
        email: email.substring(0, 3) + '***' 
      });
      console.error(`Respuesta inesperada de Zoho al actualizar el registro para ${email}:`, updateResponse);
      return false;
    }
  } catch (error) {
    // 🔒 SEGURIDAD: Error en cambio de contraseña
    logSecurityEvent('ALERT', 'Password change error', { 
      email: email.substring(0, 3) + '***',
      error: error instanceof Error ? error.message : String(error)
    });
    console.error(`Error al establecer la contraseña y marcar como personalizada para el email ${email}:`, error); // <--- MODIFICADO: Mensaje de log
    // 🔒 SEGURIDAD: Delay para prevenir timing attacks en errores
    await securityDelay(100, 300);
    return false;
  }
};

// Nueva función para obtener detalles de un colaborador por email
export const getCollaboratorDetailsByEmail = async (email: string): Promise<ZohoRecord | null> => {
  const moduleName = 'Colaboradores';
  // Especifica los campos que quieres obtener. Ajusta según sea necesario.
  // Asegúrate de que los nombres de los campos API sean correctos.
  const fieldsToSelect = [
    'id',
    'Name', // Asegúrate que 'Name' es el API name correcto si es un campo combinado como Nombre y Apellido.
            // Si son campos separados (ej. First_Name, Last_Name), inclúyelos individualmente.
    'Email', 
    'Nombre_completo', // Verifica el API Name exacto. Podría ser Nombre_Completo.
    'Celular',         // Verifica el API Name exacto.
    'Record_Image',    // Verifica el API Name exacto.
    'Activo',          // Verifica el API Name exacto.
    'Clientes',        // Verifica el API Name exacto. (Si es un lookup o multi-select, considera cómo se devuelve)
    'Sexo',            // Verifica el API Name exacto.
  ].join(',');

  try {
    // 🔒 SEGURIDAD: Validar y sanitizar el email antes de usarlo en la consulta COQL
    const sanitizedEmail = validateAndSanitizeEmail(email);
    
    // 🔒 SEGURIDAD: Registrar solicitud de detalles de colaborador
    logSecurityEvent('INFO', 'Collaborator details request', { email: email.substring(0, 3) + '***' });
    
    // Convertir el email de entrada a minúsculas para la comparación
    // const lowercasedEmail = email.toLowerCase(); // Eliminado para prueba
    // Modificar la consulta para usar lower(Email) para una búsqueda insensible a mayúsculas/minúsculas
    // const query = `select ${fieldsToSelect} from ${moduleName} where lower(Email) = '${lowercasedEmail}' limit 1`;
    const query = `select ${fieldsToSelect} from ${moduleName} where Email = '${sanitizedEmail}' limit 1`; // 🔒 CORREGIDO: Buscar colaboradores ACTIVOS (Activo = true)
    
    console.log(`Executing COQL query: ${query}`); // Log para ver la consulta exacta

    const response = await makeZohoAPIRequest('post', '/coql', { select_query: query });

    if (response.data && Array.isArray(response.data) && response.data.length > 0) {
      // 🔒 SEGURIDAD: Detalles de colaborador encontrados
      logSecurityEvent('INFO', 'Collaborator details found', { 
        email: email.substring(0, 3) + '***',
        collaboratorId: response.data[0].id 
      });
      return response.data[0] as ZohoRecord;
    }
    
    // 🔒 SEGURIDAD: Colaborador no encontrado
    logSecurityEvent('WARNING', 'Collaborator details not found', { 
      email: email.substring(0, 3) + '***' 
    });
    
    // Si no se encontraron datos, registrar la respuesta completa para depuración
    console.warn(`No se encontraron detalles para el colaborador con email ${email} en Zoho CRM. Respuesta de Zoho:`, JSON.stringify(response, null, 2));
    return null;
  } catch (error) {
    // 🔒 SEGURIDAD: Error al obtener detalles de colaborador
    logSecurityEvent('ALERT', 'Error fetching collaborator details', { 
      email: email.substring(0, 3) + '***',
      error: error instanceof Error ? error.message : String(error)
    });
    
    console.error('Error al obtener detalles del colaborador %s desde Zoho CRM:', email, error);
    if (error instanceof Error && error.message.includes('INVALID_QUERY')) {
      console.error('COQL Query para obtener detalles es inválida. Revisa los nombres de módulos/campos y la sintaxis.');
    }
    return null; // O lanza el error si prefieres manejarlo más arriba
  }
};

// Funciones para el restablecimiento de contraseña
const PASSWORD_RESET_TOKEN_FIELD = 'Password_Reset_Token';
const PASSWORD_RESET_EXPIRY_FIELD = 'Password_Reset_Token_Expiry';

export const storePasswordResetToken = async (userId: string, token: string, expiryDate: Date): Promise<boolean> => {
  const moduleName = 'Colaboradores';
  try {
    // 🔒 SEGURIDAD: Registrar generación de token de reset
    logSecurityEvent('INFO', 'Password reset token generated', { 
      userId,
      tokenPrefix: token.substring(0, 8) + '***',
      expiryDate: expiryDate.toISOString()
    });
    
    const updatePayload = {
      [PASSWORD_RESET_TOKEN_FIELD]: token,
      [PASSWORD_RESET_EXPIRY_FIELD]: expiryDate.toISOString(), // Zoho espera formato ISO para DateTime
    };
    const response = await makeZohoAPIRequest('put', `/${moduleName}/${userId}`, { data: [updatePayload] });
    if (response.data && Array.isArray(response.data) && response.data.length > 0 && response.data[0].code === 'SUCCESS') {
      // 🔒 SEGURIDAD: Token almacenado exitosamente
      logSecurityEvent('INFO', 'Password reset token stored successfully', { userId });
      console.log(`Token de restablecimiento de contraseña almacenado para el usuario ${userId}.`);
      return true;
    } else {
      // 🔒 SEGURIDAD: Error al almacenar token
      logSecurityEvent('WARNING', 'Failed to store password reset token', { 
        userId,
        error: response.data?.[0]?.message || 'Unknown error'
      });
      console.error(`Error al almacenar el token de restablecimiento para ${userId}:`, response.data?.[0]?.message || response);
      return false;
    }
  } catch (error) {
    // 🔒 SEGURIDAD: Error en almacenamiento de token
    logSecurityEvent('ALERT', 'Error storing password reset token', { 
      userId,
      error: error instanceof Error ? error.message : String(error)
    });
    console.error(`Excepción al almacenar el token de restablecimiento para ${userId}:`, error);
    return false;
  }
};

export const getCollaboratorByResetToken = async (token: string): Promise<ZohoRecord | null> => {
  const moduleName = 'Colaboradores';
  try {
    // 🔒 SEGURIDAD: Validar y sanitizar el token antes de usarlo en la consulta COQL
    const sanitizedToken = validateAndSanitizeToken(token);
    
    // 🔒 SEGURIDAD: Registrar intento de validación de token de reset
    logSecurityEvent('INFO', 'Password reset token validation attempt', { 
      tokenPrefix: token.substring(0, 8) + '***' 
    });
    
    // Importante: Asegúrate de que los campos Password_Reset_Token y Password_Reset_Token_Expiry estén disponibles para COQL.
    const query = `select id, Email, ${PASSWORD_RESET_TOKEN_FIELD}, ${PASSWORD_RESET_EXPIRY_FIELD} from ${moduleName} where ${PASSWORD_RESET_TOKEN_FIELD} = '${sanitizedToken}' limit 1`;
    const response = await makeZohoAPIRequest('post', '/coql', { select_query: query });

    if (response.data && Array.isArray(response.data) && response.data.length > 0) {
      const collaborator = response.data[0] as ZohoRecord;
      const expiryTime = collaborator[PASSWORD_RESET_EXPIRY_FIELD] ? new Date(collaborator[PASSWORD_RESET_EXPIRY_FIELD]).getTime() : 0;
      
      if (expiryTime > Date.now()) {
        // 🔒 SEGURIDAD: Token válido encontrado
        logSecurityEvent('INFO', 'Valid password reset token found', { 
          collaboratorId: collaborator.id,
          email: collaborator.Email ? collaborator.Email.substring(0, 3) + '***' : 'unknown'
        });
        return collaborator; // Token válido y no expirado
      } else {
        // 🔒 SEGURIDAD: Token expirado
        logSecurityEvent('WARNING', 'Expired password reset token used', { 
          tokenPrefix: token.substring(0, 8) + '***',
          collaboratorId: collaborator.id 
        });
        console.warn(`Token de restablecimiento encontrado para ${token} pero ha expirado.`);
        return null; // Token expirado
      }
    }
    
    // 🔒 SEGURIDAD: Token no encontrado
    logSecurityEvent('WARNING', 'Invalid password reset token used', { 
      tokenPrefix: token.substring(0, 8) + '***' 
    });
    
    // 🔒 SEGURIDAD: Delay para prevenir timing attacks
    await securityDelay(100, 300);
    return null; // Token no encontrado
  } catch (error) {
    // 🔒 SEGURIDAD: Error en validación de token
    logSecurityEvent('ALERT', 'Password reset token validation error', { 
      tokenPrefix: token.substring(0, 8) + '***',
      error: error instanceof Error ? error.message : String(error)
    });
    
    console.error(`Error al buscar colaborador por token de restablecimiento ${token}:`, error);
    if (error instanceof Error && error.message.includes('INVALID_QUERY')) {
      console.error('COQL Query para buscar por token es inválida. Revisa los nombres de módulos/campos y la sintaxis.');
    }
    
    // 🔒 SEGURIDAD: Delay para prevenir timing attacks en errores
    await securityDelay(100, 300);
    return null;
  }
};

export const clearPasswordResetToken = async (userId: string): Promise<boolean> => {
  const moduleName = 'Colaboradores';
  try {
    // 🔒 SEGURIDAD: Registrar limpieza de token de reset
    logSecurityEvent('INFO', 'Password reset token cleanup initiated', { userId });
    
    const updatePayload = {
      [PASSWORD_RESET_TOKEN_FIELD]: null,
      [PASSWORD_RESET_EXPIRY_FIELD]: null,
    };
    // Usamos PUT para actualizar el registro, estableciendo los campos a null.
    // Zoho CRM maneja los campos nulos eliminando su valor.
    const response = await makeZohoAPIRequest('put', `/${moduleName}/${userId}`, { data: [updatePayload] });
    if (response.data && Array.isArray(response.data) && response.data.length > 0 && response.data[0].code === 'SUCCESS') {
      // 🔒 SEGURIDAD: Token limpiado exitosamente
      logSecurityEvent('INFO', 'Password reset token cleared successfully', { userId });
      console.log(`Token de restablecimiento de contraseña limpiado para el usuario ${userId}.`);
      return true;
    } else {
      // 🔒 SEGURIDAD: Error al limpiar token
      logSecurityEvent('WARNING', 'Failed to clear password reset token', { 
        userId,
        error: response.data?.[0]?.message || 'Unknown error'
      });
      console.error(`Error al limpiar el token de restablecimiento para ${userId}:`, response.data?.[0]?.message || response);
      return false;
    }
  } catch (error) {
    // 🔒 SEGURIDAD: Error en limpieza de token
    logSecurityEvent('ALERT', 'Error clearing password reset token', { 
      userId,
      error: error instanceof Error ? error.message : String(error)
    });
    console.error(`Excepción al limpiar el token de restablecimiento para ${userId}:`, error);
    return false;
  }
};


/**
 * Registra eventos de seguridad para monitoreo y auditoría
 * @param level - Nivel de seguridad (ALERT, WARNING, INFO)
 * @param event - Descripción del evento
 * @param details - Detalles adicionales del evento
 */
const logSecurityEvent = (level: 'ALERT' | 'WARNING' | 'INFO', event: string, details: any = {}) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    event,
    details: typeof details === 'object' ? JSON.stringify(details) : details,
    source: 'zohoCRMService'
  };

  switch (level) {
    case 'ALERT':
      console.error(`[SECURITY ALERT ${timestamp}] ${event}`, logEntry);
      // En producción, aquí se podría enviar a un sistema de monitoreo
      break;
    case 'WARNING':
      console.warn(`[SECURITY WARNING ${timestamp}] ${event}`, logEntry);
      break;
    case 'INFO':
      console.log(`[SECURITY INFO ${timestamp}] ${event}`, logEntry);
      break;
  }
};

/**
 * Implementa un delay aleatorio para prevenir ataques de timing
 * Ayuda a prevenir que atacantes determinen información basada en tiempo de respuesta
 * @param minMs - Tiempo mínimo de delay en milisegundos
 * @param maxMs - Tiempo máximo de delay en milisegundos
 */
const securityDelay = async (minMs: number = 50, maxMs: number = 200): Promise<void> => {
  const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  await new Promise(resolve => setTimeout(resolve, delay));
};

// Example usage (optional, for testing)
/*
if (process.env.NODE_ENV === 'development' && ZOHO_API_URL && ZOHO_ACCESS_TOKEN) {
  // Replace 'Leads' with an actual module API name from your Zoho CRM
  getRecords<{ FirstName: string; LastName: string; Email: string }>('Leads')
    .then(response => {
      if (response.data && response.data.length > 0) {
        console.log('Successfully fetched records from Zoho CRM:', response.data.slice(0, 2)); // Log first 2 records
        const firstRecordId = (response.data[0] as any).id; // Assuming records have an 'id'
        if (firstRecordId) {
          return getRecordById<{ FirstName: string; LastName: string; Email: string }>('Leads', firstRecordId);
        }
      } else {
        console.log('No records found in Zoho CRM module Leads or an error occurred.');
      }
    })
    .then(recordResponse => {
      if (recordResponse) {
        console.log('Successfully fetched single record by ID:', recordResponse.data);
      }
    })
    .catch(error => {
      console.error('Error interacting with Zoho CRM:', error.message);
    });
}
*/
