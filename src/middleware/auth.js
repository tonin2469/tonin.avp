const jwt = require('jsonwebtoken');
const prisma = require('../models');
const asyncHandler = require('./asyncHandler');

module.exports = asyncHandler(async (req, res, next) => {
  const header = req.get('authorization');
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token de autenticação ausente.' });
  }

  const token = header.slice(7).trim();
  if (!token) return res.status(401).json({ error: 'Token de autenticação ausente.' });

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ error: 'Token inválido ou expirado.' });
  }

  const userId = Number(payload.sub);
  const user = Number.isSafeInteger(userId) && userId > 0
    ? await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, nome: true, email: true },
    })
    : null;
  if (!user) return res.status(401).json({ error: 'Usuário do token não encontrado.' });

  req.user = user;
  next();
});
