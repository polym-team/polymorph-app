import { Button } from '@package/ui';

import { RegionTab } from '../types';

interface RegionTabsProps {
  tabs: RegionTab[];
  activeTab: string;
  onTabChange: (code: string) => void;
}

export function RegionTabs({ tabs, activeTab, onTabChange }: RegionTabsProps) {
  return (
    <div className="scrollbar-hide flex gap-2 overflow-x-auto">
      {tabs.map(tab => (
        <Button
          key={tab.code}
          size="sm"
          variant={activeTab === tab.code ? 'primary' : 'outline'}
          onClick={() => onTabChange(tab.code)}
        >
          {tab.name} <span className="ml-1">{tab.count}</span>
        </Button>
      ))}
    </div>
  );
}
