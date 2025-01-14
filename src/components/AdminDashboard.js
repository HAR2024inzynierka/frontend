import React, { useState, useEffect } from "react";
import axios from "axios";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import  { jwtDecode } from "jwt-decode";

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

const Button = styled.button`
  background-color: #00509e;
  color: white;
  border: none;
  padding: 10px 15px;
  margin: 5px;
  border-radius: 5px;
  cursor: pointer;
  &:hover {
    background-color: #01295f;
  }
`;

const Modal = styled.div`
  background: rgba(0, 0, 0, 0.5);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalContent = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  max-width: 500px;
  width: 100%;
`;

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [workshops, setWorkshops] = useState([]);
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newWorkshop, setNewWorkshop] = useState({
    email: "",
    address: "",
    phoneNumber: "",
  });
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [accessDenied, setAccessDenied] = useState(true);

  const handleDetailsClick = (workshop) => {
    navigate("/admin/workshop-dashboard", { state: { workshop } });
  };

  // Fetch users and workshops
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        if (!token) {
          throw new Error("Brak tokena w localStorage");
        }

        const decodedToken = jwtDecode(token);
        if (decodedToken.role === "1") {
          setAccessDenied(false);
          //return;
        }

        const response = await axios.get(
          "http://localhost:5109/api/admin/users",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const recordsResponse = await axios.get(
          `http://localhost:5109/api/admin/Record`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setRecords(recordsResponse.data);
        setUsers(response.data);
      } catch (err) {
        setError("Nie udało się pobrać listy użytkowników.");
      }
    };

    const fetchWorkshops = async () => {
      try {
        if (!token) {
          throw new Error("Brak tokena w localStorage");
        }

        const response = await axios.get(
          "http://localhost:5109/api/AutoRepairShop/workshops",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setWorkshops(response.data);
      } catch (err) {
        setError("Nie udało się pobrać listy warsztatów.");
      }
    };

    fetchUsers();
    fetchWorkshops();
  }, [token]);

  // Add Workshop
  const handleAddWorkshop = async (e) => {
    if (e) e.preventDefault();
    try {
      await axios.post(
        "http://localhost:5109/api/admin/workshop",
        newWorkshop,
        {
          headers: { 
            Authorization: `Bearer ${token}`, },
        }
      );

      const updatedWorkshops = await axios.get(
        "http://localhost:5109/api/AutoRepairShop/workshops",
        {
          headers: { Authorization: `Bearer ${token}`, },
        }
      );

      setWorkshops(updatedWorkshops.data);
      setIsAddModalOpen(false);
      setNewWorkshop({ email: "", address: "", phoneNumber: "" });
    } catch (err) {
      setError("Nie udało się dodać warsztatu.");
    }
  };

  const handleCompleteRecord = async (recordId) => {
    try {
      const response = await axios.put(
        `http://localhost:5109/api/admin/Record/complete/${recordId}`,
        {},
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            Accept: '*/*',
          }
        }
      );
      if (response.status === 200) {
        // Обновляем список записей после успешного завершения
        setRecords((prevRecords) =>
          prevRecords.map((record) =>
            record.id === recordId
              ? { ...record, completionDate: new Date().toISOString() } // Добавляем дату завершения
              : record
          )
        );
        alert("Usługa została zakończona!");
      } else {
        alert("Wystąpił błąd podczas zakończenia usługi.");
      }
    } catch (error) {
      console.error("Error completing record:", error);
      alert("Nie udało się zakończyć usługi.");
    }
  };


  if(accessDenied){
    return <p>Access Denied</p>
  }

  return (
    <Container>
      {/* Użytkownicy */}
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
                <TableCell>{user.phoneNumber || "Brak"}</TableCell>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <p>Brak użytkowników do wyświetlenia.</p>
      )}

      {/* Warsztaty */}
      <Title>Lista warsztatów</Title>
      <Button onClick={() => setIsAddModalOpen(true)}>Dodaj Warsztat</Button>
      {workshops.length > 0 ? (
        <Table>
          <thead>
            <tr>
              <TableHeader>ID</TableHeader>
              <TableHeader>Email</TableHeader>
              <TableHeader>Adres</TableHeader>
              <TableHeader>Numer Telefonu</TableHeader>
              <TableHeader>Szczegóły</TableHeader>
            </tr>
          </thead>
          <tbody>
            {workshops.map((workshop) => (
              <tr key={workshop.id}>
                <TableCell>{workshop.id}</TableCell>
                <TableCell>{workshop.email}</TableCell>
                <TableCell>{workshop.address}</TableCell>
                <TableCell>{workshop.phoneNumber}</TableCell>
                <TableCell>
                  <Button
                    onClick={() => {
                      handleDetailsClick(workshop);
                    }}
                  >
                    Szczegóły
                  </Button>
                </TableCell>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <p>Brak warsztatów do wyświetlenia.</p>
      )}

      {/* Dodawanie Warsztatu */}
      {isAddModalOpen && (
        <Modal>
          <ModalContent>
            <h2>Dodaj Warsztat</h2>
            <form>
              <div>
                <label>Email:</label>
                <input
                  type="email"
                  value={newWorkshop.email}
                  onChange={(e) =>
                    setNewWorkshop({ ...newWorkshop, email: e.target.value })
                  }
                />
              </div>
              <div>
                <label>Adres:</label>
                <input
                  type="text"
                  value={newWorkshop.address}
                  onChange={(e) =>
                    setNewWorkshop({ ...newWorkshop, address: e.target.value })
                  }
                />
              </div>
              <div>
                <label>Numer Telefonu:</label>
                <input
                  type="text"
                  value={newWorkshop.phoneNumber}
                  onChange={(e) =>
                    setNewWorkshop({
                      ...newWorkshop,
                      phoneNumber: e.target.value,
                    })
                  }
                />
              </div>
              <Button onClick={handleAddWorkshop}>Dodaj</Button>
              <Button
                onClick={() => setIsAddModalOpen(false)}
                style={{ backgroundColor: "#931621" }}
              >
                Anuluj
              </Button>
            </form>
          </ModalContent>
        </Modal>
      )}
      <div>
  <h3>Zapisy</h3>
  <Table>
    <thead>
      <tr>
        <TableHeader>ID</TableHeader>
        <TableHeader>Pojazd</TableHeader>
        <TableHeader>Usługa</TableHeader>
        <TableHeader>Koszt</TableHeader>
        <TableHeader>Data Rozpoczęcia</TableHeader>
        <TableHeader>Data Zakończenia</TableHeader>
      </tr>
    </thead>
    <tbody>
      {records.map((record) => (
        <tr key={record.id}>
          <TableCell>{record.id}</TableCell>
          <TableCell>
            {record.vehicle.brand} {record.vehicle.model} (
            {record.vehicle.registrationNumber})
          </TableCell>
          <TableCell>{record.favour.typeName}</TableCell>
          <TableCell>{record.favour.price} zł</TableCell>
          <TableCell>{new Date(record.term.startDate).toLocaleString()}</TableCell>
          <TableCell>{new Date(record.term.endDate).toLocaleString()}</TableCell>
          <TableCell>
            {/* Кнопка завершения записи */}
            <Button
              onClick={() => handleCompleteRecord(record.id)}
              disabled={!!record.completionDate} // Блокируем кнопку, если услуга уже завершена
            >
              {record.completionDate ? "Ukończono" : "Zakończ"}
            </Button>
          </TableCell>
        </tr>
      ))}
    </tbody>
  </Table>
</div>

    </Container>
  );
}

export default AdminDashboard;
