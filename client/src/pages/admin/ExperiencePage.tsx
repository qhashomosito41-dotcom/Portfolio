import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowDown,
  ArrowUp,
  BriefcaseBusiness,
  Eye,
  EyeOff,
  LoaderCircle,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useToast } from '../../contexts/ToastContext';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { Modal } from '../../components/admin/Modal';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { CheckboxField, Field } from '../../components/admin/Field';
import {
  arrayToCommas,
  arrayToLines,
  commaToArray,
  formError,
  linesToArray,
} from '../../utils/adminForm';
import { EmptyState, ErrorState, LoadingState } from '../../components/States';
import { experienceFormSchema } from '../../utils/adminSchemas';
import type { ExperienceFormValues } from '../../utils/adminSchemas';
import { EXPERIENCE_TYPES } from '../../utils/constants';
import { formatDateRange, toDateInputValue } from '../../utils/dates';
import type { AdminExperience } from '../../types';

const emptyExperience: ExperienceFormValues = {
  organization: '',
  position: '',
  type: 'Internship',
  location: '',
  startDate: '',
  endDate: '',
  isCurrent: false,
  responsibilitiesText: '',
  achievementsText: '',
  technologiesText: '',
  evidenceUrl: '',
  published: true,
};

const toFormValues = (experience: AdminExperience): ExperienceFormValues => ({
  organization: experience.organization,
  position: experience.position,
  type: experience.type as ExperienceFormValues['type'],
  location: experience.location ?? '',
  startDate: toDateInputValue(experience.startDate),
  endDate: toDateInputValue(experience.endDate),
  isCurrent: experience.isCurrent,
  responsibilitiesText: arrayToLines(experience.responsibilities),
  achievementsText: arrayToLines(experience.achievements),
  technologiesText: arrayToCommas(experience.technologies),
  evidenceUrl: experience.evidenceUrl ?? '',
  published: experience.published,
});

