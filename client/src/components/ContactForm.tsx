import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, CheckCircle2, LoaderCircle, Send } from 'lucide-react';
import { ApiError } from '../services/api';
import { sendContactMessage } from '../services/publicApi';
import { contactFormSchema, CONTACT_REASONS, type ContactFormValues } from '../utils/validation';
import type { ContactResponse } from '../types';
import { useToast } from '../contexts/ToastContext';

const fieldId = (name: keyof ContactFormValues) => `contact-${name}`;

export const ContactForm = () => {
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<ContactResponse | null>(null);
  const { pushToast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
      reason: '',
      website: '',
    },
  });

  const onSubmit = async (values: ContactFormValues) => {
    setServerError(null);
    try {
      const response = await sendContactMessage({
        name: values.name,
        email: values.email,
        subject: values.subject,
        message: values.message,
        reason: values.reason || undefined,
        website: values.website,
      });
      setSubmitted(response);
      reset();
      pushToast('Your message has been sent.', 'success');
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.details) {
          let handled = false;
          for (const [field, messages] of Object.entries(error.details)) {
            if (field in contactFormSchema.shape && messages?.[0]) {
              setError(field as keyof ContactFormValues, { message: messages[0] });
              handled = true;
            }
          }
          if (handled) {
            setServerError('Please check the highlighted fields and try again.');
            return;
          }
        }
        setServerError(error.message);
        return;
      }
      setServerError('Your message could not be sent. Please try again.');
    }
  };

  if (submitted) {
    return (
      <div
        className="card flex min-h-[28rem] flex-col items-center justify-center p-8 text-center"
        aria-live="polite"
      >
        <div className="flex size-14 items-center justify-center rounded-full border border-success/30 bg-success/10 text-success">
          <CheckCircle2 size={28} aria-hidden="true" />
        </div>
        <h3 className="mt-5 text-lg font-semibold text-ink">Message received</h3>
        <p className="mt-2 max-w-sm text-sm leading-6 text-muted">{submitted.message}</p>
        <button
          type="button"
          className="btn btn-secondary mt-6"
          onClick={() => setSubmitted(null)}
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form className="card p-5 sm:p-7" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-ink">Send a message</h3>
        <p className="mt-1 text-sm text-muted">
          Fields marked with an asterisk are required.
        </p>
      </div>

      {serverError && (
        <div
          className="mb-5 flex items-start gap-2.5 rounded-xl border border-danger/35 bg-danger/5 p-3.5 text-sm leading-6 text-ink"
          role="alert"
        >
          <AlertCircle size={17} className="mt-0.5 shrink-0 text-danger" aria-hidden="true" />
          {serverError}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={fieldId('name')} className="label">
            Your name <span className="text-danger">*</span>
          </label>
          <input
            id={fieldId('name')}
            type="text"
            autoComplete="name"
            className="input"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? `${fieldId('name')}-error` : undefined}
            {...register('name')}
          />
          {errors.name && (
            <p id={`${fieldId('name')}-error`} className="error-text">
              {errors.name.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor={fieldId('email')} className="label">
            Email address <span className="text-danger">*</span>
          </label>
          <input
            id={fieldId('email')}
            type="email"
            autoComplete="email"
            className="input"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? `${fieldId('email')}-error` : undefined}
            {...register('email')}
          />
          {errors.email && (
            <p id={`${fieldId('email')}-error`} className="error-text">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor={fieldId('subject')} className="label">
            Subject <span className="text-danger">*</span>
          </label>
          <input
            id={fieldId('subject')}
            type="text"
            className="input"
            aria-invalid={Boolean(errors.subject)}
            aria-describedby={errors.subject ? `${fieldId('subject')}-error` : undefined}
            {...register('subject')}
          />
          {errors.subject && (
            <p id={`${fieldId('subject')}-error`} className="error-text">
              {errors.subject.message}
            </p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor={fieldId('reason')} className="label">
            Reason for contact
          </label>
          <select id={fieldId('reason')} className="input" {...register('reason')}>
            <option value="">Select a reason (optional)</option>
            {CONTACT_REASONS.map((reason) => (
              <option key={reason} value={reason}>
                {reason}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor={fieldId('message')} className="label">
            Message <span className="text-danger">*</span>
          </label>
          <textarea
            id={fieldId('message')}
            rows={6}
            className="input resize-y"
            aria-invalid={Boolean(errors.message)}
            aria-describedby={errors.message ? `${fieldId('message')}-error` : `${fieldId('message')}-hint`}
            {...register('message')}
          />
          {errors.message ? (
            <p id={`${fieldId('message')}-error`} className="error-text">
              {errors.message.message}
            </p>
          ) : (
            <p id={`${fieldId('message')}-hint`} className="hint">
              Share a concise brief, question, or opportunity. Maximum 5,000 characters.
            </p>
          )}
        </div>

        <div className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
          <label htmlFor={fieldId('website')}>Website</label>
          <input
            id={fieldId('website')}
            type="text"
            tabIndex={-1}
            autoComplete="off"
            {...register('website')}
          />
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-4 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-xs text-xs leading-5 text-muted">
          Your details are used only to respond to this message.
        </p>
        <button type="submit" className="btn btn-primary min-w-40" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />
              Sending…
            </>
          ) : (
            <>
              <Send size={16} aria-hidden="true" />
              Send message
            </>
          )}
        </button>
      </div>
    </form>
  );
};
