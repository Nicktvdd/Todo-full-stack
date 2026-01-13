import { useState, useEffect } from 'react';
import './styles.css'; 

export default function App() {
  // 1. STATE MANAGEMENT
  const [todoList, setTodoList] = useState([]); // List from backend
  const [viewCompleted, setViewCompleted] = useState(false); // Tab state (false = Incomplete, true = Complete)
  const [inputValue, setInputValue] = useState(""); // Add form input
  
  // Edit Mode State
  const [editingTodoId, setEditingTodoId] = useState(null);
  const [editingText, setEditingText] = useState("");

  // 2. BACKEND INTEGRATION (Effects)
  
  // Equivalent to componentDidMount
  useEffect(() => {
    refreshList();
  }, []);

  const refreshList = () => {
    fetch("/todos")
      .then((res) => res.json())
      .then((data) => setTodoList(data))
      .catch((err) => console.error("Error fetching todos:", err));
  };

  // 3. HANDLERS (CRUD)

  const handleAdd = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newTodo = { text: inputValue, completed: false };

    fetch("/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTodo),
    })
      .then(refreshList)
      .catch((err) => console.error("Error adding todo:", err));
    
    setInputValue("");
  };

  const handleDelete = (id) => {
    fetch(`/todos/${id}`, { method: "DELETE" })
      .then(refreshList)
      .catch((err) => console.error("Error deleting todo:", err));
  };

  const handleToggleComplete = (id, currentStatus, text) => {
    const updatedTodo = { text: text, completed: !currentStatus };

    fetch(`/todos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedTodo),
    })
      .then(refreshList)
      .catch((err) => console.error("Error toggling todo:", err));
  };

  // 4. EDIT LOGIC
  
  const startEditing = (todo) => {
    setEditingTodoId(todo.id);
    setEditingText(todo.text);
  };

  const saveEdit = (id, currentStatus) => {
    const updatedTodo = { text: editingText, completed: currentStatus };

    fetch(`/todos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedTodo),
    })
      .then(() => {
        setEditingTodoId(null);
        refreshList();
      })
      .catch((err) => console.error("Error updating todo:", err));
  };

  // 5. HELPER FOR RENDERING
  const renderItems = () => {
    const filteredItems = todoList.filter(
      (item) => item.completed === viewCompleted
    );

    if (filteredItems.length === 0) {
        return <p className="empty-msg">No {viewCompleted ? 'completed' : 'incomplete'} tasks.</p>;
    }

    return filteredItems.map((item) => (
      <li key={item.id} className="todo-item">
        {/* If editing this specific item, show input. Otherwise show text. */}
        {editingTodoId === item.id ? (
          <div className="edit-mode">
            <input
              type="text"
              value={editingText}
              onChange={(e) => setEditingText(e.target.value)}
              className="edit-input"
            />
            <div className="action-buttons">
              <button className="btn btn-save" onClick={() => saveEdit(item.id, item.completed)}>Save</button>
              <button className="btn btn-cancel" onClick={() => setEditingTodoId(null)}>Cancel</button>
            </div>
          </div>
        ) : (
          <>
            <span 
                className={`todo-text ${item.completed ? 'completed' : ''}`}
                title={item.text}
            >
              {item.text}
            </span>
            <div className="action-buttons">
               <button 
                className="btn btn-secondary"
                onClick={() => startEditing(item)}
              >
                Edit
              </button>
              <button 
                className={`btn ${item.completed ? 'btn-undo' : 'btn-success'}`}
                onClick={() => handleToggleComplete(item.id, item.completed, item.text)}
              >
                {item.completed ? "Undo" : "Done"}
              </button>
              <button 
                className="btn btn-danger"
                onClick={() => handleDelete(item.id)}
              >
                Delete
              </button>
            </div>
          </>
        )}
      </li>
    ));
  };

  return (
    <div className="app-container">

      <h1>My Tasks</h1>
      
      {/* 1. ADD FORM */}
      <form onSubmit={handleAdd} className="todo-form">
        <input 
          type="text" 
          placeholder="What needs to be done?" 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <button type="submit" className="btn btn-add">Add</button>
      </form>

      {/* 2. TABS */}
      <div className="nav-tabs">
        <span
          className={`nav-link ${!viewCompleted ? "active" : ""}`}
          onClick={() => setViewCompleted(false)}
        >
          Incomplete
        </span>
        <span
          className={`nav-link ${viewCompleted ? "active" : ""}`}
          onClick={() => setViewCompleted(true)}
        >
          Complete
        </span>
      </div>

      {/* 3. LIST */}
      <ul>
        {renderItems()}
      </ul>
    </div>
  )
}