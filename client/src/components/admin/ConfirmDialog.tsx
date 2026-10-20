import { AlertTriangle, LoaderCircle } from 'lucide-react';
import { Modal } from './Modal';

export const ConfirmDialog = ({
  open,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  loading = false,
  destructive = true,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  destructive?: boolean;
}) => (
  <Modal
    open={open}
    onClose={loading ? () => undefined : onCancel}
    title={title}
    size="sm"
    footer={
      <>
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={loading}>
          {cancelLabel}
        </button>
        <button
          type="button"
          className={destructive ? 'btn btn-danger' : 'btn btn-primary'}
          onClick={onConfirm}
          disabled={loading}
        >
          {loading && <LoaderCircle size={15} className="animate-spin" aria-hidden="true" />}
          {confirmLabel}
        </button>
      </>
    }
  >
    <div className="flex gap-4">
      <div
        className={`inline-flex size-11 shrink-0 items-center justify-center rounded-full ${
          destructive ? 'bg-danger/10 text-danger' : 'bg-accent-soft text-accent'
        }`}
        aria-hidden="true"
      >
        <AlertTriangle size={20} />
      </div>
      <p className="pt-1 text-sm leading-6 text-muted">{message}</p>
    </div>
  </Modal>
);
