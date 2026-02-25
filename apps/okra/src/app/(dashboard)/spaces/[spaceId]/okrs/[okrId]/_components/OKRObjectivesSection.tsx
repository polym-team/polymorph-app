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
import type { ObjectiveData, OKRStatus, SpaceMember } from './types';
import { ObjectiveItem } from './ObjectiveItem';
import { ObjectiveForm } from './ObjectiveForm';

interface OKRObjectivesSectionProps {
  objectives: ObjectiveData[];
  okrStatus: OKRStatus;
  spaceId: string;
  okrId: string;
  spaceMembers: SpaceMember[];
}

export function OKRObjectivesSection({
  objectives: initialObjectives,
  okrStatus,
  spaceId,
  okrId,
  spaceMembers,
}: OKRObjectivesSectionProps) {
  const router = useRouter();
  const [objectives, setObjectives] = useState(initialObjectives);
  const [prevInitial, setPrevInitial] = useState(initialObjectives);
  const [isAdding, setIsAdding] = useState(false);
  const isPlanning = okrStatus === 'PLANNING';

  if (prevInitial !== initialObjectives) {
    setPrevInitial(initialObjectives);
    setObjectives(initialObjectives);
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

    const oldIndex = objectives.findIndex((o) => o.id === active.id);
    const newIndex = objectives.findIndex((o) => o.id === over.id);
    const reordered = arrayMove(objectives, oldIndex, newIndex);

    setObjectives(reordered);

    await fetch(`/api/spaces/${spaceId}/okrs/${okrId}/objectives/reorder`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderedIds: reordered.map((o) => o.id) }),
    });

    router.refresh();
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">목표 ({initialObjectives.length})</h2>
        {isPlanning && !isAdding && (
          <Button variant="outline" onClick={() => setIsAdding(true)}>
            추가
          </Button>
        )}
      </div>

      {isAdding && (
        <div className="mt-3">
          <ObjectiveForm
            spaceId={spaceId}
            okrId={okrId}
            spaceMembers={spaceMembers}
            onSave={() => {
              setIsAdding(false);
              handleMutate();
            }}
            onCancel={() => setIsAdding(false)}
          />
        </div>
      )}

      {objectives.length === 0 && !isAdding ? (
        <p className="mt-3 text-sm text-gray-400">아직 목표가 없습니다.</p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={objectives.map((o) => o.id)} strategy={verticalListSortingStrategy}>
            <div className="mt-3 space-y-4">
              {objectives.map((objective) => (
                <ObjectiveItem
                  key={objective.id}
                  objective={objective}
                  spaceId={spaceId}
                  okrId={okrId}
                  okrStatus={okrStatus}
                  spaceMembers={spaceMembers}
                  onMutate={handleMutate}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
