import { cn } from '../utils/cn';

type ProfileAvatarProps = {
  name: string;
  imageUrl?: string | null;
  initials?: string;
  className?: string;
  imageClassName?: string;
};

export const ProfileAvatar = ({
  name,
  imageUrl,
  initials,
  className,
  imageClassName,
}: ProfileAvatarProps) => {
  const fallback =
    initials ||
    name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('');

  return (
    <div
      className={cn(
        'relative flex items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_30%_20%,hsl(var(--accent)/0.28),transparent_55%),linear-gradient(145deg,hsl(var(--surface-2)),hsl(var(--surface)))]',
        className,
      )}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={`Portrait of ${name}`}
          className={cn('size-full object-cover', imageClassName)}
          loading="lazy"
          decoding="async"
        />
      ) : (
        <span
          className="select-none font-mono text-5xl font-semibold tracking-tight text-accent sm:text-6xl"
          aria-hidden="true"
        >
          {fallback}
        </span>
      )}
      {!imageUrl && <span className="sr-only">{name}</span>}
    </div>
  );
};
