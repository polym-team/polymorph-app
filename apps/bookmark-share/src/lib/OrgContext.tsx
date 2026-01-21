'use client';

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { OrganizationWithRole } from '@/types';

interface OrgContextType {
  selectedOrg: OrganizationWithRole | null;
  organizations: OrganizationWithRole[];
  loading: boolean;
  selectOrganization: (org: OrganizationWithRole) => void;
}

const OrgContext = createContext<OrgContextType | undefined>(undefined);

export function OrgProvider({ children }: { children: ReactNode }) {
  const [organizations, setOrganizations] = useState<OrganizationWithRole[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<OrganizationWithRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        const response = await fetch('/api/organizations');
        if (response.ok) {
          const data = await response.json();
          setOrganizations(data);
          if (data.length > 0) {
            setSelectedOrg(data[0]);
          }
        }
      } catch (error) {
        console.error('Failed to fetch organizations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrgs();
  }, []);

  const selectOrganization = useCallback((org: OrganizationWithRole) => {
    setSelectedOrg(org);
  }, []);

  return (
    <OrgContext.Provider value={{ selectedOrg, organizations, loading, selectOrganization }}>
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
