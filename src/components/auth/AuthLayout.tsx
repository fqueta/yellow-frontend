import { ReactNode } from 'react';
import { SystemMaintenanceBanner } from '@/components/system/SystemMaintenanceBanner';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>

        <SystemMaintenanceBanner />
        
        <div className="bg-card p-6 rounded-lg border shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
