// ==========================================
// src/services/syncService.js - Servicio de sincronización
// ==========================================

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { friAPI } from './friAPI';

class SyncService {
  constructor() {
    this.isOnline = true;
    this.syncQueue = [];
    this.isSyncing = false;
    
    // Monitorear conexión
    NetInfo.addEventListener(state => {
      this.isOnline = state.isConnected;
      if (this.isOnline && this.syncQueue.length > 0) {
        this.processSyncQueue();
      }
    });
  }

  // Agregar acción a la cola de sincronización
  async addToQueue(action) {
    try {
      const queue = await this.getQueue();
      queue.push({
        ...action,
        id: Date.now(),
        timestamp: new Date().toISOString(),
        retries: 0
      });
      
      await AsyncStorage.setItem('syncQueue', JSON.stringify(queue));
      this.syncQueue = queue;

      // Intentar sincronizar si hay conexión
      if (this.isOnline) {
        this.processSyncQueue();
      }
    } catch (error) {
      console.error('Error adding to sync queue:', error);
    }
  }

  // Obtener cola de sincronización
  async getQueue() {
    try {
      const queue = await AsyncStorage.getItem('syncQueue');
      return queue ? JSON.parse(queue) : [];
    } catch (error) {
      console.error('Error getting sync queue:', error);
      return [];
    }
  }

  // Procesar cola de sincronización
  async processSyncQueue() {
    if (this.isSyncing || !this.isOnline) return;
    
    this.isSyncing = true;
    
    try {
      const queue = await this.getQueue();
      const processedItems = [];
      
      for (const item of queue) {
        try {
          await this.processQueueItem(item);
          processedItems.push(item.id);
        } catch (error) {
          console.error('Error processing queue item:', error);
          
          // Incrementar contador de reintentos
          item.retries = (item.retries || 0) + 1;
          
          // Remover si excede los reintentos máximos
          if (item.retries >= 3) {
            processedItems.push(item.id);
            console.warn('Max retries reached for queue item:', item);
          }
        }
      }
      
      // Remover elementos procesados
      const remainingQueue = queue.filter(item => 
        !processedItems.includes(item.id)
      );
      
      await AsyncStorage.setItem('syncQueue', JSON.stringify(remainingQueue));
      this.syncQueue = remainingQueue;
      
    } catch (error) {
      console.error('Error processing sync queue:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  // Procesar elemento individual de la cola
  async processQueueItem(item) {
    switch (item.type) {
      case 'CREATE_FRI':
        return await friAPI.create(item.data);
        
      case 'UPDATE_FRI':
        return await friAPI.update(item.friId, item.data);
        
      case 'DELETE_FRI':
        return await friAPI.delete(item.friId);
        
      case 'APPROVE_FRI':
        return await friAPI.approve(item.friId, item.data);
        
      case 'REJECT_FRI':
        return await friAPI.reject(item.friId, item.data);
        
      default:
        throw new Error(`Unknown sync action type: ${item.type}`);
    }
  }

  // Sincronización manual
  async manualSync() {
    return new Promise((resolve, reject) => {
      if (!this.isOnline) {
        reject(new Error('Sin conexión a internet'));
        return;
      }
      
      this.processSyncQueue()
        .then(() => resolve({ success: true }))
        .catch(reject);
    });
  }

  // Obtener estado de sincronización
  getSyncStatus() {
    return {
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
      queueLength: this.syncQueue.length,
      lastSync: null // Implementar lógica de última sincronización
    };
  }
}

export const syncService = new SyncService();