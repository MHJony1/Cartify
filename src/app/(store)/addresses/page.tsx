"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { AccountLayout } from "@/components/layout/account/AccountLayout";
import { addressApi, Address, CreateAddressPayload } from "@/features/address/api/address.api";
import { AddressForm } from "@/features/address/components/AddressForm";
import { Button } from "@/components/ui/button";
import { MapPin, Plus, Edit2, Trash2, CheckCircle2 } from "lucide-react";
import { toast } from "react-toastify";
import { useCurrentUser } from "@/features/auth/hooks";
import { Skeleton } from "@/components/ui/skeleton";

export default function AddressesPage() {
  const { data: user } = useCurrentUser();
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const { data: addressesResponse, isLoading } = useQuery({
    queryKey: ["addresses"],
    queryFn: addressApi.getMyAddresses,
    enabled: !!user,
  });

  const addresses = addressesResponse?.data || [];

  const addMutation = useMutation({
    mutationFn: addressApi.createAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      toast.success("Address added successfully");
      setIsFormOpen(false);
    },
    onError: (error: AxiosError<{ message: string }>) => toast.error(error?.response?.data?.message || "Failed to add address"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateAddressPayload> }) => addressApi.updateAddress(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      toast.success("Address updated successfully");
      setIsFormOpen(false);
      setEditingAddress(null);
    },
    onError: (error: AxiosError<{ message: string }>) => toast.error(error?.response?.data?.message || "Failed to update address"),
  });

  const deleteMutation = useMutation({
    mutationFn: addressApi.deleteAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      toast.success("Address deleted");
    },
    onError: (error: AxiosError<{ message: string }>) => toast.error(error?.response?.data?.message || "Failed to delete address"),
  });

  const setDefaultMutation = useMutation({
    mutationFn: addressApi.setDefaultAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      toast.success("Default address updated");
    },
    onError: (error: AxiosError<{ message: string }>) => toast.error(error?.response?.data?.message || "Failed to set default address"),
  });

  const handleOpenAdd = () => {
    setEditingAddress(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (address: Address) => {
    setEditingAddress(address);
    setIsFormOpen(true);
  };

  const handleSubmit = (payload: CreateAddressPayload) => {
    if (editingAddress) {
      updateMutation.mutate({ id: editingAddress.id, payload });
    } else {
      addMutation.mutate(payload);
    }
  };

  if (!user) return null;

  return (
    <AccountLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-6">
          <h1 className="text-2xl font-bold uppercase tracking-widest">Addresses</h1>
          <Button onClick={handleOpenAdd} className="uppercase tracking-widest text-xs font-bold rounded-none h-10 px-6 shrink-0">
            <Plus className="h-4 w-4 mr-2" />
            Add Address
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map(i => (
              <Skeleton key={i} className="h-48 w-full rounded-none" />
            ))}
          </div>
        ) : addresses.length === 0 ? (
          <div className="py-20 text-center border-2 border-dashed border-border/50 bg-muted/10">
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-6">
              <MapPin className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-bold uppercase tracking-widest mb-2">No Saved Addresses</h3>
            <p className="text-muted-foreground max-w-sm mx-auto mb-8 text-sm">
              Add an address to make checkout faster and manage your deliveries seamlessly.
            </p>
            <Button onClick={handleOpenAdd} variant="outline" className="uppercase tracking-widest text-xs font-bold rounded-none h-12 px-8 border-2">
              Add Address
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {addresses.map((address) => (
              <div key={address.id} className={`p-6 border-2 transition-colors relative flex flex-col ${address.isDefault ? 'border-foreground bg-foreground/5' : 'border-border/50'}`}>
                {address.isDefault && (
                  <div className="absolute top-0 right-0 bg-foreground text-background text-[10px] font-bold uppercase tracking-widest px-3 py-1">
                    Default
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1">{address.name}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4 mt-2">
                    {address.addressLine}<br/>
                    {address.area && <>{address.area}, </>}
                    {address.district}<br/>
                    {address.division} {address.postalCode}
                  </p>
                  <p className="text-sm font-medium">{address.phone}</p>
                </div>
                
                <div className="flex items-center gap-4 mt-6 pt-6 border-t border-border/40">
                  <button 
                    onClick={() => handleOpenEdit(address)}
                    className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground flex items-center transition-colors"
                  >
                    <Edit2 className="h-3.5 w-3.5 mr-1.5" /> Edit
                  </button>
                  <button 
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this address?")) {
                        deleteMutation.mutate(address.id);
                      }
                    }}
                    disabled={deleteMutation.isPending}
                    className="text-xs font-bold uppercase tracking-widest text-destructive hover:text-red-700 flex items-center transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete
                  </button>
                  
                  {!address.isDefault && (
                    <button 
                      onClick={() => setDefaultMutation.mutate(address.id)}
                      disabled={setDefaultMutation.isPending}
                      className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground flex items-center ml-auto transition-colors"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Set Default
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <AddressForm 
          open={isFormOpen} 
          onOpenChange={(open) => {
            setIsFormOpen(open);
            if (!open) setEditingAddress(null);
          }}
          onSubmit={handleSubmit}
          isSubmitting={addMutation.isPending || updateMutation.isPending}
          initialData={editingAddress}
        />
      </div>
    </AccountLayout>
  );
}
