import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const ZOHO_API_URL = process.env.ZOHO_API_URL; // e.g., https://www.zohoapis.com/crm/v2/
const ZOHO_ACCESS_TOKEN = process.env.ZOHO_ACCESS_TOKEN; // OAuth2 Access Token

if (!ZOHO_API_URL || !ZOHO_ACCESS_TOKEN) {
  console.warn('Zoho CRM API URL or Access Token is not configured. Zoho CRM service will not be available.');
}

interface ZohoErrorResponse {
  code: string;
  details: Record<string, unknown>;
  message: string;
  status: string;
}

interface ZohoRecord {
  id?: string;
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

const makeZohoAPIRequest = async (method: string, url: string, data?: any) => {
  if (!ZOHO_API_URL || !ZOHO_ACCESS_TOKEN) {
    // Devolver una promesa rechazada explícitamente o lanzar un error
    return Promise.reject(new Error('Zoho API URL or Access Token not configured in environment variables.'));
  }
  try {
    const response = await axios({
      method,
      url: `${ZOHO_API_URL}${url}`,
      headers: {
        Authorization: `Zoho-oauthtoken ${ZOHO_ACCESS_TOKEN}`,
        'Content-Type': 'application/json', // Asegurar que el content type sea json
      },
      data,
    });
    return response.data;
  } catch (error) {
    const axiosError = error as CustomAxiosError; // Usar el tipo renombrado
    console.error(
      'Error making Zoho API request to:', `${ZOHO_API_URL}${url}`,
      'Method:', method,
      'Response Status:', axiosError.response?.status,
      'Response Data:', JSON.stringify(axiosError.response?.data, null, 2) // Stringify para mejor visualización
    );

    // Intentar extraer un mensaje de error más específico de la respuesta de Zoho
    // La estructura de error de Zoho puede variar.
    // A veces el error principal está en response.data directamente, otras en response.data.data[0]
    let zohoSpecificError: ZohoErrorDetail | undefined;
    if (axiosError.response?.data) {
      if (axiosError.response.data.data && Array.isArray(axiosError.response.data.data) && axiosError.response.data.data.length > 0) {
        zohoSpecificError = axiosError.response.data.data[0] as ZohoErrorDetail;
      } else if (axiosError.response.data.code && axiosError.response.data.message) {
        // Caso donde el error está directamente en response.data
        zohoSpecificError = axiosError.response.data as ZohoErrorDetail;
      }
    }

    if (zohoSpecificError && zohoSpecificError.message) {
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
  const response = await makeZohoAPIRequest('post', `/${moduleName}`, { data: [recordData] });
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
  const response = await makeZohoAPIRequest('put', `/${moduleName}/${recordId}`, { data: [recordData] });
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
