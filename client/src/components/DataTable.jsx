import React from 'react';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const DataTable = ({ rows, columns, loading, onEdit, onDelete, getRowId }) => {
  const actionColumn = {
    field: 'actions',
    headerName: 'Actions',
    width: 120,
    sortable: false,
    renderCell: (params) => (
      <Box>
        {onEdit && (
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => onEdit(params.row)} sx={{ color: '#90caf9' }}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        {onDelete && (
          <Tooltip title="Delete">
            <IconButton size="small" onClick={() => onDelete(params.row)} sx={{ color: '#f48fb1' }}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    ),
  };

  const displayColumns = (onEdit || onDelete) ? [...columns, actionColumn] : columns;

  return (
    <Box sx={{ width: '100%', height: 500 }}>
      <DataGrid
        rows={rows}
        columns={displayColumns}
        loading={loading}
        getRowId={getRowId}
        pageSizeOptions={[10, 25, 50]}
        initialState={{
          pagination: { paginationModel: { pageSize: 10 } },
        }}
        disableRowSelectionOnClick
        sx={{
          border: 'none',
          borderRadius: 4,
          backgroundColor: 'background.paper',
          boxShadow: '0px 18px 40px rgba(112, 144, 176, 0.12)',
          '& .MuiDataGrid-cell': {
            color: 'text.secondary',
            borderBottom: '1px solid rgba(0,0,0,0.05)',
            fontSize: '0.875rem',
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: '#F4F7FE',
            color: 'text.primary',
            fontWeight: 700,
            borderBottom: 'none',
            fontSize: '0.875rem',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
          },
          '& .MuiDataGrid-footerContainer': {
            borderTop: '1px solid rgba(0,0,0,0.05)',
            color: 'text.secondary',
          },
          '& .MuiTablePagination-root': {
            color: 'text.secondary',
          },
          '& .MuiDataGrid-row:hover': {
            backgroundColor: 'rgba(67, 24, 255, 0.04)',
          },
          '& .MuiDataGrid-columnSeparator': {
            color: 'rgba(0,0,0,0.05)',
          },
          '& .MuiDataGrid-menuIconButton, & .MuiDataGrid-sortIcon': {
            color: 'text.secondary',
          },
        }}
      />
    </Box>
  );
};

export default DataTable;