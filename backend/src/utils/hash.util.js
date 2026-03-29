const crypto = require('crypto');
const fs = require('fs');

/**
 * Generate a SHA256 hash for a given file buffer
 * @param {Buffer} buffer 
 * @returns {String} sha256 hash
 */
exports.generateFileHash = (buffer) => {
  return crypto.createHash('sha256').update(buffer).digest('hex');
};

/**
 * Generate SHA256 hash from file path
 */
exports.generateFileHashFromFile = async (filePath) => {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);
    stream.on('error', err => reject(err));
    stream.on('data', chunk => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
  });
};
