import { useMemo, useState, useEffect } from 'react';
import { Box, Tabs, Tab, IconButton, Tooltip, Typography } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ImageIcon from '@mui/icons-material/Image';
import ArticleIcon from '@mui/icons-material/Article';
import LanguageIcon from '@mui/icons-material/Language';
import DataObjectIcon from '@mui/icons-material/DataObject';
import CodeIcon from '@mui/icons-material/Code';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import { CellData } from '../hooks/useSelectedCell';
import { resolvePreview, PreviewType } from '../utils/previewResolver';
import MarkdownPreview from './MarkdownPreview';
import ImagePreview from './ImagePreview';
import WebPreview from './WebPreview';
import JsonXmlPreview from './JsonXmlPreview';
import CodePreview from './CodePreview';

interface Props {
  cell: CellData;
}

const TAB_MAIN = 'main';
const TAB_ATTACH = 'attach';

function getIconByType(type: PreviewType) {
  switch (type) {
    case 'image': return <ImageIcon fontSize="small" />;
    case 'markdown': return <ArticleIcon fontSize="small" />;
    case 'webpage': return <LanguageIcon fontSize="small" />;
    case 'json':
    case 'xml': return <DataObjectIcon fontSize="small" />;
    case 'code': return <CodeIcon fontSize="small" />;
    default: return <TextFieldsIcon fontSize="small" />;
  }
}

/** 判断是否为附件类型数据（数组或单个对象） */
function isAttachmentData(value: any): boolean {
  if (Array.isArray(value) && value.length > 0) {
    const first = value[0];
    if (typeof first === 'string') {
      return /^https?:\/\/.+/i.test(first);
    }
    return !!(first?.url || first?.tmpUrl || first?.type === 'attachment' || first?.previewUrl || first?.name);
  }
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return !!(value.url || value.tmpUrl || value.type === 'attachment' || value.previewUrl || value.name);
  }
  return false;
}

export default function CellPreview({ cell }: Props) {
  const [tab, setTab] = useState(TAB_MAIN);
  const [imgIndex, setImgIndex] = useState(0);

  // 当字段变化时重置状态
  useEffect(() => {
    setTab(TAB_MAIN);
    setImgIndex(0);
  }, [cell.fieldId, cell.recordId]);

  const resolved = useMemo(() => resolvePreview(cell.fieldName, cell.value), [cell]);

  // 附件类型：拆分为主图和附件列表
  const isAttachment = isAttachmentData(cell.value);
  const attachments = Array.isArray(cell.value) ? cell.value : (cell.value ? [cell.value] : []);
  const images = attachments.filter((a: any) => {
    const name = typeof a === 'string' ? '' : (a.name || '');
    const url = typeof a === 'string' ? a : (a.url || a.tmpUrl || '');
    const urlName = url.split('?')[0].split('/').pop() || '';
    const checkName = name || urlName;
    return /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)$/i.test(checkName);
  });

  // 如果isAttachment为true但没有images，直接显示所有附件为图片
  if (isAttachment && attachments.length > 0) {
    const imagesToShow = images.length > 0 ? images : attachments;
    const currentImg = imagesToShow[imgIndex] || imagesToShow[0];
    const total = imagesToShow.length;

    return (
      <Box display="flex" flexDirection="column" height="100%">
        {/* 顶部 Tab + 分页 */}
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          px={1.5}
          py={0.5}
          borderBottom="1px solid #e8e8e8"
          flexShrink={0}
        >
          <Tabs value={tab} onChange={(_, v) => setTab(v)} textColor="primary" indicatorColor="primary" sx={{ minHeight: 36 }}>
            <Tab label="主图" value={TAB_MAIN} sx={{ minHeight: 36, px: 1.5, py: 0.5 }} />
            <Tab label="附件" value={TAB_ATTACH} sx={{ minHeight: 36, px: 1.5, py: 0.5 }} />
          </Tabs>
          <Box display="flex" alignItems="center" gap={0.5}>
            <IconButton size="small" disabled={imgIndex <= 0} onClick={() => setImgIndex(i => i - 1)}>
              <ChevronLeftIcon fontSize="small" />
            </IconButton>
            <Typography variant="caption" sx={{ minWidth: 30, textAlign: 'center' }}>
              {imgIndex + 1}/{total}
            </Typography>
            <IconButton size="small" disabled={imgIndex >= total - 1} onClick={() => setImgIndex(i => i + 1)}>
              <ChevronRightIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {/* 文件信息栏 */}
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          px={1.5}
          py={0.5}
          borderBottom="1px solid #e8e8e8"
          flexShrink={0}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <ImageIcon fontSize="small" color="action" />
            <Box>
              <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                {typeof currentImg === 'string' ? '图片' : (currentImg?.name || '附件')}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {typeof currentImg !== 'string' && currentImg?.size ? `${(currentImg.size / 1024).toFixed(2)} KB` : ''} · 图片
              </Typography>
            </Box>
          </Box>
          <Tooltip title="下载">
            <IconButton
              size="small"
              onClick={() => {
                const a = document.createElement('a');
                a.href = typeof currentImg === 'string' ? currentImg : (currentImg?.url || currentImg?.previewUrl || currentImg?.tmpUrl || '');
                a.download = typeof currentImg === 'string' ? 'download' : (currentImg?.name || 'download');
                a.click();
              }}
            >
              <DownloadIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        {/* 图片预览 */}
        <Box flex={1} overflow="auto" display="flex" justifyContent="center" alignItems="center" p={1} minHeight={0}>
          <ImagePreview
            url={typeof currentImg === 'string' ? currentImg : (currentImg?.url || currentImg?.previewUrl || currentImg?.tmpUrl || '')}
            title={typeof currentImg === 'string' ? '图片' : currentImg?.name}
          />
        </Box>
      </Box>
    );
  }

  // 非附件类型：直接根据 resolved 类型显示预览
  return (
    <Box display="flex" flexDirection="column" height="100%">
      <Box
        display="flex"
        alignItems="center"
        gap={1}
        px={2}
        py={1}
        borderBottom="1px solid #e8e8e8"
        bgcolor="#fafafa"
        flexShrink={0}
      >
        {getIconByType(resolved.type)}
        <Typography variant="body2" fontWeight={500}>
          {cell.fieldName}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
          {resolved.type}
        </Typography>
      </Box>
      <Box flex={1} overflow="auto" minHeight={0}>
        {resolved.type === 'markdown' && <MarkdownPreview content={resolved.content} url={resolved.url} />}
        {resolved.type === 'image' && <ImagePreview url={resolved.url!} title={resolved.title} />}
        {resolved.type === 'webpage' && <WebPreview url={resolved.url!} title={resolved.title} />}
        {(resolved.type === 'json' || resolved.type === 'xml') && <JsonXmlPreview content={resolved.content} type={resolved.type} />}
        {resolved.type === 'code' && <CodePreview content={resolved.content} language="text" />}
        {resolved.type === 'text' && (
          <Box p={2} pb={4}>
            <Typography variant="body1" whiteSpace="pre-wrap">{resolved.content}</Typography>
          </Box>
        )}
        {resolved.type === 'unsupported' && (
          <Box p={2}>
            <Typography variant="body2" color="text.secondary">该字段类型暂不支持预览</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}
