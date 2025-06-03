declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      PORT?: string;
      JWT_SECRET: string;
      ZOHO_CLIENT_ID?: string;
      ZOHO_CLIENT_SECRET?: string;
      ZOHO_REFRESH_TOKEN?: string;
      CLIENT_URL?: string;
    }
  }
}

export {};