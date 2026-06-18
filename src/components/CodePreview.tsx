import { Box, IconButton, Tooltip } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

interface Props {
  content: string;
  language: string;
}

export default function CodePreview({ content, language }: Props) {
  const handleCopy = () => {
    navigator.clipboard.writeText(content);
  };

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
        <Box>{language}</Box>
        <Tooltip title="复制"><IconButton size="small" onClick={handleCopy}><ContentCopyIcon fontSize="small" /></IconButton></Tooltip>
      </Box>
      <Box flex={1} overflow="auto">
        <pre style={{ margin: 0, padding: 16, background: '#1e1e1e', color: '#d4d4d4', overflow: 'auto', fontFamily: 'Consolas, Monaco, monospace', fontSize: 13, lineHeight: 1.5 }}>
          {content}
        </pre>
      </Box>
    </Box>
  );
}
