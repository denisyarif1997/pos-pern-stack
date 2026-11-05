import React, { useEffect, useState, useCallback } from 'react';
import { Box, Typography, Button, Alert, Snackbar, TextField, InputAdornment } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import DataTable from '../components/DataTable';
import FormDialog from '../components/FormDialog';
import { getStocks, createStock, updateStock, deleteStock, getProducts, getWarehouses } from '../services/api';

const columns = [
  { field: 'id', headerName: 'ID', width: 80 },
  { field: 'id product', headerName: 'Product ID', width: 100 },
  { field: 'product', headerName: 'Product', flex: 1 },
  { field: 'gudang', headerName: 'Warehouse', flex: 1 },
  { field: 'quantity', headerName: 'Quantity', width: 120 },
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
      console.error('Failed to load options');
    }
  }, []);

  useEffect(() => { fetchData(); fetchOptions(); }, [fetchData, fetchOptions]);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    fetchData(value);
  };

  const showSnackbar = (message, severity) => setSnackbar({ open: true, message, severity });

  const handleAdd = () => { setEditItem(null); setDialogOpen(true); };
  const handleEdit = (row) => { setEditItem(row); setDialogOpen(true); };

  const handleDelete = async (row) => {
    if (!window.confirm(`Are you sure you want to delete stock ID ${row.id}?`)) return;
    try {
      await deleteStock(row.id);
      showSnackbar('Stock deleted successfully', 'success');
      fetchData();
    } catch (err) {
      showSnackbar('Failed to delete stock', 'error');
    }
  };

  const handleSubmit = async (values) => {
    setSaving(true);
    try {
      if (editItem) {
        await updateStock(editItem.id, { qty: values.qty });
        showSnackbar('Stock updated successfully', 'success');
      } else {
        await createStock(values);
        showSnackbar('Stock created successfully', 'success');
      }
      setDialogOpen(false);
      fetchData();
    } catch (err) {
      showSnackbar(err.response?.data?.error || 'Failed to save stock', 'error');
    } finally {
      setSaving(false);
    }
  };

  const fields = editItem
    ? [{ name: 'qty', label: 'Quantity', type: 'number' }]
    : [
        {
          name: 'product_id',
          label: 'Product',
          select: true,
          options: products.map((p) => ({ value: p.product_id, label: p.name })),
        },
        {
          name: 'warehouse_id',
          label: 'Warehouse',
          select: true,
          options: warehouses.map((w) => ({ value: w.id, label: w['nama gudang'] || w.name })),
        },
        { name: 'qty', label: 'Quantity', type: 'number' },
      ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>Stock / Inventory</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}
          sx={{ borderRadius: 3, px: 3 }}>
          Add Stock
        </Button>
      </Box>
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search stock..."
          value={searchTerm}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'background.paper',
            },
          }}
        />
      </Box>
      <DataTable rows={rows} columns={columns} loading={loading} onEdit={handleEdit} onDelete={handleDelete} getRowId={(row) => row.id} />
      <FormDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onSubmit={handleSubmit}
        title={editItem ? 'Adjust Stock' : 'Add Stock'} fields={fields}
        initialValues={editItem ? { qty: editItem.quantity } : null} loading={saving} />
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} sx={{ borderRadius: 2 }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default Stock;