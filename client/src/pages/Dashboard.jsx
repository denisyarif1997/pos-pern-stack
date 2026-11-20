import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Box, CircularProgress } from '@mui/material';
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
      transition: 'transform 0.2s, box-shadow 0.2s',
      '&:hover': {
        transform: 'translateY(-3px)',
        boxShadow: `0 12px 32px ${color}33`,
      },
    }}
  >
    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 3 }}>
      <Box
        sx={{
          width: 52,
          height: 52,
          borderRadius: 2.5,
          display: 'grid',
          placeItems: 'center',
          background: `${color}1A`,
          color,
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
    let active = true;

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

        const rows = [productsRes, categoriesRes, customersRes, transactionsRes, warehousesRes, suppliersRes]
          .map((response) => Array.isArray(response.data) ? response.data : response.data?.data || []);

        if (active) {
          setStats({
            products: rows[0].length,
            categories: rows[1].length,
            customers: rows[2].length,
            transactions: new Set(rows[3].map((transaction) => transaction.id)).size,
            warehouses: rows[4].length,
            suppliers: rows[5].length,
          });
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        if (active) setStats({ products: 0, categories: 0, customers: 0, transactions: 0, warehouses: 0, suppliers: 0 });
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchStats();
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  const cards = [
    { title: 'Produk', value: stats.products, icon: <InventoryIcon sx={{ fontSize: 26 }} />, color: '#0F766E' },
    { title: 'Kategori', value: stats.categories, icon: <CategoryIcon sx={{ fontSize: 26 }} />, color: '#2563EB' },
    { title: 'Pelanggan', value: stats.customers, icon: <PeopleIcon sx={{ fontSize: 26 }} />, color: '#D97706' },
    { title: 'Pemasok', value: stats.suppliers, icon: <GroupIcon sx={{ fontSize: 26 }} />, color: '#7C3AED' },
    { title: 'Transaksi', value: stats.transactions, icon: <ReceiptIcon sx={{ fontSize: 26 }} />, color: '#059669' },
    { title: 'Gudang', value: stats.warehouses, icon: <WarehouseIcon sx={{ fontSize: 26 }} />, color: '#475569' },
  ];

  return (
    <Box sx={{ maxWidth: 1440, mx: 'auto' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4">Dashboard</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
          Ringkasan operasional toko.
        </Typography>
      </Box>
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(3, minmax(0, 1fr))' },
        gap: 3,
      }}>
        {cards.map((card) => <StatCard key={card.title} {...card} />)}
      </Box>
    </Box>
  );
};

export default Dashboard;
