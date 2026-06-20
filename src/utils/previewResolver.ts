// 飞书字段类型常量
export enum FieldType {
  Text = 1,
  Number = 2,
  SingleSelect = 3,
  MultiSelect = 4,
  DateTime = 5,
  Checkbox = 7,
  User = 11,
  Phone = 13,
  URL = 15,
  Attachment = 17,
  SingleLink = 18,
  Lookup = 19,
  Formula = 20,
  DuplexLink = 21,
  Location = 22,
  GroupChat = 23,
  AutoNumber = 1001,
  Barcode = 1002,
  Progress = 1003,
  Rating = 1004,
  Currency = 1005,
}

export type PreviewType =
  | 'markdown'
  | 'image'
  | 'webpage'
  | 'json'
  | 'xml'
  | 'code'
  | 'text'
  | 'unsupported';

export interface ResolvedPreview {
  type: PreviewType;
  content: string;
  url?: string;
  title?: string;
}

function isMarkdown(str: string): boolean {
  const mdPatterns = [
    /^#\s+/m,
    /^\*\s+/m,
    /^-\s+/m,
    /^\*\*.*\*\*/m,
    /^\[.*\]\(.*\)/m,
    /^```/m,
    /^>\s+/m,
    /^\|.*\|/m,
    /^---/m,
    /^__.*__/m,
  ];
  return mdPatterns.some(p => p.test(str));
}

function isJson(str: string): boolean {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

function isXml(str: string): boolean {
  return str.trim().startsWith('<?xml') || str.trim().startsWith('<') && str.includes('</');
}

function looksLikeUrl(str: string): boolean {
  return /^https?:\/\/.+/i.test(str.trim());
}

/** 提取飞书文本字段的纯文本内容 */
function extractFeishuText(value: any): string {
  // 数组格式: [{type: "text", text: "..."}]
  if (Array.isArray(value)) {
    return value
      .filter((item: any) => item && item.type === 'text' && item.text)
      .map((item: any) => item.text)
      .join('\n');
  }
  // 对象格式: {type: "text", text: "..."}
  if (value && typeof value === 'object' && value.type === 'text' && value.text) {
    return value.text;
  }
  return '';
}

/** 检查是否为飞书文本格式 */
function isFeishuText(value: any): boolean {
  if (Array.isArray(value) && value.length > 0 && value[0]?.type === 'text') {
    return true;
  }
  if (value && typeof value === 'object' && value.type === 'text') {
    return true;
  }
  return false;
}

/** 检查是否为附件数组（支持对象数组和字符串URL数组） */
function isAttachmentArray(value: any): boolean {
  if (!Array.isArray(value) || value.length === 0) return false;
  const first = value[0];
  if (typeof first === 'string') {
    return looksLikeUrl(first);
  }
  return !!(first?.url || first?.tmpUrl || first?.type === 'attachment' || first?.name);
}

/** 检查是否为附件对象 */
function isAttachmentObject(value: any): boolean {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  return !!(value.url || value.tmpUrl || value.type === 'attachment' || value.name);
}

export function resolvePreview(fieldName: string, value: any): ResolvedPreview {
  // 附件类型（数组）
  if (isAttachmentArray(value)) {
    const first = value[0];
    // 字符串数组（URL数组）
    if (typeof first === 'string') {
      const url = first;
      if (looksLikeUrl(url)) {
        return { type: 'webpage', content: '', url, title: fieldName };
      }
      return { type: 'text', content: url, title: fieldName };
    }
    // 对象数组
    const url = first.url || first.previewUrl || first.tmpUrl || '';
    const name = first.name || '';
    // 从URL中提取文件名用于判断类型
    const urlName = url.split('?')[0].split('/').pop() || '';
    const checkName = name || urlName;
    if (/\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)$/i.test(checkName)) {
      return { type: 'image', content: '', url, title: checkName };
    }
    if (/\.(md|markdown)$/i.test(checkName)) {
      return { type: 'markdown', content: url, url, title: checkName };
    }
    if (/\.(json)$/i.test(checkName)) {
      return { type: 'json', content: url, url, title: checkName };
    }
    if (/\.(xml)$/i.test(checkName)) {
      return { type: 'xml', content: url, url, title: checkName };
    }
    // 附件类型但无法推断：默认尝试图片预览（主图列通常是图片）
    if (first.type === 'attachment' || first.tmpUrl || first.url) {
      return { type: 'image', content: '', url, title: checkName || fieldName };
    }
    if (looksLikeUrl(url)) {
      return { type: 'webpage', content: '', url, title: checkName };
    }
    return { type: 'text', content: JSON.stringify(value, null, 2), title: checkName };
  }

  // 附件类型（单个对象）
  if (isAttachmentObject(value)) {
    const url = value.url || value.previewUrl || value.tmpUrl || '';
    const name = value.name || '';
    if (/\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)$/i.test(name)) {
      return { type: 'image', content: '', url, title: name };
    }
    if (looksLikeUrl(url)) {
      return { type: 'webpage', content: '', url, title: name };
    }
    return { type: 'text', content: JSON.stringify(value, null, 2), title: name };
  }

  // 飞书 URL 字段值格式: { type: 'url', text: '...', link: '...' }
  if (value && typeof value === 'object' && value.type === 'url') {
    const url = value.link || value.text || '';
    if (looksLikeUrl(url)) {
      return { type: 'webpage', content: '', url, title: fieldName };
    }
  }

  // 飞书 URL 字段值格式（数组）: [{ type: 'url', text: '...', link: '...' }]
  if (Array.isArray(value) && value.length > 0 && value[0]?.type === 'url') {
    const url = value[0].link || value[0].text || '';
    if (looksLikeUrl(url)) {
      return { type: 'webpage', content: '', url, title: fieldName };
    }
  }

  // 飞书文本字段: [{type: "text", text: "..."}] 或 {type: "text", text: "..."}
  if (isFeishuText(value)) {
    const text = extractFeishuText(value);
    if (text.trim()) {
      if (isMarkdown(text)) {
        return { type: 'markdown', content: text, title: fieldName };
      }
      if (isJson(text)) {
        return { type: 'json', content: text, title: fieldName };
      }
      if (isXml(text)) {
        return { type: 'xml', content: text, title: fieldName };
      }
      return { type: 'text', content: text, title: fieldName };
    }
  }

  // 纯文本/URL 类型
  let text = '';
  if (typeof value === 'string') {
    text = value;
  } else if (value !== null && value !== undefined) {
    text = JSON.stringify(value, null, 2);
  }

  text = text.trim();
  if (!text) return { type: 'unsupported', content: '' };

  if (looksLikeUrl(text)) {
    return { type: 'webpage', content: '', url: text, title: fieldName };
  }

  if (isJson(text)) {
    return { type: 'json', content: text, title: fieldName };
  }

  if (isXml(text)) {
    return { type: 'xml', content: text, title: fieldName };
  }

  if (isMarkdown(text)) {
    return { type: 'markdown', content: text, title: fieldName };
  }

  if (text.includes('\n') || text.length > 200) {
    return { type: 'code', content: text, title: fieldName };
  }

  return { type: 'text', content: text, title: fieldName };
}
