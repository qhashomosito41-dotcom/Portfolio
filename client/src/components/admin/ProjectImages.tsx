import { useRef, useState } from 'react';
import { ArrowDown, ArrowUp, ImagePlus, LoaderCircle, Save, Star, Trash2 } from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import { useToast } from '../../contexts/ToastContext';
import { ConfirmDialog } from './ConfirmDialog';
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_BYTES } from '../../utils/constants';
import { formatFileSize } from '../../utils/dates';
import type { AdminProject, ProjectImage } from '../../types';

type ProjectImageWithFile = ProjectImage & { filePath?: string };

const ImageCard = ({
  image,
  isCover,
  canMoveUp,
  canMoveDown,
  busy,
  onMove,
  onDelete,
  onSaveAlt,
}: {
  image: ProjectImageWithFile;
  isCover: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  busy: boolean;
  onMove: (direction: -1 | 1) => void;
  onDelete: () => void;
  onSaveAlt: (altText: string) => Promise<void>;
}) => {
  const [altText, setAltText] = useState(image.altText ?? '');
  const [saving, setSaving] = useState(false);
  const dirty = altText !== (image.altText ?? '');

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-bg">
      <div className="relative aspect-video bg-surface2">
        {image.url ? (
          <img src={image.url} alt={image.altText ?? ''} className="size-full object-cover" />
        ) : (
          <div className="flex size-full items-center justify-center text-xs text-muted">
            Image unavailable
          </div>
        )}
        {isCover && (
          <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-bg/85 px-2 py-1 text-[0.62rem] font-semibold text-warning backdrop-blur">
            <Star size={10} className="fill-warning" aria-hidden="true" />
            Cover
          </span>
        )}
      </div>
      <div className="space-y-2 p-3">
        <label className="label !mb-1 text-xs" htmlFor={`alt-${image.id}`}>
          Alt text
        </label>
        <div className="flex gap-1.5">
          <input
            id={`alt-${image.id}`}
            className="input !py-1.5 text-xs"
            value={altText}
            maxLength={255}
            onChange={(event) => setAltText(event.target.value)}
            placeholder="Describe the image"
            disabled={busy || saving}
          />
          <button
            type="button"
            onClick={async () => {
              setSaving(true);
              try {
                await onSaveAlt(altText.trim());
              } finally {
                setSaving(false);
              }
            }}
            className="btn btn-secondary btn-sm !min-h-8 !px-2.5"
            disabled={!dirty || busy || saving}
            aria-label="Save alt text"
          >
            {saving ? (
              <LoaderCircle size={13} className="animate-spin" aria-hidden="true" />
            ) : (
              <Save size={13} aria-hidden="true" />
            )}
          </button>
        </div>
        <div className="flex items-center justify-between pt-1">
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => onMove(-1)}
              disabled={!canMoveUp || busy}
              className="inline-flex size-7 items-center justify-center rounded-md text-muted transition hover:bg-surface2 hover:text-ink disabled:opacity-40"
              aria-label="Move image earlier"
            >
              <ArrowUp size={13} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => onMove(1)}
              disabled={!canMoveDown || busy}
              className="inline-flex size-7 items-center justify-center rounded-md text-muted transition hover:bg-surface2 hover:text-ink disabled:opacity-40"
              aria-label="Move image later"
            >
              <ArrowDown size={13} aria-hidden="true" />
            </button>
          </div>
          <button
            type="button"
            onClick={onDelete}
            disabled={busy}
            className="inline-flex size-7 items-center justify-center rounded-md text-muted transition hover:bg-danger/10 hover:text-danger disabled:opacity-40"
            aria-label="Delete image"
          >
            <Trash2 size={13} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const ProjectImages = ({
  projectId,
  images,
  onChange,
}: {
  projectId: number;
  images: ProjectImageWithFile[];
  onChange: (images: AdminProject['images']) => void;
}) => {
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProjectImageWithFile | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { pushToast } = useToast();

  const upload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError(null);
    setUploading(true);
    try {
      let latest = images;
      for (const file of Array.from(files)) {
        if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
          throw new Error(`${file.name} is not a supported image format.`);
        }
        if (file.size > MAX_IMAGE_BYTES) {
          throw new Error(`${file.name} is larger than ${formatFileSize(MAX_IMAGE_BYTES)}.`);
        }
        const result = await adminApi.uploadProjectImage(projectId, file);
        latest = result.project.images;
      }
      onChange(latest);
      pushToast(files.length === 1 ? 'Image uploaded.' : `${files.length} images uploaded.`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'The image could not be uploaded.');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const move = async (index: number, direction: -1 | 1) => {
    const next = [...images];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setBusy(true);
    setError(null);
    try {
      await adminApi.reorderProjectImages(
        projectId,
        next.map((image) => image.id),
      );
      onChange(next);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'The image order could not be saved.');
    } finally {
      setBusy(false);
    }
  };

  const saveAlt = async (image: ProjectImageWithFile, altText: string) => {
    try {
      await adminApi.updateProjectImage(projectId, image.id, { altText });
      onChange(images.map((item) => (item.id === image.id ? { ...item, altText } : item)));
      pushToast('Alt text saved.');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Alt text could not be saved.');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setBusy(true);
    setError(null);
    try {
      await adminApi.deleteProjectImage(projectId, deleteTarget.id);
      onChange(images.filter((image) => image.id !== deleteTarget.id));
      pushToast('Image deleted.', 'info');
      setDeleteTarget(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'The image could not be deleted.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="card p-5 sm:p-6" aria-labelledby="project-images-title">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="project-images-title" className="text-sm font-semibold text-ink">
            Screenshots
          </h2>
          <p className="mt-1 text-xs leading-5 text-muted">
            The first image is used as the project cover. Add descriptive alt text for accessibility.
          </p>
        </div>
        <input
          ref={inputRef}
          id="project-image-upload"
          type="file"
          accept={ACCEPTED_IMAGE_TYPES.join(',')}
          multiple
          className="sr-only"
          onChange={(event) => void upload(event.target.files)}
          disabled={uploading}
        />
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <LoaderCircle size={14} className="animate-spin" aria-hidden="true" />
          ) : (
            <ImagePlus size={14} aria-hidden="true" />
          )}
          {uploading ? 'Uploading…' : 'Upload images'}
        </button>
      </div>

      {error && (
        <p className="error-text" role="alert">
          {error}
        </p>
      )}

      {images.length === 0 ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="mt-4 flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line bg-bg px-6 py-12 text-center transition hover:border-accent/40"
        >
          <ImagePlus size={22} className="text-muted" aria-hidden="true" />
          <span className="text-sm font-medium text-ink">No screenshots yet</span>
          <span className="text-xs text-muted">
            PNG, JPEG, WebP or GIF up to {formatFileSize(MAX_IMAGE_BYTES)}.
          </span>
        </button>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((image, index) => (
            <ImageCard
              key={image.id}
              image={image}
              isCover={index === 0}
              canMoveUp={index > 0}
              canMoveDown={index < images.length - 1}
              busy={busy || uploading}
              onMove={(direction) => void move(index, direction)}
              onDelete={() => setDeleteTarget(image)}
              onSaveAlt={(altText) => saveAlt(image, altText)}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete image"
        message="This screenshot will be permanently removed from the project. This cannot be undone."
        confirmLabel="Delete image"
        loading={busy}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void confirmDelete()}
      />
    </section>
  );
};
