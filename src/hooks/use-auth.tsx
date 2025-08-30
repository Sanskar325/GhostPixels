
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User, isNewUser?: boolean) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  getUserByEmail: (email: string) => User | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// In a real app, this would be your database.
// For this simulation, we use an array in memory and sync with localStorage.
let userDatabase: User[] = [];

const loadDatabase = () => {
    try {
        const storedDb = localStorage.getItem('user_database');
        if (storedDb) {
            userDatabase = JSON.parse(storedDb);
        }
    } catch (error) {
        console.error("Failed to parse user database from localStorage", error);
        userDatabase = [];
    }
}

const saveDatabase = () => {
    localStorage.setItem('user_database', JSON.stringify(userDatabase));
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDatabase();
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
        console.error("Failed to parse user from localStorage", error);
        localStorage.removeItem('user');
    }
    setIsLoading(false);
  }, []);

  const login = (userData: User, isNewUser: boolean = false) => {
    if (isNewUser) {
        // Add to our simulated DB if they don't exist
        if (!userDatabase.find(u => u.email === userData.email)) {
            userDatabase.push(userData);
            saveDatabase();
        }
    }
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateUser = (userData: Partial<User>) => {
    if(user) {
        const updatedUser = { ...user, ...userData };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));

        // Update in the database as well
        const dbIndex = userDatabase.findIndex(u => u.email === user.email);
        if (dbIndex > -1) {
            userDatabase[dbIndex] = { ...userDatabase[dbIndex], ...userData};
            saveDatabase();
        }
    }
  }

  const getUserByEmail = (email: string): User | null => {
    return userDatabase.find(u => u.email === email) || null;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, getUserByEmail, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
