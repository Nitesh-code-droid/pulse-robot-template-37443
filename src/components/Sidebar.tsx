import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Menu, 
  X, 
  User, 
  Bell, 
  Users, 
  Settings, 
  Heart,
  Brain,
  Calendar,
  MessageCircle,
  BookOpen,
  Activity,
  Clock,
  Star,
  TrendingUp
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

interface SuggestedCounsellor {
  id: string;
  name: string;
  specialization: string;
  rating: number;
  fees: number;
}

interface StudentRequest {
  id: string;
  student_name: string;
  issue_type: string;
  appointment_date: string;
  status: string;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [suggestedCounsellors, setSuggestedCounsellors] = useState<SuggestedCounsellor[]>([]);
  const [studentRequests, setStudentRequests] = useState<StudentRequest[]>([]);
  const [notificationCount, setNotificationCount] = useState(0);

  const isStudent = profile?.role === 'student';
  const isCounsellor = profile?.role === 'counsellor';

  useEffect(() => {
    if (isStudent) {
      fetchSuggestedCounsellors();
    } else if (isCounsellor) {
      fetchStudentRequests();
    }
  }, [isStudent, isCounsellor]);

  const fetchSuggestedCounsellors = async () => {
    try {
      console.log('Sidebar: Fetching suggested counsellors for student:', profile?.id);
      
      // Get latest questionnaire response for suggestions
      const { data: responses, error: responseError } = await (supabase as any)
        .from('questionnaire_responses')
        .select('answers')
        .eq('student_id', profile?.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (responseError) {
        console.error('Sidebar: Error fetching questionnaire responses:', responseError);
      }

      if (responses && responses.length > 0) {
        // Fetch counsellors from profiles table where role is 'counsellor'
        const { data: counsellorData, error: counsellorError } = await (supabase as any)
          .from('profiles')
          .select('*')
          .eq('role', 'counsellor')
          .limit(3);

        if (counsellorError) {
          console.error('Sidebar: Error fetching counsellors:', counsellorError);
        }

        if (counsellorData && counsellorData.length > 0) {
          const suggested = counsellorData.map((c: any) => ({
            id: c.user_id,
            name: c.full_name || 'Dr. ' + c.email.split('@')[0],
            specialization: c.bio || 'Mental Health Specialist',
            rating: 4.5, // Mock rating
            fees: 500 // Default fee
          }));
          setSuggestedCounsellors(suggested);
        } else {
          // Fallback: create some mock counsellors if none exist
          const mockCounsellors = [
            {
              id: 'mock-1',
              name: 'Dr. Sarah Johnson',
              specialization: 'Anxiety & Stress Management',
              rating: 4.8,
              fees: 500
            },
            {
              id: 'mock-2',
              name: 'Dr. Rajesh Kumar',
              specialization: 'Depression & Mood Disorders',
              rating: 4.9,
              fees: 600
            },
            {
              id: 'mock-3',
              name: 'Dr. Priya Sharma',
              specialization: 'Relationship Counseling',
              rating: 4.7,
              fees: 550
            }
          ];
          setSuggestedCounsellors(mockCounsellors);
        }
      } else {
        console.log('Sidebar: No questionnaire responses found');
        // Show mock counsellors even without questionnaire
        const mockCounsellors = [
          {
            id: 'mock-1',
            name: 'Dr. Sarah Johnson',
            specialization: 'Anxiety & Stress Management',
            rating: 4.8,
            fees: 500
          },
          {
            id: 'mock-2',
            name: 'Dr. Rajesh Kumar',
            specialization: 'Depression & Mood Disorders',
            rating: 4.9,
            fees: 600
          }
        ];
        setSuggestedCounsellors(mockCounsellors);
      }
    } catch (error) {
      console.error('Sidebar: Error fetching suggested counsellors:', error);
      // Show mock counsellors on error
      const mockCounsellors = [
        {
          id: 'mock-1',
          name: 'Dr. Sarah Johnson',
          specialization: 'Anxiety & Stress Management',
          rating: 4.8,
          fees: 500
        }
      ];
      setSuggestedCounsellors(mockCounsellors);
    }
  };

  const fetchStudentRequests = async () => {
    try {
      const { data: requests } = await (supabase as any)
        .from('bookings')
        .select(`
          id,
          issue_type,
          appointment_date,
          status,
          student_id,
          profiles!inner(full_name)
        `)
        .eq('counsellor_id', profile?.id)
        .in('status', ['pending', 'accepted'])
        .order('created_at', { ascending: false })
        .limit(10);

      if (requests) {
        const formatted = requests.map((r: any) => ({
          id: r.id,
          student_name: r.profiles.full_name,
          issue_type: r.issue_type,
          appointment_date: r.appointment_date,
          status: r.status
        }));
        setStudentRequests(formatted);
        setNotificationCount(requests.filter((r: any) => r.status === 'pending').length);
      }
    } catch (error) {
      console.error('Error fetching student requests:', error);
    }
  };

  const studentMenuItems = [
    { icon: Brain, label: 'AI First-Aid', path: '/chat' },
    { icon: BookOpen, label: 'Wellness Hub', path: '/resources' },
    { icon: Calendar, label: 'Book Counsellor', path: '/booking' },
    { icon: Users, label: 'Peer Support', path: '/forum' },
  ];

  const counsellorMenuItems = [
    { icon: Calendar, label: 'Bookings', path: '/counsellor-bookings' },
    { icon: Clock, label: 'Availability', path: '/availability' },
  ];

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center space-x-2">
              <Heart className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">MindBridge</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* User Info */}
          <div className="p-4 border-b bg-primary/5">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-medium">{profile?.full_name}</p>
                <p className="text-sm text-muted-foreground capitalize">{profile?.role}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto p-4">
            <nav className="space-y-2">
              {isStudent && studentMenuItems.map((item, index) => (
                <Link
                  key={index}
                  to={item.path}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-primary/10 transition-colors"
                  onClick={onToggle}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              ))}

              {isCounsellor && counsellorMenuItems.map((item, index) => (
                <Link
                  key={index}
                  to={item.path}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-primary/10 transition-colors"
                  onClick={onToggle}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              ))}

              {/* Suggested Counsellors - Only for students */}
              {isStudent && (
                <button
                  onClick={() => {
                    navigate('/suggested-counsellors');
                    onToggle();
                  }}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-primary/10 transition-colors"
                >
                  <Users className="h-5 w-5" />
                  <span>Suggested Counsellors</span>
                </button>
              )}

              {/* Profile Settings - Only for counsellors */}
              {!isStudent && (
                <button
                  onClick={() => {
                    navigate('/profile');
                    onToggle();
                  }}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-primary/10 transition-colors"
                >
                  <Settings className="h-5 w-5" />
                  <span>Profile Settings</span>
                </button>
              )}
            </nav>

            {/* Student: Suggested Counsellors */}
            {isStudent && suggestedCounsellors.length > 0 && (
              <div className="mt-6">
                <h3 className="font-medium text-sm text-muted-foreground mb-3">Suggested Counsellors</h3>
                <div className="space-y-2">
                  {suggestedCounsellors.slice(0, 3).map((counsellor) => (
                    <Card key={counsellor.id} className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{counsellor.name}</p>
                          <p className="text-xs text-muted-foreground">{counsellor.specialization}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs">{counsellor.rating}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">₹{counsellor.fees}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Counsellor: Student Requests */}
            {isCounsellor && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-sm text-muted-foreground">Student Requests</h3>
                  {notificationCount > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {notificationCount}
                    </Badge>
                  )}
                </div>
                <div className="space-y-2">
                  {studentRequests.slice(0, 3).map((request) => (
                    <Card key={request.id} className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{request.student_name}</p>
                          <p className="text-xs text-muted-foreground">{request.issue_type}</p>
                        </div>
                        <Badge 
                          variant={request.status === 'pending' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {request.status}
                        </Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
