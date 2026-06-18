export interface FieldMeta {
  id: string;
  name: string;
  type: number;
}

export interface AttachmentItem {
  name: string;
  url: string;
  previewUrl?: string;
  tmpUrl?: string;
}

export interface RecordFields {
  [fieldId: string]: any;
}
