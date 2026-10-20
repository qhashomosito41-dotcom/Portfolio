import { Link } from 'react-router-dom';
import { ArrowUpRight, FolderCode, Star } from 'lucide-react';
import type { ProjectSummary } from '../types';
import { cn } from '../utils/cn';

const statusStyles: Record<string, string> = {
  Completed: 'bg-success',
  'In Progress': 'bg-warning',
  Planned: 'bg-accent',
  Archived: 'bg-muted',
};

export const ProjectCard = ({ project }: { project: ProjectSummary }) => (
  <article className="card card-hover group relative flex h-full flex-col overflow-hidden">
    <div className="relative aspect-[16/10] overflow-hidden border-b border-line bg-surface2">
      {project.coverImage?.url ? (
        <img
          src={project.coverImage.url}
          alt={project.coverImage.altText ?? `${project.title} preview`}
          loading="lazy"
          decoding="async"
          className="size-full object-cover transition duration-500 group-hover:scale-[1.03]"
        />
      ) : (
        <div className="flex size-full items-center justify-center bg-[radial-gradient(circle_at_65%_20%,hsl(var(--accent)/0.18),transparent_55%),linear-gradient(145deg,hsl(var(--surface-2)),hsl(var(--surface)))]">
          <FolderCode size={38} className="text-accent/70" aria-hidden="true" />
        </div>
      )}
      <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
        <span className="badge border-bg/20 bg-bg/80 backdrop-blur">{project.category}</span>
        {project.featured && (
          <span className="badge-accent border-bg/20 bg-bg/85 backdrop-blur">
            <Star size={11} fill="currentColor" aria-hidden="true" />
            Featured
          </span>
        )}
      </div>
    </div>

    <div className="flex flex-1 flex-col p-5">
      <h3 className="text-lg font-semibold tracking-[-0.015em] text-ink">
        <Link
          to={`/projects/${project.slug}`}
          className="outline-none after:absolute after:inset-0 after:content-[''] hover:text-accent focus-visible:text-accent"
        >
          {project.title}
        </Link>
      </h3>
      <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted">{project.shortDescription}</p>

      {project.technologies.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-1.5">
          {project.technologies.slice(0, 4).map((technology) => (
            <li key={technology} className="badge px-2 py-0.5 text-[0.65rem]">
              {technology}
            </li>
          ))}
          {project.technologies.length > 4 && (
            <li className="badge px-2 py-0.5 text-[0.65rem]">
              +{project.technologies.length - 4}
            </li>
          )}
        </ul>
      )}

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-line/70 pt-4 text-xs text-muted">
        <span className="inline-flex items-center gap-1.5">
          <span
            className={cn('size-1.5 rounded-full', statusStyles[project.projectStatus] ?? 'bg-accent')}
            aria-hidden="true"
          />
          {project.projectStatus}
        </span>
        <span className="inline-flex items-center gap-1 font-medium text-ink transition group-hover:text-accent">
          Details
          <ArrowUpRight size={13} aria-hidden="true" />
        </span>
      </div>
    </div>
  </article>
);
