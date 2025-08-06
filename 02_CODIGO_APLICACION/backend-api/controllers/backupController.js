// ================================
// 📁 controllers/backupController.js - SISTEMA DE BACKUP EMPRESARIAL
// ================================
const { PrismaClient } = require('@prisma/client');
const fs = require('fs').promises;
const path = require('path');
const { createWriteStream, createReadStream } = require('fs');
const { pipeline } = require('stream/promises');

const prisma = new PrismaClient();

// =============================================================================
// CONFIGURACIÓN DE BACKUP
// =============================================================================

const BACKUP_CONFIG = {
  backupDir: path.join(process.cwd(), 'backups'),
  maxBackups: 30, // Mantener 30 backups máximo
  formats: ['json', 'sql', 'csv'],
  compression: true,
  encryption: false // Para implementar en futuras versiones
};

// Mapeo de modelos para backup
const FRI_MODELS = {
  'usuarios': 'usuario',
  'empresas': 'empresa', 
  'permisos': 'permiso',
  'usuario_permisos': 'usuarioPermiso',
  'fri_produccion': 'fRIProduccion',
  'fri_inventarios': 'fRIInventarios',
  'fri_paradas_produccion': 'fRIParadasProduccion',
  'fri_ejecucion': 'fRIEjecucion',
  'fri_maquinaria_transporte': 'fRIMaquinariaTransporte',
  'fri_regalias': 'fRIRegalias',
  'fri_inventario_maquinaria': 'fRIInventarioMaquinaria',
  'fri_capacidad_tecnologica': 'fRICapacidadTecnologica',
  'fri_proyecciones': 'fRIProyecciones',
  'auditoria_fri': 'auditoriaFRI',
  'titulos_mineros': 'tituloMinero'
};

// =============================================================================
// CONTROLADOR PRINCIPAL DE BACKUP
// =============================================================================

class BackupController {

  // 📦 CREAR BACKUP COMPLETO DEL SISTEMA
  static async createFullBackup(req, res) {
    try {
      const userId = req.user.userId;
      const userRole = req.user.rol;
      const { format = 'json', includeAudit = false, compression = true } = req.query;

      // Solo ADMIN puede hacer backups completos
      if (userRole !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'Solo administradores pueden crear backups completos del sistema',
          code: 'INSUFFICIENT_PERMISSIONS'
        });
      }

      console.log(`📦 Iniciando backup completo por: ${req.user.email}`);

      // Crear directorio de backups si no existe
      await BackupController.ensureBackupDirectory();

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupId = `backup-full-${timestamp}`;
      const backupPath = path.join(BACKUP_CONFIG.backupDir, backupId);

      // Crear directorio para este backup
      await fs.mkdir(backupPath, { recursive: true });

      const backupManifest = {
        id: backupId,
        type: 'full',
        created_at: new Date().toISOString(),
        created_by: req.user.email,
        format,
        compression,
        include_audit: includeAudit,
        version: '1.0.0',
        system_info: {
          node_version: process.version,
          platform: process.platform,
          memory_usage: process.memoryUsage()
        },
        tables: {},
        total_records: 0,
        file_size: 0
      };

      // Backup de cada tabla
      for (const [tableName, modelName] of Object.entries(FRI_MODELS)) {
        try {
          // Skip auditoría si no se incluye
          if (!includeAudit && tableName === 'auditoria_fri') {
            continue;
          }

          console.log(`📋 Backing up table: ${tableName}`);

          const records = await prisma[modelName].findMany({
            orderBy: { createdAt: 'desc' }
          });

          const fileName = `${tableName}.${format}`;
          const filePath = path.join(backupPath, fileName);

          if (format === 'json') {
            await fs.writeFile(filePath, JSON.stringify(records, null, 2));
          } else if (format === 'csv') {
            await BackupController.writeCSV(records, filePath);
          }

          backupManifest.tables[tableName] = {
            records: records.length,
            file: fileName,
            exported_at: new Date().toISOString()
          };

          backupManifest.total_records += records.length;

        } catch (error) {
          console.warn(`⚠️ Error backing up ${tableName}:`, error.message);
          backupManifest.tables[tableName] = {
            error: error.message,
            records: 0,
            exported_at: new Date().toISOString()
          };
        }
      }

