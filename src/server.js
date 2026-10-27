require('dotenv').config();
const app = require('./app');
const prisma = require('./models');

const port = Number(process.env.PORT) || 3000;

async function start() {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('Configure JWT_SECRET com pelo menos 32 caracteres no arquivo .env.');
  }
  await prisma.$connect();
  app.listen(port, () => console.log(`API disponível em http://localhost:${port}`));
}

if (require.main === module) {
  start().catch((error) => {
    console.error('Não foi possível iniciar a API:', error.message);
    process.exitCode = 1;
  });
}

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

module.exports = { start };
