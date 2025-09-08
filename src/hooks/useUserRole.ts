import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type AppRole = 'owner' | 'admin' | 'developer' | 'affiliate' | 'user';

export function useUserRole() {
  const { user } = useAuth();
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRoles([]);
      setLoading(false);
      return;
    }

    async function fetchUserRoles() {
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        if (error) throw error;

        setRoles(data?.map(r => r.role as AppRole) || []);
      } catch (error) {
        console.error('Error fetching user roles:', error);
        setRoles([]);
      } finally {
        setLoading(false);
      }
    }

    fetchUserRoles();
  }, [user]);

  const hasRole = (role: AppRole): boolean => roles.includes(role);
  const isDeveloper = hasRole('developer');
  const isAffiliate = hasRole('affiliate');
  const isAdmin = hasRole('admin');

  return {
    roles,
    hasRole,
    isDeveloper,
    isAffiliate,
    isAdmin,
    loading
  };
}