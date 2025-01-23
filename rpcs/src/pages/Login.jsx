import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Paper, TextField, Button, Typography, Container, Box, useMediaQuery } from '@mui/material';
import '../styles/Login.css';
import '../styles/common.css';
import '../styles/transitions.css';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const isMobile = useMediaQuery('(max-width:600px)');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = (e) => {
    e.preventDefault();
    const VALID_USERNAME = 'Riyana';
    const VALID_PASSWORD = 'Riyana2004';

    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
      login();
      navigate('/dashboard');
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="page-wrapper">
      {!isMobile && (
        <div className="floating-notes">
          <span className="music-note">♪</span>
          <span className="music-note">♫</span>
          <span className="music-note">♬</span>
        </div>
      )}
      <Container component="main" maxWidth="md" className="main-container">
        <Box className="login-container">
          <Paper className="login-paper" elevation={3}>
            <div className="piano-keys">
              <div className="white-key"></div>
              <div className="black-key"></div>
              <div className="white-key"></div>
              <div className="black-key"></div>
              <div className="white-key"></div>
            </div>
            <Typography component="h1" variant="h4" className="login-title">
              Welcome Back, Ri!
            </Typography>
            <Typography variant="subtitle1" className="login-subtitle">
              Manage Classes and Students through this Site! 😁
            </Typography>
            <Box component="form" onSubmit={handleLogin} className="login-form">
              <TextField
                margin="normal"
                required
                fullWidth
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
                className="login-input"
              />
              <TextField
                margin="normal"
                required
                fullWidth
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="login-input"
              />
              {error && (
                <Typography color="error" variant="body2" className="login-error">
                  {error}
                </Typography>
              )}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                className="login-button"
              >
                Begin Your Session ✨
              </Button>
            </Box>
          </Paper>
          <Typography variant="caption" className="login-footer">
            🎵 Riyana's Piano Classes - Made with ❤️ by Sudha
          </Typography>
        </Box>
      </Container>
    </div>
  );
};

export default Login;
