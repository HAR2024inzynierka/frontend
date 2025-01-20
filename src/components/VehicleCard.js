import React from "react";
import styled from "styled-components";

//Stylizowane komponenty

const Card = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  margin: 20px;
  padding: 20px;
  width: 250px;
  transition: transform 0.2s;
  cursor: pointer;

  &:hover {
    transform: scale(1.05);
  }
`;

const Title = styled.h3`
  margin: 0 0 10px;
  color: #01295f;
`;

const Info = styled.p`
  margin: 5px 0;
  color: #333;
`;

const Button = styled.button`
  margin: 5px 5px;
  color: #01295f;
  border: 1px solid #01295f;
  background: white;
  width: 100px;
  height: 40px;
  border-radius: 5px;

  &:hover {
    background: #01295f;
    color: white;
  }
`;

const ButtonDelete = styled(Button)`
  color: white;
  background: #d9534f;
  border: 1px solid #d9534f;

  &:hover {
    background: white;
    color: #d9534f;
  }
`;

// Komponent odpowiedzialny za wyświetlanie pojedynczego pojazdu
const VehicleCard = ({ vehicle, onClick, onDelete, onEdit }) => {
  if (!vehicle) return null;

  return (
    <Card onClick={onClick}>
      <Title>
        {vehicle.brand} {vehicle.model}
      </Title>
      <Info>Nr Rejestracyjny: {vehicle.registrationNumber}</Info>
      <div>
        <ButtonDelete
          onClick={(e) => {
            e.stopPropagation();
            onDelete(vehicle.id);
          }}
        >
          Usuń
        </ButtonDelete>
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(vehicle);
          }}
        >
          Edytuj
        </Button>
      </div>
    </Card>
  );
};

export default VehicleCard;
