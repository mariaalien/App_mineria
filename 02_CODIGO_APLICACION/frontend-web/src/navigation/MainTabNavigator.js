// ==========================================
// src/navigation/MainTabNavigator.js - Navegación principal con tabs
// ==========================================

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform, View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';

import DashboardNavigator from './DashboardNavigator';
import FormularioNavigator from './FormularioNavigator';
import DatosNavigator from './DatosNavigator';
import ReportesNavigator from './ReportesNavigator';
import ProfileNavigator from './ProfileNavigator';

const Tab = createBottomTabNavigator();

const TabBarBackground = () => (
  <LinearGradient
    colors={['#ffffff', '#f8fafc']}
    style={{
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      height: Platform.OS === 'ios' ? 85 : 65,
    }}
  />
);

const TabBarLabel = ({ focused, children }) => (
  <Text
    style={{
      fontSize: 11,
      fontWeight: focused ? '600' : '500',
      color: focused ? '#2563eb' : '#6b7280',
      marginTop: 2,
    }}
  >
    {children}
  </Text>
);

const TabBarIcon = ({ focused, name, size = 24 }) => (
  <View style={{
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
  }}>
    <Icon
      name={name}
      size={size}
      color={focused ? '#2563eb' : '#6b7280'}
    />
    {focused && (
      <View style={{
        position: 'absolute',
        bottom: -8,
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#2563eb',
      }} />
    )}
  </View>
);

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 85 : 65,
          paddingBottom: Platform.OS === 'ios' ? 25 : 10,
          paddingTop: 10,
          backgroundColor: 'transparent',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          elevation: 0,
          shadowOpacity: 0.1,
          shadowRadius: 10,
          shadowColor: '#000',
          shadowOffset: { height: -3, width: 0 },
        },
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#6b7280',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginTop: 2,
        },
      }}
      tabBar={(props) => (
        <View>
          <TabBarBackground />
          <Tab.Navigator.TabBar {...props} />
        </View>
      )}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardNavigator}
        options={{
          tabBarLabel: ({ focused }) => (
            <TabBarLabel focused={focused}>Inicio</TabBarLabel>
          ),
          tabBarIcon: ({ focused }) => (
            <TabBarIcon 
              focused={focused} 
              name={focused ? 'home' : 'home-outline'} 
            />
          ),
        }}
      />
      
      <Tab.Screen 
        name="Formularios" 
        component={FormularioNavigator}
        options={{
          tabBarLabel: ({ focused }) => (
            <TabBarLabel focused={focused}>FRI</TabBarLabel>
          ),
          tabBarIcon: ({ focused }) => (
            <TabBarIcon 
              focused={focused} 
              name={focused ? 'document-text' : 'document-text-outline'} 
            />
          ),
        }}
      />
      
      <Tab.Screen 
        name="Datos" 
        component={DatosNavigator}
        options={{
          tabBarLabel: ({ focused }) => (
            <TabBarLabel focused={focused}>Datos</TabBarLabel>
          ),
          tabBarIcon: ({ focused }) => (
            <TabBarIcon 
              focused={focused} 
              name={focused ? 'grid' : 'grid-outline'} 
            />
          ),
        }}
      />
      
      <Tab.Screen 
        name="Reportes" 
        component={ReportesNavigator}
        options={{
          tabBarLabel: ({ focused }) => (
            <TabBarLabel focused={focused}>Reportes</TabBarLabel>
          ),
          tabBarIcon: ({ focused }) => (
            <TabBarIcon 
              focused={focused} 
              name={focused ? 'bar-chart' : 'bar-chart-outline'} 
            />
          ),
        }}
      />
      
      <Tab.Screen 
        name="Profile" 
        component={ProfileNavigator}
        options={{
          tabBarLabel: ({ focused }) => (
            <TabBarLabel focused={focused}>Perfil</TabBarLabel>
          ),
          tabBarIcon: ({ focused }) => (
            <TabBarIcon 
              focused={focused} 
              name={focused ? 'person' : 'person-outline'} 
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;