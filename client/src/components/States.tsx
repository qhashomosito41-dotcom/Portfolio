import type { ReactNode } from 'react';
import { AlertTriangle, Inbox, LoaderCircle, RefreshCw } from 'lucide-react';
import { cn } from '../utils/cn';

export const LoadingState = ({ label = 'Loading content…' }: { label?: string }) => (
  <div className="flex min-h-40 items-center justify-center gap-3 text-sm text-muted" role="status">
    <LoaderCircle className="size-5 animate-spin text-accent" aria-hidden="true" />
    {label}
  </div>
);

export const ErrorState = ({
  message = 'Something went wrong while loading this content.',
  onRetry,
  className,
}: {
  message?: string;
  onRetry?: () => void;
  className?: string;
}) => (
  <div
    className={cn(
      'flex flex-col items-start gap-4 rounded-2xl border border-danger/30 bg-danger/5 p-5 sm:flex-row sm:items-center sm:justify-between',
      className,
    )}
    role="alert"
  >
    <div className="flex items-start gap-3">
      <AlertTriangle className="mt-0.5 size-5 shrink-0 text-danger" aria-hidden="true" />
      <p className="text-sm leading-6 text-ink">{message}</p>
    </div>
    {onRetry && (
      <button type="button" onClick={onRetry} className="btn btn-secondary btn-sm">
        <RefreshCw size={14} aria-hidden="true" />
        Try again
      </button>
    )}
  </div>
);

export const EmptyState = ({
  title,
  description,
  action,
  icon,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      'flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-surface/60 px-6 py-14 text-center',
      className,
    )}
  >
    <div className="icon-box mb-4" aria-hidden="true">
      {icon ?? <Inbox size={20} />}
    </div>
    <h3 className="text-base font-semibold text-ink">{title}</h3>
    {description && <p className="mt-2 max-w-md text-sm leading-6 text-muted">{description}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);
