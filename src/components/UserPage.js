import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';

function UserPage() {
    const [user, setUser] = useState(null);
    const [cars, setCars] = useState([]);
    const [newCar, setNewCar] = useState({ brand: '', model: '', registrationNumber: '' });

    // Получаем токен из localStorage
    const token = localStorage.getItem('token');
    
    // Декодируем токен и извлекаем userId
    const userId = token ? jwtDecode(token).nameid : null;

    useEffect(() => {
        const fetchUser = async () => {
            if (!userId) return;

            // Получаем данные пользователя
            const response = await axios.get(`http://localhost:5109/api/user/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUser(response.data);

            // Получаем автомобили пользователя, если есть соответствующий API
            const carsResponse = await axios.get(`http://localhost:5109/api/user/${userId}/vehicles`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCars(carsResponse.data);
        };

        fetchUser();
    }, [userId, token]);

    const handleAddCar = async (e) => {
        e.preventDefault();
        if (!userId) {
            console.log("net user id")
            return;
        }

        // Запрос на добавление автомобиля
        await axios.post(`http://localhost:5109/api/user/${userId}/vehicle`, newCar, {
            headers: { Authorization: `Bearer ${token}` }
        });

        setNewCar({ brand: '', model: '', registrationNumber: '' });
        
        // Обновление списка автомобилей
        const carsResponse = await axios.get(`http://localhost:5109/api/user/${userId}/vehicles`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setCars(carsResponse.data);
    };

    return (
        <div>
            <h2>User Profile</h2>
            {user && (
                <div>
                    <p>Login: {user.login}</p>
                    <p>Email: {user.email}</p>
                </div>
            )}
            <h3>Your Cars</h3>
            <form onSubmit={handleAddCar}>
                <input
                    type="text"
                    placeholder="Marka"
                    value={newCar.brand}
                    onChange={(e) => setNewCar({ ...newCar, brand: e.target.value })}
                    required
                />
                <input
                    type="text"
                    placeholder="Model"
                    value={newCar.model}
                    onChange={(e) => setNewCar({ ...newCar, model: e.target.value })}
                    required
                />
                <input
                    type="text"
                    placeholder="Nr Rejestracyjny"
                    value={newCar.registrationNumber}
                    onChange={(e) => setNewCar({ ...newCar, registrationNumber: e.target.value })}
                    required
                />
                <button type="submit">Add Car</button>
            </form>

            <ul>
                {cars.map((car) => (
                    <li key={car.id}>
                        {car.brand} {car.model} - {car.registrationNumber}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default UserPage;
