'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as Y from 'yjs';
import { HocuspocusProvider } from '@hocuspocus/provider';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import type { Block } from '@blocknote/core';
import { ko } from '@blocknote/core/locales';
import '@blocknote/mantine/style.css';

interface CollaborativeEditorInnerProps {
  spaceId: string;
  okrId: string;
  initialContent: Block[] | null;
  onChange?: (blocks: Block[]) => void;
  userName: string;
  userColor: string;
}

async function fetchToken(spaceId: string, okrId: string): Promise<string> {
  const res = await fetch(`/api/auth/collab-token?spaceId=${spaceId}&okrId=${okrId}`);
  if (!res.ok) throw new Error('Failed to fetch collab token');
  const data = await res.json();
  return data.token;
}

// Inner component: only rendered when provider is ready
function EditorWithProvider({
  provider,
  doc,
  initialContent,
  onChange,
  userName,
  userColor,
  status,
}: {
  provider: HocuspocusProvider;
  doc: Y.Doc;
  initialContent: Block[] | null;
  onChange?: (blocks: Block[]) => void;
  userName: string;
  userColor: string;
  status: string;
}) {
  const initializedRef = useRef(false);
  const fragment = doc.getXmlFragment('document-store');

  const editor = useCreateBlockNote({
    collaboration: {
      provider: provider as any,
      fragment,
      user: { name: userName, color: userColor },
    },
    dictionary: ko,
  });

  // Migrate initial content into empty Yjs doc after first sync
  useEffect(() => {
    if (initializedRef.current) return;

    const handleSync = () => {
      const meta = doc.getMap('meta');
      if (fragment.length === 0 && !meta.get('initialized') && initialContent?.length) {
        doc.transact(() => {
          meta.set('initialized', true);
        });
        editor.replaceBlocks(editor.document, initialContent);
      }
      initializedRef.current = true;
    };

    if (provider.isSynced) {
      handleSync();
    } else {
      provider.on('synced', handleSync);
      return () => {
        provider.off('synced', handleSync);
      };
    }
  }, [doc, fragment, provider, editor, initialContent]);

  const handleChange = useCallback(() => {
    onChange?.(editor.document);
  }, [editor, onChange]);

  return (
    <div className="relative">
      {status === 'connecting' && (
        <div className="absolute right-2 top-2 z-10 rounded bg-yellow-100 px-2 py-1 text-xs text-yellow-700">
          연결 중...
        </div>
      )}
      {status === 'disconnected' && (
        <div className="absolute right-2 top-2 z-10 rounded bg-red-100 px-2 py-1 text-xs text-red-700">
          연결 끊김
        </div>
      )}
      <BlockNoteView
        editor={editor}
        onChange={handleChange}
        theme="light"
      />
    </div>
  );
}

// Outer component: manages provider lifecycle in useEffect
export default function CollaborativeEditorInner({
  spaceId,
  okrId,
  initialContent,
  onChange,
  userName,
  userColor,
}: CollaborativeEditorInnerProps) {
  const [status, setStatus] = useState<string>('connecting');
  const [ready, setReady] = useState(false);

  const collabUrl = process.env.NEXT_PUBLIC_COLLAB_URL ?? 'ws://localhost:3005';
  const room = `okr:${spaceId}:${okrId}`;

  // Stable refs that persist across strict mode remounts
  const docRef = useRef<Y.Doc | null>(null);
  const providerRef = useRef<HocuspocusProvider | null>(null);

  useEffect(() => {
    const doc = new Y.Doc();
    const provider = new HocuspocusProvider({
      url: collabUrl,
      name: room,
      document: doc,
      token: () => fetchToken(spaceId, okrId),
      onStatus({ status: s }) {
        setStatus(s);
      },
    });

    docRef.current = doc;
    providerRef.current = provider;
    setReady(true);

    return () => {
      provider.destroy();
      doc.destroy();
      docRef.current = null;
      providerRef.current = null;
      setReady(false);
    };
  }, [collabUrl, room, spaceId, okrId]);

  if (!ready || !providerRef.current || !docRef.current) {
    return (
      <div className="flex items-center justify-center py-8 text-sm text-gray-400">
        연결 중...
      </div>
    );
  }

  return (
    <EditorWithProvider
      provider={providerRef.current}
      doc={docRef.current}
      initialContent={initialContent}
      onChange={onChange}
      userName={userName}
      userColor={userColor}
      status={status}
    />
  );
}
