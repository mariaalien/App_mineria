// =============================================================================
// ✨ SERVICE WORKER - ANM FRI PWA
// Funcionalidad offline, caché inteligente y sincronización
// =============================================================================

const CACHE_NAME = 'anm-fri-v1.0.0';
const OFFLINE_PAGE = '/offline.html';

// Recursos críticos que siempre deben estar en caché
const CRITICAL_CACHE = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  OFFLINE_PAGE
];

// Recursos de datos que se pueden servir desde caché
const DATA_CACHE = 'anm-fri-data-v1';

// URLs que deben funcionar offline
const OFFLINE_URLS = [
  '/',
  '/dashboard',
  '/reportes',
  '/formularios',
  '/analytics'
];

// =============================================================================
// EVENTO INSTALL - Instalación del Service Worker
// =============================================================================

self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Instalando...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Service Worker: Cacheando recursos críticos');
        return cache.addAll(CRITICAL_CACHE);
      })
      .then(() => {
        console.log('✅ Service Worker: Instalación completada');
        // Forzar activación inmediata
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ Service Worker: Error en instalación:', error);
      })
  );
});

// =============================================================================
// EVENTO ACTIVATE - Activación y limpieza de cachés antiguos
// =============================================================================

self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker: Activando...');
  
  event.waitUntil(
    Promise.all([
      // Limpiar cachés antiguos
      cleanupOldCaches(),
      // Tomar control inmediato
      self.clients.claim()
    ]).then(() => {
      console.log('✅ Service Worker: Activación completada');
      notifyClientsOfUpdate();
    })
  );
});

// =============================================================================
// EVENTO FETCH - Interceptar y manejar requests
// =============================================================================

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Solo manejar requests HTTP/HTTPS
  if (!request.url.startsWith('http')) {
    return;
  }

  // Estrategias diferentes según el tipo de recurso
  if (isAPIRequest(url)) {
    // API requests: Network First con fallback a caché
    event.respondWith(handleAPIRequest(request));
  } else if (isStaticResource(url)) {
    // Recursos estáticos: Cache First
    event.respondWith(handleStaticResource(request));
  } else if (isNavigationRequest(request)) {
    // Navegación: Network First con fallback a offline page
    event.respondWith(handleNavigationRequest(request));
  } else {
    // Default: Network First
    event.respondWith(handleDefaultRequest(request));
  }
});

// =============================================================================
// EVENTO MESSAGE - Comunicación con la aplicación
// =============================================================================

self.addEventListener('message', (event) => {
  const { type, payload } = event.data;

  switch (type) {
    case 'CHECK_FOR_UPDATES':
      checkForUpdates();
      break;
    
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
    
    case 'CACHE_DATA':
      cacheOfflineData(payload);
      break;
    
    case 'GET_CACHE_INFO':
      getCacheInfo().then(info => {
        event.ports[0].postMessage({ type: 'CACHE_INFO', payload: info });
      });
      break;

    default:
      console.log('📨 Service Worker: Mensaje no reconocido:', type);
  }
});

// =============================================================================
// EVENTO SYNC - Sincronización en background
// =============================================================================

self.addEventListener('sync', (event) => {
  console.log('🔄 Service Worker: Evento de sincronización:', event.tag);
  
  switch (event.tag) {
    case 'background-sync':
      event.waitUntil(syncOfflineData());
      break;
    
    case 'fri-data-sync':
      event.waitUntil(syncFRIData());
      break;
      
    default:
      console.log('🔄 Service Worker: Tag de sync no reconocido:', event.tag);
  }
});

// =============================================================================
// FUNCIONES DE MANEJO DE REQUESTS
// =============================================================================

