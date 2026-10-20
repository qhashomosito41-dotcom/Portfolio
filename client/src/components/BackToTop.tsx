import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { cn } from '../utils/cn';

export const BackToTop = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 700);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={cn(
        'fixed bottom-5 right-5 z-40 inline-flex size-11 items-center justify-center rounded-full border border-line bg-surface text-ink shadow-lift transition duration-300 hover:border-accent/50 hover:text-accent',
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0',
      )}
      aria-label="Back to top"
      title="Back to top"
    >
      <ArrowUp size={18} aria-hidden="true" />
    </button>
  );
};
