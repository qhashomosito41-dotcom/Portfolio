import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ImagePlus, LoaderCircle, Save, Trash2, UserRound } from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import { ApiError } from '../../services/api';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useToast } from '../../contexts/ToastContext';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { Field } from '../../components/admin/Field';
import { arrayToLines, formError, linesToArray } from '../../utils/adminForm';
import { ErrorState, LoadingState } from '../../components/States';
import { profileFormSchema } from '../../utils/adminSchemas';
import type { ProfileFormValues } from '../../utils/adminSchemas';
import type { AdminProfile } from '../../types';
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_BYTES } from '../../utils/constants';
import { formatFileSize } from '../../utils/dates';

const toFormValues = (profile: AdminProfile): ProfileFormValues => ({
  fullName: profile.fullName,
  professionalTitle: profile.professionalTitle,
  headline: profile.headline,
  heroIntro: profile.heroIntro,
  heroTechSummary: arrayToLines(profile.heroTechSummary),
  biography: profile.biography,
  academicBackground: profile.academicBackground ?? '',
  approach: profile.approach ?? '',
  careerObjectives: profile.careerObjectives ?? '',
  professionalInterests: arrayToLines(profile.professionalInterests),
  location: profile.location ?? '',
  contactEmail: profile.contactEmail ?? '',
});

