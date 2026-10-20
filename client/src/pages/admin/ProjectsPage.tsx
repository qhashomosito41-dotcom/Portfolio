import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  Eye,
  EyeOff,
  FolderKanban,
  LoaderCircle,
  Pencil,
  Plus,
  Search,
  Star,
  Trash2,
} from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { useToast } from '../../contexts/ToastContext';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { Pagination } from '../../components/admin/Pagination';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { EmptyState, ErrorState, LoadingState } from '../../components/States';
import { PROJECT_CATEGORIES, PROJECT_STATUSES } from '../../utils/constants';
import { formatFullDate, toDateInputValue } from '../../utils/dates';
import type { AdminProject } from '../../types';

const projectPayload = (project: AdminProject, overrides: Record<string, unknown> = {}) => ({
  title: project.title,
  slug: project.slug,
  shortDescription: project.shortDescription,
  fullDescription: project.fullDescription,
  category: project.category,
  projectStatus: project.projectStatus,
  contribution: project.contribution,
  keyFeatures: project.keyFeatures,
  challenges: project.challenges,
  solutions: project.solutions,
  technologies: project.technologies,
  repositoryUrl: project.repositoryUrl,
  liveUrl: project.liveUrl,
  startDate: toDateInputValue(project.startDate),
  endDate: toDateInputValue(project.endDate),
  featured: project.featured,
  published: project.published,
  ...overrides,
});

