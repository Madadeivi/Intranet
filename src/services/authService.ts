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
  username: string;
  password: string;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
}

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
      // In a real app, this would be an API call
      // For now, we'll simulate a successful login with a timeout
      
      return new Promise((resolve) => {
        setTimeout(() => {
          // Mock successful login
          const user: User = {
            id: '1',
            username: credentials.username,
            fullName: 'Test User',
            email: `${credentials.username}@coacharte.com`,
            role: 'admin'
          };
          
          const token = 'mock_jwt_token_' + Math.random().toString(36).substring(2);
          
          // Store in localStorage
          localStorage.setItem(this.tokenKey, token);
          localStorage.setItem(this.userKey, JSON.stringify(user));
          
          // Update current user
          this.currentUser = user;
          
          resolve({
            success: true,
            user,
            token
          });
        }, 800); // simulate network delay
      });
    } catch (error) {
      console.error('Login failed:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      };
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
}

// Export a default instance for easier importing
const authService = AuthService.getInstance();
export default authService;

