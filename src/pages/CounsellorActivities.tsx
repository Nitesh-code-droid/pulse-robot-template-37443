import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import GlobalButtons from '@/components/GlobalButtons';
import ThemeToggle from '@/components/ThemeToggle';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  User, 
  Plus, 
  Send, 
  CheckCircle, 
  AlertCircle,
  Brain,
  Heart,
  Target,
  FileText,
  Video,
  Headphones
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

const CounsellorActivities = () => {
  const { profile } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [activityType, setActivityType] = useState('');
  const [activityTitle, setActivityTitle] = useState('');
  const [activityDescription, setActivityDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('medium');

  const students = [
    { id: 'student-1', name: 'Anonymous Student A', lastSession: '2024-01-10', issue: 'Anxiety' },
    { id: 'student-2', name: 'Anonymous Student B', lastSession: '2024-01-12', issue: 'Depression' },
    { id: 'student-3', name: 'Anonymous Student C', lastSession: '2024-01-08', issue: 'Academic Stress' }
  ];

  const [assignedActivities, setAssignedActivities] = useState([
    {
      id: 1,
      studentId: 'student-1',
      studentName: 'Anonymous Student A',
      title: 'Daily Mood Journal',
      type: 'journaling',
      description: 'Track your daily mood and identify triggers for anxiety',
      assignedDate: '2024-01-10',
      dueDate: '2024-01-17',
      status: 'in_progress',
      priority: 'high',
      progress: 60
    },
    {
      id: 2,
      studentId: 'student-2',
      studentName: 'Anonymous Student B',
      title: 'Breathing Exercise Practice',
      type: 'exercise',
      description: 'Practice 4-7-8 breathing technique twice daily for one week',
      assignedDate: '2024-01-12',
      dueDate: '2024-01-19',
      status: 'completed',
      priority: 'medium',
      progress: 100
    },
    {
      id: 3,
      studentId: 'student-1',
      studentName: 'Anonymous Student A',
      title: 'Sleep Hygiene Checklist',
      type: 'checklist',
      description: 'Follow the sleep hygiene checklist for better rest',
      assignedDate: '2024-01-08',
      dueDate: '2024-01-15',
      status: 'overdue',
      priority: 'medium',
      progress: 30
    }
  ]);

  const activityTypes = [
    { value: 'journaling', label: 'Journaling', icon: FileText, description: 'Written reflection exercises' },
    { value: 'exercise', label: 'Breathing/Mindfulness', icon: Heart, description: 'Breathing and mindfulness practices' },
    { value: 'checklist', label: 'Daily Checklist', icon: CheckCircle, description: 'Daily habit tracking' },
    { value: 'reading', label: 'Educational Reading', icon: BookOpen, description: 'Self-help articles and resources' },
    { value: 'video', label: 'Video Content', icon: Video, description: 'Educational videos and tutorials' },
    { value: 'audio', label: 'Audio Content', icon: Headphones, description: 'Podcasts and guided meditations' },
    { value: 'goal', label: 'Goal Setting', icon: Target, description: 'Personal development goals' }
  ];

  const handleAssignActivity = () => {
    if (!selectedStudent || !activityType || !activityTitle || !activityDescription) {
      toast.error('Please fill in all required fields');
      return;
    }

    const student = students.find(s => s.id === selectedStudent);
    const newActivity = {
      id: assignedActivities.length + 1,
      studentId: selectedStudent,
      studentName: student?.name || 'Unknown Student',
      title: activityTitle,
      type: activityType,
      description: activityDescription,
      assignedDate: new Date().toISOString().split('T')[0],
      dueDate: dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'assigned',
      priority: priority,
      progress: 0
    };

    setAssignedActivities(prev => [newActivity, ...prev]);
    
    // Reset form
    setSelectedStudent('');
    setActivityType('');
    setActivityTitle('');
    setActivityDescription('');
    setDueDate('');
    setPriority('medium');

    toast.success('Activity assigned successfully! Student will be notified.');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'in_progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'assigned': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'overdue': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getTypeIcon = (type: string) => {
    const typeObj = activityTypes.find(t => t.value === type);
    return typeObj ? typeObj.icon : FileText;
  };

  const stats = [
    { label: 'Total Assigned', value: assignedActivities.length, icon: BookOpen, color: 'text-blue-600' },
    { label: 'In Progress', value: assignedActivities.filter(a => a.status === 'in_progress').length, icon: Clock, color: 'text-yellow-600' },
    { label: 'Completed', value: assignedActivities.filter(a => a.status === 'completed').length, icon: CheckCircle, color: 'text-green-600' },
    { label: 'Overdue', value: assignedActivities.filter(a => a.status === 'overdue').length, icon: AlertCircle, color: 'text-red-600' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <GlobalButtons
        sidebarOpen={sidebarOpen}
        onMenuClick={() => setSidebarOpen(true)}
      />
      
      <ThemeToggle variant="floating" />
      
      <main className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl lg:text-5xl font-display font-bold text-foreground mb-4">
              Activity Assignment 📚
            </h1>
            <p className="text-xl text-muted-foreground">
              Assign therapeutic activities and track student progress.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <Card key={index} className="wellness-card">
                <CardContent className="p-6 text-center">
                  <stat.icon className={`h-8 w-8 mx-auto mb-2 ${stat.color}`} />
                  <div className="text-2xl font-bold text-foreground mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Assignment Form */}
          <Card className="wellness-card mb-8 bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center text-foreground">
                <Plus className="h-5 w-5 mr-2" />
                Assign New Activity
              </CardTitle>
              <CardDescription>
                Create and assign therapeutic activities to help students with their mental health journey.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Select Student *
                  </label>
                  <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a student" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4" />
                            <div>
                              <div>{student.name}</div>
                              <div className="text-xs text-muted-foreground">
                                Last session: {student.lastSession} • {student.issue}
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Activity Type *
                  </label>
                  <Select value={activityType} onValueChange={setActivityType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose activity type" />
                    </SelectTrigger>
                    <SelectContent>
                      {activityTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center space-x-2">
                            <type.icon className="h-4 w-4" />
                            <div>
                              <div>{type.label}</div>
                              <div className="text-xs text-muted-foreground">{type.description}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Activity Title *
                </label>
                <Input
                  value={activityTitle}
                  onChange={(e) => setActivityTitle(e.target.value)}
                  placeholder="e.g., Daily Gratitude Journal"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Activity Description *
                </label>
                <Textarea
                  value={activityDescription}
                  onChange={(e) => setActivityDescription(e.target.value)}
                  placeholder="Provide detailed instructions for the student..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Due Date
                  </label>
                  <Input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Priority
                  </label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low Priority</SelectItem>
                      <SelectItem value="medium">Medium Priority</SelectItem>
                      <SelectItem value="high">High Priority</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={handleAssignActivity} className="w-full gradient-button">
                <Send className="mr-2 h-4 w-4" />
                Assign Activity
              </Button>
            </CardContent>
          </Card>

          {/* Assigned Activities */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">Assigned Activities</h2>
            {assignedActivities.map((activity) => {
              const TypeIcon = getTypeIcon(activity.type);
              return (
                <Card key={activity.id} className="wellness-card hover-lift">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <CardTitle className="flex items-center space-x-2 text-foreground">
                            <TypeIcon className="h-5 w-5" />
                            <span>{activity.title}</span>
                          </CardTitle>
                          <Badge className={getStatusColor(activity.status)}>
                            {activity.status.replace('_', ' ')}
                          </Badge>
                          <Badge className={getPriorityColor(activity.priority)}>
                            {activity.priority} priority
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                          <div><strong>Student:</strong> {activity.studentName}</div>
                          <div><strong>Assigned:</strong> {activity.assignedDate}</div>
                          <div><strong>Due:</strong> {activity.dueDate}</div>
                          <div><strong>Progress:</strong> {activity.progress}%</div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <h4 className="font-medium text-foreground mb-2">Activity Description:</h4>
                      <p className="text-muted-foreground bg-accent/30 p-3 rounded-lg">{activity.description}</p>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-foreground">Progress</span>
                        <span className="text-sm text-muted-foreground">{activity.progress}%</span>
                      </div>
                      <div className="w-full bg-border rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            activity.status === 'completed' ? 'bg-green-500' :
                            activity.status === 'overdue' ? 'bg-red-500' :
                            'bg-primary'
                          }`}
                          style={{ width: `${activity.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-3">
                      <Button variant="outline" size="sm">
                        <User className="mr-2 h-4 w-4" />
                        View Student Profile
                      </Button>
                      <Button variant="outline" size="sm">
                        <Send className="mr-2 h-4 w-4" />
                        Send Reminder
                      </Button>
                      {activity.status === 'completed' && (
                        <Button variant="outline" size="sm">
                          <CheckCircle className="mr-2 h-4 w-4" />
                          View Submission
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CounsellorActivities;