export const ProfilePage = () => {
  const query = useApiQuery(() => adminApi.getProfile(), []);
  const { pushToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageBusy, setImageBusy] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: '',
      professionalTitle: '',
      headline: '',
      heroIntro: '',
      heroTechSummary: '',
      biography: '',
      academicBackground: '',
      approach: '',
      careerObjectives: '',
      professionalInterests: '',
      location: '',
      contactEmail: '',
    },
  });

  useEffect(() => {
    if (query.data) reset(toFormValues(query.data));
  }, [query.data, reset]);

  const profile = query.data;

  const onSubmit = async (values: ProfileFormValues) => {
    setServerError(null);
    try {
      const updated = await adminApi.updateProfile({
        ...values,
        heroTechSummary: linesToArray(values.heroTechSummary),
        professionalInterests: linesToArray(values.professionalInterests),
      });
      query.setData(updated);
      reset(toFormValues(updated));
      pushToast('Profile updated successfully.');
    } catch (error) {
      if (error instanceof ApiError) {
        setServerError(error.message);
        if (error.details) {
          (Object.keys(error.details) as (keyof ProfileFormValues)[]).forEach((key) => {
            const message = error.details?.[key]?.[0];
            if (message) setError(key, { type: 'server', message });
          });
        }
      } else {
        setServerError('The profile could not be saved. Please try again.');
      }
    }
  };

  const handleImage = async (file: File | undefined) => {
    if (!file) return;
    setImageError(null);
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setImageError('Choose a JPEG, PNG, WebP or GIF image.');
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setImageError(`The image must be smaller than ${formatFileSize(MAX_IMAGE_BYTES)}.`);
      return;
    }
    setImageBusy(true);
    try {
      const updated = await adminApi.uploadProfileImage(file);
      query.setData(updated);
      pushToast('Profile photo updated.');
    } catch (error) {
      setImageError(error instanceof Error ? error.message : 'The photo could not be uploaded.');
    } finally {
      setImageBusy(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = async () => {
    setImageError(null);
    setImageBusy(true);
    try {
      const updated = await adminApi.removeProfileImage();
      query.setData(updated);
      pushToast('Profile photo removed.', 'info');
    } catch (error) {
      setImageError(error instanceof Error ? error.message : 'The photo could not be removed.');
    } finally {
      setImageBusy(false);
    }
  };

  if (query.loading && !profile) {
    return <LoadingState label="Loading profile…" />;
  }

  if (query.error || !profile) {
    return <ErrorState message="The profile could not be loaded." onRetry={query.refetch} />;
  }

  return (
    <>
      <AdminPageHeader
        eyebrow="Content"
        title="Profile"
        description="The core introduction shown in the hero and about sections of the public site."
        actions={
          <button
            type="submit"
            form="profile-form"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />
            ) : (
              <Save size={16} aria-hidden="true" />
            )}
            {isSubmitting ? 'Saving…' : 'Save changes'}
          </button>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[18rem_1fr] lg:items-start">
        <aside className="card p-5 lg:sticky lg:top-24">
          <h2 className="text-sm font-semibold text-ink">Profile photo</h2>
          <div className="relative mt-4 aspect-square overflow-hidden rounded-xl border border-line bg-surface2">
            {profile.profileImageUrl ? (
              <img
                src={profile.profileImageUrl}
                alt={`${profile.fullName} profile`}
                className="size-full object-cover"
              />
            ) : (
              <div className="flex size-full flex-col items-center justify-center gap-2 text-muted">
                <UserRound size={34} aria-hidden="true" />
                <span className="text-xs">No photo uploaded</span>
              </div>
            )}
            {imageBusy && (
              <div className="absolute inset-0 flex items-center justify-center bg-bg/70">
                <LoaderCircle
                  size={22}
                  className="animate-spin text-accent"
                  aria-label="Uploading"
                />
              </div>
            )}
          </div>
          {imageError && (
            <p className="error-text" role="alert">
              {imageError}
            </p>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_IMAGE_TYPES.join(',')}
            className="sr-only"
            id="profile-image-input"
            onChange={(event) => void handleImage(event.target.files?.[0])}
            disabled={imageBusy}
          />
          <div className="mt-3 grid gap-2">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={imageBusy}
            >
              <ImagePlus size={14} aria-hidden="true" />
              {profile.profileImageUrl ? 'Replace photo' : 'Upload photo'}
            </button>
            {profile.profileImageUrl && (
              <button
                type="button"
                className="btn btn-ghost btn-sm text-danger hover:bg-danger/10 hover:text-danger"
                onClick={() => void removeImage()}
                disabled={imageBusy}
              >
                <Trash2 size={14} aria-hidden="true" />
                Remove photo
              </button>
            )}
          </div>
          <p className="hint">
            JPEG, PNG, WebP or GIF, up to {formatFileSize(MAX_IMAGE_BYTES)}. Images are resized for
            the web automatically.
          </p>
        </aside>

        <form id="profile-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          {serverError && (
            <div
              role="alert"
              className="rounded-xl border border-danger/35 bg-danger/10 px-4 py-3 text-sm text-danger"
            >
              {serverError}
            </div>
          )}

          <section className="card p-5 sm:p-6" aria-labelledby="profile-identity">
            <h2 id="profile-identity" className="text-sm font-semibold text-ink">
              Identity
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field
                label="Full name"
                htmlFor="fullName"
                required
                error={formError(errors, 'fullName')}
              >
                <input
                  id="fullName"
                  className="input"
                  autoComplete="name"
                  {...register('fullName')}
                />
              </Field>
              <Field
                label="Professional title"
                htmlFor="professionalTitle"
                required
                error={formError(errors, 'professionalTitle')}
              >
                <input
                  id="professionalTitle"
                  className="input"
                  {...register('professionalTitle')}
                />
              </Field>
              <Field
                label="Headline"
                htmlFor="headline"
                required
                error={formError(errors, 'headline')}
                className="sm:col-span-2"
              >
                <input id="headline" className="input" {...register('headline')} />
              </Field>
              <Field label="Location" htmlFor="location" error={formError(errors, 'location')}>
                <input
                  id="location"
                  className="input"
                  placeholder="City, Country"
                  {...register('location')}
                />
              </Field>
              <Field
                label="Contact email"
                htmlFor="contactEmail"
                error={formError(errors, 'contactEmail')}
                hint="Shown publicly only if you add it. Contact form messages are separate."
              >
                <input
                  id="contactEmail"
                  type="email"
                  className="input"
                  autoComplete="email"
                  {...register('contactEmail')}
                />
              </Field>
            </div>
          </section>

          <section className="card p-5 sm:p-6" aria-labelledby="profile-hero">
            <h2 id="profile-hero" className="text-sm font-semibold text-ink">
              Hero section
            </h2>
            <div className="mt-4 space-y-4">
              <Field
                label="Introduction"
                htmlFor="heroIntro"
                required
                error={formError(errors, 'heroIntro')}
                hint="Two or three sentences introducing who you are and what you do."
              >
                <textarea
                  id="heroIntro"
                  rows={4}
                  className="input resize-y"
                  {...register('heroIntro')}
                />
              </Field>
              <Field
                label="Technology summary"
                htmlFor="heroTechSummary"
                error={formError(errors, 'heroTechSummary')}
                hint="One technology or area per line. These appear as small labels under the hero."
              >
                <textarea
                  id="heroTechSummary"
                  rows={3}
                  className="input resize-y font-mono text-xs"
                  {...register('heroTechSummary')}
                />
              </Field>
            </div>
          </section>

          <section className="card p-5 sm:p-6" aria-labelledby="profile-about">
            <h2 id="profile-about" className="text-sm font-semibold text-ink">
              About section
            </h2>
            <div className="mt-4 space-y-4">
              <Field
                label="Biography"
                htmlFor="biography"
                required
                error={formError(errors, 'biography')}
                hint="Use blank lines to separate paragraphs."
              >
                <textarea
                  id="biography"
                  rows={7}
                  className="input resize-y"
                  {...register('biography')}
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Academic background"
                  htmlFor="academicBackground"
                  error={formError(errors, 'academicBackground')}
                >
                  <textarea
                    id="academicBackground"
                    rows={4}
                    className="input resize-y"
                    {...register('academicBackground')}
                  />
                </Field>
                <Field label="Approach" htmlFor="approach" error={formError(errors, 'approach')}>
                  <textarea
                    id="approach"
                    rows={4}
                    className="input resize-y"
                    {...register('approach')}
                  />
                </Field>
                <Field
                  label="Career objectives"
                  htmlFor="careerObjectives"
                  error={formError(errors, 'careerObjectives')}
                  className="sm:col-span-2"
                >
                  <textarea
                    id="careerObjectives"
                    rows={4}
                    className="input resize-y"
                    {...register('careerObjectives')}
                  />
                </Field>
                <Field
                  label="Professional interests"
                  htmlFor="professionalInterests"
                  error={formError(errors, 'professionalInterests')}
                  hint="One interest per line."
                  className="sm:col-span-2"
                >
                  <textarea
                    id="professionalInterests"
                    rows={4}
                    className="input resize-y"
                    {...register('professionalInterests')}
                  />
                </Field>
              </div>
            </div>
          </section>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted">
              {isDirty ? 'You have unsaved changes.' : 'All changes are saved.'}
            </p>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? (
                <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />
              ) : (
                <Save size={16} aria-hidden="true" />
              )}
              {isSubmitting ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};
