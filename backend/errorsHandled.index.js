const express = require('express')
const fs = require('fs')

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())

// Load the initial data from the JSON file
let todoData = JSON.parse(fs.readFileSync('database.json', 'utf-8'))

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err)
  res.status(500).json({ error: 'Something went wrong!' })
})

// CRUD Operations

// Get all todos
app.get('/todos', (req, res, next) => {
  try {
    res.json(todoData)
  } catch (error) {
    next(error)
  }
})

// Get a single todo by ID
app.get('/todos/:id', (req, res, next) => {
  try {
    const todoId = parseInt(req.params.id)
    const todo = todoData.find((todo) => todo.id === todoId)

    if (!todo) {
      res.status(404).json({ error: 'Todo not found' })
    } else {
      res.json(todo)
    }
  } catch (error) {
    next(error)
  }
})

// Create a new todo
app.post('/todos', (req, res, next) => {
  try {
    if (!req.body.text) {
      throw new Error('Text is required for a new todo')
    }

    const newTodo = {
      id: Date.now(),
      text: req.body.text,
      completed: false,
    }

    todoData.push(newTodo)
    saveDataToFile()
    res.status(201).json(newTodo)
  } catch (error) {
    next(error)
  }
})

// Update a todo by ID
app.put('/todos/:id', (req, res, next) => {
  try {
    const todoId = parseInt(req.params.id)
    const updatedTodo = req.body

    if (!updatedTodo.text) {
      throw new Error('Text is required for updating a todo')
    }

    todoData = todoData.map((todo) => {
      if (todo.id === todoId) {
        return { ...todo, ...updatedTodo, id: todo.id }
      }
      return todo
    })

    saveDataToFile()
    res.json({ message: 'Todo updated successfully' })
  } catch (error) {
    next(error)
  }
})

// Delete a todo by ID
app.delete('/todos/:id', (req, res, next) => {
  try {
    const todoId = parseInt(req.params.id)

    todoData = todoData.filter((todo) => todo.id !== todoId)
    saveDataToFile()
    res.json({ message: 'Todo deleted successfully' })
  } catch (error) {
    next(error)
  }
})

// Save the updated data to the JSON file
function saveDataToFile() {
  fs.writeFileSync('database.json', JSON.stringify(todoData, null, 2), 'utf-8')
}

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
