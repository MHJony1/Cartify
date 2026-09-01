"use client";

import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsApi } from "@/features/notifications/api/notifications.api";
import { Bell, Check, Trash2, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { toast } from "react-toastify";

export default function NotificationsPage() {
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationsApi.getNotifications(),
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-count"] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-count"] });
      toast.success("All notifications marked as read");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-count"] });
      toast.success("Notification deleted");
    },
  });

  if (isLoading) {
    return (
      <div className="container max-w-4xl py-10 px-4 md:px-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-32 bg-muted rounded w-full"></div>
          <div className="h-32 bg-muted rounded w-full"></div>
        </div>
      </div>
    );
  }

  const hasUnread = notifications?.some((n: any) => !n.isRead);

  return (
    <div className="container max-w-4xl py-10 px-4 md:px-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
            <p className="text-muted-foreground">Stay updated on your orders and activities.</p>
          </div>
        </div>
        
        {hasUnread && (
          <Button 
            variant="outline" 
            onClick={() => markAllAsReadMutation.mutate()}
            disabled={markAllAsReadMutation.isPending}
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Mark all as read
          </Button>
        )}
      </div>

      {!notifications || notifications.length === 0 ? (
        <div className="bg-background rounded-lg border border-border p-12 text-center shadow-sm">
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <Bell className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">You're all caught up!</h2>
          <p className="text-muted-foreground">You don't have any notifications right now.</p>
        </div>
      ) : (
        <div className="bg-background rounded-lg border border-border shadow-sm overflow-hidden">
          <div className="divide-y divide-border">
            {notifications.map((notification: any) => (
              <div 
                key={notification.id} 
                className={`p-4 flex gap-4 transition-colors ${notification.isRead ? 'bg-background hover:bg-muted/30' : 'bg-primary/5 hover:bg-primary/10'}`}
              >
                <div className={`mt-1 flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${notification.isRead ? 'bg-muted text-muted-foreground' : 'bg-primary/20 text-primary'}`}>
                  <Bell className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className={`font-medium ${!notification.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {notification.title}
                    </h3>
                    <span className="text-xs text-muted-foreground flex items-center shrink-0 ml-4">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className={`text-sm mt-1 ${!notification.isRead ? 'text-muted-foreground' : 'text-muted-foreground/80'}`}>
                    {notification.message}
                  </p>
                  <div className="flex gap-4 mt-3">
                    {!notification.isRead && (
                      <button 
                        onClick={() => markAsReadMutation.mutate(notification.id)}
                        className="text-xs font-medium text-primary hover:underline flex items-center"
                        disabled={markAsReadMutation.isPending}
                      >
                        <Check className="w-3 h-3 mr-1" />
                        Mark as read
                      </button>
                    )}
                    <button 
                      onClick={() => deleteMutation.mutate(notification.id)}
                      className="text-xs font-medium text-destructive hover:underline flex items-center"
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
                {!notification.isRead && (
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
