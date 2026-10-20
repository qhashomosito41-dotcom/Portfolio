import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  GraduationCap,
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
import { arrayToLines, formError, linesToArray } from '../../utils/adminForm';
import { EmptyState, ErrorState, LoadingState } from '../../components/States';
import { educationFormSchema } from '../../utils/adminSchemas';
import type { EducationFormValues } from '../../utils/adminSchemas';
import { formatDateRange, toDateInputValue } from '../../utils/dates';
import type { AdminEducation } from '../../types';

const emptyEducation: EducationFormValues = {
  institution: '',
  qualification: '',
  fieldOfStudy: '',
  location: '',
  startDate: '',
  endDate: '',
  isCurrent: true,
  description: '',
  modulesText: '',
  achievementsText: '',
  published: true,
};

const toFormValues = (education: AdminEducation): EducationFormValues => ({
  institution: education.institution,
  qualification: education.qualification,
  fieldOfStudy: education.fieldOfStudy ?? '',
  location: education.location ?? '',
  startDate: toDateInputValue(education.startDate),
  endDate: toDateInputValue(education.endDate),
  isCurrent: education.isCurrent,
  description: education.description ?? '',
  modulesText: arrayToLines(education.modules),
  achievementsText: arrayToLines(education.achievements),
  published: education.published,
});

