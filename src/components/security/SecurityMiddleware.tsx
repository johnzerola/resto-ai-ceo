
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSecurityMonitoring } from '@/hooks/useSecurityMonitoring';

export const SecurityMiddleware = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const { logSecurityEvent } = useSecurityMonitoring();

  React.useEffect(() => {
    if (user) {
      logSecurityEvent('user_access', {
        userId: user.id,
        timestamp: new Date().toISOString()
      });
    }
  }, [user, logSecurityEvent]);

  return <>{children}</>;
};
