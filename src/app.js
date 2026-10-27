require('dotenv').config();
const express = require('express');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '100kb' }));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use((req, res) => res.status(404).json({ error: 'Rota não encontrada.' }));
app.use(errorHandler);

module.exports = app;
