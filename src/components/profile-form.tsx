
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from './ui/skeleton';

const profileSchema = z.object({
  firstName: z.string().min(1, { message: 'First name is required.' }),
  lastName: z.string().min(1, { message: 'Last name is required.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  avatar: z.string().url().optional().or(z.literal('')),
});

type FormValues = z.infer<typeof profileSchema>;

export function ProfileForm() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, updateUser, isLoading: isAuthLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormValues>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (user) {
      reset(user);
    }
  }, [user, reset]);


  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    updateUser(data);

    toast({
      title: 'Profile Updated',
      description: `Your information has been successfully updated.`,
    });

    setIsLoading(false);
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
        <div className="text-center">
            <p>You must be logged in to view this page.</p>
            <Button asChild className="mt-4">
                <Link href="/login">Log In</Link>
            </Button>
        </div>
    )
  }


  return (
    <Card className="w-full max-w-2xl bg-card/70 shadow-2xl shadow-primary/10">
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
        </CardContent>
        <CardFooter>
            <Button type="submit" disabled={isLoading} className="w-full text-lg py-6 shadow-lg shadow-primary/20">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" /> }
                Save Changes
            </Button>
        </CardFooter>
        </form>
    </Card>
  );
}
