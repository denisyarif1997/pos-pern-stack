import React from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { formatCurrency } from '../../utils/currency';

const HeldCartsDialog = ({
  open,
  onClose,
  heldCarts,
  customers,
  onResume,
  onDiscard,
}) => {
  const getCustomerName = (customer) =>
    customer ? (customer['Nama Customer'] || customer.name || 'Pelanggan umum') : 'Pelanggan umum';

  if (!open) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Transaksi Tertahan</DialogTitle>
      <DialogContent dividers>
        {heldCarts.length ? (
          <Stack spacing={1.5}>
            {heldCarts.map((heldCart) => {
              const heldTotal = heldCart.cart.reduce(
                (total, item) =>
                  total +
                  Math.round(item.price * (1 - (Number(item.discountPct) || 0) / 100)) *
                    item.quantity,
                0
              );
              const customer = customers.find(
                (c) => String(c.id) === String(heldCart.customerId)
              );
              return (
                <Paper key={heldCart.id} variant="outlined" sx={{ p: 2 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 2,
                      alignItems: 'center',
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle2">
                        {getCustomerName(customer)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(heldCart.createdAt).toLocaleString('id-ID')} ·{' '}
                        {heldCart.cart.reduce((sum, item) => sum + item.quantity, 0)} item
                      </Typography>
                      <Typography variant="body2" fontWeight={700} sx={{ mt: 0.5 }}>
                        {formatCurrency(heldTotal)}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => onResume(heldCart)}
                      >
                        Lanjutkan
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        onClick={() => onDiscard(heldCart.id)}
                      >
                        Hapus
                      </Button>
                    </Stack>
                  </Box>
                </Paper>
              );
            })}
          </Stack>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Belum ada transaksi yang ditahan.
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Tutup</Button>
      </DialogActions>
    </Dialog>
  );
};

export default HeldCartsDialog;