import { spawn } from 'child_process';
const child = spawn('npx.cmd', ['prisma', 'migrate', 'dev', '--name', 'add_missing_indexes_constraints'], { stdio: ['pipe', 'inherit', 'inherit'], shell: true });
child.stdin.write('y\n');
child.stdin.end();
