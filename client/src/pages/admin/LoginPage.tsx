import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Seo } from '../../components/Seo';
import { ThemeToggle } from '../../components/ThemeToggle';
import { Field } from '../../components/admin/Field';
import { ApiError } from '../../services/api';

export const LoginPage = () => {
  const { login, authenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | undefined>>({});

  const from = (location.state as { from?: string } | null)?.from;

  useEffect(() => {
    document.title = 'Administrator sign in | Mosito Qhasho';
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <LoaderCircle size={22} className="animate-spin text-accent" aria-label="Loading" />
      </div>
    );
  }

  if (authenticated) {
    return <Navigate to={from ?? '/admin'} replace />;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const nextErrors: Record<string, string | undefined> = {};
    if (!email.trim()) nextErrors.email = 'Enter your administrator email address.';
    if (!password) nextErrors.password = 'Enter your password.';
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate(from ?? '/admin', { replace: true });
    } catch (caught) {
      if (caught instanceof ApiError) {
        setError(caught.message);
        if (caught.details) {
          setFieldErrors({
            email: caught.details.email?.[0],
            password: caught.details.password?.[0],
          });
        }
      } else {
        setError('Sign in failed. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg lg:grid lg:grid-cols-[1.05fr_1fr]">
      <Seo title="Administrator sign in | Mosito Qhasho" path="/admin/login" noindex />

      <div className="relative hidden overflow-hidden border-r border-line bg-surface lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="absolute inset-0 bg-grid opacity-60" aria-hidden="true" />
        <div
          className="absolute -left-24 top-1/3 size-96 rounded-full bg-accent/10 blur-3xl"
          aria-hidden="true"
        />
        <Link
          to="/"
          className="relative z-10 inline-flex items-center gap-2.5 text-sm font-semibold"
        >
          <span className="inline-flex size-9 items-center justify-center rounded-xl bg-accent font-mono text-sm font-bold text-on-accent">
            MQ
          </span>
          Mosito Qhasho
        </Link>

        <div className="relative z-10 max-w-md">
          <p className="eyebrow">Private workspace</p>
          <h1 className="heading-2 mt-4">Manage your portfolio with confidence.</h1>
          <p className="body-text mt-4">
            Update projects, skills, experience, certifications and your CV from one secure
            dashboard. Public pages refresh automatically when changes are saved.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-muted">
            <li className="flex items-center gap-2.5">
              <ShieldCheck size={16} className="text-accent" aria-hidden="true" />
              Hashed sessions, CSRF protection and rate limiting
            </li>
            <li className="flex items-center gap-2.5">
              <LockKeyhole size={16} className="text-accent" aria-hidden="true" />
              No public registration or account recovery links
            </li>
          </ul>
        </div>

        <p className="relative z-10 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted">
          Authorised access only
        </p>
      </div>

      <div className="flex min-h-screen flex-col">
        <div className="flex items-center justify-between px-5 py-5 sm:px-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-accent"
          >
            <ArrowLeft size={15} aria-hidden="true" />
            Back to portfolio
          </Link>
          <ThemeToggle />
        </div>

        <div className="flex flex-1 items-center justify-center px-5 pb-16 sm:px-8">
          <div className="w-full max-w-sm">
            <div className="lg:hidden">
              <span className="inline-flex size-11 items-center justify-center rounded-xl bg-accent font-mono text-base font-bold text-on-accent">
                MQ
              </span>
            </div>
            <p className="eyebrow mt-6 lg:mt-0">Administration</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-ink">Sign in</h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              Enter the administrator credentials configured during setup.
            </p>

            <form onSubmit={handleSubmit} className="mt-7 space-y-4" noValidate>
              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-danger/35 bg-danger/10 px-3.5 py-3 text-sm leading-6 text-danger"
                >
                  {error}
                </div>
              )}

              <Field label="Email address" htmlFor="login-email" required error={fieldErrors.email}>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  autoFocus
                  className="input"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="admin@example.com"
                  aria-invalid={Boolean(fieldErrors.email)}
                  disabled={submitting}
                />
              </Field>

              <Field
                label="Password"
                htmlFor="login-password"
                required
                error={fieldErrors.password}
              >
                <div className="relative">
                  <input
                    id="login-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    className="input pr-11"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    aria-invalid={Boolean(fieldErrors.password)}
                    disabled={submitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute inset-y-0 right-0 inline-flex w-11 items-center justify-center text-muted transition hover:text-ink"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </Field>

              <button type="submit" className="btn btn-primary w-full" disabled={submitting}>
                {submitting ? (
                  <>
                    <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />
                    Signing in…
                  </>
                ) : (
                  <>
                    Sign in to dashboard
                    <ArrowRight size={16} aria-hidden="true" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-6 rounded-lg border border-line bg-surface px-3.5 py-3 text-xs leading-5 text-muted">
              This area is restricted. If you have lost the administrator password, run the
              server&apos;s <code className="font-mono text-[0.7rem] text-ink">admin:init</code>{' '}
              command locally to reset it.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
