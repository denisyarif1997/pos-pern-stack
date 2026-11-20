import React, { useMemo, useState } from 'react';
import {
  Box,
  Chip,
  InputAdornment,
  Skeleton,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ViewListRoundedIcon from '@mui/icons-material/ViewListRounded';
import ProductCard from './ProductCard';

const ProductCatalog = ({
  products,
  searchTerm,
  onSearchChange,
  onSearchKeyDown,
  onAddProduct,
  disabled,
}) => {
  const [activeCategory, setActiveCategory] = useState('');
  const [gridSize, setGridSize] = useState('md'); // 'sm' | 'md' | 'lg'

  // Kumpulkan kategori unik dari produk
  const categories = useMemo(() => {
    const cats = new Map();
    products.forEach((p) => {
      if (p.category_name) cats.set(p.category_name, (cats.get(p.category_name) || 0) + 1);
    });
    return Array.from(cats.entries()).map(([name, count]) => ({ name, count }));
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchSearch =
        !searchTerm ||
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.barcode?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory = !activeCategory || product.category_name === activeCategory;
      return matchSearch && matchCategory;
    });
  }, [products, searchTerm, activeCategory]);

  const gridCols = {
    sm: { xs: 'repeat(3, minmax(0,1fr))', sm: 'repeat(4, minmax(0,1fr))', md: 'repeat(5, minmax(0,1fr))', lg: 'repeat(7, minmax(0,1fr))' },
    md: { xs: 'repeat(2, minmax(0,1fr))', sm: 'repeat(3, minmax(0,1fr))', md: 'repeat(4, minmax(0,1fr))', lg: 'repeat(6, minmax(0,1fr))' },
    lg: { xs: 'repeat(1, minmax(0,1fr))', sm: 'repeat(2, minmax(0,1fr))', md: 'repeat(3, minmax(0,1fr))', lg: 'repeat(4, minmax(0,1fr))' },
  }[gridSize];

  return (
    <Box>
      {/* ── Baris pencarian ── */}
      <Box sx={{ mb: 2, display: 'flex', gap: 1.5, alignItems: 'center' }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Cari produk atau scan barcode… (F2)"
          value={searchTerm}
          onChange={onSearchChange}
          onKeyDown={onSearchKeyDown}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <QrCodeScannerIcon sx={{ color: 'text.secondary', fontSize: 18, opacity: 0.5 }} />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: 'background.paper',
              borderRadius: 2.5,
            },
          }}
        />

        {/* Toggle ukuran grid */}
        <ToggleButtonGroup
          value={gridSize}
          exclusive
          size="small"
          onChange={(_, val) => val && setGridSize(val)}
          sx={{ flexShrink: 0, '& .MuiToggleButton-root': { px: 1.25, py: 0.75, border: '1px solid', borderColor: 'divider', borderRadius: 2 } }}
        >
          <Tooltip title="Grid kecil">
            <ToggleButton value="sm"><ViewListRoundedIcon fontSize="small" /></ToggleButton>
          </Tooltip>
          <Tooltip title="Grid sedang">
            <ToggleButton value="md"><GridViewRoundedIcon fontSize="small" /></ToggleButton>
          </Tooltip>
        </ToggleButtonGroup>
      </Box>

      {/* ── Filter kategori ── */}
      {categories.length > 0 && (
        <Box
          sx={{
            display: 'flex',
            gap: 0.75,
            flexWrap: 'wrap',
            mb: 2,
          }}
        >
          <Chip
            label={`Semua (${products.length})`}
            onClick={() => setActiveCategory('')}
            color={activeCategory === '' ? 'primary' : 'default'}
            variant={activeCategory === '' ? 'filled' : 'outlined'}
            size="small"
            sx={{ fontWeight: 600, fontSize: 11 }}
          />
          {categories.map(({ name, count }) => (
            <Chip
              key={name}
              label={`${name} (${count})`}
              onClick={() => setActiveCategory(name === activeCategory ? '' : name)}
              color={activeCategory === name ? 'primary' : 'default'}
              variant={activeCategory === name ? 'filled' : 'outlined'}
              size="small"
              sx={{ fontWeight: 600, fontSize: 11 }}
            />
          ))}
        </Box>
      )}

      {/* ── Info jumlah hasil ── */}
      {searchTerm || activeCategory ? (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
          {filteredProducts.length} produk ditemukan
          {activeCategory ? ` di kategori "${activeCategory}"` : ''}
          {searchTerm ? ` untuk "${searchTerm}"` : ''}
        </Typography>
      ) : null}

      {/* ── Loading skeleton ── */}
      {disabled ? (
        <Box sx={{ display: 'grid', gridTemplateColumns: gridCols, gap: 1.5 }}>
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={160} sx={{ borderRadius: 3 }} />
          ))}
        </Box>
      ) : filteredProducts.length ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: gridCols,
            gap: 1.5,
            overflowY: 'auto',
            maxHeight: { xs: '55vh', md: '62vh' },
            pr: 0.5,
          }}
        >
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.product_id || product.id}
              product={product}
              onAdd={onAddProduct}
              disabled={disabled}
            />
          ))}
        </Box>
      ) : (
        <Box
          sx={{
            py: 6,
            textAlign: 'center',
            border: '2px dashed',
            borderColor: 'divider',
            borderRadius: 3,
            mt: 1,
          }}
        >
          <Inventory2OutlinedIcon sx={{ color: 'text.secondary', fontSize: 42, mb: 1.5, opacity: 0.6 }} />
          <Typography variant="subtitle1" fontWeight={700}>
            Produk tidak ditemukan
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Coba kata kunci, barcode, atau filter kategori yang lain.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ProductCatalog;