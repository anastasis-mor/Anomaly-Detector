import React from 'react';

function Home() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#f5f5f5'
      }}
    >
      <h1>Welcome to Agent+</h1>
      <p style={{ maxWidth: '600px', textAlign: 'center' }}>
        Graphs Will implement here
      </p>

    </div>
  );
}

export default Home;
