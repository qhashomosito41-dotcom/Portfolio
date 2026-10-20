import { useEffect, useRef, useState } from 'react';
import {
  Download,
  Eye,
  FileText,
  LoaderCircle,
  Save,
  ShieldCheck,
  Trash2,
  Upload,
} from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useToast } from '../../contexts/ToastContext';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { CheckboxField, Field } from '../../components/admin/Field';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { ErrorState, LoadingState } from '../../components/States';
import { MAX_CV_BYTES } from '../../utils/constants';
import { formatDateTime, formatFileSize, formatFullDate } from '../../utils/dates';

export const CvPage = () => {
  const query = useApiQuery(() => adminApi.getCv(), []);
  const { pushToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('Curriculum Vitae');
  const [isPublic, setIsPublic] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [metaTitle, setMetaTitle] = useState('');
  const [metaPublic, setMetaPublic] = useState(false);
  const [savingMeta, setSavingMeta] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const cv = query.data;

  useEffect(() => {
    if (cv) {
      setMetaTitle(cv.title);
      setMetaPublic(cv.isPublic);
      setTitle((current) => (current === 'Curriculum Vitae' ? cv.title : current));
      setIsPublic(cv.isPublic);
    }
  }, [cv]);

  const handleFile = (next: File | undefined) => {
    setUploadError(null);
    if (!next) {
      setFile(null);
      return;
    }
    if (next.type !== 'application/pdf' && !next.name.toLowerCase().endsWith('.pdf')) {
      setUploadError('Choose a PDF file.');
      setFile(null);
      return;
    }
    if (next.size > MAX_CV_BYTES) {
      setUploadError(`The file must be smaller than ${formatFileSize(MAX_CV_BYTES)}.`);
      setFile(null);
      return;
    }
    setFile(next);
  };

  const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setUploadError(null);
    if (!file) {
      setUploadError('Select a PDF file to upload.');
      return;
    }
    if (title.trim().length < 2) {
      setUploadError('Enter a title for the CV.');
      return;
    }
    setUploading(true);
    try {
      const uploaded = await adminApi.uploadCv(file, title.trim(), isPublic);
      query.setData(uploaded);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      pushToast('CV uploaded successfully.');
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'The CV could not be uploaded.');
    } finally {
      setUploading(false);
    }
  };

  const saveMeta = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!cv) return;
    if (metaTitle.trim().length < 2) {
      pushToast('The CV title must be at least 2 characters.', 'error');
      return;
    }
    setSavingMeta(true);
    try {
      const updated = await adminApi.updateCv(cv.id, metaTitle.trim(), metaPublic);
      query.setData(updated);
      pushToast('CV settings saved.');
    } catch (error) {
      pushToast(
        error instanceof Error ? error.message : 'CV settings could not be saved.',
        'error',
      );
    } finally {
      setSavingMeta(false);
    }
  };

  const handleDelete = async () => {
    if (!cv) return;
    setDeleting(true);
    try {
      await adminApi.deleteCv(cv.id);
      query.setData(null);
      setDeleteOpen(false);
      setFile(null);
      pushToast('CV deleted.', 'info');
    } catch (error) {
      pushToast(error instanceof Error ? error.message : 'The CV could not be deleted.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <AdminPageHeader
        eyebrow="Content"
        title="Curriculum vitae"
        description="Upload a current PDF CV. Only one document is active at a time, and new uploads replace the previous file."
      />

      {query.loading && !query.data ? (
        <LoadingState label="Loading CV…" />
      ) : query.error ? (
        <ErrorState message="The CV could not be loaded." onRetry={query.refetch} />
      ) : (
        <div className="grid gap-5 lg:grid-cols-[1fr_20rem] lg:items-start">
          <div className="space-y-5">
            {cv ? (
              <section className="card p-5 sm:p-6" aria-labelledby="current-cv-title">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 id="current-cv-title" className="text-sm font-semibold text-ink">
                      Current CV
                    </h2>
                    <p className="mt-0.5 text-xs text-muted">Active document served to visitors.</p>
                  </div>
                  <span
                    className={`badge ${cv.isPublic ? 'badge-accent' : 'border-warning/30 text-warning'}`}
                  >
                    {cv.isPublic ? (
                      <>
                        <ShieldCheck size={12} aria-hidden="true" />
                        Public
                      </>
                    ) : (
                      'Private'
                    )}
                  </span>
                </div>

                <div className="mt-5 flex flex-col gap-4 rounded-xl border border-line bg-bg p-4 sm:flex-row sm:items-center">
                  <div className="inline-flex size-14 shrink-0 items-center justify-center rounded-xl bg-danger/10 text-danger">
                    <FileText size={24} aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">{cv.originalName}</p>
                    <p className="mt-1 text-xs text-muted">
                      {formatFileSize(cv.fileSize)} · uploaded {formatFullDate(cv.uploadedAt)}
                    </p>
                    <p className="mt-0.5 text-[0.68rem] text-muted">
                      Last activity {formatDateTime(cv.uploadedAt)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={cv.previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary btn-sm"
                    >
                      <Eye size={14} aria-hidden="true" />
                      Preview
                    </a>
                    <a href={cv.downloadUrl} className="btn btn-secondary btn-sm">
                      <Download size={14} aria-hidden="true" />
                      Download
                    </a>
                  </div>
                </div>

                <form onSubmit={saveMeta} className="mt-5 space-y-4">
                  <Field label="CV title" htmlFor="cv-meta-title" required>
                    <input
                      id="cv-meta-title"
                      className="input"
                      value={metaTitle}
                      onChange={(event) => setMetaTitle(event.target.value)}
                      maxLength={180}
                    />
                  </Field>
                  <CheckboxField
                    id="cv-meta-public"
                    label="Make the CV publicly downloadable"
                    description="When disabled, the download button is hidden on the public portfolio."
                    checked={metaPublic}
                    onChange={(event) => setMetaPublic(event.target.checked)}
                  />
                  <div className="flex justify-end">
                    <button type="submit" className="btn btn-primary btn-sm" disabled={savingMeta}>
                      {savingMeta ? (
                        <LoaderCircle size={14} className="animate-spin" aria-hidden="true" />
                      ) : (
                        <Save size={14} aria-hidden="true" />
                      )}
                      Save CV settings
                    </button>
                  </div>
                </form>
              </section>
            ) : (
              <div className="card border-dashed p-8 text-center">
                <FileText size={26} className="mx-auto text-muted" aria-hidden="true" />
                <h2 className="mt-3 text-sm font-semibold text-ink">No CV uploaded</h2>
                <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-muted">
                  Upload a PDF CV below. Visitors will not see a download option until a CV is
                  uploaded and marked public.
                </p>
              </div>
            )}

            <section className="card p-5 sm:p-6" aria-labelledby="upload-cv-title">
              <h2 id="upload-cv-title" className="text-sm font-semibold text-ink">
                {cv ? 'Replace the CV' : 'Upload a CV'}
              </h2>
              <p className="mt-1 text-xs leading-5 text-muted">
                Upload a PDF up to {formatFileSize(MAX_CV_BYTES)}. Replacing the CV permanently
                deletes the previous file.
              </p>

              <form onSubmit={handleUpload} className="mt-4 space-y-4" noValidate>
                <div>
                  <label htmlFor="cv-file" className="label">
                    PDF file
                  </label>
                  <input
                    ref={fileInputRef}
                    id="cv-file"
                    type="file"
                    accept="application/pdf,.pdf"
                    onChange={(event) => handleFile(event.target.files?.[0])}
                    className="block w-full cursor-pointer rounded-xl border border-dashed border-line bg-bg px-4 py-6 text-sm text-muted file:mr-4 file:cursor-pointer file:rounded-lg file:border-0 file:bg-accent-soft file:px-3 file:py-2 file:text-xs file:font-semibold file:text-accent hover:border-accent/40"
                    disabled={uploading}
                  />
                  {file && (
                    <p className="mt-2 text-xs text-success">
                      Selected: {file.name} ({formatFileSize(file.size)})
                    </p>
                  )}
                </div>
                <Field label="Title" htmlFor="cv-title" required>
                  <input
                    id="cv-title"
                    className="input"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    maxLength={180}
                    disabled={uploading}
                  />
                </Field>
                <CheckboxField
                  id="cv-public"
                  label="Publish this CV immediately"
                  description="You can change this later without re-uploading."
                  checked={isPublic}
                  onChange={(event) => setIsPublic(event.target.checked)}
                  disabled={uploading}
                />
                {uploadError && (
                  <p className="error-text" role="alert">
                    {uploadError}
                  </p>
                )}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    disabled={uploading || !file}
                  >
                    {uploading ? (
                      <LoaderCircle size={14} className="animate-spin" aria-hidden="true" />
                    ) : (
                      <Upload size={14} aria-hidden="true" />
                    )}
                    {uploading ? 'Uploading…' : cv ? 'Replace CV' : 'Upload CV'}
                  </button>
                </div>
              </form>
            </section>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24">
            <section className="card p-5">
              <h2 className="text-sm font-semibold text-ink">Privacy</h2>
              <ul className="mt-3 space-y-2.5 text-xs leading-5 text-muted">
                <li>PDF files are validated and stored outside the public web root.</li>
                <li>Downloads are only available when the CV is marked public.</li>
                <li>Replacing or deleting a CV removes the previous file from storage.</li>
              </ul>
            </section>
            {cv && (
              <section className="card p-5">
                <h2 className="text-sm font-semibold text-ink">Danger zone</h2>
                <p className="mt-2 text-xs leading-5 text-muted">
                  Deleting the CV removes it from the portfolio and cannot be undone.
                </p>
                <button
                  type="button"
                  className="btn btn-danger btn-sm mt-3 w-full"
                  onClick={() => setDeleteOpen(true)}
                >
                  <Trash2 size={14} aria-hidden="true" />
                  Delete CV
                </button>
              </section>
            )}
          </aside>
        </div>
      )}

      <ConfirmDialog
        open={deleteOpen}
        title="Delete CV"
        message={`Permanently delete “${cv?.title ?? 'this CV'}”? Visitors will no longer be able to download it.`}
        confirmLabel="Delete CV"
        loading={deleting}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={() => void handleDelete()}
      />
    </>
  );
};
