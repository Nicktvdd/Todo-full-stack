import React, { useState } from 'react'
import './styles.css'

function App() {
  // TODO 1: Create State for the list
  // TODO 2: Create State for the input box

  return (
    <div className="app-container">
      <h1>My Tasks</h1>
      
      {/* SECTION 1: The Input Form */}
      <form className="todo-form">
        <input 
          type="text" 
          placeholder="What needs to be done?" 
        />
        <button type="submit" className="add-btn">Add</button>
      </form>

      {/* SECTION 2: The List */}
      <ul>
        {/* We will map over our data here later */}
        <li className="todo-item">
          <span className="todo-text">Hardcoded Task 1</span>
          <button className="delete-btn">Delete</button>
        </li>
        <li className="todo-item">
          <span className="todo-text completed">Hardcoded Task 2 (Done)</span>
          <button className="delete-btn">Delete</button>
        </li>
      </ul>
    </div>
  )
}

export default App