import React, { useEffect, useState, useCallback } from 'react';
import { Box, Typography, Button, Alert, Snackbar, TextField, InputAdornment, InputLabel } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import DataTable from '../components/DataTable';
import FormDialog from '../components/FormDialog';
import { getUnit, createUnit, updateUnit, deleteUnit } from '../services/api';

const columns = [
  { field: 'id', headerName: 'ID', width: 100 },
  { field: 'name', headerName: 'Unit name', flex: 1, minWidth: 180 },
];

const Units = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = useCallback(async (search = '') => {
    setLoading(true);
    try {
      const res = await getUnit({ search });
      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setRows(data);
    } catch (err) {
      showSnackbar('Failed to load units', 'error');
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
    if (!window.confirm(`Are you sure you want to delete "${row.name}"?`)) return;
    try {
      await deleteUnit(row.id);
      showSnackbar('Unit deleted successfully', 'success');
      fetchData();
    } catch (err) {
      showSnackbar('Failed to delete unit', 'error');
    }
  };

  const handleSubmit = async (values) => {
    setSaving(true);
    try {
      if (editItem) {
        await updateUnit(editItem.id, values);
        showSnackbar('Unit updated successfully', 'success');
      } else {
        await createUnit(values);
        showSnackbar('Unit created successfully', 'success');
      }
      setDialogOpen(false);
      fetchData();
    } catch (err) {
      showSnackbar(err.response?.data?.error || 'Failed to save unit', 'error');
    } finally {
      setSaving(false);
    }
  };

  const fields = [
    { name: 'name', label: 'Unit name' },
  ];

  return (
    <Box sx={{ maxWidth: 1440, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="h4">Units</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
            Manage product units used across your inventory.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd} sx={{ px: 2.5, minHeight: 44 }}>
          Add unit
        </Button>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 2 }}>
        <InputLabel htmlFor="unit-search" sx={{ color: 'text.secondary', fontSize: '0.875rem', fontWeight: 600 }}>
          Unit list
        </InputLabel>
        <Typography variant="caption" color="text.secondary">
          {rows.length} {rows.length === 1 ? 'unit' : 'units'}
        </Typography>
      </Box>
      <Box sx={{ mb: 2 }}>
        <TextField
          id="unit-search"
          fullWidth
          size="small"
          placeholder="Search units..."
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
            htmlInput: { 'aria-label': 'Search units' },
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'background.paper',
            },
          }}
        />
      </Box>
      <DataTable
        rows={rows}
        columns={columns}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        getRowId={(row) => row.id}
      />
      <FormDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onSubmit={handleSubmit}
        title={editItem ? 'Edit unit' : 'Add unit'} fields={fields}
        initialValues={editItem ? { name: editItem.name } : null} loading={saving} />
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} sx={{ borderRadius: 2 }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default Units;