import React from 'react';
import { Button } from '@/components/ui/button';
import { Menu, Home } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'react-router-dom';

interface GlobalButtonsProps {
  sidebarOpen: boolean;
  onMenuClick: () => void;
}

const GlobalButtons: React.FC<GlobalButtonsProps> = ({ sidebarOpen, onMenuClick }) => {
  const { profile } = useAuth();
  const location = useLocation();
  
  // Don't show buttons on landing page
  if (location.pathname === '/') {
    return null;
  }

  const isStudent = profile?.role === 'student';

  const handleHomeClick = () => {
    const homePath = isStudent ? '/dashboard' : '/counsellor-dashboard';
    window.location.href = homePath;
  };

  return (
    <>
      {!sidebarOpen && (
        <div className="fixed top-4 left-4 z-50 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onMenuClick}
            className="bg-background border-border text-foreground shadow-md hover:bg-accent hover:text-accent-foreground"
          >
            <Menu className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleHomeClick}
            className="bg-background border-border text-foreground shadow-md hover:bg-accent hover:text-accent-foreground"
          >
            <Home className="h-4 w-4" />
          </Button>
        </div>
      )}
    </>
  );
};

export default GlobalButtons;
