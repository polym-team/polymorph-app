'use client';

interface Idea {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  author: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
}

export function OKRIdeasOverview({ ideas }: { ideas: Idea[] }) {
  if (ideas.length === 0) {
    return (
      <div>
        <h2 className="text-lg font-semibold text-gray-900">아이디어 (0)</h2>
        <p className="mt-3 text-sm text-gray-400">아직 아이디어가 없습니다.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900">아이디어 ({ideas.length})</h2>
      <ul className="mt-3 space-y-3">
        {ideas.map((idea) => (
          <li key={idea.id} className="rounded-lg border bg-white p-4">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-medium text-gray-900">{idea.title}</h3>
              {idea.category && (
                <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                  {idea.category}
                </span>
              )}
            </div>
            {idea.description && (
              <p className="mt-1 text-sm text-gray-500">{idea.description}</p>
            )}
            <div className="mt-2 flex items-center gap-1.5">
              {idea.author.avatarUrl ? (
                <img
                  src={idea.author.avatarUrl}
                  alt={idea.author.name}
                  className="h-4 w-4 rounded-full"
                />
              ) : (
                <div className="flex h-4 w-4 items-center justify-center rounded-full bg-gray-200 text-[8px] font-medium text-gray-600">
                  {idea.author.name.charAt(0)}
                </div>
              )}
              <span className="text-xs text-gray-400">{idea.author.name}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
