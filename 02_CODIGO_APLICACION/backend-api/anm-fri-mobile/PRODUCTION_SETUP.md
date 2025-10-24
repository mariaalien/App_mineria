# 🏭 Configuración del Registro de Producción Minera

## 📋 Descripción
Sistema completo para el registro de producción minera con captura automática de ubicación, tiempo y datos de producción.

## 🚀 Características Implementadas

### ✅ Funcionalidades Principales
1. **Formulario de Registro Completo**
   - Información del operador
   - Ubicación con mapa interactivo
   - Datos mineros (título, tipo de mineral, cantidad)
   - Observaciones opcionales

2. **Captura Automática**
   - Hora del dispositivo automática
   - Ubicación GPS automática
   - Validación de coordenadas en Colombia

3. **Funcionalidad de Repetición**
   - Botón para repetir entrada con nueva hora
   - Mantiene la misma información base
   - Registra cada entrada por separado

4. **Sistema de Base de Datos**
   - Tabla `production_entries` en PostgreSQL
   - Relaciones con usuarios
   - Índices para consultas eficientes

## 📦 Dependencias Requeridas

### Mobile App (React Native)
```bash
# Navegación y mapas
npm install @react-navigation/stack @react-navigation/bottom-tabs
npm install react-native-maps
npm install expo-location

# Almacenamiento local
npm install @react-native-async-storage/async-storage

# Iconos
npm install @expo/vector-icons
```

### Backend API
```bash
# Base de datos
npm install @prisma/client
npm install prisma

# Validación
npm install express-validator

# Middleware
npm install cors helmet morgan
```

## 🗄️ Configuración de Base de Datos

### 1. Ejecutar Migración
```bash
cd backend-api
npx prisma migrate dev --name add_production_table
```

### 2. Generar Cliente Prisma
```bash
npx prisma generate
```

## 🔧 Configuración del Servidor

### 1. Variables de Entorno
```env
DATABASE_URL="postgresql://usuario:password@localhost:5432/anm_fri"
SHADOW_DATABASE_URL="postgresql://usuario:password@localhost:5432/anm_fri_shadow"
```

### 2. Iniciar Servidor
```bash
cd backend-api
npm start
```

## 📱 Configuración de la App Móvil

### 1. Permisos de Ubicación
Agregar en `app.json`:
```json
{
  "expo": {
    "permissions": [
      "ACCESS_FINE_LOCATION",
      "ACCESS_COARSE_LOCATION"
    ]
  }
}
```

### 2. Configurar API URL
En `src/services/productionService.js`:
```javascript
const API_BASE_URL = 'http://tu-servidor:3001/api';
```

## 🎯 Uso del Sistema

### 1. Acceso a la Pantalla
- Ir a la pestaña "FRI" en la app
- Presionar "Registro de Producción"

### 2. Llenar Formulario
- **Nombre del Operador**: Nombre completo
- **Ubicación**: Se llena automáticamente con GPS
- **Título Minero**: Número del título
- **Tipo de Mineral**: Oro, carbón, etc.
- **Cantidad**: En toneladas
- **Observaciones**: Opcional

### 3. Seleccionar Ubicación
- Presionar "Seleccionar Ubicación en Mapa"
- El mapa se centra en la ubicación actual
- Tocar en el mapa para seleccionar punto exacto

### 4. Guardar Entrada
- Presionar "Registrar Producción"
- Los datos se guardan en PostgreSQL
- Se muestra confirmación

### 5. Repetir Entrada
- Después del primer guardado, aparece botón "Repetir con Nueva Hora"
- Mantiene la misma información
- Solo cambia la fecha/hora

## 🔍 API Endpoints

### POST /api/production/register
Registra nueva entrada de producción
```json
{
  "nombre_operador": "Juan Pérez",
  "ubicacion": "Mina El Dorado, Antioquia",
  "titulo_minero": "TIT-12345-2024",
  "tipo_mineral": "Oro",
  "cantidad": 15.5,
  "observaciones": "Extracción normal",
  "latitud": 6.2442,
  "longitud": -75.5812,
  "fecha_hora": "2024-01-15T10:30:00Z"
}
```

### GET /api/production/history
Obtiene historial de producción
```
GET /api/production/history?page=1&limit=20&startDate=2024-01-01&endDate=2024-01-31
```

### GET /api/production/stats
Obtiene estadísticas de producción
```
GET /api/production/stats?startDate=2024-01-01&endDate=2024-01-31&groupBy=day
```

## 🛡️ Validaciones Implementadas

### Datos Obligatorios
- Nombre del operador (2-100 caracteres)
- Ubicación (3-200 caracteres)
- Título minero (3-50 caracteres)
- Tipo de mineral (2-50 caracteres)
- Cantidad (número positivo, máximo 10,000 toneladas)
- Coordenadas (latitud/longitud válidas para Colombia)

### Validaciones de Tiempo
- Fecha no puede ser más de 1 hora anterior
- Fecha no puede ser más de 1 semana en el futuro

### Validaciones de Ubicación
- Latitud: -4.5 a 15.5 (Colombia)
- Longitud: -82 a -66 (Colombia)

## 📊 Estructura de Base de Datos

### Tabla: production_entries
```sql
CREATE TABLE production_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_operador VARCHAR(100) NOT NULL,
  ubicacion VARCHAR(200) NOT NULL,
  titulo_minero VARCHAR(50) NOT NULL,
  tipo_mineral VARCHAR(50) NOT NULL,
  cantidad DECIMAL(15,4) NOT NULL,
  observaciones TEXT DEFAULT '',
  latitud DECIMAL(10,8) NOT NULL,
  longitud DECIMAL(11,8) NOT NULL,
  fecha_hora TIMESTAMP NOT NULL,
  es_repeticion BOOLEAN DEFAULT FALSE,
  entrada_anterior_id UUID REFERENCES production_entries(id),
  operador_id UUID NOT NULL REFERENCES usuarios(id),
  saved_offline BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🔄 Funcionalidad Offline

El sistema incluye soporte para trabajo offline:
- Guarda entradas localmente cuando no hay conexión
- Sincroniza automáticamente cuando se restaura la conexión
- Mantiene integridad de datos

## 🎨 Interfaz de Usuario

### Características de UX
- Formulario intuitivo con validación en tiempo real
- Mapa interactivo para selección de ubicación
- Indicadores visuales de estado
- Mensajes de confirmación claros
- Soporte para repetición de entradas

### Responsive Design
- Adaptado para diferentes tamaños de pantalla
- Teclado virtual optimizado
- Navegación fluida entre pantallas

## 🚨 Solución de Problemas

### Error de Ubicación
- Verificar permisos de GPS
- Comprobar que el GPS esté activado
- Probar en ubicación abierta

### Error de Conexión
- Verificar URL del servidor
- Comprobar conectividad de red
- Revisar logs del servidor

### Error de Base de Datos
- Verificar conexión a PostgreSQL
- Ejecutar migraciones pendientes
- Revisar configuración de Prisma

## 📈 Próximas Mejoras

- [ ] Exportación de datos a Excel/PDF
- [ ] Gráficos de producción
- [ ] Notificaciones push
- [ ] Sincronización en tiempo real
- [ ] Reportes automáticos
- [ ] Integración con sistemas ANM

---

**Desarrollado para el Sistema ANM FRI - CTGLOBAL 2025**
