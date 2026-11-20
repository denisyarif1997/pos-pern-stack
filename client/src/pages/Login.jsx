import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  IconButton,
  InputAdornment,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal masuk. Periksa kembali email dan kata sandi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at 15% 15%, rgba(15, 118, 110, 0.09), transparent 28%), #F5F7FA',
        p: { xs: 2, sm: 3 },
      }}
    >
      <Card
        sx={{
          maxWidth: 420,
          width: '100%',
          backgroundColor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 4,
          boxShadow: '0 20px 60px rgba(23, 43, 77, 0.10)',
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2.5 }}>
            <Box sx={{ width: 52, height: 52, borderRadius: 3, display: 'grid', placeItems: 'center', bgcolor: 'primary.main', color: '#fff' }}>
              <PointOfSaleIcon sx={{ fontSize: 28 }} />
            </Box>
          </Box>
          <Typography variant="h4" align="center" sx={{ fontWeight: 800, mb: 1 }}>
            Kasir POS
          </Typography>
          <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3.5 }}>
            Masuk untuk mengelola toko
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              sx={{ mb: 2 }}
              slotProps={{
                input: { sx: { borderRadius: 2 } },
              }}
            />
            <TextField
              fullWidth
              label="Kata sandi"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              sx={{ mb: 3 }}
              slotProps={{
                input: {
                  sx: { borderRadius: 2 },
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{ color: 'text.secondary' }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                py: 1.5,
                borderRadius: 2,
                fontWeight: 600,
              }}
            >
              {loading ? 'Memproses...' : 'Masuk'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;