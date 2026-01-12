import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './db.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// CRUD Operations (PostgreSQL Version)

// Get all todos
app.get('/todos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM todos ORDER BY id ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching todos:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/todos/count', async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(*) FROM todos');
    res.json({ amount: parseInt(result.rows[0].count) });
  } catch (error) {
    console.error('Error counting todos:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a single todo by ID
app.get('/todos/:id', async (req, res) => {
  try {
    const todoId = parseInt(req.params.id);
    const result = await pool.query('SELECT * FROM todos WHERE id = $1', [todoId]);

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Todo not found' });
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching todo:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new todo
app.post('/todos', async (req, res) => {
  try {
    const { text } = req.body;
    const result = await pool.query(
      'INSERT INTO todos (text, completed) VALUES ($1, $2) RETURNING *',
      [text, false]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating todo:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a todo by ID
app.patch('/todos/:id', async (req, res) => {
  try {
    const todoId = parseInt(req.params.id);
    const { text, completed } = req.body;

    const result = await pool.query(
      'UPDATE todos SET text = COALESCE($1, text), completed = COALESCE($2, completed) WHERE id = $3 RETURNING *',
      [text, completed, todoId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Todo not found' });
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating todo:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a todo by ID
app.delete('/todos/:id', async (req, res) => {
  try {
    const todoId = parseInt(req.params.id);
    const result = await pool.query('DELETE FROM todos WHERE id = $1 RETURNING *', [todoId]);

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Todo not found' });
      return;
    }

    res.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    console.error('Error deleting todo:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
