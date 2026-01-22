'use client';

import { useState, useCallback } from 'react';
import type { OrganizationWithRole } from '@/types';

interface UseOrganizationsReturn {
  organizations: OrganizationWithRole[];
  selectedOrg: OrganizationWithRole | null;
  loading: boolean;
  syncing: boolean;
  error: string | null;
  fetchOrganizations: () => Promise<void>;
  syncOrganizations: () => Promise<void>;
  selectOrganization: (org: OrganizationWithRole) => void;
}

export function useOrganizations(): UseOrganizationsReturn {
  const [organizations, setOrganizations] = useState<OrganizationWithRole[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<OrganizationWithRole | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrganizations = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/organizations');

      if (!response.ok) {
        throw new Error('Failed to fetch organizations');
      }

      const data = await response.json();
      setOrganizations(data);

      // Auto-select first org if none selected
      if (data.length > 0 && !selectedOrg) {
        setSelectedOrg(data[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [selectedOrg]);

  const selectOrganization = useCallback((org: OrganizationWithRole) => {
    setSelectedOrg(org);
  }, []);

  const syncOrganizations = useCallback(async () => {
    setSyncing(true);
    setError(null);

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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSyncing(false);
    }
  }, [fetchOrganizations]);

  return {
    organizations,
    selectedOrg,
    loading,
    syncing,
    error,
    fetchOrganizations,
    syncOrganizations,
    selectOrganization,
  };
}
