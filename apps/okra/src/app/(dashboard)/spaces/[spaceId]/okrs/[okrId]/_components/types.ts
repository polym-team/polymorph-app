export type OKRStatus = 'PLANNING' | 'ACTIVE' | 'REVIEW' | 'ARCHIVED';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'DISCARDED';

export type TaskAssigneeMode = 'ANYONE' | 'ASSIGNED';

export interface SpaceMember {
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
  };
}

export interface IdeaData {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  sortOrder: number;
  author: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
}

export interface TaskData {
  id: string;
  title: string;
  description: string | null;
  status: string;
  assigneeMode: string;
  assignee: { id: string; name: string; avatarUrl: string | null } | null;
  dueDate: Date | string | null;
  sortOrder: number;
}

export interface ObjectiveData {
  id: string;
  title: string;
  description: string | null;
  sortOrder: number;
  owner: { id: string; name: string; avatarUrl: string | null };
  tasks: TaskData[];
}
