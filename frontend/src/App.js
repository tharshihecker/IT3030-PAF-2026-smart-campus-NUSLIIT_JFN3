import { useState } from "react";
import "./App.css";

const views = ["home", "login", "signup", "logout"];

function App() {
  const [view, setView] = useState("home");

  return (
    <div className="app-shell">
      <header className="topbar">
        <h1>Smart Campus</h1>
        <nav>
          {views.map((item) => (
            <button
              key={item}
              type="button"
              className={view === item ? "active" : ""}
              onClick={() => setView(item)}
            >
              {item}
            </button>
          ))}
        </nav>
      </header>

      <main className="card">
        {view === "home" && <Home />}
        {view === "login" && <Login />}
        {view === "signup" && <Signup />}
        {view === "logout" && <Logout />}
      </main>
    </div>
  );
}

function Home() {
  return (
    <section>
      <h2>Home</h2>
      <p>Starter dashboard for Smart Campus team development.</p>
    </section>
  );
}

function Login() {
  return (
    <section>
      <h2>Login</h2>
      <form className="form-grid">
        <input type="email" placeholder="Email" required />
        <input type="password" placeholder="Password" required />
        <button type="submit">Sign In</button>
      </form>
    </section>
  );
}

function Signup() {
  return (
    <section>
      <h2>Sign Up</h2>
      <form className="form-grid">
        <input type="text" placeholder="Full Name" required />
        <input type="email" placeholder="University Email" required />
        <input type="password" placeholder="Create Password" required />
        <button type="submit">Create Account</button>
      </form>
    </section>
  );
}

function Logout() {
  return (
    <section>
      <h2>Logout</h2>
      <p>You have been logged out from this demo template page.</p>
    </section>
  );
}

export default App;

