import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import styled from "styled-components";
import Register from "./components/Register";
import Login from "./components/Login";
import Home from "./components/Home";
import UserPage from "./components/UserPage";
import AdminDashboard from "./components/AdminDashboard";
import AdminWorkshopDashboard from "./components/AdminWorkshopDashboard";
import axios from "axios";
import WorkshopPage from "./components/WorkshopPage";
import Workshops from "./components/Workshops";

// Styled Components
const AppContainer = styled.div`
  font-family: "Arial", sans-serif;
  text-align: left;
  background: white;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: left;
  justify-content: left;
`;

const Title = styled.h1`
  color: #333;
  margin: 20px 0;
`;

const Navbar = styled.nav`
  background-color: #01295f; /* Granatowy kolor */
  width: 100%;
  padding: 15px 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000; /* Ustawienie na górze */
  display: flex;
  justify-content: space-between; /* Umożliwia rozmieszczenie elementów po przeciwnych stronach */
  align-items: center; /* Wyrównuje elementy w pionie */
`;

const TitleLink = styled(Link)`
  color: #ffffff; /* Biały kolor */
  text-decoration: none;
  font-weight: bold;
  font-size: 24px; /* Większy rozmiar czcionki dla tytułu */
  margin-left: 20px; /* Odstęp od lewej krawędzi */
`;

const WorkshopsLink = styled(Link)`
  color: #ffffff; /* Biały kolor */
  text-decoration: none;
  font-weight: bold;
  font-size: 24px; /* Większy rozmiar czcionki dla tytułu */
  margin-left: 20px; /* Odstęp od lewej krawędzi */
`;

const NavLinkContainer = styled.div`
  display: flex;
  align-items: center;
  margin-right: 20px; /* Dodany odstęp od prawej krawędzi */
`;

const NavLink = styled(Link)`
  color: #ffffff; /* Biały kolor */
  text-decoration: none;
  margin: 0 20px;
  font-weight: bold;
  font-size: 16px;

  &:hover {
    text-decoration: underline;
    color: white; /* Jaśniejszy niebieski na hover */
  }
`;

const LogoutButton = styled.button`
  background: #01295f; /* Kolor przycisku */
  color: white;
  border: none;
  padding: 10px 20px;
  margin-left: 15px;
  cursor: pointer;
  font-weight: bold;
  border-radius: 5px;

  &:hover {
    background: white; /* Jaśniejszy kolor przycisku na hover */
    color: #01295f;
  }
`;

const MainContent = styled.div`
  margin: 100px 20px 20px; /* Dodaj margines, aby pomieścić navbar */
  flex: 1;
`;

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [workshops, setWorkshops] = useState([]);
  const [selectedWorkshop, setSelectedWorkshop] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);

    // Fetch workshops if the user is authenticated
    if (token) {
      const fetchWorkshops = async () => {
        try {
          const response = await axios.get(
            "http://localhost:5109/api/AutoRepairShop/workshops"
          );
          setWorkshops(response.data);
        } catch (error) {
          console.error("Error fetching workshops:", error);
        }
      };

      fetchWorkshops();
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <AppContainer>
        <Navbar>
          <NavLinkContainer>
            <TitleLink to="/">Pan Alternator</TitleLink>
            <WorkshopsLink to="/workshop">Warsztaty</WorkshopsLink>
          </NavLinkContainer>
          <NavLinkContainer>
            {isAuthenticated ? (
              <>
                <NavLink to="/user">Twoje konto</NavLink>
                <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
              </>
            ) : (
              <>
                <NavLink to="/register">Zarejestruj się</NavLink>
                <NavLink to="/login">Zaloguj się</NavLink>
              </>
            )}
          </NavLinkContainer>
        </Navbar>
        <MainContent>
          <Routes>
            <Route path="/" element={<Home workshops={workshops} />} />
            <Route
              path="/user"
              element={
                isAuthenticated ? (
                  <UserPage />
                ) : (
                  <Login setIsAuthenticated={setIsAuthenticated} />
                )
              }
            />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route
              path="/register"
              element={<Register setIsAuthenticated={setIsAuthenticated} />}
            />
            <Route
              path="/login"
              element={<Login setIsAuthenticated={setIsAuthenticated} />}
            />
            <Route path="/workshop" element={<Workshops />} />
            <Route path="/workshop/:id" element={<WorkshopPage />} />
            <Route
              path="/admin/workshop-dashboard"
              element={<AdminWorkshopDashboard />}
            />
          </Routes>
        </MainContent>
      </AppContainer>
    </Router>
  );
}

export default App;
