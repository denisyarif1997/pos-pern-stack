import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Box, Typography, Button, Alert, Snackbar, TextField, InputAdornment, Chip, Card, CardContent } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import InventoryIcon from '@mui/icons-material/Inventory';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import DataTable from '../components/DataTable';
import FormDialog from '../components/FormDialog';
import { getStocks, createStock, updateStock, deleteStock, getProducts, getWarehouses } from '../services/api';

const columns = [
  { field: 'id', headerName: 'ID', width: 90 },
  { field: 'id product', headerName: 'ID produk', width: 110 },
  { field: 'product', headerName: 'Produk', flex: 1, minWidth: 180 },
  { field: 'gudang', headerName: 'Gudang', flex: 1, minWidth: 160 },
  {
    field: 'quantity',
    headerName: 'Jumlah stok',
    width: 150,
    renderCell: (params) => (
      <Chip
        size="small"
        label={Number(params.value) <= 0 ? 'Habis' : `${Number(params.value)} unit`}
        color={Number(params.value) <= 0 ? 'error' : Number(params.value) <= 5 ? 'warning' : 'success'}
        variant="outlined"
      />
    ),
  },
];

const Stock = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [searchTerm, setSearchTerm] = useState('');
  const totalQuantity = rows.reduce((total, row) => total + (Number(row.quantity) || 0), 0);
  const lowStockCount = rows.filter((row) => {
    const quantity = Number(row.quantity) || 0;
    return quantity > 0 && quantity <= 5;
  }).length;

  const fetchData = useCallback(async (search = '') => {
    try {
      const res = await getStocks({ search });
      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setRows(data);
    } catch (err) {
      showSnackbar('Failed to load stock', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchOptions = useCallback(async () => {
    try {
      const [pRes, wRes] = await Promise.all([getProducts(), getWarehouses()]);
      const pData = Array.isArray(pRes.data) ? pRes.data : pRes.data?.data || [];
      const wData = Array.isArray(wRes.data) ? wRes.data : wRes.data?.data || [];
      setProducts(pData);
      setWarehouses(wData);
    } catch (err) {
      showSnackbar('Gagal memuat pilihan produk atau gudang.', 'error');
    }
  }, []);

  useEffect(() => { fetchData(); fetchOptions(); }, [fetchData, fetchOptions]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const showSnackbar = (message, severity) => setSnackbar({ open: true, message, severity });
  const filteredRows = useMemo(() => {
    const term = searchTerm.trim().toLocaleLowerCase();
    if (!term) return rows;
    return rows.filter((row) => [row.product, row.gudang, row['id product']]
      .some((value) => String(value || '').toLocaleLowerCase().includes(term)));
  }, [rows, searchTerm]);

  const handleAdd = () => { setEditItem(null); setDialogOpen(true); };
  const handleEdit = (row) => { setEditItem(row); setDialogOpen(true); };

  const handleDelete = async (row) => {
    if (!window.confirm(`Hapus data stok untuk ${row.product}?`)) return;
    try {
      await deleteStock(row.id);
      showSnackbar('Data stok berhasil dihapus.', 'success');
      fetchData();
    } catch (err) {
      showSnackbar('Gagal menghapus data stok.', 'error');
    }
  };

  const handleSubmit = async (values) => {
    setSaving(true);
    try {
      if (editItem) {
        await updateStock(editItem.id, { qty: values.qty });
        showSnackbar('Stok berhasil diperbarui.', 'success');
      } else {
        await createStock(values);
        showSnackbar('Stok berhasil ditambahkan.', 'success');
      }
      setDialogOpen(false);
      fetchData();
    } catch (err) {
      showSnackbar(err.response?.data?.error || 'Gagal menyimpan data stok.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const fields = editItem
    ? [{ name: 'qty', label: 'Jumlah', type: 'number' }]
    : [
        {
          name: 'product_id',
          label: 'Produk',
          select: true,
          options: products.map((p) => ({ value: p.product_id, label: p.name })),
        },
        {
          name: 'warehouse_id',
          label: 'Gudang',
          select: true,
          options: warehouses.map((w) => ({ value: w.id, label: w['nama gudang'] || w.name })),
        },
        { name: 'qty', label: 'Jumlah', type: 'number' },
      ];

  return (
    <Box sx={{ maxWidth: 1440, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2, flexWrap: 'wrap', mb: 3 }}>
        <Box>
          <Typography variant="h4">Stok &amp; persediaan</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
            Pantau ketersediaan produk di setiap gudang.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}
          sx={{ px: 2.5, minHeight: 44 }}>
          Tambah stok
        </Button>
      </Box>
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
        gap: 2,
        mb: 3,
      }}>
        <Card>
          <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ width: 44, height: 44, borderRadius: 2, display: 'grid', placeItems: 'center', bgcolor: 'primary.light', color: 'primary.dark' }}>
              <InventoryIcon />
            </Box>
            <Box>
              <Typography variant="h6">{totalQuantity.toLocaleString('id-ID')}</Typography>
              <Typography variant="body2" color="text.secondary">Total unit tersedia</Typography>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ width: 44, height: 44, borderRadius: 2, display: 'grid', placeItems: 'center', bgcolor: '#FFF7E6', color: '#B54708' }}>
              <WarningAmberIcon />
            </Box>
            <Box>
              <Typography variant="h6">{lowStockCount}</Typography>
              <Typography variant="body2" color="text.secondary">Stok rendah (≤ 5 unit)</Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 1.5 }}>
        <Typography variant="subtitle1">Daftar stok</Typography>
        <Typography variant="caption" color="text.secondary">{filteredRows.length} baris</Typography>
      </Box>
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Cari produk atau gudang..."
          value={searchTerm}
          onChange={handleSearch}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            },
            htmlInput: { 'aria-label': 'Cari stok' },
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'background.paper',
            },
          }}
        />
      </Box>
      <DataTable rows={filteredRows} columns={columns} loading={loading} onEdit={handleEdit} onDelete={handleDelete} getRowId={(row) => row.id} />
      <FormDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onSubmit={handleSubmit}
        title={editItem ? 'Sesuaikan stok' : 'Tambah stok'} fields={fields}
        initialValues={editItem ? { qty: editItem.quantity } : null} loading={saving} />
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} sx={{ borderRadius: 2 }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default Stock;