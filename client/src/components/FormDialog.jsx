import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
} from '@mui/material';

const FormDialog = ({ open, onClose, onSubmit, title, fields, initialValues, loading }) => {
  const [values, setValues] = React.useState({});

  React.useEffect(() => {
    if (open) {
      setValues(initialValues || {});
    }
  }, [open, initialValues]);

  const handleChange = (field) => (e) => {
    setValues((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(values);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: 'background.paper',
          border: 'none',
          boxShadow: '0px 18px 40px rgba(112, 144, 176, 0.12)',
        },
      }}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ color: 'text.primary', fontWeight: 700 }}>{title}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {fields.map((field) => (
              <TextField
                key={field.name}
                fullWidth
                label={field.label}
                type={field.select ? undefined : field.type || 'text'}
                value={values[field.name] ?? ''}
                onChange={handleChange(field.name)}
                required={field.required !== false}
                multiline={field.multiline}
                rows={field.rows}
                select={Boolean(field.select)}
                slotProps={{
                  input: { sx: { borderRadius: 2 } },
                }}
              >
                {field.select &&
                  field.options?.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
              </TextField>
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={onClose} sx={{ color: 'text.secondary', fontWeight: 600 }}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              borderRadius: 2,
              px: 3,
            }}
          >
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default FormDialog;