const EducationFormModal = ({
  education,
  onClose,
  onSaved,
}: {
  education: AdminEducation | null;
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
  } = useForm<EducationFormValues>({
    resolver: zodResolver(educationFormSchema),
    defaultValues: education ? toFormValues(education) : emptyEducation,
  });
  const isCurrent = watch('isCurrent');

  const onSubmit = async (values: EducationFormValues) => {
    setServerError(null);
    const payload = {
      institution: values.institution,
      qualification: values.qualification,
      fieldOfStudy: values.fieldOfStudy,
      location: values.location,
      startDate: values.startDate,
      endDate: values.isCurrent ? '' : values.endDate,
      isCurrent: values.isCurrent,
      description: values.description,
      modules: linesToArray(values.modulesText),
      achievements: linesToArray(values.achievementsText),
      published: values.published,
    };
    try {
      if (education) {
        await adminApi.updateEducation(education.id, payload);
        pushToast('Education updated.');
      } else {
        await adminApi.createEducation(payload);
        pushToast('Education added.');
      }
      onSaved();
      onClose();
    } catch (error) {
      if (error instanceof Error) setServerError(error.message);
      if (error instanceof Error && 'details' in error) {
        const details = (error as { details?: Record<string, string[]> }).details;
        if (details) {
          (Object.keys(details) as (keyof EducationFormValues)[]).forEach((key) => {
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
      title={education ? 'Edit education' : 'Add education'}
      description="Degrees, diplomas and in-progress qualifications."
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
            form="education-form"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting && <LoaderCircle size={15} className="animate-spin" aria-hidden="true" />}
            {education ? 'Save changes' : 'Add education'}
          </button>
        </>
      }
    >
      <form id="education-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
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
            label="Institution"
            htmlFor="education-institution"
            required
            error={formError(errors, 'institution')}
          >
            <input id="education-institution" className="input" {...register('institution')} />
          </Field>
          <Field
            label="Qualification"
            htmlFor="education-qualification"
            required
            error={formError(errors, 'qualification')}
            hint="For example: BSc Computer Science"
          >
            <input id="education-qualification" className="input" {...register('qualification')} />
          </Field>
          <Field
            label="Field of study"
            htmlFor="education-field"
            error={formError(errors, 'fieldOfStudy')}
          >
            <input id="education-field" className="input" {...register('fieldOfStudy')} />
          </Field>
          <Field
            label="Location"
            htmlFor="education-location"
            error={formError(errors, 'location')}
          >
            <input id="education-location" className="input" {...register('location')} />
          </Field>
          <Field
            label="Start date"
            htmlFor="education-start"
            error={formError(errors, 'startDate')}
          >
            <input id="education-start" type="date" className="input" {...register('startDate')} />
          </Field>
          <Field
            label="End date"
            htmlFor="education-end"
            error={formError(errors, 'endDate')}
            hint={isCurrent ? 'Leave empty while studying.' : undefined}
          >
            <input
              id="education-end"
              type="date"
              className="input"
              disabled={isCurrent}
              {...register('endDate')}
            />
          </Field>
        </div>
        <CheckboxField
          id="education-current"
          label="Currently studying"
          description="The end date is shown as “Present” on the public site."
          {...register('isCurrent')}
        />
        <Field
          label="Description"
          htmlFor="education-description"
          error={formError(errors, 'description')}
        >
          <textarea
            id="education-description"
            rows={3}
            className="input resize-y"
            {...register('description')}
          />
        </Field>
        <Field
          label="Relevant modules"
          htmlFor="education-modules"
          error={formError(errors, 'modulesText')}
          hint="One module per line. Only list modules you have actually taken."
        >
          <textarea
            id="education-modules"
            rows={3}
            className="input resize-y"
            {...register('modulesText')}
          />
        </Field>
        <Field
          label="Achievements"
          htmlFor="education-achievements"
          error={formError(errors, 'achievementsText')}
          hint="One achievement per line. Leave empty if none."
        >
          <textarea
            id="education-achievements"
            rows={2}
            className="input resize-y"
            {...register('achievementsText')}
          />
        </Field>
        <CheckboxField
          id="education-published"
          label="Show on the public site"
          {...register('published')}
        />
      </form>
    </Modal>
  );
};

export const EducationPage = () => {
  const query = useApiQuery(() => adminApi.listEducation(), []);
  const { pushToast } = useToast();
  const [modalEducation, setModalEducation] = useState<AdminEducation | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminEducation | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [busy, setBusy] = useState(false);
  const items = query.data ?? [];

  const openModal = (education: AdminEducation | null) => {
    setModalEducation(education);
    setModalOpen(true);
  };

  const togglePublished = async (education: AdminEducation) => {
    setBusy(true);
    try {
      const updated = await adminApi.updateEducation(education.id, {
        institution: education.institution,
        qualification: education.qualification,
        fieldOfStudy: education.fieldOfStudy,
        location: education.location,
        startDate: toDateInputValue(education.startDate),
        endDate: toDateInputValue(education.endDate),
        isCurrent: education.isCurrent,
        description: education.description,
        modules: education.modules,
        achievements: education.achievements,
        published: !education.published,
      });
      query.setData((current) =>
        (current ?? []).map((item) => (item.id === updated.id ? updated : item)),
      );
      pushToast(updated.published ? 'Education published.' : 'Education hidden.');
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
      await adminApi.reorderEducation(next.map((item) => item.id));
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
      await adminApi.deleteEducation(deleteTarget.id);
      query.setData((current) => (current ?? []).filter((item) => item.id !== deleteTarget.id));
      pushToast('Education deleted.', 'info');
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
        title="Education"
        description="Academic history shown on the portfolio. Keep qualification names accurate."
        actions={
          <button type="button" className="btn btn-primary btn-sm" onClick={() => openModal(null)}>
            <Plus size={14} aria-hidden="true" />
            Add education
          </button>
        }
      />

      {query.loading && !query.data ? (
        <div className="card p-10">
          <LoadingState label="Loading education…" />
        </div>
      ) : query.error ? (
        <ErrorState message="Education could not be loaded." onRetry={query.refetch} />
      ) : items.length === 0 ? (
        <EmptyState
          title="No education added"
          description="Add your current or completed qualifications."
          icon={<GraduationCap size={20} />}
          action={
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => openModal(null)}
            >
              <Plus size={14} aria-hidden="true" />
              Add education
            </button>
          }
        />
      ) : (
        <div className="space-y-3">
          {items.map((education, index) => (
            <article key={education.id} className="card p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex gap-3">
                  <span className="icon-box mt-0.5 size-9">
                    <GraduationCap size={15} aria-hidden="true" />
                  </span>
                  <div>
                    <h2 className="text-sm font-semibold text-ink">{education.qualification}</h2>
                    <p className="text-xs text-muted">{education.institution}</p>
                    <p className="mt-1 font-mono text-[0.65rem] uppercase tracking-wide text-muted">
                      {formatDateRange(education.startDate, education.endDate, education.isCurrent)}
                      {education.fieldOfStudy ? ` · ${education.fieldOfStudy}` : ''}
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
                      aria-label="Move education up"
                    >
                      <ArrowUp size={14} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => void move(index, 1)}
                      disabled={busy || index === items.length - 1}
                      className="inline-flex size-8 items-center justify-center rounded-lg text-muted hover:bg-surface2 hover:text-ink disabled:opacity-30"
                      aria-label="Move education down"
                    >
                      <ArrowDown size={14} aria-hidden="true" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => void togglePublished(education)}
                    disabled={busy}
                    className={`inline-flex size-8 items-center justify-center rounded-lg ${
                      education.published
                        ? 'text-success hover:bg-success/10'
                        : 'text-muted hover:bg-surface2 hover:text-ink'
                    }`}
                    aria-label={education.published ? 'Hide education' : 'Publish education'}
                    title={education.published ? 'Published' : 'Hidden'}
                  >
                    {education.published ? (
                      <Eye size={15} aria-hidden="true" />
                    ) : (
                      <EyeOff size={15} aria-hidden="true" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => openModal(education)}
                    className="inline-flex size-8 items-center justify-center rounded-lg text-muted hover:bg-surface2 hover:text-ink"
                    aria-label={`Edit ${education.qualification}`}
                  >
                    <Pencil size={14} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(education)}
                    className="inline-flex size-8 items-center justify-center rounded-lg text-muted hover:bg-danger/10 hover:text-danger"
                    aria-label={`Delete ${education.qualification}`}
                  >
                    <Trash2 size={14} aria-hidden="true" />
                  </button>
                </div>
              </div>
              {education.description && (
                <p className="mt-3 line-clamp-2 text-xs leading-5 text-muted">
                  {education.description}
                </p>
              )}
            </article>
          ))}
        </div>
      )}

      {modalOpen && (
        <EducationFormModal
          education={modalEducation}
          onClose={() => setModalOpen(false)}
          onSaved={query.refetch}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete education"
        message={`Delete “${deleteTarget?.qualification ?? ''}”? This cannot be undone.`}
        confirmLabel="Delete education"
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void confirmDelete()}
      />
    </>
  );
};
