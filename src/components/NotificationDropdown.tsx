import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, Package, Info, AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNotificationStore } from '@/store/notificationStore';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';

export function NotificationDropdown() {
  const { user } = useAuth();
  const {
    notifications,
    unreadCount,
    isOpen,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    toggleNotifications,
    closeNotifications,
    subscribeToRealtime,
    unsubscribeFromRealtime,
  } = useNotificationStore();

  useEffect(() => {
    if (user) {
      fetchNotifications(user.id);
      subscribeToRealtime(user.id);
      
      return () => {
        unsubscribeFromRealtime();
      };
    }
  }, [user, fetchNotifications, subscribeToRealtime, unsubscribeFromRealtime]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <Package className="h-4 w-4" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  if (!user) return null;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative h-9 w-9"
        onClick={toggleNotifications}
      >
        <Bell className="h-5 w-5" strokeWidth={1.5} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-foreground text-background text-[10px] flex items-center justify-center font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Desktop: Dropdown */}
            <div
              className="fixed inset-0 z-40 md:hidden"
              onClick={closeNotifications}
            />
            
            {/* Mobile: Full height panel */}
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 right-0 w-full sm:w-96 bg-background border-l border-border z-50 flex flex-col md:hidden"
            >
              {/* Header */}
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h3 className="font-display text-lg tracking-wider">Notifications</h3>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markAllAsRead(user.id)}
                      className="text-xs"
                    >
                      Mark all read
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" onClick={closeNotifications}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                  <div className="p-8 text-center text-muted-foreground">
                    Loading...
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="font-medium">No notifications</p>
                    <p className="text-sm mt-1">You're all caught up!</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-b border-border hover:bg-secondary/50 transition-colors cursor-pointer ${
                        !notification.is_read ? 'bg-secondary/30' : ''
                      }`}
                      onClick={() => {
                        if (!notification.is_read) {
                          markAsRead(notification.id, user.id);
                        }
                      }}
                    >
                      <div className="flex gap-3">
                        <div className={`mt-1 ${!notification.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {getIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${!notification.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {notification.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground/50 mt-2">
                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                          </p>
                        </div>
                        {!notification.is_read && (
                          <div className="w-2 h-2 rounded-full bg-foreground mt-2 flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>

            {/* Desktop: Dropdown */}
            <div
              className="hidden md:block fixed inset-0 z-40"
              onClick={closeNotifications}
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="hidden md:block absolute right-0 mt-2 w-80 lg:w-96 bg-background border border-border rounded-lg shadow-lg z-50 overflow-hidden"
            >
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h3 className="font-medium">Notifications</h3>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markAllAsRead(user.id)}
                    className="text-xs"
                  >
                    Mark all read
                  </Button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto">
                {isLoading ? (
                  <div className="p-8 text-center text-muted-foreground">
                    Loading...
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No notifications yet</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-b border-border hover:bg-secondary/50 transition-colors cursor-pointer ${
                        !notification.is_read ? 'bg-secondary/30' : ''
                      }`}
                      onClick={() => {
                        if (!notification.is_read) {
                          markAsRead(notification.id, user.id);
                        }
                      }}
                    >
                      <div className="flex gap-3">
                        <div className={`mt-1 ${!notification.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {getIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${!notification.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {notification.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground/50 mt-2">
                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                          </p>
                        </div>
                        {!notification.is_read && (
                          <div className="w-2 h-2 rounded-full bg-foreground mt-2 flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
