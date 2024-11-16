import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import styled from 'styled-components';
import { jwtDecode } from 'jwt-decode';

// Styl głównego kontenera
const HomeContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px;
  flex-direction: row;
  flex-wrap: wrap; /* Allows for wrapping content if necessary */
`;

// Kolumna lewa
const LeftColumn = styled.div`
  flex: 0 0 400px; 
  max-width: 400px; 
  margin-right: 20px;
`;

// Kolumna prawa
const RightColumn = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  height: 100%;
  padding-bottom: 20px; /* Gives room for the form at the bottom */
`;

// Formularz zgłoszeniowy na dole
const FullWidthFormWrapper = styled.div`
  background: #fff;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  width: 100%; 
  margin-top: 20px; /* Adds space above the form */
  box-sizing: border-box;
  position: relative; /* Keeps it in the flow without absolute positioning */
`;

// Tytuł formularza
const FormTitle = styled.h2`
  text-align: center;
  color: #01295F;
  margin-bottom: 20px;
`;

// Sekcja formularza
const FormSection = styled.div`
  margin-bottom: 20px;

  label {
    display: block;
    color: #333;
    margin-bottom: 10px;
  }

  input, textarea {
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

// Przycisk formularza
const FormButton = styled.button`
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

// Karta główna
const Card = styled.div`
  background: #fff;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  text-align: center;
  color: #01295F;
  margin-bottom: 20px;
`;

// Sekcja z marginesami
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

// Opakowanie kalendarza
const CalendarWrapper = styled.div`
  margin-bottom: 20px;
  
  .react-datepicker__input-container {
    width: 100%;
  }
`;

// Define styled-components for your UI
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

const Image = styled.img`
  width: 100%;
  height: auto;
  border-radius: 10px;
  object-fit: cover;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
`;

const Opis = styled.p`
  font-size: 18px;
`;


