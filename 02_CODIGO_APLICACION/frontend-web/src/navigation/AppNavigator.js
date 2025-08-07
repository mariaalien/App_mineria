// ==========================================
// src/navigation/AppNavigator.js - Navegación principal
// ==========================================

import React, { useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector, useDispatch } from 'react-redux';

import AuthNavigator from './AuthNavigator';
import MainTabNavigator from './MainTabNavigator';
import { checkAuthStatus } from '../store/slices/authSlice';
import LoadingScreen from '../components/LoadingScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, isLoading, user } = useSelector(state => state.auth);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await dispatch(checkAuthStatus());
      } finally {
        setIsInitializing(false);
      }
    };

    initializeAuth();
  }, [dispatch]);

  if (isInitializing || isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated && user ? (
        <Stack.Screen 
          name="MainApp" 
          component={MainTabNavigator}
          options={{ gestureEnabled: false }}
        />
      ) : (
        <Stack.Screen 
          name="Auth" 
          component={AuthNavigator}
          options={{ gestureEnabled: false }}
        />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;