export const ProjectsPage = () => {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);
  const [state, setState] = useState<'all' | 'published' | 'draft' | 'featured'>('all');
  const [page, setPage] = useState(1);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminProject | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { pushToast } = useToast();

  const query = useApiQuery(() => {
    const params = new URLSearchParams({ page: String(page), pageSize: '10', state });
    if (debouncedSearch.trim()) params.set('q', debouncedSearch.trim());
    return adminApi.listProjects(params);
  }, [page, state, debouncedSearch]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, state]);

  const updateState = async (
    project: AdminProject,
    overrides: Record<string, unknown>,
    message: string,
  ) => {
    setBusyId(project.id);
    try {
      const updated = await adminApi.updateProject(project.id, projectPayload(project, overrides));
      query.setData((current) =>
        current
          ? {
              ...current,
              items: current.items.map((item) => (item.id === updated.id ? updated : item)),
            }
          : current,
      );
      pushToast(message);
    } catch (error) {
      pushToast(
        error instanceof Error ? error.message : 'The project could not be updated.',
        'error',
      );
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminApi.deleteProject(deleteTarget.id);
      pushToast('Project deleted.', 'info');
      setDeleteTarget(null);
      query.refetch();
    } catch (error) {
      pushToast(
        error instanceof Error ? error.message : 'The project could not be deleted.',
        'error',
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <AdminPageHeader
        eyebrow="Content"
        title="Projects"
        description="Publish case studies with screenshots, technologies and links. Drafts stay hidden from visitors."
        actions={
          <Link to="/admin/projects/new" className="btn btn-primary btn-sm">
            <Plus size={14} aria-hidden="true" />
            New project
          </Link>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            aria-hidden="true"
          />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="input pl-9"
            placeholder="Search projects…"
            aria-label="Search projects"
          />
        </div>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by status">
          {(
            [
              ['all', 'All'],
              ['published', 'Published'],
              ['draft', 'Drafts'],
              ['featured', 'Featured'],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setState(value)}
              className={`btn btn-sm ${state === value ? 'btn-primary' : 'btn-secondary'}`}
              aria-pressed={state === value}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {query.loading && !query.data ? (
        <div className="card p-10">
          <LoadingState label="Loading projects…" />
        </div>
      ) : query.error ? (
        <ErrorState message="Projects could not be loaded." onRetry={query.refetch} />
      ) : !query.data || query.data.items.length === 0 ? (
        <EmptyState
          title={search || state !== 'all' ? 'No matching projects' : 'No projects yet'}
          description={
            search || state !== 'all'
              ? 'Try a different search term or filter.'
              : 'Create your first case study to show your work on the portfolio.'
          }
          icon={<FolderKanban size={20} />}
          action={
            <Link to="/admin/projects/new" className="btn btn-primary btn-sm">
              <Plus size={14} aria-hidden="true" />
              Create a project
            </Link>
          }
        />
      ) : (
        <>
          <div className="table-shell">
            <table className="data-table">
              <caption className="sr-only">Portfolio projects</caption>
              <thead>
                <tr>
                  <th scope="col">Project</th>
                  <th scope="col">Category</th>
                  <th scope="col">Status</th>
                  <th scope="col">Visibility</th>
                  <th scope="col">Updated</th>
                  <th scope="col" className="text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {query.data.items.map((project) => (
                  <tr key={project.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="size-11 shrink-0 overflow-hidden rounded-lg border border-line bg-surface2">
                          {project.coverImage?.url ? (
                            <img
                              src={project.coverImage.url}
                              alt=""
                              className="size-full object-cover"
                            />
                          ) : (
                            <div className="flex size-full items-center justify-center text-muted">
                              <FolderKanban size={16} aria-hidden="true" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <Link
                            to={`/admin/projects/${project.id}`}
                            className="block max-w-[15rem] truncate text-sm font-medium text-ink hover:text-accent"
                          >
                            {project.title}
                          </Link>
                          <div className="mt-0.5 flex items-center gap-1.5">
                            <span className="max-w-[13rem] truncate font-mono text-[0.65rem] text-muted">
                              /{project.slug}
                            </span>
                            {project.featured && (
                              <Star
                                size={11}
                                className="fill-warning text-warning"
                                aria-label="Featured"
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap text-xs text-muted">{project.category}</td>
                    <td>
                      <span className="badge whitespace-nowrap">{project.projectStatus}</span>
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() =>
                          void updateState(
                            project,
                            { published: !project.published },
                            project.published ? 'Project unpublished.' : 'Project published.',
                          )
                        }
                        disabled={busyId === project.id}
                        className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                          project.published ? 'text-success' : 'text-muted'
                        } hover:underline`}
                        title={project.published ? 'Unpublish project' : 'Publish project'}
                      >
                        {busyId === project.id ? (
                          <LoaderCircle size={13} className="animate-spin" aria-hidden="true" />
                        ) : project.published ? (
                          <Eye size={13} aria-hidden="true" />
                        ) : (
                          <EyeOff size={13} aria-hidden="true" />
                        )}
                        {project.published ? 'Published' : 'Draft'}
                      </button>
                    </td>
                    <td className="whitespace-nowrap text-xs text-muted">
                      {formatFullDate(project.updatedAt)}
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        {project.published && (
                          <a
                            href={`/projects/${project.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex size-8 items-center justify-center rounded-lg text-muted transition hover:bg-surface2 hover:text-ink"
                            aria-label={`View ${project.title} on the public site`}
                          >
                            <ArrowUpRight size={14} aria-hidden="true" />
                          </a>
                        )}
                        <Link
                          to={`/admin/projects/${project.id}`}
                          className="inline-flex size-8 items-center justify-center rounded-lg text-muted transition hover:bg-surface2 hover:text-ink"
                          aria-label={`Edit ${project.title}`}
                        >
                          <Pencil size={14} aria-hidden="true" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(project)}
                          className="inline-flex size-8 items-center justify-center rounded-lg text-muted transition hover:bg-danger/10 hover:text-danger"
                          aria-label={`Delete ${project.title}`}
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
          <Pagination pagination={query.data.pagination} onPageChange={setPage} />
        </>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete project"
        message={`Delete “${deleteTarget?.title ?? ''}” and all of its uploaded images? This cannot be undone.`}
        confirmLabel="Delete project"
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void handleDelete()}
      />

      <p className="mt-4 text-[0.68rem] text-muted">
        Categories: {PROJECT_CATEGORIES.join(' · ')}. Statuses: {PROJECT_STATUSES.join(' · ')}.
      </p>
    </>
  );
};
