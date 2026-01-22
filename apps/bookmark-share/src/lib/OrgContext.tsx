'use client';

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { OrganizationWithRole } from '@/types';

interface OrgContextType {
  selectedOrg: OrganizationWithRole | null;
  organizations: OrganizationWithRole[];
  loading: boolean;
  syncing: boolean;
  selectOrganization: (org: OrganizationWithRole) => void;
  syncOrganizations: () => Promise<void>;
}

const OrgContext = createContext<OrgContextType | undefined>(undefined);

export function OrgProvider({ children }: { children: ReactNode }) {
  const [organizations, setOrganizations] = useState<OrganizationWithRole[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<OrganizationWithRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const fetchOrganizations = useCallback(async () => {
    try {
      const response = await fetch('/api/organizations');
      if (response.ok) {
        const data = await response.json();
        setOrganizations(data);
        if (data.length > 0 && !selectedOrg) {
          setSelectedOrg(data[0]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch organizations:', error);
    }
  }, [selectedOrg]);

  useEffect(() => {
    const init = async () => {
      await fetchOrganizations();
      setLoading(false);
    };
    init();
  }, []);

  const selectOrganization = useCallback((org: OrganizationWithRole) => {
    setSelectedOrg(org);
  }, []);

  const syncOrganizations = useCallback(async () => {
    setSyncing(true);
    try {
      const response = await fetch('/api/organizations/sync', {
        method: 'POST',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to sync organizations');
      }
      // Refetch organizations after sync
      await fetchOrganizations();
    } catch (error) {
      console.error('Failed to sync organizations:', error);
    } finally {
      setSyncing(false);
    }
  }, [fetchOrganizations]);

  return (
    <OrgContext.Provider value={{ selectedOrg, organizations, loading, syncing, selectOrganization, syncOrganizations }}>
      {children}
    </OrgContext.Provider>
  );
}

export function useOrg() {
  const context = useContext(OrgContext);
  if (context === undefined) {
    throw new Error('useOrg must be used within an OrgProvider');
  }
  return context;
}
