import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import ErrorBoundary from './components/ErrorBoundary';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Categories from './pages/Categories';
import Customers from './pages/Customers';
import Suppliers from './pages/Suppliers';
import Users from './pages/Users';
import Transactions from './pages/Transactions';
import Warehouses from './pages/Warehouses';
import Stock from './pages/Stock';
import Units from './pages/Units';
import POS from './pages/POS';
import Shifts from './pages/Shifts';
import Reports from './pages/Reports';
import Accounts from './pages/Account';

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <ErrorBoundary>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <Layout />
                  </PrivateRoute>
                }
              >
                <Route index element={<POS />} />
                <Route path="shifts" element={<Shifts />} />
                <Route path="reports" element={<Reports />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="products" element={<Products />} />
                <Route path="categories" element={<Categories />} />
                <Route path="customers" element={<Customers />} />
                <Route path="suppliers" element={<Suppliers />} />
                <Route path="users" element={<Users />} />
                <Route path="transactions" element={<Transactions />} />
                <Route path="warehouses" element={<Warehouses />} />
                <Route path="stock" element={<Stock />} />
                <Route path="units" element={<Units />} />
                <Route path="account" element={<Accounts />} />
              </Route>
            </Routes>
          </ErrorBoundary>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;