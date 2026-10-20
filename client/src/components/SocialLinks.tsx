import {
  Github,
  Globe,
  Instagram,
  Linkedin,
  Twitter,
  Youtube,
  type LucideIcon,
} from 'lucide-react';
import type { SocialLink } from '../types';
import { cn } from '../utils/cn';

const icons: Record<string, LucideIcon> = {
  GitHub: Github,
  LinkedIn: Linkedin,
  X: Twitter,
  Instagram: Instagram,
  YouTube: Youtube,
  Website: Globe,
};

const socialIcon = (platform: string): LucideIcon => icons[platform] ?? Globe;

export const SocialLinks = ({
  links,
  className,
  compact = false,
}: {
  links: SocialLink[];
  className?: string;
  compact?: boolean;
}) => {
  if (links.length === 0) return null;

  return (
    <ul className={cn('flex flex-wrap items-center gap-2', className)}>
      {links.map((link) => {
        const Icon = socialIcon(link.platform);
        return (
          <li key={link.id}>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2 text-sm text-muted transition hover:border-accent/40 hover:text-ink',
              )}
              aria-label={`${link.label} (opens in a new tab)`}
            >
              <Icon size={16} aria-hidden="true" />
              {!compact && <span>{link.label}</span>}
            </a>
          </li>
        );
      })}
    </ul>
  );
};
