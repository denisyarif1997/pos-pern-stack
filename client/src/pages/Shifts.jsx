import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import {
  addCashMovement,
  closeShift,
  getActiveShift,
  getCashMovements,
  getShiftHistory,
  openShift,
} from '../services/api';

const currency = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

const rowsFrom = (response) => response.data?.data || response.data;

const Shifts = () => {
  const [shift, setShift] = useState(null);
  const [movements, setMovements] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openingCash, setOpeningCash] = useState('');
  const [countedCash, setCountedCash] = useState('');
  const [movementDialog, setMovementDialog] = useState(false);
  const [movementType, setMovementType] = useState('in');
  const [movementAmount, setMovementAmount] = useState('');
  const [movementNote, setMovementNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const refreshShift = useCallback(async () => {
    setError('');
    try {
      const response = await getActiveShift();
      const currentShift = rowsFrom(response) || null;
      setShift(currentShift);
      const historyResponse = await getShiftHistory();
      setHistory(rowsFrom(historyResponse) || []);
      if (currentShift) {
        const movementsResponse = await getCashMovements(currentShift.id);
        setMovements(rowsFrom(movementsResponse) || []);
      } else {
        setMovements([]);
      }
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Gagal memuat status shift.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshShift();
  }, [refreshShift]);

  const handleOpen = async (event) => {
    event.preventDefault();
    const amount = Number(openingCash);
    if (openingCash === '' || !Number.isFinite(amount) || amount < 0) {
      setError('Masukkan modal awal yang valid.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const response = await openShift({ opening_cash: amount });
      const openedShift = rowsFrom(response);
      setShift(openedShift);
      setHistory((current) => [openedShift, ...current.filter((item) => item.id !== openedShift.id)].slice(0, 30));
      setMovements([]);
      setOpeningCash('');
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Shift tidak dapat dibuka.');
    } finally {
      setSaving(false);
    }
  };

  const handleMovement = async (event) => {
    event.preventDefault();
    const amount = Number(movementAmount);
    if (movementAmount === '' || !Number.isFinite(amount) || amount <= 0 || !movementNote.trim()) {
      setError('Isi nominal dan keterangan kas dengan benar.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      await addCashMovement(shift.id, {
        movement_type: movementType,
        amount,
        note: movementNote.trim(),
      });
      setMovementDialog(false);
      setMovementAmount('');
      setMovementNote('');
      await refreshShift();
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Pergerakan kas gagal disimpan.');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = async (event) => {
    event.preventDefault();
    const amount = Number(countedCash);
    if (countedCash === '' || !Number.isFinite(amount) || amount < 0) {
      setError('Masukkan jumlah kas yang benar-benar dihitung.');
      return;
    }
    if (!window.confirm('Tutup shift sekarang? Checkout tidak dapat dilakukan sampai shift baru dibuka.')) return;

    setSaving(true);
    setError('');
    try {
      const response = await closeShift(shift.id, { counted_cash: amount });
      const closedShift = rowsFrom(response);
      setResult(closedShift);
      setHistory((current) => [closedShift, ...current.filter((item) => item.id !== closedShift.id)].slice(0, 30));
      setShift(null);
      setMovements([]);
      setCountedCash('');
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Shift tidak dapat ditutup.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4">Shift kasir</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
          Catat modal awal, pergerakan kas, dan hasil penutupan shift.
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {result && (
        <Alert
          severity={Number(result.discrepancy) === 0 ? 'success' : 'warning'}
          onClose={() => setResult(null)}
          sx={{ mb: 2 }}
        >
          Shift ditutup. Kas seharusnya {currency.format(Number(result.expected_cash) || 0)}, dihitung{' '}
          {currency.format(Number(result.counted_cash) || 0)}; selisih{' '}
          {currency.format(Number(result.discrepancy) || 0)}.
        </Alert>
      )}

      {!shift ? (
        <Card>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="h6" sx={{ mb: 1 }}>Belum ada shift aktif</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Buka shift sebelum memproses penjualan di POS.
            </Typography>
            <Box component="form" onSubmit={handleOpen}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'flex-start' }}>
                <TextField
                  label="Modal awal"
                  type="number"
                  value={openingCash}
                  onChange={(event) => setOpeningCash(event.target.value)}
                  slotProps={{ htmlInput: { min: 0, step: 1, inputMode: 'numeric' } }}
                  required
                  fullWidth
                />
                <Button type="submit" variant="contained" disabled={saving} sx={{ minHeight: 56, minWidth: 180 }}>
                  {saving ? 'Membuka...' : 'Buka shift'}
                </Button>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
              <Box>
                <Typography variant="h6">Shift #{shift.id} aktif</Typography>
                <Typography variant="body2" color="text.secondary">
                  Dibuka {new Date(shift.opened_at).toLocaleString('id-ID')}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Perkiraan kas saat ini</Typography>
                <Typography variant="h5" fontWeight={800}>
                  {currency.format(Number(shift.expected_cash) || 0)}
                </Typography>
              </Box>
            </Stack>

            <Alert severity="info" sx={{ mb: 2 }}>
              Modal awal: {currency.format(Number(shift.opening_cash) || 0)}. Penjualan tunai dan pergerakan kas
              tercatat otomatis dalam perhitungan penutupan.
            </Alert>

            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
              Pergerakan kas shift ini
            </Typography>
            {movements.length ? (
              <Stack divider={<Divider flexItem />} sx={{ mb: 2 }}>
                {movements.map((movement) => (
                  <Stack
                    key={movement.id}
                    direction="row"
                    justifyContent="space-between"
                    spacing={2}
                    sx={{ py: 1 }}
                  >
                    <Box>
                      <Typography variant="body2" fontWeight={700}>
                        {movement.movement_type === 'in' ? 'Kas masuk' : 'Kas keluar'} · {movement.note}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(movement.created_at).toLocaleString('id-ID')}
                      </Typography>
                    </Box>
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      color={movement.movement_type === 'in' ? 'success.main' : 'error.main'}
                    >
                      {movement.movement_type === 'in' ? '+' : '-'}{currency.format(Number(movement.amount) || 0)}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Belum ada pergerakan kas.
              </Typography>
            )}

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 3 }}>
              <Button variant="outlined" onClick={() => { setMovementType('in'); setMovementDialog(true); }}>
                Kas masuk
              </Button>
              <Button variant="outlined" onClick={() => { setMovementType('out'); setMovementDialog(true); }}>
                Kas keluar
              </Button>
            </Stack>

            <Box component="form" onSubmit={handleClose}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
                Tutup shift
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'flex-start' }}>
                <TextField
                  label="Kas fisik hasil hitung"
                  type="number"
                  value={countedCash}
                  onChange={(event) => setCountedCash(event.target.value)}
                  slotProps={{ htmlInput: { min: 0, step: 1, inputMode: 'numeric' } }}
                  required
                  fullWidth
                />
                <Button type="submit" variant="contained" color="warning" disabled={saving} sx={{ minHeight: 56, minWidth: 180 }}>
                  {saving ? 'Menutup...' : 'Tutup shift'}
                </Button>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      )}

      <Dialog open={movementDialog} onClose={() => setMovementDialog(false)} maxWidth="xs" fullWidth>
        <Box component="form" onSubmit={handleMovement}>
          <DialogTitle>{movementType === 'in' ? 'Catat kas masuk' : 'Catat kas keluar'}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 1 }}>
              <TextField
                label="Nominal"
                type="number"
                value={movementAmount}
                onChange={(event) => setMovementAmount(event.target.value)}
                slotProps={{ htmlInput: { min: 1, step: 1, inputMode: 'numeric' } }}
                required
              />
              <TextField
                label="Keterangan"
                value={movementNote}
                onChange={(event) => setMovementNote(event.target.value)}
                inputProps={{ maxLength: 200 }}
                required
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setMovementDialog(false)} disabled={saving}>Batal</Button>
            <Button type="submit" variant="contained" disabled={saving}>
              Simpan
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Card sx={{ mt: 2.5 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 1.5 }}>Riwayat 30 shift terakhir</Typography>
          {history.length ? (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Shift</TableCell>
                  <TableCell>Dibuka</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Kas seharusnya</TableCell>
                  <TableCell>Kas dihitung</TableCell>
                  <TableCell>Selisih</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {history.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>#{item.id}</TableCell>
                    <TableCell>{new Date(item.opened_at).toLocaleString('id-ID')}</TableCell>
                    <TableCell>{item.status === 'open' ? 'Aktif' : 'Ditutup'}</TableCell>
                    <TableCell>{item.expected_cash == null ? '-' : currency.format(Number(item.expected_cash) || 0)}</TableCell>
                    <TableCell>{item.counted_cash == null ? '-' : currency.format(Number(item.counted_cash) || 0)}</TableCell>
                    <TableCell>{item.discrepancy == null ? '-' : currency.format(Number(item.discrepancy) || 0)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Typography variant="body2" color="text.secondary">Belum ada riwayat shift.</Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Shifts;
