import { ArrowLeft } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

type BackButtonProps = {
  fallbackTo?: string;
  label?: string;
  className?: string;
};

export function BackButton({ fallbackTo = '/', label = 'Back', className = '' }: BackButtonProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    // If the user loaded this page directly (no in-app history), go to a safe fallback
    if (location.key === 'default') {
      navigate(fallbackTo);
      return;
    }

    navigate(-1);
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className={`inline-flex items-center text-muted-foreground hover:text-foreground transition-colors ${className}`}
    >
      <ArrowLeft className="h-4 w-4 mr-2" />
      {label}
    </button>
  );
}
