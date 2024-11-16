import React, { useEffect, useState } from "react";
import axios from "axios";
import styled from "styled-components";

const FormContainer = styled.div`
  background: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  margin: 20px 0;
`;

const FormInput = styled.input`
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 16px;

  &:focus {
    border-color: #01295f; /* Kolor obramowania na fokus */
    outline: none; /* Usunięcie standardowego obramowania */
  }
`;

const SubmitButton = styled.button`
  background-color: #01295f;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  transition: background-color 0.3s;

  &:hover {
    background-color: #00509e; /* Jaśniejszy kolor przycisku na hover */
  }
`;

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [workshops, setWorkshops] = useState([]);
  const [newWorkshop, setNewWorkshop] = useState({
    email: "",
    address: "",
    phoneNumber: "",
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5109/api/admin/users",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setUsers(response.data);
      } catch (error) {
        console.error("Access denied or error fetching users.", error);
      }
    };
    const fetchWorkshops = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5109/api/admin/workshops",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setWorkshops(response.data);
      } catch (error) {
        console.error("Accessdenied or error fetching users.", error);
      }
    };
    fetchUsers();
    fetchWorkshops();
  }, [token]);

  const handleAddWorkshop = async (e) => {
    e.preventDefault();
    const newWorkshopData = {
      email: String(newWorkshop.email),
      address: String(newWorkshop.address),
      phoneNumber: String(newWorkshop.phoneNumber),
    };

    try {
      const addWorkshopResponse = await axios.post(
        `http://localhost:5109/api/admin/workshop`,
        newWorkshopData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setNewWorkshop({ email: "", address: "", phoneNumber: "" });
      window.location.reload();
    } catch (error) {
      console.error(
        "Błąd podczas dodawania samochodu:",
        error.response?.data || error.message
      );
      alert("Nie udało się dodać samochodu. Sprawdź dane i spróbuj ponownie.");
    }
  };

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <h2>All Users</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Login</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.login}</td>
              <td>{user.email}</td>
              <td>{user.phoneNumber}</td>
              <td>{user.role === 1 ? "Admin" : "User"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <FormContainer>
        <h3>Dodaj Warsztat</h3>
        <form onSubmit={handleAddWorkshop}>
          <FormInput
            type="text"
            placeholder="Email"
            value={newWorkshop.email}
            onChange={(e) =>
              setNewWorkshop({ ...newWorkshop, email: e.target.value })
            }
            required
          />
          <FormInput
            type="text"
            placeholder="Address"
            value={newWorkshop.address}
            onChange={(e) =>
              setNewWorkshop({ ...newWorkshop, address: e.target.value })
            }
            required
          />
          <FormInput
            type="text"
            placeholder="Numer Telefonu"
            value={newWorkshop.phoneNumber}
            onChange={(e) =>
              setNewWorkshop({ ...newWorkshop, phoneNumber: e.target.value })
            }
            required
          />
          <SubmitButton type="submit">Dodaj Warsztat</SubmitButton>
        </form>
      </FormContainer>
      <h2>All Workshops</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Email</th>
            <th>Address</th>
            <th>Phone</th>
          </tr>
        </thead>
        <tbody>
          {workshops.map((workshop) => (
            <tr key={workshop.id}>
              <td>{workshop.id}</td>
              <td>{workshop.email}</td>
              <td>{workshop.address}</td>
              <td>{workshop.phoneNumber}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminDashboard;
