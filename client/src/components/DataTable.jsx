import React from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const DataTable = ({
  rows,
  columns,
  loading,
  onEdit,
  onDelete,
  onCustomAction,
  customActionLabel = 'Action',
  customActionIcon,
  customActionDisabled,
  getRowId,
}) => {
  const actionColumn = {
    field: 'actions',
    headerName: 'Actions',
    width: 112,
    sortable: false,
    renderCell: (params) => (
      <Box>
        {onEdit && (
          <Tooltip title="Edit">
            <IconButton size="small" aria-label="Edit row" onClick={() => onEdit(params.row)} sx={{ color: 'primary.main' }}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        {onDelete && (
          <Tooltip title="Delete">
            <IconButton size="small" aria-label="Delete row" onClick={() => onDelete(params.row)} sx={{ color: 'error.main' }}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        {onCustomAction && (
          <Tooltip title={customActionLabel}>
            <span>
              <IconButton
                size="small"
                aria-label={customActionLabel}
                onClick={() => onCustomAction(params.row)}
                disabled={customActionDisabled?.(params.row)}
                sx={{ color: 'primary.main' }}
              >
                {customActionIcon}
              </IconButton>
            </span>
          </Tooltip>
        )}
      </Box>
    ),
  };

  const displayColumns = (onEdit || onDelete || onCustomAction) ? [...columns, actionColumn] : columns;

  return (
    <Box sx={{ width: '100%', minWidth: 0, height: { xs: 430, sm: 500 } }}>
      <DataGrid
        rows={rows}
        columns={displayColumns}
        loading={loading}
        getRowId={getRowId}
        pageSizeOptions={[10, 25, 50]}
        initialState={{
          pagination: { paginationModel: { pageSize: 10 } },
        }}
        localeText={{
          noRowsLabel: 'No data available',
          noResultsOverlayLabel: 'No matching results',
        }}
        disableRowSelectionOnClick
        sx={{
          border: 'none',
          borderRadius: 3.5,
          backgroundColor: 'background.paper',
          boxShadow: '0 2px 8px rgba(23, 43, 77, 0.05)',
          '& .MuiDataGrid-cell': {
            color: 'text.primary',
            borderBottom: '1px solid',
            borderColor: 'divider',
            fontSize: '0.875rem',
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: '#F8FAFC',
            color: 'text.primary',
            fontWeight: 700,
            borderBottom: '1px solid #E8EDF3',
            fontSize: '0.875rem',
          },
          '& .MuiDataGrid-footerContainer': {
            borderTop: '1px solid #E8EDF3',
            color: 'text.secondary',
          },
          '& .MuiTablePagination-root': {
            color: 'text.secondary',
          },
          '& .MuiDataGrid-row:hover': {
            backgroundColor: 'rgba(15, 118, 110, 0.035)',
          },
          '& .MuiDataGrid-columnSeparator': {
            color: '#E8EDF3',
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