async function handleAPIRequest(request) {
  const cacheName = DATA_CACHE;
  
  try {
    // Intentar network first
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cachear respuesta exitosa
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
      console.log('💾 API response cacheada:', request.url);
    }
    
    return networkResponse;
    
  } catch (error) {
    console.log('🔌 Sin conexión, sirviendo desde caché:', request.url);
    
    // Fallback a caché
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Si no hay caché, devolver respuesta offline
    return new Response(
      JSON.stringify({
        error: 'Sin conexión',
        message: 'Los datos no están disponibles offline',
        offline: true,
        timestamp: new Date().toISOString()
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

async function handleStaticResource(request) {
  // Cache first para recursos estáticos
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
    
  } catch (error) {
    console.error('❌ Error cargando recurso estático:', request.url);
    return new Response('Recurso no disponible offline', { 
      status: 404,
      statusText: 'Not Found' 
    });
  }
}

async function handleNavigationRequest(request) {
  try {
    // Network first para navegación
    const networkResponse = await fetch(request);
    return networkResponse;
    
  } catch (error) {
    // Fallback a página offline
    console.log('📱 Sirviendo página offline para:', request.url);
    
    const offlinePage = await caches.match(OFFLINE_PAGE);
    if (offlinePage) {
      return offlinePage;
    }
    
    // Página offline básica si no está cacheada
    return new Response(generateOfflinePage(), {
      status: 200,
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

async function handleDefaultRequest(request) {
  try {
    return await fetch(request);
  } catch (error) {
    const cachedResponse = await caches.match(request);
    return cachedResponse || new Response('No disponible offline', { status: 404 });
  }
}

// =============================================================================
// FUNCIONES HELPER
// =============================================================================

function isAPIRequest(url) {
  return url.pathname.startsWith('/api/');
}

function isStaticResource(url) {
  const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2'];
  return staticExtensions.some(ext => url.pathname.endsWith(ext)) ||
         url.pathname.startsWith('/static/');
}

function isNavigationRequest(request) {
  return request.mode === 'navigate' || 
         (request.method === 'GET' && request.headers.get('accept').includes('text/html'));
}

async function cleanupOldCaches() {
  const cacheNames = await caches.keys();
  const oldCaches = cacheNames.filter(name => 
    name.startsWith('anm-fri-') && name !== CACHE_NAME && name !== DATA_CACHE
  );
  
  console.log('🗑️ Limpiando cachés antiguos:', oldCaches);
  
  return Promise.all(
    oldCaches.map(cacheName => caches.delete(cacheName))
  );
}

function notifyClientsOfUpdate() {
  // Notificar a todos los clientes conectados sobre la actualización
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'SW_UPDATED',
        payload: {
          version: CACHE_NAME,
          timestamp: new Date().toISOString()
        }
      });
    });
  });
}

function checkForUpdates() {
  // Lógica para verificar actualizaciones
  console.log('🔍 Verificando actualizaciones...');
  
  // Aquí podrías hacer una request a tu servidor para verificar nuevas versiones
  // Por ahora, solo notificamos que se verificó
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'UPDATE_CHECK_COMPLETE',
        payload: {
          hasUpdate: false,
          version: CACHE_NAME
        }
      });
    });
  });
}

async function cacheOfflineData(data) {
  try {
    const cache = await caches.open(DATA_CACHE);
    
    // Cachear datos como Response JSON
    const response = new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' }
    });
    
    await cache.put('/offline-data', response);
    console.log('💾 Datos offline cacheados correctamente');
    
  } catch (error) {
    console.error('❌ Error cacheando datos offline:', error);
  }
}

async function getCacheInfo() {
  try {
    const cacheNames = await caches.keys();
    const cacheInfo = {};
    
    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();
      cacheInfo[cacheName] = {
        size: keys.length,
        urls: keys.map(req => req.url)
      };
    }
    
    return cacheInfo;
    
  } catch (error) {
    console.error('❌ Error obteniendo info del caché:', error);
    return {};
  }
}

