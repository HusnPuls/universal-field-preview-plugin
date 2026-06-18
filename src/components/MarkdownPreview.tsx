import { useEffect, useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { Viewer } from '@bytemd/react';
import gfm from '@bytemd/plugin-gfm';
import highlight from '@bytemd/plugin-highlight';
import breaks from '@bytemd/plugin-breaks';
import math from '@bytemd/plugin-math';
import 'bytemd/dist/index.css';
import 'github-markdown-css/github-markdown.css';
import 'highlight.js/styles/github.css';
import 'katex/dist/katex.min.css';

const plugins = [gfm(), highlight(), breaks(), math()];

interface Props {
  content: string;
  url?: string;
}

export default function MarkdownPreview({ content, url }: Props) {
  const [text, setText] = useState(content);
  const [loading, setLoading] = useState(false);

  // 当 content prop 变化时，更新内部状态
  useEffect(() => {
    setText(content);
  }, [content]);

  useEffect(() => {
    if (url && !content) {
      setLoading(true);
      fetch(url)
        .then(r => r.text())
        .then(t => setText(t))
        .catch(() => setText('// 无法加载文件内容'))
        .finally(() => setLoading(false));
    }
  }, [url, content]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <CircularProgress size={20} />
      </Box>
    );
  }

  return (
    <Box className="github-markdown-body" height="100%" overflow="auto" p={2}>
      <Viewer value={text} plugins={plugins} />
    </Box>
  );
}
