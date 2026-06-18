import { useEffect, useState, useCallback } from 'react';
import { bitable } from '@lark-base-open/js-sdk';

export interface CellData {
  fieldId: string;
  fieldName: string;
  fieldType: number;
  recordId: string;
  value: any;
}

export function useSelectedCell() {
  const [cell, setCell] = useState<CellData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCell = useCallback(async (recordId: string, fieldId: string) => {
    try {
      const table = await bitable.base.getActiveTable();
      const fieldMeta = await table.getFieldMetaById(fieldId);
      
      // 使用 table.getCellValue 获取正确格式的值（附件字段等需要此方法）
      const value = await (table as any).getCellValue(fieldId, recordId);
      
      setCell({
        fieldId,
        fieldName: fieldMeta.name,
        fieldType: fieldMeta.type,
        recordId,
        value,
      });
    } catch (e) {
      console.error('loadCell error', e);
      // 降级：尝试用 record.fields 获取
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

        // 监听选中变化
        unsub = bitable.base.onSelectionChange?.(async (event) => {
          const { recordId, fieldId } = event.data;
          if (recordId && fieldId) {
            await loadCell(recordId, fieldId);
          } else {
            setCell(null);
          }
        });

        // 获取当前选中的单元格
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
