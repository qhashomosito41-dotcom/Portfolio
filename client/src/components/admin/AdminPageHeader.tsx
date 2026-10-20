import type { ReactNode } from 'react';

export const AdminPageHeader = ({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) => (
  <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
    <div className="max-w-2xl">
      {eyebrow && (
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-accent">{eyebrow}</p>
      )}
      <h1 className="mt-1 text-2xl font-semibold tracking-[-0.02em] text-ink sm:text-3xl">{title}</h1>
      {description && <p className="mt-2 text-sm leading-6 text-muted">{description}</p>}
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
  </div>
);
