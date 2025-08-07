// ==========================================
// src/hooks/useApi.js - Custom hook para API
// ==========================================

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

export const useApi = (apiCall, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { isConnected } = useSelector(state => state.system);

  const execute = async (...params) => {
    if (!isConnected) {
      setError('Sin conexión a internet');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await apiCall(...params);
      setData(result);
      return result;
    } catch (err) {
      setError(err.message || 'Error en la operación');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (dependencies.length > 0 && dependencies.every(dep => dep != null)) {
      execute();
    }
  }, dependencies);

  return {
    data,
    loading,
    error,
    execute,
    refetch: () => execute(...dependencies)
  };
};
