import React from 'react';
import { useNavigate } from 'react-router-dom';


function Home() {
  const navigate = useNavigate();
//העברה להתחברות 
  const handleLogin = () => {
    navigate('/Login');
  };
//העברה להרשמה 
  const handleRegister = () => {
    navigate('/Register');
  };

  return (
    <>
      <header className="app-header-home">
        <div className="logo-container-home">
          <div className="logo-circle-home">
            <span className="logo-icon-home">✓</span>
          </div>
          <div className="slogan-home">Your tasks, your way.</div>
        </div>
      </header>

      <section className="todoapp">
        <header className="header">

          <h1>Welcome </h1>
          </header>
        <section className="main" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <button className="new-todo" style={{ margin: "10px", cursor: "pointer" }} onClick={handleLogin} >Login</button>
          <button className="new-todo"
            style={{ margin: "10px", cursor: "pointer" }} onClick={handleRegister} >Register</button>
        </section>
      </section>
      
    </>

  );
}

export default Home;

