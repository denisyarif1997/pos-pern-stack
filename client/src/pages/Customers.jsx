import React, { useEffect, useState, useCallback } from 'react';
import { Box, Typography, Button, Alert, Snackbar, TextField, InputAdornment } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import DataTable from '../components/DataTable';
import FormDialog from '../components/FormDialog';
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from '../services/api';

const columns = [
  { field: 'id', headerName: 'ID', width: 80 },
  { field: 'Nama Customer', headerName: 'Name', flex: 1 },
  { field: 'No Telp', headerName: 'Phone', width: 150 },
  { field: 'email', headerName: 'Email', flex: 1 },
];

const Customers = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = useCallback(async (search = '') => {
    try {
      const res = await getCustomers({ search });
      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setRows(data);
    } catch (err) {
      showSnackbar('Failed to load customers', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    fetchData(value);
  };

  const showSnackbar = (message, severity) => setSnackbar({ open: true, message, severity });

  const handleAdd = () => { setEditItem(null); setDialogOpen(true); };
  const handleEdit = (row) => { setEditItem(row); setDialogOpen(true); };

  const handleDelete = async (row) => {
    if (!window.confirm(`Are you sure you want to delete "${row['Nama Customer']}"?`)) return;
    try {
      await deleteCustomer(row.id);
      showSnackbar('Customer deleted successfully', 'success');
      fetchData();
    } catch (err) {
      showSnackbar('Failed to delete customer', 'error');
    }
  };

  const handleSubmit = async (values) => {
    setSaving(true);
    try {
      if (editItem) {
        await updateCustomer(editItem.id, values);
        showSnackbar('Customer updated successfully', 'success');
      } else {
        await createCustomer(values);
        showSnackbar('Customer created successfully', 'success');
      }
      setDialogOpen(false);
      fetchData();
    } catch (err) {
      showSnackbar(err.response?.data?.error || 'Failed to save customer', 'error');
    } finally {
      setSaving(false);
    }
  };

  const fields = [
    { name: 'name', label: 'Customer Name' },
    { name: 'phone', label: 'Phone' },
    { name: 'email', label: 'Email', type: 'email', required: false },
    { name: 'address', label: 'Address', multiline: true, rows: 2, required: false },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>Customers</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}
          sx={{ borderRadius: 3, px: 3 }}>
          Add Customer
        </Button>
      </Box>
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search customers..."
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
        title={editItem ? 'Edit Customer' : 'Add Customer'} fields={fields}
        initialValues={editItem ? { name: editItem['Nama Customer'], phone: editItem['No Telp'], email: editItem.email, address: editItem.address } : null} loading={saving} />
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} sx={{ borderRadius: 2 }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default Customers;