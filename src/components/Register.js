import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Register({ setIsAuthenticated }) {
  // Stan dla loginu, emaila, hasła oraz błędów
  const [login, setLogin] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  // Hook do nawigacji między stronami
  const navigate = useNavigate();

  // Obsługa wysyłania formularza rejestracji
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // Wysyłamy dane użytkownika do API
      const response = await axios.post(
        "http://localhost:5109/api/Register/register",
        {
          login,
          email,
          password,
        }
      );

      if (response.status === 200) {
        localStorage.setItem("token", response.data.token); // Zapis tokena do LocalStorage
        setIsAuthenticated(true); // Ustawienie użytkownika jako zalogowanego
        navigate("/user");
      }
    } catch (error) {
      console.log(error);
      setError(error.response.data?.message || "Login failed");
    }
  };

  return (
    <div>
      {/* Formularz rejestracyjny */}
      <h2>Zarejestruj się</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nazwa uytkownika:</label>
          <input
            type="text"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            required
          />
        </div>
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
        <button type="submit">Zarejestruj się</button>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </form>
    </div>
  );
}

export default Register;
