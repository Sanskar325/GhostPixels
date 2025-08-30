
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Save, KeyRound, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from './ui/skeleton';
import { Separator } from './ui/separator';

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    id: string;
}
const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(({ id, ...props }, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div className="relative">
      <Input
        id={id}
        type={showPassword ? "text" : "password"}
        ref={ref}
        {...props}
        className="pr-10 bg-input/50"
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute top-0 right-0 h-full px-3 text-muted-foreground hover:text-foreground"
        onClick={() => setShowPassword(!showPassword)}
        tabIndex={-1}
      >
        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </Button>
    </div>
  );
});
PasswordInput.displayName = 'PasswordInput';


const profileSchema = z.object({
  firstName: z.string().min(1, { message: 'First name is required.' }),
  lastName: z.string().min(1, { message: 'Last name is required.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  avatar: z.string().url().optional().or(z.literal('')),
  currentPassword: z.string().optional(),
  newPassword: z.string().optional(),
  confirmNewPassword: z.string().optional(),
}).refine(data => {
    if (data.newPassword && data.newPassword.length > 0 && data.newPassword.length < 8) {
        return false;
    }
    return true;
}, {
    message: "New password must be at least 8 characters long.",
    path: ["newPassword"],
}).refine(data => {
    // If one password field is filled, all should be
    if (data.newPassword || data.currentPassword || data.confirmNewPassword) {
        return data.newPassword && data.currentPassword && data.confirmNewPassword;
    }
    return true;
}, {
    message: "All password fields are required to change password.",
    path: ["currentPassword"], // You can decide where to show this error
}).refine(data => data.newPassword === data.confirmNewPassword, {
  message: "New passwords don't match",
  path: ["confirmNewPassword"],
});

type FormValues = z.infer<typeof profileSchema>;

interface ProfileFormProps {
    onDone: () => void;
}

export function ProfileForm({ onDone }: ProfileFormProps) {
  const { toast } = useToast();
  const { user, updateUser, isLoading: isAuthLoading } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset, formState } = useForm<FormValues>({
    resolver: zodResolver(profileSchema),
    mode: "onChange"
  });

  useEffect(() => {
    if (user) {
      reset(user);
    }
  }, [user, reset]);


  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsUpdating(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const {currentPassword, newPassword, ...profileData} = data;
    
    let success = true;
    let toastDescription = "Your information has been successfully updated.";

    // Simulate password change logic
    if (currentPassword && newPassword) {
        // In a real app, you would verify the current password here.
        console.log("Simulating password change...");
        toastDescription += " Your password has also been changed.";
    }

    if (success) {
        updateUser(profileData);
        toast({
          title: 'Profile Updated',
          description: toastDescription,
        });
        onDone();
    } else {
         toast({
            variant: 'destructive',
            title: 'Update Failed',
            description: "Could not update profile. Please try again.",
        });
    }

    setIsUpdating(false);
  };

  if (isAuthLoading) {
    return (
        <Card className="w-full max-w-2xl bg-card/70 shadow-2xl shadow-primary/10">
            <CardHeader className="items-center text-center">
                <Skeleton className="h-24 w-24 rounded-full" />
                <Skeleton className="h-8 w-48 mt-4" />
                <Skeleton className="h-4 w-64 mt-2" />
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                </div>
                 <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </CardContent>
            <CardFooter>
                 <Skeleton className="h-12 w-full" />
            </CardFooter>
        </Card>
    )
  }

  if (!user) {
    return (
        <Card className="w-full max-w-2xl bg-card/70 shadow-2xl shadow-primary/10 p-8 text-center">
            <p>You must be logged in to view this page.</p>
            <Button asChild className="mt-4">
                <Link href="/login">Log In</Link>
            </Button>
        </Card>
    )
  }


  return (
    <Card className="w-full max-w-2xl bg-card/80 backdrop-blur-sm border-border/50 shadow-2xl shadow-primary/10">
    <form onSubmit={handleSubmit(onSubmit)}>
        <CardHeader className="items-center text-center">
             <Avatar className="h-24 w-24 text-4xl">
              <AvatarImage src={user.avatar} alt={`@${user.firstName}`} />
              <AvatarFallback>{user.firstName?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <CardTitle className="text-3xl font-bold tracking-tight">{user.firstName} {user.lastName}</CardTitle>
            <CardDescription>{user.email}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="firstName">First name</Label>
                    <Input id="firstName" {...register('firstName')} className="bg-input/50"/>
                    {errors.firstName && <p className="text-sm text-destructive mt-1">{errors.firstName.message}</p>}
                </div>
                    <div className="space-y-2">
                    <Label htmlFor="lastName">Last name</Label>
                    <Input id="lastName" {...register('lastName')} className="bg-input/50"/>
                    {errors.lastName && <p className="text-sm text-destructive mt-1">{errors.lastName.message}</p>}
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" {...register('email')} className="bg-input/50"/>
                {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
            </div>
             <div className="space-y-2">
                <Label htmlFor="avatar">Avatar URL</Label>
                <Input id="avatar" type="text" {...register('avatar')} placeholder="https://example.com/avatar.png" className="bg-input/50"/>
                {errors.avatar && <p className="text-sm text-destructive mt-1">{errors.avatar.message}</p>}
            </div>
            <Separator className="my-6" />
            <div>
                <h3 className="text-lg font-medium flex items-center gap-2"><KeyRound/> Change Password</h3>
                <p className="text-sm text-muted-foreground">Leave these fields blank to keep your current password.</p>
            </div>
            <div className="space-y-4">
                 <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <PasswordInput id="currentPassword" {...register('currentPassword')} placeholder="••••••••" />
                    {errors.currentPassword && <p className="text-sm text-destructive mt-1">{errors.currentPassword.message}</p>}
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <PasswordInput id="newPassword" {...register('newPassword')} placeholder="••••••••" />
                        {errors.newPassword && <p className="text-sm text-destructive mt-1">{errors.newPassword.message}</p>}
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                        <PasswordInput id="confirmNewPassword" {...register('confirmNewPassword')} placeholder="••••••••" />
                        {errors.confirmNewPassword && <p className="text-sm text-destructive mt-1">{errors.confirmNewPassword.message}</p>}
                    </div>
                </div>
            </div>
        </CardContent>
        <CardFooter>
            <Button type="submit" disabled={isUpdating || !formState.isDirty} className="w-full text-lg py-6 shadow-lg shadow-primary/20">
                {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" /> }
                Save Changes
            </Button>
        </CardFooter>
        </form>
    </Card>
  );
}
