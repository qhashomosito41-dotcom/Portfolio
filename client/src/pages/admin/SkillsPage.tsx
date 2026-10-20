import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  LoaderCircle,
  Pencil,
  Plus,
  Search,
  Trash2,
  Wrench,
} from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useToast } from '../../contexts/ToastContext';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { Modal } from '../../components/admin/Modal';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { CheckboxField, Field } from '../../components/admin/Field';
import { formError } from '../../utils/adminForm';
import { EmptyState, ErrorState, LoadingState } from '../../components/States';
import { skillFormSchema } from '../../utils/adminSchemas';
import type { SkillFormValues } from '../../utils/adminSchemas';
import { SKILL_CATEGORY_SUGGESTIONS } from '../../utils/constants';
import type { AdminSkill } from '../../types';

const emptySkill: SkillFormValues = {
  name: '',
  category: '',
  description: '',
  proficiencyLabel: '',
  context: '',
  visible: true,
};

const SkillFormModal = ({
  skill,
  onClose,
  onSaved,
}: {
  skill: AdminSkill | null;
  onClose: () => void;
  onSaved: () => void;
}) => {
  const { pushToast } = useToast();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SkillFormValues>({
    resolver: zodResolver(skillFormSchema),
    defaultValues: skill
      ? {
          name: skill.name,
          category: skill.category,
          description: skill.description ?? '',
          proficiencyLabel: skill.proficiencyLabel ?? '',
          context: skill.context ?? '',
          visible: skill.visible,
        }
      : emptySkill,
  });

  const onSubmit = async (values: SkillFormValues) => {
    setServerError(null);
    try {
      if (skill) {
        await adminApi.updateSkill(skill.id, values);
        pushToast('Skill updated.');
      } else {
        await adminApi.createSkill(values);
        pushToast('Skill added.');
      }
      onSaved();
      onClose();
    } catch (error) {
      if (error instanceof Error) setServerError(error.message);
      if (error instanceof Error && 'details' in error) {
        const details = (error as { details?: Record<string, string[]> }).details;
        if (details) {
          (Object.keys(details) as (keyof SkillFormValues)[]).forEach((key) => {
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
      title={skill ? 'Edit skill' : 'Add skill'}
      description="Skills are grouped by category on the public site."
      size="md"
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
            form="skill-form"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting && <LoaderCircle size={15} className="animate-spin" aria-hidden="true" />}
            {skill ? 'Save skill' : 'Add skill'}
          </button>
        </>
      }
    >
      <form id="skill-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {serverError && (
          <p
            role="alert"
            className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2.5 text-sm text-danger"
          >
            {serverError}
          </p>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Skill name" htmlFor="skill-name" required error={formError(errors, 'name')}>
            <input id="skill-name" className="input" {...register('name')} />
          </Field>
          <Field
            label="Category"
            htmlFor="skill-category"
            required
            error={formError(errors, 'category')}
          >
            <input
              id="skill-category"
              className="input"
              list="skill-categories"
              {...register('category')}
            />
            <datalist id="skill-categories">
              {SKILL_CATEGORY_SUGGESTIONS.map((category) => (
                <option key={category} value={category} />
              ))}
            </datalist>
          </Field>
        </div>
        <Field
          label="Proficiency label"
          htmlFor="skill-proficiency"
          error={formError(errors, 'proficiencyLabel')}
          hint="A short, honest label such as “Working knowledge” or “Academic experience”."
        >
          <input id="skill-proficiency" className="input" {...register('proficiencyLabel')} />
        </Field>
        <Field
          label="Description"
          htmlFor="skill-description"
          error={formError(errors, 'description')}
        >
          <textarea
            id="skill-description"
            rows={3}
            className="input resize-y"
            {...register('description')}
          />
        </Field>
        <Field
          label="Context"
          htmlFor="skill-context"
          error={formError(errors, 'context')}
          hint="Where you used it, e.g. “Used in academic projects and coursework”."
        >
          <input id="skill-context" className="input" {...register('context')} />
        </Field>
        <CheckboxField
          id="skill-visible"
          label="Show on the public site"
          description="Hidden skills remain available in the dashboard."
          {...register('visible')}
        />
      </form>
    </Modal>
  );
};

export const SkillsPage = () => {
  const query = useApiQuery(() => adminApi.listSkills(), []);
  const { pushToast } = useToast();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [modalSkill, setModalSkill] = useState<AdminSkill | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminSkill | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [busy, setBusy] = useState(false);

  const skills = useMemo(() => query.data ?? [], [query.data]);
  const categories = useMemo(
    () => Array.from(new Set(skills.map((skill) => skill.category))).sort(),
    [skills],
  );
  const filtered = useMemo(
    () =>
      skills.filter((skill) => {
        const matchesSearch =
          !search.trim() ||
          [skill.name, skill.category, skill.proficiencyLabel, skill.description]
            .filter(Boolean)
            .some((value) => value!.toLowerCase().includes(search.toLowerCase()));
        const matchesCategory = category === 'all' || skill.category === category;
        return matchesSearch && matchesCategory;
      }),
    [skills, search, category],
  );

  const openCreate = () => {
    setModalSkill(null);
    setModalOpen(true);
  };

  const openEdit = (skill: AdminSkill) => {
    setModalSkill(skill);
    setModalOpen(true);
  };

  const toggleVisibility = async (skill: AdminSkill) => {
    setBusy(true);
    try {
      const updated = await adminApi.updateSkill(skill.id, {
        name: skill.name,
        category: skill.category,
        description: skill.description,
        proficiencyLabel: skill.proficiencyLabel,
        context: skill.context,
        visible: !skill.visible,
      });
      query.setData((current) =>
        (current ?? []).map((item) => (item.id === updated.id ? updated : item)),
      );
      pushToast(updated.visible ? 'Skill is now visible.' : 'Skill hidden from the public site.');
    } catch (error) {
      pushToast(
        error instanceof Error ? error.message : 'The skill could not be updated.',
        'error',
      );
    } finally {
      setBusy(false);
    }
  };

  const move = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= skills.length) return;
    const next = [...skills];
    [next[index], next[target]] = [next[target], next[index]];
    setBusy(true);
    try {
      await adminApi.reorderSkills(next.map((skill) => skill.id));
      query.setData(next);
    } catch (error) {
      pushToast(error instanceof Error ? error.message : 'The order could not be saved.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminApi.deleteSkill(deleteTarget.id);
      query.setData((current) => (current ?? []).filter((item) => item.id !== deleteTarget.id));
      pushToast('Skill deleted.', 'info');
      setDeleteTarget(null);
    } catch (error) {
      pushToast(
        error instanceof Error ? error.message : 'The skill could not be deleted.',
        'error',
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <AdminPageHeader
        eyebrow="Content"
        title="Skills"
        description="Group technical and professional skills by category. Use honest proficiency labels."
        actions={
          <button type="button" onClick={openCreate} className="btn btn-primary btn-sm">
            <Plus size={14} aria-hidden="true" />
            Add skill
          </button>
        }
      />

      {query.loading && !query.data ? (
        <div className="card p-10">
          <LoadingState label="Loading skills…" />
        </div>
      ) : query.error ? (
        <ErrorState message="Skills could not be loaded." onRetry={query.refetch} />
      ) : skills.length === 0 ? (
        <EmptyState
          title="No skills yet"
          description="Add the technologies and capabilities you want visitors to see."
          icon={<Wrench size={20} />}
          action={
            <button type="button" onClick={openCreate} className="btn btn-primary btn-sm">
              <Plus size={14} aria-hidden="true" />
              Add the first skill
            </button>
          }
        />
      ) : (
        <>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                aria-hidden="true"
              />
              <input
                type="search"
                className="input pl-9"
                placeholder="Search skills…"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                aria-label="Search skills"
              />
            </div>
            <select
              className="input sm:w-56"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              aria-label="Filter by category"
            >
              <option value="all">All categories</option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              title="No matching skills"
              description="Try changing the search term or category filter."
              icon={<Search size={20} />}
            />
          ) : (
            <div className="table-shell">
              <table className="data-table">
                <caption className="sr-only">Portfolio skills</caption>
                <thead>
                  <tr>
                    <th scope="col" className="w-16">
                      Order
                    </th>
                    <th scope="col">Skill</th>
                    <th scope="col">Category</th>
                    <th scope="col">Proficiency</th>
                    <th scope="col">Visible</th>
                    <th scope="col" className="text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((skill) => {
                    const index = skills.findIndex((item) => item.id === skill.id);
                    return (
                      <tr key={skill.id}>
                        <td>
                          <div className="flex gap-0.5">
                            <button
                              type="button"
                              onClick={() => void move(index, -1)}
                              disabled={busy || index === 0}
                              className="inline-flex size-7 items-center justify-center rounded text-muted hover:bg-surface2 hover:text-ink disabled:opacity-30"
                              aria-label={`Move ${skill.name} up`}
                            >
                              <ArrowUp size={13} aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              onClick={() => void move(index, 1)}
                              disabled={busy || index === skills.length - 1}
                              className="inline-flex size-7 items-center justify-center rounded text-muted hover:bg-surface2 hover:text-ink disabled:opacity-30"
                              aria-label={`Move ${skill.name} down`}
                            >
                              <ArrowDown size={13} aria-hidden="true" />
                            </button>
                          </div>
                        </td>
                        <td>
                          <p className="font-medium text-ink">{skill.name}</p>
                          {skill.description && (
                            <p className="mt-0.5 max-w-sm truncate text-xs text-muted">
                              {skill.description}
                            </p>
                          )}
                        </td>
                        <td className="whitespace-nowrap text-xs text-muted">{skill.category}</td>
                        <td className="text-xs text-muted">{skill.proficiencyLabel || '—'}</td>
                        <td>
                          <button
                            type="button"
                            onClick={() => void toggleVisibility(skill)}
                            disabled={busy}
                            className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                              skill.visible ? 'text-success' : 'text-muted'
                            } hover:underline`}
                          >
                            {skill.visible ? (
                              <Eye size={13} aria-hidden="true" />
                            ) : (
                              <EyeOff size={13} aria-hidden="true" />
                            )}
                            {skill.visible ? 'Visible' : 'Hidden'}
                          </button>
                        </td>
                        <td>
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => openEdit(skill)}
                              className="inline-flex size-8 items-center justify-center rounded-lg text-muted hover:bg-surface2 hover:text-ink"
                              aria-label={`Edit ${skill.name}`}
                            >
                              <Pencil size={14} aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(skill)}
                              className="inline-flex size-8 items-center justify-center rounded-lg text-muted hover:bg-danger/10 hover:text-danger"
                              aria-label={`Delete ${skill.name}`}
                            >
                              <Trash2 size={14} aria-hidden="true" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {modalOpen && (
        <SkillFormModal
          skill={modalSkill}
          onClose={() => setModalOpen(false)}
          onSaved={query.refetch}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete skill"
        message={`Delete “${deleteTarget?.name ?? ''}” from your skills? This cannot be undone.`}
        confirmLabel="Delete skill"
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void confirmDelete()}
      />
    </>
  );
};
