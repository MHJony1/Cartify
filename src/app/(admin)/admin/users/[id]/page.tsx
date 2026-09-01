"use client";

import React, { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "@/features/users/api/users.api";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertCircle, ShoppingBag, MapPin, User as UserIcon } from "lucide-react";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { Avatar } from "@/components/ui/avatar";
import { useCurrentUser } from "@/features/auth/hooks";

interface UserDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default function AdminUserDetailsPage({ params }: UserDetailsPageProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id } = use(params);
  const { data: currentUser } = useCurrentUser();

  const [isConfirmingDeactivate, setIsConfirmingDeactivate] = useState(false);
  const [isConfirmingRoleChange, setIsConfirmingRoleChange] = useState(false);
  const [pendingRole, setPendingRole] = useState("");

  const { data: user, isLoading, isError } = useQuery({
    queryKey: ["admin", "user", id],
    queryFn: () => usersApi.adminGetSingleUser(id),
  });

  const updateStatusMutation = useMutation({
    mutationFn: (status: string) => usersApi.adminUpdateUserStatus({ id, status }),
    onSuccess: () => {
      toast.success("User status updated");
      queryClient.invalidateQueries({ queryKey: ["admin", "user", id] });
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      setIsConfirmingDeactivate(false);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update status");
      setIsConfirmingDeactivate(false);
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: (role: string) => usersApi.adminUpdateUserRole({ id, role }),
    onSuccess: () => {
      toast.success("User role updated");
      queryClient.invalidateQueries({ queryKey: ["admin", "user", id] });
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      setIsConfirmingRoleChange(false);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update role");
      setIsConfirmingRoleChange(false);
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE": return "bg-green-500/10 text-green-500";
      case "INACTIVE": return "bg-yellow-500/10 text-yellow-500";
      case "SUSPENDED": return "bg-destructive/10 text-destructive";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
  };

  const isSelf = currentUser?.id === id;

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => router.push("/admin/users")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="h-8 w-64 bg-muted animate-pulse rounded"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-48 bg-muted animate-pulse rounded-lg"></div>
            <div className="h-48 bg-muted animate-pulse rounded-lg"></div>
          </div>
          <div className="space-y-6">
            <div className="h-48 bg-muted animate-pulse rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto text-center py-20 bg-background rounded-lg border border-border">
        <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
        <h2 className="text-2xl font-bold">User Not Found</h2>
        <p className="text-muted-foreground mb-6">This user doesn't exist or has been permanently deleted.</p>
        <Button onClick={() => router.push("/admin/users")}>Back to Users</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/admin/users")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-4">
            <Avatar image={user.image || undefined} name={user.name} size="lg" className="h-12 w-12 border border-border shadow-sm" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                {user.name}
                {isSelf && <span className="text-xs font-normal px-2 py-1 bg-primary/10 text-primary rounded-full">You</span>}
              </h1>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(user.status)}`}>
            {user.status}
          </span>
          <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${user.role === 'ADMIN' ? 'bg-indigo-500/10 text-indigo-500' : 'bg-muted text-muted-foreground'}`}>
            {user.role}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Profile Information */}
          <div className="bg-background border border-border rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/20 flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-muted-foreground" />
              <h2 className="font-semibold text-lg">Profile Information</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Full Name</p>
                  <p className="font-medium">{user.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Email Address</p>
                  <p className="font-medium">
                    <a href={`mailto:${user.email}`} className="hover:underline hover:text-primary transition-colors">{user.email}</a>
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Phone Number</p>
                  <p className="font-medium">{user.phone || "—"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Joined Date</p>
                  <p className="font-medium">{format(new Date(user.createdAt), "MMMM d, yyyy")}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Activity */}
          <div className="bg-background border border-border rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/20 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-muted-foreground" />
              <h2 className="font-semibold text-lg">Customer Activity</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/30 p-4 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground mb-1">Total Orders</p>
                  <p className="text-3xl font-bold">{user._count?.orders || 0}</p>
                </div>
                <div className="bg-muted/30 p-4 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground mb-1">Default Address</p>
                  <div className="flex items-start gap-2 mt-2">
                    <MapPin className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                    <p className="text-sm">
                      {user.addresses && user.addresses.length > 0 
                        ? `${user.addresses[0].addressLine}, ${user.addresses[0].city || user.addresses[0].district}` 
                        : "No saved addresses"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column - Management */}
        <div className="space-y-6">
          <div className="bg-background border border-border rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/20">
              <h2 className="font-semibold text-lg">Manage Account</h2>
            </div>
            <div className="p-4 space-y-6">
              
              {/* Status Management */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">Account Status</label>
                <select 
                  className="flex h-10 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  value={user.status}
                  onChange={(e) => {
                    const newStatus = e.target.value;
                    if ((newStatus === "INACTIVE" || newStatus === "SUSPENDED") && !isSelf) {
                      setIsConfirmingDeactivate(true);
                      // Reset select value temporarily until confirmed
                      e.target.value = user.status; 
                    } else if (!isSelf) {
                      updateStatusMutation.mutate(newStatus);
                    }
                  }}
                  disabled={isSelf || updateStatusMutation.isPending}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="SUSPENDED">Suspended</option>
                </select>
                {isSelf && (
                  <p className="text-xs text-muted-foreground">You cannot change the status of your own account.</p>
                )}
              </div>

              <hr className="border-border" />

              {/* Role Management */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">Account Role</label>
                <select 
                  className="flex h-10 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  value={user.role}
                  onChange={(e) => {
                    const newRole = e.target.value;
                    if (!isSelf) {
                      setPendingRole(newRole);
                      setIsConfirmingRoleChange(true);
                      e.target.value = user.role;
                    }
                  }}
                  disabled={isSelf || updateRoleMutation.isPending}
                >
                  <option value="USER">Customer</option>
                  <option value="ADMIN">Admin</option>
                </select>
                {isSelf && (
                  <p className="text-xs text-muted-foreground">You cannot change your own role to prevent system lockouts.</p>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modals */}
      {isConfirmingDeactivate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-background rounded-lg border border-border shadow-lg max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4 text-destructive">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-lg font-bold">Suspend Account?</h3>
            </div>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Are you sure you want to suspend or deactivate this user? They will no longer be able to log in or make purchases.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsConfirmingDeactivate(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => updateStatusMutation.mutate("SUSPENDED")} 
                disabled={updateStatusMutation.isPending}
              >
                {updateStatusMutation.isPending ? "Updating..." : "Yes, Suspend User"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {isConfirmingRoleChange && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-background rounded-lg border border-border shadow-lg max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4 text-primary">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-lg font-bold">Change User Role?</h3>
            </div>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Are you sure you want to change this user's role to <strong>{pendingRole}</strong>? 
              {pendingRole === "ADMIN" && " They will gain full access to the admin dashboard."}
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsConfirmingRoleChange(false)}>
                Cancel
              </Button>
              <Button 
                variant="default" 
                onClick={() => updateRoleMutation.mutate(pendingRole)} 
                disabled={updateRoleMutation.isPending}
              >
                {updateRoleMutation.isPending ? "Updating..." : "Yes, Change Role"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
