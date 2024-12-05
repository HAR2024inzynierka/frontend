import React, { useState, useEffect } from "react";
import axios from "axios";
import styled from "styled-components";

// Styled-components
const Container = styled.div`
  padding: 20px;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: bold;
  color: #01295f;
  margin-bottom: 20px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
`;

const TableHeader = styled.th`
  background-color: #01295f;
  color: white;
  padding: 10px;
  border: 1px solid #ddd;
  text-align: left;
`;

const TableCell = styled.td`
  padding: 10px;
  border: 1px solid #ddd;
  text-align: left;
`;

const ErrorMessage = styled.div`
  color: red;
  margin-top: 20px;
`;

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        if (!token) {
          throw new Error("Brak tokena w localStorage");
        }

        // Wykonujemy żądanie Axios
        const response = await axios.get("http://localhost:5109/api/admin/users", {
          headers: {
            Authorization: `Bearer ${token}`, // Dodajemy token w nagłówku
          },
        });

        setUsers(response.data); // Ustawiamy dane użytkowników w stanie
      } catch (err) {
        console.error("Nie udało się pobrać listy użytkowników (Axios):", err);
        setError("Nie udało się pobrać listy użytkowników."); // Ustawiamy komunikat o błędzie
      }
    };

    fetchUsers();
  },[]);
  

  return (
    <Container>
      <Title>Lista użytkowników</Title>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {users.length > 0 ? (
        <Table>
          <thead>
            <tr>
              <TableHeader>ID</TableHeader>
              <TableHeader>Login</TableHeader>
              <TableHeader>Email</TableHeader>
              <TableHeader>Numer Telefonu</TableHeader>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.login}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.numerTelefonu || "Brak"}</TableCell>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <p>Brak użytkowników do wyświetlenia.</p>
      )}
    </Container>
  );
}

export default AdminDashboard;
