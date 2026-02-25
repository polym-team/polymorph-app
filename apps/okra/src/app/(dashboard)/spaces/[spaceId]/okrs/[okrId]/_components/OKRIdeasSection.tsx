'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { Button } from '@package/ui';
import type { IdeaData, OKRStatus } from './types';
import { IdeaItem } from './IdeaItem';
import { IdeaForm } from './IdeaForm';

interface OKRIdeasSectionProps {
  ideas: IdeaData[];
  okrStatus: OKRStatus;
  spaceId: string;
  okrId: string;
}

export function OKRIdeasSection({ ideas: initialIdeas, okrStatus, spaceId, okrId }: OKRIdeasSectionProps) {
  const router = useRouter();
  const [ideas, setIdeas] = useState(initialIdeas);
  const [prevInitial, setPrevInitial] = useState(initialIdeas);
  const [isAdding, setIsAdding] = useState(false);
  const isPlanning = okrStatus === 'PLANNING';

  if (prevInitial !== initialIdeas) {
    setPrevInitial(initialIdeas);
    setIdeas(initialIdeas);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleMutate = () => {
    router.refresh();
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = ideas.findIndex((i) => i.id === active.id);
    const newIndex = ideas.findIndex((i) => i.id === over.id);
    const reordered = arrayMove(ideas, oldIndex, newIndex);

    setIdeas(reordered);

    await fetch(`/api/spaces/${spaceId}/okrs/${okrId}/ideas/reorder`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderedIds: reordered.map((i) => i.id) }),
    });

    router.refresh();
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">아이디어 ({initialIdeas.length})</h2>
        {isPlanning && !isAdding && (
          <Button variant="outline" onClick={() => setIsAdding(true)}>
            추가
          </Button>
        )}
      </div>

      {isAdding && (
        <div className="mt-3">
          <IdeaForm
            spaceId={spaceId}
            okrId={okrId}
            onSave={() => {
              setIsAdding(false);
              handleMutate();
            }}
            onCancel={() => setIsAdding(false)}
          />
        </div>
      )}

      {ideas.length === 0 && !isAdding ? (
        <p className="mt-3 text-sm text-gray-400">아직 아이디어가 없습니다.</p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={ideas.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            <ul className="mt-3 space-y-3">
              {ideas.map((idea) => (
                <IdeaItem
                  key={idea.id}
                  idea={idea}
                  spaceId={spaceId}
                  okrId={okrId}
                  isPlanning={isPlanning}
                  onMutate={handleMutate}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
