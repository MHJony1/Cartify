"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminReviewsApi, IReviewQuery } from "@/features/admin/api/reviews.api";
import { Button } from "@/components/ui/button";
import { Trash2, Star, MessageSquare } from "lucide-react";
import { toast } from "react-toastify";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";

export default function AdminReviewsPage() {
  const queryClient = useQueryClient();

  // Filter State
  const [page, setPage] = useState(1);
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Query Params
  const queryParams: IReviewQuery = {
    page,
    limit: 10,
    sortBy,
    sortOrder,
    ...(ratingFilter !== "all" ? { rating: Number(ratingFilter) } : {}),
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "reviews", queryParams],
    queryFn: () => adminReviewsApi.getReviews(queryParams),
  });

  // Delete State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminReviewsApi.deleteReview(id),
    onSuccess: () => {
      toast.success("Review deleted successfully");
      setIsDeleteOpen(false);
      queryClient.invalidateQueries({ queryKey: ["admin", "reviews"] });
      // In case we want to invalidate storefront product reviews as well
      queryClient.invalidateQueries({ queryKey: ["product", "reviews"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete review");
    },
  });

  const openDeleteDialog = (id: string) => {
    setReviewToDelete(id);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (reviewToDelete) {
      deleteMutation.mutate(reviewToDelete);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i < rating ? "text-yellow-500 fill-yellow-500" : "text-muted"}`}
          />
        ))}
      </div>
    );
  };

  if (isError) {
    return <div className="p-8 text-destructive flex items-center justify-center">Failed to load reviews. Please try again.</div>;
  }

  const reviews = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reviews</h1>
          <p className="text-muted-foreground">Manage and moderate customer product reviews.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center bg-card p-4 rounded-md border border-border shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium whitespace-nowrap">Rating:</span>
          <select
            value={ratingFilter}
            onChange={(e) => {
              setRatingFilter(e.target.value);
              setPage(1); // Reset to page 1 on filter change
            }}
            className="flex h-9 w-[130px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium whitespace-nowrap">Sort By:</span>
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [newSortBy, newSortOrder] = e.target.value.split("-");
              setSortBy(newSortBy);
              setSortOrder(newSortOrder as "asc" | "desc");
              setPage(1);
            }}
            className="flex h-9 w-[180px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="rating-desc">Highest Rating</option>
            <option value="rating-asc">Lowest Rating</option>
          </select>
        </div>
      </div>

      <div className="bg-background rounded-lg border border-border shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <EmptyState 
            title="No reviews found" 
            message="No reviews found matching the selected criteria."
            icon={<MessageSquare className="h-10 w-10 text-muted-foreground/30" />}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-medium w-[200px]">Product</th>
                  <th className="px-6 py-4 font-medium w-[150px]">Customer</th>
                  <th className="px-6 py-4 font-medium w-[120px]">Rating</th>
                  <th className="px-6 py-4 font-medium">Comment</th>
                  <th className="px-6 py-4 font-medium w-[120px]">Date</th>
                  <th className="px-6 py-4 font-medium text-right w-[80px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {reviews.map((review) => (
                  <tr key={review.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium">
                      {review.product?.name || "Unknown Product"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="font-medium">{review.user?.name || "Unknown User"}</div>
                        <div className="text-muted-foreground text-xs">{review.user?.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {renderStars(review.rating)}
                    </td>
                    <td className="px-6 py-4 max-w-md">
                      <p className="truncate text-sm text-muted-foreground" title={review.comment}>
                        {review.comment || <span className="italic">No comment</span>}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="sm" className="text-destructive" onClick={() => openDeleteDialog(review.id)}>
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
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-border bg-muted/20">
            <p className="text-sm text-muted-foreground">
              Showing page {page} of {meta.totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                disabled={page === meta.totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-background rounded-lg shadow-lg w-full max-w-md border border-border p-6 space-y-6">
            <div>
              <h2 className="text-lg font-semibold">Delete Review?</h2>
              <p className="text-sm text-muted-foreground mt-2">
                Are you sure you want to delete this review? This action cannot be undone.
                The review will be removed from the storefront.
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
