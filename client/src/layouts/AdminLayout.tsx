import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Award,
  BriefcaseBusiness,
  ExternalLink,
  FileText,
  FolderKanban,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Settings,
  Share2,
  UserRound,
  Wrench,
  X,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { ThemeToggle } from '../components/ThemeToggle';
import { cn } from '../utils/cn';

const navGroups = [
  {
    label: 'Content',
    items: [
      { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
      { to: '/admin/profile', label: 'Profile', icon: UserRound },
      { to: '/admin/projects', label: 'Projects', icon: FolderKanban },
      { to: '/admin/skills', label: 'Skills', icon: Wrench },
      { to: '/admin/experience', label: 'Experience', icon: BriefcaseBusiness },
      { to: '/admin/education', label: 'Education', icon: GraduationCap },
      { to: '/admin/certifications', label: 'Certifications', icon: Award },
      { to: '/admin/cv', label: 'CV', icon: FileText },
    ],
  },
  {
    label: 'Inbox',
    items: [{ to: '/admin/messages', label: 'Messages', icon: Mail }],
  },
  {
    label: 'Site',
    items: [
      { to: '/admin/social-links', label: 'Social links', icon: Share2 },
      { to: '/admin/settings', label: 'Settings', icon: Settings },
    ],
  },
];

const SidebarContent = ({ onNavigate }: { onNavigate?: () => void }) => {
  const { admin, logout } = useAuth();
  const { pushToast } = useToast();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      pushToast('You have been signed out.', 'info');
      navigate('/admin/login', { replace: true });
    } catch {
      pushToast('Sign out failed. Please try again.', 'error');
    } finally {
      setLoggingOut(false);
    }
  };

  const initials = (admin?.name ?? 'Admin')
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-3 border-b border-line px-5">
        <span className="inline-flex size-9 items-center justify-center rounded-xl bg-accent font-mono text-sm font-bold text-on-accent">
          MQ
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink">Mosito Qhasho</p>
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-muted">
            Admin workspace
          </p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Administration">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-5 last:mb-0">
            <p className="mb-1.5 px-2 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted/80">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition',
                        isActive
                          ? 'bg-accent-soft text-accent'
                          : 'text-muted hover:bg-surface2 hover:text-ink',
                      )
                    }
                  >
                    <item.icon size={16} aria-hidden="true" />
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-line p-3">
        <Link
          to="/"
          onClick={onNavigate}
          className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium text-muted transition hover:bg-surface2 hover:text-ink"
        >
          <ExternalLink size={15} aria-hidden="true" />
          View public site
        </Link>
        <div className="mt-2 flex items-center gap-2.5 rounded-xl border border-line bg-surface p-2.5">
          <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-surface2 text-xs font-semibold text-ink">
            {initials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-ink">{admin?.name}</p>
            <p className="truncate text-[0.65rem] text-muted">{admin?.email}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="inline-flex size-8 items-center justify-center rounded-lg text-muted transition hover:bg-danger/10 hover:text-danger"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut size={15} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const AdminLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previous;
    };
  }, [mobileOpen]);

  return (
    <div className="min-h-screen bg-bg">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-line bg-surface lg:block">
        <SidebarContent />
      </aside>

      <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-line bg-bg/90 px-4 backdrop-blur lg:pl-[17rem] lg:pr-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="inline-flex size-10 items-center justify-center rounded-xl border border-line bg-surface text-ink lg:hidden"
            aria-label="Open administration menu"
            aria-expanded={mobileOpen}
            aria-controls="admin-mobile-menu"
          >
            <Menu size={18} aria-hidden="true" />
          </button>
          <div className="hidden sm:block">
            <p className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted">Admin</p>
            <p className="text-sm font-medium text-ink">Portfolio management</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/" className="hidden text-xs font-medium text-muted hover:text-accent sm:block">
            View site
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <div
            className="absolute inset-0 bg-black/55 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div
            id="admin-mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Administration menu"
            className="absolute inset-y-0 left-0 w-72 max-w-[85vw] border-r border-line bg-surface shadow-lift"
          >
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-3 z-10 inline-flex size-8 items-center justify-center rounded-lg text-muted hover:bg-surface2 hover:text-ink"
              aria-label="Close administration menu"
            >
              <X size={17} aria-hidden="true" />
            </button>
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <main className="px-4 py-6 sm:px-6 lg:pl-[19rem] lg:pr-8 lg:py-8">
        <div className="mx-auto max-w-6xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
