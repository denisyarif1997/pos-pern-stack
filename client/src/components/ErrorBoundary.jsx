import React, { Component } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Alert,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            textAlign: 'center',
            p: 3,
          }}
        >
          <Card sx={{ maxWidth: 420, width: '100%', p: 3 }}>
            <Alert severity="error" sx={{ mb: 2 }}>
              Terjadi kesalahan yang tidak terduga.
            </Alert>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {this.state.error?.message || 'Kesalahan tidak diketahui'}
            </Typography>
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={this.handleReset}
              sx={{ borderRadius: 2 }}
            >
              Muat Ulang Halaman
            </Button>
          </Card>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;