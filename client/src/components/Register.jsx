import React, { useState } from 'react';
import service from '../service.js'
import { useNavigate } from 'react-router-dom';


function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      console.log('Attempting registration:', { username, password });

      //  קריאת ה-API להרשמה- SEVICE
      const response = await service.register(username, password);
      // בדיקה אם המשתמש נרשם בהצלחה
      if (response.message === 'User registered successfully.') {
        alert('User registered successfully!');
        if (response.token) {
          localStorage.setItem('token', response.token); //  - localStorage שומר את הטוקן
        }
        navigate('/tasks'); // הפניה לדף המשימות
      }
 }
    catch (error) {
      console.error('Registration error:', error);

      // טיפול בשגיאות אפשריות
      if (error.response) {
        //כבר נרשם 
        if (error.response.data === 'Username already exists.') {
          alert('Username already exists! Redirecting to login...');
          navigate('/Login'); // הפניה לדף ההתחברות
        } else {
          alert('Registration failed! Please try again.');
        }
      } else {
        alert('Unexpected error! Please try again.');
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
          <h1>Register</h1>
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
          <button className="new-todo" style={{ cursor: 'pointer' }} onClick={handleRegister}>Register</button>
          <p>
            Do have an account? <a href="/Login">Login here</a>.
          </p>
        </section>
      </section>
    </>
  );
}



export default Register;

