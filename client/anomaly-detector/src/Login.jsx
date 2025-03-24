import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from './AuthService';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await loginUser(email, password);
      const token = response.data;
      localStorage.setItem('authToken', token);
      alert('Login successful!');
      navigate('/');
    } catch (error) {
      console.error('Login error:', error.response?.data);
      alert('Login failed!');
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#f5f5f5'
      }}
    >
      <div style={{ textAlign: 'center', padding: '2rem', border: '1px solid #ccc', borderRadius: '8px', background: '#fff' }}>
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <div>
            <input 
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ marginBottom: '1rem', padding: '0.5rem', width: '250px' }}
            />
          </div>
          <div>
            <input 
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ marginBottom: '1rem', padding: '0.5rem', width: '250px' }}
            />
          </div>
          <button type="submit" style={{ padding: '0.5rem 1rem' }}>Login</button>
        </form>
      </div>
    </div>
  );
}

export default Login;
