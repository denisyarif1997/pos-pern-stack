import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#4318FF' }, // Vibrant modern blue
    secondary: { main: '#00B5D8' }, // Vibrant teal
    background: { default: '#F4F7FE', paper: '#FFFFFF' },
    text: { primary: '#2B3674', secondary: '#A3AED0' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700, color: '#2B3674' },
    h6: { fontWeight: 700, color: '#2B3674' },
    subtitle1: { fontWeight: 600, color: '#2B3674' },
    subtitle2: { fontWeight: 600, color: '#A3AED0' },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#FFFFFF',
          boxShadow: '0px 18px 40px rgba(112, 144, 176, 0.12)',
          borderRadius: 16,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#FFFFFF',
          border: 'none',
          boxShadow: '0px 18px 40px rgba(112, 144, 176, 0.12)',
          borderRadius: 16,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 8px 16px rgba(67, 24, 255, 0.2)',
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
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 20,
          padding: '16px',
        },
      },
    },
  },
});

export default theme;
