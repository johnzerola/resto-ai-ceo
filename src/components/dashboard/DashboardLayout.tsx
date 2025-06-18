
import React from 'react';
import { ModernLayout } from '@/components/restaurant/ModernLayout';
import { TrialBanner } from '@/components/trial/TrialBanner';
import { EmailConfirmationBanner } from '@/components/auth/EmailConfirmationBanner';
import { DataSync } from '@/components/restaurant/DataSync';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <DataSync>
      <ModernLayout>
        <div className="space-y-4">
          <EmailConfirmationBanner />
          <TrialBanner />
          {children}
        </div>
      </ModernLayout>
    </DataSync>
  );
}
