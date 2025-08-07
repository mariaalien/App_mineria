// src/types/auth.types.ts
export interface User {
  id: string;
  email: string;
  nombre: string;
  rol: 'ADMIN' | 'SUPERVISOR' | 'OPERADOR';
  permisos: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    token: string;
    user: User;
  };
  message: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}