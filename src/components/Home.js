import React, { useState, useEffect } from "react";
import axios from "axios";
import "react-datepicker/dist/react-datepicker.css";
import styled from "styled-components";
import { jwtDecode } from "jwt-decode";

//Stylizowane komponenty

const HomeContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  height: auto;
  background-color: #f5f5f5;
  padding: 20px;
  flex-direction: row;
  flex-wrap: wrap; /* Allows for wrapping content if necessary */
`;

const Section = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
  padding-bottom: 20px;
`;

const FullWidthFormWrapper = styled.div`
  background: #fff;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  margin-top: 20px;
  box-sizing: border-box;
  position: relative;
`;

const FormTitle = styled.h2`
  text-align: center;
  color: #01295f;
  margin-bottom: 20px;
`;

const FormSection = styled.div`
  margin-bottom: 20px;

  label {
    display: block;
    color: #333;
    margin-bottom: 10px;
  }

  input,
  textarea {
    width: 100%;
    padding: 10px;
    font-size: 16px;
    border: 1px solid #ccc;
    border-radius: 5px;
    outline: none;

    &:focus {
      border-color: #00509e;
      box-shadow: 0 0 5px rgba(0, 80, 158, 0.5);
    }
  }
`;

const FormButton = styled.button`
  background-color: #01295f;
  color: white;
  padding: 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  width: 100%;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #00509e;
  }

  &:disabled {
    background-color: #aaa;
    cursor: not-allowed;
  }
`;

const Image = styled.img`
  width: 70%;
  height: auto;
  border-radius: 10px;
  object-fit: cover;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  align-items: center;
`;

const Opis = styled.p`
  font-size: 18px;
`;

function Home() {
  // Ustawienia stanu dla e-maila, tytułu i opisu formularza
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Pobieranie tokena z localStorage i dekodowanie userId z tokena
  const token = localStorage.getItem("token");
  const userId = token ? jwtDecode(token).nameid : null;

  // Pobrania danych użytkownika
  useEffect(() => {
    if (!userId || !token) return;

    const fetchUserData = async () => {
      try {
        // Wysłanie żądania do API w celu pobrania danych użytkownika
        const [userResponse] = await Promise.all([
          axios.get(`http://localhost:5109/api/user/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        if (userResponse.data.email) {
          setEmail(userResponse.data.email);
        }
      } catch (error) {
        console.error(
          "Error fetching user data:",
          error.response?.data || error.message
        );
      }
    };

    fetchUserData();
  }, [userId, token]);

  // Obsługa przesłania formularza
  const handleSubmitForm = (e) => {
    e.preventDefault();

    // Walidacja formularza
    if (!email || !title || !description) {
      alert("Proszę wypełnić wszystkie pola.");
      return;
    }

    // Przygotowanie danych do wysłania przez FormSubmit
    const formData = new FormData();
    formData.append("email", email);
    formData.append("title", title);
    formData.append("description", description);

    // Wysłanie danych do FormSubmit API
    fetch("https://formsubmit.co/ajax/example@gmail.com", { //mail, do którego będzie wysyłana wiadomość
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        alert("Zgłoszenie zostało wysłane i e-mail został wysłany!");
        setEmail(email);
        setTitle("");
        setDescription("");
      })
      .catch((error) => {
        console.error("Error submitting form:", error);
        alert("Nie udało się wysłać zgłoszenia.");
      });
  };

  return (
    <>
      <HomeContainer>
        <Section>
          {/* Obraz strony głównej */}
          <Image
            src="https://imgs.search.brave.com/3ZISgELlSj7O93BAdJHpQEWYOWfhD3HPxSgc2pAo4l4/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWcu/ZnJlZXBpay5jb20v/cHJlbWl1bS16ZGpl/Y2llL21lY2hhbmlr/LXNhbW9jaG9kb3d5/LW5hcHJhd2lhamFj/eS1zYW1vY2hvZC13/LXdhcnN6dGFjaWUt/c2Ftb2Nob2Rvd3lt/Xzc0MjMzOS0xMzgx/LmpwZz9zZW10PWFp/c19oeWJyaWQ"
            width={100000}
            alt="Warsztat samochodowy"
          />
          {/* Opis działania aplikacji */}
          <Opis>
            <strong>Pan Alternator </strong> to serwis, który zapewni Ci komfort
            umawiania wizyt w warsztatach samochosowych bez konieczności
            wychodzenia z domu!
          </Opis>
          <Opis>
            Najlepsze warsztaty i najlepsi mechanicy, którzy znają się na
            wszystkim, co związane z autami. Umów wizytę już dziś!
          </Opis>
        </Section>
      </HomeContainer>

      {/* Formularz zgłoszeniowy */}
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
