import { BriefcaseBusiness, ExternalLink, MapPin } from 'lucide-react';
import type { Experience } from '../types';
import { formatDateRange } from '../utils/dates';
import { SectionHeading } from './SectionHeading';
import { EmptyState } from './States';

export const ExperienceSection = ({ experience }: { experience: Experience[] }) => (
  <section id="experience" className="section border-t border-line/60">
    <div className="container-page">
      <SectionHeading
        eyebrow="Experience"
        title="Practical experience, documented honestly."
        description="Internships and professional work, with dates and responsibilities managed in the dashboard."
      />

      {experience.length === 0 ? (
        <EmptyState
          icon={<BriefcaseBusiness size={20} />}
          title="No experience published yet"
          description="Internships and professional roles will appear here once they are added."
        />
      ) : (
        <div className="relative space-y-6 before:absolute before:bottom-4 before:left-[0.3125rem] before:top-4 before:w-px before:bg-line sm:before:left-[0.4375rem]">
          {experience.map((item) => (
            <article key={item.id} className="relative pl-7 sm:pl-10">
              <span
                className="absolute left-0 top-6 size-2.5 rounded-full border-2 border-bg bg-accent ring-1 ring-accent/40 sm:size-3.5"
                aria-hidden="true"
              />
              <div className="card p-5 sm:p-6">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="heading-3">{item.position}</h3>
                    <p className="mt-1 text-sm font-medium text-accent">{item.organization}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                    <span className="badge">{item.type}</span>
                    {item.isCurrent && <span className="badge-accent">Current</span>}
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
                  <span className="font-mono">{formatDateRange(item.startDate, item.endDate, item.isCurrent)}</span>
                  {item.location && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={12} aria-hidden="true" />
                      {item.location}
                    </span>
                  )}
                </div>

                {item.responsibilities.length > 0 && (
                  <ul className="mt-5 space-y-2">
                    {item.responsibilities.map((responsibility) => (
                      <li
                        key={responsibility}
                        className="flex gap-2.5 text-sm leading-6 text-muted"
                      >
                        <span
                          className="mt-2.5 size-1 shrink-0 rounded-full bg-accent/70"
                          aria-hidden="true"
                        />
                        {responsibility}
                      </li>
                    ))}
                  </ul>
                )}

                {item.achievements.length > 0 && (
                  <div className="mt-4 rounded-xl border border-line bg-bg p-4">
                    <h4 className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-muted">
                      Achievements
                    </h4>
                    <ul className="mt-2 space-y-1.5">
                      {item.achievements.map((achievement) => (
                        <li key={achievement} className="text-sm leading-6 text-muted">
                          {achievement}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {item.technologies.length > 0 && (
                  <ul className="mt-4 flex flex-wrap gap-1.5">
                    {item.technologies.map((technology) => (
                      <li key={technology} className="badge">
                        {technology}
                      </li>
                    ))}
                  </ul>
                )}

                {item.evidenceUrl && (
                  <a
                    href={item.evidenceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:underline"
                  >
                    Supporting evidence
                    <ExternalLink size={12} aria-hidden="true" />
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  </section>
);
