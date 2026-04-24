const testAuth = async () => {
  const email = `test${Date.now()}@college.ac.in`
  console.log('Registering', email)
  const regRes = await fetch('http://localhost:3000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Test Account',
      email,
      password: 'StrongPassword!123',
      isSeller: false,
      otp: '123456' // Mock OTP shouldn't work if no verification
    })
  });
  console.log('Reg Result:', await regRes.text(), regRes.status)
}
testAuth();
