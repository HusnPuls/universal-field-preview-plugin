import { useMemo } from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import JsonView from 'react18-json-view';
import 'react18-json-view/style.css';
import formatXml from 'xml-formatter';

interface Props {
  content: string;
  type: 'json' | 'xml';
}

export default function JsonXmlPreview({ content, type }: Props) {
  const formatted = useMemo(() => {
    if (type === 'xml') {
      try {
        return formatXml(content, { indentation: '  ', collapseContent: true });
      } catch {
        return content;
      }
    }
    try {
      return JSON.parse(content);
    } catch {
      return content;
    }
  }, [content, type]);

  const handleCopy = () => {
    const text = typeof formatted === 'string' ? formatted : JSON.stringify(formatted, null, 2);
    navigator.clipboard.writeText(text);
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
        <Box>{type.toUpperCase()} 预览</Box>
        <Tooltip title="复制"><IconButton size="small" onClick={handleCopy}><ContentCopyIcon fontSize="small" /></IconButton></Tooltip>
      </Box>
      <Box flex={1} overflow="auto" p={2}>
        {type === 'json' && typeof formatted === 'object' ? (
          <JsonView src={formatted} theme="default" />
        ) : (
          <pre style={{ margin: 0, padding: 16, background: '#1e1e1e', color: '#d4d4d4', overflow: 'auto', fontFamily: 'Consolas, Monaco, monospace', fontSize: 13, lineHeight: 1.5 }}>
            {typeof formatted === 'string' ? formatted : JSON.stringify(formatted, null, 2)}
          </pre>
        )}
      </Box>
    </Box>
  );
}