const ExperienceFormModal = ({
  experience,
  onClose,
  onSaved,
}: {
  experience: AdminExperience | null;
  onClose: () => void;
  onSaved: () => void;
}) => {
  const { pushToast } = useToast();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ExperienceFormValues>({
    resolver: zodResolver(experienceFormSchema),
    defaultValues: experience ? toFormValues(experience) : emptyExperience,
  });
  const isCurrent = watch('isCurrent');

  const onSubmit = async (values: ExperienceFormValues) => {
    setServerError(null);
    const payload = {
      organization: values.organization,
      position: values.position,
      type: values.type,
      location: values.location,
      startDate: values.startDate,
      endDate: values.isCurrent ? '' : values.endDate,
      isCurrent: values.isCurrent,
      responsibilities: linesToArray(values.responsibilitiesText),
      achievements: linesToArray(values.achievementsText),
      technologies: commaToArray(values.technologiesText),
      evidenceUrl: values.evidenceUrl,
      published: values.published,
    };
    try {
      if (experience) {
        await adminApi.updateExperience(experience.id, payload);
        pushToast('Experience updated.');
      } else {
        await adminApi.createExperience(payload);
        pushToast('Experience added.');
      }
      onSaved();
      onClose();
    } catch (error) {
      if (error instanceof Error) setServerError(error.message);
      if (error instanceof Error && 'details' in error) {
        const details = (error as { details?: Record<string, string[]> }).details;
        if (details) {
          (Object.keys(details) as (keyof ExperienceFormValues)[]).forEach((key) => {
            if (details[key]?.[0]) setError(key, { type: 'server', message: details[key][0] });
          });
        }
      }
    }
  };

  return (
    <Modal
      open
      onClose={isSubmitting ? () => undefined : onClose}
      title={experience ? 'Edit experience' : 'Add experience'}
      description="Employment, internships, freelance work and academic roles."
      size="lg"
      footer={
        <>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="experience-form"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting && <LoaderCircle size={15} className="animate-spin" aria-hidden="true" />}
            {experience ? 'Save changes' : 'Add experience'}
          </button>
        </>
      }
    >
      <form id="experience-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {serverError && (
          <p
            role="alert"
            className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2.5 text-sm text-danger"
          >
            {serverError}
          </p>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Position"
            htmlFor="experience-position"
            required
            error={formError(errors, 'position')}
          >
            <input id="experience-position" className="input" {...register('position')} />
          </Field>
          <Field
            label="Organisation"
            htmlFor="experience-organisation"
            required
            error={formError(errors, 'organization')}
          >
            <input id="experience-organisation" className="input" {...register('organization')} />
          </Field>
          <Field label="Type" htmlFor="experience-type" error={formError(errors, 'type')}>
            <select id="experience-type" className="input" {...register('type')}>
              {EXPERIENCE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </Field>
          <Field
            label="Location"
            htmlFor="experience-location"
            error={formError(errors, 'location')}
          >
            <input
              id="experience-location"
              className="input"
              placeholder="City, Country or Remote"
              {...register('location')}
            />
          </Field>
          <Field
            label="Start date"
            htmlFor="experience-start"
            required
            error={formError(errors, 'startDate')}
          >
            <input id="experience-start" type="date" className="input" {...register('startDate')} />
          </Field>
          <Field
            label="End date"
            htmlFor="experience-end"
            error={formError(errors, 'endDate')}
            hint={isCurrent ? 'Not required while the role is current.' : undefined}
          >
            <input
              id="experience-end"
              type="date"
              className="input"
              disabled={isCurrent}
              {...register('endDate')}
            />
          </Field>
        </div>
        <CheckboxField
          id="experience-current"
          label="This is my current role"
          description="The end date is shown as “Present” on the public site."
          {...register('isCurrent')}
        />
        <Field
          label="Responsibilities"
          htmlFor="experience-responsibilities"
          error={formError(errors, 'responsibilitiesText')}
          hint="One responsibility per line. Describe only work you actually performed."
        >
          <textarea
            id="experience-responsibilities"
            rows={4}
            className="input resize-y"
            {...register('responsibilitiesText')}
          />
        </Field>
        <Field
          label="Achievements"
          htmlFor="experience-achievements"
          error={formError(errors, 'achievementsText')}
          hint="One achievement per line. Leave empty if there are none to report."
        >
          <textarea
            id="experience-achievements"
            rows={3}
            className="input resize-y"
            {...register('achievementsText')}
          />
        </Field>
        <Field
          label="Technologies"
          htmlFor="experience-technologies"
          error={formError(errors, 'technologiesText')}
          hint="Separate with commas."
        >
          <input id="experience-technologies" className="input" {...register('technologiesText')} />
        </Field>
        <Field
          label="Evidence URL"
          htmlFor="experience-evidence"
          error={formError(errors, 'evidenceUrl')}
          hint="Optional public link to a portfolio piece, certificate or reference."
        >
          <input
            id="experience-evidence"
            type="url"
            className="input"
            placeholder="https://…"
            {...register('evidenceUrl')}
          />
        </Field>
        <CheckboxField
          id="experience-published"
          label="Show on the public site"
          description="Unpublished entries remain in the dashboard."
          {...register('published')}
        />
      </form>
    </Modal>
  );
};

