import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertTriangle,
  CheckCircle2,
  LoaderCircle,
  MailCheck,
  Save,
  Send,
  Settings2,
} from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useToast } from '../../contexts/ToastContext';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { Field } from '../../components/admin/Field';
import { formError } from '../../utils/adminForm';
import { ErrorState, LoadingState } from '../../components/States';
import { settingsFormSchema } from '../../utils/adminSchemas';
import type { SettingsFormValues } from '../../utils/adminSchemas';

export const SettingsPage = () => {
  const query = useApiQuery(() => adminApi.getSettings(), []);
  const { pushToast } = useToast();
  const [serverError, setServerError] = useState<string | null>(null);
  const [testRecipient, setTestRecipient] = useState('');
  const [sendingTest, setSendingTest] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      websiteTitle: '',
      websiteDescription: '',
      footerTagline: '',
      contactNotificationEmail: '',
      siteUrl: '',
    },
  });

  useEffect(() => {
    if (query.data) {
      reset({
        websiteTitle: query.data.websiteTitle,
        websiteDescription: query.data.websiteDescription,
        footerTagline: query.data.footerTagline ?? '',
        contactNotificationEmail: query.data.contactNotificationEmail ?? '',
        siteUrl: query.data.siteUrl ?? '',
      });
    }
  }, [query.data, reset]);

  const onSubmit = async (values: SettingsFormValues) => {
    setServerError(null);
    try {
      const updated = await adminApi.updateSettings(values);
      query.setData(updated);
      reset({
        websiteTitle: updated.websiteTitle,
        websiteDescription: updated.websiteDescription,
        footerTagline: updated.footerTagline ?? '',
        contactNotificationEmail: updated.contactNotificationEmail ?? '',
        siteUrl: updated.siteUrl ?? '',
      });
      pushToast('Site settings saved.');
    } catch (error) {
      if (error instanceof Error) setServerError(error.message);
      if (error instanceof Error && 'details' in error) {
        const details = (error as { details?: Record<string, string[]> }).details;
        if (details) {
          (Object.keys(details) as (keyof SettingsFormValues)[]).forEach((key) => {
            if (details[key]?.[0]) setError(key, { type: 'server', message: details[key][0] });
          });
        }
      }
    }
  };

  const handleTestEmail = async () => {
    if (testRecipient.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(testRecipient.trim())) {
      pushToast('Enter a valid test email address.', 'error');
      return;
    }
    setSendingTest(true);
    try {
      const result = await adminApi.sendTestEmail(testRecipient.trim() || undefined);
      pushToast(result.message || 'Test email sent.');
    } catch (error) {
      pushToast(
        error instanceof Error
          ? error.message
          : 'The test email could not be sent. Check the SMTP configuration.',
        'error',
      );
    } finally {
      setSendingTest(false);
    }
  };

  const settings = query.data;

  if (query.loading && !settings) return <LoadingState label="Loading settings…" />;
  if (query.error || !settings) {
    return <ErrorState message="Settings could not be loaded." onRetry={query.refetch} />;
  }

  return (
    <>
      <AdminPageHeader
        eyebrow="Site"
        title="Settings"
        description="Website metadata, contact notification routing and email delivery."
        actions={
          <button
            type="submit"
            form="settings-form"
            className="btn btn-primary btn-sm"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <LoaderCircle size={14} className="animate-spin" aria-hidden="true" />
            ) : (
              <Save size={14} aria-hidden="true" />
            )}
            {isSubmitting ? 'Saving…' : 'Save settings'}
          </button>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_20rem] lg:items-start">
        <form id="settings-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          {serverError && (
            <div
              role="alert"
              className="rounded-xl border border-danger/35 bg-danger/10 px-4 py-3 text-sm text-danger"
            >
              {serverError}
            </div>
          )}

          <section className="card p-5 sm:p-6" aria-labelledby="settings-site">
            <div className="flex items-center gap-2">
              <Settings2 size={16} className="text-accent" aria-hidden="true" />
              <h2 id="settings-site" className="text-sm font-semibold text-ink">
                Website identity
              </h2>
            </div>
            <div className="mt-4 space-y-4">
              <Field
                label="Website title"
                htmlFor="websiteTitle"
                required
                error={formError(errors, 'websiteTitle')}
                hint="Used in page titles and social sharing cards."
              >
                <input id="websiteTitle" className="input" {...register('websiteTitle')} />
              </Field>
              <Field
                label="Website description"
                htmlFor="websiteDescription"
                required
                error={formError(errors, 'websiteDescription')}
                hint="A concise description for search engines, ideally 120–160 characters."
              >
                <textarea
                  id="websiteDescription"
                  rows={3}
                  className="input resize-y"
                  {...register('websiteDescription')}
                />
              </Field>
              <Field
                label="Footer tagline"
                htmlFor="footerTagline"
                error={formError(errors, 'footerTagline')}
              >
                <input id="footerTagline" className="input" {...register('footerTagline')} />
              </Field>
              <Field
                label="Canonical site URL"
                htmlFor="siteUrl"
                error={formError(errors, 'siteUrl')}
                hint="The public base URL used for sitemap and metadata, for example https://example.com"
              >
                <input
                  id="siteUrl"
                  type="url"
                  className="input"
                  placeholder="https://example.com"
                  {...register('siteUrl')}
                />
              </Field>
            </div>
          </section>

          <section className="card p-5 sm:p-6" aria-labelledby="settings-contact">
            <div className="flex items-center gap-2">
              <MailCheck size={16} className="text-accent" aria-hidden="true" />
              <h2 id="settings-contact" className="text-sm font-semibold text-ink">
                Contact notifications
              </h2>
            </div>
            <div className="mt-4 space-y-4">
              <Field
                label="Notification email"
                htmlFor="contactNotificationEmail"
                error={formError(errors, 'contactNotificationEmail')}
                hint="Where new contact messages are emailed. If empty, the profile contact email is used when configured."
              >
                <input
                  id="contactNotificationEmail"
                  type="email"
                  className="input"
                  autoComplete="email"
                  {...register('contactNotificationEmail')}
                />
              </Field>
              <div className="rounded-xl border border-line bg-bg p-3.5">
                <p className="text-xs font-medium text-ink">Effective recipient</p>
                <p className="mt-1 break-all font-mono text-xs text-muted">
                  {settings.effectiveNotificationRecipient ?? 'No recipient configured'}
                </p>
                <p className="mt-2 text-[0.68rem] leading-5 text-muted">
                  Messages are always stored in the database even when email delivery fails.
                </p>
              </div>
            </div>
          </section>

          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-muted">
              {isDirty ? 'You have unsaved changes.' : 'All changes are saved.'}
            </p>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? (
                <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />
              ) : (
                <Save size={16} aria-hidden="true" />
              )}
              {isSubmitting ? 'Saving…' : 'Save settings'}
            </button>
          </div>
        </form>

        <aside className="space-y-4 lg:sticky lg:top-24">
          <section className="card p-5" aria-labelledby="smtp-status">
            <div className="flex items-center justify-between">
              <h2 id="smtp-status" className="text-sm font-semibold text-ink">
                Email delivery
              </h2>
              <span
                className={`badge ${
                  settings.smtpConfigured
                    ? 'border-success/35 text-success'
                    : 'border-warning/35 text-warning'
                }`}
              >
                {settings.smtpConfigured ? (
                  <>
                    <CheckCircle2 size={12} aria-hidden="true" />
                    Configured
                  </>
                ) : (
                  <>
                    <AlertTriangle size={12} aria-hidden="true" />
                    Not configured
                  </>
                )}
              </span>
            </div>
            <p className="mt-3 text-xs leading-5 text-muted">
              {settings.smtpConfigured
                ? 'SMTP credentials are present. Send a test email to confirm delivery.'
                : 'SMTP settings are missing from the server environment. Contact notifications will be stored but not emailed.'}
            </p>
            <div className="mt-4 space-y-2">
              <label htmlFor="test-email" className="label text-xs">
                Send a test email to
              </label>
              <input
                id="test-email"
                type="email"
                className="input"
                placeholder={settings.effectiveNotificationRecipient ?? 'you@example.com'}
                value={testRecipient}
                onChange={(event) => setTestRecipient(event.target.value)}
                autoComplete="email"
              />
              <button
                type="button"
                className="btn btn-secondary btn-sm w-full"
                onClick={() => void handleTestEmail()}
                disabled={sendingTest || !settings.smtpConfigured}
              >
                {sendingTest ? (
                  <LoaderCircle size={14} className="animate-spin" aria-hidden="true" />
                ) : (
                  <Send size={14} aria-hidden="true" />
                )}
                {sendingTest ? 'Sending…' : 'Send test email'}
              </button>
              {!settings.smtpConfigured && (
                <p className="text-[0.68rem] leading-5 text-muted">
                  Configure SMTP_HOST, SMTP_USER and SMTP_PASS in the server environment first.
                </p>
              )}
            </div>
          </section>

          <section className="card p-5">
            <h2 className="text-sm font-semibold text-ink">Before publishing</h2>
            <ul className="mt-3 space-y-2 text-xs leading-5 text-muted">
              <li>Verify every project, qualification and certification is accurate.</li>
              <li>Check social links point to your own profiles.</li>
              <li>Upload a current CV and decide whether it is public.</li>
              <li>Set a canonical URL once the site is deployed.</li>
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
};
