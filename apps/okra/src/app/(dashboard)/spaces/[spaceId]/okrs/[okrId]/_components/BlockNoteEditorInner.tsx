'use client';

import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import type { Block } from '@blocknote/core';
import { ko } from '@blocknote/core/locales';
import '@blocknote/mantine/style.css';

interface BlockNoteEditorInnerProps {
  initialContent?: Block[];
  onChange?: (blocks: Block[]) => void;
  editable?: boolean;
}

export default function BlockNoteEditorInner({
  initialContent,
  onChange,
  editable = true,
}: BlockNoteEditorInnerProps) {
  const editor = useCreateBlockNote({
    initialContent: initialContent && initialContent.length > 0 ? initialContent : undefined,
    dictionary: ko,
  });

  return (
    <BlockNoteView
      editor={editor}
      editable={editable}
      onChange={() => {
        onChange?.(editor.document);
      }}
      theme="light"
    />
  );
}
