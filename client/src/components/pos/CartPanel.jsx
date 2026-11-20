import React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  InputAdornment,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import LocalMallOutlinedIcon from '@mui/icons-material/LocalMallOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import CartItem from './CartItem';
import CustomerSelector from './CustomerSelector';
import PaymentPanel from './PaymentPanel';
import { formatCurrency } from '../../utils/currency';

const CartPanel = ({
  cart,
  customers,
  customerId,
  paymentLines,
  itemSubtotal,
  discountRate,
  discountAmount,
  taxRate,
  taxAmount,
  total,
  amountPaid,
  change,
  hasStockConflict,
  totalItems,
  onUpdateQuantity,
  onRemoveProduct,
  onUpdateDiscount,
  onDiscountRateChange,
  onTaxRateChange,
  onCustomerChange,
  onUpdatePaymentLine,
  onAddPaymentLine,
  onRemovePaymentLine,
  onCheckout,
  saving,
}) => {
  return (
    <Card
      sx={{
        position: { md: 'sticky' },
        top: { md: 88 },
        overflow: 'hidden',
        height: 'fit-content',
        minWidth: { xs: 0, md: 320 },
        maxWidth: { xs: '100%', md: 380 },
        width: { xs: '100%', md: 360 },
        flexShrink: 0,
      }}
    >
      <CardContent sx={{ p: 0 }}>
        {/* ── Header keranjang ── */}
        <Box
          sx={{
            px: 2.5,
            py: 2,
            bgcolor: 'primary.main',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ShoppingCartOutlinedIcon sx={{ color: '#fff', fontSize: 20 }} />
            <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>
              Keranjang Belanja
            </Typography>
          </Box>
          <Chip
            icon={<LocalMallOutlinedIcon sx={{ fontSize: '14px !important', color: 'primary.dark !important' }} />}
            label={`${totalItems} item`}
            size="small"
            sx={{
              bgcolor: 'rgba(255,255,255,0.22)',
              color: '#fff',
              fontWeight: 700,
              fontSize: 11,
              border: '1px solid rgba(255,255,255,0.3)',
              '& .MuiChip-icon': { color: '#fff' },
            }}
          />
        </Box>

        <Box sx={{ px: 2.5, pt: 2, pb: 2.5 }}>
          {/* Warning stok berubah */}
          {hasStockConflict && (
            <Chip
              label="⚠ Stok beberapa produk berubah, sesuaikan jumlah"
              color="warning"
              variant="outlined"
              size="small"
              sx={{ mb: 2, width: '100%', borderRadius: 2, fontSize: 11, fontWeight: 600, height: 'auto', py: 0.5 }}
            />
          )}

          {/* ── Daftar item keranjang ── */}
          {cart.length ? (
            <Stack
              spacing={1}
              sx={{
                maxHeight: { xs: 260, md: '32vh' },
                overflowY: 'auto',
                pr: 0.5,
                mr: -0.5,
              }}
            >
              {cart.map((item) => (
                <CartItem
                  key={item.product_id}
                  item={item}
                  onUpdateQuantity={onUpdateQuantity}
                  onRemove={onRemoveProduct}
                  onUpdateDiscount={onUpdateDiscount}
                />
              ))}
            </Stack>
          ) : (
            <Box
              sx={{
                py: 4,
                textAlign: 'center',
                color: 'text.secondary',
                border: '2px dashed',
                borderColor: 'divider',
                borderRadius: 2.5,
              }}
            >
              <ShoppingCartOutlinedIcon sx={{ fontSize: 36, opacity: 0.4, mb: 1 }} />
              <Typography variant="body2" fontWeight={600}>
                Keranjang masih kosong
              </Typography>
              <Typography variant="caption" sx={{ display: 'block', mt: 0.25 }}>
                Pilih produk untuk memulai transaksi
              </Typography>
            </Box>
          )}

          <Divider sx={{ my: 2 }} />

          {/* ── Pelanggan ── */}
          <CustomerSelector customers={customers} value={customerId} onChange={onCustomerChange} />

          <Stack spacing={1.25} sx={{ mb: 2 }}>
            <TextField
              fullWidth
              size="small"
              type="number"
              label="Diskon transaksi"
              value={discountRate}
              onFocus={(event) => event.target.select()}
              onChange={(event) => onDiscountRateChange(event.target.value)}
              onBlur={(event) => onDiscountRateChange(
                Math.min(100, Math.max(0, Number(event.target.value) || 0))
              )}
              slotProps={{ htmlInput: { min: 0, max: 100, step: 0.01, inputMode: 'decimal' } }}
              InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
            />
            <TextField
              fullWidth
              size="small"
              type="number"
              label="PPN"
              value={taxRate}
              onFocus={(event) => event.target.select()}
              onChange={(event) => onTaxRateChange(event.target.value)}
              onBlur={(event) => onTaxRateChange(
                Math.min(100, Math.max(0, Number(event.target.value) || 0))
              )}
              slotProps={{ htmlInput: { min: 0, max: 100, step: 0.01, inputMode: 'decimal' } }}
              InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" color="text.secondary">
                Subtotal setelah diskon produk
              </Typography>
              <Typography variant="caption">{formatCurrency(itemSubtotal)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" color="text.secondary">
                Diskon transaksi ({discountRate}%)
              </Typography>
              <Typography variant="caption">-{formatCurrency(discountAmount)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" color="text.secondary">
                PPN ({taxRate}%)
              </Typography>
              <Typography variant="caption">{formatCurrency(taxAmount)}</Typography>
            </Box>
          </Stack>

          {/* ── Pembayaran ── */}
          <PaymentPanel
            paymentLines={paymentLines}
            total={total}
            amountPaid={amountPaid}
            change={change}
            onUpdatePaymentLine={onUpdatePaymentLine}
            onAddPaymentLine={onAddPaymentLine}
            onRemovePaymentLine={onRemovePaymentLine}
          />

          {/* ── Tombol bayar ── */}
          <Tooltip title={!cart.length ? 'Tambahkan produk terlebih dahulu' : ''}>
            <span style={{ display: 'block', marginTop: 16 }}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                disabled={!cart.length || saving}
                onClick={onCheckout}
                sx={{
                  py: 1.5,
                  borderRadius: 2.5,
                  fontSize: 15,
                  fontWeight: 800,
                  letterSpacing: 0.3,
                  boxShadow: cart.length ? '0 4px 16px rgba(15,118,110,0.35)' : 'none',
                }}
              >
                {saving ? 'Memproses...' : 'Bayar'}
              </Button>
            </span>
          </Tooltip>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CartPanel;