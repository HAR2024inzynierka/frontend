// components/UserPage.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import VehicleCard from './VehicleCard'; // Import komponentu VehicleCard
import styled from 'styled-components';

// Styled Components
const UserPageContainer = styled.div`
    padding: 20px;
`;

const CarsContainer = styled.div`
    display: flex;
    flex-wrap: wrap; /* Pozwala na zawijanie kart */
    justify-content: flex-start; /* Wyrównanie do lewej */
    margin-top: 20px; /* Dodajemy margines górny */
`;

const VehicleDetails = styled.div`
    margin-top: 20px;
    padding: 15px;
    border: 1px solid #ccc;
    border-radius: 8px;
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
        border-color: #01295F; /* Kolor obramowania na fokus */
        outline: none; /* Usunięcie standardowego obramowania */
    }
`;

const SubmitButton = styled.button`
    background-color: #01295F;
    color: white;
    border: none;
    padding: 10px 15px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
    font-weight: bold;
    transition: background-color 0.3s;

    &:hover {
        background-color: #00509E; /* Jaśniejszy kolor przycisku na hover */
    }
`;

const ToggleButton = styled.button`
    background-color: #01295F;
    color: white;
    border: none;
    padding: 10px 15px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
    margin: 10px;
    transition: background-color 0.3s;

    &:hover {
        background-color: #00509E; /* Jaśniejszy kolor przycisku na hover */
    }
`;

const ActionButton = styled.button`
    background-color: #01295F; /* Kolor przycisku do usuwania */
    color: white;
    border: none;
    padding: 15px 10px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 14px;
    margin-left: 10px;

    &:hover {
        background-color: white; /* Jaśniejszy kolor na hover */
        color: #01295F;
        font-style: bold;
    }
`;

