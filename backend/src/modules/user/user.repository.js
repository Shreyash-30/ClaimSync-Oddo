const User = require('./user.model');

class UserRepository {
  async create(userData, session = null) {
    const user = new User(userData);
    return user.save({ session });
  }

  async findByEmail(email) {
    return User.findOne({ email }).lean();
  }

  async findById(id) {
    return User.findById(id).lean();
  }

  async updateById(id, updateData, session = null) {
    return User.findByIdAndUpdate(id, updateData, { new: true, session }).lean();
  }

  async findWithPasswordByEmail(email) {
    return User.findOne({ email }).select('+password_hash').lean();
  }
}

module.exports = new UserRepository();
