import React from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import { formatCurrency } from '../../utils/currency';

const paymentLabels = {
  cash: 'Tunai',
  qris: 'QRIS',
  transfer: 'Transfer',
  card: 'Kartu',
};

const ReceiptDialog = ({
  open,
  onClose,
  onPrint,
  onNewTransaction,
  receipt,
}) => {
  if (!open) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Struk Pembelian</DialogTitle>
      <DialogContent dividers>
        <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
            Kasir POS
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 2 }}>
            Terima kasih telah berbelanja
          </Typography>
          <Stack spacing={1}>
            {receipt.items?.map((item, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.875rem',
                }}
              >
                <Typography variant="body2">{item.name}</Typography>
                <Typography variant="body2" align="right">
                  {formatCurrency(item.unitPrice * item.quantity)}
                </Typography>
              </Box>
            ))}
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">Subtotal</Typography>
              <Typography variant="body2" align="right">
                {formatCurrency(receipt.subtotal)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">
                Diskon transaksi ({receipt.discountRate}%)
              </Typography>
              <Typography variant="body2" align="right">
                -{formatCurrency(receipt.discountAmount)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">PPN ({receipt.taxRate}%)</Typography>
              <Typography variant="body2" align="right">
                {formatCurrency(receipt.taxAmount)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
              <Typography variant="body2">Total</Typography>
              <Typography variant="body2" align="right">
                {formatCurrency(receipt.total)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">Dibayar</Typography>
              <Typography variant="body2" align="right">
                {formatCurrency(receipt.payment)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">Metode</Typography>
              <Typography variant="body2" align="right">
                {receipt.payments?.length
                  ? receipt.payments
                      .map(
                        (line) =>
                          `${paymentLabels[line.method] || line.method} ${formatCurrency(line.tendered || line.amount)}`
                      )
                      .join(' + ')
                  : 'Tidak ada pembayaran'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">Akun</Typography>
              <Typography variant="body2" align="right">
                {receipt.account?.name || '-'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">Kembalian</Typography>
              <Typography variant="body2" align="right">
                {formatCurrency(receipt.change)}
              </Typography>
            </Box>
          </Stack>
          <Typography variant="caption" display="block" align="center" sx={{ mt: 1.5 }}>
            Terima kasih telah berbelanja
          </Typography>
        </Paper>
        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={onPrint}
          >
            Cetak Struk
          </Button>
          <Button
            fullWidth
            variant="contained"
            onClick={onNewTransaction}
          >
            Transaksi Baru
          </Button>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button onClick={onClose}>Tutup</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReceiptDialog;