const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../models');

function createToken(user) {
  return jwt.sign({ sub: String(user.id), email: user.email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  });
}

exports.register = async (req, res) => {
  const passwordHash = await bcrypt.hash(req.body.password, 12);
  const user = await prisma.user.create({
    data: {
      nome: (req.body.nome ?? req.body.name).trim(),
      email: req.body.email.trim().toLowerCase(),
      senhaHash: passwordHash,
    },
    select: { id: true, nome: true, email: true },
  });
  return res.status(201).json({ user, token: createToken(user) });
};

exports.login = async (req, res) => {
  const email = req.body.email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(req.body.password, user.senhaHash))) {
    return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
  }

  const publicUser = { id: user.id, nome: user.nome, email: user.email };
  return res.json({ user: publicUser, token: createToken(user) });
};

exports.me = (req, res) => res.json({ user: req.user });
