import { useEffect, useState } from 'react';
import {
  Archive,
  ArchiveRestore,
  ArrowUpRight,
  CornerUpLeft,
  Eye,
  EyeOff,
  Inbox,
  LoaderCircle,
  Mail,
  MailOpen,
  Search,
  Trash2,
} from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { useToast } from '../../contexts/ToastContext';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { Modal } from '../../components/admin/Modal';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { Pagination } from '../../components/admin/Pagination';
import { EmptyState, ErrorState, LoadingState } from '../../components/States';
import { formatDateTime } from '../../utils/dates';
import type { ContactMessage } from '../../types';

type Status = 'all' | 'unread' | 'read' | 'archived';

export const MessagesPage = () => {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);
  const [status, setStatus] = useState<Status>('all');
  const [page, setPage] = useState(1);
  const [active, setActive] = useState<ContactMessage | null>(null);
  const [busy, setBusy] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ContactMessage | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { pushToast } = useToast();

  const query = useApiQuery(() => {
    const params = new URLSearchParams({ page: String(page), pageSize: '12', status });
    if (debouncedSearch.trim()) params.set('q', debouncedSearch.trim());
    return adminApi.listMessages(params);
  }, [page, status, debouncedSearch]);

  useEffect(() => {
    setPage(1);
  }, [status, debouncedSearch]);

  const updateMessage = async (
    message: ContactMessage,
    payload: { isRead?: boolean; isArchived?: boolean },
    successMessage: string,
  ) => {
    setBusy(true);
    try {
      const updated = await adminApi.updateMessage(message.id, payload);
      setActive((current) => (current?.id === updated.id ? updated : current));
      query.refetch();
      pushToast(successMessage);
    } catch (error) {
      pushToast(
        error instanceof Error ? error.message : 'The message could not be updated.',
        'error',
      );
    } finally {
      setBusy(false);
    }
  };

  const openMessage = (message: ContactMessage) => {
    setActive(message);
    if (!message.isRead) {
      void updateMessage(message, { isRead: true }, 'Message marked as read.');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminApi.deleteMessage(deleteTarget.id);
      if (active?.id === deleteTarget.id) setActive(null);
      setDeleteTarget(null);
      query.refetch();
      pushToast('Message deleted.', 'info');
    } catch (error) {
      pushToast(
        error instanceof Error ? error.message : 'The message could not be deleted.',
        'error',
      );
    } finally {
      setDeleting(false);
    }
  };

  const counts = query.data?.counts;
  const tabs: { value: Status; label: string; count?: number }[] = [
    { value: 'all', label: 'Inbox', count: counts?.inbox },
    { value: 'unread', label: 'Unread', count: counts?.unread },
    { value: 'read', label: 'Read' },
    { value: 'archived', label: 'Archived', count: counts?.archived },
  ];

  return (
    <>
      <AdminPageHeader
        eyebrow="Inbox"
        title="Messages"
        description="Enquiries submitted through the public contact form. Opening a message marks it as read."
      />

      <div className="mb-4 flex flex-col gap-3">
        <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Message filters">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={status === tab.value}
              onClick={() => setStatus(tab.value)}
              className={`btn btn-sm ${status === tab.value ? 'btn-primary' : 'btn-secondary'}`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[0.6rem] font-semibold ${
                    status === tab.value ? 'bg-on-accent/15' : 'bg-surface2 text-muted'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="relative sm:max-w-sm">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            aria-hidden="true"
          />
          <input
            type="search"
            className="input pl-9"
            placeholder="Search name, email, subject…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Search messages"
          />
        </div>
      </div>

      {query.loading && !query.data ? (
        <div className="card p-10">
          <LoadingState label="Loading messages…" />
        </div>
      ) : query.error ? (
        <ErrorState message="Messages could not be loaded." onRetry={query.refetch} />
      ) : !query.data || query.data.items.length === 0 ? (
        <EmptyState
          title={
            debouncedSearch
              ? 'No matching messages'
              : status === 'unread'
                ? 'No unread messages'
                : status === 'archived'
                  ? 'No archived messages'
                  : 'Your inbox is empty'
          }
          description={
            debouncedSearch
              ? 'Try a different search term.'
              : 'Messages sent through the portfolio contact form will appear here.'
          }
          icon={<Inbox size={20} />}
        />
      ) : (
        <>
          <div className="table-shell hidden md:block">
            <table className="data-table">
              <caption className="sr-only">Contact messages</caption>
              <thead>
                <tr>
                  <th scope="col">From</th>
                  <th scope="col">Subject</th>
                  <th scope="col">Received</th>
                  <th scope="col">Status</th>
                  <th scope="col" className="text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {query.data.items.map((message) => (
                  <tr key={message.id} className={message.isRead ? undefined : 'bg-accent/[0.035]'}>
                    <td>
                      <p className="font-medium text-ink">{message.name}</p>
                      <p className="text-xs text-muted">{message.email}</p>
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => openMessage(message)}
                        className={`line-clamp-1 max-w-sm text-left text-sm hover:text-accent ${
                          message.isRead ? 'text-muted' : 'font-semibold text-ink'
                        }`}
                      >
                        {message.subject}
                      </button>
                      <p className="mt-0.5 line-clamp-1 max-w-sm text-xs text-muted">
                        {message.message}
                      </p>
                    </td>
                    <td className="whitespace-nowrap text-xs text-muted">
                      {formatDateTime(message.createdAt)}
                    </td>
                    <td>
                      <span className="badge whitespace-nowrap">
                        {message.isArchived ? 'Archived' : message.isRead ? 'Read' : 'Unread'}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openMessage(message)}
                          className="inline-flex size-8 items-center justify-center rounded-lg text-muted hover:bg-surface2 hover:text-ink"
                          aria-label={`Open message: ${message.subject}`}
                        >
                          <MailOpen size={14} aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            void updateMessage(
                              message,
                              { isArchived: !message.isArchived },
                              message.isArchived
                                ? 'Message restored to inbox.'
                                : 'Message archived.',
                            )
                          }
                          disabled={busy}
                          className="inline-flex size-8 items-center justify-center rounded-lg text-muted hover:bg-surface2 hover:text-ink"
                          aria-label={message.isArchived ? 'Restore message' : 'Archive message'}
                        >
                          {message.isArchived ? (
                            <ArchiveRestore size={14} aria-hidden="true" />
                          ) : (
                            <Archive size={14} aria-hidden="true" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(message)}
                          className="inline-flex size-8 items-center justify-center rounded-lg text-muted hover:bg-danger/10 hover:text-danger"
                          aria-label={`Delete message: ${message.subject}`}
                        >
                          <Trash2 size={14} aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 md:hidden">
            {query.data.items.map((message) => (
              <article key={message.id} className="card p-4">
                <button
                  type="button"
                  onClick={() => openMessage(message)}
                  className="w-full text-left"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs text-muted">
                        {message.name} · {message.email}
                      </p>
                      <p
                        className={`mt-1 truncate text-sm ${
                          message.isRead ? 'text-muted' : 'font-semibold text-ink'
                        }`}
                      >
                        {message.subject}
                      </p>
                    </div>
                    {!message.isRead && !message.isArchived && (
                      <span
                        className="mt-1 size-2 shrink-0 rounded-full bg-accent"
                        aria-label="Unread"
                      />
                    )}
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted">
                    {message.message}
                  </p>
                  <p className="mt-2 font-mono text-[0.6rem] uppercase tracking-wide text-muted">
                    {formatDateTime(message.createdAt)}
                  </p>
                </button>
                <div className="mt-3 flex gap-1 border-t border-line pt-2">
                  <button
                    type="button"
                    onClick={() => openMessage(message)}
                    className="btn btn-ghost btn-sm"
                  >
                    <Eye size={13} aria-hidden="true" />
                    Open
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      void updateMessage(
                        message,
                        { isArchived: !message.isArchived },
                        message.isArchived ? 'Message restored.' : 'Message archived.',
                      )
                    }
                    className="btn btn-ghost btn-sm"
                    disabled={busy}
                  >
                    {message.isArchived ? <ArchiveRestore size={13} /> : <Archive size={13} />}
                    {message.isArchived ? 'Restore' : 'Archive'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(message)}
                    className="btn btn-ghost btn-sm ml-auto text-danger hover:bg-danger/10 hover:text-danger"
                  >
                    <Trash2 size={13} aria-hidden="true" />
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>

          <Pagination pagination={query.data.pagination} onPageChange={setPage} />
        </>
      )}

      <Modal
        open={Boolean(active)}
        onClose={() => setActive(null)}
        title={active?.subject ?? 'Message'}
        description={active ? `Received ${formatDateTime(active.createdAt)}` : undefined}
        size="lg"
        footer={
          active && (
            <>
              <button
                type="button"
                className="btn btn-ghost btn-sm text-danger hover:bg-danger/10 hover:text-danger sm:mr-auto"
                onClick={() => setDeleteTarget(active)}
              >
                <Trash2 size={14} aria-hidden="true" />
                Delete
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() =>
                  void updateMessage(
                    active,
                    { isArchived: !active.isArchived },
                    active.isArchived ? 'Message restored.' : 'Message archived.',
                  )
                }
                disabled={busy}
              >
                {active.isArchived ? (
                  <ArchiveRestore size={15} aria-hidden="true" />
                ) : (
                  <Archive size={15} aria-hidden="true" />
                )}
                {active.isArchived ? 'Restore' : 'Archive'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() =>
                  void updateMessage(
                    active,
                    { isRead: !active.isRead },
                    active.isRead ? 'Marked as unread.' : 'Marked as read.',
                  )
                }
                disabled={busy}
              >
                {active.isRead ? <EyeOff size={15} /> : <Eye size={15} />}
                Mark {active.isRead ? 'unread' : 'read'}
              </button>
              <a
                href={`mailto:${encodeURIComponent(active.email)}?subject=${encodeURIComponent(`Re: ${active.subject}`)}`}
                className="btn btn-primary"
              >
                <CornerUpLeft size={15} aria-hidden="true" />
                Reply
              </a>
            </>
          )
        }
      >
        {active && (
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface p-3.5">
              <div className="flex items-center gap-3">
                <span className="inline-flex size-10 items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-accent">
                  {active.name
                    .split(/\s+/)
                    .slice(0, 2)
                    .map((part) => part[0])
                    .join('')
                    .toUpperCase()}
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink">{active.name}</p>
                  <a
                    href={`mailto:${active.email}`}
                    className="text-xs text-accent hover:underline"
                  >
                    {active.email}
                  </a>
                </div>
              </div>
              {active.reason && <span className="badge">{active.reason}</span>}
            </div>

            <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted">
              <div className="flex gap-1.5">
                <dt>Received:</dt>
                <dd className="text-ink">{formatDateTime(active.createdAt)}</dd>
              </div>
              <div className="flex gap-1.5">
                <dt>Status:</dt>
                <dd className="text-ink">
                  {active.isArchived ? 'Archived' : active.isRead ? 'Read' : 'Unread'}
                </dd>
              </div>
            </dl>

            <div className="mt-5 whitespace-pre-wrap border-t border-line pt-5 text-sm leading-7 text-ink">
              {active.message}
            </div>

            <p className="mt-6 flex items-center gap-1.5 text-[0.68rem] text-muted">
              <Mail size={12} aria-hidden="true" />
              Reply directly by email. Messages are stored in the portfolio database.
            </p>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete message"
        message={`Permanently delete the message from “${deleteTarget?.name ?? ''}”? This cannot be undone.`}
        confirmLabel="Delete message"
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void confirmDelete()}
      />

      {query.loading && query.data && (
        <div className="pointer-events-none fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-full border border-line bg-surface px-3 py-1.5 text-xs text-muted shadow-soft">
          <span className="inline-flex items-center gap-1.5">
            <LoaderCircle size={12} className="animate-spin" aria-hidden="true" />
            Refreshing…
          </span>
        </div>
      )}

      <p className="mt-4 flex items-center gap-1 text-[0.68rem] text-muted">
        <ArrowUpRight size={11} aria-hidden="true" />
        New messages appear in the inbox automatically when this page reloads.
      </p>
    </>
  );
};
