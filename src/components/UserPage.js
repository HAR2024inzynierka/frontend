import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import VehicleCard from './VehicleCard';
import styled from 'styled-components';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';  // Import stylów kalendarza


// Styled-components
const ButtonContainer = styled.div`
  display: flex;
  gap: 10px;
`;

const UserPageContainer = styled.div`
  padding: 20px;`
;

const TopSection = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 20px;
  gap: 20px;
`;

const WelcomeMessage = styled.h2`
  margin: 20px 0;
  font-size: 24px;
  font-weight: bold;
  color: #01295f;
`;

const UserInfoCard = styled.div`
  background: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  margin-top: 20px;
  margin-bottom: 20px;
`;

const UserInfoLabel = styled.p`
  font-size: 16px;
  color: #01295f;
  margin: 10px 0;
`;

const EditButton = styled.button`
  background-color: #01295f;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
  margin-top: 20px;

  &:hover {
    background-color: #00509e;
  }
`;

const AddCarButton = styled.button`
  background-color: #01295f;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;

  &:hover {
    background-color: #00509e;
  }
`;

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
    border-color: #01295f;
    outline: none;
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
  transition: background-color 0.3s;

  &:hover {
    background-color: #00509e;
  }
`;

const CarsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  margin-top: 20px;
`;

const UserInfoValue = styled.span`
  color: black;
`;

const CancelButton = styled(EditButton)`
  background-color: #931621;
  margin-left: 15px;

  &:hover {
    background-color: darkred;
  }
`;

const DynamicAddCarButton = styled(AddCarButton)`
  background-color: ${(props) => (props.iscancel ? "#931621" : "#01295f")};
  &:hover {
    background-color: ${(props) => (props.iscancel ? "darkred" : "#00509e")};
  }
`;

// New styled component for "Back to Vehicle List" button
const BackToListButton = styled.button`
  background-color: #01295f;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
  width: 100%;
  margin-top: 20px;

  &:hover {
    background-color: #00509e;
  }
`;

// New styled component for the card container that holds vehicles and the "Back to List" button
const CardContainer = styled.div`
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-top: 20px;
`;

const ModalBackground = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  max-width: 600px;
  width: 100%;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const AppointmentDetails = styled.div`
  margin-top: 20px;
  font-size: 16px;
  color: #01295f;
`;

// Styled-components
const TwoColumnLayout = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
`;

const LeftColumn = styled.div`
  flex: 1;
  margin-right: 20px;
`;

const RightColumn = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const SectionTitle = styled.h3`
  font-size: 20px;
  color: #01295f;
  margin-bottom: 10px;
`;

const StyledCalendar = styled(Calendar)`
  width: 100%; // Rozciągnij do pełnej szerokości kontenera
  max-width: 600px; // Maksymalna szerokość
  font-size: 1.2em; // Powiększenie tekstu i elementów
`;




