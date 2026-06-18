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
    /^#\s+/m,           // 标题
    /^\*\s+/m,          // 列表
    /^-\s+/m,          // 列表
    /^\*\*.*\*\*/m,     // 粗体
    /^\[.*\]\(.*\)/m,   // 链接
    /^```/m,            // 代码块
    /^>\s+/m,          // 引用
    /^\|.*\|/m,         // 表格
    /^---/m,           // 分割线
    /^__.*__/m,         // 粗体
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

export function resolvePreview(fieldName: string, value: any): ResolvedPreview {
  // 附件类型
  if (Array.isArray(value) && value.length > 0 && value[0]?.url) {
    const first = value[0];
    const url = first.url || first.previewUrl || first.tmpUrl || '';
    const name = first.name || '';
    if (/\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)$/i.test(name)) {
      return { type: 'image', content: '', url, title: name };
    }
    if (/\.(md|markdown)$/i.test(name)) {
      return { type: 'markdown', content: url, url, title: name };
    }
    if (/\.(json)$/i.test(name)) {
      return { type: 'json', content: url, url, title: name };
    }
    if (/\.(xml)$/i.test(name)) {
      return { type: 'xml', content: url, url, title: name };
    }
    // 网页或通用文件
    if (looksLikeUrl(url)) {
      return { type: 'webpage', content: '', url, title: name };
    }
    return { type: 'text', content: JSON.stringify(value, null, 2), title: name };
  }

  // 文本/URL 类型
  let text = '';
  if (typeof value === 'string') {
    text = value;
  } else if (value !== null && value !== undefined) {
    text = JSON.stringify(value, null, 2);
  }

  text = text.trim();
  if (!text) return { type: 'unsupported', content: '' };

  // 纯 URL
  if (looksLikeUrl(text)) {
    return { type: 'webpage', content: '', url: text, title: fieldName };
  }

  // JSON
  if (isJson(text)) {
    return { type: 'json', content: text, title: fieldName };
  }

  // XML
  if (isXml(text)) {
    return { type: 'xml', content: text, title: fieldName };
  }

  // Markdown
  if (isMarkdown(text)) {
    return { type: 'markdown', content: text, title: fieldName };
  }

  // 默认文本/代码
  if (text.includes('\n') || text.length > 200) {
    return { type: 'code', content: text, title: fieldName };
  }

  return { type: 'text', content: text, title: fieldName };
}
