import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, Phone, Star, MapPin, Clock, User } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Counsellor {
  id: string;
  name: string;
  specialization: string;
  affiliation: string;
  fees: number;
  experience_years: number;
  ranking_score: number;
  languages: string[];
  bio: string;
}

interface CounsellorSuggestionModalProps {
  open: boolean;
  onClose: () => void;
  message: string;
  counsellors: Counsellor[];
}

const CounsellorSuggestionModal: React.FC<CounsellorSuggestionModalProps> = ({
  open,
  onClose,
  message,
  counsellors
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            Immediate Support Available
          </DialogTitle>
          <DialogDescription className="text-left pt-2">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-800 font-medium">{message}</p>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <h4 className="font-semibold text-gray-800 mb-3">Available Crisis Counsellors:</h4>
          
          {counsellors.map((counsellor) => (
            <Card key={counsellor.id} className="border-red-200 hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="h-4 w-4 text-red-600" />
                      <h5 className="font-semibold text-gray-900">{counsellor.name}</h5>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500 fill-current" />
                        <span className="text-xs text-gray-600">{counsellor.ranking_score}</span>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-red-700 mb-1">{counsellor.specialization}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-600 mb-2">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{counsellor.affiliation}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{counsellor.experience_years} years exp</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-700 mb-2">{counsellor.bio}</p>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-gray-600">Languages:</span>
                      <span className="text-gray-800">{counsellor.languages.join(', ')}</span>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-lg font-bold text-green-600">
                      {counsellor.fees === 0 ? 'FREE' : `₹${counsellor.fees}`}
                    </div>
                    <div className="text-xs text-gray-500">
                      {counsellor.fees === 0 ? 'Emergency Session' : 'per session'}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Link to="/booking" className="flex-1">
                    <Button 
                      className="w-full bg-red-600 hover:bg-red-700 text-white text-sm"
                      onClick={onClose}
                    >
                      Book Emergency Session
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-red-300 text-red-700 hover:bg-red-50"
                  >
                    <Phone className="h-3 w-3 mr-1" />
                    Call Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
          <div className="flex items-start gap-3">
            <Phone className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-amber-800 mb-1">24/7 Crisis Helpline</h4>
              <p className="text-sm text-amber-700 mb-2">
                If you need immediate help or feel unsafe, please call:
              </p>
              <a 
                href="tel:1800-891-4416" 
                className="inline-flex items-center bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors"
              >
                📞 Tele-MANAS: 1800-891-4416
              </a>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Continue Chat
          </Button>
          <Link to="/booking">
            <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={onClose}>
              Book Counsellor Now
            </Button>
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CounsellorSuggestionModal;
