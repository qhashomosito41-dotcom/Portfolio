import { Download, FileText } from 'lucide-react';
import type { CvInfo } from '../types';
import { cn } from '../utils/cn';

export const CvDownloadButton = ({
  cv,
  variant = 'primary',
  className,
  label = 'Download CV',
}: {
  cv: CvInfo | null;
  variant?: 'primary' | 'secondary';
  className?: string;
  label?: string;
}) => {
  if (cv) {
    return (
      <a
        href={cv.downloadUrl}
        className={cn(
          'whitespace-nowrap',
          variant === 'primary' ? 'btn btn-primary' : 'btn btn-secondary',
          className,
        )}
        download
      >
        <Download size={16} aria-hidden="true" />
        {label}
      </a>
    );
  }

  return (
    <a
      href="/#contact"
      className={cn('btn btn-secondary whitespace-nowrap', className)}
      title="A CV has not been published yet. Use the contact section to request it."
    >
      <FileText size={16} aria-hidden="true" />
      CV on request
    </a>
  );
};
