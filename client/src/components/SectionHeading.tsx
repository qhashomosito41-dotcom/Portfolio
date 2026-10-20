import type { ReactNode } from 'react';
import { cn } from '../utils/cn';

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
  align?: 'left' | 'center';
  className?: string;
};

export const SectionHeading = ({
  eyebrow,
  title,
  description,
  action,
  align = 'left',
  className,
}: SectionHeadingProps) => (
  <div
    className={cn(
      'mb-10 flex flex-col gap-4 sm:mb-12',
      align === 'center' ? 'items-center text-center' : 'sm:flex-row sm:items-end sm:justify-between',
      className,
    )}
  >
    <div className={cn('max-w-2xl', align === 'center' && 'mx-auto')}>
      <p className="eyebrow">
        <span className="h-px w-6 bg-accent/60" aria-hidden="true" />
        {eyebrow}
      </p>
      <h2 className="heading-2 mt-3">{title}</h2>
      {description && <p className="body-text mt-3">{description}</p>}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);
