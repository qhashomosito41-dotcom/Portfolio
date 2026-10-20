import { Award, ExternalLink, FileBadge } from 'lucide-react';
import type { Certification } from '../types';
import { formatMonthYear } from '../utils/dates';
import { SectionHeading } from './SectionHeading';
import { EmptyState } from './States';

export const CertificationsSection = ({
  certifications,
}: {
  certifications: Certification[];
}) => (
  <section id="certifications" className="section border-t border-line/60">
    <div className="container-page">
      <SectionHeading
        eyebrow="Certifications & courses"
        title="Continuous learning, verified before it is published."
        description="Courses and certificates that are relevant to my development work. Only reviewed records appear publicly."
      />

      {certifications.length === 0 ? (
        <EmptyState
          icon={<Award size={20} />}
          title="Certifications are being verified"
          description="Course records are kept as drafts until the provider, completion date, and certificate details have been confirmed."
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {certifications.map((certification) => (
            <article key={certification.id} className="card flex h-full flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="icon-box" aria-hidden="true">
                  <Award size={19} />
                </div>
                {certification.completionDate && (
                  <span className="font-mono text-[0.68rem] text-muted">
                    {formatMonthYear(certification.completionDate)}
                  </span>
                )}
              </div>
              <h3 className="mt-4 text-base font-semibold leading-6 text-ink">
                {certification.title}
              </h3>
              <p className="mt-1 text-sm text-accent">{certification.provider}</p>
              {certification.description && (
                <p className="mt-3 text-sm leading-6 text-muted">{certification.description}</p>
              )}
              {certification.credentialId && (
                <p className="mt-3 font-mono text-[0.68rem] text-muted">
                  Credential: {certification.credentialId}
                </p>
              )}
              <div className="mt-auto flex flex-wrap gap-3 pt-4">
                {certification.verificationUrl && (
                  <a
                    href={certification.verificationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:underline"
                  >
                    Verify credential
                    <ExternalLink size={12} aria-hidden="true" />
                  </a>
                )}
                {certification.certificateUrl && (
                  <a
                    href={certification.certificateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-muted transition hover:text-accent"
                  >
                    <FileBadge size={13} aria-hidden="true" />
                    View certificate
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
