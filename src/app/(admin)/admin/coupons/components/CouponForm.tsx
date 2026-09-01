"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ICoupon, CouponPayload } from "@/features/admin/api/coupons.api";

const couponSchema = z.object({
  code: z.string().min(3, "Code must be at least 3 characters").max(50),
  description: z.string().max(255).optional().or(z.literal("")),
  discountType: z.enum(["PERCENTAGE", "FIXED"]),
  discountValue: z.coerce.number().min(0.01, "Discount must be greater than 0"),
  minOrderAmount: z.coerce.number().min(0).optional().or(z.literal("")),
  maxDiscountAmount: z.coerce.number().min(0).optional().or(z.literal("")),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date format"),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date format"),
  usageLimit: z.coerce.number().min(1).optional().or(z.literal("")),
  perUserLimit: z.coerce.number().min(1).optional().or(z.literal("")),
  isActive: z.boolean().default(true),
}).superRefine((data, ctx) => {
  if (data.discountType === "PERCENTAGE" && data.discountValue > 100) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Percentage discount cannot exceed 100%",
      path: ["discountValue"],
    });
  }
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  if (end <= start) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "End date must be after start date",
      path: ["endDate"],
    });
  }
});

type CouponFormValues = z.infer<typeof couponSchema>;

interface CouponFormProps {
  initialData?: ICoupon;
  onSubmit: (data: CouponPayload) => void;
  isSubmitting?: boolean;
  onCancel: () => void;
}

export function CouponForm({ initialData, onSubmit, isSubmitting, onCancel }: CouponFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      code: initialData?.code || "",
      description: initialData?.description || "",
      discountType: initialData?.discountType || "PERCENTAGE",
      discountValue: initialData?.discountValue || 0,
      minOrderAmount: initialData?.minOrderAmount || "",
      maxDiscountAmount: initialData?.maxDiscountAmount || "",
      startDate: initialData?.startDate ? new Date(initialData.startDate).toISOString().slice(0, 16) : "",
      endDate: initialData?.endDate ? new Date(initialData.endDate).toISOString().slice(0, 16) : "",
      usageLimit: initialData?.usageLimit || "",
      perUserLimit: initialData?.perUserLimit || "",
      isActive: initialData ? initialData.isActive : true,
    },
  });

  const onSubmitForm = (values: any) => {
    const payload: CouponPayload = {
      ...values,
      startDate: new Date(values.startDate).toISOString(),
      endDate: new Date(values.endDate).toISOString(),
      description: values.description || undefined,
      minOrderAmount: values.minOrderAmount === "" ? null : Number(values.minOrderAmount),
      maxDiscountAmount: values.maxDiscountAmount === "" ? null : Number(values.maxDiscountAmount),
      usageLimit: values.usageLimit === "" ? null : Number(values.usageLimit),
      perUserLimit: values.perUserLimit === "" ? null : Number(values.perUserLimit),
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Coupon Code</label>
          <Input placeholder="e.g. SUMMER2024" {...register("code")} />
          {errors.code && <p className="text-sm text-destructive mt-1">{errors.code.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description (Optional)</label>
          <Input placeholder="Internal note..." {...register("description")} />
          {errors.description && <p className="text-sm text-destructive mt-1">{errors.description.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Discount Type</label>
          <select
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            {...register("discountType")}
          >
            <option value="PERCENTAGE">Percentage (%)</option>
            <option value="FIXED">Fixed Amount ($)</option>
          </select>
          {errors.discountType && <p className="text-sm text-destructive mt-1">{errors.discountType.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Discount Value</label>
          <Input type="number" step="0.01" {...register("discountValue")} />
          {errors.discountValue && <p className="text-sm text-destructive mt-1">{errors.discountValue.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Min Order Amount (Optional)</label>
          <Input type="number" step="0.01" placeholder="e.g. 50" {...register("minOrderAmount")} />
          {errors.minOrderAmount && <p className="text-sm text-destructive mt-1">{errors.minOrderAmount.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Max Discount Amount (Optional)</label>
          <Input type="number" step="0.01" placeholder="e.g. 20" {...register("maxDiscountAmount")} />
          <p className="text-xs text-muted-foreground mt-1">Useful for percentage discounts</p>
          {errors.maxDiscountAmount && <p className="text-sm text-destructive mt-1">{errors.maxDiscountAmount.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Start Date & Time</label>
          <Input type="datetime-local" {...register("startDate")} />
          {errors.startDate && <p className="text-sm text-destructive mt-1">{errors.startDate.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">End Date & Time</label>
          <Input type="datetime-local" {...register("endDate")} />
          {errors.endDate && <p className="text-sm text-destructive mt-1">{errors.endDate.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Total Usage Limit (Optional)</label>
          <Input type="number" placeholder="e.g. 100" {...register("usageLimit")} />
          {errors.usageLimit && <p className="text-sm text-destructive mt-1">{errors.usageLimit.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Per User Limit (Optional)</label>
          <Input type="number" placeholder="e.g. 1" {...register("perUserLimit")} />
          {errors.perUserLimit && <p className="text-sm text-destructive mt-1">{errors.perUserLimit.message}</p>}
        </div>
      </div>

      <div className="flex flex-row items-start space-x-3 rounded-md border p-4 shadow-sm">
        <input
          type="checkbox"
          className="mt-1 h-4 w-4"
          {...register("isActive")}
        />
        <div className="space-y-1 leading-none">
          <label className="font-medium text-sm">Active Status</label>
          <p className="text-sm text-muted-foreground">
            This coupon can be used by customers if active and within date range.
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4 border-t border-border">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Coupon"}
        </Button>
      </div>
    </form>
  );
}
