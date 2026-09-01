"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminCouponsApi, ICoupon, CouponPayload } from "@/features/admin/api/coupons.api";
import { Button } from "@/components/ui/button";
import { CouponForm } from "./components/CouponForm";
import { Edit, Trash2, Plus, Ban, CheckCircle2, Ticket } from "lucide-react";
import { toast } from "react-toastify";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";

export default function AdminCouponsPage() {
  const queryClient = useQueryClient();

  const { data: coupons = [], isLoading, isError } = useQuery({
    queryKey: ["admin", "coupons"],
    queryFn: adminCouponsApi.getCoupons,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Dialog States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<ICoupon | undefined>();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: (payload: CouponPayload) => adminCouponsApi.createCoupon(payload),
    onSuccess: () => {
      toast.success("Coupon created successfully");
      setIsFormOpen(false);
      queryClient.invalidateQueries({ queryKey: ["admin", "coupons"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create coupon");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CouponPayload> }) => 
      adminCouponsApi.updateCoupon(id, payload),
    onSuccess: () => {
      toast.success("Coupon updated successfully");
      setIsFormOpen(false);
      queryClient.invalidateQueries({ queryKey: ["admin", "coupons"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update coupon");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminCouponsApi.deleteCoupon(id),
    onSuccess: () => {
      toast.success("Coupon deleted successfully");
      setIsDeleteOpen(false);
      queryClient.invalidateQueries({ queryKey: ["admin", "coupons"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete coupon");
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (id: string) => adminCouponsApi.toggleStatus(id),
    onSuccess: () => {
      toast.success("Coupon status updated");
      queryClient.invalidateQueries({ queryKey: ["admin", "coupons"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update status");
    },
  });

  const handleFormSubmit = (payload: CouponPayload) => {
    if (selectedCoupon) {
      updateMutation.mutate({ id: selectedCoupon.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const openCreateDialog = () => {
    setSelectedCoupon(undefined);
    setIsFormOpen(true);
  };

  const openEditDialog = (coupon: ICoupon) => {
    setSelectedCoupon(coupon);
    setIsFormOpen(true);
  };

  const openDeleteDialog = (id: string) => {
    setCouponToDelete(id);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (couponToDelete) {
      deleteMutation.mutate(couponToDelete);
    }
  };

  // Client-side filtering & pagination
  const filteredCoupons = coupons.filter(c => 
    c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filteredCoupons.length / itemsPerPage) || 1;
  const paginatedCoupons = filteredCoupons.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (isError) {
    return <div className="p-8 text-destructive flex items-center justify-center">Failed to load coupons. Please try again.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Coupons</h1>
          <p className="text-muted-foreground">Manage your discount codes and promotions.</p>
        </div>
        <Button onClick={openCreateDialog} className="gap-2">
          <Plus className="w-4 h-4" />
          Create Coupon
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <input
          type="text"
          placeholder="Search by code..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="flex h-9 w-full max-w-sm rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      <div className="bg-background rounded-lg border border-border shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : paginatedCoupons.length === 0 ? (
          <EmptyState 
            title="No coupons found" 
            message="You don't have any coupons yet, or none match your search."
            action={<Button onClick={openCreateDialog} variant="outline">Create Coupon</Button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-medium">Code</th>
                  <th className="px-6 py-4 font-medium">Discount</th>
                  <th className="px-6 py-4 font-medium">Usage</th>
                  <th className="px-6 py-4 font-medium">Valid Dates</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedCoupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium flex items-center gap-2">
                      <Ticket className="w-4 h-4 text-muted-foreground" />
                      {coupon.code}
                    </td>
                    <td className="px-6 py-4">
                      {coupon.discountType === "PERCENTAGE" 
                        ? `${coupon.discountValue}%` 
                        : `$${coupon.discountValue}`}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {coupon.usedCount} / {coupon.usageLimit ? coupon.usageLimit : "∞"}
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <div>{new Date(coupon.startDate).toLocaleDateString()}</div>
                      <div className="text-muted-foreground">to {new Date(coupon.endDate).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={coupon.isActive ? "default" : "secondary"} className={coupon.isActive ? "bg-green-600 hover:bg-green-700" : ""}>
                        {coupon.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => toggleStatusMutation.mutate(coupon.id)}
                        disabled={toggleStatusMutation.isPending}
                        title={coupon.isActive ? "Deactivate" : "Activate"}
                      >
                        {coupon.isActive ? <Ban className="w-4 h-4 text-orange-500" /> : <CheckCircle2 className="w-4 h-4 text-green-600" />}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => openEditDialog(coupon)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive" onClick={() => openDeleteDialog(coupon.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-border bg-muted/20">
            <p className="text-sm text-muted-foreground">
              Showing page {currentPage} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(p => p - 1)}
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Custom Form Dialog Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-background rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-border">
            <div className="p-6 border-b border-border flex justify-between items-center sticky top-0 bg-background z-10">
              <h2 className="text-lg font-semibold">{selectedCoupon ? "Edit Coupon" : "Create Coupon"}</h2>
              <Button variant="ghost" size="sm" onClick={() => setIsFormOpen(false)}>✕</Button>
            </div>
            <div className="p-6">
              <CouponForm
                initialData={selectedCoupon}
                onSubmit={handleFormSubmit}
                isSubmitting={createMutation.isPending || updateMutation.isPending}
                onCancel={() => setIsFormOpen(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-background rounded-lg shadow-lg w-full max-w-md border border-border p-6 space-y-6">
            <div>
              <h2 className="text-lg font-semibold">Delete Coupon?</h2>
              <p className="text-sm text-muted-foreground mt-2">
                This will permanently delete the coupon. Customers will no longer be able to use it. This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
              <Button 
                variant="destructive" 
                onClick={confirmDelete}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
