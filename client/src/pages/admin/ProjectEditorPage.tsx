import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowUpRight, LoaderCircle, Save, Trash2 } from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import { ApiError } from '../../services/api';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useToast } from '../../contexts/ToastContext';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { CheckboxField, Field } from '../../components/admin/Field';
import {
  arrayToCommas,
  arrayToLines,
  commaToArray,
  formError,
  linesToArray,
} from '../../utils/adminForm';
import { ProjectImages } from '../../components/admin/ProjectImages';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { ErrorState, LoadingState } from '../../components/States';
import { projectFormSchema } from '../../utils/adminSchemas';
import type { ProjectFormValues } from '../../utils/adminSchemas';
import { PROJECT_CATEGORIES, PROJECT_STATUSES } from '../../utils/constants';
import { toDateInputValue } from '../../utils/dates';
import type { AdminProject } from '../../types';

const blankProject: ProjectFormValues = {
  title: '',
  slug: '',
  shortDescription: '',
  fullDescription: '',
  category: 'Web Applications',
  projectStatus: 'In Progress',
  contribution: '',
  keyFeaturesText: '',
  challenges: '',
  solutions: '',
  technologiesText: '',
  repositoryUrl: '',
  liveUrl: '',
  startDate: '',
  endDate: '',
  featured: false,
  published: false,
};

const toFormValues = (project: AdminProject): ProjectFormValues => ({
  title: project.title,
  slug: project.slug,
  shortDescription: project.shortDescription,
  fullDescription: project.fullDescription,
  category: project.category as ProjectFormValues['category'],
  projectStatus: project.projectStatus as ProjectFormValues['projectStatus'],
  contribution: project.contribution ?? '',
  keyFeaturesText: arrayToLines(project.keyFeatures),
  challenges: project.challenges ?? '',
  solutions: project.solutions ?? '',
  technologiesText: arrayToCommas(project.technologies),
  repositoryUrl: project.repositoryUrl ?? '',
  liveUrl: project.liveUrl ?? '',
  startDate: toDateInputValue(project.startDate),
  endDate: toDateInputValue(project.endDate),
  featured: project.featured,
  published: project.published,
});

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);

