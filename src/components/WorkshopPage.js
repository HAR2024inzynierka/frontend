import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from 'react-datepicker';
import { jwtDecode } from 'jwt-decode';
import Posts from './Posts';


const Card = styled.div`
  background: #fff;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
`;

const Section = styled.div`
  margin-bottom: 20px;

  h3 {
    color: #333;
    margin-bottom: 10px;
  }

  select, input {
    width: 100%;
    padding: 10px;
    font-size: 16px;
    border: 1px solid #ccc;
    border-radius: 5px;
    outline: none;

    &:focus {
      border-color: #00509E;
      box-shadow: 0 0 5px rgba(0, 80, 158, 0.5);
    }
  }
`;

const CalendarWrapper = styled.div`
  margin-bottom: 20px;
  
  .react-datepicker__input-container {
    width: 100%;
  }
`;

// // Define styled-components for your UI
const Button = styled.button`
  background-color: #01295F;
  color: white;
  padding: 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  width: 100%;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #00509E;
  }

  &:disabled {
    background-color: #aaa;
    cursor: not-allowed;
  }
`;
const Container = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ContentWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  max-width: 1200px;
  margin-bottom: 40px;
`;

const WorkshopInfo = styled.div`
  flex: 1;
  padding-right: 20px;
  background: #f7f7f7;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const FormWrapper = styled.div`
  flex: 1;
  padding: 20px;
  background: #f7f7f7;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  font-size: 24px;
  margin-bottom: 10px;
`;

const Info = styled.p`
  margin: 10px 0;
  font-size: 16px;
`;

const WorkshopPage = () => {
  const [services, setServices] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [date, setDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [availableHours, setAvailableHours] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [workshop, setWorkshop] = useState(null);

  const token = localStorage.getItem('token');

  const { id } = useParams();

  useEffect(() => {
      const fetchWorkshop = async () => {
          try {
              const response = await axios.get(`http://localhost:5109/api/AutoRepairShop/${id}`);
              setWorkshop(response.data);
          } catch (error) {
              console.error('Error fetching workshop details:', error);
          }
      };
      const fetchServices = async () => {
        try {
            const response = await axios.get(`http://localhost:5109/api/AutoRepairShop/${id}/favours`); // Замените на правильный URL для загрузки услуг
            setServices(response.data);
        } catch (error) {
            console.error('Error fetching services:', error);
        }
  };

    const fetchVehicles = async () => {
        try {
            const response = await axios.get(`http://localhost:5109/api/User/vehicles`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setVehicles(response.data);
        } catch (error) {
            console.error('Error fetching vehicles:', error);
        }
    };
    

    fetchAvailableHours();
    fetchWorkshop();
    fetchServices();
    if (token) {
        fetchVehicles();
    }
  }, [id, token]);

  useEffect(() => {
    if (workshop) {
      // Вызов функции получения доступных часов для текущей даты
      fetchAvailableHours(date);
    }
  }, [workshop, date]);
  
  const fetchAvailableHours = async (selectedDate) => {
    if (!workshop) return;

    try {
      const response = await axios.get(
        `http://localhost:5109/api/AutoRepairShop/${workshop.id}/terms`
      );
      // Фильтруем часы, чтобы они соответствовали выбранной дате
      const filteredHours = response.data.filter((hour) => {
        const hourDate = new Date(hour.startDate).toISOString().split('T')[0];
        const selectedDateString = selectedDate.toISOString().split('T')[0];
        return hourDate === selectedDateString;
    });

      setAvailableHours(filteredHours);
    } catch (error) {
      console.error('Error fetching available hours:', error);
    }
  };

  const handleDateChange = async (selectedDate) => {
    setDate(selectedDate);
    if (workshop) {
      await fetchAvailableHours(selectedDate);
    }
  };

  const handleSubmit = async () => {
    if (!selectedTime || !selectedVehicle || !selectedService || !workshop) {
      alert('Proszę wypełnić wszystkie pola.');
      return;
    }

    const selectedHour = availableHours.find((hour) => String(hour.id) === String(selectedTime));
    if (!selectedHour) {
      alert('Nieprawidłowa godzina');
      return;
    }

    const selectedDateTime = new Date(selectedHour.startDate);
    const recordDate = selectedDateTime.toISOString();
    const completionDate = selectedHour.endDate;

    try {
      await axios.post(
        'http://localhost:5109/api/AutoRepairShop/add-record', 
        {
        vehicleId: selectedVehicle,
        favourId: selectedService,
        termId: selectedTime,
        recordDate: recordDate,
        workshopId: workshop.id,
        },
        {
          headers: {Authorization: `Bearer ${token}`},
        }
      );
      alert('Wizyta została umówiona!');
    } catch (error) {
      console.error('Error scheduling appointment:', error);
      alert('Nie udało się umówić wizyty.');
    }
  };

  if (!workshop) {
    return <Container>Loading...</Container>;
  }

  return (
    <Container>
    <ContentWrapper>
        <WorkshopInfo>
          {/* Данные мастерской слева */}
          <Title>{workshop.name}</Title>
          <Info>Address: {workshop.address}</Info>
          <Info>Email: {workshop.email}</Info>
          <Info>Telefon: {workshop.phoneNumber}</Info>
        </WorkshopInfo>

        <FormWrapper>
          {/* Форма справа */}
          <Card>
            <Title>Umów wizytę</Title>
            <CalendarWrapper>
              <Section>
                <h3>Wybierz datę naprawy</h3>
                <DatePicker selected={date} onChange={handleDateChange} />
              </Section>
            </CalendarWrapper>
            <Section>
              <h3>Wybierz godzinę</h3>
              <select value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)}>
                <option value="">Wybierz godzinę</option>
                {availableHours.map((hour) => (
                  <option key={hour.id} value={hour.id}>
                    {new Date(hour.startDate).toLocaleTimeString('pl-PL', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </option>
                ))}
              </select>
            </Section>
            <Section>
              <h3>Wybierz usługę</h3>
              <select value={selectedService} onChange={(e) => setSelectedService(e.target.value)}>
                <option value="">Wybierz usługę</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.typeName}
                  </option>
                ))}
              </select>
            </Section>
            <Section>
              <h3>Wybierz pojazd</h3>
              <select value={selectedVehicle} onChange={(e) => setSelectedVehicle(e.target.value)}>
                <option value="">Wybierz pojazd</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.brand} {vehicle.model} {vehicle.registrationNumber}
                  </option>
                ))}
              </select>
            </Section>
            <Button onClick={handleSubmit}>Umów wizytę</Button>
          </Card>
        </FormWrapper>
      </ContentWrapper>

<div style={{ width: '100%', maxWidth: '1200px' }}>
<Posts workshopId={workshop.id} />
</div>
</Container>
  );
};

export default WorkshopPage;
