import { useState } from 'react';
import { Box, IconButton, Tooltip, Alert } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import RefreshIcon from '@mui/icons-material/Refresh';

interface Props {
  url: string;
  title?: string;
}

export default function WebPreview({ url, title }: Props) {
  const [key, setKey] = useState(0);
  const [error, setError] = useState(false);

  return (
    <Box display="flex" flexDirection="column" height="100%">
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        px={2}
        py={1}
        borderBottom="1px solid #e8e8e8"
        bgcolor="#fafafa"
      >
        <Box sx={{ maxWidth: '70%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {title || url}
        </Box>
        <Box>
          <Tooltip title="刷新"><IconButton size="small" onClick={() => { setError(false); setKey(k => k + 1); }}><RefreshIcon fontSize="small" /></IconButton></Tooltip>
          <Tooltip title="新窗口打开"><IconButton size="small" onClick={() => window.open(url, '_blank')}><OpenInNewIcon fontSize="small" /></IconButton></Tooltip>
        </Box>
      </Box>
      <Box flex={1} overflow="hidden">
        {error ? (
          <Box p={2}>
            <Alert severity="warning">
              该网站禁止 iframe 嵌入，<a href={url} target="_blank" rel="noreferrer">点击这里打开</a>
            </Alert>
          </Box>
        ) : (
          <iframe
            key={key}
            src={url}
            style={{ width: '100%', height: '100%', border: 'none' }}
            title={title || url}
            onError={() => setError(true)}
            sandbox="allow-scripts allow-same-origin allow-popups"
          />
        )}
      </Box>
    </Box>
  );
}
