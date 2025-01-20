import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login({ setIsAuthenticated }) {
  // Stany dla danych formularza (e-mail, hasło) oraz ewentualnych błędów
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Hook do nawigacji po zalogowaniu
  const navigate = useNavigate();

  // Obsługa przesłania formularza
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // Wysyłanie żądania POST do API w celu zalogowania użytkownika
      const response = await axios.post(
        "http://localhost:5109/api/auth/login",
        {
          email,
          password,
        }
      );

      if (response.status === 200) {
        localStorage.setItem("token", response.data.token);
        setIsAuthenticated(true);
        navigate("/user");
      }
    } catch (error) {
      setError(error.response.data?.message || "Login failed");
    }
  };

  return (
    <div>
      {/* Formularz logowania */}
      <h2>Zaloguj się</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Hasło:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Zaloguj się</button>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </form>
    </div>
  );
}

export default Login;
