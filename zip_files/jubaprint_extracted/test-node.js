import { spawnSync } from 'child_process';
const result = spawnSync('node', ['server.ts']);
console.log('stdout:', result.stdout.toString());
console.log('stderr:', result.stderr.toString());
