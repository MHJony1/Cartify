"use client";

import React, { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCurrentUser } from "@/features/auth/hooks";
import { authApi } from "@/features/auth/api/auth.api";
import { AUTH_KEYS } from "@/features/auth/hooks";
import { AccountLayout } from "@/components/layout/account/AccountLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { Camera, Check, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "react-toastify";

export default function ProfilePage() {
  const { data: user } = useCurrentUser();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [isUploading, setIsUploading] = useState(false);

  const updateProfileMutation = useMutation({
    mutationFn: (payload: { name?: string; phone?: string; image?: string }) => 
      authApi.updateProfile(user!.id, payload),
    onSuccess: (data) => {
      queryClient.setQueryData(AUTH_KEYS.currentUser, data);
      toast.success("Profile updated successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update profile");
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setIsUploading(true);
    try {
      const imageUrl = await authApi.uploadImage(file);
      await updateProfileMutation.mutateAsync({ image: imageUrl });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to upload image");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSaveProfile = () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    updateProfileMutation.mutate({ name, phone });
  };

  const isDirty = name !== (user?.name || "") || phone !== (user?.phone || "");

  if (!user) return null;

  return (
    <AccountLayout>
      <div className="space-y-12">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-widest border-b border-border/40 pb-6 mb-8">Profile Settings</h1>
        </div>

        {/* Profile Image */}
        <section>
          <h2 className="text-sm font-bold uppercase tracking-widest mb-6">Profile Image</h2>
          <div className="flex items-center gap-8">
            <div className="relative group w-32 h-32">
              <Avatar image={user.image} name={user.name} size="lg" className="h-full w-full rounded-none border-2 border-border/50 bg-muted" />
              <div 
                className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity cursor-pointer ${isUploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                onClick={() => !isUploading && fileInputRef.current?.click()}
              >
                {isUploading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Camera className="h-8 w-8 text-white" />
                )}
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-4 max-w-xs">
                Upload a new avatar. Larger images will be resized automatically. Maximum upload size is 5MB.
              </p>
              <Button 
                variant="outline" 
                className="uppercase tracking-widest text-xs font-bold rounded-none h-10 px-6 border-2"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading || updateProfileMutation.isPending}
              >
                {isUploading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...</>
                ) : "Change Image"}
              </Button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleImageUpload}
              />
            </div>
          </div>
        </section>

        {/* Personal Details */}
        <section>
          <h2 className="text-sm font-bold uppercase tracking-widest mb-6 border-b border-border/40 pb-4">Personal Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Full Name</label>
              <Input 
                value={name} 
                onChange={e => setName(e.target.value)} 
                className="h-12 rounded-none border-border/50 bg-background focus-visible:ring-0 focus-visible:border-foreground"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Email Address (Read-only)</label>
              <Input 
                value={user.email} 
                disabled 
                className="h-12 rounded-none border-border/50 bg-muted/50 cursor-not-allowed"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Phone Number</label>
              <Input 
                value={phone} 
                onChange={e => setPhone(e.target.value)} 
                placeholder="Add phone number"
                className="h-12 rounded-none border-border/50 bg-background focus-visible:ring-0 focus-visible:border-foreground"
              />
            </div>
          </div>
          
          <div className="mt-8">
            <Button 
              className="uppercase tracking-widest text-xs font-bold rounded-none h-12 px-8"
              onClick={handleSaveProfile}
              disabled={!isDirty || updateProfileMutation.isPending}
            >
              {updateProfileMutation.isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
              ) : "Save Changes"}
            </Button>
          </div>
        </section>

        {/* Change Password (Read-Only) */}
        <section className="opacity-50">
          <h2 className="text-sm font-bold uppercase tracking-widest mb-6 border-b border-border/40 pb-4">Change Password</h2>
          <div className="bg-muted/20 p-6 border border-border/50 max-w-2xl">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-sm uppercase tracking-widest mb-1">Unavailable</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  The password change functionality is currently not supported by the platform backend. 
                  Please contact support if you require assistance with your credentials.
                </p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 max-w-md mt-6 opacity-30 pointer-events-none">
            <Input type="password" placeholder="Current Password" disabled className="h-12 rounded-none border-border/50 bg-background" />
            <Input type="password" placeholder="New Password" disabled className="h-12 rounded-none border-border/50 bg-background" />
            <Button disabled className="uppercase tracking-widest text-xs font-bold rounded-none h-12 w-32">Update</Button>
          </div>
        </section>
      </div>
    </AccountLayout>
  );
}
