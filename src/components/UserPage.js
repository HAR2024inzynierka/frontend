import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import VehicleCard from "./VehicleCard";
import styled from "styled-components";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

//Stylizowane komponenty

const ButtonContainer = styled.div`
  display: flex;
  gap: 10px;
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

const UserPageContainer = styled.div`
  padding: 20px;
`;
const TopSection = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 20px;
  gap: 20px;
`;

const CalendarWrapper = styled.div`
  .react-calendar__tile.highlight {
    background-color: yellow !important;
  }
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

const CardContainer = styled.div`
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-top: 20px;
`;

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

const StyledCalendar = styled(Calendar)`
  width: 100%; // Rozciągnij do pełnej szerokości kontenera
  max-width: 600px; // Maksymalna szerokość
  font-size: 1.2em; // Powiększenie tekstu i elementów
`;

function UserPage() {
  // Stany dla różnych danych i funkcjonalności
  const [records, setRecords] = useState([]); // Wizyty użytkownika
  const [showModal, setShowModal] = useState(false); // Pokazywanie modalu z wizytami
  const [selectedRecord, setSelectedRecord] = useState(null); // Wybrana wizyta
  const [user, setUser] = useState(null); // Dane użytkownika
  const [cars, setCars] = useState([]); // Lista pojazdów użytkownika
  const [newCar, setNewCar] = useState({
    brand: "",
    model: "",
    registrationNumber: "",
    capacity: "",
    power: "",
    vin: "",
    productionYear: "",
  }); // Dane nowego pojazdu
  const [showVehicles, setShowVehicles] = useState(false); // Czy pokazywać pojazdy
  const [editingUser, setEditingUser] = useState(false); // Tryb edycji użytkownika
  const [editedUser, setEditedUser] = useState({
    login: "",
    email: "",
    phoneNumber: "",
  }); // Zmiany w danych użytkownika
  const [showForm, setShowForm] = useState(false); // Formularz dodawania pojazdu
  const [addingNewCar, setAddingNewCar] = useState(true); // Czy dodajemy nowy pojazd
  const [iscancel, setIsCancel] = useState(false); // Anulowanie formularza
  const [error, setError] = useState(null); // Obsługa błędów
  const [editingCar, setEditingCar] = useState(null); // Edytowany pojazd
  const [editedCar, setEditedCar] = useState({}); // Dane edytowanego pojazdu
  const [selectedVehicle, setSelectedVehicle] = useState(null); // Wybrany pojazd
  
  const token = localStorage.getItem("token"); // Token JWT użytkownika
  const userId = token ? jwtDecode(token).nameid : null; // Identyfikator użytkownika

  // Pokazywanie/ukrywanie formularza
  const toggleForm = () => {
    setShowForm(!showForm);
    setIsCancel(!showForm); // Ustawiamy iscancel na true, jeśli formularz jest pokazany
  };

  // Pobieranie danych użytkownika i pojazdów
  useEffect(() => {
    if (!userId || !token) return;

    const fetchUserData = async () => {
      try {
        const [userResponse, carsResponse, recordsResponse] = await Promise.all(
          [
            // Wysłanie żądania do API w celu pobrania danych użytkownika
            axios.get(`http://localhost:5109/api/User/${userId}`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            // Wysłanie żądania do API w celu pobrania pojazdów użytkownika
            axios.get(`http://localhost:5109/api/User/vehicles`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            // Wysłanie żądania do API w celu pobrania zapisów użytkownika
            axios.get(`http://localhost:5109/api/User/records`, {
              headers: { Authorization: `Bearer ${token}` },
            }), // Pobranie wizyt
          ]
        );
        setUser(userResponse.data);
        setCars(carsResponse.data);
        setRecords(recordsResponse.data);
        setEditedUser(
          {
            login: userResponse.data.login,
            email: userResponse.data.email,
            phoneNumber: userResponse.data.phoneNumber,
          },
          [user]
        );
      } catch (error) {
        console.error(
          "Błąd przy pobieraniu danych użytkownika:",
          error.response?.data || error.message
        );
      }
    };

    fetchUserData();
  }, [userId, token]);

  // Daty wizyt do podświetlenia w kalendarzu
  const getHighlightedDates = () => {
    const highlightedDates = records
      .map((record) => {
        const termStartDate = new Date(record.term.startDate);

        // Zerowanie czasu, aby porównać tylko datę
        termStartDate.setHours(0, 0, 0, 0);

        // Zwracanie ciągu znaków w formacie 'YYYY-MM-DD'
        const formattedDate = termStartDate.toISOString().split("T")[0];
        return formattedDate;
      })
      .filter((value, index, self) => self.indexOf(value) === index); // Usuwanie duplikatów

    return highlightedDates;
  };

  // Kliknięcie na pojazd
  const handleVehicleClick = (car) => {
    setSelectedVehicle(car);
  };

  // Kliknięcie na datę w kalendarzu
  const handleDateClick = (date) => {
    // Konwertuje wybraną datę na 'YYYY-MM-DD', ignorując godzinę.
    const clickedDate = new Date(date);
    clickedDate.setHours(0, 0, 0, 0); // Zerowanie czasu

    // Filtrowanie rekordów przy użyciu tylko daty z 'term.startDate' (porównanie bez czasu)
    const recordsForDate = records.filter((record) => {
      // Pobieranie daty z 'term.startDate'
      const termStartDate = new Date(record.term.startDate);
      termStartDate.setHours(0, 0, 0, 0); // Zerowanie czasu
      return termStartDate.getTime() === clickedDate.getTime();
    });

    if (recordsForDate.length > 0) {
      setSelectedRecord(recordsForDate);
      setShowModal(true);
    }
  };

  // Zamknięcie modalu
  const closeModal = () => {
    setShowModal(false);
    setSelectedRecord(null);
  };

  // Usunięcie pojazdu
  const handleCarDelete = async (carId) => {
    try {
      // Wysłanie żądania do API w celu usunięcia pojazdu
      await axios.delete(`http://localhost:5109/api/user/vehicle/${carId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCars((prevCars) => prevCars.filter((car) => car.id !== carId));
    } catch (error) {
      console.error(
        "Błąd przy usuwaniu pojazdu:",
        error.response?.data || error.message
      );
    }
  };

  // Edycja pojazdu
  const handleCarEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        // Wysłanie żądania do API w celu aktualizacji pojazdu
        `http://localhost:5109/api/user/vehicle/${editedCar.id}`,
        editedCar,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Po udanej edycji, zaktualizuj pojazd w stanie
      setCars(
        cars.map((car) =>
          car.id === editedCar.id ? { ...car, ...editedCar } : car
        )
      );
      setEditingCar(null);
    } catch (error) {
      console.error(
        "Błąd przy edytowaniu pojazdu:",
        error.response?.data || error.message
      );
    }
  };

  // Walidacja formularza dodania pojazdu
  const validateForm = () => {
    return Object.values(newCar).every((value) => value.trim() !== ""); //upewnij się, że żadne pole nie jest puste
  };

  // Edycja danych użytkownika
  const handleUserEditSubmit = async (e) => {
    e.preventDefault();
    try {
      // Wysłanie żądania do API w celu aktualizacji danych użytkownika
      await axios.put(`http://localhost:5109/api/User/`, editedUser, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Pobranie zaktualizowanych danych użytkownika
      const response = await axios.get(
        `http://localhost:5109/api/User/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setUser(response.data);
      setEditingUser(false);
    } catch (error) {
      console.error(
        "Błąd przy edytowaniu danych użytkownika:",
        error.response?.data || error.message
      );
      setError(
        "Nie udało się zaktualizować danych użytkownika. Spróbuj ponownie."
      );
    }
  };

  //Powrót do listy pojazdów
  const handleBackToVehicleList = () => {
    setSelectedVehicle(null);
    setEditingCar(null);
  };

  //Usunięcie zapisu użytkownika
  const deleteRecord = async (id) => {
    try {
      // Wysłanie żądania do API w celu usunięcia zapisu o wizytach
      await axios.delete(`http://localhost:5109/api/User/records/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setRecords((prevRecords) => {
        // Filtrowanie poprzednich zapisów, aby usunąć ten, który ma podane id
        const updatedRecords = prevRecords.filter((record) => record.id !== id);

        // Jeśli zapis, który został usunięty, był częścią wybranych wizyt (wyświetlanych w oknie modalnym)
        if (
          selectedRecord &&
          selectedRecord.some((record) => record.id === id)
        ) {
          // Filtrujemy pozostałe wizyty dla tej samej daty, aby zachować tylko te, które są związane z wybraną datą
          setSelectedRecord(
            updatedRecords.filter((record) => {
              // Pobieramy datę terminu wybranej wizyty i ustawiamy godziny na 0, aby porównać tylko daty (bez czasu)
              const clickedDate = new Date(selectedRecord[0].term.startDate);
              clickedDate.setHours(0, 0, 0, 0); // Resetowanie godzin, minut, sekund
              
              // Porównujemy tylko datę (bez uwzględnienia godziny), aby sprawdzić, czy rekord ma tę samą datę
              return (
                new Date(record.term.startDate).setHours(0, 0, 0, 0) ===
                clickedDate.getTime()
              );
            })
          );
        }

        return updatedRecords;
      });
    } catch (err) {
      setError("Nie udało się usunąć terminu");
    }
  };

  // Dodawanie nowego pojazdu
  const handleCarAddSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setError("Wszystkie pola muszą być wypełnione.");
      return;
    }
    try {
      // Wysłanie żądania do API w celu dodania pojazdu
      const response = await axios.post(
        `http://localhost:5109/api/user/vehicle`,
        newCar,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCars([...cars, response.data]);
      setShowForm(false);
      setAddingNewCar(false);
      setError(null);
    } catch (error) {
      console.error(
        "Błąd przy dodawaniu pojazdu:",
        error.response?.data || error.message
      );
      setError("Nie udało się dodać pojazdu. Spróbuj ponownie.");
    }
  };

  return (
    <UserPageContainer>
      {/* Jeśli użytkownik jest zalogowany, renderujemy całą stronę */}
      {user && (
        <>
          {/* Górna sekcja z powitaniem użytkownika */}
          <TopSection>
            <WelcomeMessage>Witaj, {user.login}!</WelcomeMessage>
          </TopSection>

          {/* Układ z dwoma kolumnami */}
          <TwoColumnLayout>
            <LeftColumn>
              {/* Sekcja edycji użytkownika */}
              {editingUser ? (
                <FormContainer>
                  {/* Formulary do edycji loginu, emaila i numeru telefonu */}
                  <form onSubmit={handleUserEditSubmit}>
                    <FormInput
                      type="text"
                      value={editedUser.login}
                      onChange={(e) =>
                        setEditedUser({ ...editedUser, login: e.target.value })
                      }
                      placeholder="Login"
                    />
                    <FormInput
                      type="email"
                      value={editedUser.email}
                      onChange={(e) =>
                        setEditedUser({ ...editedUser, email: e.target.value })
                      }
                      placeholder="Email"
                    />
                    <FormInput
                      type="tel"
                      value={editedUser.phoneNumber}
                      onChange={(e) =>
                        setEditedUser({
                          ...editedUser,
                          phoneNumber: e.target.value,
                        })
                      }
                      placeholder="Telefon"
                    />

                    <SubmitButton type="submit">Zapisz zmiany</SubmitButton>
                    <CancelButton onClick={() => setEditingUser(false)}>
                      Anuluj
                    </CancelButton>
                  </form>
                </FormContainer>
              ) : (
                <UserInfoCard>
                  {/* Wyświetlanie danych użytkownika, gdy nie jest w trybie edycji */}
                  <UserInfoLabel>
                    <strong>Login: </strong>
                    <UserInfoValue>{user.login}</UserInfoValue>
                  </UserInfoLabel>
                  <UserInfoLabel>
                    <strong>Email: </strong>
                    <UserInfoValue>{user.email}</UserInfoValue>
                  </UserInfoLabel>
                  <UserInfoLabel>
                    <strong>Telefon: </strong>{" "}
                    <UserInfoValue>{user.phoneNumber || "Brak"}</UserInfoValue>
                  </UserInfoLabel>
                  <EditButton onClick={() => setEditingUser(true)}>
                    Edytuj dane
                  </EditButton>
                </UserInfoCard>
              )}

              {/* Przycisk do dodania pojazdu */}
              <ButtonContainer>
                <DynamicAddCarButton
                  onClick={toggleForm} // Zmieniamy przycisk po kliknięciu
                  iscancel={iscancel} // Używamy stanu do zmiany stylu i tekstu przycisku
                >
                  {showForm ? "Anuluj" : "Dodaj pojazd"}
                </DynamicAddCarButton>

                {/* Przycisk do pokazania/ukrywania pojazdów */}
                <AddCarButton onClick={() => setShowVehicles(!showVehicles)}>
                  {showVehicles ? "Ukryj pojazdy" : "Pokaż pojazdy"}
                </AddCarButton>
              </ButtonContainer>

              {/* Formularz do dodawania/edycji pojazdów */}
              {showForm && (
                <FormContainer>
                  {/* Formularz do wprowadzenia danych pojazdu */}
                  <form
                    onSubmit={
                      addingNewCar ? handleCarAddSubmit : handleCarEditSubmit
                    }
                  >
                    <FormInput
                      type="text"
                      value={newCar.brand}
                      onChange={(e) =>
                        setNewCar({ ...newCar, brand: e.target.value })
                      }
                      placeholder="Marka"
                    />
                    <FormInput
                      type="text"
                      value={newCar.model}
                      onChange={(e) =>
                        setNewCar({ ...newCar, model: e.target.value })
                      }
                      placeholder="Model"
                    />
                    <FormInput
                      type="text"
                      value={newCar.registrationNumber}
                      onChange={(e) =>
                        setNewCar({
                          ...newCar,
                          registrationNumber: e.target.value,
                        })
                      }
                      placeholder="Nr rejestracyjny"
                    />
                    <FormInput
                      type="number"
                      value={newCar.capacity}
                      onChange={(e) =>
                        setNewCar({ ...newCar, capacity: e.target.value })
                      }
                      placeholder="Pojemność"
                    />
                    <FormInput
                      type="number"
                      value={newCar.power}
                      onChange={(e) =>
                        setNewCar({ ...newCar, power: e.target.value })
                      }
                      placeholder="Moc"
                    />
                    <FormInput
                      type="text"
                      value={newCar.vin}
                      onChange={(e) =>
                        setNewCar({ ...newCar, vin: e.target.value })
                      }
                      placeholder="VIN"
                    />
                    <FormInput
                      type="number"
                      value={newCar.productionYear}
                      onChange={(e) =>
                        setNewCar({ ...newCar, productionYear: e.target.value })
                      }
                      placeholder="Rok produkcji"
                    />
                    {error && <p style={{ color: "red" }}>{error}</p>}
                    <SubmitButton type="submit">
                      {addingNewCar ? "Dodaj pojazd" : "Zapisz zmiany"}
                    </SubmitButton>
                  </form>
                </FormContainer>
              )}

              {/* Wyświetlanie pojazdów */}
              {showVehicles && (
                <CarsContainer>
                  {cars.map((car) => (
                    <VehicleCard
                      key={car.id}
                      vehicle={car}
                      onDelete={handleCarDelete}
                      onEdit={(car) => {
                        setEditingCar(car);
                        setEditedCar({ ...car });
                      }}
                      onClick={() => handleVehicleClick(car)}
                    />
                  ))}
                </CarsContainer>
              )}

              {/* Wyświetlanie szczegółów wybranego pojazdu */}
              {selectedVehicle && (
                <CardContainer>
                  <div>
                    <h3>
                      <strong>Dane Pojazdu</strong>
                    </h3>
                    <p>
                      <strong>Marka:</strong> {selectedVehicle.brand}
                    </p>
                    <p>
                      <strong>Model:</strong> {selectedVehicle.model}
                    </p>
                    <p>
                      <strong>Numer rejestracyjny:</strong>{" "}
                      {selectedVehicle.registrationNumber}
                    </p>
                    <p>
                      <strong>Pojemność:</strong> {selectedVehicle.capacity} cm³
                    </p>
                    <p>
                      <strong>Moc:</strong> {selectedVehicle.power} KM
                    </p>
                    <p>
                      <strong>VIN:</strong> {selectedVehicle.vin}
                    </p>
                    <p>
                      <strong>Rok produkcji:</strong>{" "}
                      {selectedVehicle.productionYear}
                    </p>
                    <BackToListButton onClick={handleBackToVehicleList}>
                      Powrót do listy pojazdów
                    </BackToListButton>
                  </div>
                </CardContainer>
              )}

              {/* Formularz do edycji pojazdu */}
              {editingCar && (
                <FormContainer>
                  <form onSubmit={handleCarEditSubmit}>
                    <FormInput
                      type="text"
                      value={editedCar.brand}
                      onChange={(e) =>
                        setEditedCar({ ...editedCar, brand: e.target.value })
                      }
                      placeholder="Marka"
                    />
                    <FormInput
                      type="text"
                      value={editedCar.model}
                      onChange={(e) =>
                        setEditedCar({ ...editedCar, model: e.target.value })
                      }
                      placeholder="Model"
                    />
                    <FormInput
                      type="text"
                      value={editedCar.registrationNumber}
                      onChange={(e) =>
                        setEditedCar({
                          ...editedCar,
                          registrationNumber: e.target.value,
                        })
                      }
                      placeholder="Numer rejestracyjny"
                    />
                    <FormInput
                      type="number"
                      value={editedCar.capacity}
                      onChange={(e) =>
                        setEditedCar({ ...editedCar, capacity: e.target.value })
                      }
                      placeholder="Pojemność"
                    />
                    <FormInput
                      type="number"
                      value={editedCar.power}
                      onChange={(e) =>
                        setEditedCar({ ...editedCar, power: e.target.value })
                      }
                      placeholder="Moc"
                    />
                    <FormInput
                      type="text"
                      value={editedCar.vin}
                      onChange={(e) =>
                        setEditedCar({ ...editedCar, vin: e.target.value })
                      }
                      placeholder="VIN"
                    />
                    <FormInput
                      type="number"
                      value={editedCar.productionYear}
                      onChange={(e) =>
                        setEditedCar({
                          ...editedCar,
                          productionYear: e.target.value,
                        })
                      }
                      placeholder="Rok produkcji"
                    />
                    <SubmitButton type="submit">Zapisz zmiany</SubmitButton>
                    <CancelButton onClick={() => setEditingCar(null)}>
                      Anuluj
                    </CancelButton>
                  </form>
                </FormContainer>
              )}
            </LeftColumn>

            <RightColumn>
              <WelcomeMessage>Twoje wizyty:</WelcomeMessage>

              {/* Kalendarz */}
              <CalendarWrapper>
                <StyledCalendar
                  onClickDay={handleDateClick}
                  tileClassName={({ date }) => {
                    const highlightedDates = getHighlightedDates();
                    const formattedDate = date.toISOString().split("T")[0]; // Prezentacja daty w formacie 'YYYY-MM-DD'
                    return highlightedDates.includes(formattedDate)
                      ? "highlight"
                      : null;
                  }}
                />
              </CalendarWrapper>

              {/* Modal z informacjami o zapisie */}
              {showModal && selectedRecord && selectedRecord.length > 0 && (
                <div className="modal">
                  <div className="modal-content">
                    <h4>Informacje o zapisie</h4>
                    {selectedRecord.map((record) => (
                      <div key={record.id}>
                        <p>
                          <strong>Data zapisu:</strong>{" "}
                          {new Date(record.term.startDate).toLocaleString()}
                        </p>
                        <p>
                          <strong>Pojazd:</strong> {record.vehicle.brand}{" "}
                          {record.vehicle.model}
                        </p>
                        <p>
                          <strong>Usługa:</strong> {record.favour.typeName}
                        </p>
                        <p>
                          <strong>Opis:</strong> {record.favour.description}
                        </p>
                        <p>
                          <strong>Cena:</strong> {record.favour.price} zł
                        </p>
                        <p>
                          <strong>Warsztat:</strong>{" "}
                          {record.favour.autoRepairShop.address}
                        </p>
                        <Button
                          onClick={() => deleteRecord(record.id)}
                          style={{ backgroundColor: "#931621" }}
                        >
                          Anuluj
                        </Button>
                      </div>
                    ))}
                    <br />
                    <Button
                      onClick={closeModal}
                      style={{ backgroundColor: "#01295f" }}
                    >
                      Ukryj
                    </Button>
                  </div>
                </div>
              )}
            </RightColumn>
          </TwoColumnLayout>
        </>
      )}
    </UserPageContainer>
  );
}

export default UserPage;
