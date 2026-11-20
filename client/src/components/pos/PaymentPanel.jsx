import React from 'react';
import { Box, Button, MenuItem, Stack, TextField, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { formatCurrency } from '../../utils/currency';

export const paymentMethods = [
  { value: 'cash', label: 'Tunai' },
  { value: 'qris', label: 'QRIS' },
  { value: 'transfer', label: 'Transfer' },
  { value: 'card', label: 'Kartu' },
];

const PaymentPanel = ({
  paymentLines,
  total,
  amountPaid,
  change,
  onUpdatePaymentLine,
  onAddPaymentLine,
  onRemovePaymentLine,
}) => {
  const nonCashTotal = paymentLines
    .filter((line) => line.method !== 'cash')
    .reduce((sum, line) => sum + Number(line.amount), 0);
  const cashRequired = Math.max(total - nonCashTotal, 0);
  const cashTendered = Number(
    paymentLines.find((line) => line.method === 'cash')?.amount || 0
  );
  const availableMethod = paymentMethods.find(
    (m) => !paymentLines.some((l) => l.method === m.value)
  );

  return (
    <Stack spacing={1.5}>
      {paymentLines.map((line, index) => {
        const method = paymentMethods.find((m) => m.value === line.method);
        const isCash = line.method === 'cash';

        return (
          <Box
            key={line.id}
            sx={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 1,
              padding: 1,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              backgroundColor: 'background.paper',
            }}
          >
            <TextField
              select
              size="small"
              value={line.method}
              onChange={(e) => onUpdatePaymentLine(line.id, 'method', e.target.value)}
              label="Metode"
              sx={{ minWidth: 120, flex: '1 1 120px' }}
              SelectProps={{
                native: true,
                displayEmpty: true,
              }}
            >
              {paymentMethods.map((m) => (
                <MenuItem key={m.value} value={m.value}>
                  {m.label}
                </MenuItem>
              ))}
            </TextField>
            {isCash ? (
              <>
                <TextField
                  type="number"
                  size="small"
                  value={cashTendered === 0 ? '' : String(cashTendered)}
                  onChange={(e) => onUpdatePaymentLine(line.id, 'amount', e.target.value)}
                  label="Terima"
                  slotProps={{
                    input: {
                      inputMode: 'numeric',
                      min: 0,
                    },
                  }}
                  sx={{ minWidth: 120, flex: '1 1 140px' }}
                />
                <Typography variant="body2" fontWeight={700} sx={{ minWidth: 100, flex: '1 1 100px', textAlign: 'right' }}>
                  Kembali: {formatCurrency(Math.max(cashTendered - cashRequired, 0))}
                </Typography>
              </>
            ) : (
              <>
                <TextField
                  type="number"
                  size="small"
                  value={line.amount || ''}
                  onChange={(e) => onUpdatePaymentLine(line.id, 'amount', e.target.value)}
                  label="Jumlah"
                  slotProps={{
                    input: {
                      inputMode: 'numeric',
                      min: 0,
                    },
                  }}
                  sx={{ minWidth: 120, flex: '1 1 140px' }}
                />
                <Typography variant="body2" fontWeight={700} sx={{ minWidth: 100, flex: '1 1 100px', textAlign: 'right' }}>
                  {formatCurrency(Number(line.amount) || 0)}
                </Typography>
              </>
            )}
            {paymentLines.length > 1 && (
              <Button
                size="small"
                color="error"
                startIcon={<DeleteIcon fontSize="small" />}
                aria-label={`Hapus metode ${method?.label || line.method}`}
                onClick={() => onRemovePaymentLine(line.id)}
                sx={{ minWidth: 'auto', ml: 'auto', whiteSpace: 'nowrap' }}
              >
                Hapus
              </Button>
            )}
          </Box>
        );
      })}
      {paymentLines.length < paymentMethods.length && availableMethod && (
        <Button
          size="small"
          variant="outlined"
          onClick={() => onAddPaymentLine()}
          sx={{ alignSelf: 'flex-start' }}
        >
          + Tambah {availableMethod.label}
        </Button>
      )}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1 }}>
        <Typography variant="body2" fontWeight={600} color="text.primary">
          Total
        </Typography>
        <Typography variant="h6" fontWeight={800} color="primary.dark">
          {formatCurrency(total)}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="body2">Dibayar</Typography>
        <Typography variant="body2" align="right">
          {formatCurrency(amountPaid)}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
        <Typography variant="body2">Kembalian</Typography>
        <Typography variant="body2" align="right">
          {formatCurrency(change)}
        </Typography>
      </Box>
    </Stack>
  );
};

export default PaymentPanel;