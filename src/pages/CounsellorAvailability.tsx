import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import GlobalButtons from '@/components/GlobalButtons';
import ThemeToggle from '@/components/ThemeToggle';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, Save, Plus, Trash2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const CounsellorAvailability = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const [weeklySchedule, setWeeklySchedule] = useState({
    Monday: [
      { id: 1, time: "9:00 AM - 10:00 AM", available: true, booked: false },
      { id: 2, time: "10:00 AM - 11:00 AM", available: false, booked: false },
      { id: 3, time: "11:00 AM - 12:00 PM", available: true, booked: true },
      { id: 4, time: "2:00 PM - 3:00 PM", available: true, booked: false },
      { id: 5, time: "3:00 PM - 4:00 PM", available: false, booked: false },
      { id: 6, time: "4:00 PM - 5:00 PM", available: true, booked: false }
    ],
    Tuesday: [
      { id: 7, time: "9:00 AM - 10:00 AM", available: true, booked: false },
      { id: 8, time: "10:00 AM - 11:00 AM", available: true, booked: false },
      { id: 9, time: "2:00 PM - 3:00 PM", available: true, booked: false },
      { id: 10, time: "3:00 PM - 4:00 PM", available: true, booked: false }
    ],
    Wednesday: [
      { id: 11, time: "9:00 AM - 10:00 AM", available: false, booked: false },
      { id: 12, time: "11:00 AM - 12:00 PM", available: true, booked: false },
      { id: 13, time: "2:00 PM - 3:00 PM", available: true, booked: true },
      { id: 14, time: "4:00 PM - 5:00 PM", available: true, booked: false }
    ],
    Thursday: [
      { id: 15, time: "10:00 AM - 11:00 AM", available: true, booked: false },
      { id: 16, time: "2:00 PM - 3:00 PM", available: true, booked: false },
      { id: 17, time: "3:00 PM - 4:00 PM", available: true, booked: false }
    ],
    Friday: [
      { id: 18, time: "9:00 AM - 10:00 AM", available: true, booked: false },
      { id: 19, time: "10:00 AM - 11:00 AM", available: true, booked: false },
      { id: 20, time: "2:00 PM - 3:00 PM", available: false, booked: false }
    ],
    Saturday: [],
    Sunday: []
  });

  const commonTimeSlots = [
    "9:00 AM - 10:00 AM",
    "10:00 AM - 11:00 AM", 
    "11:00 AM - 12:00 PM",
    "12:00 PM - 1:00 PM",
    "1:00 PM - 2:00 PM",
    "2:00 PM - 3:00 PM",
    "3:00 PM - 4:00 PM",
    "4:00 PM - 5:00 PM",
    "5:00 PM - 6:00 PM",
    "6:00 PM - 7:00 PM",
    "7:00 PM - 8:00 PM",
    "8:00 PM - 9:00 PM"
  ];

  const toggleSlotAvailability = (day: string, slotId: number) => {
    setWeeklySchedule(prev => ({
      ...prev,
      [day]: prev[day].map(slot => 
        slot.id === slotId && !slot.booked
          ? { ...slot, available: !slot.available }
          : slot
      )
    }));
    setHasUnsavedChanges(true);
  };

  const addTimeSlot = (day: string, timeSlot: string) => {
    const newId = Math.max(...Object.values(weeklySchedule).flat().map(s => s.id)) + 1;
    setWeeklySchedule(prev => ({
      ...prev,
      [day]: [...prev[day], {
        id: newId,
        time: timeSlot,
        available: true,
        booked: false
      }]
    }));
    setHasUnsavedChanges(true);
  };

  const removeTimeSlot = (day: string, slotId: number) => {
    setWeeklySchedule(prev => ({
      ...prev,
      [day]: prev[day].filter(slot => slot.id !== slotId)
    }));
    setHasUnsavedChanges(true);
  };

  const saveSchedule = () => {
    // In real app, this would sync with database
    setHasUnsavedChanges(false);
    toast.success('Schedule saved successfully! Students can now see your updated availability.');
  };

  const getTotalAvailableSlots = () => {
    return Object.values(weeklySchedule)
      .flat()
      .filter(slot => slot.available && !slot.booked).length;
  };

  const getTotalBookedSlots = () => {
    return Object.values(weeklySchedule)
      .flat()
      .filter(slot => slot.booked).length;
  };

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
          <div className="text-center mb-8">
            <h1 className="text-3xl lg:text-5xl font-display font-bold text-foreground mb-4">
              Set Availability 📅
            </h1>
            <p className="text-xl text-muted-foreground">
              Configure your weekly schedule. Students will see these time slots when booking appointments.
            </p>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="wellness-card">
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">{getTotalAvailableSlots()}</div>
                <div className="text-sm text-muted-foreground">Available Slots</div>
              </CardContent>
            </Card>
            <Card className="wellness-card">
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">{getTotalBookedSlots()}</div>
                <div className="text-sm text-muted-foreground">Booked Sessions</div>
              </CardContent>
            </Card>
            <Card className="wellness-card">
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-purple-600 mb-1">{daysOfWeek.filter(day => weeklySchedule[day].length > 0).length}</div>
                <div className="text-sm text-muted-foreground">Active Days</div>
              </CardContent>
            </Card>
          </div>

          {hasUnsavedChanges && (
            <Card className="wellness-card mb-6 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-yellow-600" />
                    <span className="text-yellow-800 dark:text-yellow-200 font-medium">
                      You have unsaved changes to your schedule
                    </span>
                  </div>
                  <Button onClick={saveSchedule} className="gradient-button">
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Day Selection */}
          <Card className="wellness-card mb-6">
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-2">
                {daysOfWeek.map((day) => (
                  <Button
                    key={day}
                    variant={selectedDay === day ? "default" : "outline"}
                    onClick={() => setSelectedDay(day)}
                    className={selectedDay === day ? "gradient-button" : ""}
                  >
                    {day}
                    {weeklySchedule[day].length > 0 && (
                      <Badge className="ml-2 bg-primary/20 text-primary">
                        {weeklySchedule[day].filter(s => s.available).length}
                      </Badge>
                    )}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Schedule for Selected Day */}
          <Card className="wellness-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>{selectedDay} Schedule</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="relative group">


                  <select 
  className="appearance-none px-4 py-2 pr-8 text-sm border-0 rounded-xl 
             bg-gradient-to-r from-primary via-mindbridge-500 to-healing-500 
             text-white font-semibold shadow-lg 
             hover:shadow-2xl hover:scale-105 hover:rotate-1 
             focus:outline-none focus:ring-4 focus:ring-primary/30 
             transition-all duration-300 cursor-pointer backdrop-blur-sm"
  onChange={(e) => {
    if (e.target.value) {
      addTimeSlot(selectedDay, e.target.value);
      e.target.value = '';
    }
  }}
>
  {/* Default placeholder option */}
  <option 
    value="" 
    className="text-gray-800 dark:text-white bg-white dark:bg-gray-800 font-medium"
  >
    ✨ Add Time Slot
  </option>

  {/* Dynamic options */}
  {commonTimeSlots
    .filter(slot => !weeklySchedule[selectedDay].some(s => s.time === slot))
    .map(slot => (
      <option 
        key={slot} 
        value={slot} 
        className="text-gray-800 dark:text-white bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium"
      >
        {slot}
      </option>
    ))}
</select>





                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <Plus className="h-4 w-4 text-white group-hover:scale-125 group-hover:rotate-90 transition-all duration-300 drop-shadow-sm" />
                    </div>
                  </div>
                </div>
              </CardTitle>
              <CardDescription>
                Manage your availability for {selectedDay}. Green slots are available for booking.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {weeklySchedule[selectedDay].length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No time slots set for {selectedDay}</p>
                  <p className="text-sm text-muted-foreground">Add time slots using the dropdown above</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {weeklySchedule[selectedDay]
                    .sort((a, b) => a.time.localeCompare(b.time))
                    .map((slot) => (
                    <div key={slot.id} className={`flex items-center justify-between p-4 border rounded-lg transition-all ${
                      slot.booked 
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' 
                        : slot.available 
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                        : 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800'
                    }`}>
                      <div className="flex items-center space-x-3">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium text-foreground">{slot.time}</span>
                        {slot.booked && (
                          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Booked
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {!slot.booked && (
                          <Button 
                            variant={slot.available ? "default" : "outline"}
                            size="sm"
                            onClick={() => toggleSlotAvailability(selectedDay, slot.id)}
                            className={slot.available ? "gradient-button" : ""}
                          >
                            {slot.available ? "Available" : "Unavailable"}
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTimeSlot(selectedDay, slot.id)}
                          disabled={slot.booked}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="mt-6 flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  {weeklySchedule[selectedDay].filter(s => s.available && !s.booked).length} available slots • 
                  {weeklySchedule[selectedDay].filter(s => s.booked).length} booked sessions
                </div>
                <Button onClick={saveSchedule} className="gradient-button" disabled={!hasUnsavedChanges}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Schedule
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default CounsellorAvailability;