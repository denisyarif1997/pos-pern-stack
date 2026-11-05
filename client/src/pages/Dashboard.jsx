import React, { useEffect, useState } from 'react';
import { Grid, Card, CardContent, Typography, Box, CircularProgress } from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';
import CategoryIcon from '@mui/icons-material/Category';
import PeopleIcon from '@mui/icons-material/People';
import ReceiptIcon from '@mui/icons-material/Receipt';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import GroupIcon from '@mui/icons-material/Group';
import { getProducts, getCategories, getCustomers, getTransactions, getWarehouses, getSuppliers } from '../services/api';

const StatCard = ({ title, value, icon, color }) => (
  <Card
    sx={{
      backgroundColor: 'background.paper',
      transition: 'transform 0.2s, box-shadow 0.2s',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: `0 12px 32px ${color}33`,
      },
    }}
  >
    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 3 }}>
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `${color}33`,
          color: color,
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
          {value}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
          {title}
        </Typography>
      </Box>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [productsRes, categoriesRes, customersRes, transactionsRes, warehousesRes, suppliersRes] = await Promise.all([
          getProducts(),
          getCategories(),
          getCustomers(),
          getTransactions(),
          getWarehouses(),
          getSuppliers(),
        ]);

        const products = Array.isArray(productsRes.data) ? productsRes.data : productsRes.data?.data || [];
        const categories = Array.isArray(categoriesRes.data) ? categoriesRes.data : categoriesRes.data?.data || [];
        const customers = Array.isArray(customersRes.data) ? customersRes.data : customersRes.data?.data || [];
        const transactions = Array.isArray(transactionsRes.data) ? transactionsRes.data : transactionsRes.data?.data || [];
        const warehouses = Array.isArray(warehousesRes.data) ? warehousesRes.data : warehousesRes.data?.data || [];
        const suppliers = Array.isArray(suppliersRes.data) ? suppliersRes.data : suppliersRes.data?.data || [];

        setStats({
          products: products.length,
          categories: categories.length,
          customers: customers.length,
          transactions: transactions.length,
          warehouses: warehouses.length,
          suppliers: suppliers.length,
        });
      } catch (err) {
        console.error('Failed to fetch stats:', err);
        setStats({ products: 0, categories: 0, customers: 0, transactions: 0, warehouses: 0, suppliers: 0 });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: 'text.primary' }}>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard title="Products" value={stats.products} icon={<InventoryIcon sx={{ fontSize: 28 }} />} color="#4318FF" />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard title="Categories" value={stats.categories} icon={<CategoryIcon sx={{ fontSize: 28 }} />} color="#00B5D8" />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard title="Customers" value={stats.customers} icon={<PeopleIcon sx={{ fontSize: 28 }} />} color="#FFB547" />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard title="Suppliers" value={stats.suppliers} icon={<GroupIcon sx={{ fontSize: 28 }} />} color="#E31A1A" />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard title="Transactions" value={stats.transactions} icon={<ReceiptIcon sx={{ fontSize: 28 }} />} color="#05CD99" />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard title="Warehouses" value={stats.warehouses} icon={<WarehouseIcon sx={{ fontSize: 28 }} />} color="#8F9BBA" />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;