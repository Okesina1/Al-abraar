import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, usersApi, uploadsApi } from '../utils/api';

import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<any>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  role: 'ustaadh' | 'student';
  phoneNumber: string;
  country: string;
  city: string;
  age: number;
  cv?: File;
  bio?: string;
  experience?: string;
  specialties?: string[];
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedUser = localStorage.getItem('al-abraar-user');
      const token = localStorage.getItem('al-abraar-token');

      if (storedUser && token) {
        try {
          const profile = await usersApi.getProfile();
          setUser(profile);
          localStorage.setItem('al-abraar-user', JSON.stringify(profile));
        } catch (error) {
          localStorage.removeItem('al-abraar-user');
          localStorage.removeItem('al-abraar-token');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await authApi.login(email, password);

      const userData = response.user;
      const token = response.access_token;

      setUser(userData);
      localStorage.setItem('al-abraar-user', JSON.stringify(userData));
      localStorage.setItem('al-abraar-token', token);
    } catch (error: any) {
      throw new Error(error.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    setLoading(true);
    try {
      let cvUrl;
      if (userData.cv) {
        const uploadResult = await uploadsApi.uploadFile(userData.cv, 'cvs', 'auto');
        cvUrl = uploadResult.url;
      }

      const registrationData = {
        email: userData.email,
        password: userData.password,
        fullName: userData.fullName,
        role: userData.role,
        phoneNumber: userData.phoneNumber,
        country: userData.country,
        city: userData.city,
        age: userData.age,
        ...(userData.role === 'ustaadh' && {
          bio: userData.bio,
          experience: userData.experience,
          specialties: userData.specialties,
          cv: cvUrl,
        }),
      };

      const response = await authApi.register(registrationData);

      if (response.requiresApproval) {
        return {
          message: response.message || 'Registration submitted! Your application is under review.',
          requiresApproval: true
        };
      }

      if (response.user && response.access_token) {
        setUser(response.user);
        localStorage.setItem('al-abraar-user', JSON.stringify(response.user));
        localStorage.setItem('al-abraar-token', response.access_token);
      }

      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('al-abraar-user');
    localStorage.removeItem('al-abraar-token');
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('al-abraar-user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
