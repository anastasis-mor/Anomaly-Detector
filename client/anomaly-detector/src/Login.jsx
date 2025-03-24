import React, { useState } from 'react';
import { loginUser } from './AuthService';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Make login request
      const response = await loginUser(email, password);
      // If your backend just returns the token, you can do:
      const token = response.data;

      // Store token in localStorage
      localStorage.setItem('authToken', token);
      console.log('Token saved:', token);

      alert('Login successful!');
    } catch (error) {
      console.error('Login error:', error.response?.data);
      alert('Login failed!');
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input 
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        /><br/>

        <input 
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        /><br/>

        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;
