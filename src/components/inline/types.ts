import React from 'react';

export interface InlineTextProps {
  field: string;
  value: string;
  collection: string;
  itemId: string;
  canEdit?: boolean;
  children?: React.ReactNode;
}

export interface InlineRichTextProps {
  field: string;
  value: string;
  collection: string;
  itemId: string;
  canEdit?: boolean;
  richText?: boolean;
  children?: React.ReactNode;
}

export interface InlineImageProps {
  field: string;
  value: string;
  collection: string;
  itemId: string;
  canEdit?: boolean;
  children?: React.ReactNode;
}

export interface InlineSelectProps {
  field: string;
  value: string;
  collection: string;
  itemId: string;
  options: SelectOption[];
  canEdit?: boolean;
  children?: React.ReactNode;
}

export interface SelectOption {
  value: string;
  label: string;
}
