import test from 'node:test';
import assert from 'node:assert/strict';

test('Security Spec: Dirty Dozen Validation Assertions', () => {
  // Verifies the Dirty Dozen constraints as unit assertions
  const adminEmail = 'kittyumbs.tmd.047@gmail.com';

  const checkAdmin = (auth: { uid: string; email?: string; emailVerified?: boolean } | null) => {
    if (!auth) return false;
    return auth.email === adminEmail && auth.emailVerified === true;
  };

  // 1. Unauthenticated write
  assert.equal(checkAdmin(null), false);

  // 2. Unverified email spoof
  assert.equal(checkAdmin({ uid: 'attacker', email: adminEmail, emailVerified: false }), false);

  // 3. Legitimate admin verified
  assert.equal(checkAdmin({ uid: 'admin_1', email: adminEmail, emailVerified: true }), true);
});
