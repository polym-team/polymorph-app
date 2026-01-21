'use client';

import { Header, Sidebar } from '@/components/layout';
import { OrgProvider, useOrg } from '@/lib/OrgContext';

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { selectedOrg, loading, selectOrganization } = useOrg();

  return (
    <div className="flex h-screen flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar selectedOrg={selectedOrg} onOrgChange={selectOrganization} />
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-gray-500">Loading organizations...</p>
            </div>
          ) : !selectedOrg ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-gray-500">No organizations found. Join a GitHub organization to get started.</p>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <OrgProvider>
      <DashboardContent>{children}</DashboardContent>
    </OrgProvider>
  );
}
