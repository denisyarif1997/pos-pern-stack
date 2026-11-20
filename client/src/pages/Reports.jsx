import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { getSalesReport } from '../services/api';

const currency = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

const localDateValue = (date) => {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 10);
};

const today = new Date();
const defaultTo = localDateValue(today);
const defaultFromDate = new Date(today);
defaultFromDate.setDate(defaultFromDate.getDate() - 29);
const defaultFrom = localDateValue(defaultFromDate);

const paymentLabels = {
  cash: 'Tunai',
  qris: 'QRIS',
  transfer: 'Transfer',
  card: 'Kartu',
  unrecorded: 'Transaksi lama / belum tercatat',
};

const ReportTable = ({ columns, rows, emptyMessage }) => (
  rows.length ? (
    <Table size="small">
      <TableHead>
        <TableRow>{columns.map((column) => <TableCell key={column.key}>{column.label}</TableCell>)}</TableRow>
      </TableHead>
      <TableBody>
        {rows.map((row, index) => (
          <TableRow key={`${row[columns[0].key]}-${index}`}>
            {columns.map((column) => (
              <TableCell key={column.key}>
                {column.format ? column.format(row[column.key]) : row[column.key]}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ) : (
    <Typography variant="body2" color="text.secondary">{emptyMessage}</Typography>
  )
);

const Reports = () => {
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);
  const [reportRange, setReportRange] = useState({ from: defaultFrom, to: defaultTo });
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadReport = useCallback(async (startDate, endDate) => {
    setLoading(true);
    setError('');
    try {
      const response = await getSalesReport({ from: startDate, to: endDate });
      setReport(response.data);
    } catch (requestError) {
      setReport(null);
      setError(requestError.response?.data?.error || 'Laporan penjualan gagal dimuat.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReport(reportRange.from, reportRange.to);
  }, [reportRange, loadReport]);

  const average = report?.summary?.transaction_count
    ? Number(report.summary.sales_total) / Number(report.summary.transaction_count)
    : 0;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!from || !to || from > to) {
      setError('Tanggal awal dan akhir laporan tidak valid.');
      return;
    }
    setReportRange({ from, to });
  };

  return (
    <Box sx={{ maxWidth: 1440, mx: 'auto' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4">Laporan penjualan</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
          Ringkasan penjualan bersih, retur, dan pembayaran berdasarkan tanggal.
        </Typography>
      </Box>

      <Card sx={{ mb: 2.5 }}>
        <CardContent>
          <Box component="form" onSubmit={handleSubmit}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
              <TextField
                label="Dari tanggal"
                type="date"
                value={from}
                onChange={(event) => setFrom(event.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
                required
              />
              <TextField
                label="Sampai tanggal"
                type="date"
                value={to}
                onChange={(event) => setTo(event.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
                required
              />
              <Button type="submit" variant="contained" disabled={loading} sx={{ minHeight: 56 }}>
                Tampilkan
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>
      ) : report && (
        <>
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(4, minmax(0, 1fr))' },
            gap: 2,
            mb: 2.5,
          }}>
            {[
              ['Omzet bersih', currency.format(Number(report.summary.sales_total) || 0)],
              ['Total refund', currency.format(Number(report.summary.refund_total) || 0)],
              ['Transaksi', Number(report.summary.transaction_count || 0).toLocaleString('id-ID')],
              ['Rata-rata transaksi', currency.format(average)],
            ].map(([label, value]) => (
              <Card key={label}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">{label}</Typography>
                  <Typography variant="h5" fontWeight={800} sx={{ mt: 0.75 }}>{value}</Typography>
                </CardContent>
              </Card>
            ))}
          </Box>

          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, minmax(0, 1fr))' },
            gap: 2.5,
          }}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 1.5 }}>Penjualan harian</Typography>
                <ReportTable
                  columns={[
                    { key: 'sale_date', label: 'Tanggal', format: (value) => new Date(value).toLocaleDateString('id-ID') },
                    { key: 'transaction_count', label: 'Transaksi' },
                    { key: 'refund_total', label: 'Refund', format: (value) => currency.format(Number(value) || 0) },
                    { key: 'sales_total', label: 'Omzet bersih', format: (value) => currency.format(Number(value) || 0) },
                  ]}
                  rows={report.daily}
                  emptyMessage="Belum ada transaksi pada periode ini."
                />
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 1.5 }}>Pembayaran per metode</Typography>
                <ReportTable
                  columns={[
                    { key: 'method', label: 'Metode', format: (value) => paymentLabels[value] || value },
                    { key: 'amount', label: 'Nominal', format: (value) => currency.format(Number(value) || 0) },
                  ]}
                  rows={report.payments}
                  emptyMessage="Belum ada pembayaran pada periode ini."
                />
              </CardContent>
            </Card>
            <Card sx={{ gridColumn: { lg: '1 / -1' } }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 1.5 }}>Produk terlaris</Typography>
                <ReportTable
                  columns={[
                    { key: 'product_name', label: 'Produk' },
                    { key: 'quantity', label: 'Terjual bersih' },
                    { key: 'refund_quantity', label: 'Qty retur' },
                    { key: 'sales_total', label: 'Omzet bersih', format: (value) => currency.format(Number(value) || 0) },
                  ]}
                  rows={report.topProducts}
                  emptyMessage="Belum ada produk terjual pada periode ini."
                />
              </CardContent>
            </Card>
          </Box>
        </>
      )}
    </Box>
  );
};

export default Reports;
