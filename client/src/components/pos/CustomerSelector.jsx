import React from 'react';
import { Box, MenuItem, TextField, Typography } from '@mui/material';

const CustomerSelector = ({ customers, value, onChange }) => {
  const getCustomerName = (customer) =>
    customer ? (customer['Nama Customer'] || customer.name || 'Pelanggan umum') : 'Pelanggan umum';

  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>
        Pelanggan
      </Typography>
      <TextField
        select
        fullWidth
        size="small"
        label="Pelanggan"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        slotProps={{ htmlInput: { 'aria-label': 'Pilih pelanggan' } }}
      >
        <MenuItem value="">Pelanggan umum</MenuItem>
        {customers.map((customer) => (
          <MenuItem key={customer.id} value={customer.id}>
            {getCustomerName(customer)}
          </MenuItem>
        ))}
      </TextField>
    </Box>
  );
};

export default CustomerSelector;