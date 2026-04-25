'use client';

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  TextField,
  Typography,
} from '@mui/material';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { clearStorage } from '../utils/clearStorage';
import { API_URL } from '../utils/constants';
import { isTokenExpired } from '../utils/isTokenExpired';

const DEMO_EMAIL = 'demo@rafaelcostadev.com';
const DEMO_PASSWORD = 'demo123';

const LoginPage = () => {
  const [email, setEmail] = useState(DEMO_EMAIL);
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      if (isTokenExpired()) {
        clearStorage();
      } else {
        window.location.href = '/';
      }
    } else {
      clearStorage();
    }
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });
      const token = response.data.access_token;
      const expires_at = response.data.expires_at;
      localStorage.setItem('token', token);
      localStorage.setItem('expires_at', expires_at);
      window.location.href = '/';
    } catch (err) {
      setError('Falha na autenticação. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      maxWidth="sm"
      className="mt-[10%] p-5 shadow-lg rounded-lg"
      style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
    >
      <Box
        className="flex flex-col items-center"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h4" className="mb-5">
          Login
        </Typography>
        <Alert severity="info" className="mb-4 w-full">
          Conta demo disponível, credenciais já preenchidas. Clique em <strong>Entrar</strong>.
        </Alert>
        {error && (
          <Alert severity="error" className="mb-4">
            {error}
          </Alert>
        )}
        <Box
          component="form"
          sx={{ mt: 1 }}
          className="w-full flex flex-col"
          noValidate
          onSubmit={handleSubmit}
        >
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email"
            name="email"
            autoComplete="email"
            autoFocus
            className="mb-4"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            InputProps={{ readOnly: email === DEMO_EMAIL }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Senha"
            type="password"
            id="password"
            autoComplete="current-password"
            className="mb-4"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{ readOnly: email === DEMO_EMAIL }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            className="mt-4 mb-4"
            disabled={loading}
            size="large"
          >
            {loading ? <CircularProgress size={24} /> : 'Entrar'}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default LoginPage;
