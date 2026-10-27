module.exports = (error, req, res, next) => {
  if (res.headersSent) return next(error);

  if (error.code === 'P2002') {
    return res.status(409).json({ error: 'Já existe um cadastro com esse e-mail.' });
  }
  if (error.code === 'P2003' || error.code === 'P2025' || error.name === 'PrismaClientValidationError') {
    return res.status(400).json({ error: 'Os dados enviados são inválidos.' });
  }
  if (error.code && error.code.startsWith('P')) {
    console.error(`Erro Prisma ${error.code}: ${error.message}`);
    return res.status(500).json({ error: 'Erro ao acessar o banco de dados.' });
  }

  console.error(error);
  return res.status(error.status || 500).json({
    error: error.status ? error.message : 'Erro interno do servidor.',
  });
};
