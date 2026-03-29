const versionRepository = require('../../modules/version/version.repository');

class VersionService {
  async createSnapshot(expenseId, version, fullData, session = null) {
    try {
      await versionRepository.create(expenseId, version, fullData, session);
    } catch (error) {
      console.error('Version snapshot failed:', error);
      throw error;
    }
  }

  async getVersions(expenseId) {
    return versionRepository.findByExpenseId(expenseId);
  }
}

module.exports = new VersionService();
