import React, { useState } from 'react';
import axios from 'axios';

function TestGetUser() {
  const [userId, setUserId] = useState('');
  const [userData, setUserData] = useState(null);

  const handleGetUser = async () => {
    try {
      // Grab the token from localStorage (assuming you stored it on login)
      const token = localStorage.getItem('authToken');
      if (!token) {
        alert('No token found. Please log in first.');
        return;
      }

      // Make a GET request to your backend
      const response = await axios.get(`http://localhost:8080/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`, // Attach the token
        },
      });

      // Store the user data in state
      setUserData(response.data);
    } catch (error) {
      console.error('Error fetching user:', error.response?.data || error.message);
      alert('Error fetching user. Check console for details.');
    }
  };

  return (
    <div>
      <h2>Test: Get User by ID</h2>
      <input
        type="text"
        placeholder="Enter MongoDB _id here"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
      />
      <button onClick={handleGetUser}>Fetch User</button>

      {userData && (
        <div>
          <h3>Result:</h3>
          <pre>{JSON.stringify(userData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default TestGetUser;
