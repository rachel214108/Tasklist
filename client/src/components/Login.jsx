import React, { useState } from 'react';
import service from '../service.js';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      //מפעיל את הפונקציה של ההתחברות מהSERVICE
      const response = await service.login(username, password);
      //  בדיקת התשובה    
      if (response && response.token) {
        //שמירת הטוקן  שחבר ב - localStorage
        localStorage.setItem('token', response.token);
        //ההעברה לדף המשימות 
        navigate('/tasks');
      }
    } 
    //במקרה של שגיאה 
    catch (error) {
      // response במקרה של שגוי 
      if (error.response) {
        //שגיאת לקוח 
        if (error.response.status === 400) {
          alert(error.response.data.message); // הודעה: "User does not exist in the system."
          //נשלח להרשמה 
          navigate('/Register')
        } //אם חזר מהשרת 401 בעיה בסיסמה
        else if (error.response.status === 401) {
          alert(error.response.data.message); // הודעה: "Invalid password."
        } 
        //מקרה אחר שגיאה כללית 
        else {
          alert('Login failed! Please try again.');
        }
      }
    }
  };

  return (
    <>
      <header className="app-header">
        <div className="logo-container">
          <div className="logo-circle">
            <span className="logo-icon">✓</span>
          </div>
          <div className="slogan">Your tasks, your way.</div>
        </div>
      </header>

      <section className="todoapp">
        <header className="header">

          <h1>Login </h1>
        </header>
        <section className="main">
          <input
            className="new-todo"
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            className="new-todo"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="new-todo" style={{ cursor: 'pointer' }} onClick={handleLogin}>Login</button>
          <p>
            Don't have an account? <a href="/register">Register here</a>.
          </p>
        </section>
      </section>

    </>
  );
}

export default Login;


