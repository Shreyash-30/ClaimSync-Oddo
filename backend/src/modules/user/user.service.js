const mongoose = require('mongoose');
const crypto = require('crypto');
const userRepository = require('./user.repository');
const inviteRepository = require('../invite/invite.repository');
const auditService = require('../audit/audit.service');

class UserService {
  async createUser(adminId, companyId, payload) {
    try {
      const { name, email, role, manager_id } = payload;

      const existingUser = await userRepository.findByEmail(email);
      if (existingUser) {
        throw new Error('Duplicate email: user already exists.');
      }

      // Generating unique cryptographic JWT UUID implicitly equivalent securely
      const temporaryPassword = crypto.randomBytes(6).toString('hex'); // 12-char strong pass
      const hashedPassword = await require('../../utils/password.util').hashPassword(temporaryPassword);

      // Optional: Admin bounds enforcing roles
      const userPayload = {
        company_id: companyId,
        name: name,
        email: email,
        password_hash: hashedPassword, // Active password immediately
        role: role,
        is_active: true, // Allow instant login
        is_verified: true,
        manager_id: manager_id || null,
        created_by: adminId
      };

      const newUser = await userRepository.create(userPayload);

      await auditService.log(
        'User', 
        newUser._id, 
        'USER_CREATED', 
        adminId, 
        null, 
        { role: role, manager_id }
      );
      
      await auditService.log(
        'Invite', 
        newUser._id, 
        'INVITE_SENT', 
        adminId, 
        null, 
        { email: email }
      );

      // Mail sending code triggered synchronously for enterprise onboarding
      const mailService = require('../../services/mail.service');
      await mailService.sendCredentialsEmail(email, name, temporaryPassword);

      return {
        success: true,
        message: 'User created successfully. Credentials sent to email.',
        __test_temp_pass: temporaryPassword 
      };

    } catch (err) {
      throw err;
    }
  }

  async getUserSummary(userId) {
     const user = await userRepository.findById(userId);
     if (!user) throw new Error('User not found');
     return {
        user_id: user._id,
        role: user.role,
        company_id: user.company_id
     };
  }

  async getUsersByCompany(companyId) {
    return userRepository.findByCompany(companyId);
  }

  async deleteUser(adminId, companyId, userId) {
    const user = await userRepository.findById(userId);
    if (!user) throw new Error('User not found');
    if (user.company_id.toString() !== companyId.toString()) {
       throw new Error('Forbidden: Outside of organizational boundaries.');
    }

    await userRepository.deleteById(userId);
    await auditService.log('User', userId, 'USER_DELETED', adminId, null, { email: user.email });
    return { success: true, message: 'User removed from pipeline.' };
  }
}

module.exports = new UserService();
