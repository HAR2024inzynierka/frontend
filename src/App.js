import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link} from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import Home from './components/Home';
import UserPage from './components/UserPage';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Проверяем, есть ли токен в localStorage
        const token = localStorage.getItem('token');
        setIsAuthenticated(!!token);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
    };

    return (
        <Router>
            <div className="App">
                <h1>Workshop</h1>
                <nav>
                    <Link to="/">Home</Link> |{' '}
                    {isAuthenticated ? (
                        <>
                            <Link to="/user">User Page</Link> |{' '}
                            <button onClick={handleLogout}>Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/register">Register</Link> |{' '}
                            <Link to="/login">Login</Link>
                        </>
                    )}
                </nav>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route
                        path="/user"
                        element={isAuthenticated ? <UserPage /> : <Login setIsAuthenticated={setIsAuthenticated} />}
                    />
                    <Route path="/register" element={<Register setIsAuthenticated={setIsAuthenticated} />} />
                    <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
