// src/store/slices/friSlice.ts - Manejo de datos FRI
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiClient } from '../../services/api';

interface FRIItem {
  id: string;
  tituloMinero: string;
  mineral: string;
  municipio: string;
  tipoReporte: string;
  fechaCorte: string;
  estado?: string;
  createdAt: string;
}

interface FRIState {
  items: FRIItem[];
  isLoading: boolean;
  error: string | null;
  stats: {
    total: number;
    pendientes: number;
    enviados: number;
  };
}

const initialState: FRIState = {
  items: [],
  isLoading: false,
  error: null,
  stats: {
    total: 0,
    pendientes: 0,
    enviados: 0,
  },
};

// Async Thunks para API calls
export const fetchFRIData = createAsyncThunk(
  'fri/fetchData',
  async (tipo: string = 'produccion', { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/fri/${tipo}`);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        return rejectWithValue(response.data.message || 'Error cargando FRI');
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error de conexión');
    }
  }
);

export const createFRI = createAsyncThunk(
  'fri/create',
  async ({ tipo, data }: { tipo: string; data: any }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(`/fri/${tipo}`, data);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        return rejectWithValue(response.data.message || 'Error creando FRI');
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error de conexión');
    }
  }
);

export const fetchFRIStats = createAsyncThunk(
  'fri/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/fri/metadata');
      
      if (response.data.success) {
        return response.data.data;
      } else {
        return rejectWithValue('Error cargando estadísticas');
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error de conexión');
    }
  }
);

const friSlice = createSlice({
  name: 'fri',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    updateStats: (state, action: PayloadAction<Partial<FRIState['stats']>>) => {
      state.stats = { ...state.stats, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch FRI Data
      .addCase(fetchFRIData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFRIData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
        state.stats.total = action.payload.length;
      })
      .addCase(fetchFRIData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create FRI
      .addCase(createFRI.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createFRI.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items.unshift(action.payload);
        state.stats.total += 1;
      })
      .addCase(createFRI.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch Stats
      .addCase(fetchFRIStats.fulfilled, (state, action) => {
        if (action.payload.estadisticas) {
          state.stats = {
            total: action.payload.estadisticas.total_registros || 0,
            pendientes: action.payload.estadisticas.pendientes || 0,
            enviados: action.payload.estadisticas.enviados || 0,
          };
        }
      });
  },
});

export const { clearError, setLoading, updateStats } = friSlice.actions;
export default friSlice.reducer;