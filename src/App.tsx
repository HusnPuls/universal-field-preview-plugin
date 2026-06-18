import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import { useSelectedCell } from './hooks/useSelectedCell';
import EmptyState from './components/EmptyState';
import CellPreview from './components/CellPreview';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  const { cell, loading, error } = useSelectedCell();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress size={20} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={2}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!cell) {
    return <EmptyState />;
  }

  return (
    <ErrorBoundary>
      <CellPreview cell={cell} />
    </ErrorBoundary>
  );
}

export default App;
