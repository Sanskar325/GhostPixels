
"use client";

import { Dialog, DialogContent, DialogOverlay, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { ProfileForm } from "./profile-form";
import { X } from "lucide-react";

interface ProfileDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
}

export function ProfileDialog({ isOpen, onOpenChange }: ProfileDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
             <DialogContent className="bg-transparent p-0 border-0 shadow-none max-w-2xl overflow-hidden">
                 <DialogTitle className="sr-only">Profile Settings</DialogTitle>
                 <DialogDescription className="sr-only">View, edit your profile information, or change your password.</DialogDescription>
                 <ProfileForm onDone={() => onOpenChange(false)} />
                 <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground z-50 text-white">
                    <X className="h-6 w-6" />
                    <span className="sr-only">Close</span>
                </DialogClose>
             </DialogContent>
        </Dialog>
    )
}
