import { useMemo, useState } from 'react';
import { FolderCode, Search } from 'lucide-react';
import type { ProjectSummary } from '../types';
import { ProjectCard } from './ProjectCard';
import { SectionHeading } from './SectionHeading';
import { EmptyState } from './States';
import { cn } from '../utils/cn';

const preferredCategories = [
  'Web Applications',
  'Software Development',
  'Database Systems',
  'E-commerce',
  'Academic Projects',
  'Other',
];

export const ProjectsSection = ({ projects }: { projects: ProjectSummary[] }) => {
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');

  const categories = useMemo(() => {
    const available = Array.from(new Set(projects.map((project) => project.category)));
    return [
      'All',
      ...preferredCategories.filter((item) => available.includes(item)),
      ...available.filter((item) => !preferredCategories.includes(item)),
    ];
  }, [projects]);

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();
    return projects.filter((project) => {
      const matchesCategory = category === 'All' || project.category === category;
      const matchesSearch =
        !search ||
        project.title.toLowerCase().includes(search) ||
        project.shortDescription.toLowerCase().includes(search) ||
        project.technologies.some((technology) => technology.toLowerCase().includes(search));
      return matchesCategory && matchesSearch;
    });
  }, [projects, category, query]);

  return (
    <section id="projects" className="section border-t border-line/60">
      <div className="container-page">
        <SectionHeading
          eyebrow="Projects"
          title="Selected work and projects in progress."
          description="Published projects from my portfolio database. Draft work stays private until it is ready."
        />

        {projects.length === 0 ? (
          <EmptyState
            icon={<FolderCode size={20} />}
            title="Projects are being prepared"
            description="No projects have been published yet. Once a project is reviewed and published through the dashboard, it will appear here."
          />
        ) : (
          <>
            <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter projects by category">
                {categories.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setCategory(item)}
                    aria-pressed={category === item}
                    className={cn(
                      'rounded-lg border px-3 py-2 text-xs font-medium transition',
                      category === item
                        ? 'border-accent/40 bg-accent-soft text-accent'
                        : 'border-line bg-surface text-muted hover:border-accent/30 hover:text-ink',
                    )}
                  >
                    {item}
                  </button>
                ))}
              </div>

              <div className="relative w-full lg:max-w-xs">
                <label htmlFor="project-search" className="sr-only">
                  Search projects
                </label>
                <Search
                  size={16}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
                  aria-hidden="true"
                />
                <input
                  id="project-search"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search projects or technologies"
                  className="input pl-10"
                />
              </div>
            </div>

            <p className="mb-5 font-mono text-xs text-muted" aria-live="polite">
              {filtered.length} {filtered.length === 1 ? 'project' : 'projects'} shown
            </p>

            {filtered.length === 0 ? (
              <EmptyState
                title="No projects match those filters"
                description="Try a different category or search term."
                action={
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      setCategory('All');
                      setQuery('');
                    }}
                  >
                    Clear filters
                  </button>
                }
              />
            ) : (
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {filtered.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};
