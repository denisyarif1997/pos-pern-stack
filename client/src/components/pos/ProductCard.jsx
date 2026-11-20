import React from 'react';
import { Box, ButtonBase, Chip, Typography } from '@mui/material';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import { formatCurrency } from '../../utils/currency';

// Warna latar avatar produk berdasarkan huruf pertama nama
const avatarColors = [
  '#0F766E', '#0369A1', '#7C3AED', '#B45309', '#BE185D',
  '#065F46', '#1D4ED8', '#6D28D9', '#92400E', '#9F1239',
];

const getAvatarColor = (name = '') => {
  const code = name.charCodeAt(0) || 0;
  return avatarColors[code % avatarColors.length];
};

const ProductCard = ({ product, onAdd, disabled }) => {
  const stock = Number(product.stock_quantity || product.stock || 0);
  const outOfStock = stock <= 0;
  const lowStock = stock > 0 && stock <= 5;
  const avatarColor = getAvatarColor(product.name);
  const initial = (product.name || '?').charAt(0).toUpperCase();

  return (
    <ButtonBase
      onClick={() => !disabled && !outOfStock && onAdd(product)}
      disabled={disabled || outOfStock}
      sx={{
        display: 'block',
        width: '100%',
        borderRadius: 3,
        textAlign: 'left',
        transition: 'transform 0.15s, box-shadow 0.15s',
        '&:not(:disabled):hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 6px 20px rgba(15,118,110,0.18)',
        },
        '&:not(:disabled):active': {
          transform: 'translateY(0)',
        },
        opacity: outOfStock ? 0.55 : 1,
      }}
    >
      <Box
        sx={{
          borderRadius: 3,
          border: '1.5px solid',
          borderColor: outOfStock ? 'divider' : lowStock ? 'warning.light' : 'divider',
          bgcolor: 'background.paper',
          overflow: 'hidden',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Gambar / Avatar produk */}
        <Box
          sx={{
            height: 90,
            bgcolor: avatarColor + '18',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            flexShrink: 0,
          }}
        >
          {product.image_url ? (
            <Box
              component="img"
              src={product.image_url}
              alt={product.name}
              sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <Typography
              sx={{
                fontSize: 36,
                fontWeight: 800,
                color: avatarColor,
                lineHeight: 1,
                userSelect: 'none',
              }}
            >
              {initial}
            </Typography>
          )}

          {/* Badge stok */}
          <Chip
            label={outOfStock ? 'Habis' : lowStock ? `Sisa ${stock}` : `${stock}`}
            size="small"
            color={outOfStock ? 'error' : lowStock ? 'warning' : 'success'}
            sx={{
              position: 'absolute',
              top: 6,
              right: 6,
              height: 20,
              fontSize: 10,
              fontWeight: 700,
              '& .MuiChip-label': { px: 0.75 },
            }}
          />
        </Box>

        {/* Info produk */}
        <Box sx={{ p: 1.25, flex: 1, display: 'flex', flexDirection: 'column', gap: 0.25 }}>
          <Typography
            variant="body2"
            fontWeight={700}
            sx={{
              color: 'text.primary',
              lineHeight: 1.3,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              minHeight: 36,
            }}
          >
            {product.name}
          </Typography>

          {product.category_name && (
            <Typography
              variant="caption"
              noWrap
              sx={{ color: 'text.secondary', fontSize: 10, display: 'block' }}
            >
              {product.category_name}
            </Typography>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 'auto', pt: 0.75 }}>
            <Typography
              variant="body2"
              fontWeight={800}
              sx={{ color: 'primary.dark', fontSize: 13 }}
            >
              {formatCurrency(product.price)}
            </Typography>
            {!outOfStock && (
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  bgcolor: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <ShoppingCartOutlinedIcon sx={{ fontSize: 13, color: '#fff' }} />
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </ButtonBase>
  );
};

export default ProductCard;