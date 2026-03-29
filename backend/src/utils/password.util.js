const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 12;

exports.hashPassword = async (plainPassword) => {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
};

exports.comparePassword = async (plainPassword, hashedPassword) => {
  if (!hashedPassword) return false;
  return bcrypt.compare(plainPassword, hashedPassword);
};
