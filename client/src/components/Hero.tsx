import { Link } from 'react-router-dom';
import { ArrowRight, Code2, Database, Mail, MapPin, Search, Sparkles } from 'lucide-react';
import type { CvInfo, PublicProfile } from '../types';
import { ProfileAvatar } from './ProfileAvatar';
import { CvDownloadButton } from './CvDownloadButton';

const floatingChips = [
  { label: 'TypeScript', icon: Code2, position: 'right-4 top-10 sm:-right-5 sm:top-16' },
  { label: 'MySQL', icon: Database, position: 'left-3 top-[46%] sm:-left-6' },
  { label: 'SEO', icon: Search, position: 'bottom-24 right-5 sm:-right-4' },
];

export const Hero = ({ profile, cv }: { profile: PublicProfile; cv: CvInfo | null }) => (
  <section id="home" className="relative overflow-hidden pb-20 pt-14 sm:pb-24 sm:pt-20">
    <div className="absolute inset-0 -z-10 bg-grid opacity-50" aria-hidden="true" />
    <div className="container-page">
      <div className="grid items-center gap-14 lg:grid-cols-[1.12fr_0.88fr] lg:gap-16">
        <div className="animate-fade-up">
          <p className="eyebrow">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-accent" />
            </span>
            Hello, I&apos;m
          </p>

          <h1 className="heading-1 mt-5">
            Mosito <span className="gradient-text">Qhasho</span>
          </h1>

          <p className="mt-5 max-w-xl text-lg font-medium leading-8 text-ink sm:text-xl">
            {profile.professionalTitle}
          </p>

          <p className="body-text mt-4 max-w-xl">{profile.heroIntro}</p>

          <div className="mt-7 flex flex-wrap items-center gap-2 text-xs text-muted">
            {profile.location && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5">
                <MapPin size={13} className="text-accent" aria-hidden="true" />
                {profile.location}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5">
              <Sparkles size={13} className="text-accent" aria-hidden="true" />
              Open to learning and early-career opportunities
            </span>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link to="/#projects" className="btn btn-primary">
              View my projects
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <CvDownloadButton cv={cv} />
            <Link to="/#contact" className="btn btn-ghost">
              <Mail size={16} aria-hidden="true" />
              Contact me
            </Link>
          </div>

          {profile.heroTechSummary.length > 0 && (
            <div className="mt-9 border-t border-line/70 pt-5">
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted">
                Working with
              </p>
              <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
                {profile.heroTechSummary.map((item) => (
                  <li
                    key={item}
                    className="inline-flex items-center gap-2 text-xs font-medium text-muted"
                  >
                    <span className="size-1 rounded-full bg-accent/70" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="relative mx-auto w-full max-w-[23rem] animate-fade-up [animation-delay:120ms] sm:max-w-[25rem]">
          <div className="absolute -inset-8 -z-10 rounded-[2.5rem] bg-accent/10 blur-3xl" aria-hidden="true" />
          <div className="relative">
            <div className="overflow-hidden rounded-[1.75rem] border border-line bg-surface p-2.5 shadow-lift">
              <ProfileAvatar
                name={profile.fullName}
                imageUrl={profile.profileImageUrl}
                initials={profile.avatarInitials}
                className="aspect-[4/5] w-full rounded-[1.25rem]"
                imageClassName="object-cover object-top"
              />
              <div className="flex items-center justify-between gap-3 px-3 pb-1 pt-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">{profile.fullName}</p>
                  <p className="mt-0.5 truncate font-mono text-[0.65rem] uppercase tracking-wider text-muted">
                    Computing · Software · Web
                  </p>
                </div>
                <span className="inline-flex size-8 items-center justify-center rounded-full border border-accent/25 bg-accent-soft text-accent">
                  <Code2 size={15} aria-hidden="true" />
                </span>
              </div>
            </div>

            {floatingChips.map((chip, index) => {
              const Icon = chip.icon;
              return (
                <div
                  key={chip.label}
                  className={`absolute hidden items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2 text-xs font-semibold text-ink shadow-lift sm:inline-flex ${chip.position}`}
                  style={{ animationDelay: `${200 + index * 80}ms` }}
                >
                  <Icon size={13} className="text-accent" aria-hidden="true" />
                  {chip.label}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  </section>
);
