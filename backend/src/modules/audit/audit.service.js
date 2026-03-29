const auditRepository = require('../../modules/audit/audit.repository');

class AuditService {
  async log(entity, entityId, action, performedBy, oldValue = null, newValue = null, session = null) {
    try {
      await auditRepository.createLog(entity, entityId, action, performedBy, oldValue, newValue, session);
    } catch (error) {
      console.error('Audit Logging Failed:', error);
      // Depending on strictness, we might throw Error to rollback transaction, 
      // but usually audit failures shouldn't crash the main transaction unless strict audit is mandated.
      throw error;
    }
  }
}

module.exports = new AuditService();
