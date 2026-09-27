import { spawn } from 'node:child_process';
import readline from 'node:readline';

const apps = {
  customer: ['customer-app', 5173],
  driver: ['driver-app', 5174],
  supervisor: ['supervisor-web', 5175],
  admin: ['admin-web', 5176],
};
const selected = process.argv[2]?.toLowerCase();
const app = apps[selected];
if (!app) {
  console.log('OneGo development runner');
  console.log('Usage: npm run dev -- customer|driver|supervisor|admin');
  console.log('Ports: customer 5173, driver 5174, supervisor 5175, admin 5176');
  process.exit(0);
}
const child = spawn('npm', ['run', 'dev', '--workspace', `packages/${app[0]}`], { stdio: 'inherit', shell: process.platform === 'win32' });
const stop = () => { if (!child.killed) child.kill('SIGTERM'); };
process.on('SIGINT', stop); process.on('SIGTERM', stop);
child.on('exit', code => process.exit(code ?? 0));
