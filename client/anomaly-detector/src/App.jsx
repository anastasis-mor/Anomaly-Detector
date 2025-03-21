import React from 'react';
import Register from './Register';
import Login from './Login';
import UserProfile from './UserProfile';

function App() {
  return (
    <div>
      <h1>MERN Security App</h1>
      <Register />
      <hr />
      <Login />
      <hr />
      <UserProfile />
    </div>
  );
}

export default App;
