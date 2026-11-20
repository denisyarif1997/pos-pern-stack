import React from 'react';
import { Snackbar, Alert } from '@mui/material';

const SnackbarAlert = ({ open, message, severity, onClose }) => {
  if (!open) return null;

  return (
    <Snackbar
      open={open}
      autoHideDuration={3500}
      onClose={() => onClose(false)}
    >
      <Alert severity={severity} variant="filled" sx={{ borderRadius: 2 }}>
        {message}
      </Alert>
    </Snackbar>
  );
};

export default SnackbarAlert;