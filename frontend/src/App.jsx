import { Component } from "react";
import "./styles.css";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      viewCompleted: false,
      todoList: [],
      editingTodo: null, // State to track the currently edited todo
      editingText: "", // State to track the text being edited
    };
  }

  componentDidMount() {
    this.refreshList();
  }

  refreshList = () => {
    fetch("/todos")
      .then((response) => response.json())
      .then((data) => this.setState({ todoList: data }))
      .catch((error) => console.error("Error fetching todos:", error));
  };

  displayCompleted = (status) => {
    this.setState({ viewCompleted: status });
  };

  handleAdd = () => {
    const newTodo = {
      text: "New Task text",
    };

    fetch("/todos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newTodo),
    })
      .then(this.refreshList)
      .catch((error) => console.error("Error adding todo:", error));
  };

  handleEditClick = (todo) => {
    this.setState({ editingTodo: todo.id, editingText: todo.text });
  };

  handleEditChange = (event) => {
    this.setState({ editingText: event.target.value });
  };

  handleSave = (id) => {
    const updatedTodo = {
      text: this.state.editingText,
      completed: this.state.todoList.find(todo => todo.id === id).completed,
    };

    fetch(`/todos/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedTodo),
    })
      .then(() => {
        this.setState({ editingTodo: null, editingText: "" });
        this.refreshList();
      })
      .catch((error) => console.error("Error editing todo:", error));
  };

  handleDelete = (id) => {
    fetch(`/todos/${id}`, {
      method: "DELETE",
    })
      .then(this.refreshList)
      .catch((error) => console.error("Error deleting todo:", error));
  };

  handleToggleComplete = (id, completed) => {
    const updatedTodo = {
      completed: !completed,
      text: this.state.todoList.find(todo => todo.id === id).text,
    };

    fetch(`/todos/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedTodo),
    })
      .then(this.refreshList)
      .catch((error) => console.error("Error toggling todo:", error));
  };

  renderTabList = () => {
    return (
      <div className="nav nav-tabs">
        <span
          className={this.state.viewCompleted ? "nav-link active" : "nav-link"}
          onClick={() => this.displayCompleted(true)}
        >
          Complete
        </span>
        <span
          className={this.state.viewCompleted ? "nav-link" : "nav-link active"}
          onClick={() => this.displayCompleted(false)}
        >
          Incomplete
        </span>
      </div>
    );
  };

  renderItems = () => {
    const { viewCompleted, todoList, editingTodo, editingText } = this.state;
    const newItems = todoList.filter((item) => item.completed === viewCompleted);

    return newItems.map((item) => (
      <li
        key={item.id}
        className="list-group-item d-flex justify-content-between align-items-center"
      >
        {editingTodo === item.id ? (
          <input
            type="text"
            value={editingText}
            onChange={this.handleEditChange}
            className="form-control"
          />
        ) : (
          <span
            className={`todo-title mr-2 ${
              viewCompleted ? "completed-todo" : ""
            }`}
            title={item.text}
          >
            {item.text}
          </span>
        )}
        <span>
          {editingTodo === item.id ? (
            <button
              className="btn btn-primary mr-2"
              onClick={() => this.handleSave(item.id)}
            >
              Save
            </button>
          ) : (
            <button
              className="btn btn-secondary mr-2"
              onClick={() => this.handleEditClick(item)}
            >
              Edit
            </button>
          )}
          <button
            className="btn btn-danger mr-2"
            onClick={() => this.handleDelete(item.id)}
          >
            Delete
          </button>
          <button
            className="btn btn-success"
            onClick={() => this.handleToggleComplete(item.id, item.completed)}
          >
            {item.completed ? "Undo" : "Complete"}
          </button>
        </span>
      </li>
    ));
  };

  render() {
    return (
      <main className="container">
        <h1 className="text-white text-uppercase text-center my-4">Todo app</h1>
        <div className="row">
          <div className="col-md-6 col-sm-10 mx-auto p-0">
            <div className="card p-3">
              <div className="mb-4">
                <button
                  className="btn btn-primary"
                  onClick={this.handleAdd}
                >
                  Add task
                </button>
              </div>
              {this.renderTabList()}
              <ul className="list-group list-group-flush border-top-0">
                {this.renderItems()}
              </ul>
            </div>
          </div>
        </div>
      </main>
    );
  }
}

export default App;