require('dotenv').config();
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const testDatabaseUrl = process.env.TEST_DATABASE_URL;
if (!testDatabaseUrl) {
  console.error('Configure TEST_DATABASE_URL no .env para executar os testes de integração sem tocar no banco principal.');
  process.exit(1);
}

const env = {
  ...process.env,
  DATABASE_URL: testDatabaseUrl,
  JWT_SECRET: process.env.JWT_SECRET || 'test-only-secret-with-at-least-thirty-two-characters',
  NODE_ENV: 'test',
};
const prismaCli = path.resolve('node_modules/prisma/build/index.js');
const setup = spawnSync(process.execPath, [prismaCli, 'db', 'push', '--schema=prisma/schema.prisma', '--skip-generate', '--accept-data-loss'], {
  stdio: 'inherit',
  env,
});
if (setup.status !== 0) process.exit(setup.status || 1);

const tests = spawnSync(process.execPath, ['--test', 'tests/api.test.js'], { stdio: 'inherit', env });
process.exit(tests.status || 0);
