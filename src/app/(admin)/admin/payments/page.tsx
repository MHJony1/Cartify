import { EmptyState } from "@/components/shared/EmptyState";
import { CreditCard } from "lucide-react";

export default function AdminPaymentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
          <p className="text-muted-foreground">Manage transactions and payment gateways.</p>
        </div>
      </div>
      
      <div className="bg-background rounded-lg border border-border shadow-sm min-h-[400px] flex items-center justify-center">
        <EmptyState 
          title="Payments Coming Soon"
          message="The payment gateway integration and transaction management features will be implemented in Phase 7."
          icon={<CreditCard className="h-10 w-10 text-muted-foreground/30" />}
        />
      </div>
    </div>
  );
}
