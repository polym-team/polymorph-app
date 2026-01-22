'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bookmark, FolderOpen, Building2, ChevronDown, RefreshCw } from 'lucide-react';
import { cn } from '@package/utils';
import { useOrg } from '@/lib/OrgContext';
import type { OrganizationWithRole } from '@/types';

interface SidebarProps {
  selectedOrg: OrganizationWithRole | null;
  onOrgChange: (org: OrganizationWithRole) => void;
}

export function Sidebar({ selectedOrg, onOrgChange }: SidebarProps) {
  const pathname = usePathname();
  const { organizations, syncing, syncOrganizations } = useOrg();

  const navItems = [
    { href: '/bookmarks', label: 'Bookmarks', icon: Bookmark },
    { href: '/categories', label: 'Categories', icon: FolderOpen },
  ];

  return (
    <aside className="flex h-full w-64 flex-col border-r bg-gray-50">
      {/* Organization Selector */}
      <div className="border-b p-4">
        <label className="mb-2 block text-xs font-medium text-gray-500">
          Organization
        </label>
        <div className="relative">
          <select
            value={selectedOrg?.id ?? ''}
            onChange={(e) => {
              const org = organizations.find((o) => o.id === e.target.value);
              if (org) onOrgChange(org);
            }}
            className="w-full appearance-none rounded border bg-white py-2 pl-10 pr-8 text-sm"
          >
            {organizations.map((org) => (
              <option key={org.id} value={org.id}>
                {org.name || org.login}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2">
            {selectedOrg?.avatarUrl ? (
              <Image
                src={selectedOrg.avatarUrl}
                alt={selectedOrg.login}
                width={24}
                height={24}
                className="rounded"
              />
            ) : (
              <Building2 className="h-6 w-6 text-gray-400" />
            )}
          </div>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </div>
        <div className="mt-2 flex items-center justify-between">
          {selectedOrg && (
            <p className="text-xs text-gray-500">
              Role: <span className="font-medium">{selectedOrg.role}</span>
            </p>
          )}
          <button
            onClick={syncOrganizations}
            disabled={syncing}
            className="flex items-center gap-1 rounded px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
            title="Sync organizations from GitHub"
          >
            <RefreshCw className={cn('h-3 w-3', syncing && 'animate-spin')} />
            {syncing ? 'Syncing...' : 'Sync'}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded px-3 py-2 text-sm transition-colors',
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
