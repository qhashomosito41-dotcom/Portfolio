import { GraduationCap, MapPin, Target, Wrench } from 'lucide-react';
import type { PublicProfile } from '../types';
import { SectionHeading } from './SectionHeading';

const paragraphs = (value: string | null | undefined) =>
  (value ?? '')
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

export const AboutSection = ({ profile }: { profile: PublicProfile }) => {
  const bioParagraphs = paragraphs(profile.biography);
  const facts = [
    profile.academicBackground && {
      icon: GraduationCap,
      label: 'Academic background',
      value: profile.academicBackground,
    },
    profile.approach && { icon: Wrench, label: 'How I work', value: profile.approach },
    profile.careerObjectives && {
      icon: Target,
      label: 'Career objective',
      value: profile.careerObjectives,
    },
    profile.location && { icon: MapPin, label: 'Location', value: profile.location },
  ].filter(Boolean) as { icon: typeof GraduationCap; label: string; value: string }[];

  return (
    <section id="about" className="section border-t border-line/60">
      <div className="container-page">
        <SectionHeading
          eyebrow="About me"
          title="Curious about how software can solve real problems."
          description="A snapshot of my background, the way I work, and where I am heading."
        />

        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          <div className="space-y-4">
            {bioParagraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 48)} className="text-[1.02rem] leading-8 text-muted">
                {paragraph}
              </p>
            ))}
            {bioParagraphs.length === 0 && (
              <p className="text-muted">Biography content is being prepared.</p>
            )}

            {profile.professionalInterests.length > 0 && (
              <div className="pt-4">
                <h3 className="font-mono text-[0.68rem] font-medium uppercase tracking-[0.18em] text-muted">
                  Professional interests
                </h3>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {profile.professionalInterests.map((interest) => (
                    <li key={interest} className="badge">
                      {interest}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {facts.map((fact) => {
              const Icon = fact.icon;
              return (
                <div key={fact.label} className="card flex gap-4 p-5">
                  <div className="icon-box" aria-hidden="true">
                    <Icon size={18} />
                  </div>
                  <div>
                    <h3 className="font-mono text-[0.65rem] font-medium uppercase tracking-[0.14em] text-muted">
                      {fact.label}
                    </h3>
                    <p className="mt-1.5 text-sm leading-6 text-ink">{fact.value}</p>
                  </div>
                </div>
              );
            })}
            {facts.length === 0 && (
              <div className="card p-6">
                <p className="text-sm leading-6 text-muted">
                  More background details are being prepared.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
