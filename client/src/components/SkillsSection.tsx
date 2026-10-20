import { Code2, Database, Globe2, Sparkles, Wrench } from 'lucide-react';
import type { Skill } from '../types';
import { SectionHeading } from './SectionHeading';
import { EmptyState } from './States';

const categoryMeta: Record<string, { icon: typeof Code2; description: string }> = {
  'Programming Languages': {
    icon: Code2,
    description: 'Languages I use to reason about problems and build solutions.',
  },
  'Web Development': {
    icon: Globe2,
    description: 'Technologies for building responsive, accessible web experiences.',
  },
  Databases: {
    icon: Database,
    description: 'Designing, querying, and working with relational data.',
  },
  'Tools & Platforms': {
    icon: Wrench,
    description: 'Daily tools for development, testing, and version control.',
  },
  'Additional Areas': {
    icon: Sparkles,
    description: 'Practices that make software faster, clearer, and easier to use.',
  },
};

export const SkillsSection = ({ skills }: { skills: Skill[] }) => {
  const categories = Array.from(new Set(skills.map((skill) => skill.category)));
  const ordered = [
    ...Object.keys(categoryMeta).filter((category) => categories.includes(category)),
    ...categories.filter((category) => !(category in categoryMeta)),
  ];

  return (
    <section id="skills" className="section border-t border-line/60">
      <div className="container-page">
        <SectionHeading
          eyebrow="Technical skills"
          title="A practical toolkit, built through study and hands-on work."
          description="Grouped by area rather than arbitrary percentages. Every item is managed as an editable record."
        />

        {skills.length === 0 ? (
          <EmptyState
            title="Skills are being updated"
            description="Technical skills will appear here once they are added through the administrator dashboard."
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {ordered.map((category) => {
              const meta = categoryMeta[category] ?? {
                icon: Wrench,
                description: 'Additional tools and capabilities.',
              };
              const Icon = meta.icon;
              const items = skills.filter((skill) => skill.category === category);
              return (
                <div key={category} className="card p-6">
                  <div className="flex items-start gap-3">
                    <div className="icon-box" aria-hidden="true">
                      <Icon size={18} />
                    </div>
                    <div>
                      <h3 className="heading-3">{category}</h3>
                      <p className="mt-1 text-xs leading-5 text-muted">{meta.description}</p>
                    </div>
                  </div>
                  <ul className="mt-5 flex flex-wrap gap-2">
                    {items.map((skill) => (
                      <li
                        key={skill.id}
                        className="group inline-flex items-center gap-2 rounded-lg border border-line bg-bg px-3 py-2 text-sm font-medium text-ink transition hover:border-accent/35 hover:bg-surface2"
                        title={skill.context ?? undefined}
                      >
                        <span
                          className="size-1.5 rounded-full bg-accent/80"
                          aria-hidden="true"
                        />
                        <span>{skill.name}</span>
                        {skill.proficiencyLabel && (
                          <span className="font-mono text-[0.6rem] uppercase tracking-wide text-muted">
                            {skill.proficiencyLabel}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
