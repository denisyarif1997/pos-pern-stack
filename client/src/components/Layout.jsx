import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ReceiptIcon from '@mui/icons-material/Receipt';
import InventoryIcon from '@mui/icons-material/Inventory';
import CategoryIcon from '@mui/icons-material/Category';
import PeopleIcon from '@mui/icons-material/People';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import StorageIcon from '@mui/icons-material/Storage';
import StraightenIcon from '@mui/icons-material/Straighten';
import LogoutIcon from '@mui/icons-material/Logout';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import AssessmentIcon from '@mui/icons-material/Assessment';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import { useAuth } from '../context/AuthContext';
import AccountIcon from '@mui/icons-material/AccountBox';


const drawerWidth = 260;

const menuItems = [
  { text: 'Kasir / POS', icon: <PointOfSaleIcon />, path: '/' },
  { text: 'Shift Kasir', icon: <CurrencyExchangeIcon />, path: '/shifts' },
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Transaksi', icon: <ReceiptIcon />, path: '/transactions' },
  { text: 'Laporan Penjualan', icon: <AssessmentIcon />, path: '/reports' },
  { text: 'Produk', icon: <InventoryIcon />, path: '/products' },
  { text: 'Kategori', icon: <CategoryIcon />, path: '/categories' },
  { text: 'Satuan', icon: <StraightenIcon />, path: '/units' },
  { text: 'Pelanggan', icon: <PeopleIcon />, path: '/customers' },
  { text: 'Pemasok', icon: <GroupIcon />, path: '/suppliers' },
  { text: 'Pengguna', icon: <PersonIcon />, path: '/users' },
  { text: 'Gudang', icon: <WarehouseIcon />, path: '/warehouses' },
  { text: 'Stok & Persediaan', icon: <StorageIcon />, path: '/stock' },
  { text: 'Akun', icon: <AccountIcon />, path: '/account' },

];

const Layout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, logout } = useAuth();

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate('/login');
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ px: 2.5, py: 2.25, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ width: 40, height: 40, borderRadius: 2.5, display: 'grid', placeItems: 'center', bgcolor: 'primary.main', color: '#fff' }}>
          <PointOfSaleIcon />
        </Box>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
            Kasir POS
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Sistem kasir &amp; toko
          </Typography>
        </Box>
      </Box>
      <Divider />
      <Typography variant="overline" sx={{ px: 2.5, pt: 2.5, pb: 1, color: 'text.secondary', letterSpacing: '0.08em', fontWeight: 700 }}>
        Menu
      </Typography>
      <List sx={{ flex: 1, px: 1.5, pt: 0 }}>
        {menuItems.map((item) => {
          const isActive = item.path === '/'
            ? location.pathname === item.path
            : location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) setMobileOpen(false);
                }}
                sx={{
                  borderRadius: 2.5,
                  minHeight: 44,
                  backgroundColor: isActive ? 'rgba(15, 118, 110, 0.09)' : 'transparent',
                  '&:hover': {
                    backgroundColor: isActive ? 'rgba(15, 118, 110, 0.12)' : 'rgba(23, 43, 77, 0.04)',
                  },
                }}
              >
                <ListItemIcon sx={{ color: isActive ? 'primary.main' : 'text.secondary', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={{
                    '& .MuiListItemText-primary': {
                      color: isActive ? 'primary.main' : 'text.secondary',
                      fontWeight: isActive ? 700 : 600,
                      fontSize: '0.875rem',
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <Divider />
      <Box sx={{ p: 2 }}>
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', textAlign: 'center' }}>
          Sistem POS · v1.0.0
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          backgroundColor: 'background.paper',
          color: 'text.primary',
          borderBottom: '1px solid',
          borderColor: 'divider',
          boxShadow: 'none',
        }}
      >
        <Toolbar sx={{ minHeight: '72px !important', px: { xs: 2, md: 3 } }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" noWrap sx={{ fontWeight: 700 }}>
              {menuItems.find((item) => item.path === location.pathname)?.text || 'Kasir POS'}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
              Operasional toko
            </Typography>
          </Box>
          <IconButton onClick={handleMenuOpen} aria-label="Open account menu" sx={{ p: 0 }}>
            <Avatar sx={{ width: 38, height: 38, bgcolor: 'primary.light', color: 'primary.dark', fontWeight: 700 }}>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              sx: {
                backgroundColor: 'background.paper',
                border: '1px solid rgba(0,0,0,0.05)',
                boxShadow: '0 12px 32px rgba(23, 43, 77, 0.14)',
                mt: 1,
                minWidth: 150,
              },
            }}
          >
            <MenuItem disabled>
              <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 600 }}>
                {user?.name} ({user?.role})
              </Typography>
            </MenuItem>
            <Divider sx={{ borderColor: 'rgba(0,0,0,0.05)' }} />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" color="error" />
              </ListItemIcon>
              <Typography variant="body2" color="error" fontWeight="500">Logout</Typography>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        {isMobile ? (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{
              '& .MuiDrawer-paper': {
                width: drawerWidth,
                backgroundColor: 'background.paper',
                borderRight: '1px solid #E8EDF3',
                boxShadow: '0 12px 32px rgba(23, 43, 77, 0.12)',
              },
            }}
          >
            {drawer}
          </Drawer>
        ) : (
          <Drawer
            variant="permanent"
            sx={{
              '& .MuiDrawer-paper': {
                width: drawerWidth,
                backgroundColor: 'background.paper',
                borderRight: '1px solid #E8EDF3',
                boxShadow: 'none',
              },
            }}
            open
          >
            {drawer}
          </Drawer>
        )}
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3, lg: 4 },
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: '72px',
          minHeight: '100vh',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;