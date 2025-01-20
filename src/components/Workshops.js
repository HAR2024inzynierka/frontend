import styled from "styled-components";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

//Stylizowane komponenty

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  padding: 20px;
  background-color: #f5f5f5;
`;

const WorkshopCard = styled.div`
  background: #ffffff;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin: 10px;
  padding: 20px;
  width: 300px;
  text-align: center;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.05);
  }
`;

const WorkshopName = styled.h3`
  font-size: 1.5em;
  margin: 0;
  color: #333;
`;

const WorkshopAddress = styled.p`
  font-size: 1em;
  color: #666;
`;

const Workshops = () => {
  const [workshops, setWorkshops] = useState([]); // Stan przechowujący listę warsztatów
  const navigate = useNavigate(); // Funkcja nawigacji do szczegółów warsztatu

  // useEffect do pobierania listy warsztatów z API
  useEffect(() => {
    const fetchWorkshops = async () => {
      try {
        // Pobranie warsztatów
        const response = await axios.get(
          "http://localhost:5109/api/AutoRepairShop/workshops"
        );
        setWorkshops(response.data);
      } catch (error) {
        console.error("Błąd podczas pobierania warsztatów:", error);
      }
    };

    fetchWorkshops();
  }, []);

  // Funkcja obsługująca kliknięcie na warsztat
  const handleWorkshopClick = (id) => {
    navigate(`/workshop/${id}`);
  };

  return (
    <Container>
      {/* Renderowanie listy warsztatów */}
      {workshops.map((workshop) => (
        <WorkshopCard
          key={workshop.id}
          onClick={() => handleWorkshopClick(workshop.id)} // Przekierowanie po kliknięciu na warsztat
        >
          <WorkshopName>{workshop.name}</WorkshopName>
          <WorkshopAddress>{workshop.address}</WorkshopAddress>
        </WorkshopCard>
      ))}
    </Container>
  );
};

export default Workshops;
