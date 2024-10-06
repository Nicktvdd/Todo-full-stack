import express from 'express'
import cors from 'cors'
import fs from 'fs'

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Load the initial data from the JSON file
let todoData = JSON.parse(fs.readFileSync('database.json', 'utf-8'));

// CRUD Operations

// Get all todos
app.get('/todos', (req, res) => {
  res.json(todoData);
});

app.get('/todos/count', (req, res) => {
  numberOfTodos = todoData.length;
  res.json({ amount: numberOfTodos });
});

// Get a single todo by ID
app.get('/todos/:id', (req, res) => {
  const todoId = parseInt(req.params.id);
  const todo = todoData.find((todo) => todo.id === todoId);

  if (!todo) {
    res.status(404).json({ error: 'Todo not found' });
  } else {
    res.json(todo);
  }
});

// Create a new todo
app.post('/todos', (req, res) => {
  const newTodo = {
    id: Date.now(),
    text: req.body.text,
    completed: false,
  };

  todoData.push(newTodo);
  saveDataToFile();
  res.status(201).json(newTodo);
});

// Update a todo by ID
app.put('/todos/:id', (req, res) => {
  const todoId = parseInt(req.params.id);
  const updatedTodo = req.body;

  todoData = todoData.map((todo) => {
    if (todo.id === todoId) {
      return { ...todo, ...updatedTodo, id: todo.id };
    }
    return todo;
  });

  saveDataToFile();
  res.json({ message: 'Todo updated successfully' });
});

// Delete a todo by ID
app.delete('/todos/:id', (req, res) => {
  const todoId = parseInt(req.params.id);

  todoData = todoData.filter((todo) => todo.id !== todoId);
  saveDataToFile();
  res.json({ message: 'Todo deleted successfully' });
});

// Save the updated data to the JSON file
function saveDataToFile() {
  fs.writeFileSync('database.json', JSON.stringify(todoData, null, 2), 'utf-8');
}

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
