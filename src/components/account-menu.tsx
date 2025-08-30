"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogIn, LogOut, User, UserPlus, Settings } from 'lucide-react';

export function AccountMenu() {
  // In a real app, you'd get this from a context, store, or hook
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [user, setUser] = useState({ 
    firstName: "Tyler", 
    lastName: "Durden", 
    email: "projectmayhem@fc.com", 
    avatar: "https://github.com/shadcn.png" 
  });

  if (isLoggedIn) {
    const userInitial = user.firstName ? user.firstName.charAt(0).toUpperCase() : '';
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user.avatar} alt={`@${user.firstName}`} />
              <AvatarFallback>{userInitial}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{`${user.firstName} ${user.lastName}`}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsLoggedIn(false)}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full">
            <User className="h-4 w-4" />
            <span className="sr-only">Account</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <Link href="/login" passHref>
          <DropdownMenuItem onClick={() => setIsLoggedIn(true)}>
            <LogIn className="mr-2 h-4 w-4" />
            <span>Log In</span>
          </DropdownMenuItem>
        </Link>
        <Link href="/signup" passHref>
          <DropdownMenuItem>
            <UserPlus className="mr-2 h-4 w-4" />
            <span>Sign Up</span>
          </DropdownMenuItem>
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
