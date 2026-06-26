// server.js
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const Redis = require('ioredis');
const { Queue } = require('bullmq');

const app = express();
app.use(cors());
app.use(express.json());

// PostgreSQL Connection
const pool = new Pool({
  user: 'postgres',
  host: 'postgres',
  database: 'todo_db',
  password: 'postgres',
  port: 5432,
});

// Redis Connection
const redis = new Redis({
  host: 'redis',
  port: 6379,
});

// BullMQ Queue for background tasks
const todoQueue = new Queue('todo-queue', {
  connection: {
    host: 'redis',
    port: 6379,
  },
});

// Health Check (for distributed system monitoring)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    services: {
      postgres: pool ? 'connected' : 'disconnected',
      redis: redis ? 'connected' : 'disconnected',
    }
  });
});

// GET all todos (with Redis caching)
app.get('/api/todos', async (req, res) => {
  try {
    const cacheKey = 'todos:all';
    const cached = await redis.get(cacheKey);
    
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    const result = await pool.query(
      'SELECT * FROM todos ORDER BY created_at DESC'
    );
    
    // Cache for 10 seconds (distributed caching strategy)
    await redis.setex(cacheKey, 10, JSON.stringify(result.rows));
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching todos:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST new todo
app.post('/api/todos', async (req, res) => {
  const { title } = req.body;
  
  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO todos (title, completed) VALUES ($1, $2) RETURNING *',
      [title.trim(), false]
    );
    
    const newTodo = result.rows[0];
    
    // Invalidate cache
    await redis.del('todos:all');
    
    // Queue a background task (example: send notification, log, etc.)
    await todoQueue.add('todo-created', {
      todoId: newTodo.id,
      title: newTodo.title,
      timestamp: new Date().toISOString(),
    });
    
    res.status(201).json(newTodo);
  } catch (error) {
    console.error('Error creating todo:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT update todo
app.put('/api/todos/:id', async (req, res) => {
  const { id } = req.params;
  const { completed, title } = req.body;

  try {
    let query = 'UPDATE todos SET ';
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (completed !== undefined) {
      updates.push(`completed = $${paramIndex}`);
      values.push(completed);
      paramIndex++;
    }

    if (title !== undefined) {
      updates.push(`title = $${paramIndex}`);
      values.push(title);
      paramIndex++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    query += updates.join(', ') + ` WHERE id = $${paramIndex} RETURNING *`;
    values.push(id);

    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    await redis.del('todos:all');
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating todo:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE todo
app.delete('/api/todos/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM todos WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    await redis.del('todos:all');
    res.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    console.error('Error deleting todo:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Todo API running on port ${PORT}`);
});