import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowDown,
  ArrowUp,
  Award,
  Eye,
  EyeOff,
  ExternalLink,
  FileCheck2,
  LoaderCircle,
  Pencil,
  Plus,
  Trash2,
  Upload,
} from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useToast } from '../../contexts/ToastContext';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { Modal } from '../../components/admin/Modal';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { CheckboxField, Field } from '../../components/admin/Field';
import { formError } from '../../utils/adminForm';
import { EmptyState, ErrorState, LoadingState } from '../../components/States';
import { certificationFormSchema } from '../../utils/adminSchemas';
import type { CertificationFormValues } from '../../utils/adminSchemas';
import { formatFullDate, toDateInputValue } from '../../utils/dates';
import type { AdminCertification } from '../../types';

const emptyCertification: CertificationFormValues = {
  title: '',
  provider: '',
  completionDate: '',
  description: '',
  credentialId: '',
  verificationUrl: '',
  published: false,
};

const CertificationFormModal = ({
  certification,
  onClose,
  onSaved,
}: {
  certification: AdminCertification | null;
  onClose: () => void;
  onSaved: () => void;
}) => {
  const { pushToast } = useToast();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CertificationFormValues>({
    resolver: zodResolver(certificationFormSchema),
    defaultValues: certification
      ? {
          title: certification.title,
          provider: certification.provider,
          completionDate: toDateInputValue(certification.completionDate),
          description: certification.description ?? '',
          credentialId: certification.credentialId ?? '',
          verificationUrl: certification.verificationUrl ?? '',
          published: certification.published,
        }
      : emptyCertification,
  });

  const onSubmit = async (values: CertificationFormValues) => {
    setServerError(null);
    try {
      if (certification) {
        await adminApi.updateCertification(certification.id, values);
        pushToast('Certification updated.');
      } else {
        await adminApi.createCertification(values);
        pushToast('Certification added.');
      }
      onSaved();
      onClose();
    } catch (error) {
      if (error instanceof Error) setServerError(error.message);
      if (error instanceof Error && 'details' in error) {
        const details = (error as { details?: Record<string, string[]> }).details;
        if (details) {
          (Object.keys(details) as (keyof CertificationFormValues)[]).forEach((key) => {
            if (details[key]?.[0]) setError(key, { type: 'server', message: details[key][0] });
          });
        }
      }
    }
  };

  return (
    <Modal
      open
      onClose={isSubmitting ? () => undefined : onClose}
      title={certification ? 'Edit certification' : 'Add certification'}
      description="Only add certifications you have completed or are genuinely in progress."
      size="lg"
      footer={
        <>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="certification-form"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting && <LoaderCircle size={15} className="animate-spin" aria-hidden="true" />}
            {certification ? 'Save changes' : 'Add certification'}
          </button>
        </>
      }
    >
      <form
        id="certification-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
        noValidate
      >
        {serverError && (
          <p
            role="alert"
            className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2.5 text-sm text-danger"
          >
            {serverError}
          </p>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Certification title"
            htmlFor="certification-title"
            required
            error={formError(errors, 'title')}
            className="sm:col-span-2"
          >
            <input id="certification-title" className="input" {...register('title')} />
          </Field>
          <Field
            label="Provider"
            htmlFor="certification-provider"
            required
            error={formError(errors, 'provider')}
          >
            <input id="certification-provider" className="input" {...register('provider')} />
          </Field>
          <Field
            label="Completion date"
            htmlFor="certification-date"
            error={formError(errors, 'completionDate')}
          >
            <input
              id="certification-date"
              type="date"
              className="input"
              {...register('completionDate')}
            />
          </Field>
          <Field
            label="Credential ID"
            htmlFor="certification-credential"
            error={formError(errors, 'credentialId')}
          >
            <input id="certification-credential" className="input" {...register('credentialId')} />
          </Field>
          <Field
            label="Verification URL"
            htmlFor="certification-verification"
            error={formError(errors, 'verificationUrl')}
            hint="Include https://"
          >
            <input
              id="certification-verification"
              type="url"
              className="input"
              placeholder="https://…"
              {...register('verificationUrl')}
            />
          </Field>
        </div>
        <Field
          label="Description"
          htmlFor="certification-description"
          error={formError(errors, 'description')}
        >
          <textarea
            id="certification-description"
            rows={3}
            className="input resize-y"
            {...register('description')}
          />
        </Field>
        <CheckboxField
          id="certification-published"
          label="Publish this certification"
          description="It will appear publicly only when published. Upload evidence after saving."
          {...register('published')}
        />
      </form>
    </Modal>
  );
};

export const CertificationsPage = () => {
  const query = useApiQuery(() => adminApi.listCertifications(), []);
  const { pushToast } = useToast();
  const [modalCertification, setModalCertification] = useState<AdminCertification | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminCertification | null>(null);
  const [removeCertTarget, setRemoveCertTarget] = useState<AdminCertification | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [busy, setBusy] = useState(false);
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const fileInputs = useRef<Record<number, HTMLInputElement | null>>({});
  const items = query.data ?? [];

  const openModal = (certification: AdminCertification | null) => {
    setModalCertification(certification);
    setModalOpen(true);
  };

  const togglePublished = async (certification: AdminCertification) => {
    setBusy(true);
    try {
      const updated = await adminApi.updateCertification(certification.id, {
        title: certification.title,
        provider: certification.provider,
        completionDate: toDateInputValue(certification.completionDate),
        description: certification.description,
        credentialId: certification.credentialId,
        verificationUrl: certification.verificationUrl,
        published: !certification.published,
      });
      query.setData((current) =>
        (current ?? []).map((item) => (item.id === updated.id ? updated : item)),
      );
      pushToast(updated.published ? 'Certification published.' : 'Certification hidden.');
    } catch (error) {
      pushToast(error instanceof Error ? error.message : 'Update failed.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const move = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    setBusy(true);
    try {
      await adminApi.reorderCertifications(next.map((item) => item.id));
      query.setData(next);
    } catch (error) {
      pushToast(error instanceof Error ? error.message : 'Order could not be saved.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const uploadCertificate = async (certification: AdminCertification, file: File | undefined) => {
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      pushToast('Certificate files must be smaller than 8 MB.', 'error');
      return;
    }
    setUploadingId(certification.id);
    try {
      const updated = await adminApi.uploadCertificate(certification.id, file);
      query.setData((current) =>
        (current ?? []).map((item) => (item.id === updated.id ? updated : item)),
      );
      pushToast('Certificate file uploaded.');
    } catch (error) {
      pushToast(error instanceof Error ? error.message : 'Upload failed.', 'error');
    } finally {
      setUploadingId(null);
      const input = fileInputs.current[certification.id];
      if (input) input.value = '';
    }
  };

  const removeCertificate = async () => {
    if (!removeCertTarget) return;
    setBusy(true);
    try {
      const updated = await adminApi.removeCertificate(removeCertTarget.id);
      query.setData((current) =>
        (current ?? []).map((item) => (item.id === updated.id ? updated : item)),
      );
      pushToast('Certificate file removed.', 'info');
      setRemoveCertTarget(null);
    } catch (error) {
      pushToast(error instanceof Error ? error.message : 'Remove failed.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminApi.deleteCertification(deleteTarget.id);
      query.setData((current) => (current ?? []).filter((item) => item.id !== deleteTarget.id));
      pushToast('Certification deleted.', 'info');
      setDeleteTarget(null);
    } catch (error) {
      pushToast(error instanceof Error ? error.message : 'Delete failed.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <AdminPageHeader
        eyebrow="Content"
        title="Certifications"
        description="Add certifications with verification links and optional evidence. New entries default to unpublished."
        actions={
          <button type="button" className="btn btn-primary btn-sm" onClick={() => openModal(null)}>
            <Plus size={14} aria-hidden="true" />
            Add certification
          </button>
        }
      />

      {query.loading && !query.data ? (
        <div className="card p-10">
          <LoadingState label="Loading certifications…" />
        </div>
      ) : query.error ? (
        <ErrorState message="Certifications could not be loaded." onRetry={query.refetch} />
      ) : items.length === 0 ? (
        <EmptyState
          title="No certifications added"
          description="Add completed certifications, credentials or courses with evidence."
          icon={<Award size={20} />}
          action={
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => openModal(null)}
            >
              <Plus size={14} aria-hidden="true" />
              Add certification
            </button>
          }
        />
      ) : (
        <div className="space-y-3">
          {items.map((certification, index) => (
            <article key={certification.id} className="card p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex gap-3">
                  <span className="icon-box mt-0.5 size-9">
                    <Award size={15} aria-hidden="true" />
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-sm font-semibold text-ink">{certification.title}</h2>
                      <span className={`badge ${certification.published ? 'badge-accent' : ''}`}>
                        {certification.published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <p className="text-xs text-muted">{certification.provider}</p>
                    <p className="mt-1 font-mono text-[0.65rem] uppercase tracking-wide text-muted">
                      {certification.completionDate
                        ? `Completed ${formatFullDate(certification.completionDate)}`
                        : 'Completion date not set'}
                      {certification.credentialId ? ` · ID ${certification.credentialId}` : ''}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      {certification.verificationUrl && (
                        <a
                          href={certification.verificationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
                        >
                          Verify
                          <ExternalLink size={11} aria-hidden="true" />
                        </a>
                      )}
                      {certification.certificateUrl && (
                        <a
                          href={certification.certificateUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
                        >
                          <FileCheck2 size={12} aria-hidden="true" />
                          View certificate
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 self-end sm:self-start">
                  <div className="mr-1 flex gap-0.5">
                    <button
                      type="button"
                      onClick={() => void move(index, -1)}
                      disabled={busy || index === 0}
                      className="inline-flex size-8 items-center justify-center rounded-lg text-muted hover:bg-surface2 hover:text-ink disabled:opacity-30"
                      aria-label="Move certification up"
                    >
                      <ArrowUp size={14} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => void move(index, 1)}
                      disabled={busy || index === items.length - 1}
                      className="inline-flex size-8 items-center justify-center rounded-lg text-muted hover:bg-surface2 hover:text-ink disabled:opacity-30"
                      aria-label="Move certification down"
                    >
                      <ArrowDown size={14} aria-hidden="true" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => void togglePublished(certification)}
                    disabled={busy}
                    className={`inline-flex size-8 items-center justify-center rounded-lg ${
                      certification.published
                        ? 'text-success hover:bg-success/10'
                        : 'text-muted hover:bg-surface2 hover:text-ink'
                    }`}
                    aria-label={
                      certification.published ? 'Unpublish certification' : 'Publish certification'
                    }
                  >
                    {certification.published ? (
                      <Eye size={15} aria-hidden="true" />
                    ) : (
                      <EyeOff size={15} aria-hidden="true" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setModalCertification(certification);
                      setModalOpen(true);
                    }}
                    className="inline-flex size-8 items-center justify-center rounded-lg text-muted hover:bg-surface2 hover:text-ink"
                    aria-label={`Edit ${certification.title}`}
                  >
                    <Pencil size={14} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(certification)}
                    className="inline-flex size-8 items-center justify-center rounded-lg text-muted hover:bg-danger/10 hover:text-danger"
                    aria-label={`Delete ${certification.title}`}
                  >
                    <Trash2 size={14} aria-hidden="true" />
                  </button>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line pt-3">
                <input
                  ref={(element) => {
                    fileInputs.current[certification.id] = element;
                  }}
                  id={`certificate-file-${certification.id}`}
                  type="file"
                  accept="application/pdf,image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={(event) =>
                    void uploadCertificate(certification, event.target.files?.[0])
                  }
                  disabled={uploadingId === certification.id}
                />
                <label
                  htmlFor={`certificate-file-${certification.id}`}
                  className="btn btn-secondary btn-sm cursor-pointer"
                >
                  {uploadingId === certification.id ? (
                    <LoaderCircle size={13} className="animate-spin" aria-hidden="true" />
                  ) : (
                    <Upload size={13} aria-hidden="true" />
                  )}
                  {certification.certificateUrl ? 'Replace file' : 'Upload certificate'}
                </label>
                {certification.certificateUrl && (
                  <button
                    type="button"
                    onClick={() => setRemoveCertTarget(certification)}
                    className="btn btn-ghost btn-sm text-danger hover:bg-danger/10 hover:text-danger"
                  >
                    Remove file
                  </button>
                )}
                <span className="text-[0.68rem] text-muted">PDF or image, up to 8 MB.</span>
              </div>
            </article>
          ))}
        </div>
      )}

      {modalOpen && (
        <CertificationFormModal
          certification={modalCertification}
          onClose={() => setModalOpen(false)}
          onSaved={query.refetch}
        />
      )}

      <ConfirmDialog
        open={Boolean(removeCertTarget)}
        title="Remove certificate file"
        message="The certification will remain, but its uploaded evidence file will be permanently removed."
        confirmLabel="Remove file"
        loading={busy}
        onCancel={() => setRemoveCertTarget(null)}
        onConfirm={() => void removeCertificate()}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete certification"
        message={`Delete “${deleteTarget?.title ?? ''}” and its uploaded evidence? This cannot be undone.`}
        confirmLabel="Delete certification"
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void confirmDelete()}
      />
    </>
  );
};
