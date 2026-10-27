require('dotenv').config();
const bcrypt = require('bcryptjs');
const prisma = require('../src/models');

const demoEmail = 'antonio@av1.local';
const demoPassword = '0808';

async function main() {
  let user = await prisma.user.findUnique({ where: { email: demoEmail } });
  const passwordHash = await bcrypt.hash(demoPassword, 12);

  if (!user) {
    const previousDemoUser = await prisma.user.findUnique({ where: { email: 'demo@av1.local' } });
    if (previousDemoUser) {
      user = await prisma.user.update({
        where: { id: previousDemoUser.id },
        data: { nome: 'Antonio', email: demoEmail, senhaHash: passwordHash },
      });
      console.log('Conta de demonstração atualizada para Antonio.');
    } else {
      user = await prisma.user.create({
        data: { nome: 'Antonio', email: demoEmail, senhaHash: passwordHash },
      });
      console.log('Usuário de demonstração criado.');
    }
  } else {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { nome: 'Antonio', senhaHash: passwordHash },
    });
    console.log('Conta Antonio atualizada.');
  }
  if (user.id !== 1) {
    console.warn(`A conta Antonio recebeu id ${user.id}; confira a ordem dos registros existentes no banco.`);
  }

  const existingTask = await prisma.task.findFirst({ where: { userId: user.id } });
  if (!existingTask) {
    await prisma.task.create({
      data: {
        title: 'Tarefa de demonstração',
        description: 'Registro de exemplo para demonstrar a tabela tasks no MySQL.',
        userId: user.id,
      },
    });
    console.log('Tarefa de demonstração criada na tabela tasks.');
  }

  console.log(`Login de demonstração: ${demoEmail} / ${demoPassword}`);
}

main()
  .catch((error) => {
    console.error('Não foi possível inserir os dados de demonstração:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
