import { hashPassword, verifyPassword } from '../lib/auth';

async function test() {
  try {
    const pw = 'Testing123!';
    const hash = await hashPassword(pw);
    console.log('Generated hash:', hash);
    const isValid = await verifyPassword(pw, hash);
    console.log('Is valid with correct pw?', isValid);
    const isInvalid = await verifyPassword('wrongpassword', hash);
    console.log('Is valid with wrong pw?', isInvalid);
  } catch(e) {
    console.error('Crash!', e);
  }
}
test();
