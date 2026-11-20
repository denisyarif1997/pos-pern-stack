import React from 'react';
import { Box, IconButton, TextField, Tooltip, Typography } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';
import { formatCurrency, roundMoney } from '../../utils/currency';

const CartItem = ({ item, onUpdateQuantity, onRemove, onUpdateDiscount }) => {
  const handleDiscountChange = (value) => {
    const discountPct = Math.min(100, Math.max(0, Number(value) || 0));
    onUpdateDiscount(item.product_id, discountPct);
  };

  const unitPrice = roundMoney(item.price * (1 - (item.discountPct || 0) / 100));
  const lineTotal = roundMoney(unitPrice * item.quantity);
  const hasDiscount = (item.discountPct || 0) > 0;

  return (
    <Box
      sx={{
        p: 1.25,
        borderRadius: 2.5,
        bgcolor: 'background.default',
        border: '1px solid',
        borderColor: 'divider',
        transition: 'box-shadow 0.15s',
        '&:hover': { boxShadow: '0 2px 10px rgba(15,118,110,0.10)' },
      }}
    >
      {/* Baris atas: nama + hapus */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" fontWeight={700} noWrap sx={{ color: 'text.primary' }}>
            {item.name}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.25, flexWrap: 'wrap' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {formatCurrency(item.price)}
            </Typography>
            {hasDiscount && (
              <Typography
                variant="caption"
                sx={{
                  color: 'success.main',
                  fontWeight: 700,
                  bgcolor: 'success.light',
                  borderRadius: 1,
                  px: 0.6,
                  py: 0.1,
                  fontSize: 10,
                }}
              >
                -{item.discountPct}%
              </Typography>
            )}
          </Box>
        </Box>

        <Tooltip title={`Hapus ${item.name}`}>
          <IconButton
            size="small"
            onClick={() => onRemove(item.product_id)}
            sx={{ color: 'error.main', mt: -0.5, mr: -0.5 }}
          >
            <DeleteOutlineRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Baris bawah: qty controls + diskon + total */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1, gap: 1 }}>
        {/* Qty stepper */}
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.25,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            px: 0.5,
          }}
        >
          <IconButton
            size="small"
            aria-label={`Kurangi ${item.name}`}
            onClick={() => onUpdateQuantity(item.product_id, -1)}
            sx={{ width: 26, height: 26 }}
          >
            <RemoveRoundedIcon sx={{ fontSize: 14 }} />
          </IconButton>
          <Typography variant="body2" fontWeight={800} sx={{ minWidth: 22, textAlign: 'center', fontSize: 13 }}>
            {item.quantity}
          </Typography>
          <IconButton
            size="small"
            aria-label={`Tambah ${item.name}`}
            disabled={item.quantity >= item.stock}
            onClick={() => onUpdateQuantity(item.product_id, 1)}
            sx={{ width: 26, height: 26 }}
          >
            <AddRoundedIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Box>

        {/* Diskon */}
        <TextField
          size="small"
          type="number"
          placeholder="Disc %"
          value={item.discountPct || ''}
          onChange={(e) => handleDiscountChange(e.target.value)}
          slotProps={{
            htmlInput: {
              min: 0,
              max: 100,
              inputMode: 'numeric',
              'aria-label': `Diskon persen ${item.name}`,
            },
          }}
          sx={{
            width: 76,
            '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: 12 },
            '& input': { py: 0.65, px: 1, textAlign: 'center' },
          }}
        />

        {/* Total baris */}
        <Typography variant="body2" fontWeight={800} sx={{ color: 'primary.dark', whiteSpace: 'nowrap' }}>
          {formatCurrency(lineTotal)}
        </Typography>
      </Box>
    </Box>
  );
};

export default CartItem;