function UserPage() {
    const [user, setUser] = useState(null);
    const [cars, setCars] = useState([]);
    const [newCar, setNewCar] = useState({ brand: '', model: '', registrationNumber: '' });
    const [selectedCar, setSelectedCar] = useState(null); // Stan dla wybranego pojazdu
    const [showForm, setShowForm] = useState(false); // Stan do kontrolowania widoczności formularza
    const [showCars, setShowCars] = useState(false); // Stan do kontrolowania widoczności kart pojazdów

    const token = localStorage.getItem('token');
    const userId = token ? jwtDecode(token).nameid : null;

    useEffect(() => {
        const fetchUser = async () => {
            if (!userId) {
                console.log("Brak userId, nie można pobrać danych użytkownika");
                return;
            }

            try {
                const response = await axios.get(`http://localhost:5109/api/user/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUser(response.data);

                const carsResponse = await axios.get(`http://localhost:5109/api/user/${userId}/vehicles`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setCars(carsResponse.data);
            } catch (error) {
                console.error("Błąd przy pobieraniu danych użytkownika:", error.response?.data || error.message);
            }
        };

        fetchUser();
    }, [userId, token]);

    const handleAddCar = async (e) => {
        e.preventDefault();
        if (!userId) {
            console.log("Brak userId, nie można dodać samochodu");
            return;
        }

        const newCarData = {
            brand: String(newCar.brand),
            model: String(newCar.model),
            registrationNumber: String(newCar.registrationNumber)
        };

        try {
            const addCarResponse = await axios.post(`http://localhost:5109/api/user/${userId}/vehicle`, newCarData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setNewCar({ brand: '', model: '', registrationNumber: '' });

            const carsResponse = await axios.get(`http://localhost:5109/api/user/${userId}/vehicles`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCars(carsResponse.data);
        } catch (error) {
            console.error("Błąd podczas dodawania samochodu:", error.response?.data || error.message);
            alert("Nie udało się dodać samochodu. Sprawdź dane i spróbuj ponownie.");
        }
    };

    const handleDeleteCar = async (carId) => {
        if (!userId) return;

        try {
            await axios.delete(`http://localhost:5109/api/user/${userId}/vehicle/${carId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Aktualizacja listy pojazdów
            const updatedCars = cars.filter(car => car.id !== carId);
            setCars(updatedCars);
            // Resetowanie wybranego pojazdu, jeśli usunięty został aktualnie wybrany
            if (selectedCar && selectedCar.id === carId) {
                setSelectedCar(null);
            }
        } catch (error) {
            console.error("Błąd podczas usuwania samochodu:", error.response?.data || error.message);
            alert("Nie udało się usunąć samochodu. Spróbuj ponownie.");
        }
    };

    const handleUpdateCar = async (carId, updatedData) => {
        if (!userId) return;

        try {
            await axios.put(`http://localhost:5109/api/user/${userId}/vehicle/${carId}`, updatedData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Aktualizacja listy pojazdów
            const updatedCars = cars.map(car => (car.id === carId ? { ...car, ...updatedData } : car));
            setCars(updatedCars);
            setSelectedCar(null); // Resetowanie wybranego pojazdu
        } catch (error) {
            console.error("Błąd podczas aktualizacji samochodu:", error.response?.data || error.message);
            alert("Nie udało się zaktualizować samochodu. Sprawdź dane i spróbuj ponownie.");
        }
    };

    const handleCardClick = (car) => {
        setSelectedCar(car); // Ustawienie wybranego pojazdu
    };

    const handleBackClick = () => {
        setSelectedCar(null); // Resetowanie wybranego pojazdu
    };

    return (
        <UserPageContainer>
            <h2>Twoje konto</h2>
            {user ? (
                <div>
                    <p>Nazwa użytkownika: {user.login}</p>
                    <p>Email: {user.email}</p>
                </div>
            ) : (
                <p>Ładowanie danych użytkownika...</p>
            )}

            <ToggleButton onClick={() => { setShowForm(!showForm); setShowCars(false); }}>
                {showForm ? "Ukryj formularz" : "Dodaj pojazd"}
            </ToggleButton>
            <ToggleButton onClick={() => { setShowCars(!showCars); setShowForm(false); }}>
                {showCars ? "Ukryj pojazdy" : "Twoje pojazdy"}
            </ToggleButton>

            {showForm && (
                <FormContainer>
                    <h3>Dodaj pojazd</h3>
                    <form onSubmit={handleAddCar}>
                        <FormInput
                            type="text"
                            placeholder="Marka"
                            value={newCar.brand}
                            onChange={(e) => setNewCar({ ...newCar, brand: e.target.value })}
                            required
                        />
                        <FormInput
                            type="text"
                            placeholder="Model"
                            value={newCar.model}
                            onChange={(e) => setNewCar({ ...newCar, model: e.target.value })}
                            required
                        />
                        <FormInput
                            type="text"
                            placeholder="Nr Rejestracyjny"
                            value={newCar.registrationNumber}
                            onChange={(e) => setNewCar({ ...newCar, registrationNumber: e.target.value })}
                            required
                        />
                        <SubmitButton type="submit">Dodaj pojazd</SubmitButton>
                    </form>
                </FormContainer>
            )}

            {showCars && !selectedCar && (
                <CarsContainer>
                    {cars.map((car) => (
                        <VehicleCard
                            key={car.id}
                            vehicle={car}
                            onClick={() => handleCardClick(car)} // Wywołanie funkcji przy kliknięciu karty
                            onDelete={handleDeleteCar}
                            onUpdate={handleUpdateCar}
                        />
                    ))}
                </CarsContainer>
            )}

            {selectedCar && (
                <VehicleDetails>
                    <h3>Wybrany pojazd</h3>
                    <p>Marka: {selectedCar.brand}</p>
                    <p>Model: {selectedCar.model}</p>
                    <p>Nr rejestracyjny: {selectedCar.registrationNumber}</p>
                    <ActionButton onClick={handleBackClick}>Powrót do listy pojazdów</ActionButton>
                    {/* Możesz dodać więcej informacji lub funkcjonalności dla wybranego pojazdu */}
                </VehicleDetails>
            )}
        </UserPageContainer>
    );
}

export default UserPage;
