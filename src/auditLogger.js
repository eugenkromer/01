// DSGVO-konformes Audit Logging System (Art. 5, 32)
// Protokolliert alle sensitiven Operationen für Accountability & Compliance

const fs = require('fs');
const path = require('path');

const LOG_DIR = path.join(__dirname, '..', 'data');

class AuditLogger {
  constructor() {
    this.logs = [];
    this.MAX_LOGS = 10000;
  }

  logDataAccess(action, resourceType, resourceId, userId, result = 'success', metadata = {}) {
    this._addLog({
      timestamp: new Date().toISOString(),
      action,
      resourceType,
      resourceId,
      userId,
      result,
      metadata: this._sanitizeMetadata(metadata),
      type: 'DATA_ACCESS'
    });
  }

  logDataExport(userId, format, recordCount, metadata = {}) {
    this._addLog({
      timestamp: new Date().toISOString(),
      action: 'DATA_EXPORT',
      userId,
      format,
      recordCount,
      metadata: this._sanitizeMetadata(metadata),
      type: 'DATA_EXPORT'
    });
  }

  logDataDeletion(userId, resourceType, recordsDeleted, metadata = {}) {
    this._addLog({
      timestamp: new Date().toISOString(),
      action: 'DATA_DELETION',
      userId,
      resourceType,
      recordsDeleted,
      metadata: this._sanitizeMetadata(metadata),
      type: 'DATA_DELETION'
    });
  }

  logAdminAction(action, adminId, changeType, metadata = {}) {
    this._addLog({
      timestamp: new Date().toISOString(),
      action,
      adminId,
      changeType,
      metadata: this._sanitizeMetadata(metadata),
      type: 'ADMIN_ACTION'
    });
  }

  logSecurityEvent(eventType, userId, severity = 'info', details = {}) {
    this._addLog({
      timestamp: new Date().toISOString(),
      action: eventType,
      userId,
      severity,
      metadata: this._sanitizeMetadata(details),
      type: 'SECURITY_EVENT'
    });
  }

  getLogs(filter = {}) {
    return this.logs.filter(log => {
      if (filter.type && log.type !== filter.type) return false;
      if (filter.userId && log.userId !== filter.userId) return false;
      if (filter.startDate && new Date(log.timestamp) < new Date(filter.startDate)) return false;
      if (filter.endDate && new Date(log.timestamp) > new Date(filter.endDate)) return false;
      return true;
    });
  }

  exportLogsAsJSON(userId) {
    const userLogs = this.logs.filter(log => log.userId === userId);
    return JSON.stringify(userLogs, null, 2);
  }

  clearOldLogs(daysToKeep = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    this.logs = this.logs.filter(log => new Date(log.timestamp) > cutoffDate);
  }

  _addLog(log) {
    this.logs.push(log);
    if (this.logs.length > this.MAX_LOGS) {
      this.logs.shift();
    }
    this._writeToFile(log);
  }

  _sanitizeMetadata(metadata) {
    const sanitized = { ...metadata };
    delete sanitized.password;
    delete sanitized.token;
    delete sanitized.apiKey;
    delete sanitized.secret;
    return sanitized;
  }

  _writeToFile(log) {
    try {
      fs.mkdirSync(LOG_DIR, { recursive: true });
      const logFile = path.join(LOG_DIR, 'audit-logs.json');
      let logs = [];
      try {
        const raw = fs.readFileSync(logFile, 'utf8');
        logs = JSON.parse(raw);
      } catch (e) {
        logs = [];
      }
      logs.push(log);
      fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));
    } catch (e) {
      console.error('Failed to write audit log:', e);
    }
  }
}

module.exports = new AuditLogger();
