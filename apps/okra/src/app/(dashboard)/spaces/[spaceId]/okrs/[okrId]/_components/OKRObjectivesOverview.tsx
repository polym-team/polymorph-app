'use client';

import { Badge } from '@package/ui';

interface Task {
  id: string;
  title: string;
  status: string;
  assignee: { id: string; name: string; avatarUrl: string | null } | null;
  _count: { progress: number };
}

interface Objective {
  id: string;
  title: string;
  description: string | null;
  owner: { id: string; name: string; avatarUrl: string | null };
  tasks: Task[];
}

const TASK_STATUS_CONFIG: Record<string, { label: string; variant: 'secondary' | 'success' | 'warning' | 'default' | 'outline' }> = {
  TODO: { label: '할 일', variant: 'secondary' },
  IN_PROGRESS: { label: '진행 중', variant: 'warning' },
  DONE: { label: '완료', variant: 'success' },
  DISCARDED: { label: '제외', variant: 'default' },
};

export function OKRObjectivesOverview({ objectives }: { objectives: Objective[] }) {
  if (objectives.length === 0) {
    return (
      <div>
        <h2 className="text-lg font-semibold text-gray-900">목표 (0)</h2>
        <p className="mt-3 text-sm text-gray-400">아직 목표가 없습니다.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900">목표 ({objectives.length})</h2>
      <div className="mt-3 space-y-4">
        {objectives.map((objective) => (
          <div key={objective.id} className="rounded-lg border bg-white p-4">
            <div className="flex items-start gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-gray-900">{objective.title}</h3>
                {objective.description && (
                  <p className="mt-1 text-sm text-gray-500">{objective.description}</p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                {objective.owner.avatarUrl ? (
                  <img
                    src={objective.owner.avatarUrl}
                    alt={objective.owner.name}
                    className="h-5 w-5 rounded-full"
                  />
                ) : (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-[9px] font-medium text-gray-600">
                    {objective.owner.name.charAt(0)}
                  </div>
                )}
                <span className="text-xs text-gray-400">{objective.owner.name}</span>
              </div>
            </div>

            {objective.tasks.length > 0 && (
              <ul className="mt-3 space-y-2 border-t pt-3">
                {objective.tasks.map((task) => {
                  const statusConfig = TASK_STATUS_CONFIG[task.status] || { label: task.status, variant: 'default' as const };
                  return (
                    <li key={task.id} className="flex items-center gap-2">
                      <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                      <span className="min-w-0 flex-1 truncate text-sm text-gray-700">{task.title}</span>
                      {task.assignee && (
                        <span className="shrink-0 text-xs text-gray-400">{task.assignee.name}</span>
                      )}
                      {task._count.progress > 0 && (
                        <span className="shrink-0 text-xs text-gray-400">
                          기록 {task._count.progress}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
