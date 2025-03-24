import React, { useState } from 'react';
import { getUserData } from './AuthService';

function UserProfile() {
  const [userId, setUserId] = useState('');
  const [userData, setUserData] = useState(null);

  const handleFetchUser = async () => {
    try {
      // Retrieve token from localStorage
      const token = localStorage.getItem('authToken');
      if (!token) {
        alert('No token found. Please log in first.');
        return;
      }

      // Call the protected route
      const response = await getUserData(userId, token);
      setUserData(response.data);
    } catch (error) {
      console.error('Error fetching user data:', error.response?.data);
      alert('Failed to fetch user data!');
    }
  };

  return (
    <div>
      <h2>Fetch User Profile</h2>
      <input
        type="text"
        placeholder="Enter user ID"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
      />
      <button onClick={handleFetchUser}>Fetch User</button>

      {userData && (
        <div>
          <h3>User Info:</h3>
          <p>Name: {userData.name}</p>
          <p>Email: {userData.email}</p>
          {/* Additional fields as needed */}
        </div>
      )}
    </div>
  );
}

export default UserProfile;
