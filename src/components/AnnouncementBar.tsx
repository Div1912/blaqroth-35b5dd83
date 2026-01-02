import { Link } from 'react-router-dom';
import { useAnnouncements } from '@/hooks/useAnnouncements';

export function AnnouncementBar() {
  const { data: announcement, isLoading } = useAnnouncements();

  // Don't render if no active announcement
  if (isLoading || !announcement) {
    return null;
  }

  return (
    <div className="bg-foreground text-background text-xs tracking-[0.15em] uppercase py-2.5 text-center">
      <div className="container-editorial px-4">
        <span>{announcement.message}</span>
        {announcement.link && announcement.link_text && (
          <>
            {' '}
            <Link 
              to={announcement.link} 
              className="underline hover:no-underline font-medium"
            >
              {announcement.link_text}
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
