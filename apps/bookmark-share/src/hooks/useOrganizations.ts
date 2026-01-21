'use client';

import { useState, useCallback } from 'react';
import type { OrganizationWithRole } from '@/types';

interface UseOrganizationsReturn {
  organizations: OrganizationWithRole[];
  selectedOrg: OrganizationWithRole | null;
  loading: boolean;
  error: string | null;
  fetchOrganizations: () => Promise<void>;
  selectOrganization: (org: OrganizationWithRole) => void;
}

export function useOrganizations(): UseOrganizationsReturn {
  const [organizations, setOrganizations] = useState<OrganizationWithRole[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<OrganizationWithRole | null>(null);
  const [loading, setLoading] = useState(false);
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

  return {
    organizations,
    selectedOrg,
    loading,
    error,
    fetchOrganizations,
    selectOrganization,
  };
}
