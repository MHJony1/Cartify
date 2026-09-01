"use client";

import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCurrentUser } from "@/features/auth/hooks";
import { notificationsApi } from "@/features/notifications/api/notifications.api";
import { Bell, Check, Trash2, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { toast } from "react-toastify";
import { AccountLayout } from "@/components/layout/account/AccountLayout";

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationsApi.getNotifications(),
    enabled: !!user,
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

  if (!user) return null; // Handled by proxy/layout

  const hasUnread = notifications?.some((n: any) => !n.isRead);

  return (
    <AccountLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/40 pb-6 mb-8">
          <div>
            <h1 className="text-2xl font-bold uppercase tracking-widest mb-2">Notifications</h1>
            <p className="text-sm text-muted-foreground">Stay updated on your orders and activities.</p>
          </div>
          
          {hasUnread && (
            <Button 
              variant="outline" 
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending}
              className="uppercase tracking-widest text-xs font-bold rounded-none h-10 px-6 shrink-0 border-2"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Mark all as read
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-none" />
            ))}
          </div>
        ) : !notifications || notifications.length === 0 ? (
          <div className="bg-muted/20 border border-border/50 p-12 flex flex-col items-center justify-center text-center">
            <Bell className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="font-bold uppercase tracking-widest mb-2">You're all caught up!</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              You don't have any notifications right now.
            </p>
          </div>
        ) : (
          <div className="bg-background border border-border/50 overflow-hidden">
            <div className="divide-y divide-border/50">
              {notifications.map((notification: any) => (
                <div 
                  key={notification.id} 
                  className={`p-6 flex gap-4 transition-colors ${notification.isRead ? 'bg-background hover:bg-muted/20' : 'bg-foreground/5 hover:bg-foreground/10'}`}
                >
                  <div className={`mt-1 flex-shrink-0 h-10 w-10 flex items-center justify-center border ${notification.isRead ? 'bg-muted border-border/50 text-muted-foreground' : 'bg-background border-foreground text-foreground'}`}>
                    <Bell className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-1">
                      <h3 className={`font-bold text-sm tracking-widest uppercase ${!notification.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {notification.title}
                      </h3>
                      <span className="text-xs font-medium text-muted-foreground flex items-center shrink-0">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className={`text-sm leading-relaxed ${!notification.isRead ? 'text-foreground/80' : 'text-muted-foreground'}`}>
                      {notification.message}
                    </p>
                    <div className="flex gap-6 mt-4">
                      {!notification.isRead && (
                        <button 
                          onClick={() => markAsReadMutation.mutate(notification.id)}
                          className="text-xs font-bold uppercase tracking-widest text-foreground hover:text-primary flex items-center transition-colors"
                          disabled={markAsReadMutation.isPending}
                        >
                          <Check className="w-3.5 h-3.5 mr-1.5" />
                          Mark as read
                        </button>
                      )}
                      <button 
                        onClick={() => deleteMutation.mutate(notification.id)}
                        className="text-xs font-bold uppercase tracking-widest text-destructive hover:text-red-700 flex items-center transition-colors"
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                  {!notification.isRead && (
                    <div className="w-2 h-2 bg-foreground rounded-full mt-2 flex-shrink-0 shadow"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AccountLayout>
  );
}