function UserPage() {
  const [user, setUser] = useState(null);
  const [cars, setCars] = useState([]);
  const [newCar, setNewCar] = useState({
    brand: '',
    model: '',
    registrationNumber: '',
    capacity: '',
    power: '',
    vin: '',
    productionYear: ''
  });
  const [showVehicles, setShowVehicles] = useState(false);
  const [editingUser, setEditingUser] = useState(false);
  const [editedUser, setEditedUser] = useState({
    login: '',
    email: '',
    phone: ''
  });
  const [showForm, setShowForm] = useState(false);
  const [addingNewCar, setAddingNewCar] = useState(true);
  const [iscancel, setIsCancel] = useState(false);
  const [error, setError] = useState(null);
  const [editingCar, setEditingCar] = useState(null);
  const [editedCar, setEditedCar] = useState({});
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [appointments, setAppointments] = useState([]); // Przechowujemy wizyty
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedDate, setSelectedDate] = useState(); // Wybrany dzień
  const [isModalOpen, setIsModalOpen] = useState(false);

  



  
  const token = localStorage.getItem('token');
  const userId = token ? jwtDecode(token).nameid : null;

  const toggleForm = () => {
    setShowForm(!showForm);
    setIsCancel(!showForm); // Ustawiamy iscancel na true, jeśli formularz jest pokazany
  };

  // Fetch user and vehicles data
  useEffect(() => {
    if (!userId || !token) return;

    const fetchUserData = async () => {
      try {
        const [userResponse, carsResponse, appointmentsResponse] = await Promise.all([
          axios.get(`http://localhost:5109/api/user/${userId}`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`http://localhost:5109/api/user/${userId}/vehicles`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`http://localhost:5109/api/user/${userId}/records`, { headers: { Authorization: `Bearer ${token}` } }) // Pobranie wizyt

        ]);
        setUser(userResponse.data);
        setCars(carsResponse.data);
        setAppointments(appointmentsResponse.data);
        setEditedUser({
          login: userResponse.data.login,
          email: userResponse.data.email,
          phone: userResponse.data.phone || 'Brak'
        }, [user]);

        console.log("Appointments:", appointmentsResponse.data);
      } catch (error) {
        console.error("Błąd przy pobieraniu danych użytkownika:", error.response?.data || error.message);
      }
    };

    fetchUserData();
  }, [userId, token]);

  const handleVehicleClick = (car) => {
    setSelectedVehicle(car);  // Store the clicked vehicle's details
  };

  // Funkcja do pobierania wizyt z API na dany dzień
  const fetchAppointments = async (date) => {
    try {
      const response = await axios.get(`http://localhost:5109/api/appointments?date=${date}`);
      setAppointments(response.data); // Zapisz wizyty w stanie
    } catch (error) {
      console.error('Błąd przy pobieraniu wizyt:', error);
    }
  };

  // Wywołanie pobierania wizyt za każdym razem, gdy zmienia się wybrany dzień
  useEffect(() => {
    fetchAppointments(selectedDate); // Pobierz wizyty dla wybranego dnia
  }, [selectedDate]);

  // Otwieranie modala
  const openModal = () => {
    setIsModalOpen(true);
  };

  // Zamknięcie modala
  const closeModal = () => {
    setIsModalOpen(false);
  };
  

  // Handle car deletion
  const handleCarDelete = async (carId) => {
    try {
      await axios.delete(
        `http://localhost:5109/api/user/${userId}/vehicle/${carId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Update state directly to remove the car
      setCars((prevCars) => prevCars.filter((car) => car.id !== carId));  
    } catch (error) {
      console.error("Błąd przy usuwaniu pojazdu:", error.response?.data || error.message);
    }
  };

  // Handle car edit submission
  const handleCarEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `http://localhost:5109/api/user/${userId}/vehicle/${editedCar.id}`,
        editedCar,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Po udanej edycji, zaktualizuj pojazd w stanie
      setCars(cars.map((car) =>
        car.id === editedCar.id ? { ...car, ...editedCar } : car
      ));
      setEditingCar(null); // Zakończ edycję
    } catch (error) {
      console.error("Błąd przy edytowaniu pojazdu:", error.response?.data || error.message);
    }
  };

  // Validate form fields
  const validateForm = () => {
    return Object.values(newCar).every(value => value.trim() !== ''); // ensure no field is empty
  };

  // Handle user data edit submission
  const handleUserEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `http://localhost:5109/api/User/${userId}`,
        editedUser,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser(response.data);
      setEditingUser(false); 
    } catch (error) {
      console.error("Błąd przy edytowaniu danych użytkownika:", error.response?.data || error.message);
      setError("Nie udało się zaktualizować danych użytkownika. Spróbuj ponownie.");
    }
  };

  const handleBackToVehicleList = () => {
    setSelectedVehicle(null); // Clear selected vehicle
    setEditingCar(null); // Stop editing mode
  };

  const handleDateClick = (date) => {
    const clickedDate = date.setHours(0, 0, 0, 0); // Ustawiamy godzinę na 00:00:00
    const appointment = appointments.find((appt) => {
      const appointmentDate = new Date(appt.recordDate).setHours(0, 0, 0, 0); // Ustawiamy godzinę wizyty na 00:00:00
      return appointmentDate === clickedDate;
    });
    
    if (appointment) {
      setSelectedAppointment(appointment);
    } else {
      setSelectedAppointment(null);
    }
  };
  
  
  
  

  // Handle new car addition
  const handleCarAddSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setError("Wszystkie pola muszą być wypełnione.");
      return;
    }
    try {
      const response = await axios.post(
        `http://localhost:5109/api/user/${userId}/vehicle`,
        newCar,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCars([...cars, response.data]);
      setShowForm(false);
      setAddingNewCar(false);
      setError(null);
    } catch (error) {
      console.error("Błąd przy dodawaniu pojazdu:", error.response?.data || error.message);
      setError("Nie udało się dodać pojazdu. Spróbuj ponownie.");
    }
  };
  

  return (
    <UserPageContainer>
      {user && (
        <>
          <TopSection>
            <WelcomeMessage>Witaj, {user.login}!</WelcomeMessage>
          </TopSection>

          <TwoColumnLayout>
            <LeftColumn>

          {editingUser ? (
            <FormContainer>
              <form onSubmit={handleUserEditSubmit}>
                <FormInput
                  type="text"
                  value={editedUser.login}
                  onChange={(e) => setEditedUser({ ...editedUser, login: e.target.value })}
                  placeholder="Login"
                />
                <FormInput
                  type="email"
                  value={editedUser.email}
                  onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
                  placeholder="Email"
                />
                <FormInput
                  type="tel"
                  value={editedUser.phone}
                  onChange={(e) => setEditedUser({ ...editedUser, phone: e.target.value })}
                  placeholder="Telefon"
                />
                
                <SubmitButton type="submit">Zapisz zmiany</SubmitButton>
                <CancelButton onClick={() => setEditingUser(false)}>Anuluj</CancelButton>
              </form>
            </FormContainer>
          ) : (
            <UserInfoCard>
              <UserInfoLabel><strong>Login: </strong><UserInfoValue>{user.login}</UserInfoValue></UserInfoLabel>
              <UserInfoLabel><strong>Email: </strong><UserInfoValue>{user.email}</UserInfoValue></UserInfoLabel>
              <UserInfoLabel><strong>Telefon: </strong> <UserInfoValue>{user.phone || 'Brak'}</UserInfoValue></UserInfoLabel>
              <EditButton onClick={() => setEditingUser(true)}>Edytuj dane</EditButton>
            </UserInfoCard>
          )}

          
            <ButtonContainer>
            <DynamicAddCarButton
              onClick={toggleForm} // Zmieniamy przycisk po kliknięciu
              iscancel={iscancel} // Używamy stanu do zmiany stylu i tekstu przycisku
            >
              {showForm ? "Anuluj" : "Dodaj pojazd"}
            </DynamicAddCarButton>
            <AddCarButton onClick={() => setShowVehicles(!showVehicles)}>
              {showVehicles ? "Ukryj pojazdy" : "Pokaż pojazdy"}
            </AddCarButton>
          </ButtonContainer>
          {showForm && (
            <FormContainer>
              <form onSubmit={addingNewCar ? handleCarAddSubmit : handleCarEditSubmit}>
                <FormInput
                  type="text"
                  value={newCar.brand}
                  onChange={(e) => setNewCar({ ...newCar, brand: e.target.value })}
                  placeholder="Marka"
                />
                <FormInput
                  type="text"
                  value={newCar.model}
                  onChange={(e) => setNewCar({ ...newCar, model: e.target.value })}
                  placeholder="Model"
                />
                <FormInput
                  type="text"
                  value={newCar.registrationNumber}
                  onChange={(e) => setNewCar({ ...newCar, registrationNumber: e.target.value })}
                  placeholder="Nr rejestracyjny"
                />
                <FormInput
                  type="number"
                  value={newCar.capacity}
                  onChange={(e) => setNewCar({ ...newCar, capacity: e.target.value })}
                  placeholder="Pojemność"
                />
                <FormInput
                  type="number"
                  value={newCar.power}
                  onChange={(e) => setNewCar({ ...newCar, power: e.target.value })}
                  placeholder="Moc"
                />
                <FormInput
                  type="text"
                  value={newCar.vin}
                  onChange={(e) => setNewCar({ ...newCar, vin: e.target.value })}
                  placeholder="VIN"
                />
                <FormInput
                  type="number"
                  value={newCar.productionYear}
                  onChange={(e) => setNewCar({ ...newCar, productionYear: e.target.value })}
                  placeholder="Rok produkcji"
                />
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <SubmitButton type="submit">{addingNewCar ? "Dodaj pojazd" : "Zapisz zmiany"}</SubmitButton>
              </form>
            </FormContainer>
          )}

          {showVehicles && (
            <CarsContainer>
            {cars.map((car) => (
              <VehicleCard
                key={car.id} // Pass the unique identifier as the key prop
                vehicle={car}
                onDelete={handleCarDelete} // Handle vehicle deletion here
                onEdit={(car) => {
                  setEditingCar(car);
                  setEditedCar({ ...car }); // Initialize edit form with car data
                }}
                onClick={() => handleVehicleClick(car)}
              />
            ))}
          </CarsContainer>
          )}

{selectedVehicle && (
 <CardContainer> 
  <div> 
  
    <h3><strong>Dane Pojazdu</strong></h3>
    <p><strong>Marka:</strong> {selectedVehicle.brand}</p>
    <p><strong>Model:</strong> {selectedVehicle.model}</p>
    <p><strong>Numer rejestracyjny:</strong> {selectedVehicle.registrationNumber}</p>
    <p><strong>Pojemność:</strong> {selectedVehicle.capacity} cm³</p>
    <p><strong>Moc:</strong> {selectedVehicle.power} KM</p>
    <p><strong>VIN:</strong> {selectedVehicle.vin}</p>
    <p><strong>Rok produkcji:</strong> {selectedVehicle.productionYear}</p> 
    <BackToListButton onClick={handleBackToVehicleList}>Powrót do listy pojazdów</BackToListButton>
    </div>
  </CardContainer>
    
 
)}


          {editingCar && (
            <FormContainer>
              <form onSubmit={handleCarEditSubmit}>
                <FormInput
                  type="text"
                  value={editedCar.brand}
                  onChange={(e) => setEditedCar({ ...editedCar, brand: e.target.value })}
                  placeholder="Marka"
                />
                <FormInput
                  type="text"
                  value={editedCar.model}
                  onChange={(e) => setEditedCar({ ...editedCar, model: e.target.value })}
                  placeholder="Model"
                />
                <FormInput
                  type="text"
                  value={editedCar.registrationNumber}
                  onChange={(e) => setEditedCar({ ...editedCar, registrationNumber: e.target.value })}
                  placeholder="Numer rejestracyjny"
                />
                <FormInput
                  type="number"
                  value={editedCar.capacity}
                  onChange={(e) => setEditedCar({ ...editedCar, capacity: e.target.value })}
                  placeholder="Pojemność"
                />
                <FormInput
                  type="number"
                  value={editedCar.power}
                  onChange={(e) => setEditedCar({ ...editedCar, power: e.target.value })}
                  placeholder="Moc"
                />
                <FormInput
                  type="text"
                  value={editedCar.vin}
                  onChange={(e) => setEditedCar({ ...editedCar, vin: e.target.value })}
                  placeholder="VIN"
                />
                <FormInput
                  type="number"
                  value={editedCar.productionYear}
                  onChange={(e) => setEditedCar({ ...editedCar, productionYear: e.target.value })}
                  placeholder="Rok produkcji"
                />
                <SubmitButton type="submit">Zapisz zmiany</SubmitButton>
                <CancelButton onClick={() => setEditingCar(null)}>Anuluj</CancelButton>
              </form>
            </FormContainer>
          )}
            </LeftColumn>

            <RightColumn>
              <WelcomeMessage>Twoje wizyty:</WelcomeMessage>

          
                    {/* Render the calendar and appointments */}
                    <StyledCalendar
            onClickDay={handleDateClick}  // Click day to view appointments
            value={selectedDate || new Date()}  // Set the currently selected date
          />

          {selectedAppointment && (
            <ModalBackground>
              <ModalContent>
                <h3>Wizyta: {selectedAppointment.title}</h3>
                <AppointmentDetails>
                  <p><strong>Data: </strong>{new Date(selectedAppointment.recordDate).toLocaleDateString()}</p>
                  <p><strong>Opis: </strong>{selectedAppointment.description}</p>
                  <p><strong>Adres: </strong>{selectedAppointment.location}</p>
                  <p><strong>Godzina: </strong>{new Date(selectedAppointment.recordDate).toLocaleTimeString()}</p>
                </AppointmentDetails>
                <button onClick={closeModal}>Zamknij</button>
              </ModalContent>
            </ModalBackground>
          )}
        </RightColumn>
      </TwoColumnLayout>
    </>
  )}
</UserPageContainer>
);
}

export default UserPage;