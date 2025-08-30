
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, LogIn, UserPlus, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';

const signupSchema = z.object({
  firstName: z.string().min(1, { message: 'First name is required.' }),
  lastName: z.string().min(1, { message: 'Last name is required.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters long.' }),
  confirmPassword: z.string().min(8, { message: 'Password must be at least 8 characters long.' }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters long.' }),
});

interface AuthFormProps {
  mode: 'login' | 'signup';
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const isSignup = mode === 'signup';

  const formSchema = isSignup ? signupSchema : loginSchema;
  type FormValues = z.infer<typeof formSchema>;

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const userData = isSignup ? {
        firstName: (data as z.infer<typeof signupSchema>).firstName,
        lastName: (data as z.infer<typeof signupSchema>).lastName,
        email: data.email,
        avatar: `https://ui-avatars.com/api/?name=${(data as z.infer<typeof signupSchema>).firstName}+${(data as z.infer<typeof signupSchema>).lastName}&background=random&color=fff`
    } : {
        // In a real app, you'd fetch this from your DB
        firstName: 'Test',
        lastName: 'User',
        email: data.email,
        avatar: `https://ui-avatars.com/api/?name=Test+User&background=random&color=fff`
    }

    login(userData);

    toast({
      title: isSignup ? 'Signup Successful' : 'Login Successful',
      description: `Welcome, ${userData.firstName}! You have been successfully ${isSignup ? 'signed up' : 'logged in'}. Redirecting...`,
    });

    setIsLoading(false);
    router.push('/');
  };

  const title = isSignup ? 'Welcome to GhostPixels' : 'Welcome Back';
  const description = isSignup ? 'Create your account to start hiding secrets in plain sight.' : 'Enter your credentials to access your account.';
  const buttonText = isSignup ? 'Sign up' : 'Log In';
  const footerText = isSignup ? 'Already have an account?' : "Don't have an account?";
  const footerLink = isSignup ? '/login' : '/signup';
  const footerLinkText = isSignup ? 'Log in' : 'Sign up';

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
       <Card className="w-full max-w-lg bg-card/70 shadow-2xl shadow-primary/10">
        <CardHeader>
            <CardTitle className="text-3xl font-bold tracking-tight">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                 {isSignup && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">First name</Label>
                            <Input id="firstName" placeholder="Tyler" {...register('firstName')} className="bg-input/50"/>
                            {errors.firstName && <p className="text-sm text-destructive mt-1">{(errors as any).firstName.message}</p>}
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="lastName">Last name</Label>
                            <Input id="lastName" placeholder="Durden" {...register('lastName')} className="bg-input/50"/>
                            {errors.lastName && <p className="text-sm text-destructive mt-1">{(errors as any).lastName.message}</p>}
                        </div>
                    </div>
                )}
                <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" placeholder="projectmayhem@fc.com" {...register('email')} className="bg-input/50"/>
                    {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" placeholder="••••••••" {...register('password')} className="bg-input/50"/>
                    {errors.password && <p className="text-sm text-destructive mt-1">{errors.password.message}</p>}
                </div>
                 {isSignup && (
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input id="confirmPassword" type="password" placeholder="••••••••" {...register('confirmPassword')} className="bg-input/50"/>
                        {errors.confirmPassword && <p className="text-sm text-destructive mt-1">{(errors as any).confirmPassword.message}</p>}
                    </div>
                )}
                <Button type="submit" disabled={isLoading} className="w-full text-lg py-6 shadow-lg shadow-primary/20">
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (isSignup ? null : <LogIn className="mr-2 h-4 w-4" />) }
                    {buttonText}
                    {isSignup && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
            </form>
        </CardContent>
        <CardFooter className="justify-center text-center text-sm text-muted-foreground">
            <p>{footerText} <Link href={footerLink} className="font-semibold text-primary hover:underline">{footerLinkText}</Link></p>
        </CardFooter>
       </Card>
    </div>
  );
}
