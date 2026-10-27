const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const prisma = require('../src/models');

const app = require('../src/app');
let testUser;
let token;

before(async () => {
  await prisma.$connect();
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();
});

after(async () => {
  await prisma.$disconnect();
});

test('cadastro, login, autenticação e CRUD persistente de tarefas', async () => {
  const invalidRegistration = await request(app)
    .post('/api/auth/register')
    .send({ name: 'A', email: 'invalido', password: '123' });
  assert.equal(invalidRegistration.status, 400);

  const uniqueEmail = `teste-${Date.now()}@example.com`;
  const registered = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Pessoa Teste', email: uniqueEmail, password: 'senha-segura-123' });
  assert.equal(registered.status, 201);
  assert.equal(typeof registered.body.user.id, 'number');
  assert.equal(registered.body.user.email, uniqueEmail);
  assert.equal(Object.hasOwn(registered.body.user, 'passwordHash'), false);
  testUser = registered.body.user;
  token = registered.body.token;

  const persistedUser = await prisma.user.findUnique({ where: { id: testUser.id } });
  assert.ok(persistedUser?.senhaHash, 'senha deve estar persistida como hash');
  assert.notEqual(persistedUser.senhaHash, 'senha-segura-123');

  const duplicate = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Pessoa Teste', email: uniqueEmail, password: 'senha-segura-123' });
  assert.equal(duplicate.status, 409);

  const badLogin = await request(app)
    .post('/api/auth/login')
    .send({ email: uniqueEmail, password: 'senha-errada' });
  assert.equal(badLogin.status, 401);

  const login = await request(app)
    .post('/api/auth/login')
    .send({ email: uniqueEmail.toUpperCase(), password: 'senha-segura-123' });
  assert.equal(login.status, 200);
  assert.ok(login.body.token);

  assert.equal((await request(app).get('/api/tasks')).status, 401);
  assert.equal((await request(app).get('/api/tasks').set('Authorization', 'Bearer token-invalido')).status, 401);
  assert.equal((await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`)).status, 200);

  const invalidTask = await request(app)
    .post('/api/tasks')
    .set('Authorization', `Bearer ${token}`)
    .send({ title: '' });
  assert.equal(invalidTask.status, 400);

  const created = await request(app)
    .post('/api/tasks')
    .set('Authorization', `Bearer ${token}`)
    .send({ title: 'Preparar apresentação', description: 'Demonstrar API', dueDate: '2026-11-01' });
  assert.equal(created.status, 201);
  const taskId = created.body.data.id;

  const list = await request(app).get('/api/tasks').set('Authorization', `Bearer ${token}`);
  assert.equal(list.status, 200);
  assert.equal(list.body.data.length, 1);

  const detail = await request(app).get(`/api/tasks/${taskId}`).set('Authorization', `Bearer ${token}`);
  assert.equal(detail.status, 200);
  assert.equal(detail.body.data.title, 'Preparar apresentação');

  const updated = await request(app)
    .patch(`/api/tasks/${taskId}`)
    .set('Authorization', `Bearer ${token}`)
    .send({ status: 'concluida', title: 'Apresentação pronta' });
  assert.equal(updated.status, 200);
  assert.equal(updated.body.data.status, 'concluida');
  assert.equal(updated.body.data.title, 'Apresentação pronta');

  assert.equal((await request(app).get('/api/tasks/999999').set('Authorization', `Bearer ${token}`)).status, 404);
  assert.equal((await request(app).patch(`/api/tasks/${taskId}`).set('Authorization', `Bearer ${token}`).send({ status: 'desconhecido' })).status, 400);

  const removed = await request(app).delete(`/api/tasks/${taskId}`).set('Authorization', `Bearer ${token}`);
  assert.equal(removed.status, 204);
  assert.equal((await request(app).get(`/api/tasks/${taskId}`).set('Authorization', `Bearer ${token}`)).status, 404);

  const reloadedPrisma = new (require('@prisma/client').PrismaClient)();
  try {
    const userAfterReconnect = await reloadedPrisma.user.findUnique({ where: { id: testUser.id } });
    assert.ok(userAfterReconnect, 'o usuário deve permanecer salvo após uma nova conexão ao MySQL');
  } finally {
    await reloadedPrisma.$disconnect();
  }
});
