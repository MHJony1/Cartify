import { EmptyState } from "@/components/shared/EmptyState";
import { Bell } from "lucide-react";

export default function AdminNotificationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">Manage system alerts and customer communications.</p>
        </div>
      </div>
      
      <div className="bg-background rounded-lg border border-border shadow-sm min-h-[400px] flex items-center justify-center">
        <EmptyState 
          title="Notifications Coming Soon"
          message="The admin notification center will be implemented in a future update."
          icon={<Bell className="h-10 w-10 text-muted-foreground/30" />}
        />
      </div>
    </div>
  );
}
