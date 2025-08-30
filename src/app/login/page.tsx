"use client";

import { useRouter } from 'next/navigation';
import { AuthForm } from '@/components/auth-form';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';

export default function LoginPage() {
    const router = useRouter();
    return (
       <Dialog open onOpenChange={() => router.push('/')}>
            <DialogContent className="bg-transparent p-0 border-0 shadow-none max-w-lg">
                <DialogTitle className="sr-only">Login</DialogTitle>
                <DialogDescription className="sr-only">Login to your GhostPixels account.</DialogDescription>
                <AuthForm mode="login" />
            </DialogContent>
        </Dialog>
    )
}