export const ExperiencePage = () => {
  const query = useApiQuery(() => adminApi.listExperience(), []);
  const { pushToast } = useToast();
  const [modalExperience, setModalExperience] = useState<AdminExperience | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminExperience | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [busy, setBusy] = useState(false);

  const items = query.data ?? [];

  const togglePublished = async (experience: AdminExperience) => {
    setBusy(true);
    try {
      const updated = await adminApi.updateExperience(experience.id, {
        organization: experience.organization,
        position: experience.position,
        type: experience.type,
        location: experience.location,
        startDate: toDateInputValue(experience.startDate),
        endDate: toDateInputValue(experience.endDate),
        isCurrent: experience.isCurrent,
        responsibilities: experience.responsibilities,
        achievements: experience.achievements,
        technologies: experience.technologies,
        evidenceUrl: experience.evidenceUrl,
        published: !experience.published,
      });
      query.setData((current) =>
        (current ?? []).map((item) => (item.id === updated.id ? updated : item)),
      );
      pushToast(updated.published ? 'Experience published.' : 'Experience hidden.');
    } catch (error) {
      pushToast(error instanceof Error ? error.message : 'Update failed.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const move = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    setBusy(true);
    try {
      await adminApi.reorderExperience(next.map((item) => item.id));
      query.setData(next);
    } catch (error) {
      pushToast(error instanceof Error ? error.message : 'Order could not be saved.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminApi.deleteExperience(deleteTarget.id);
      query.setData((current) => (current ?? []).filter((item) => item.id !== deleteTarget.id));
      pushToast('Experience deleted.', 'info');
      setDeleteTarget(null);
    } catch (error) {
      pushToast(error instanceof Error ? error.message : 'Delete failed.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <AdminPageHeader
        eyebrow="Content"
        title="Experience"
        description="Internships, professional roles and other relevant experience, ordered newest first."
        actions={
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => {
              setModalExperience(null);
              setModalOpen(true);
            }}
          >
            <Plus size={14} aria-hidden="true" />
            Add experience
          </button>
        }
      />

      {query.loading && !query.data ? (
        <div className="card p-10">
          <LoadingState label="Loading experience…" />
        </div>
      ) : query.error ? (
        <ErrorState message="Experience could not be loaded." onRetry={query.refetch} />
      ) : items.length === 0 ? (
        <EmptyState
          title="No experience added"
          description="Add internships, jobs or volunteer roles. Published entries appear in the experience timeline."
          icon={<BriefcaseBusiness size={20} />}
          action={
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => {
                setModalExperience(null);
                setModalOpen(true);
              }}
            >
              <Plus size={14} aria-hidden="true" />
              Add experience
            </button>
          }
        />
      ) : (
        <div className="space-y-3">
          {items.map((experience, index) => (
            <article key={experience.id} className="card p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex gap-3">
                  <span className="icon-box mt-0.5 size-9">
                    <BriefcaseBusiness size={15} aria-hidden="true" />
                  </span>
                  <div>
                    <h2 className="text-sm font-semibold text-ink">{experience.position}</h2>
                    <p className="text-xs text-muted">
                      {experience.organization} · {experience.type}
                    </p>
                    <p className="mt-1 font-mono text-[0.65rem] uppercase tracking-wide text-muted">
                      {formatDateRange(
                        experience.startDate,
                        experience.endDate,
                        experience.isCurrent,
                      )}
                      {experience.location ? ` · ${experience.location}` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 self-end sm:self-start">
                  <div className="mr-1 flex gap-0.5">
                    <button
                      type="button"
                      onClick={() => void move(index, -1)}
                      disabled={busy || index === 0}
                      className="inline-flex size-8 items-center justify-center rounded-lg text-muted hover:bg-surface2 hover:text-ink disabled:opacity-30"
                      aria-label="Move experience up"
                    >
                      <ArrowUp size={14} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => void move(index, 1)}
                      disabled={busy || index === items.length - 1}
                      className="inline-flex size-8 items-center justify-center rounded-lg text-muted hover:bg-surface2 hover:text-ink disabled:opacity-30"
                      aria-label="Move experience down"
                    >
                      <ArrowDown size={14} aria-hidden="true" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => void togglePublished(experience)}
                    disabled={busy}
                    className={`inline-flex size-8 items-center justify-center rounded-lg ${
                      experience.published
                        ? 'text-success hover:bg-success/10'
                        : 'text-muted hover:bg-surface2 hover:text-ink'
                    }`}
                    aria-label={experience.published ? 'Hide experience' : 'Publish experience'}
                    title={experience.published ? 'Published' : 'Hidden'}
                  >
                    {experience.published ? (
                      <Eye size={15} aria-hidden="true" />
                    ) : (
                      <EyeOff size={15} aria-hidden="true" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setModalExperience(experience);
                      setModalOpen(true);
                    }}
                    className="inline-flex size-8 items-center justify-center rounded-lg text-muted hover:bg-surface2 hover:text-ink"
                    aria-label={`Edit ${experience.position}`}
                  >
                    <Pencil size={14} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(experience)}
                    className="inline-flex size-8 items-center justify-center rounded-lg text-muted hover:bg-danger/10 hover:text-danger"
                    aria-label={`Delete ${experience.position}`}
                  >
                    <Trash2 size={14} aria-hidden="true" />
                  </button>
                </div>
              </div>
              {experience.responsibilities.length > 0 && (
                <ul className="mt-3 list-disc space-y-1 pl-5 text-xs leading-5 text-muted marker:text-accent">
                  {experience.responsibilities.slice(0, 3).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </div>
      )}

      {modalOpen && (
        <ExperienceFormModal
          experience={modalExperience}
          onClose={() => setModalOpen(false)}
          onSaved={query.refetch}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete experience"
        message={`Delete “${deleteTarget?.position ?? ''}” at ${deleteTarget?.organization ?? ''}? This cannot be undone.`}
        confirmLabel="Delete experience"
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void confirmDelete()}
      />
    </>
  );
};
