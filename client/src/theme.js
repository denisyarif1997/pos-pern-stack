import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#0F766E', dark: '#115E59', light: '#CCFBF1' },
    secondary: { main: '#334155' },
    background: { default: '#F5F7FA', paper: '#FFFFFF' },
    text: { primary: '#172B4D', secondary: '#64748B' },
    divider: '#E8EDF3',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700, color: '#172B4D', letterSpacing: '-0.03em' },
    h6: { fontWeight: 700, color: '#172B4D' },
    subtitle1: { fontWeight: 600, color: '#172B4D' },
    subtitle2: { fontWeight: 600, color: '#64748B' },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#FFFFFF',
          boxShadow: '0 2px 8px rgba(23, 43, 77, 0.05)',
          borderRadius: 14,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#FFFFFF',
          border: '1px solid #E8EDF3',
          boxShadow: '0 2px 8px rgba(23, 43, 77, 0.05)',
          borderRadius: 14,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(15, 118, 110, 0.18)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          color: '#64748B',
          fontWeight: 600,
          backgroundColor: '#F8FAFC',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
        },
      },
    },
  },
});

export default theme;
