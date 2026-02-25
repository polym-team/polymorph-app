'use client';

import dynamic from 'next/dynamic';
import type { Block } from '@blocknote/core';

const Editor = dynamic(() => import('./BlockNoteEditorInner'), { ssr: false });

interface BlockNoteEditorProps {
  initialContent?: Block[];
  onChange?: (blocks: Block[]) => void;
  editable?: boolean;
}

export function BlockNoteEditor({
  initialContent,
  onChange,
  editable = true,
}: BlockNoteEditorProps) {
  return <Editor initialContent={initialContent} onChange={onChange} editable={editable} />;
}
