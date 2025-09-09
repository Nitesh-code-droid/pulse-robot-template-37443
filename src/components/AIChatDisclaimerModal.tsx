import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertTriangle, Shield, Eye } from 'lucide-react';

interface AIChatDisclaimerModalProps {
  open: boolean;
  onAccept: () => void;
}

const AIChatDisclaimerModal: React.FC<AIChatDisclaimerModalProps> = ({ open, onAccept }) => {
  const [hasAccepted, setHasAccepted] = useState(false);

  const handleAccept = () => {
    if (hasAccepted) {
      // Store acceptance in localStorage to avoid showing again for this session
      localStorage.setItem('ai_chat_disclaimer_accepted', 'true');
      onAccept();
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-700">
            <AlertTriangle className="h-5 w-5" />
            Privacy & Safety Notice
          </DialogTitle>
          <DialogDescription className="text-left space-y-4 pt-2">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-red-800 mb-2">NEVER Share Personal Information</h4>
                  <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
                    <li>Full name, address, or contact details</li>
                    <li>Financial information or account numbers</li>
                    <li>Student ID or other identifying information</li>
                    <li>Specific locations or personal schedules</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Eye className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-amber-800 mb-2">Keep Conversations General</h4>
                  <p className="text-sm text-amber-700">
                    Focus on general wellness topics, feelings, and coping strategies. 
                    This AI is designed to provide support, not collect personal data.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              <p>
                <strong>Remember:</strong> This applies to both AI conversations and counsellor sessions. 
                Your safety and privacy are our top priority.
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex items-center space-x-2 py-4">
          <Checkbox 
            id="accept-disclaimer" 
            checked={hasAccepted}
            onCheckedChange={(checked) => setHasAccepted(checked === true)}
          />
          <label 
            htmlFor="accept-disclaimer" 
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            I understand and agree to keep my personal information private
          </label>
        </div>

        <DialogFooter>
          <Button 
            onClick={handleAccept} 
            disabled={!hasAccepted}
            className="w-full"
          >
            Continue to AI Chat
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AIChatDisclaimerModal;
