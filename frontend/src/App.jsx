import { useState, useEffect } from 'react';
import './styles.css'

export default function App() {
  // =========================================================================
  // 1. STATE MANAGEMENT (The "Brain" of the component)
  // =========================================================================
  
  // Stores the list of tasks fetched from the backend
  const [todoList, setTodoList] = useState([]);
  
  // Controls which tab is active (false = Incomplete, true = Complete)
  const [viewCompleted, setViewCompleted] = useState(false);
  
  // Controls the text in the "Add Task" input field
  const [inputValue, setInputValue] = useState("");
  
  // Tracks which item is being edited (ID) and the text being typed
  const [editingTodoId, setEditingTodoId] = useState(null);
  const [editingText, setEditingText] = useState("");


  // =========================================================================
  // 2. BACKEND INTEGRATION (Side Effects)
  // =========================================================================

  /**
   * Fetches the latest list of todos from the API.
   * We call this whenever we add, delete, or update a task to keep UI in sync.
   */
  const refreshList = () => {
    fetch("/todos")
      .then((res) => res.json())
      .then((data) => setTodoList(data))
      .catch((err) => console.error("Error fetching todos:", err));
  };

  /**
   * useEffect: Runs once when the component mounts.
   * This replaces componentDidMount() from class components.
   */
  useEffect(() => {
    refreshList();
  }, []);


  // =========================================================================
  // 3. EVENT HANDLERS (Interactivity)
  // =========================================================================

  // --- CREATE ---
  const handleAdd = (e) => {
    e.preventDefault(); // Prevent full page reload
    if (!inputValue.trim()) return; // Don't submit empty tasks

    const newTodo = { text: inputValue, completed: false };

    fetch("/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTodo),
    })
      .then(refreshList) // Refresh list after successful add
      .catch((err) => console.error("Error adding todo:", err));
    
    setInputValue(""); // Clear the input field
  };

  // --- DELETE ---
  const handleDelete = (id) => {
    fetch(`/todos/${id}`, { method: "DELETE" })
      .then(refreshList)
      .catch((err) => console.error("Error deleting todo:", err));
  };

  // --- UPDATE (Toggle Completion) ---
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

  // --- UPDATE (Edit Text) ---
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
        setEditingTodoId(null); // Exit edit mode
        refreshList();
      })
      .catch((err) => console.error("Error updating todo:", err));
  };


  // =========================================================================
  // 4. RENDER HELPERS (Presentation Logic)
  // =========================================================================

  const renderItems = () => {
    // Filter the list based on which tab is active
    const filteredItems = todoList.filter(
      (item) => item.completed === viewCompleted
    );

    if (filteredItems.length === 0) {
        return <p className="empty-msg">No {viewCompleted ? 'completed' : 'incomplete'} tasks.</p>;
    }

    return filteredItems.map((item) => (
      <li key={item.id} className="todo-item">
        
        {/* CONDITIONAL RENDERING: Edit Mode vs View Mode */}
        {editingTodoId === item.id ? (
          
          // --- VIEW: EDIT MODE ---
          <div className="edit-mode">
            <input
              type="text"
              value={editingText}
              onChange={(e) => setEditingText(e.target.value)}
              className="edit-input"
              autoFocus
            />
            <div className="action-buttons">
              <button className="btn-save" onClick={() => saveEdit(item.id, item.completed)}>
                Save
              </button>
              <button className="btn-cancel" onClick={() => setEditingTodoId(null)}>
                Cancel
              </button>
            </div>
          </div>

        ) : (
          
          // --- VIEW: DISPLAY MODE ---
          <>
            <span 
                className={`todo-text ${item.completed ? 'completed' : ''}`}
                title={item.text}
            >
              {item.text}
            </span>
            
            <div className="action-buttons">
               <button 
                className="btn-secondary"
                onClick={() => startEditing(item)}
              >
                Edit
              </button>
              <button 
                className={item.completed ? 'btn-undo' : 'btn-success'}
                onClick={() => handleToggleComplete(item.id, item.completed, item.text)}
              >
                {item.completed ? "Undo" : "Done"}
              </button>
              <button 
                className="btn-danger"
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


  // =========================================================================
  // 5. MAIN RENDER (The UI)
  // =========================================================================

  return (
    <div className="app-container">
      
      <h1>My Tasks</h1>
      
      {/* 1. INPUT FORM */}
      <form onSubmit={handleAdd} className="todo-form">
        <input 
          type="text" 
          placeholder="What needs to be done?" 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <button type="submit" className="btn-add">Add Task</button>
      </form>

      {/* 2. TAB NAVIGATION */}
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

      {/* 3. TASK LIST */}
      <ul>
        {renderItems()}
      </ul>
    </div>
  )
}