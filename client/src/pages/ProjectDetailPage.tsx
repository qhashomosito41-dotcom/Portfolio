import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  CircleDot,
  ExternalLink,
  Github,
  Lightbulb,
  ListChecks,
  Wrench,
} from 'lucide-react';
import { useApiQuery } from '../hooks/useApiQuery';
import { getProject } from '../services/publicApi';
import { Seo } from '../components/Seo';
import { LoadingState } from '../components/States';
import { formatDateRange, formatMonthYear } from '../utils/dates';

const paragraphList = (value: string | null | undefined) =>
  (value ?? '')
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

export const ProjectDetailPage = () => {
  const { slug = '' } = useParams();
  const query = useApiQuery(() => getProject(slug), [slug]);
  const project = query.data;

  const jsonLd = useMemo(() => {
    if (!project) return null;
    const origin = window.location.origin;
    return {
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      name: project.title,
      description: project.shortDescription,
      url: `${origin}/projects/${project.slug}`,
      ...(project.startDate ? { dateCreated: project.startDate } : {}),
      ...(project.technologies.length > 0 ? { keywords: project.technologies.join(', ') } : {}),
      ...(project.coverImage?.url
        ? { image: `${origin}${project.coverImage.url}` }
        : {}),
    };
  }, [project]);

  if (query.loading && !project) {
    return (
      <div className="container-page flex min-h-[60vh] items-center justify-center">
        <LoadingState label="Loading project…" />
      </div>
    );
  }

  if (query.error || !project) {
    return (
      <div className="container-page py-24">
        <div className="mx-auto max-w-lg text-center">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">404 · Project</p>
          <h1 className="heading-2 mt-3">This project is not available.</h1>
          <p className="body-text mt-3">
            The project may be unpublished, renamed, or no longer available.
          </p>
          <Link to="/#projects" className="btn btn-primary mt-6">
            <ArrowLeft size={16} aria-hidden="true" />
            Back to projects
          </Link>
        </div>
      </div>
    );
  }

  const gallery = project.images.filter((image) => image.id !== project.coverImage?.id);
  const features = project.keyFeatures;
  const descriptionParagraphs = paragraphList(project.fullDescription);

  return (
    <>
      <Seo
        title={`${project.title} | Mosito Qhasho`}
        description={project.shortDescription}
        path={`/projects/${project.slug}`}
        type="article"
        image={project.coverImage?.url}
        jsonLd={jsonLd}
      />

      <article className="pb-20 pt-10 sm:pt-14">
        <div className="container-page">
          <Link
            to="/#projects"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-accent"
          >
            <ArrowLeft size={15} aria-hidden="true" />
            All projects
          </Link>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_20rem] lg:items-start">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="badge-accent">{project.category}</span>
                <span className="badge">
                  <CircleDot size={11} aria-hidden="true" />
                  {project.projectStatus}
                </span>
                {project.featured && <span className="badge">Featured</span>}
              </div>

              <h1 className="heading-1 mt-5 text-4xl sm:text-5xl">{project.title}</h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">
                {project.shortDescription}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary btn-sm"
                  >
                    View live project
                    <ArrowUpRight size={14} aria-hidden="true" />
                  </a>
                )}
                {project.repositoryUrl && (
                  <a
                    href={project.repositoryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary btn-sm"
                  >
                    <Github size={14} aria-hidden="true" />
                    Source code
                  </a>
                )}
              </div>
            </div>

            <aside className="card p-5">
              <h2 className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted">
                Project details
              </h2>
              <dl className="mt-4 space-y-4 text-sm">
                <div>
                  <dt className="text-xs text-muted">Timeline</dt>
                  <dd className="mt-0.5 flex items-center gap-1.5 text-ink">
                    <CalendarDays size={13} className="text-accent" aria-hidden="true" />
                    {formatDateRange(project.startDate, project.endDate)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted">Last updated</dt>
                  <dd className="mt-0.5 text-ink">{formatMonthYear(project.updatedAt)}</dd>
                </div>
                {project.technologies.length > 0 && (
                  <div>
                    <dt className="text-xs text-muted">Technologies</dt>
                    <dd className="mt-2 flex flex-wrap gap-1.5">
                      {project.technologies.map((technology) => (
                        <span key={technology} className="badge">
                          {technology}
                        </span>
                      ))}
                    </dd>
                  </div>
                )}
              </dl>
            </aside>
          </div>

          <div className="mt-10 overflow-hidden rounded-2xl border border-line bg-surface shadow-soft">
            {project.coverImage?.url ? (
              <img
                src={project.coverImage.url}
                alt={project.coverImage.altText ?? `${project.title} cover image`}
                className="max-h-[34rem] w-full object-cover"
              />
            ) : (
              <div className="flex min-h-64 items-center justify-center bg-[radial-gradient(circle_at_50%_20%,hsl(var(--accent)/0.16),transparent_60%),linear-gradient(145deg,hsl(var(--surface-2)),hsl(var(--surface)))]">
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
                  {project.category}
                </span>
              </div>
            )}
          </div>

          <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_20rem]">
            <div>
              <section aria-labelledby="project-overview">
                <h2 id="project-overview" className="heading-3 flex items-center gap-2">
                  <span className="icon-box size-8" aria-hidden="true">
                    <Wrench size={14} />
                  </span>
                  Overview
                </h2>
                <div className="mt-4 space-y-4 text-[0.98rem] leading-8 text-muted">
                  {descriptionParagraphs.map((paragraph) => (
                    <p key={paragraph.slice(0, 40)}>{paragraph}</p>
                  ))}
                </div>
              </section>

              {features.length > 0 && (
                <section className="mt-10" aria-labelledby="project-features">
                  <h2 id="project-features" className="heading-3 flex items-center gap-2">
                    <span className="icon-box size-8" aria-hidden="true">
                      <ListChecks size={14} />
                    </span>
                    Key features
                  </h2>
                  <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
                    {features.map((feature) => (
                      <li
                        key={feature}
                        className="flex gap-2.5 rounded-xl border border-line bg-surface p-3.5 text-sm leading-6 text-muted"
                      >
                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {(project.challenges || project.solutions) && (
                <div className="mt-10 grid gap-4 sm:grid-cols-2">
                  {project.challenges && (
                    <section className="card p-5">
                      <h2 className="heading-3 flex items-center gap-2 text-base">
                        <span className="icon-box size-8" aria-hidden="true">
                          <Lightbulb size={14} />
                        </span>
                        Challenges
                      </h2>
                      <p className="mt-3 whitespace-pre-line text-sm leading-7 text-muted">
                        {project.challenges}
                      </p>
                    </section>
                  )}
                  {project.solutions && (
                    <section className="card p-5">
                      <h2 className="heading-3 flex items-center gap-2 text-base">
                        <span className="icon-box size-8" aria-hidden="true">
                          <Wrench size={14} />
                        </span>
                        Solutions
                      </h2>
                      <p className="mt-3 whitespace-pre-line text-sm leading-7 text-muted">
                        {project.solutions}
                      </p>
                    </section>
                  )}
                </div>
              )}

              {gallery.length > 0 && (
                <section className="mt-10" aria-labelledby="project-gallery">
                  <h2 id="project-gallery" className="heading-3">
                    Project gallery
                  </h2>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    {gallery.map((image) =>
                      image.url ? (
                        <figure key={image.id} className="overflow-hidden rounded-xl border border-line bg-surface">
                          <img
                            src={image.url}
                            alt={image.altText ?? `${project.title} screenshot`}
                            loading="lazy"
                            className="w-full object-cover"
                          />
                          {image.altText && (
                            <figcaption className="border-t border-line px-3 py-2 text-xs text-muted">
                              {image.altText}
                            </figcaption>
                          )}
                        </figure>
                      ) : null,
                    )}
                  </div>
                </section>
              )}
            </div>

            <aside className="space-y-4">
              {project.contribution && (
                <section className="card p-5">
                  <h2 className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted">
                    My contribution
                  </h2>
                  <p className="mt-3 whitespace-pre-line text-sm leading-7 text-muted">
                    {project.contribution}
                  </p>
                </section>
              )}
              <section className="card p-5">
                <h2 className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted">
                  Links
                </h2>
                <div className="mt-3 space-y-2">
                  {project.liveUrl ? (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-accent hover:underline"
                    >
                      <ExternalLink size={14} aria-hidden="true" />
                      Live demonstration
                    </a>
                  ) : (
                    <p className="text-xs text-muted">No live link has been provided.</p>
                  )}
                  {project.repositoryUrl ? (
                    <a
                      href={project.repositoryUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-accent hover:underline"
                    >
                      <Github size={14} aria-hidden="true" />
                      Source repository
                    </a>
                  ) : (
                    <p className="text-xs text-muted">No repository link has been provided.</p>
                  )}
                </div>
              </section>
            </aside>
          </div>

          <div className="mt-14 border-t border-line pt-8">
            <Link to="/#projects" className="btn btn-secondary">
              <ArrowLeft size={15} aria-hidden="true" />
              Back to all projects
            </Link>
          </div>
        </div>
      </article>
    </>
  );
};
