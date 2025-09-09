import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface SyncStatus {
  connected: boolean;
  lastSync: Date;
  pendingChanges: number;
  syncInProgress: boolean;
}

interface RealTimeSyncProps {
  onSyncUpdate?: (status: SyncStatus) => void;
}

const RealTimeSync: React.FC<RealTimeSyncProps> = ({ onSyncUpdate }) => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    connected: true,
    lastSync: new Date(),
    pendingChanges: 0,
    syncInProgress: false
  });

  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'booking' | 'availability' | 'activity' | 'message';
    message: string;
    timestamp: Date;
    read: boolean;
  }>>([]);

  // Simulate real-time connection and sync
  useEffect(() => {
    const syncInterval = setInterval(() => {
      // Simulate occasional connection issues
      const shouldDisconnect = Math.random() < 0.05; // 5% chance
      
      if (shouldDisconnect && syncStatus.connected) {
        setSyncStatus(prev => ({ ...prev, connected: false }));
        toast.error('Connection lost. Attempting to reconnect...');
        
        // Reconnect after 2-5 seconds
        setTimeout(() => {
          setSyncStatus(prev => ({ 
            ...prev, 
            connected: true, 
            lastSync: new Date(),
            syncInProgress: false 
          }));
          toast.success('Connection restored. All changes synced.');
        }, Math.random() * 3000 + 2000);
      } else if (syncStatus.connected) {
        // Normal sync update
        setSyncStatus(prev => ({
          ...prev,
          lastSync: new Date(),
          pendingChanges: Math.max(0, prev.pendingChanges - 1),
          syncInProgress: false
        }));
      }
    }, 10000); // Check every 10 seconds

    // Simulate incoming notifications
    const notificationInterval = setInterval(() => {
      if (Math.random() < 0.3) { // 30% chance every 15 seconds
        const notificationTypes = ['booking', 'availability', 'activity', 'message'] as const;
        const messages = {
          booking: ['New booking request received', 'Booking confirmed by student', 'Session reminder sent'],
          availability: ['Availability updated successfully', 'New time slots added', 'Schedule synchronized'],
          activity: ['Student completed assigned activity', 'New activity progress update', 'Activity deadline reminder'],
          message: ['New message from student', 'Session feedback received', 'Emergency support requested']
        };

        const type = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
        const typeMessages = messages[type];
        const message = typeMessages[Math.floor(Math.random() * typeMessages.length)];

        const newNotification = {
          id: Date.now().toString(),
          type,
          message,
          timestamp: new Date(),
          read: false
        };

        setNotifications(prev => [newNotification, ...prev.slice(0, 4)]); // Keep only 5 latest
        
        // Show toast for important notifications
        if (type === 'booking' || type === 'message') {
          toast.info(message, {
            action: {
              label: 'View',
              onClick: () => console.log('Navigate to notification')
            }
          });
        }
      }
    }, 15000); // Check every 15 seconds

    return () => {
      clearInterval(syncInterval);
      clearInterval(notificationInterval);
    };
  }, [syncStatus.connected]);

  // Call callback when sync status changes
  useEffect(() => {
    if (onSyncUpdate) {
      onSyncUpdate(syncStatus);
    }
  }, [syncStatus, onSyncUpdate]);

  const getStatusColor = () => {
    if (!syncStatus.connected) return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    if (syncStatus.syncInProgress) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
    return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
  };

  const getStatusIcon = () => {
    if (!syncStatus.connected) return WifiOff;
    if (syncStatus.syncInProgress) return Clock;
    return CheckCircle;
  };

  const getStatusText = () => {
    if (!syncStatus.connected) return 'Disconnected';
    if (syncStatus.syncInProgress) return 'Syncing...';
    return 'Connected';
  };

  const StatusIcon = getStatusIcon();

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {/* Sync Status Badge */}
      <div className="flex items-center justify-end">
        <Badge className={`${getStatusColor()} flex items-center space-x-1 px-3 py-1`}>
          <StatusIcon className="h-3 w-3" />
          <span className="text-xs font-medium">{getStatusText()}</span>
        </Badge>
      </div>

      {/* Recent Notifications */}
      {notifications.length > 0 && (
        <div className="bg-background/95 backdrop-blur-md border border-border rounded-lg shadow-lg p-3 max-w-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-foreground">Recent Updates</span>
            <Badge className="bg-primary/20 text-primary text-xs">
              {notifications.filter(n => !n.read).length} new
            </Badge>
          </div>
          <div className="space-y-2">
            {notifications.slice(0, 3).map((notification) => {
              const getNotificationIcon = () => {
                switch (notification.type) {
                  case 'booking': return Clock;
                  case 'availability': return CheckCircle;
                  case 'activity': return AlertCircle;
                  case 'message': return Wifi;
                  default: return CheckCircle;
                }
              };
              
              const NotificationIcon = getNotificationIcon();
              
              return (
                <div 
                  key={notification.id} 
                  className={`flex items-start space-x-2 p-2 rounded-md transition-all duration-200 ${
                    !notification.read 
                      ? 'bg-primary/5 border border-primary/20' 
                      : 'bg-accent/30'
                  }`}
                >
                  <NotificationIcon className="h-3 w-3 mt-0.5 text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground truncate">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {notification.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Connection Info */}
      <div className="text-right">
        <div className="text-xs text-muted-foreground">
          Last sync: {syncStatus.lastSync.toLocaleTimeString()}
        </div>
        {syncStatus.pendingChanges > 0 && (
          <div className="text-xs text-yellow-600">
            {syncStatus.pendingChanges} pending changes
          </div>
        )}
      </div>
    </div>
  );
};

export default RealTimeSync;
