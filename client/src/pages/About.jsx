import React from 'react';
import { Box, Typography } from '@mui/material';

const About = () => (
  <Box sx={{ p: 3, backgroundColor: '#1e1e3f', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 2 }}>
    <Typography variant="h4" gutterBottom>
      About This App
    </Typography>
    <Typography>
      This is a premium warehouse management UI built with React, Vite, and Material‑UI. It showcases a modern glass‑morphism design, smooth micro‑animations, and a dark gradient background.
    </Typography>
  </Box>
);

export default About;
