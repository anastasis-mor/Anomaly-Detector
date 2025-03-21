import axios from 'axios';

// Adjust baseURL to match your backend server
const API_URL = 'http://localhost:8080';

export const registerUser = (name, email, password) => {
  return axios.post(`${API_URL}/user/register`, {
    name,
    email,
    password,
  });
};

export const loginUser = (email, password) => {
  return axios.post(`${API_URL}/user/login`, {
    email,
    password,
  });
};

// Example: Protected route (GET /user/:id)
export const getUserData = (userId, token) => {
  return axios.get(`${API_URL}/user/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
