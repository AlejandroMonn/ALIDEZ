const crypto = require('crypto');
const { promisify } = require('util');

const scrypt = promisify(crypto.scrypt);

/**
 * Hashes a password using crypto.scrypt.
 * @param {string} password The plaintext password.
 * @returns {Promise<string>} The hashed password in 'salt:hash' format.
 */
async function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const derivedKey = await scrypt(password, salt, 64);
    return `${salt}:${derivedKey.toString('hex')}`;
}

/**
 * Verifies a password against a hash.
 * Supports legacy plaintext passwords (for transition period).
 * @param {string} password The plaintext password to check.
 * @param {string} hash The stored hash (or plaintext password).
 * @returns {Promise<boolean>} True if it matches.
 */
async function verifyPassword(password, hash) {
    // Legacy support: if hash doesn't contain a colon, assume it's plaintext
    if (!hash.includes(':')) {
        return password === hash;
    }

    const [salt, storedKey] = hash.split(':');
    const derivedKey = await scrypt(password, salt, 64);

    // Use timingSafeEqual to prevent timing attacks
    return crypto.timingSafeEqual(
        Buffer.from(storedKey, 'hex'),
        derivedKey
    );
}

module.exports = {
    hashPassword,
    verifyPassword
};
