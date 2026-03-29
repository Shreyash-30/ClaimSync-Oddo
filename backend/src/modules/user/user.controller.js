const userService = require('./user.service');

class UserController {
  async createUser(req, res, next) {
    try {
      const { email, role, manager_id } = req.body;

      if (!email || !role) {
         return res.status(400).json({ success: false, message: 'Email and Role required' });
      }

      const validRoles = ['ADMIN', 'EMPLOYEE', 'MANAGER', 'FINANCE', 'CFO'];
      if (!validRoles.includes(role)) {
         return res.status(400).json({ success: false, message: `Invalid role. Must be one of: ${validRoles.join(', ')}` });
      }

      // Grab executing user_id / company_id via authenticated Token mapping
      const result = await userService.createUser(
        req.user.user_id, 
        req.user.company_id, 
        { email, role, manager_id }
      );

      return res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
