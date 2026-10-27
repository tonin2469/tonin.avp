const prisma = require('../models');

const allowedFields = ['title', 'description', 'status', 'dueDate'];
const taskFields = (body) => Object.fromEntries(
  Object.entries(body).filter(([field]) => allowedFields.includes(field)),
);

const normalizeDates = (fields) => ({
  ...fields,
  ...(Object.hasOwn(fields, 'dueDate') && fields.dueDate !== null
    ? { dueDate: new Date(`${fields.dueDate}T00:00:00.000Z`) }
    : {}),
});

exports.list = async (req, res) => {
  const tasks = await prisma.task.findMany({ where: { userId: req.user.id }, orderBy: { createdAt: 'desc' } });
  return res.json({ data: tasks });
};

exports.get = async (req, res) => {
  const task = await prisma.task.findFirst({ where: { id: Number(req.params.id), userId: req.user.id } });
  if (!task) return res.status(404).json({ error: 'Tarefa não encontrada.' });
  return res.json({ data: task });
};

exports.create = async (req, res) => {
  const task = await prisma.task.create({ data: { ...normalizeDates(taskFields(req.body)), userId: req.user.id } });
  return res.status(201).json({ data: task });
};

exports.update = async (req, res) => {
  const task = await prisma.task.findFirst({ where: { id: Number(req.params.id), userId: req.user.id } });
  if (!task) return res.status(404).json({ error: 'Tarefa não encontrada.' });
  const updated = await prisma.task.update({
    where: { id: task.id },
    data: normalizeDates(taskFields(req.body)),
  });
  return res.json({ data: updated });
};

exports.remove = async (req, res) => {
  const task = await prisma.task.findFirst({ where: { id: Number(req.params.id), userId: req.user.id } });
  if (!task) return res.status(404).json({ error: 'Tarefa não encontrada.' });
  await prisma.task.delete({ where: { id: task.id } });
  return res.status(204).end();
};
