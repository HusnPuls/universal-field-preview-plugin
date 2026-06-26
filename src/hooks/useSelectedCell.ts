import { useEffect, useState, useCallback } from 'react';
import { bitable } from '@lark-base-open/js-sdk';

export interface CellData {
  fieldId: string;
  fieldName: string;
  fieldType: number;
  recordId: string;
  value: any;
}

/** 检查原始值是否为附件格式（包含 token） */
function isRawAttachment(value: any): boolean {
  if (Array.isArray(value) && value.length > 0) {
    const first = value[0];
    return first && typeof first === 'object' && 'token' in first;
  }
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return 'token' in value;
  }
  return false;
}

export function useSelectedCell() {
  const [cell, setCell] = useState<CellData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCell = useCallback(async (recordId: string, fieldId: string) => {
    try {
      const table = await bitable.base.getActiveTable();
      const fieldMeta = await table.getFieldMetaById(fieldId);
      
      let value: any;
      
      // 获取原始值（优先使用 record.fields，保留原始附件格式含 token）
      const record = await table.getRecordById(recordId);
      const rawValue = record.fields[fieldId];
      
      if (isRawAttachment(rawValue)) {
        // 附件类型：使用与原插件相同的方法获取真实 URL
        const attachments = Array.isArray(rawValue) ? rawValue : [rawValue];
        const tokens = attachments.map((a: any) => a.token).filter(Boolean);
        
        if (tokens.length > 0) {
          try {
            // 批量获取下载URL和缩略图URL（与原插件一致）
            const downloadUrls = await (table as any).getCellAttachmentUrls(tokens, fieldId, recordId);
            const thumbnailUrls = await (table as any).getCellThumbnailUrls(tokens, fieldId, recordId);
            
            value = attachments.map((item: any, i: number) => ({
              ...item,
              downloadUrl: downloadUrls[i] || null,
              thumbnailUrl: thumbnailUrls[i] || null,
              hasPermission: downloadUrls[i] !== null,
            }));
          } catch (e) {
            console.warn('批量获取附件URL失败，使用原始值:', e);
            value = rawValue;
          }
        } else {
          value = rawValue;
        }
      } else if (fieldMeta.type === 17) {
        // 字段类型是附件但原始值没有token，尝试 field.getAttachmentUrls
        const field = await (table as any).getFieldById(fieldId);
        if (field.getAttachmentUrls) {
          const urls = await field.getAttachmentUrls(recordId);
          if (Array.isArray(urls) && urls.length > 0) {
            if (typeof urls[0] === 'string') {
              value = urls.map((url: string) => ({ downloadUrl: url, thumbnailUrl: url, hasPermission: true }));
            } else {
              value = urls.map((item: any) => ({ ...item, downloadUrl: item.url || item.tmpUrl, thumbnailUrl: item.tmpUrl || item.url }));
            }
          } else {
            value = rawValue;
          }
        } else {
          value = rawValue;
        }
      } else {
        // 非附件字段：直接返回原始值
        value = rawValue;
      }
      
      setCell({
        fieldId,
        fieldName: fieldMeta.name,
        fieldType: fieldMeta.type,
        recordId,
        value,
      });
    } catch (e) {
      console.error('loadCell error', e);
      try {
        const table = await bitable.base.getActiveTable();
        const record = await table.getRecordById(recordId);
        const fieldMeta = await table.getFieldMetaById(fieldId);
        const value = record.fields[fieldId];
        setCell({
          fieldId,
          fieldName: fieldMeta.name,
          fieldType: fieldMeta.type,
          recordId,
          value,
        });
      } catch (e2) {
        console.error('fallback error', e2);
      }
    }
  }, []);

  useEffect(() => {
    let unsub: (() => void) | undefined;

    async function init() {
      try {
        setLoading(true);
        await bitable.bridge.getLanguage();

        unsub = bitable.base.onSelectionChange?.(async (event) => {
          const { recordId, fieldId } = event.data;
          if (recordId && fieldId) {
            await loadCell(recordId, fieldId);
          } else {
            setCell(null);
          }
        });

        const selection = await bitable.base.getSelection();
        if (selection.recordId && selection.fieldId) {
          await loadCell(selection.recordId, selection.fieldId);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : '初始化失败');
      } finally {
        setLoading(false);
      }
    }

    init();

    return () => {
      if (unsub) unsub();
    };
  }, [loadCell]);

  return { cell, loading, error };
}
