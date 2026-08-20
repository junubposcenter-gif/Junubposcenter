process.env.NODE_ENV = 'production';
import { spawn } from 'child_process';
const child = spawn('npx', ['tsx', 'server.ts'], { env: { ...process.env, NODE_ENV: 'production', PORT: '3001' } });
child.stdout.on('data', d => console.log(d.toString()));
child.stderr.on('data', d => console.error(d.toString()));
setTimeout(async () => {
  try {
    const res = await fetch('http://localhost:3001/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'testprod',
        password: 'password123',
        role: 'operator',
        full_name: 'Test',
        staff_id: 'Test-1',
      }),
    });
    console.log('users status:', res.status);
    console.log('users response:', await res.text());
  } catch (e) {
    console.error(e);
  }
  child.kill();
  process.exit();
}, 2000);
