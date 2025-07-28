'use client';

import { createContext, useContext, useMemo, useState } from 'react';

export type Crumb = {
  label: string;
  href?: string;
};

type BreadcrumbContextType = {
  breadcrumbs: Crumb[];
  setBreadcrumbs: (crumbs: Crumb[]) => void;
};

const BreadcrumbContext = createContext<BreadcrumbContextType | null>(null);

export function BreadcrumbProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [breadcrumbs, setBreadcrumbs] = useState<Crumb[]>([]);
  const value = useMemo(() => ({ breadcrumbs, setBreadcrumbs }), [breadcrumbs, setBreadcrumbs]);
  return <BreadcrumbContext.Provider value={value}>{children}</BreadcrumbContext.Provider>;
}

export function useBreadcrumb(crumbs?: Crumb[]) {
  const ctx = useContext(BreadcrumbContext);
  if (!ctx) throw new Error('useBreadcrumb phải dùng trong BreadcrumbProvider');

  if (crumbs) {
    ctx.setBreadcrumbs(crumbs);
  }

  return ctx;
}
