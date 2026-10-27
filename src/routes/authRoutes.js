const express = require('express');
const { body } = require('express-validator');
const controller = require('../controllers/authController');
const asyncHandler = require('../middleware/asyncHandler');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.post('/register', [
  body().custom((_, { req }) => typeof (req.body.nome ?? req.body.name) === 'string')
    .withMessage('Informe o campo nome.'),
  body('nome').optional().isString().trim().isLength({ min: 2, max: 100 })
    .withMessage('O nome deve ter de 2 a 100 caracteres.'),
  body('name').optional().isString().trim().isLength({ min: 2, max: 100 })
    .withMessage('O nome deve ter de 2 a 100 caracteres.'),
  body('email').isEmail().withMessage('Informe um e-mail válido.'),
  body('password').isString().isLength({ min: 8, max: 72 }).withMessage('A senha deve ter entre 8 e 72 caracteres.'),
], validate, asyncHandler(controller.register));

router.post('/login', [
  body('email').isEmail().withMessage('Informe um e-mail válido.'),
  body('password').isString().notEmpty().withMessage('Informe a senha.'),
], validate, asyncHandler(controller.login));
router.get('/me', auth, controller.me);

module.exports = router;
