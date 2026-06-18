import { Component, ReactNode } from 'react';
import { Box, Typography, Button } from '@mui/material';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Plugin Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box p={2} textAlign="center">
          <Typography variant="h6" color="error" gutterBottom>
            插件出错了
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, wordBreak: 'break-all' }}>
            {this.state.errorMessage}
          </Typography>
          <Button
            variant="contained"
            size="small"
            onClick={() => this.setState({ hasError: false, errorMessage: '' })}
          >
            重试
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}
