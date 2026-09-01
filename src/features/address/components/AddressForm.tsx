import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { CreateAddressPayload, Address } from "../api/address.api";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";

interface AddressFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (address: CreateAddressPayload) => void;
  isSubmitting?: boolean;
  initialData?: Address | null;
}

export function AddressForm({ open, onOpenChange, onSubmit, isSubmitting, initialData }: AddressFormProps) {
  const [formData, setFormData] = useState<CreateAddressPayload>({
    name: "",
    phone: "",
    division: "",
    district: "",
    area: "",
    addressLine: "",
    postalCode: "",
    isDefault: false,
  });

  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData({
          name: initialData.name || "",
          phone: initialData.phone || "",
          division: initialData.division || "",
          district: initialData.district || "",
          area: initialData.area || "",
          addressLine: initialData.addressLine || "",
          postalCode: initialData.postalCode || "",
          isDefault: initialData.isDefault || false,
        });
      } else {
        setFormData({
          name: "", phone: "", division: "", district: "", area: "", addressLine: "", postalCode: "", isDefault: false,
        });
      }
    }
  }, [open, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.addressLine.trim() || !formData.phone.trim()) {
      toast.error("Please fill in all required fields (Name, Phone, Address Line)");
      return;
    }
    onSubmit(formData);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[500px] p-0 rounded-none border-border/50 overflow-y-auto">
        <div className="p-6 md:p-8">
          <SheetHeader className="mb-6 text-left">
            <SheetTitle className="text-xl font-bold uppercase tracking-widest">
              {initialData ? "Edit Address" : "Add New Address"}
            </SheetTitle>
            <SheetDescription className="text-sm text-muted-foreground mt-2">
              Provide your delivery details below.
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Full Name *</label>
                <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="h-12 rounded-none border-border/50 bg-background focus-visible:ring-0 focus-visible:border-foreground" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Phone Number *</label>
                <Input required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="h-12 rounded-none border-border/50 bg-background focus-visible:ring-0 focus-visible:border-foreground" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Address Line (Street, House) *</label>
              <Input required value={formData.addressLine} onChange={e => setFormData({...formData, addressLine: e.target.value})} className="h-12 rounded-none border-border/50 bg-background focus-visible:ring-0 focus-visible:border-foreground" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Area / Thana</label>
                <Input value={formData.area} onChange={e => setFormData({...formData, area: e.target.value})} className="h-12 rounded-none border-border/50 bg-background focus-visible:ring-0 focus-visible:border-foreground" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">District</label>
                <Input value={formData.district} onChange={e => setFormData({...formData, district: e.target.value})} className="h-12 rounded-none border-border/50 bg-background focus-visible:ring-0 focus-visible:border-foreground" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Division</label>
                <Input value={formData.division} onChange={e => setFormData({...formData, division: e.target.value})} className="h-12 rounded-none border-border/50 bg-background focus-visible:ring-0 focus-visible:border-foreground" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Postal Code</label>
                <Input value={formData.postalCode} onChange={e => setFormData({...formData, postalCode: e.target.value})} className="h-12 rounded-none border-border/50 bg-background focus-visible:ring-0 focus-visible:border-foreground" />
              </div>
            </div>

            {!initialData?.isDefault && (
              <label className="flex items-center gap-3 cursor-pointer mt-2 group">
                <div className={`h-5 w-5 border flex items-center justify-center transition-colors ${formData.isDefault ? 'border-foreground bg-foreground' : 'border-border/50 group-hover:border-foreground/50'}`}>
                  {formData.isDefault && <div className="h-2.5 w-2.5 bg-background" />}
                </div>
                <input 
                  type="checkbox" 
                  className="hidden" 
                  checked={formData.isDefault}
                  onChange={e => setFormData({...formData, isDefault: e.target.checked})}
                />
                <span className="text-sm font-medium">Set as default address</span>
              </label>
            )}

            <div className="flex gap-4 pt-4 border-t border-border/40">
              <Button type="submit" disabled={isSubmitting} className="flex-1 uppercase tracking-widest text-xs font-bold rounded-none h-12">
                {isSubmitting ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                ) : initialData ? "Update Address" : "Add Address"}
              </Button>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1 uppercase tracking-widest text-xs font-bold rounded-none h-12 border-2">
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
