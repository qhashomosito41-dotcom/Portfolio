import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  ExternalLink,
  LoaderCircle,
  Pencil,
  Plus,
  Share2,
  Trash2,
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
import { socialLinkFormSchema } from '../../utils/adminSchemas';
import type { SocialLinkFormValues } from '../../utils/adminSchemas';
import { SOCIAL_PLATFORMS } from '../../utils/constants';
import type { AdminSocialLink } from '../../types';

const SocialLinkFormModal = ({
  link,
  onClose,
  onSaved,
}: {
  link: AdminSocialLink | null;
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
  } = useForm<SocialLinkFormValues>({
    resolver: zodResolver(socialLinkFormSchema),
    defaultValues: link
      ? {
          platform: link.platform as SocialLinkFormValues['platform'],
          label: link.label,
          url: link.url,
          icon: link.icon ?? '',
          visible: link.visible,
        }
      : {
          platform: 'GitHub',
          label: 'GitHub',
          url: '',
          icon: '',
          visible: true,
        },
  });

  const onSubmit = async (values: SocialLinkFormValues) => {
    setServerError(null);
    try {
      if (link) {
        await adminApi.updateSocialLink(link.id, values);
        pushToast('Social link updated.');
      } else {
        await adminApi.createSocialLink(values);
        pushToast('Social link added.');
      }
      onSaved();
      onClose();
    } catch (error) {
      if (error instanceof Error) setServerError(error.message);
      if (error instanceof Error && 'details' in error) {
        const details = (error as { details?: Record<string, string[]> }).details;
        if (details) {
          (Object.keys(details) as (keyof SocialLinkFormValues)[]).forEach((key) => {
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
      title={link ? 'Edit social link' : 'Add social link'}
      description="Only add profiles that belong to you and are safe to share publicly."
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
            form="social-link-form"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting && <LoaderCircle size={15} className="animate-spin" aria-hidden="true" />}
            {link ? 'Save changes' : 'Add link'}
          </button>
        </>
      }
    >
      <form
        id="social-link-form"
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
          <Field label="Platform" htmlFor="social-platform" error={formError(errors, 'platform')}>
            <select id="social-platform" className="input" {...register('platform')}>
              {SOCIAL_PLATFORMS.map((platform) => (
                <option key={platform} value={platform}>
                  {platform}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Label" htmlFor="social-label" required error={formError(errors, 'label')}>
            <input id="social-label" className="input" {...register('label')} />
          </Field>
        </div>
        <Field
          label="URL"
          htmlFor="social-url"
          required
          error={formError(errors, 'url')}
          hint="Include https://"
        >
          <input
            id="social-url"
            type="url"
            className="input"
            placeholder="https://github.com/username"
            {...register('url')}
          />
        </Field>
        <Field
          label="Icon override"
          htmlFor="social-icon"
          error={formError(errors, 'icon')}
          hint="Optional icon name. Leave blank to use the platform icon."
        >
          <input id="social-icon" className="input" {...register('icon')} />
        </Field>
        <CheckboxField
          id="social-visible"
          label="Show on the public site"
          description="Hidden links remain saved but are not displayed."
          {...register('visible')}
        />
      </form>
    </Modal>
  );
};

export const SocialLinksPage = () => {
  const query = useApiQuery(() => adminApi.listSocialLinks(), []);
  const { pushToast } = useToast();
  const [modalLink, setModalLink] = useState<AdminSocialLink | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminSocialLink | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [busy, setBusy] = useState(false);
  const items = query.data ?? [];

  const toggleVisible = async (link: AdminSocialLink) => {
    setBusy(true);
    try {
      const updated = await adminApi.updateSocialLink(link.id, {
        platform: link.platform,
        label: link.label,
        url: link.url,
        icon: link.icon,
        visible: !link.visible,
      });
      query.setData((current) =>
        (current ?? []).map((item) => (item.id === updated.id ? updated : item)),
      );
      pushToast(updated.visible ? 'Link is now visible.' : 'Link hidden.');
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
      await adminApi.reorderSocialLinks(next.map((item) => item.id));
      query.setData(next);
    } catch (error) {
      pushToast(error instanceof Error ? error.message : 'Order could not be saved.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminApi.deleteSocialLink(deleteTarget.id);
      query.setData((current) => (current ?? []).filter((item) => item.id !== deleteTarget.id));
      pushToast('Social link deleted.', 'info');
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
        eyebrow="Site"
        title="Social links"
        description="Links shown in the header, footer and contact section. Order is preserved."
        actions={
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => {
              setModalLink(null);
              setModalOpen(true);
            }}
          >
            <Plus size={14} aria-hidden="true" />
            Add link
          </button>
        }
      />

      {query.loading && !query.data ? (
        <div className="card p-10">
          <LoadingState label="Loading social links…" />
        </div>
      ) : query.error ? (
        <ErrorState message="Social links could not be loaded." onRetry={query.refetch} />
      ) : items.length === 0 ? (
        <EmptyState
          title="No social links"
          description="Add a GitHub, LinkedIn or other professional profile. Empty links are never invented."
          icon={<Share2 size={20} />}
          action={
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => {
                setModalLink(null);
                setModalOpen(true);
              }}
            >
              <Plus size={14} aria-hidden="true" />
              Add a link
            </button>
          }
        />
      ) : (
        <div className="space-y-2.5">
          {items.map((link, index) => (
            <article
              key={link.id}
              className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="icon-box size-9">
                  <Share2 size={15} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-ink">{link.label}</p>
                    <span className="badge">{link.platform}</span>
                    {!link.visible && <span className="badge text-warning">Hidden</span>}
                  </div>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-0.5 inline-flex max-w-full items-center gap-1 truncate text-xs text-muted hover:text-accent"
                  >
                    <span className="truncate">{link.url}</span>
                    <ExternalLink size={11} aria-hidden="true" />
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-0.5 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => void move(index, -1)}
                  disabled={busy || index === 0}
                  className="inline-flex size-8 items-center justify-center rounded-lg text-muted hover:bg-surface2 hover:text-ink disabled:opacity-30"
                  aria-label={`Move ${link.label} up`}
                >
                  <ArrowUp size={14} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => void move(index, 1)}
                  disabled={busy || index === items.length - 1}
                  className="inline-flex size-8 items-center justify-center rounded-lg text-muted hover:bg-surface2 hover:text-ink disabled:opacity-30"
                  aria-label={`Move ${link.label} down`}
                >
                  <ArrowDown size={14} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => void toggleVisible(link)}
                  disabled={busy}
                  className={`inline-flex size-8 items-center justify-center rounded-lg ${
                    link.visible
                      ? 'text-success hover:bg-success/10'
                      : 'text-muted hover:bg-surface2 hover:text-ink'
                  }`}
                  aria-label={link.visible ? `Hide ${link.label}` : `Show ${link.label}`}
                >
                  {link.visible ? (
                    <Eye size={15} aria-hidden="true" />
                  ) : (
                    <EyeOff size={15} aria-hidden="true" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setModalLink(link);
                    setModalOpen(true);
                  }}
                  className="inline-flex size-8 items-center justify-center rounded-lg text-muted hover:bg-surface2 hover:text-ink"
                  aria-label={`Edit ${link.label}`}
                >
                  <Pencil size={14} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(link)}
                  className="inline-flex size-8 items-center justify-center rounded-lg text-muted hover:bg-danger/10 hover:text-danger"
                  aria-label={`Delete ${link.label}`}
                >
                  <Trash2 size={14} aria-hidden="true" />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {modalOpen && (
        <SocialLinkFormModal
          link={modalLink}
          onClose={() => setModalOpen(false)}
          onSaved={query.refetch}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete social link"
        message={`Delete the “${deleteTarget?.label ?? ''}” link? This cannot be undone.`}
        confirmLabel="Delete link"
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void confirmDelete()}
      />
    </>
  );
};
