import { GraduationCap, MapPin } from 'lucide-react';
import type { Education } from '../types';
import { formatDateRange } from '../utils/dates';
import { SectionHeading } from './SectionHeading';
import { EmptyState } from './States';

export const EducationSection = ({ education }: { education: Education[] }) => (
  <section id="education" className="section border-t border-line/60">
    <div className="container-page">
      <SectionHeading
        eyebrow="Education"
        title="Academic foundation."
        description="Formal study in computing, with current status and dates kept up to date."
      />

      {education.length === 0 ? (
        <EmptyState
          icon={<GraduationCap size={20} />}
          title="Education details coming soon"
          description="Academic qualifications will appear here once they are published."
        />
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {education.map((item) => (
            <article key={item.id} className="card flex gap-5 p-6">
              <div className="icon-box size-12" aria-hidden="true">
                <GraduationCap size={22} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="heading-3">{item.qualification}</h3>
                    <p className="mt-1 text-sm font-medium text-accent">{item.institution}</p>
                  </div>
                  {item.isCurrent && <span className="badge-accent">In progress</span>}
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
                  <span className="font-mono">
                    {formatDateRange(item.startDate, item.endDate, item.isCurrent)}
                  </span>
                  {item.location && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={12} aria-hidden="true" />
                      {item.location}
                    </span>
                  )}
                </div>

                {item.description && (
                  <p className="mt-4 text-sm leading-6 text-muted">{item.description}</p>
                )}

                {item.modules.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-muted">
                      Relevant modules
                    </h4>
                    <ul className="mt-2 flex flex-wrap gap-1.5">
                      {item.modules.map((module) => (
                        <li key={module} className="badge">
                          {module}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {item.achievements.length > 0 && (
                  <ul className="mt-4 space-y-1.5">
                    {item.achievements.map((achievement) => (
                      <li key={achievement} className="text-sm leading-6 text-muted">
                        {achievement}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  </section>
);
