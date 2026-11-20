import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  MenuItem,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ReplayIcon from '@mui/icons-material/Replay';
import DataTable from '../components/DataTable';
import { createTransactionReturn, getReturnableTransaction, getTransactions } from '../services/api';

const currency = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

const columns = [
  { field: 'id', headerName: 'No. transaksi', width: 130 },
  { field: 'cashier name', headerName: 'Kasir', width: 160 },
  { field: 'customer name', headerName: 'Pelanggan', width: 180 },
  { field: 'nama barang', headerName: 'Produk', flex: 1, minWidth: 180 },
  { field: 'jumlah item', headerName: 'Qty', width: 90 },
  { field: 'jumlah diretur', headerName: 'Qty retur', width: 100 },
  { field: 'sisa retur', headerName: 'Sisa retur', width: 100 },
  { field: 'total', headerName: 'Total', width: 150, renderCell: (params) => currency.format(Number(params.value) || 0) },
  { field: 'pembayaran', headerName: 'Dibayar', width: 150, renderCell: (params) => currency.format(Number(params.value) || 0) },
  { field: 'metode pembayaran', headerName: 'Metode', width: 170 },
  { field: 'kembalian', headerName: 'Kembalian', width: 150, renderCell: (params) => currency.format(Number(params.value) || 0) },
  { field: 'total refund', headerName: 'Total refund', width: 150, renderCell: (params) => currency.format(Number(params.value) || 0) },
  { field: 'tanggal transaksi', headerName: 'Tanggal', width: 190 },
];

const normalizeTransactions = (rows) => {
  const grouped = new Map();

  rows.forEach((row) => {
    const transaction = grouped.get(row.id) || {
      ...row,
      products: new Set(),
      itemCount: 0,
      returnedQuantity: 0,
      remainingQuantity: 0,
    };

    if (row['nama barang']) transaction.products.add(row['nama barang']);
    transaction.itemCount += Number(row['jumlah item']) || 0;
    transaction.returnedQuantity += Number(row['jumlah diretur']) || 0;
    transaction.remainingQuantity += Number(row['sisa retur']) || 0;
    grouped.set(row.id, transaction);
  });

  return Array.from(grouped.values(), (transaction) => ({
    ...transaction,
    'nama barang': Array.from(transaction.products).join(', '),
    'jumlah item': transaction.itemCount,
    'jumlah diretur': transaction.returnedQuantity,
    'sisa retur': transaction.remainingQuantity,
  }));
};

