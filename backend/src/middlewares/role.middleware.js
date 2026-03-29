/**
 * Middleware factory strictly limiting route matching bound roles natively.
 * @param {Array<String>} allowedRoles 
 */
const authorize = (allowedRoles) => {
    return (req, res, next) => {
      if (!req.user || !req.user.role) {
        return res.status(401).json({ success: false, message: 'Unauthorized. No user session.' });
      }
  
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ success: false, message: 'Forbidden. Insufficient permissions.' });
      }
  
      next();
    };
  };
  
module.exports = authorize;
