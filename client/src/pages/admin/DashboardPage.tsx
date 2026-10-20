import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  BriefcaseBusiness,
  FileText,
  FolderKanban,
  GraduationCap,
  Mail,
  Plus,
  UserRound,
  Wrench,
} from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useAuth } from '../../contexts/AuthContext';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { ErrorState, LoadingState } from '../../components/States';
import { formatFullDate } from '../../utils/dates';

const statCards = [
  { key: 'totalProjects', label: 'Projects', icon: FolderKanban, to: '/admin/projects' },
  { key: 'totalSkills', label: 'Skills', icon: Wrench, to: '/admin/skills' },
  { key: 'totalExperience', label: 'Experience', icon: BriefcaseBusiness, to: '/admin/experience' },
  { key: 'totalEducation', label: 'Education', icon: GraduationCap, to: '/admin/education' },
  { key: 'totalCertifications', label: 'Certifications', icon: Award, to: '/admin/certifications' },
] as const;

export const DashboardPage = () => {
  const { admin } = useAuth();
  const query = useApiQuery(() => adminApi.dashboard(), []);
  const data = query.data;

  return (
    <>
      <AdminPageHeader
        eyebrow="Overview"
        title={`Welcome back${admin?.name ? `, ${admin.name.split(' ')[0]}` : ''}.`}
        description="A snapshot of your portfolio content and the latest enquiries."
        actions={
          <>
            <Link to="/admin/messages" className="btn btn-secondary btn-sm">
              <Mail size={14} aria-hidden="true" />
              Inbox
            </Link>
            <Link to="/admin/projects/new" className="btn btn-primary btn-sm">
              <Plus size={14} aria-hidden="true" />
              New project
            </Link>
          </>
        }
      />

      {query.loading && !data ? (
        <div className="card p-10">
          <LoadingState label="Loading dashboard…" />
        </div>
      ) : query.error || !data ? (
        <ErrorState message="The dashboard could not be loaded." onRetry={query.refetch} />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
            {statCards.map((card) => (
              <Link key={card.key} to={card.to} className="card card-hover p-4">
                <div className="flex items-center justify-between">
                  <span className="icon-box size-9">
                    <card.icon size={16} aria-hidden="true" />
                  </span>
                  <ArrowRight size={14} className="text-muted" aria-hidden="true" />
                </div>
                <p className="mt-4 text-2xl font-semibold tracking-tight text-ink">
                  {data.stats[card.key]}
                </p>
                <p className="text-xs text-muted">{card.label}</p>
              </Link>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <section className="card p-5 lg:col-span-2" aria-labelledby="recent-messages-title">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 id="recent-messages-title" className="text-sm font-semibold text-ink">
                    Recent messages
                  </h2>
                  <p className="mt-0.5 text-xs text-muted">
                    {data.stats.unreadMessages} unread of {data.stats.totalMessages} total
                  </p>
                </div>
                <Link
                  to="/admin/messages"
                  className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
                >
                  View all
                  <ArrowRight size={13} aria-hidden="true" />
                </Link>
              </div>

              {data.recentMessages.length === 0 ? (
                <div className="mt-6 rounded-xl border border-dashed border-line p-8 text-center">
                  <Mail size={20} className="mx-auto text-muted" aria-hidden="true" />
                  <p className="mt-2 text-sm text-muted">No messages have been received yet.</p>
                </div>
              ) : (
                <ul className="mt-4 divide-y divide-line">
                  {data.recentMessages.map((message) => (
                    <li key={message.id}>
                      <Link
                        to="/admin/messages"
                        className="flex items-start gap-3 rounded-lg px-2 py-3 transition hover:bg-surface2"
                      >
                        <span
                          className={`mt-1.5 size-2 shrink-0 rounded-full ${
                            message.isRead ? 'bg-line' : 'bg-accent'
                          }`}
                          aria-label={message.isRead ? 'Read' : 'Unread'}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                            <span className="text-sm font-medium text-ink">{message.subject}</span>
                            <span className="text-[0.68rem] text-muted">
                              {formatFullDate(message.createdAt)}
                            </span>
                          </span>
                          <span className="mt-0.5 block truncate text-xs text-muted">
                            {message.name} · {message.email}
                          </span>
                          <span className="mt-1 line-clamp-2 block text-xs leading-5 text-muted/85">
                            {message.message}
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <div className="space-y-4">
              <section className="card p-5" aria-labelledby="cv-status-title">
                <div className="flex items-center justify-between">
                  <h2 id="cv-status-title" className="text-sm font-semibold text-ink">
                    CV status
                  </h2>
                  <FileText size={16} className="text-accent" aria-hidden="true" />
                </div>
                {data.cv ? (
                  <div className="mt-3">
                    <p className="truncate text-sm font-medium text-ink">{data.cv.title}</p>
                    <p className="mt-1 text-xs text-muted">
                      Updated {formatFullDate(data.cv.uploadedAt)}
                    </p>
                    <p className="mt-3">
                      <span className={`badge ${data.cv.isPublic ? 'badge-accent' : ''}`}>
                        {data.cv.isPublic ? 'Publicly downloadable' : 'Private'}
                      </span>
                    </p>
                  </div>
                ) : (
                  <p className="mt-3 text-xs leading-5 text-muted">
                    No CV has been uploaded yet. Visitors cannot download a CV until one is added.
                  </p>
                )}
                <Link to="/admin/cv" className="btn btn-secondary btn-sm mt-4 w-full">
                  Manage CV
                </Link>
              </section>

              <section className="card p-5" aria-labelledby="quick-actions-title">
                <h2 id="quick-actions-title" className="text-sm font-semibold text-ink">
                  Quick actions
                </h2>
                <div className="mt-3 grid gap-1.5">
                  {[
                    { to: '/admin/profile', label: 'Edit profile', icon: UserRound },
                    { to: '/admin/projects/new', label: 'Add a project', icon: FolderKanban },
                    { to: '/admin/settings', label: 'Site settings', icon: Award },
                  ].map((action) => (
                    <Link
                      key={action.to}
                      to={action.to}
                      className="flex items-center gap-2 rounded-lg px-2 py-2 text-xs font-medium text-muted transition hover:bg-surface2 hover:text-ink"
                    >
                      <action.icon size={14} aria-hidden="true" />
                      {action.label}
                    </Link>
                  ))}
                </div>
              </section>
            </div>
          </div>

          <section className="card p-5" aria-labelledby="recent-projects-title">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 id="recent-projects-title" className="text-sm font-semibold text-ink">
                  Recent projects
                </h2>
                <p className="mt-0.5 text-xs text-muted">
                  {data.stats.publishedProjects} published · {data.stats.draftProjects} draft
                </p>
              </div>
              <Link
                to="/admin/projects"
                className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
              >
                Manage projects
                <ArrowRight size={13} aria-hidden="true" />
              </Link>
            </div>

            {data.recentProjects.length === 0 ? (
              <div className="mt-5 rounded-xl border border-dashed border-line p-8 text-center">
                <FolderKanban size={20} className="mx-auto text-muted" aria-hidden="true" />
                <p className="mt-2 text-sm text-muted">No projects have been added yet.</p>
                <Link to="/admin/projects/new" className="btn btn-primary btn-sm mt-4">
                  <Plus size={14} aria-hidden="true" />
                  Create the first project
                </Link>
              </div>
            ) : (
              <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {data.recentProjects.slice(0, 6).map((project) => (
                  <li key={project.id}>
                    <Link
                      to={`/admin/projects/${project.id}`}
                      className="flex items-start gap-3 rounded-xl border border-line bg-bg p-3.5 transition hover:border-accent/35 hover:bg-surface2"
                    >
                      <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
                        <FolderKanban size={15} aria-hidden="true" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-ink">
                          {project.title}
                        </span>
                        <span className="mt-0.5 block text-xs text-muted">
                          {project.category} · {project.published ? 'Published' : 'Draft'}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </>
  );
};
