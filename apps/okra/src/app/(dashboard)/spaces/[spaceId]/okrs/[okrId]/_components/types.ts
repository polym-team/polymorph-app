export type OKRStatus = 'PLANNING' | 'ACTIVE' | 'REVIEW' | 'ARCHIVED';

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

export interface ObjectiveData {
  id: string;
  title: string;
  description: string | null;
  sortOrder: number;
  owner: { id: string; name: string; avatarUrl: string | null };
  assignees: { user: { id: string; name: string; avatarUrl: string | null } }[];
}

export interface ReviewData {
  id: string;
  content: any;
  createdAt: Date | string;
  updatedAt: Date | string;
  author: { id: string; name: string; avatarUrl: string | null };
}
