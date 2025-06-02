import dotenv from 'dotenv';
import axios from 'axios';
import bcrypt from 'bcrypt'; // Importar bcrypt

dotenv.config(); // Asegúrate de que esto se llame para cargar las variables de entorno

// Variables de entorno para la autenticación y configuración de Zoho
const ZOHO_API_URL = process.env.ZOHO_API_URL; // ej. https://www.zohoapis.com/crm/v2/
const ZOHO_CLIENT_ID = process.env.ZOHO_CLIENT_ID;
const ZOHO_CLIENT_SECRET = process.env.ZOHO_CLIENT_SECRET;
const ZOHO_REFRESH_TOKEN = process.env.ZOHO_REFRESH_TOKEN;
const ZOHO_TOKEN_URL = 'https://accounts.zoho.com/oauth/v2/token'; // URL del endpoint de token de Zoho

const SALT_ROUNDS = 10; // Número de rondas de sal para bcrypt

// Almacenamiento en memoria para el access_token y su expiración
let currentAccessToken: string | null = null;
let tokenExpiresAt: number | null = null; // Timestamp de cuándo expira el token

// Comprobación inicial de configuración
if (!ZOHO_API_URL || !ZOHO_CLIENT_ID || !ZOHO_CLIENT_SECRET || !ZOHO_REFRESH_TOKEN) {
  console.error(
    'Error: Faltan variables de entorno críticas para Zoho CRM. ' +
    'Asegúrate de que ZOHO_API_URL, ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, y ZOHO_REFRESH_TOKEN están configuradas en tu archivo .env.'
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

  try {
    const accessToken = await getValidAccessToken(); // Obtener token válido
    const fullUrl = `${ZOHO_API_URL}${path}`; // Construir URL completa

    const response = await axios({
      method,
      url: fullUrl,
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`, // Usar el token obtenido
        'Content-Type': 'application/json',
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
    // Zoho CRM no permite filtrar directamente por email en una sola llamada GET para todos los registros de forma estándar y eficiente.
    // La forma más común es buscar/consultar. Usaremos COQL (CRM Object Query Language) para esto.
    // Documentación de COQL: https://www.zoho.com/crm/developer/docs/api/coql-overview.html

    const query = `select id, Email, Password_Intranet, ${nombreAPICampoPasswordEstablecida} from ${moduleName} where Email = '${email}' limit 1`; // <--- MODIFICADO: Usando la variable actualizada
    
    // El endpoint para COQL es /coql
    const response = await makeZohoAPIRequest('post', '/coql', { select_query: query });

    if (response.data && Array.isArray(response.data) && response.data.length > 0) {
      const collaborator = response.data[0] as ZohoRecord;
      if (collaborator.Password_Intranet && typeof collaborator.Password_Intranet === 'string') {
        const match = await bcrypt.compare(plainPassword, collaborator.Password_Intranet);
        if (match) {
          // No devolver el hash de la contraseña
          const { Password_Intranet, ...collaboratorData } = collaborator;
          return collaboratorData as ZohoRecord; // Devuelve todos los datos, incluido Password_Personalizada_Establecida
        }
      }
    }
    return null; // Email no encontrado o contraseña no coincide
  } catch (error) {
    console.error(`Error verifying collaborator password for email ${email}:`, error);
    // Podrías querer manejar errores específicos de Zoho aquí de forma diferente
    if (error instanceof Error && error.message.includes('INVALID_QUERY')) {
        console.error('COQL Query is invalid. Check module/field names and syntax.');
    }
    return null; // O lanzar el error si prefieres manejarlo más arriba
  }
};

// Nueva función para establecer/actualizar la contraseña de un colaborador por email
export const setCollaboratorPasswordByEmail = async (email: string, newPlainPassword: string): Promise<boolean> => {
  const moduleName = 'Colaboradores';
  const nombreAPICampoPasswordEstablecida = 'Contrasena_Personalizada_Establecida'; // <--- ACTUALIZADO
  try {
    // 1. Encontrar al colaborador por email para obtener su ID
    const query = `select id from ${moduleName} where Email = '${email}' limit 1`;
    const coqlResponse = await makeZohoAPIRequest('post', '/coql', { select_query: query });

    if (!coqlResponse.data || !Array.isArray(coqlResponse.data) || coqlResponse.data.length === 0) {
      console.warn(`Colaborador con email ${email} no encontrado.`);
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
        console.log(`Contraseña para ${email} actualizada y ${nombreAPICampoPasswordEstablecida} establecida a true.`);
        return true;
      } else {
        console.error(`Error al actualizar el registro de Zoho para ${email}:`, result.message, result.details);
        return false;
      }
    } else {
      console.error(`Respuesta inesperada de Zoho al actualizar el registro para ${email}:`, updateResponse);
      return false;
    }
  } catch (error) {
    console.error(`Error al establecer la contraseña y marcar como personalizada para el email ${email}:`, error); // <--- MODIFICADO: Mensaje de log
    return false;
  }
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