const Transactions = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [returningTransaction, setReturningTransaction] = useState(null);
  const [returnDetails, setReturnDetails] = useState([]);
  const [returnHistory, setReturnHistory] = useState([]);
  const [returnQuantities, setReturnQuantities] = useState({});
  const [refundMethod, setRefundMethod] = useState('cash');
  const [returnReason, setReturnReason] = useState('');
  const [returnLoading, setReturnLoading] = useState(false);
  const [returnSaving, setReturnSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'error' });

  const fetchTransactions = async (isActive = () => true) => {
    try {
      const response = await getTransactions();
      const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
      if (isActive()) setRows(normalizeTransactions(data));
    } catch {
      if (isActive()) {
        setSnackbar({ open: true, message: 'Gagal memuat riwayat transaksi.', severity: 'error' });
      }
    } finally {
      if (isActive()) setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    fetchTransactions(() => active);
    return () => { active = false; };
  }, []);

  const openReturnDialog = async (row) => {
    setReturningTransaction(row);
    setReturnLoading(true);
    setReturnDetails([]);
    setReturnHistory([]);
    setReturnQuantities({});
    setRefundMethod('cash');
    setReturnReason('');
    try {
      const response = await getReturnableTransaction(row.id);
      setReturnDetails(response.data.details || []);
      setReturnHistory(response.data.returns || []);
    } catch (error) {
      setReturningTransaction(null);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Gagal memuat detail barang yang dapat diretur.',
        severity: 'error',
      });
    } finally {
      setReturnLoading(false);
    }
  };

  const selectedReturnItems = returnDetails
    .map((detail) => ({
      transaction_detail_id: detail.transaction_detail_id,
      quantity: Number(returnQuantities[detail.transaction_detail_id]) || 0,
      detail,
    }))
    .filter((item) => item.quantity > 0);
  const refundAmount = selectedReturnItems.reduce(
    (sum, item) => sum + item.quantity * Number(item.detail.price), 0
  );

  const submitReturn = async () => {
    if (!selectedReturnItems.length) {
      setSnackbar({ open: true, message: 'Masukkan jumlah barang yang akan diretur.', severity: 'error' });
      return;
    }
    if (selectedReturnItems.some((item) => item.quantity > item.detail.returnable_quantity)) {
      setSnackbar({ open: true, message: 'Jumlah retur melebihi sisa barang yang dapat diretur.', severity: 'error' });
      return;
    }

    setReturnSaving(true);
    try {
      await createTransactionReturn(returningTransaction.id, {
        items: selectedReturnItems.map(({ transaction_detail_id, quantity }) => ({
          transaction_detail_id,
          quantity,
        })),
        refund_method: refundMethod,
        reason: returnReason,
      });
      setReturningTransaction(null);
      setSnackbar({
        open: true,
        message: `Retur berhasil diproses. Refund ${currency.format(refundAmount)}.`,
        severity: 'success',
      });
      await fetchTransactions();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Gagal memproses retur transaksi.',
        severity: 'error',
      });
    } finally {
      setReturnSaving(false);
    }
  };

  const filteredRows = useMemo(() => {
    const term = searchTerm.trim().toLocaleLowerCase();
    if (!term) return rows;
    return rows.filter((row) => [
      row.id,
      row['cashier name'],
      row['customer name'],
      row['nama barang'],
      row['tanggal transaksi'],
    ].some((value) => String(value || '').toLocaleLowerCase().includes(term)));
  }, [rows, searchTerm]);

  return (
    <Box sx={{ maxWidth: 1600, mx: 'auto' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4">Riwayat transaksi</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
          Lihat dan cari transaksi penjualan yang sudah diproses.
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {filteredRows.length} transaksi
        </Typography>
        <TextField
          size="small"
          placeholder="Cari transaksi..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            },
            htmlInput: { 'aria-label': 'Cari transaksi' },
          }}
          sx={{ width: { xs: '100%', sm: 340 }, bgcolor: 'background.paper' }}
        />
      </Box>
      <DataTable
        rows={filteredRows}
        columns={columns}
        loading={loading}
        getRowId={(row) => row.id}
        onCustomAction={openReturnDialog}
        customActionLabel="Retur transaksi"
        customActionIcon={<ReplayIcon fontSize="small" />}
        customActionDisabled={(row) => !row['sisa retur']}
      />
      <Dialog
        open={Boolean(returningTransaction)}
        onClose={() => !returnSaving && setReturningTransaction(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Retur transaksi #{returningTransaction?.id}</DialogTitle>
        <DialogContent dividers>
          {returnLoading ? (
            <Typography color="text.secondary">Memuat detail transaksi...</Typography>
          ) : (
            <Stack spacing={2}>
              <Typography variant="body2" color="text.secondary">
                Isi jumlah barang yang dikembalikan. Refund dihitung dari harga pada transaksi.
              </Typography>
              {returnHistory.length > 0 && (
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'action.hover' }}>
                  <Typography fontWeight={700} sx={{ mb: 0.75 }}>Riwayat retur</Typography>
                  <Stack spacing={1}>
                    {returnHistory.map((item) => (
                      <Box key={item.id}>
                        <Typography variant="body2">
                          {new Date(item.created_at).toLocaleString('id-ID')} · {item.refund_method.toUpperCase()}
                          {' · '}{currency.format(Number(item.refund_amount) || 0)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Diproses oleh {item.processed_by}
                          {item.reason ? ` · ${item.reason}` : ''}
                        </Typography>
                        <Typography variant="caption" display="block" color="text.secondary">
                          {item.items.map((returnedItem) => `${returnedItem.product_name} × ${returnedItem.quantity}`).join(', ')}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              )}
              {returnDetails.length === 0 && !returnLoading && (
                <Alert severity="info">Transaksi ini tidak memiliki barang yang dapat diretur.</Alert>
              )}
              {returnDetails.map((detail) => (
                <Box
                  key={detail.transaction_detail_id}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: 'minmax(0, 1fr) 120px' },
                    alignItems: 'center',
                    gap: 1.5,
                    p: 1.5,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                  }}
                >
                  <Box>
                    <Typography fontWeight={700}>{detail.product_name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Terjual {detail.sold_quantity} · sudah diretur {detail.returned_quantity} · sisa {detail.returnable_quantity}
                      {' · '}{currency.format(Number(detail.price) || 0)} / unit
                    </Typography>
                  </Box>
                  <TextField
                    label="Qty retur"
                    type="number"
                    size="small"
                    value={returnQuantities[detail.transaction_detail_id] ?? 0}
                    onChange={(event) => setReturnQuantities((current) => ({
                      ...current,
                      [detail.transaction_detail_id]: event.target.value,
                    }))}
                    disabled={detail.returnable_quantity === 0}
                    slotProps={{ htmlInput: { min: 0, max: detail.returnable_quantity, step: 1 } }}
                  />
                </Box>
              ))}
              <TextField
                select
                label="Metode refund"
                value={refundMethod}
                onChange={(event) => setRefundMethod(event.target.value)}
                fullWidth
              >
                <MenuItem value="cash">Tunai</MenuItem>
                <MenuItem value="qris">QRIS</MenuItem>
                <MenuItem value="transfer">Transfer</MenuItem>
                <MenuItem value="card">Kartu</MenuItem>
              </TextField>
              <TextField
                label="Alasan retur (opsional)"
                value={returnReason}
                onChange={(event) => setReturnReason(event.target.value)}
                inputProps={{ maxLength: 500 }}
                multiline
                minRows={2}
                fullWidth
              />
              <Typography variant="h6">
                Total refund: {currency.format(refundAmount)}
              </Typography>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setReturningTransaction(null)} disabled={returnSaving}>Batal</Button>
          <Button
            variant="contained"
            onClick={submitReturn}
            disabled={returnLoading || returnSaving || !returnDetails.some((detail) => detail.returnable_quantity > 0)}
          >
            {returnSaving ? 'Memproses...' : 'Proses retur'}
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={() => setSnackbar((current) => ({ ...current, open: false }))}
      >
        <Alert severity={snackbar.severity} variant="filled" sx={{ borderRadius: 2 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Transactions;
