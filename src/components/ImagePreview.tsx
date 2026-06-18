import { useState } from 'react';
import { Box, IconButton, Tooltip, Alert } from '@mui/material';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import RefreshIcon from '@mui/icons-material/Refresh';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

interface Props {
  url: string;
  title?: string;
}

export default function ImagePreview({ url, title }: Props) {
  const [scale, setScale] = useState(1);
  const [key, setKey] = useState(0);
  const [loadError, setLoadError] = useState(false);

  if (!url) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <Alert severity="warning">图片 URL 为空</Alert>
      </Box>
    );
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      height="100%"
      overflow="hidden"
    >
      {/* 工具栏 */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="flex-end"
        gap={0.5}
        px={1}
        py={0.5}
        borderBottom="1px solid #e8e8e8"
        bgcolor="#fafafa"
      >
        <Tooltip title="放大"><IconButton size="small" onClick={() => setScale(s => Math.min(s + 0.2, 3))}><ZoomInIcon fontSize="small" /></IconButton></Tooltip>
        <Tooltip title="缩小"><IconButton size="small" onClick={() => setScale(s => Math.max(s - 0.2, 0.2))}><ZoomOutIcon fontSize="small" /></IconButton></Tooltip>
        <Tooltip title="刷新"><IconButton size="small" onClick={() => { setLoadError(false); setKey(k => k + 1); }}><RefreshIcon fontSize="small" /></IconButton></Tooltip>
        <Tooltip title="新窗口打开"><IconButton size="small" onClick={() => window.open(url, '_blank')}><OpenInNewIcon fontSize="small" /></IconButton></Tooltip>
      </Box>

      {/* 图片 */}
      <Box
        flex={1}
        overflow="auto"
        display="flex"
        justifyContent="center"
        alignItems="center"
        p={2}
      >
        {loadError ? (
          <Alert severity="warning">
            图片加载失败，<a href={url} target="_blank" rel="noreferrer">点击打开</a>
          </Alert>
        ) : (
          <img
            key={key}
            src={url}
            alt={title || 'preview'}
            crossOrigin="anonymous"
            onError={() => setLoadError(true)}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              transform: `scale(${scale})`,
              transition: 'transform 0.2s',
            }}
          />
        )}
      </Box>
    </Box>
  );
}
