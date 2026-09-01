import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryApi } from '@/features/admin/api/inventory.api';
import { toast } from 'react-toastify';
import { X, PackagePlus, AlertOctagon, SlidersHorizontal, Loader2 } from 'lucide-react';

export type AdjustmentType = 'RESTOCK' | 'DAMAGE' | 'ADJUST';

interface StockAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  variantId: string;
  variantSku: string;
  productName: string;
  currentStock: number;
  type: AdjustmentType;
}

const adjustSchema = z.object({
  operation: z.enum(['INCREASE', 'DECREASE', 'SET']).optional(),
  quantity: z.number().int().min(0, "Quantity must be a positive number"),
  note: z.string().optional(),
});

type FormValues = z.infer<typeof adjustSchema>;

export default function StockAdjustmentModal({
  isOpen,
  onClose,
  productId,
  variantId,
  variantSku,
  productName,
  currentStock,
  type,
}: StockAdjustmentModalProps) {
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(adjustSchema),
    defaultValues: {
      operation: 'SET',
      quantity: 0,
      note: '',
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: FormValues) => {
      if (type === 'RESTOCK') {
        return inventoryApi.restock(productId, variantId, data.quantity, data.note);
      } else if (type === 'DAMAGE') {
        return inventoryApi.damage(productId, variantId, data.quantity, data.note);
      } else {
        return inventoryApi.adjust(productId, variantId, data.operation || 'SET', data.quantity, data.note);
      }
    },
    onSuccess: () => {
      toast.success(`Inventory updated successfully for ${variantSku}`);
      queryClient.invalidateQueries({ queryKey: ['admin', 'inventory'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'inventory-analytics'] });
      reset();
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update inventory');
    }
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="bg-background border border-border shadow-lg rounded-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-border bg-muted/20">
          <div className="flex items-center gap-2">
            {type === 'RESTOCK' && <PackagePlus className="w-5 h-5 text-green-500" />}
            {type === 'DAMAGE' && <AlertOctagon className="w-5 h-5 text-destructive" />}
            {type === 'ADJUST' && <SlidersHorizontal className="w-5 h-5 text-indigo-500" />}
            <h2 className="text-lg font-semibold tracking-tight">
              {type === 'RESTOCK' && 'Restock Variant'}
              {type === 'DAMAGE' && 'Report Damage'}
              {type === 'ADJUST' && 'Adjust Inventory'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-muted text-muted-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 bg-muted/10 border-b border-border">
          <p className="text-sm font-medium">{productName}</p>
          <div className="flex justify-between items-center mt-1">
            <p className="text-xs text-muted-foreground">SKU: {variantSku}</p>
            <p className="text-xs font-medium">Current Stock: <span className={currentStock > 0 ? "text-green-600" : "text-destructive"}>{currentStock}</span></p>
          </div>
        </div>

        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="p-4 space-y-4">
          
          {type === 'ADJUST' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Operation</label>
              <select
                {...register("operation")}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="SET">Set Exact Quantity</option>
                <option value="INCREASE">Increase By</option>
                <option value="DECREASE">Decrease By</option>
              </select>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">
              {type === 'RESTOCK' ? 'Units to Add' : type === 'DAMAGE' ? 'Units Damaged' : 'Quantity'}
            </label>
            <input
              type="number"
              {...register("quantity", { valueAsNumber: true })}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
            {errors.quantity && <p className="text-[10px] text-destructive">{errors.quantity.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Note / Reference (Optional)</label>
            <input
              type="text"
              placeholder="e.g. PO-12345, or Damaged in transit"
              {...register("note")}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={mutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending} variant={type === 'DAMAGE' ? 'destructive' : 'default'}>
              {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
