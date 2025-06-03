import axios from 'axios';

// Volver a leer las variables de entorno a nivel de módulo global
const ZOHO_DESK_API_URL = process.env.ZOHO_DESK_API_URL;
const ZOHO_CLIENT_ID = process.env.ZOHO_CLIENT_ID;
const ZOHO_CLIENT_SECRET = process.env.ZOHO_CLIENT_SECRET;
const ZOHO_REFRESH_TOKEN = process.env.ZOHO_REFRESH_TOKEN;
const ZOHO_DESK_ORG_ID = process.env.ZOHO_DESK_ORG_ID; 

interface ZohoTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

let accessToken: string | null = null;
let tokenExpiryTime: number | null = null;

/**
 * Obtiene un nuevo token de acceso de Zoho.
 */
async function getZohoAccessToken(): Promise<string> {
  // Usar las constantes del módulo
  if (!ZOHO_REFRESH_TOKEN || !ZOHO_CLIENT_ID || !ZOHO_CLIENT_SECRET) {
    throw new Error('Faltan variables de entorno de Zoho para la autenticación (REFRESH_TOKEN, CLIENT_ID, CLIENT_SECRET).');
  }

  if (accessToken && tokenExpiryTime && Date.now() < tokenExpiryTime) {
    return accessToken;
  }

  try {
    const response = await axios.post<ZohoTokenResponse>(
      'https://accounts.zoho.com/oauth/v2/token', // Endpoint de token de Zoho
      new URLSearchParams({
        refresh_token: ZOHO_REFRESH_TOKEN!,
        client_id: ZOHO_CLIENT_ID!,
        client_secret: ZOHO_CLIENT_SECRET!,
        grant_type: 'refresh_token',
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    accessToken = response.data.access_token;
    tokenExpiryTime = Date.now() + (response.data.expires_in - 300) * 1000;
    
    console.log('Nuevo token de acceso de Zoho obtenido.');
    return accessToken;
  } catch (error: any) { // Simplificado para obtener más detalles del error
    console.error('--- DETALLE ERROR getZohoAccessToken ---');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', JSON.stringify(error.response.headers, null, 2));
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error sin respuesta de Axios:', error.message);
    }
    console.error('--- FIN DETALLE ERROR getZohoAccessToken ---');
    throw new Error('No se pudo obtener el token de acceso de Zoho. Ver consola para detalles.');
  }
}

export enum ZohoDeskTicketPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  URGENT = 'Urgent',
}

export interface TicketContact { // <--- Exportar interfaz
  email: string;
  lastName: string;
  firstName?: string;
  phone?: string;
}

export interface CreateTicketPayload { // <--- Exportar interfaz
  subject: string;
  description: string;
  departmentId: string;
  contact?: TicketContact; // Usar si el contacto no existe o se identifica por email
  contactId?: string; // Usar si el contacto ya existe y se conoce su ID
  priority?: ZohoDeskTicketPriority;
  status?: string;
  // Añade aquí otros campos que necesites según la API de Zoho Desk
}

export interface CreateTicketResponse {
  // Define aquí la estructura esperada de la respuesta de Zoho Desk al crear un ticket
  // Por ejemplo: id, ticketNumber, etc.
  id: string;
  ticketNumber: string;
  webUrl?: string; // <--- Añadir webUrl como opcional
  // ... otros campos
}

/**
 * Crea un nuevo ticket en Zoho Desk.
 * @param ticketData Datos del ticket a crear.
 */
export async function createZohoDeskTicket(ticketData: CreateTicketPayload): Promise<CreateTicketResponse> {
  // Usar las constantes del módulo
  if (!ZOHO_DESK_API_URL) {
    throw new Error('La URL de la API de Zoho Desk no está configurada.');
  }
  if (!ZOHO_DESK_ORG_ID) {
    throw new Error('El ID de la organización de Zoho Desk (ZOHO_DESK_ORG_ID) no está configurado.');
  }

  const token = await getZohoAccessToken();

  try {
    const response = await axios.post<CreateTicketResponse>(
      `${ZOHO_DESK_API_URL}/tickets`,
      ticketData,
      {
        headers: {
          'Authorization': `Zoho-oauthtoken ${token}`,
          'orgId': ZOHO_DESK_ORG_ID, // Usar ZOHO_DESK_ORG_ID
          'Content-Type': 'application/json',
        },
      }
    );
    console.log('Ticket creado en Zoho Desk:', response.data);
    return response.data;
  } catch (error: any) { // Simplificado para obtener más detalles del error
    console.error('--- DETALLE ERROR createZohoDeskTicket ---');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', JSON.stringify(error.response.headers, null, 2));
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error sin respuesta de Axios:', error.message);
    }
    console.error('--- FIN DETALLE ERROR createZohoDeskTicket ---');
    throw new Error('No se pudo crear el ticket en Zoho Desk. Ver consola para detalles.');
  }
}

/**
 * Lista todos los departamentos en Zoho Desk.
 * Esta función es para propósitos de desarrollo para encontrar un departmentId.
 */
export async function listZohoDeskDepartments(): Promise<any> {
  // Usar las constantes del módulo
  if (!ZOHO_DESK_API_URL) {
    throw new Error('La URL de la API de Zoho Desk no está configurada.');
  }
  if (!ZOHO_DESK_ORG_ID) {
    throw new Error('El ID de la organización de Zoho Desk (ZOHO_DESK_ORG_ID) no está configurado.');
  }

  const token = await getZohoAccessToken();
  const requestUrl = `${ZOHO_DESK_API_URL}/departments`;
  console.log('[ZohoDeskService] Intentando llamar a Zoho Desk API en: %s con OrgID: %s', requestUrl, ZOHO_DESK_ORG_ID); // Loguear la URL y OrgID

  try {
    const response = await axios.get(
      requestUrl, // Usar la variable requestUrl
      {
        headers: {
          'Authorization': `Zoho-oauthtoken ${token}`,
          'orgId': ZOHO_DESK_ORG_ID, // Usar ZOHO_DESK_ORG_ID
        },
      }
    );
    console.log('Departamentos de Zoho Desk:');
    console.log(JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error: any) { 
    console.error(
      'Error al listar los departamentos de Zoho Desk:',
      error.response?.status,
      error.response?.data,
      error.message
    );
    throw new Error(
      `Error de Zoho Desk API: ${error.response?.status} ${JSON.stringify(
        error.response?.data
      )} - ${error.message}`
    );
  }
}
