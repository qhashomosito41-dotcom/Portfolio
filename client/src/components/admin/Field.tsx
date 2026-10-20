import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';

export const Field = ({
  label,
  htmlFor,
  error,
  hint,
  required,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) => (
  <div className={className}>
    <label htmlFor={htmlFor} className="label">
      {label}
      {required && (
        <span className="ml-0.5 text-danger" aria-hidden="true">
          *
        </span>
      )}
    </label>
    {children}
    {error ? (
      <p id={`${htmlFor}-error`} className="error-text">
        {error}
      </p>
    ) : (
      hint && (
        <p id={`${htmlFor}-hint`} className="hint">
          {hint}
        </p>
      )
    )}
  </div>
);

export const CheckboxField = ({
  label,
  description,
  id,
  className,
  ...props
}: {
  label: string;
  description?: string;
  id: string;
  className?: string;
  checked?: boolean;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  name?: string;
  disabled?: boolean;
}) => (
  <label
    htmlFor={id}
    className={cn(
      'flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-bg p-3.5 transition hover:border-accent/30',
      className,
    )}
  >
    <input
      id={id}
      type="checkbox"
      className="mt-0.5 size-4 rounded border-line accent-[hsl(var(--accent))]"
      {...props}
    />
    <span>
      <span className="block text-sm font-medium text-ink">{label}</span>
      {description && (
        <span className="mt-0.5 block text-xs leading-5 text-muted">{description}</span>
      )}
    </span>
  </label>
);