async function syncOfflineData() {
  console.log('🔄 Sincronizando datos offline...');
  
  try {
    // Obtener datos offline almacenados
    const cache = await caches.open(DATA_CACHE);
    const offlineData = await cache.match('/offline-data');
    
    if (offlineData) {
      const data = await offlineData.json();
      
      // Enviar datos al servidor
      const response = await fetch('/api/sync-offline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        // Eliminar datos offline después de sincronizar
        await cache.delete('/offline-data');
        console.log('✅ Sincronización offline completada');
        
        // Notificar a los clientes
        notifyClientsOfSync(true);
      } else {
        throw new Error('Error en sincronización');
      }
    }
    
  } catch (error) {
    console.error('❌ Error en sincronización offline:', error);
    notifyClientsOfSync(false);
  }
}

async function syncFRIData() {
  console.log('📊 Sincronizando datos FRI...');
  
  try {
    // Lógica específica para sincronizar datos FRI
    const response = await fetch('/api/fri/sync');
    
    if (response.ok) {
      const syncData = await response.json();
      console.log('✅ Datos FRI sincronizados:', syncData);
      
      // Actualizar caché con nuevos datos
      const cache = await caches.open(DATA_CACHE);
      cache.put('/api/fri/latest', response.clone());
      
      notifyClientsOfFRISync(syncData);
    }
    
  } catch (error) {
    console.error('❌ Error sincronizando datos FRI:', error);
  }
}

function notifyClientsOfSync(success) {
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_COMPLETE',
        payload: {
          success,
          timestamp: new Date().toISOString()
        }
      });
    });
  });
}

function notifyClientsOfFRISync(data) {
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'FRI_SYNC_COMPLETE',
        payload: data
      });
    });
  });
}

function generateOfflinePage() {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Sin Conexión - ANM FRI</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: system-ui, -apple-system, sans-serif;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #374151;
        }
        .container {
          text-align: center;
          background: white;
          padding: 48px 32px;
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
          max-width: 480px;
          margin: 20px;
        }
        .icon {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #ef4444, #dc2626);
          border-radius: 50%;
          margin: 0 auto 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 32px;
        }
        h1 {
          font-size: 24px;
          font-weight: bold;
          margin: 0 0 16px 0;
          color: #1f2937;
        }
        p {
          font-size: 16px;
          line-height: 1.6;
          margin: 0 0 32px 0;
          color: #6b7280;
        }
        .features {
          background: #f9fafb;
          border-radius: 12px;
          padding: 20px;
          margin: 24px 0;
        }
        .features h3 {
          font-size: 14px;
          font-weight: 600;
          color: #374151;
          margin: 0 0 12px 0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .features ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .features li {
          padding: 4px 0;
          font-size: 14px;
          color: #6b7280;
        }
        .retry-btn {
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          color: white;
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .retry-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="icon">📡</div>
        <h1>Sin Conexión a Internet</h1>
        <p>No tienes conexión a internet en este momento. Algunas funciones de la aplicación ANM FRI pueden estar limitadas.</p>
        
        <div class="features">
          <h3>Funciones Disponibles Offline</h3>
          <ul>
            <li>• Ver datos previamente cargados</li>
            <li>• Crear borradores de FRI</li>
            <li>• Consultar reportes cacheados</li>
            <li>• Navegar por la aplicación</li>
          </ul>
        </div>
        
        <button class="retry-btn" onclick="window.location.reload()">
          Reintentar Conexión
        </button>
        
        <p style="font-size: 14px; margin-top: 24px; opacity: 0.8;">
          Los cambios se sincronizarán automáticamente cuando recuperes la conexión.
        </p>
      </div>

      <script>
        // Auto retry cuando recupere la conexión
        window.addEventListener('online', () => {
          window.location.reload();
        });
      </script>
    </body>
    </html>
  `;
}

// =============================================================================
// PUSH NOTIFICATIONS (Para futuras implementaciones)
// =============================================================================

self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body || 'Nueva notificación de ANM FRI',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    image: data.image,
    data: data.data,
    actions: [
      { action: 'view', title: 'Ver' },
      { action: 'close', title: 'Cerrar' }
    ],
    requireInteraction: true
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'ANM FRI', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      self.clients.openWindow(event.notification.data?.url || '/')
    );
  }
});

console.log('🎉 Service Worker ANM FRI cargado correctamente');