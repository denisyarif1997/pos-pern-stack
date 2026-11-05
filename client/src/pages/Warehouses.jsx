import React, { useEffect, useState, useCallback } from 'react';
import { Box, Typography, Button, Alert, Snackbar, TextField, InputAdornment } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import DataTable from '../components/DataTable';
import FormDialog from '../components/FormDialog';
import { getWarehouses, createWarehouse, updateWarehouse, deleteWarehouse } from '../services/api';

const columns = [
  { field: 'id', headerName: 'ID', width: 80 },
  { field: 'nama gudang', headerName: 'Name', flex: 1 },
  { field: 'lokasi', headerName: 'Location', flex: 1 },
];

const Warehouses = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = useCallback(async (search = '') => {
    try {
      const res = await getWarehouses({ search });
      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setRows(data);
    } catch (err) {
      showSnackbar('Failed to load warehouses', 'error');
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
    if (!window.confirm(`Are you sure you want to delete "${row['nama gudang']}"?`)) return;
    try {
      await deleteWarehouse(row.id);
      showSnackbar('Warehouse deleted successfully', 'success');
      fetchData();
    } catch (err) {
      showSnackbar('Failed to delete warehouse', 'error');
    }
  };

  const handleSubmit = async (values) => {
    setSaving(true);
    try {
      if (editItem) {
        await updateWarehouse(editItem.id, values);
        showSnackbar('Warehouse updated successfully', 'success');
      } else {
        await createWarehouse(values);
        showSnackbar('Warehouse created successfully', 'success');
      }
      setDialogOpen(false);
      fetchData();
    } catch (err) {
      showSnackbar(err.response?.data?.error || 'Failed to save warehouse', 'error');
    } finally {
      setSaving(false);
    }
  };

  const fields = [
    { name: 'name', label: 'Warehouse Name' },
    { name: 'location', label: 'Location' },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>Warehouses</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}
          sx={{ borderRadius: 3, px: 3 }}>
          Add Warehouse
        </Button>
      </Box>
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search warehouses..."
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
        title={editItem ? 'Edit Warehouse' : 'Add Warehouse'} fields={fields}
        initialValues={editItem ? { name: editItem['nama gudang'], location: editItem['lokasi'] } : null} loading={saving} />
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} sx={{ borderRadius: 2 }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default Warehouses;