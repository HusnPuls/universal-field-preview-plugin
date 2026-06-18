import { Box, Typography } from '@mui/material';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';

export default function EmptyState() {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="100vh"
      px={3}
    >
      <DescriptionOutlinedIcon
        sx={{ fontSize: 48, color: '#ddd', mb: 1.5 }}
      />
      <Typography variant="body2" color="text.secondary" align="center">
        请选择包含内容的单元格
      </Typography>
      <Typography
        variant="caption"
        color="text.disabled"
        align="center"
        sx={{ mt: 0.5, maxWidth: 260 }}
      >
        支持预览和编辑 HTML、Markdown、JSON、XML、URL链接、纯文本及附件内容
      </Typography>
    </Box>
  );
}
