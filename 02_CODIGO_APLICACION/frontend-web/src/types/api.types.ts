// src/types/api.types.ts
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface FriProduccion {
  id: string;
  fecha: string;
  tituloMinero: string;
  municipio: string;
  departamento: string;
  mineral: string;
  cantidadProduccion: number;
  unidadMedida: string;
  coordenadas: string;
  observaciones?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalProduccion: number;
  totalRegalias: number;
  mineralesActivos: number;
  titulosActivos: number;
}