function Home() {
  const [date, setDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [availableHours, setAvailableHours] = useState([]);
  const [selectedService, setSelectedService] = useState('');
  const [services, setServices] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [workshops, setWorkshops] = useState([]);
  const [selectedWorkshop, setSelectedWorkshop] = useState('');
  const [user, setUser] = useState(null);

  const [email, setEmail] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const token = localStorage.getItem('token');
  const userId = token ? jwtDecode(token).nameid : null;

  useEffect(() => {
    if (!userId || !token) return;

    const fetchUserData = async () => {
      try {
        const [userResponse, vehiclesResponse] = await Promise.all([
          axios.get(`http://localhost:5109/api/user/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`http://localhost:5109/api/user/${userId}/vehicles`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setUser(userResponse.data);
        setVehicles(vehiclesResponse.data);
        // If the user data contains an email, set it in the email state
        if (userResponse.data.email) {
          setEmail(userResponse.data.email);
        }
      } catch (error) {
        console.error('Error fetching user data:', error.response?.data || error.message);
      }
    };

    fetchUserData();
  }, [userId, token]);

  useEffect(() => {
    const fetchWorkshops = async () => {
      try {
        const response = await axios.get('http://localhost:5109/api/AutoRepairShop/workshops');
        setWorkshops(response.data);
      } catch (error) {
        console.error('Error fetching workshops:', error);
      }
    };

    fetchWorkshops();
  }, []);

  const handleDateChange = async (selectedDate) => {
    setDate(selectedDate);
    if (selectedWorkshop) {
      await fetchAvailableHours(selectedDate);
    }
  };

  const fetchAvailableHours = async (selectedDate) => {
    if (!selectedWorkshop) return;

    try {
      const response = await axios.get(
        `http://localhost:5109/api/AutoRepairShop/${selectedWorkshop}/terms`,
        { params: { date: selectedDate.toISOString() } }
      );
      setAvailableHours(response.data);
    } catch (error) {
      console.error('Error fetching available hours:', error);
    }
  };

  const handleWorkshopChange = async (e) => {
    const workshopId = e.target.value;
    setSelectedWorkshop(workshopId);
    setAvailableHours([]);
    setServices([]);

    if (workshopId && date) {
      await fetchAvailableHours(date);
    }

    try {
      const response = await axios.get(`http://localhost:5109/api/AutoRepairShop/${workshopId}/favours`);
      setServices(response.data);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const handleSubmit = async () => {
    if (!selectedTime || !selectedVehicle || !selectedService || !selectedWorkshop) {
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
      await axios.post('http://localhost:5109/api/AutoRepairShop/add-record', {
        vehicleId: selectedVehicle,
        favourId: selectedService,
        termId: selectedTime,
        recordDate: recordDate,
        completionDate: completionDate,
        workshopId: selectedWorkshop,
      });
      alert('Wizyta została umówiona!');
    } catch (error) {
      console.error('Error scheduling appointment:', error);
      alert('Nie udało się umówić wizyty.');
    }
  };

  const handleSubmitForm = async () => {
    // Walidacja formularza
    if (!email || !title || !description) {
      alert('Proszę wypełnić wszystkie pola.');
      return;
    }

    try {
      await axios.post('http://localhost:5109/api/AutoRepairShop/create-issue', {
        email,
        title,
        description,
      });
      alert('Zgłoszenie zostało wysłane!');
      setEmail('');
      setTitle('');
      setDescription('');
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Nie udało się wysłać zgłoszenia.');
    }
  };

  return (
    <>
    <HomeContainer>
      <LeftColumn>
        <Card>
          <Title>Umów wizytę</Title>
          <CalendarWrapper>
            <Section>
              <h3>Wybierz datę naprawy</h3>
              <DatePicker selected={date} onChange={handleDateChange} />
            </Section>
          </CalendarWrapper>
          <Section>
            <h3>Wybierz warsztat</h3>
            <select value={selectedWorkshop} onChange={handleWorkshopChange}>
              <option value="">Wybierz warsztat</option>
              {workshops.map((workshop) => (
                <option key={workshop.id} value={workshop.id}>
                  {workshop.address}
                </option>
              ))}
            </select>
          </Section>
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
      </LeftColumn>
      <RightColumn>
        <Image src="https://imgs.search.brave.com/3ZISgELlSj7O93BAdJHpQEWYOWfhD3HPxSgc2pAo4l4/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWcu/ZnJlZXBpay5jb20v/cHJlbWl1bS16ZGpl/Y2llL21lY2hhbmlr/LXNhbW9jaG9kb3d5/LW5hcHJhd2lhamFj/eS1zYW1vY2hvZC13/LXdhcnN6dGFjaWUt/c2Ftb2Nob2Rvd3lt/Xzc0MjMzOS0xMzgx/LmpwZz9zZW10PWFp/c19oeWJyaWQ" width={100000} alt="Warsztat samochodowy" />
        <Opis><strong>Pan Alternator </strong> to serwis, który zapewni Ci komfort umawiania wizyt w warsztatach samochosowych bez konieczności wychodzenia z domu!
        
        </Opis>
        <Opis>Najlepsze warsztaty i najlepsi mechanicy, którzy znają się na wszystkim,  co związane z autami. Umów wizytę już dziś!</Opis>
      </RightColumn>

      
    </HomeContainer>

    <FullWidthFormWrapper>
<FormTitle>Formularz zgłoszeniowy</FormTitle>
<FormSection>
  <label htmlFor="email">Email</label>
  <input
    type="email"
    id="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
  />
</FormSection>
<FormSection>
  <label htmlFor="title">Tytuł zgłoszenia</label>
  <input
    type="text"
    id="title"
    value={title}
    onChange={(e) => setTitle(e.target.value)}
  />
</FormSection>
<FormSection>
  <label htmlFor="description">Opis problemu</label>
  <textarea
    id="description"
    rows="4"
    value={description}
    onChange={(e) => setDescription(e.target.value)}
  />
</FormSection>
<FormButton onClick={handleSubmitForm}>Wyślij zgłoszenie</FormButton>
</FullWidthFormWrapper>

      

    </>
  );
}
    

export default Home;
