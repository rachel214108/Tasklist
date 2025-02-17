
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import service from "../service.js";

function Tasks() {
  const [username, setUsername] = useState("");
  const [newTodo, setNewTodo] = useState("");
  const [todos, setTodos] = useState([]);
  const navigateToTask = useNavigate();

  useEffect(() => {
    //שליפת הטוקן
    const token = localStorage.getItem("token");
    //אם לא קיים לחזור להתחברות 
    if (!token) {
      navigateToTask("/login");
    } else {
      //שליפת המשימות למשתמש הבאה וקבלת שם המשתמש
      getTodos();
      const user = getUsernameFromToken(token);
      setUsername(user);
    }
  }, []);

  async function getTodos() {
    try {
      const todos = await service.getTasks();
      setTodos(todos);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  }
  
  


  // שולף את שם הUSER 
  //אם קידוד
  function getUsernameFromToken(token) {
    try {
        const payload = token.split('.')[1];
        
        // החלפת תווים כדי להפוך את הקידוד ל- Base64 תקני
        const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
        
        // הוספת ריפוד אם חסר
        const paddedBase64 = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
        
        // פענוח ה- Base64 למחרוזת
        const jsonPayload = decodeURIComponent(
            atob(paddedBase64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        
        const decodedPayload = JSON.parse(jsonPayload);
        
        return decodedPayload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"];
    } catch (error) {
        console.error('Invalid token:', error);
        return '';
    }
}

  

  async function createTodo(e) {
    e.preventDefault();
    await service.addTask(newTodo);
    setNewTodo("");
    await getTodos();
  }

  async function updateCompleted(todo, isComplete) {
    await service.setCompleted(todo.id, isComplete);
    await getTodos();
  }

  async function deleteTodo(id) {
    await service.deleteTask(id);
    await getTodos();
  }
  
return (
  <>
    <header className="app-header">
    <div className="logo-container">
        <div className="logo-circle">
            <span className="logo-icon">✓</span>
        </div>
    
    </div>
   
      <div className="user-info">
        <span>Welcome,{username}</span>
        <Link to="/" onClick={() => localStorage.removeItem("token")}>
          LogOut
        </Link>
      </div>
    </header>

    <section className="todoapp">
      <header className="header">
        <h1>todos</h1>
        <form onSubmit={createTodo}>
          <input
            className="new-todo"
            placeholder="Well, let's take on the day"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
          />
        </form>
      </header>
      <section className="main" style={{ display: "block" }}>
        <ul className="todo-list">
          {todos.map((todo) => {
            return (
              <li className={todo.isComplete ? "completed" : ""} key={todo.id}>
                <div className="view">
                  <input
                    className="toggle"
                    type="checkbox"
                    defaultChecked={todo.isComplete}
                    onChange={(e) => updateCompleted(todo, e.target.checked)}
                  />
                  <label>{todo.name}</label>
                  <button className="destroy" onClick={() => deleteTodo(todo.id)}></button>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </section>
  </>
);
}

export default Tasks;
 
