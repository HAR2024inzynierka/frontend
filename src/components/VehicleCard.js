// components/VehicleCard.js
import React from 'react';
import styled from 'styled-components';

const Card = styled.div`
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    margin: 20px;
    padding: 20px;
    width: 250px;
    transition: transform 0.2s;
    cursor: pointer; /* Dodanie wskaźnika, że karta jest klikalna */

    &:hover {
        transform: scale(1.05);
    }
`;

const Title = styled.h3`
    margin: 0 0 10px;
    color: #01295F;
`;

const Info = styled.p`
    margin: 5px 0;
    color: #333;
`;

const Button = styled.button`
    margin: 5px 5px;
    color: #01295F;
    border: 1px solid #01295F; /* Dodajemy obramowanie */
    background: white;
    width: 100px; /* Ustalamy stałą szerokość */
    height: 40px; /* Ustalamy stałą wysokość */
    border-radius: 5px; /* Zaokrąglone rogi */

    &:hover {
        background: #01295F;
        color: white;
    }
`;

const ButtonDelete = styled(Button)` /* Dziedziczenie stylu z Button */
    color: white;
    background: #D9534F; /* Kolor tła przycisku Usuń */
    border: 1px solid #D9534F;

    &:hover {
        background: white;
        color: #D9534F; /* Kolor tekstu na hover */
        
    }
`;

const VehicleCard = ({ vehicle, onClick, onDelete, onUpdate }) => {
    // Sprawdzenie, czy vehicle istnieje, aby uniknąć błędów
    if (!vehicle) return null; // Zwróć null, jeśli vehicle jest undefined lub null

    return (
        <Card onClick={onClick}> {/* Dodajemy onClick do Card */}
            <Title>{vehicle.brand} {vehicle.model}</Title>
            <Info>Nr Rejestracyjny: {vehicle.registrationNumber}</Info>
            <div>
                <ButtonDelete onClick={(e) => { e.stopPropagation(); onDelete(vehicle.id); }}>Usuń</ButtonDelete>
                <Button onClick={(e) => { e.stopPropagation(); onUpdate(vehicle.id, { /* Zaktualizowane dane */ }); }}>Edytuj</Button>
            </div>
        </Card>
    );
};

export default VehicleCard;