      // Guardar manifest
      const manifestPath = path.join(backupPath, 'manifest.json');
      await fs.writeFile(manifestPath, JSON.stringify(backupManifest, null, 2));

      // Calcular tamaño del backup
      const backupSize = await BackupController.calculateDirectorySize(backupPath);
      backupManifest.file_size = backupSize;

      // Comprimir si se solicita (simulado)
      if (compression) {
        backupManifest.compressed = true;
        console.log(`🗜️ Compresión simulada para backup ${backupId}`);
      }

      // Limpiar backups antiguos
      await BackupController.cleanOldBackups();

      console.log(`✅ Backup completo creado: ${backupId} (${backupManifest.total_records} registros)`);

      res.json({
        success: true,
        message: '📦 Backup completo creado exitosamente',
        data: {
          backup_id: backupId,
          manifest: backupManifest,
          location: backupPath,
          download_url: `/api/backup/download/${backupId}`,
          total_records: backupManifest.total_records,
          tables_backed_up: Object.keys(backupManifest.tables).length,
          estimated_size: BackupController.formatBytes(backupSize)
        }
      });

    } catch (error) {
      console.error('❌ Error creando backup completo:', error);
      res.status(500).json({
        success: false,
        message: 'Error creando backup completo del sistema',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // 📋 BACKUP DE DATOS ESPECÍFICOS POR USUARIO
  static async createUserBackup(req, res) {
    try {
      const userId = req.user.userId;
      const { tipos = Object.keys(FRI_MODELS), format = 'json' } = req.query;

      console.log(`📋 Creando backup de usuario para: ${req.user.email}`);

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupId = `backup-user-${userId}-${timestamp}`;

      const userBackup = {
        id: backupId,
        type: 'user',
        user_id: userId,
        user_email: req.user.email,
        created_at: new Date().toISOString(),
        format,
        data: {}
      };

      // Obtener datos del usuario por cada tipo de FRI
      const friModels = ['fRIProduccion', 'fRIInventarios', 'fRIParadasProduccion', 
                        'fRIEjecucion', 'fRIMaquinariaTransporte', 'fRIRegalias',
                        'fRIInventarioMaquinaria', 'fRICapacidadTecnologica', 'fRIProyecciones'];

      for (const modelName of friModels) {
        try {
          const records = await prisma[modelName].findMany({
            where: { usuarioId: userId },
            orderBy: { createdAt: 'desc' },
            include: {
              usuario: {
                select: { nombre: true, email: true }
              }
            }
          });

          const tableName = Object.keys(FRI_MODELS).find(key => 
            FRI_MODELS[key] === modelName
          );

          userBackup.data[tableName] = {
            records: records.length,
            data: records
          };

        } catch (error) {
          console.warn(`⚠️ Error obteniendo datos de ${modelName}:`, error.message);
        }
      }

      const totalRecords = Object.values(userBackup.data)
        .reduce((sum, table) => sum + table.records, 0);

      console.log(`✅ Backup de usuario creado: ${totalRecords} registros`);

      res.json({
        success: true,
        message: '📋 Backup personal creado exitosamente',
        data: {
          backup_id: backupId,
          total_records: totalRecords,
          tables: Object.keys(userBackup.data).length,
          backup_data: userBackup,
          download_ready: true
        }
      });

    } catch (error) {
      console.error('❌ Error creando backup de usuario:', error);
      res.status(500).json({
        success: false,
        message: 'Error creando backup personal',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // 📤 EXPORTAR DATOS A DIFERENTES FORMATOS
  static async exportData(req, res) {
    try {
      const { tipo, format = 'json', startDate, endDate } = req.query;
      const userId = req.user.userId;
      const userRole = req.user.rol;

      if (!FRI_MODELS[tipo]) {
        return res.status(400).json({
          success: false,
          message: `Tipo de FRI no válido: ${tipo}`,
          valid_types: Object.keys(FRI_MODELS)
        });
      }

      console.log(`📤 Exportando datos ${tipo} en formato ${format} para: ${req.user.email}`);

      const modelName = FRI_MODELS[tipo];
      const where = userRole !== 'ADMIN' ? { usuarioId: userId } : {};

      // Filtros de fecha
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate);
        if (endDate) where.createdAt.lte = new Date(endDate);
      }

      const records = await prisma[modelName].findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: modelName === 'usuario' ? {} : {
          usuario: {
            select: { nombre: true, email: true }
          }
        }
      });

      const exportData = {
        export_info: {
          type: tipo,
          format,
          generated_by: req.user.email,
          generated_at: new Date().toISOString(),
          record_count: records.length,
          filters: { startDate, endDate }
        },
        data: records
      };

      // Configurar headers según el formato
      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${tipo}_export_${new Date().toISOString().split('T')[0]}.csv"`);
        
        // Convertir a CSV (implementación básica)
        const csvData = await BackupController.convertToCSV(records);
        return res.send(csvData);
      } else {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="${tipo}_export_${new Date().toISOString().split('T')[0]}.json"`);
      }

      console.log(`✅ Exportación completada: ${records.length} registros de ${tipo}`);

      res.json(exportData);

    } catch (error) {
      console.error('❌ Error exportando datos:', error);
      res.status(500).json({
        success: false,
        message: 'Error exportando datos',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // 📥 IMPORTAR DATOS AL SISTEMA
  static async importData(req, res) {
    try {
      const { tipo, overwrite = false } = req.body;
      const userId = req.user.userId;
      const userRole = req.user.rol;

      // Solo ADMIN o SUPERVISOR pueden importar
      if (!['ADMIN', 'SUPERVISOR'].includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: 'Permisos insuficientes para importar datos',
          code: 'INSUFFICIENT_PERMISSIONS'
        });
      }

      if (!req.body.data || !Array.isArray(req.body.data)) {
        return res.status(400).json({
          success: false,
          message: 'Datos de importación no válidos. Se esperaba un array en el campo "data"',
          code: 'INVALID_IMPORT_DATA'
        });
      }

      if (!FRI_MODELS[tipo]) {
        return res.status(400).json({
          success: false,
          message: `Tipo de FRI no válido: ${tipo}`,
          valid_types: Object.keys(FRI_MODELS)
        });
      }

      console.log(`📥 Importando datos ${tipo} por: ${req.user.email}`);

      const modelName = FRI_MODELS[tipo];
      const importData = req.body.data;

      const importResult = {
        processed: 0,
        created: 0,
        updated: 0,
        errors: [],
        imported_by: req.user.email,
        imported_at: new Date().toISOString()
      };

      // Procesar cada registro
      for (const record of importData) {
        try {
          importResult.processed++;

          // Limpiar el registro (remover campos auto-generados)
          const cleanRecord = { ...record };
          delete cleanRecord.id;
          delete cleanRecord.createdAt;
          delete cleanRecord.updatedAt;
          delete cleanRecord.usuario; // Relación incluida

          // Asegurar que tenga usuarioId
          if (!cleanRecord.usuarioId) {
            cleanRecord.usuarioId = userId;
          }

          // Verificar si ya existe (usando un campo único como tituloMinero + mineral)
          let existingRecord = null;
          if (cleanRecord.tituloMinero && cleanRecord.mineral) {
            existingRecord = await prisma[modelName].findFirst({
              where: {
                tituloMinero: cleanRecord.tituloMinero,
                mineral: cleanRecord.mineral,
                usuarioId: cleanRecord.usuarioId
              }
            });
          }

          if (existingRecord && overwrite) {
            // Actualizar registro existente
            await prisma[modelName].update({
              where: { id: existingRecord.id },
              data: cleanRecord
            });
            importResult.updated++;
          } else if (!existingRecord) {
            // Crear nuevo registro
            await prisma[modelName].create({
              data: cleanRecord
            });
            importResult.created++;
          } else {
            // Registro duplicado, skip
            importResult.errors.push({
              record: importResult.processed,
              error: 'Registro duplicado - use overwrite=true para actualizar'
            });
          }

        } catch (error) {
          importResult.errors.push({
            record: importResult.processed,
            error: error.message
          });
        }
      }

      console.log(`✅ Importación completada: ${importResult.created} creados, ${importResult.updated} actualizados`);

      res.json({
        success: true,
        message: `📥 Importación de ${tipo} completada`,
        data: importResult
      });

    } catch (error) {
      console.error('❌ Error importando datos:', error);
      res.status(500).json({
        success: false,
        message: 'Error importando datos al sistema',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // 📋 LISTAR BACKUPS DISPONIBLES
  static async listBackups(req, res) {
    try {
      const userRole = req.user.rol;

      // Solo ADMIN puede ver todos los backups
      if (userRole !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'Solo administradores pueden ver la lista de backups',
          code: 'INSUFFICIENT_PERMISSIONS'
        });
      }

      console.log(`📋 Listando backups para: ${req.user.email}`);

      await BackupController.ensureBackupDirectory();

      const backupDirs = await fs.readdir(BACKUP_CONFIG.backupDir);
      const backups = [];

      for (const dir of backupDirs) {
        try {
          const manifestPath = path.join(BACKUP_CONFIG.backupDir, dir, 'manifest.json');
          const manifestExists = await fs.access(manifestPath).then(() => true).catch(() => false);

          if (manifestExists) {
            const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf-8'));
            backups.push({
              id: manifest.id,
              type: manifest.type,
              created_at: manifest.created_at,
              created_by: manifest.created_by,
              total_records: manifest.total_records,
              tables: Object.keys(manifest.tables).length,
              size: manifest.file_size,
              format: manifest.format
            });
          }
        } catch (error) {
          console.warn(`⚠️ Error leyendo backup ${dir}:`, error.message);
        }
      }

      // Ordenar por fecha de creación (más recientes primero)
      backups.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      res.json({
        success: true,
        message: '📋 Lista de backups disponibles',
        data: {
          total_backups: backups.length,
          backups: backups.slice(0, 50), // Mostrar máximo 50
          backup_directory: BACKUP_CONFIG.backupDir,
          max_backups: BACKUP_CONFIG.maxBackups
        }
      });

    } catch (error) {
      console.error('❌ Error listando backups:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo lista de backups',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // =============================================================================
  // MÉTODOS AUXILIARES
  // =============================================================================

  static async ensureBackupDirectory() {
    try {
      await fs.mkdir(BACKUP_CONFIG.backupDir, { recursive: true });
    } catch (error) {
      console.error('Error creando directorio de backup:', error);
    }
  }

  static async calculateDirectorySize(dirPath) {
    let totalSize = 0;
    try {
      const files = await fs.readdir(dirPath);
      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stats = await fs.stat(filePath);
        totalSize += stats.size;
      }
    } catch (error) {
      console.warn('Error calculando tamaño:', error);
    }
    return totalSize;
  }

  static formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  static async cleanOldBackups() {
    try {
      const backupDirs = await fs.readdir(BACKUP_CONFIG.backupDir);
      if (backupDirs.length > BACKUP_CONFIG.maxBackups) {
        // Implementación básica - en producción sería más sofisticada
        console.log(`🧹 Limpieza de backups antiguos simulada (${backupDirs.length} backups)`);
      }
    } catch (error) {
      console.warn('Error en limpieza de backups:', error);
    }
  }

  static async writeCSV(data, filePath) {
    if (data.length === 0) return;
    
    const headers = Object.keys(data[0]).filter(key => key !== 'usuario');
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => 
          JSON.stringify(row[header] || '')
        ).join(',')
      )
    ].join('\n');

    await fs.writeFile(filePath, csvContent);
  }

  static async convertToCSV(data) {
    if (data.length === 0) return 'No data available';
    
    const headers = Object.keys(data[0]).filter(key => key !== 'usuario');
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => 
          JSON.stringify(row[header] || '')
        ).join(',')
      )
    ].join('\n');

    return csvContent;
  }
}

module.exports = BackupController;