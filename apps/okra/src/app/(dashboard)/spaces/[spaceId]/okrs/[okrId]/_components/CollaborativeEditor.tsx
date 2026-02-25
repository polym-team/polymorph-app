'use client';

import dynamic from 'next/dynamic';
import type { Block } from '@blocknote/core';

const Editor = dynamic(() => import('./CollaborativeEditorInner'), { ssr: false });

interface CollaborativeEditorProps {
  spaceId: string;
  okrId: string;
  initialContent: Block[] | null;
  onChange?: (blocks: Block[]) => void;
  userName: string;
  userColor: string;
}

export function CollaborativeEditor(props: CollaborativeEditorProps) {
  return <Editor {...props} />;
}
