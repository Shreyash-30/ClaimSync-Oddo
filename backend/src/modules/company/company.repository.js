const Company = require('./company.model');

class CompanyRepository {
  async create(data, session = null) {
    const company = new Company(data);
    return company.save({ session });
  }

  async findById(id) {
    return Company.findById(id).lean();
  }
}

module.exports = new CompanyRepository();
