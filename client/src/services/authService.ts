/**
 * Authentication service for Coacharte Intranet
 * Handles login, logout, and session management with localStorage
 */

// User-related interfaces
export interface User {
  id?: string;
  username: string;
  fullName?: string;
  email?: string;
  role?: string;
}

export interface LoginCredentials {
  username: string; // email
  password: string;
}

// Actualizar AuthResult para incluir los nuevos campos
export interface AuthResult {
  success: boolean;
  message?: string;
  token?: string; // Token de sesión normal
  tempToken?: string; // Token para el cambio de contraseña
  requiresPasswordChange?: boolean;
  user?: {
    id: string;
    email: string;
    // Podrías añadir más campos del usuario si los devuelves y los necesitas
  };
}

const API_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Singleton AuthService class for handling authentication
 */
export class AuthService {
  private static instance: AuthService;
  private currentUser: User | null = null;
  private tokenKey = 'auth_token';
  private userKey = 'auth_user';

  private constructor() {
    // Initialize user from localStorage if exists
    this.loadUserFromStorage();
  }

  /**
   * Get the singleton instance of AuthService
   */
  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Load user data from localStorage
   */
  private loadUserFromStorage(): void {
    try {
      const userJson = localStorage.getItem(this.userKey);
      if (userJson) {
        this.currentUser = JSON.parse(userJson);
      }
    } catch (error) {
      console.error('Failed to load user from localStorage:', error);
      this.currentUser = null;
    }
  }

  /**
   * Authenticate user with credentials
   * @param credentials User login credentials
   * @returns Promise resolving to AuthResult
   */
  public async login(credentials: LoginCredentials): Promise<AuthResult> {
    try {
      const response = await fetch(`${API_URL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: credentials.username, password: credentials.password }),
      });
      const data: AuthResult = await response.json(); // Esperamos que la respuesta coincida con AuthResult
      
      if (data.success) {
        if (data.token && !data.requiresPasswordChange) {
          localStorage.setItem('token', data.token);
          // Opcional: decodificar token para obtener info del usuario si es necesario aquí
        }
        // Si requiresPasswordChange es true, el token principal no se guarda aún.
        // El tempToken será manejado por el componente que llama.
      }
      return data;
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error de conexión o respuesta no válida.';
      return { success: false, message: errorMessage };
    }
  }

  /**
   * Log out the current user
   * @returns Promise resolving to void
   */
  public async logout(): Promise<void> {
    try {
      // In a real app, this might involve an API call to invalidate the token
      
      // Clear local storage
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userKey);
      
      // Clear current user
      this.currentUser = null;
      
      return Promise.resolve();
    } catch (error) {
      console.error('Logout failed:', error);
      return Promise.reject(error);
    }
  }

  /**
   * Check if user is currently logged in
   * @returns boolean indicating login status
   */
  public isLoggedIn(): boolean {
    return !!this.currentUser && !!localStorage.getItem(this.tokenKey);
  }

  /**
   * Get the current logged-in user
   * @returns User object or null if not logged in
   */
  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  /**
   * Get the current authentication token
   * @returns String token or null if not available
   */
  public getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  // Nueva función para establecer la contraseña
  async setNewPassword(email: string, newPassword: string): Promise<AuthResult> {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      const response = await fetch(`${API_URL}/users/set-password`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ email, newPassword }),
      });
      const data: AuthResult = await response.json(); 
      return data;
    } catch (error) {
      console.error('Set new password error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error de conexión o respuesta no válida.';
      return { success: false, message: errorMessage };
    }
  }
};

export default AuthService.getInstance();

