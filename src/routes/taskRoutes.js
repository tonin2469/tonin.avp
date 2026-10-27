const express = require('express');
const { body, param } = require('express-validator');
const controller = require('../controllers/taskController');
const auth = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const validate = require('../middleware/validate');

const router = express.Router();
router.use(auth);

const taskId = param('id').isInt({ min: 1 }).withMessage('O id deve ser um inteiro positivo.');
const createFields = [
  body('title').isString().trim().isLength({ min: 1, max: 150 }).withMessage('O título é obrigatório e deve ter até 150 caracteres.'),
  body('description').optional({ nullable: true }).isString().isLength({ max: 5000 }).withMessage('A descrição deve ter até 5000 caracteres.'),
  body('status').optional().isIn(['pendente', 'em_andamento', 'concluida']).withMessage('Status inválido.'),
  body('dueDate').optional({ nullable: true }).isISO8601({ strict: true }).withMessage('A data limite deve estar no formato AAAA-MM-DD.'),
];
const updateFields = [
  body('title').optional().isString().trim().isLength({ min: 1, max: 150 }).withMessage('O título deve ter até 150 caracteres.'),
  body('description').optional({ nullable: true }).isString().isLength({ max: 5000 }).withMessage('A descrição deve ter até 5000 caracteres.'),
  body('status').optional().isIn(['pendente', 'em_andamento', 'concluida']).withMessage('Status inválido.'),
  body('dueDate').optional({ nullable: true }).isISO8601({ strict: true }).withMessage('A data limite deve estar no formato AAAA-MM-DD.'),
  body().custom((_, { req }) => Object.keys(req.body).length > 0).withMessage('Envie ao menos um campo para atualizar.'),
];

router.get('/', asyncHandler(controller.list));
router.get('/:id', taskId, validate, asyncHandler(controller.get));
router.post('/', createFields, validate, asyncHandler(controller.create));
router.patch('/:id', taskId, ...updateFields, validate, asyncHandler(controller.update));
router.delete('/:id', taskId, validate, asyncHandler(controller.remove));

module.exports = router;
