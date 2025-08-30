"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, LogIn, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters long.' }),
});

type FormValues = z.infer<typeof formSchema>;

interface AuthFormProps {
  mode: 'login' | 'signup';
}

export function AuthForm({ mode }: AuthFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);
    // Here you would typically handle the login or signup logic,
    // e.g., by calling a Firebase function or your backend API.
    console.log('Auth data:', data);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    toast({
      title: mode === 'login' ? 'Login Successful' : 'Signup Successful',
      description: `Welcome! You have been successfully ${mode === 'login' ? 'logged in' : 'signed up'}.`,
    });

    setIsLoading(false);
    // router.push('/'); // Redirect to home or dashboard after successful auth
  };

  const title = mode === 'login' ? 'Welcome Back' : 'Create an Account';
  const description = mode === 'login' ? 'Enter your credentials to access your account.' : 'Fill in the details below to create a new account.';
  const buttonText = mode === 'login' ? 'Log In' : 'Sign Up';
  const buttonIcon = mode === 'login' ? <LogIn className="mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />;
  const footerText = mode === 'login' ? "Don't have an account?" : 'Already have an account?';
  const footerLink = mode === 'login' ? '/signup' : '/login';
  const footerLinkText = mode === 'login' ? 'Sign up' : 'Log in';

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
       <Card className="w-full max-w-md bg-card/70 shadow-2xl shadow-primary/10">
        <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold tracking-tight">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="name@example.com" {...register('email')} className="bg-input/50"/>
                    {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" placeholder="••••••••" {...register('password')} className="bg-input/50"/>
                    {errors.password && <p className="text-sm text-destructive mt-1">{errors.password.message}</p>}
                </div>
                <Button type="submit" disabled={isLoading} className="w-full text-lg py-6 shadow-lg shadow-primary/20">
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : buttonIcon}
                    {buttonText}
                </Button>
            </form>
        </CardContent>
        <CardFooter className="text-center text-sm text-muted-foreground">
            <p>{footerText} <Link href={footerLink} className="font-semibold text-primary hover:underline">{footerLinkText}</Link></p>
        </CardFooter>
       </Card>
    </div>
  );
}
