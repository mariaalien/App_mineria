import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import DashboardScreen from '../screens/dashboard/DashboardScreen';
import NotificationsScreen from '../screens/dashboard/NotificationsScreen';
import StatsDetailScreen from '../screens/dashboard/StatsDetailScreen';

const Stack = createStackNavigator();

const DashboardNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="DashboardMain"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#2563eb',
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: '#ffffff',
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
        cardStyle: { backgroundColor: '#f8fafc' },
      }}
    >
      <Stack.Screen 
        name="DashboardMain" 
        component={DashboardScreen}
        options={{
          title: 'Sistema ANM FRI',
          headerStyle: {
            backgroundColor: 'transparent',
            elevation: 0,
            shadowOpacity: 0,
          },
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="Notifications" 
        component={NotificationsScreen}
        options={{
          title: 'Notificaciones',
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen 
        name="StatsDetail" 
        component={StatsDetailScreen}
        options={{
          title: 'Estadísticas Detalladas',
          headerBackTitleVisible: false,
        }}
      />
    </Stack.Navigator>
  );
};

export default DashboardNavigator;