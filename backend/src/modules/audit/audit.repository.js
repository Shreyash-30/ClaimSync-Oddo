const AuditLog = require('./audit.model');

class AuditLogRepository {
  // Append-only logs
  async createLog(entity, entityId, action, performedBy, oldValue=null, newValue=null, session=null) {
    const log = new AuditLog({
      entity,
      entity_id: entityId,
      action,
      performed_by: performedBy,
      old_value: oldValue,
      new_value: newValue
    });
    return log.save({ session });
  }
}

module.exports = new AuditLogRepository();
