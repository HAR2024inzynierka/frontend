import React, { useEffect, useState } from 'react';
import axios from 'axios';

function AdminDashboard(){
    const [users, setUsers] = useState([]);

    const token = localStorage.getItem('token');

    useEffect(() =>{
        const fetchUsers = async() => {
            try{
                const response = await axios.get('http://localhost:5109/api/admin/users', {
                    headers: { Authorization: `Bearer ${token}`}
                });
                setUsers(response.data);
            } catch (error){
                console.error("Access denied or error fetching users.", error);
            }
        };
        fetchUsers();
    }, [token]);

    return (
        <div>
            <h1>Admin Dashboard</h1>
            <h2>All Users</h2>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Login</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Role</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user=>(
                        <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>{user.login}</td>
                            <td>{user.email}</td>
                            <td>{user.phoneNumber}</td>
                            <td>{user.role == 1 ? 'Admin' : 'User'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default AdminDashboard;