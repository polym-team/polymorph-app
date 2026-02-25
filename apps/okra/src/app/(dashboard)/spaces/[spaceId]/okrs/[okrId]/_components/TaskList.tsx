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
import type { TaskData, OKRStatus, SpaceMember } from './types';
import { TaskItem } from './TaskItem';
import { TaskForm } from './TaskForm';

interface TaskListProps {
  tasks: TaskData[];
  spaceId: string;
  okrId: string;
  objectiveId: string;
  okrStatus: OKRStatus;
  currentUserId: string;
  spaceMembers: SpaceMember[];
}

export function TaskList({
  tasks: initialTasks,
  spaceId,
  okrId,
  objectiveId,
  okrStatus,
  currentUserId,
  spaceMembers,
}: TaskListProps) {
  const router = useRouter();
  const [tasks, setTasks] = useState(initialTasks);
  const [prevInitial, setPrevInitial] = useState(initialTasks);
  const [isAdding, setIsAdding] = useState(false);

  if (prevInitial !== initialTasks) {
    setPrevInitial(initialTasks);
    setTasks(initialTasks);
  }

  const isPlanning = okrStatus === 'PLANNING';
  const isActive = okrStatus === 'ACTIVE';
  const canAdd = isPlanning || isActive;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleMutate = () => {
    router.refresh();
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = tasks.findIndex((t) => t.id === active.id);
    const newIndex = tasks.findIndex((t) => t.id === over.id);
    const reordered = arrayMove(tasks, oldIndex, newIndex);

    setTasks(reordered);

    await fetch(
      `/api/spaces/${spaceId}/okrs/${okrId}/objectives/${objectiveId}/tasks/reorder`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds: reordered.map((t) => t.id) }),
      }
    );

    router.refresh();
  };

  return (
    <div className="mt-3 border-t pt-3">
      {tasks.length > 0 && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            <ul className="space-y-2">
              {tasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  spaceId={spaceId}
                  okrId={okrId}
                  objectiveId={objectiveId}
                  okrStatus={okrStatus}
                  currentUserId={currentUserId}
                  spaceMembers={spaceMembers}
                  onMutate={handleMutate}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}

      {isAdding && (
        <div className="mt-2">
          <TaskForm
            spaceId={spaceId}
            okrId={okrId}
            objectiveId={objectiveId}
            spaceMembers={spaceMembers}
            onSave={() => {
              setIsAdding(false);
              handleMutate();
            }}
            onCancel={() => setIsAdding(false)}
          />
        </div>
      )}

      {canAdd && !isAdding && (
        <Button variant="ghost" className="mt-2" onClick={() => setIsAdding(true)}>
          + 작업 추가
        </Button>
      )}
    </div>
  );
}