const ProjectForm = ({ project }: { project?: AdminProject }) => {
  const navigate = useNavigate();
  const { pushToast } = useToast();
  const [serverError, setServerError] = useState<string | null>(null);
  const [images, setImages] = useState<AdminProject['images']>(project?.images ?? []);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    watch,
    setError,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: project ? toFormValues(project) : blankProject,
  });

  const isCurrentSlug = watch('slug');
  const published = watch('published');
  const isCurrent = watch('projectStatus');

  const onSubmit = async (values: ProjectFormValues) => {
    setServerError(null);
    const payload = {
      title: values.title,
      slug: values.slug,
      shortDescription: values.shortDescription,
      fullDescription: values.fullDescription,
      category: values.category,
      projectStatus: values.projectStatus,
      contribution: values.contribution,
      keyFeatures: linesToArray(values.keyFeaturesText),
      challenges: values.challenges,
      solutions: values.solutions,
      technologies: commaToArray(values.technologiesText),
      repositoryUrl: values.repositoryUrl,
      liveUrl: values.liveUrl,
      startDate: values.startDate,
      endDate: values.endDate,
      featured: values.featured,
      published: values.published,
    };

    try {
      if (project) {
        const updated = await adminApi.updateProject(project.id, payload);
        reset(toFormValues(updated));
        pushToast('Project updated.');
      } else {
        const created = await adminApi.createProject(payload);
        pushToast(created.published ? 'Project created and published.' : 'Draft project created.');
        navigate(`/admin/projects/${created.id}`, { replace: true });
      }
    } catch (error) {
      if (error instanceof ApiError) {
        setServerError(error.message);
        if (error.details) {
          (Object.keys(error.details) as (keyof ProjectFormValues)[]).forEach((key) => {
            const message = error.details?.[key]?.[0];
            if (message) setError(key, { type: 'server', message });
          });
        }
      } else {
        setServerError('The project could not be saved. Please try again.');
      }
    }
  };

  const handleDelete = async () => {
    if (!project) return;
    setDeleting(true);
    try {
      await adminApi.deleteProject(project.id);
      pushToast('Project deleted.', 'info');
      navigate('/admin/projects', { replace: true });
    } catch (error) {
      setDeleting(false);
      pushToast(
        error instanceof Error ? error.message : 'The project could not be deleted.',
        'error',
      );
    }
  };

  return (
    <>
      <AdminPageHeader
        eyebrow="Projects"
        title={project ? 'Edit project' : 'New project'}
        description={
          project
            ? 'Update the case study, visibility and screenshots for this project.'
            : 'Create a case study. You can keep it as a draft until it is ready to publish.'
        }
        actions={
          <>
            <Link to="/admin/projects" className="btn btn-secondary btn-sm">
              <ArrowLeft size={14} aria-hidden="true" />
              Back
            </Link>
            {project?.published && (
              <a
                href={`/projects/${project.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary btn-sm"
              >
                View
                <ArrowUpRight size={14} aria-hidden="true" />
              </a>
            )}
            <button
              type="submit"
              form="project-form"
              className="btn btn-primary btn-sm"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <LoaderCircle size={14} className="animate-spin" aria-hidden="true" />
              ) : (
                <Save size={14} aria-hidden="true" />
              )}
              {isSubmitting ? 'Saving…' : 'Save project'}
            </button>
          </>
        }
      />

      <form id="project-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {serverError && (
          <div
            role="alert"
            className="rounded-xl border border-danger/35 bg-danger/10 px-4 py-3 text-sm text-danger"
          >
            {serverError}
          </div>
        )}

        <section className="card p-5 sm:p-6" aria-labelledby="project-basics">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 id="project-basics" className="text-sm font-semibold text-ink">
              Project details
            </h2>
            <span className="badge">
              {isCurrent} · {published ? 'Published' : 'Draft'}
            </span>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field
              label="Title"
              htmlFor="title"
              required
              error={formError(errors, 'title')}
              className="sm:col-span-2"
            >
              <input
                id="title"
                className="input"
                {...register('title', {
                  onBlur: (event) => {
                    if (!getValues('slug') && event.target.value) {
                      setValue('slug', slugify(event.target.value), { shouldValidate: true });
                    }
                  },
                })}
              />
            </Field>
            <Field
              label="Slug"
              htmlFor="slug"
              error={formError(errors, 'slug')}
              hint={`Public URL: /projects/${isCurrentSlug || slugify(getValues('title')) || 'project-slug'}`}
            >
              <input id="slug" className="input font-mono text-xs" {...register('slug')} />
            </Field>
            <Field label="Category" htmlFor="category" error={formError(errors, 'category')}>
              <select id="category" className="input" {...register('category')}>
                {PROJECT_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </Field>
            <Field
              label="Project status"
              htmlFor="projectStatus"
              error={formError(errors, 'projectStatus')}
            >
              <select id="projectStatus" className="input" {...register('projectStatus')}>
                {PROJECT_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Start date" htmlFor="startDate" error={formError(errors, 'startDate')}>
                <input id="startDate" type="date" className="input" {...register('startDate')} />
              </Field>
              <Field label="End date" htmlFor="endDate" error={formError(errors, 'endDate')}>
                <input id="endDate" type="date" className="input" {...register('endDate')} />
              </Field>
            </div>
            <Field
              label="Short description"
              htmlFor="shortDescription"
              required
              error={formError(errors, 'shortDescription')}
              hint="Shown on cards and in search results. Maximum 400 characters."
              className="sm:col-span-2"
            >
              <textarea
                id="shortDescription"
                rows={2}
                className="input resize-y"
                {...register('shortDescription')}
              />
            </Field>
            <Field
              label="Overview"
              htmlFor="fullDescription"
              required
              error={formError(errors, 'fullDescription')}
              hint="Use blank lines to separate paragraphs."
              className="sm:col-span-2"
            >
              <textarea
                id="fullDescription"
                rows={6}
                className="input resize-y"
                {...register('fullDescription')}
              />
            </Field>
          </div>
        </section>

        <section className="card p-5 sm:p-6" aria-labelledby="project-story">
          <h2 id="project-story" className="text-sm font-semibold text-ink">
            Case study
          </h2>
          <div className="mt-4 space-y-4">
            <Field
              label="My contribution"
              htmlFor="contribution"
              error={formError(errors, 'contribution')}
              hint="Explain which parts you personally designed or built."
            >
              <textarea
                id="contribution"
                rows={3}
                className="input resize-y"
                {...register('contribution')}
              />
            </Field>
            <Field
              label="Key features"
              htmlFor="keyFeaturesText"
              error={formError(errors, 'keyFeaturesText')}
              hint="One feature per line."
            >
              <textarea
                id="keyFeaturesText"
                rows={4}
                className="input resize-y"
                {...register('keyFeaturesText')}
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Challenges"
                htmlFor="challenges"
                error={formError(errors, 'challenges')}
              >
                <textarea
                  id="challenges"
                  rows={4}
                  className="input resize-y"
                  {...register('challenges')}
                />
              </Field>
              <Field label="Solutions" htmlFor="solutions" error={formError(errors, 'solutions')}>
                <textarea
                  id="solutions"
                  rows={4}
                  className="input resize-y"
                  {...register('solutions')}
                />
              </Field>
            </div>
          </div>
        </section>

        <section className="card p-5 sm:p-6" aria-labelledby="project-tech">
          <h2 id="project-tech" className="text-sm font-semibold text-ink">
            Technology and links
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field
              label="Technologies"
              htmlFor="technologiesText"
              error={formError(errors, 'technologiesText')}
              hint="Separate with commas or new lines."
              className="sm:col-span-2"
            >
              <textarea
                id="technologiesText"
                rows={2}
                className="input resize-y"
                {...register('technologiesText')}
              />
            </Field>
            <Field
              label="Live project URL"
              htmlFor="liveUrl"
              error={formError(errors, 'liveUrl')}
              hint="Include https://"
            >
              <input
                id="liveUrl"
                type="url"
                className="input"
                placeholder="https://example.com"
                {...register('liveUrl')}
              />
            </Field>
            <Field
              label="Repository URL"
              htmlFor="repositoryUrl"
              error={formError(errors, 'repositoryUrl')}
              hint="Include https://"
            >
              <input
                id="repositoryUrl"
                type="url"
                className="input"
                placeholder="https://github.com/…"
                {...register('repositoryUrl')}
              />
            </Field>
          </div>
        </section>

        <section className="card p-5 sm:p-6" aria-labelledby="project-visibility">
          <h2 id="project-visibility" className="text-sm font-semibold text-ink">
            Visibility
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <CheckboxField
              id="published"
              label="Publish this project"
              description="Visible to visitors on the public portfolio."
              {...register('published')}
            />
            <CheckboxField
              id="featured"
              label="Feature this project"
              description="Highlights the project in listings where featured work is prioritised."
              {...register('featured')}
            />
          </div>
        </section>
      </form>

      {project ? (
        <div className="mt-5">
          <ProjectImages projectId={project.id} images={images} onChange={setImages} />
        </div>
      ) : (
        <div className="mt-5 rounded-xl border border-dashed border-line bg-surface/60 px-5 py-4 text-sm text-muted">
          Save this project first, then upload screenshots from the edit screen.
        </div>
      )}

      <div className="mt-6 flex flex-col-reverse gap-2 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {project && (
            <button
              type="button"
              className="btn btn-ghost btn-sm text-danger hover:bg-danger/10 hover:text-danger"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 size={14} aria-hidden="true" />
              Delete project
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          <p className="hidden text-xs text-muted sm:block">
            {isDirty ? 'You have unsaved changes.' : 'All changes are saved.'}
          </p>
          <button
            type="submit"
            form="project-form"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />
            ) : (
              <Save size={16} aria-hidden="true" />
            )}
            {isSubmitting ? 'Saving…' : 'Save project'}
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        title="Delete project"
        message={`Delete “${project?.title ?? ''}” and all of its screenshots? This cannot be undone.`}
        confirmLabel="Delete project"
        loading={deleting}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={() => void handleDelete()}
      />
    </>
  );
};

export const ProjectEditorPage = () => {
  const { id } = useParams();
  const projectId = id ? Number(id) : null;
  const query = useApiQuery(
    () => (projectId ? adminApi.getProject(projectId) : Promise.resolve(null)),
    [projectId],
  );

  if (!projectId) return <ProjectForm />;

  if (query.loading && !query.data) return <LoadingState label="Loading project…" />;
  if (query.error || !query.data) {
    return (
      <ErrorState
        message="The project could not be loaded. It may have been deleted."
        onRetry={query.refetch}
      />
    );
  }

  return <ProjectForm project={query.data} />;
};
