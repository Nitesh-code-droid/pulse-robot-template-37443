import React from 'react';
import { Button } from '@/components/ui/button';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'floating' | 'minimal';
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  className = '', 
  size = 'md',
  variant = 'default'
}) => {
  const { theme, setTheme } = useTheme();

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  const baseClasses = `rounded-full transition-all duration-300 ${sizeClasses[size]} ${className}`;

  const variantClasses = {
    default: 'border-border hover:bg-accent',
    floating: 'fixed top-20 right-4 z-40 border-border hover:bg-accent shadow-lg hover:shadow-xl',
    minimal: 'border-0 hover:bg-accent/50'
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className={`${baseClasses} ${variantClasses[variant]}`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? (
        <Sun className={`${iconSizes[size]} text-yellow-400 dark:text-yellow-300`} />
      ) : (
        <Moon className={`${iconSizes[size]} text-slate-600 dark:text-slate-300`} />
      )}
    </Button>
  );
};

export default ThemeToggle;


