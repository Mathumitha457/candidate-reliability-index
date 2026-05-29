import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import "./App.css";

/* LOGIN */
function Login({ setAuth }) {
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");

  const login = () => {
    if (u === "admin" && p === "admin123") {
      localStorage.setItem("auth", "true");
      setAuth(true);
    } else {
      setError("❌ Invalid Username or Password");
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <h1>🔷 Reliabilix</h1>
        <p>Candidate Reliability System</p>

        <input
          className="login-field"
          type="text"
          placeholder="Username"
          value={u}
          onChange={(e) => setU(e.target.value)}
        />

        <div className="password-box">
          <input
            className="login-field"
            type={show ? "text" : "password"}
            placeholder="Password"
            value={p}
            onChange={(e) => setP(e.target.value)}
          />

          <span className="eye-icon" onClick={() => setShow(!show)}>
            <i className={show ? "fa-solid fa-eye-slash" : "fa-solid fa-eye"}></i>
          </span>
        </div>

        {error && <p className="login-error">{error}</p>}

        <button className="login-button" onClick={login}>
          Login
        </button>
      </div>
    </div>
  );
}

/* DASHBOARD */
function Dashboard() {
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const loadUsers = () =>
    fetch("http://localhost:5000/api/users")
      .then((r) => r.json())
      .then((data) => {
        setUsers(data);
        setAllUsers(data);
      });

  useEffect(() => {
    loadUsers();
  }, []);

  /* ✅ FIXED ADD USER */
  const addUser = () => {
    if (!name || !email) return;

    fetch("http://localhost:5000/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    }).then(() => {
      loadUsers();

      // 🔥 IMPORTANT FIX
      setName("");
      setEmail("");
    });
  };

  const updateScore = (id, category, change) => {
    fetch(`http://localhost:5000/api/users/${id}/score`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category, change }),
    }).then(loadUsers);
  };

  const delUser = (id) =>
    fetch(`http://localhost:5000/api/users/${id}`, {
      method: "DELETE",
    }).then(loadUsers);

  const handleSearch = (value) => {
    const filtered = allUsers.filter((u) =>
      u.name.toLowerCase().includes(value.toLowerCase())
    );
    setUsers(filtered);
  };

  const maxTotal = Math.max(...users.map((u) => u.total || 0), 0);

  return (
    <div className="container">
      <h2>Candidate Dashboard</h2>

      <input
        placeholder="Search..."
        onChange={(e) => handleSearch(e.target.value)}
        style={{ padding: "8px", marginBottom: "10px" }}
      />

      <div className="add-box">
        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button className="add-btn" onClick={addUser}>
          Add
        </button>
      </div>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Attendance</th>
            <th>Performance</th>
            <th>Internship</th>
            <th>Behaviour</th>
            <th>Total</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {users.map((u) => (
            <tr
              key={u._id}
              style={{
                background: u.total === maxTotal ? "#fef9c3" : "white",
              }}
            >
              <td>{u.name}</td>
              <td>{u.email}</td>

              {["attendance", "performance", "internship", "behaviour"].map(
                (cat) => (
                  <td key={cat}>
                    <div className="score-cell">
                      <button
                        className="score-btn plus"
                        onClick={() => updateScore(u._id, cat, 10)}
                      >
                        +10
                      </button>

                      <span>{u[cat]}</span>

                      <button
                        className="score-btn minus"
                        onClick={() => updateScore(u._id, cat, -5)}
                      >
                        -5
                      </button>
                    </div>
                  </td>
                )
              )}

              <td>{u.total || 0}</td>

              <td>
                {u.total >= 80
                  ? "Excellent"
                  : u.total >= 50
                  ? "Good"
                  : "Needs Improvement"}
              </td>

              <td>
                <button onClick={() => delUser(u._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* GRAPH */
function Graph() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/users")
      .then((r) => r.json())
      .then(setUsers);
  }, []);

  return (
    <div className="container">
      <h2>Score Graph</h2>

      <Bar
        data={{
          labels: users.map((u) => u.name),
          datasets: [
            { label: "Attendance", data: users.map((u) => u.attendance) },
            { label: "Performance", data: users.map((u) => u.performance) },
            { label: "Internship", data: users.map((u) => u.internship) },
            { label: "Behaviour", data: users.map((u) => u.behaviour) },
          ],
        }}
      />
    </div>
  );
}

/* APP */
export default function App() {
  const [auth, setAuth] = useState(
    localStorage.getItem("auth") === "true"
  );

  const logout = () => {
    localStorage.removeItem("auth");
    setAuth(false);
  };

  if (!auth) return <Login setAuth={setAuth} />;

  return (
    <Router>
      <nav className="nav">
        <h1>🔷 Reliabilix</h1>

        <div className="nav-right">
          <Link to="/">Dashboard</Link>
          <Link to="/graph">Graph</Link>

          <button className="logout-btn" onClick={logout}>
            Logout
          </button>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/graph" element={<Graph />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}