"use client";

import { useRouter } from 'next/navigation';
import { AuthForm } from '@/components/auth-form';
import { Dialog, DialogContent } from '@/components/ui/dialog';


export default function SignupPage() {
    const router = useRouter();
    return (
        <Dialog open onOpenChange={() => router.push('/')}>
            <DialogContent className="bg-transparent p-0 border-0 shadow-none max-w-lg">
                <AuthForm mode="signup" />
            </DialogContent>
        </Dialog>
    )
}
