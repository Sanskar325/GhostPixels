
"use client";

import { Dialog, DialogContent, DialogOverlay, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ProfileForm } from "./profile-form";

interface ProfileDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
}

export function ProfileDialog({ isOpen, onOpenChange }: ProfileDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
             <DialogOverlay className="backdrop-blur-sm" />
             <DialogContent className="bg-transparent p-0 border-0 shadow-none max-w-2xl">
                 <DialogTitle className="sr-only">Profile Settings</DialogTitle>
                 <DialogDescription className="sr-only">View and edit your profile information.</DialogDescription>
                 <ProfileForm />
             </DialogContent>
        </Dialog>
    )
}
