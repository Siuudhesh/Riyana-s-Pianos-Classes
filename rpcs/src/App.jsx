import React, { useState } from 'react';
import Login from './components/Login';
import { CssBaseline } from '@mui/material';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  if (!isLoggedIn) {
    return (
      <>
        <CssBaseline />
        <Login onLogin={setIsLoggedIn} />
      </>
    );
  }

  return (
    <div>
      <h1>Riyana's Piano Classes</h1>
      {/* We'll add more components here later */}
    </div>
  );
}

export default App;