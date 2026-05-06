const { hashPassword, verifyPassword } = require('../src/utils/security.cjs');
const assert = require('assert');

async function testSecurity() {
    console.log('Running security utility tests...');

    // Test 1: Hashing and verifying
    const password = 'my_secure_password';
    const hash = await hashPassword(password);

    assert(hash.includes(':'), 'Hash should contain a colon separator');
    assert(await verifyPassword(password, hash), 'Should verify correct password');
    assert(!(await verifyPassword('wrong_password', hash)), 'Should not verify incorrect password');
    console.log('Test 1 Passed: Hashing and verifying works.');

    // Test 2: Legacy plaintext support
    const plaintextPassword = 'legacy_password';
    assert(await verifyPassword(plaintextPassword, plaintextPassword), 'Should verify legacy plaintext password');
    assert(!(await verifyPassword('wrong_password', plaintextPassword)), 'Should not verify incorrect legacy password');
    console.log('Test 2 Passed: Legacy support works.');

    // Test 3: Different salts for same password
    const hash1 = await hashPassword(password);
    const hash2 = await hashPassword(password);
    assert.notStrictEqual(hash1, hash2, 'Hashes for same password should be different due to unique salts');
    assert(await verifyPassword(password, hash1), 'Hash 1 should be valid');
    assert(await verifyPassword(password, hash2), 'Hash 2 should be valid');
    console.log('Test 3 Passed: Unique salts work.');

    console.log('\nAll security tests passed!');
}

testSecurity().catch(err => {
    console.error('Test failed:', err);
    process.exit(1);
});
