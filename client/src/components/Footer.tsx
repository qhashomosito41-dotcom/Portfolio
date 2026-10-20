import { Link } from 'react-router-dom';
import { ArrowUp, ArrowUpRight } from 'lucide-react';
import { usePublicData } from '../contexts/PublicDataContext';
import { SocialLinks } from './SocialLinks';

const footerLinks = [
  { label: 'About', to: '/#about' },
  { label: 'Skills', to: '/#skills' },
  { label: 'Projects', to: '/#projects' },
  { label: 'Experience', to: '/#experience' },
  { label: 'Education', to: '/#education' },
  { label: 'Certifications', to: '/#certifications' },
  { label: 'Contact', to: '/#contact' },
];

export const Footer = () => {
  const { data } = usePublicData();
  const year = new Date().getFullYear();
  const description =
    data?.site.footerTagline ||
    data?.profile?.headline ||
    'Computing student and software developer building practical digital experiences.';

  return (
    <footer className="border-t border-line bg-surface/50">
      <div className="container-page py-14">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr_1fr]">
          <div className="max-w-sm">
            <Link to="/#home" className="inline-flex items-center gap-3">
              <span className="inline-flex size-9 items-center justify-center rounded-lg border border-line bg-surface font-mono text-xs font-bold text-accent">
                MQ
              </span>
              <span className="text-sm font-semibold text-ink">Mosito Qhasho</span>
            </Link>
            <p className="mt-4 text-sm leading-6 text-muted">{description}</p>
            {data?.profile?.location && (
              <p className="mt-3 font-mono text-xs text-muted">{data.profile.location}</p>
            )}
            {data && data.socialLinks.length > 0 && (
              <SocialLinks links={data.socialLinks} className="mt-5" compact />
            )}
          </div>

          <nav aria-label="Footer navigation">
            <h2 className="font-mono text-[0.68rem] font-medium uppercase tracking-[0.18em] text-muted">
              Explore
            </h2>
            <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2.5">
              {footerLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-muted transition hover:text-accent"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="font-mono text-[0.68rem] font-medium uppercase tracking-[0.18em] text-muted">
              Get in touch
            </h2>
            <div className="mt-4 space-y-3 text-sm text-muted">
              {data?.profile?.contactEmail ? (
                <a
                  href={`mailto:${data.profile.contactEmail}`}
                  className="inline-flex items-center gap-1.5 text-accent hover:underline"
                >
                  {data.profile.contactEmail}
                  <ArrowUpRight size={13} aria-hidden="true" />
                </a>
              ) : (
                <p>Use the contact form below to start a conversation.</p>
              )}
              <Link to="/admin/login" className="block text-xs text-muted/70 transition hover:text-muted">
                Administrator sign in
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-line pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Mosito Qhasho. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <span className="font-mono text-[0.68rem]">Built with React · TypeScript · Express · MySQL</span>
            <a
              href="#home"
              className="inline-flex items-center gap-1.5 text-muted transition hover:text-accent"
            >
              Back to top
              <ArrowUp size={13} aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
