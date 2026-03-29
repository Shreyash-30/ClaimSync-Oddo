const Invite = require('./invite.model');

class InviteRepository {
  async create(data, session = null) {
    const invite = new Invite(data);
    return invite.save({ session });
  }

  async findByToken(token) {
    return Invite.findOne({ token }).lean();
  }

  async markAsUsed(tokenId, session = null) {
    return Invite.findByIdAndUpdate(tokenId, { is_used: true }, { new: true, session }).lean();
  }
}

module.exports = new InviteRepository();
