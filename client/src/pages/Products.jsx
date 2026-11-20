import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Box, Typography, Button, Alert, Snackbar, TextField, InputAdornment } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import DataTable from '../components/DataTable';
import FormDialog from '../components/FormDialog';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  getUnit,
} from '../services/api';

const columns = [
  { field: 'product_id', headerName: 'ID', width: 80 },
  { field: 'name', headerName: 'Name', flex: 1 },
  { field: 'barcode', headerName: 'Barcode', width: 150 },
  { field: 'price', headerName: 'Price', width: 120, renderCell: (params) => `Rp ${Number(params.value).toLocaleString()}` },
  { field: 'category_name', headerName: 'Category', width: 150 },
  { field: 'unit_name', headerName: 'Unit', width: 100 },
  { field: 'stock_quantity', headerName: 'Stock', width: 100 },
];

const Products = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = useCallback(async (search = '') => {
    try {
      const res = await getProducts({ search });
      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setRows(data);
    } catch (err) {
      showSnackbar('Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await getCategories({ limit: 1000 });
      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setCategories(data);
    } catch (err) {
      showSnackbar('Failed to load categories', 'error');
    }
  }, []);

  const fetchUnits = useCallback(async () => {
    try {
      const res = await getUnit({ limit: 1000 });
      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setUnits(data);
    } catch (err) {
      showSnackbar('Failed to load units', 'error');
    }
  }, []);

  useEffect(() => {
    fetchData();
    fetchCategories();
    fetchUnits();
  }, [fetchData, fetchCategories, fetchUnits]);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    fetchData(value);
  };

  const showSnackbar = (message, severity) => setSnackbar({ open: true, message, severity });

  const handleAdd = () => {
    setEditItem(null);
    setDialogOpen(true);
  };

  const handleEdit = (row) => {
    setEditItem(row);
    setDialogOpen(true);
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`Are you sure you want to delete "${row.name}"?`)) return;
    try {
      await deleteProduct(row.product_id);
      showSnackbar('Product deleted successfully', 'success');
      fetchData();
    } catch (err) {
      showSnackbar('Failed to delete product', 'error');
    }
  };

  const handleSubmit = async (values) => {
    setSaving(true);
    try {
      if (editItem) {
        await updateProduct(editItem.product_id, values);
        showSnackbar('Product updated successfully', 'success');
      } else {
        await createProduct(values);
        showSnackbar('Product created successfully', 'success');
      }
      setDialogOpen(false);
      fetchData();
    } catch (err) {
      showSnackbar(err.response?.data?.error || 'Failed to save product', 'error');
    } finally {
      setSaving(false);
    }
  };

  const fields = [
    { name: 'name', label: 'Product Name' },
    { name: 'barcode', label: 'Barcode' },
    {
      name: 'category_id',
      label: 'Category',
      select: true,
      required: false,
      options: categories.map((c) => ({ value: String(c.id), label: c.name })),
    },
    {
      name: 'unit_id',
      label: 'Unit',
      select: true,
      required: false,
      options: units.map((unit) => ({ value: String(unit.id), label: unit.name })),
    },
    { name: 'price', label: 'Price', type: 'number' },
  ];
  const initialValues = useMemo(
    () => editItem
      ? {
          name: editItem.name,
          barcode: editItem.barcode,
          category_id: editItem.category_id == null ? '' : String(editItem.category_id),
          unit_id: editItem.unit_id == null ? '' : String(editItem.unit_id),
          price: editItem.price,
        }
      : null,
    [editItem]
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
          Products
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAdd}
          sx={{
            borderRadius: 3,
            px: 3,
          }}
        >
          Add Product
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search products..."
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

      <DataTable
        rows={rows}
        columns={columns}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        getRowId={(row) => row.product_id}
      />

      <FormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
        title={editItem ? 'Edit Product' : 'Add Product'}
        fields={fields}
        initialValues={initialValues}
        loading={saving}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ borderRadius: 2 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Products;