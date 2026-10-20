import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { CvDownloadButton } from './CvDownloadButton';
import { usePublicData } from '../contexts/PublicDataContext';
import { cn } from '../utils/cn';

const navItems = [
  { label: 'Home', to: '/#home', id: 'home' },
  { label: 'About', to: '/#about', id: 'about' },
  { label: 'Skills', to: '/#skills', id: 'skills' },
  { label: 'Projects', to: '/#projects', id: 'projects' },
  { label: 'Experience', to: '/#experience', id: 'experience' },
  { label: 'Education', to: '/#education', id: 'education' },
  { label: 'Certifications', to: '/#certifications', id: 'certifications' },
  { label: 'Contact', to: '/#contact', id: 'contact' },
];

export const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('home');
  const location = useLocation();
  const { data } = usePublicData();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const timer = window.setTimeout(() => firstLinkRef.current?.focus(), 30);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      window.clearTimeout(timer);
    };
  }, [open]);

  useEffect(() => {
    if (location.pathname !== '/') return;
    const sections = navItems
      .map((item) => document.getElementById(item.id))
      .filter((element): element is HTMLElement => Boolean(element));
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: '-35% 0px -55% 0px', threshold: [0.01, 0.25, 0.5] },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [location.pathname, location.hash]);

  useEffect(() => {
    if (location.pathname.startsWith('/projects')) setActive('projects');
    else if (location.pathname === '/') {
      const hash = location.hash.replace('#', '');
      if (hash) setActive(hash);
    }
  }, [location.pathname, location.hash]);

  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-bg/85 backdrop-blur-xl">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link to="/#home" className="group flex items-center gap-3" aria-label="Mosito Qhasho — home">
          <span className="relative inline-flex size-9 items-center justify-center rounded-lg border border-line bg-surface font-mono text-xs font-bold text-accent shadow-soft transition group-hover:border-accent/45">
            MQ
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold tracking-tight text-ink">
              Mosito Qhasho
            </span>
            <span className="hidden text-[0.65rem] font-medium uppercase tracking-[0.14em] text-muted sm:block">
              Web Design · Development · SEO
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-0.5 xl:flex" aria-label="Main navigation">
          {navItems.map((item) => (
            <Link
              key={item.id}
              to={item.to}
              className={cn('nav-link', active === item.id && 'nav-link-active')}
              aria-current={active === item.id ? 'page' : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <CvDownloadButton cv={data?.cv ?? null} className="hidden sm:inline-flex" />
          <ThemeToggle />
          <button
            ref={toggleRef}
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-xl border border-line bg-surface text-ink xl:hidden"
            aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X size={19} aria-hidden="true" /> : <Menu size={19} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {open && (
        <div
          id="mobile-navigation"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
          className="border-t border-line bg-bg xl:hidden"
        >
          <nav
            className="container-page max-h-[calc(100dvh-4rem)] overflow-y-auto py-4"
            aria-label="Mobile navigation links"
          >
            <ul className="grid gap-1">
              {navItems.map((item, index) => (
                <li key={item.id}>
                  <Link
                    ref={index === 0 ? firstLinkRef : undefined}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'flex items-center justify-between rounded-xl px-3 py-3 text-sm font-medium text-muted transition hover:bg-surface2 hover:text-ink',
                      active === item.id && 'bg-surface2 text-ink',
                    )}
                    aria-current={active === item.id ? 'page' : undefined}
                  >
                    {item.label}
                    <span className="font-mono text-[0.65rem] text-muted/70">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-col gap-2 border-t border-line pt-4">
              <CvDownloadButton cv={data?.cv ?? null} className="w-full" />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
