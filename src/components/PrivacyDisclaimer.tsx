import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface PrivacyDisclaimerProps {
  variant?: 'default' | 'destructive';
  className?: string;
  showIcon?: boolean;
}

const PrivacyDisclaimer: React.FC<PrivacyDisclaimerProps> = ({ 
  variant = 'default', 
  className = '',
  showIcon = true 
}) => {
  return (
    <Alert variant={variant} className={`border-amber-200 bg-amber-50 ${className}`}>
      {showIcon && <AlertTriangle className="h-4 w-4 text-amber-600" />}
      <AlertDescription className="text-amber-800 font-medium">
        <strong>Privacy Notice:</strong> Never share personal details like your full name, address, phone number, 
        financial information, or any identifying information with AI or counsellors. Keep your conversations 
        focused on general wellness topics for your safety and privacy.
      </AlertDescription>
    </Alert>
  );
};

export default PrivacyDisclaimer;
