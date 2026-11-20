import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Snackbar,
  TextField,
  Typography,
} from '@mui/material';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import PrintIcon from '@mui/icons-material/Print';
import RestoreIcon from '@mui/icons-material/Restore';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import { useAuth } from '../context/AuthContext';
import {
  createTransaction,
  getActiveShift,
  getAccount,
  getCustomers,
  getProducts,
} from '../services/api';
import { roundMoney } from '../utils/currency';
import {
  getStorageKey,
  initialPaymentLines,
  normalizePaymentLines,
  readStoredValue,
} from '../utils/pos';
import ProductCatalog from '../components/pos/ProductCatalog';
import CartPanel from '../components/pos/CartPanel';
import { paymentMethods } from '../components/pos/PaymentPanel';
import ReceiptDialog from '../components/pos/ReceiptDialog';
import HeldCartsDialog from '../components/pos/HeldCartsDialog';
import SnackbarAlert from '../components/pos/SnackbarAlert';

const POS = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const checkoutRef = useRef(null);

  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [discountRate, setDiscountRate] = useState(0);
  const [taxRate, setTaxRate] = useState(0);
  const [paymentLines, setPaymentLines] = useState(initialPaymentLines);
  const [accounts, setAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [accountsLoadFailed, setAccountsLoadFailed] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [checkoutDialogOpen, setCheckoutDialogOpen] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [activeShift, setActiveShift] = useState(null);
  const [loadingShift, setLoadingShift] = useState(true);
  const [saving, setSaving] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [heldCarts, setHeldCarts] = useState([]);
  const [holdDialogOpen, setHoldDialogOpen] = useState(false);
  const [restoringDraft, setRestoringDraft] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const draftStorageKey = user?.id ? getStorageKey(user.id, 'draft') : null;
  const heldStorageKey = user?.id ? getStorageKey(user.id, 'held') : null;

  useEffect(() => {
    if (!draftStorageKey || !heldStorageKey) {
      setRestoringDraft(false);
      return;
    }

    try {
      const savedDraft = readStoredValue(draftStorageKey, null);
      if (savedDraft && Array.isArray(savedDraft.cart)) {
        setCart(savedDraft.cart);
        setCustomerId(savedDraft.customerId || '');
        setDiscountRate(Number(savedDraft.discountRate) || 0);
        setTaxRate(Number(savedDraft.taxRate) || 0);
        setPaymentLines(
          normalizePaymentLines(
            savedDraft.paymentLines ||
              [{ id: 'cash', method: 'cash', amount: savedDraft.payment || '' }]
          )
        );
      }

      const savedHeldCarts = readStoredValue(heldStorageKey, []);
      if (!Array.isArray(savedHeldCarts)) {
        throw new Error('Daftar transaksi tertahan tidak valid.');
      }
      setHeldCarts(savedHeldCarts);
    } catch (error) {
      showSnackbar('Data keranjang tersimpan tidak dapat dibaca.', 'error');
    } finally {
      setRestoringDraft(false);
    }
  }, [draftStorageKey, heldStorageKey]);

  useEffect(() => {
    if (restoringDraft || !draftStorageKey) return;
    try {
      if (cart.length) {
        localStorage.setItem(
          draftStorageKey,
          JSON.stringify({ cart, customerId, discountRate, taxRate, paymentLines })
        );
      } else {
        localStorage.removeItem(draftStorageKey);
      }
    } catch (error) {
      showSnackbar('Keranjang tidak dapat disimpan di perangkat ini.', 'error');
    }
  }, [cart, customerId, discountRate, taxRate, draftStorageKey, paymentLines, restoringDraft]);

  const saveHeldCarts = (nextCarts) => {
    try {
      localStorage.setItem(heldStorageKey, JSON.stringify(nextCarts));
      setHeldCarts(nextCarts);
      return true;
    } catch (error) {
      showSnackbar('Transaksi tidak dapat ditahan. Penyimpanan perangkat penuh.', 'error');
      return false;
    }
  };

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      try {
        const [productsResponse, shiftResponse] = await Promise.all([
          getProducts(),
          getActiveShift(),
        ]);

        if (active) {
          const rows = Array.isArray(productsResponse.data)
            ? productsResponse.data
            : productsResponse.data?.data || [];
          setProducts(rows);
          setActiveShift(shiftResponse.data?.data || shiftResponse.data || null);
        }
      } catch (error) {
        showSnackbar('Gagal memuat data produk atau shift.', 'error');
      } finally {
        if (active) {
          setLoadingProducts(false);
          setLoadingShift(false);
        }
      }
    };

    loadData();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;

    const loadAccounts = async () => {
      try {
        const pageSize = 100;
        const activeAccounts = [];
        let page = 1;
        let total = Infinity;

        while (activeAccounts.length < total) {
          const response = await getAccount({ status: true, page, limit: pageSize });
          const payload = response.data;
          const rows = Array.isArray(payload) ? payload : payload?.data;
          if (!Array.isArray(rows)) {
            throw new Error('Format daftar akun tidak valid.');
          }
          activeAccounts.push(...rows.filter((account) => account.status === true));
          total = Number.isFinite(Number(payload.total))
            ? Number(payload.total)
            : activeAccounts.length;
          if (!rows.length) break;
          page += 1;
        }
        if (active) setAccounts(activeAccounts);
      } catch (error) {
        if (active) {
          setAccountsLoadFailed(true);
          showSnackbar('Gagal memuat daftar akun aktif.', 'error');
        }
      } finally {
        if (active) setLoadingAccounts(false);
      }
    };

    loadAccounts();
    return () => { active = false; };
  }, []);

  const getUnitPrice = (item) => {
    return roundMoney(Number(item.price) * (1 - (Number(item.discountPct) || 0) / 100));
  };

  const itemSubtotal = useMemo(() => {
    return roundMoney(cart.reduce(
      (total, item) =>
        total +
        getUnitPrice(item) * item.quantity,
      0
    ));
  }, [cart]);

  const discountAmount = useMemo(
    () => roundMoney(itemSubtotal * Number(discountRate) / 100),
    [itemSubtotal, discountRate]
  );
  const taxableSubtotal = roundMoney(itemSubtotal - discountAmount);
  const taxAmount = useMemo(
    () => roundMoney(taxableSubtotal * Number(taxRate) / 100),
    [taxableSubtotal, taxRate]
  );
  const total = roundMoney(taxableSubtotal + taxAmount);

  const totalItems = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const amountPaid = useMemo(() => {
    return paymentLines.reduce((sum, line) => sum + Number(line.amount || 0), 0);
  }, [paymentLines]);

  const change = useMemo(() => Math.max(amountPaid - total, 0), [amountPaid, total]);

  const hasStockConflict = cart.some(
    (item) => item.quantity > Number(item.stock || item.stock_quantity || 0)
  );

  const paymentValid =
    total === 0 || amountPaid >= total || paymentLines.some((line) => line.method === 'cash');

  const addProduct = useCallback((product) => {
    const productId = product.product_id ?? product.id;
    const stock = Math.max(0, Number(product.stock_quantity ?? product.stock) || 0);
    if (productId == null) {
      showSnackbar('Produk tidak memiliki ID yang valid.', 'error');
      return;
    }
    if (stock === 0) {
      showSnackbar('Stok produk habis.', 'warning');
      return;
    }

    setCart((current) => {
      const existing = current.some(
        (item) => String(item.product_id) === String(productId)
      );
      if (existing) {
        return current.map((item) => (
          String(item.product_id) === String(productId)
            ? { ...item, stock, quantity: Math.min(stock, item.quantity + 1) }
            : item
        ));
      }
      return [
        ...current,
        {
          product_id: productId,
          name: product.name,
          price: Number(product.price) || 0,
          discountPct: 0,
          stock,
          quantity: 1,
        },
      ];
    });
  }, []);

  const updateQuantity = useCallback((productId, delta) => {
    setCart((current) =>
      current
        .map((item) => {
          if (item.product_id !== productId) return item;
          const newQty = item.quantity + delta;
          if (newQty < 1) return null;
          return { ...item, quantity: Math.min(Number(item.stock) || 0, newQty) };
        })
        .filter(Boolean)
    );
  }, []);

  const removeProduct = useCallback((productId) => {
    setCart((current) => {
      const next = current.filter((item) => item.product_id !== productId);
      if (!next.length) setPaymentLines(initialPaymentLines());
      return next;
    });
  }, []);

  const updateDiscount = useCallback((productId, value) => {
    const discountPct = Math.min(100, Math.max(0, Number(value) || 0));
    setCart((current) =>
      current.map((item) =>
        item.product_id === productId ? { ...item, discountPct } : item
      )
    );
  }, []);


  const updatePaymentLine = useCallback((id, field, value) => {
    setPaymentLines((current) =>
      current.map((line) => (line.id === id ? { ...line, [field]: value } : line))
    );
  }, []);

  const addPaymentLine = useCallback(() => {
    const nonCashTotal = paymentLines
      .filter((line) => line.method !== 'cash')
      .reduce((sum, line) => sum + Number(line.amount), 0);
    const availableMethod = paymentMethods.find(
      (method) => !paymentLines.some((line) => line.method === method.value)
    );
    if (!availableMethod) return;
    setPaymentLines((current) => [
      ...current,
      {
        id: `${Date.now()}-${current.length}`,
        method: availableMethod.value,
        amount:
          availableMethod.value === 'cash'
            ? ''
            : String(Math.max(total - nonCashTotal, 0)),
      },
    ]);
  }, [paymentLines, total]);

  const removePaymentLine = useCallback((id) => {
    setPaymentLines((current) => {
      const next = current.filter((line) => line.id !== id);
      return next.length ? next : initialPaymentLines();
    });
  }, []);

  const holdCurrentCart = useCallback(() => {
    if (!cart.length) {
      showSnackbar('Keranjang kosong, tidak ada transaksi untuk ditahan.', 'warning');
      return;
    }

    const nextCarts = [
      {
        id: `${Date.now()}`,
        createdAt: new Date().toISOString(),
        customerId,
        cart,
        paymentLines,
        discountRate,
        taxRate,
      },
      ...heldCarts,
    ];

    if (saveHeldCarts(nextCarts)) {
      setCart([]);
      setCustomerId('');
      setDiscountRate(0);
      setTaxRate(0);
      setPaymentLines(initialPaymentLines());
      showSnackbar('Transaksi disimpan dan keranjang siap untuk pelanggan berikutnya.');
    }
  }, [cart, customerId, paymentLines, discountRate, taxRate, heldCarts]);

  const resumeHeldCart = useCallback((heldCart) => {
    if (cart.length && !window.confirm('Keranjang aktif akan digantikan. Lanjutkan?')) return;
    setCart(heldCart.cart);
    setCustomerId(heldCart.customerId || '');
    setDiscountRate(Number(heldCart.discountRate) || 0);
    setTaxRate(Number(heldCart.taxRate) || 0);
    setPaymentLines(
      normalizePaymentLines(
        heldCart.paymentLines || [{ id: 'cash', method: 'cash', amount: heldCart.payment || '' }]
      )
    );
    if (saveHeldCarts(heldCarts.filter((item) => item.id !== heldCart.id))) {
      setHoldDialogOpen(false);
      showSnackbar('Transaksi tertahan berhasil dilanjutkan.');
    }
  }, [cart, heldCarts]);

  const discardHeldCart = useCallback((id) => {
    saveHeldCarts(heldCarts.filter((item) => item.id !== id));
  }, [heldCarts]);

  const handleSearchKeyDown = useCallback((event) => {
    if (event.key !== 'Enter') return;
    const barcode = searchTerm.trim();
    const product = products.find((item) => String(item.barcode || '') === barcode);
    if (product) {
      addProduct(product);
      setSearchTerm('');
    }
  }, [searchTerm, products, addProduct]);

  const handleCheckout = () => {
    if (!cart.length) {
      showSnackbar('Keranjang masih kosong.', 'warning');
      return;
    }
    if (!user?.id) {
      showSnackbar('Sesi kasir tidak ditemukan. Silakan masuk kembali.', 'error');
      return;
    }
    if (!activeShift) {
      showSnackbar('Buka shift kasir terlebih dahulu sebelum checkout.', 'warning');
      return;
    }
    if (hasStockConflict) {
      showSnackbar('Stok produk berubah. Sesuaikan jumlah sebelum membayar.', 'warning');
      return;
    }
    if (!paymentValid) {
      showSnackbar('Nominal metode pembayaran belum sesuai dengan total belanja.', 'warning');
      return;
    }

    setSelectedAccountId('');
    setCheckoutDialogOpen(true);
  };

  const confirmCheckout = async () => {
    if (!selectedAccountId) {
      showSnackbar('Pilih akun penerimaan transaksi terlebih dahulu.', 'warning');
      return;
    }

    setSaving(true);
    try {
      const cashLine = paymentLines.find((line) => line.method === 'cash');
      const cashTendered = cashLine ? Number(cashLine.amount) || 0 : 0;
      const nonCashTotal = paymentLines
        .filter((line) => line.method !== 'cash')
        .reduce((sum, line) => sum + Number(line.amount || 0), 0);
      const cashRequired = Math.max(total - nonCashTotal, 0);

      const payments = total === 0
        ? []
        : paymentLines
            .filter((line) => line.method !== 'cash' || cashRequired > 0)
            .map((line) => ({
              method: line.method,
              amount: line.method === 'cash' ? cashRequired : Number(line.amount),
              tendered: line.method === 'cash' ? cashTendered : Number(line.amount),
            }));

      const response = await createTransaction({
        customer_id: customerId || null,
        shift_id: activeShift.id,
        total,
        discount_rate: Number(discountRate),
        tax_rate: Number(taxRate),
        account_id: Number(selectedAccountId),
        payment: amountPaid,
        change,
        payments,
        details: cart.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price: getUnitPrice(item),
        })),
      });

      setReceipt({
        id: response.data?.id,
        subtotal: itemSubtotal,
        discountRate: Number(discountRate),
        discountAmount,
        taxRate: Number(taxRate),
        taxAmount,
        total,
        payment: amountPaid,
        change,
        payments,
        account: accounts.find((account) => String(account.id) === String(selectedAccountId)),
        customer: customers.find((customer) => String(customer.id) === String(customerId)),
        items: cart.map((item) => ({
          ...item,
          unitPrice: getUnitPrice(item),
        })),
        createdAt: new Date().toLocaleString('id-ID'),
      });
      setCart([]);
      setCustomerId('');
      setDiscountRate(0);
      setTaxRate(0);
      setPaymentLines(initialPaymentLines());
      setCheckoutDialogOpen(false);
      setSelectedAccountId('');

      try {
        const productsResponse = await getProducts();
        const rows = Array.isArray(productsResponse.data)
          ? productsResponse.data
          : productsResponse.data?.data || [];
        setProducts(rows);
      } catch (error) {
        showSnackbar('Transaksi berhasil, tetapi stok terbaru gagal dimuat.', 'warning');
      }
    } catch (error) {
      showSnackbar(
        error.response?.data?.error || error.response?.data?.message || 'Transaksi gagal diproses.',
        'error'
      );
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const handleShortcut = (event) => {
      if (event.key === 'F2') {
        event.preventDefault();
        searchRef.current?.focus();
      }
      if (event.key === 'F9') {
        event.preventDefault();
        checkoutRef.current?.click();
      }
    };
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  const getCustomerName = (customer) =>
    customer
      ? customer['Nama Customer'] || customer.name || 'Pelanggan umum'
      : 'Pelanggan umum';

  return (
    <Box sx={{ maxWidth: 1600, mx: 'auto', display: 'flex', gap: { xs: 2, md: 3 }, flexWrap: { xs: 'wrap', md: 'nowrap' }, alignItems: 'flex-start' }}>
      <Box sx={{ flex: 1, minWidth: 0, width: { xs: '100%', md: 'auto' } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2.5,
              display: 'grid',
              placeItems: 'center',
              bgcolor: 'primary.main',
              color: '#fff',
            }}
          >
            <PointOfSaleIcon />
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary' }}>
            Kasir / POS
          </Typography>
        </Box>

        <ProductCatalog
          products={products}
          searchTerm={searchTerm}
          onSearchChange={(e) => setSearchTerm(e.target.value)}
          onSearchKeyDown={handleSearchKeyDown}
          onAddProduct={addProduct}
          disabled={loadingProducts}
        />
      </Box>

      <CartPanel
        cart={cart}
        customers={customers}
        customerId={customerId}
        onCustomerChange={setCustomerId}
        paymentLines={paymentLines}
        itemSubtotal={itemSubtotal}
        discountRate={discountRate}
        discountAmount={discountAmount}
        taxRate={taxRate}
        taxAmount={taxAmount}
        total={total}
        amountPaid={amountPaid}
        change={change}
        hasStockConflict={hasStockConflict}
        totalItems={totalItems}
        onUpdateQuantity={updateQuantity}
        onRemoveProduct={removeProduct}
        onUpdateDiscount={updateDiscount}
        onDiscountRateChange={setDiscountRate}
        onTaxRateChange={setTaxRate}
        onUpdatePaymentLine={updatePaymentLine}
        onAddPaymentLine={addPaymentLine}
        onRemovePaymentLine={removePaymentLine}
        onCheckout={handleCheckout}
        saving={saving}
      />

      <Dialog
        open={checkoutDialogOpen}
        onClose={() => {
          if (!saving) setCheckoutDialogOpen(false);
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Pilih Akun Penerimaan</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Pilih akun aktif untuk mencatat penerimaan transaksi ini.
          </Typography>
          {loadingAccounts ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : accountsLoadFailed ? (
            <Alert severity="error">
              Daftar akun gagal dimuat. Muat ulang halaman sebelum melanjutkan checkout.
            </Alert>
          ) : accounts.length ? (
            <TextField
              select
              fullWidth
              label="Akun"
              value={selectedAccountId}
              onChange={(event) => setSelectedAccountId(event.target.value)}
              disabled={saving}
            >
              {accounts.map((account) => (
                <MenuItem key={account.id} value={String(account.id)}>
                  {account.name} ({account.typeAccount})
                </MenuItem>
              ))}
            </TextField>
          ) : (
            <Alert severity="warning">
              Tidak ada akun aktif. Aktifkan atau tambahkan akun sebelum checkout.
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCheckoutDialogOpen(false)} disabled={saving}>
            Batal
          </Button>
          <Button
            variant="contained"
            onClick={confirmCheckout}
            disabled={saving || loadingAccounts || !accounts.length || !selectedAccountId}
          >
            {saving ? 'Memproses...' : 'Konfirmasi Bayar'}
          </Button>
        </DialogActions>
      </Dialog>

      <ReceiptDialog
        open={!!receipt}
        onClose={() => setReceipt(null)}
        onPrint={() => window.print()}
        onNewTransaction={() => setReceipt(null)}
        receipt={receipt}
      />

      <HeldCartsDialog
        open={holdDialogOpen}
        onClose={() => setHoldDialogOpen(false)}
        heldCarts={heldCarts}
        customers={customers}
        onResume={resumeHeldCart}
        onDiscard={discardHeldCart}
      />

      <SnackbarAlert
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={(open) => setSnackbar({ ...snackbar, open })}
      />
    </Box>
  );
};

export default POS;