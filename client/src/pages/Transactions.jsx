import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Button, Alert, Snackbar, Card, CardContent,
  TextField, Grid, IconButton, Autocomplete, Dialog, DialogTitle,
  DialogContent, DialogActions, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, InputAdornment,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SearchIcon from '@mui/icons-material/Search';
import DataTable from '../components/DataTable';
import { getTransactions, createTransaction, getProducts, getCustomers } from '../services/api';

const columns = [
  { field: 'id', headerName: 'ID', width: 80 },
  { field: 'cashier name', headerName: 'Cashier', width: 120 },
  { field: 'customer name', headerName: 'Customer', width: 150 },
  { field: 'nama barang', headerName: 'Product', flex: 1 },
  { field: 'jumlah item', headerName: 'Qty', width: 80 },
  { field: 'total', headerName: 'Total', width: 130, renderCell: (params) => `Rp ${Number(params.value).toLocaleString()}` },
  { field: 'pembayaran', headerName: 'Payment', width: 130, renderCell: (params) => `Rp ${Number(params.value).toLocaleString()}` },
  { field: 'kembalian', headerName: 'Change', width: 130, renderCell: (params) => `Rp ${Number(params.value).toLocaleString()}` },
  { field: 'tanggal transaksi', headerName: 'Date', width: 180 },
];

const Transactions = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [payment, setPayment] = useState(0);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = useCallback(async (search = '') => {
    try {
      const res = await getTransactions({ search });
      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setRows(data);
    } catch (err) {
      showSnackbar('Failed to load transactions', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchOptions = useCallback(async () => {
    try {
      const [pRes, cRes] = await Promise.all([getProducts(), getCustomers()]);
      const pData = Array.isArray(pRes.data) ? pRes.data : pRes.data?.data || [];
      const cData = Array.isArray(cRes.data) ? cRes.data : cRes.data?.data || [];
      setProducts(pData);
      setCustomers(cData);
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

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const change = payment - total;

  const addToCart = () => {
    if (!selectedProduct) return;
    const existing = cart.find((item) => item.product_id === selectedProduct.product_id);
    if (existing) {
      setCart(cart.map((item) =>
        item.product_id === selectedProduct.product_id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
    } else {
      setCart([...cart, {
        product_id: selectedProduct.product_id,
        name: selectedProduct.name,
        price: Number(selectedProduct.price),
        quantity: quantity,
      }]);
    }
    setSelectedProduct(null);
    setQuantity(1);
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter((item) => item.product_id !== productId));
  };

  const handleCreateTransaction = async () => {
    if (cart.length === 0) {
      showSnackbar('Cart is empty', 'error');
      return;
    }
    if (payment < total) {
      showSnackbar('Payment is less than total', 'error');
      return;
    }
    setSaving(true);
    try {
      const details = cart.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
      }));
      await createTransaction({
        user_id: 1,
        customer_id: selectedCustomer?.id || null,
        total,
        payment,
        change,
        details,
      });
      showSnackbar('Transaction created successfully', 'success');
      setCreateOpen(false);
      setCart([]);
      setSelectedCustomer(null);
      setPayment(0);
      fetchData();
    } catch (err) {
      showSnackbar(err.response?.data?.error || 'Failed to create transaction', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>Transactions</Typography>
        <Button variant="contained" startIcon={<ShoppingCartIcon />} onClick={() => setCreateOpen(true)}
          sx={{ borderRadius: 3, px: 3 }}>
          New Transaction
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search transactions..."
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
      <DataTable rows={rows} columns={columns} loading={loading} getRowId={(row) => row.id} />

      {/* Create Transaction Dialog */}
      <Dialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: 'background.paper',
            border: 'none',
            borderRadius: 4,
            boxShadow: '0px 18px 40px rgba(112, 144, 176, 0.12)',
            minHeight: '60vh',
          },
        }}
      >
        <DialogTitle sx={{ color: 'text.primary', fontWeight: 700 }}>New Transaction</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mb: 3, mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <Autocomplete
                options={customers}
                getOptionLabel={(option) => option['Nama Customer'] || option.name || ''}
                value={selectedCustomer}
                onChange={(e, val) => setSelectedCustomer(val)}
                renderInput={(params) => (
                  <TextField {...params} label="Customer (optional)" size="small"
                    InputProps={{ ...params.InputProps, sx: { borderRadius: 2 } }}
                  />
                )}
              />
            </Grid>
          </Grid>

          {/* Add to cart */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center', flexWrap: 'wrap' }}>
            <Autocomplete
              options={products}
              getOptionLabel={(option) => `${option.name} - Rp ${Number(option.price).toLocaleString()}`}
              value={selectedProduct}
              onChange={(e, val) => setSelectedProduct(val)}
              sx={{ flex: 1, minWidth: 250 }}
              renderInput={(params) => (
                <TextField {...params} label="Search Product" size="small"
                  InputProps={{ ...params.InputProps, sx: { borderRadius: 2 } }}
                />
              )}
              isOptionEqualToValue={(option, value) => option.product_id === value?.product_id}
            />
            <TextField
              label="Qty"
              type="number"
              size="small"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              sx={{ width: 100 }}
              InputProps={{ sx: { borderRadius: 2 } }}
            />
            <IconButton onClick={addToCart} color="primary" sx={{ background: 'rgba(144, 202, 249, 0.15)' }}>
              <AddIcon />
            </IconButton>
          </Box>

          {/* Cart Table */}
          <TableContainer component={Paper} sx={{ mb: 2, borderRadius: 2, border: 'none', boxShadow: '0px 4px 12px rgba(112, 144, 176, 0.08)' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Product</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }} align="right">Price</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }} align="right">Qty</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }} align="right">Subtotal</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }} width={50}></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cart.map((item) => (
                  <TableRow key={item.product_id}>
                    <TableCell sx={{ color: 'text.primary' }}>{item.name}</TableCell>
                    <TableCell sx={{ color: 'text.primary' }} align="right">Rp {item.price.toLocaleString()}</TableCell>
                    <TableCell sx={{ color: 'text.primary' }} align="right">{item.quantity}</TableCell>
                    <TableCell sx={{ color: 'text.primary' }} align="right">Rp {(item.price * item.quantity).toLocaleString()}</TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => removeFromCart(item.product_id)} sx={{ color: '#f48fb1' }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {cart.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ color: 'text.secondary' }}>Cart is empty</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Payment */}
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={6}>
              <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 700 }}>Total: Rp {total.toLocaleString()}</Typography>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Payment Amount"
                type="number"
                size="small"
                value={payment}
                onChange={(e) => setPayment(Number(e.target.value) || 0)}
                InputProps={{ sx: { borderRadius: 2 } }}
              />
            </Grid>
            {payment > 0 && (
              <Grid item xs={12}>
                <Typography variant="body1" sx={{ color: change >= 0 ? 'success.main' : 'error.main', fontWeight: 600 }}>
                  Change: Rp {change.toLocaleString()}
                </Typography>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setCreateOpen(false)} sx={{ color: 'text.secondary', fontWeight: 600 }}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateTransaction}
            disabled={saving || cart.length === 0}
            sx={{ borderRadius: 2, px: 3 }}
          >
            {saving ? 'Processing...' : 'Complete Transaction'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} sx={{ borderRadius: 2 }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default Transactions;