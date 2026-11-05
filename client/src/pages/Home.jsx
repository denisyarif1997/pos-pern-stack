import React, { useEffect, useState } from 'react';
import { Grid, Card, CardContent, Typography, CircularProgress, Box } from '@mui/material';

const API_BASE = "http://localhost:3000/api"; // replace with actual backend URL

const Home = () => {
  const [warehouses, setWarehouses] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/warehouses`)
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(data => setWarehouses(data))
      .catch(err => setError(err.message));
  }, []);

  if (error) {
    return (
      <Typography color="error" sx={{ color: '#ff6b6b', p: 2 }}>
        Error: {error}
      </Typography>
    );
  }

  if (!warehouses) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2, color: '#fff' }}>Loading warehouses...</Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {warehouses.map((w) => (
        <Grid item xs={12} sm={6} md={4} key={w.id}>
          <Card sx={{ backgroundColor: '#1e1e3f', border: '1px solid rgba(255,255,255,0.08)' }}>
            <CardContent>
              <Typography variant="h6">{w.name}</Typography>
              <Typography variant="body2">Location: {w.location}</Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default Home;
