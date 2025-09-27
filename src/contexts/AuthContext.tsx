import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const API_BASE_URL = 'http://localhost:3001/api';

interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'admin' | 'ustaadh' | 'student';
  phoneNumber?: string;
  country?: string;
  city?: string;
  age?: number;
  isApproved?: boolean;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
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
    // Simulate checking for existing session
    const storedUser = localStorage.getItem('al-abraar-user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Mock authentication for demo
      const mockUsers = {
        'admin@al-abraar.com': {
          id: '1',
          email: 'admin@al-abraar.com',
          fullName: 'System Administrator',
          role: 'admin' as const,
          phoneNumber: '+1234567890',
          country: 'USA',
          city: 'New York',
          age: 35,
          isApproved: true,
          createdAt: '2023-01-01T00:00:00Z'
        },
        'ahmed.alhafiz@email.com': {
          id: '2',
          email: 'ahmed.alhafiz@email.com',
          fullName: 'Ahmed Al-Hafiz',
          role: 'ustaadh' as const,
          phoneNumber: '+966123456789',
          country: 'Saudi Arabia',
          city: 'Riyadh',
          age: 35,
          isApproved: true,
          createdAt: '2023-01-15T10:00:00Z'
        },
        'student@al-abraar.com': {
          id: '3',
          email: 'student@al-abraar.com',
          fullName: 'Sarah Ahmed',
          role: 'student' as const,
          phoneNumber: '+1987654321',
          country: 'Canada',
          city: 'Toronto',
          age: 28,
          isApproved: true,
          createdAt: '2023-02-01T14:30:00Z'
        }
      };

      const user = mockUsers[email as keyof typeof mockUsers];
      if (!user || password !== 'password') {
        throw new Error('Invalid credentials');
      }

      setUser(user);
      localStorage.setItem('al-abraar-user', JSON.stringify(user));
      localStorage.setItem('al-abraar-token', 'mock-token');
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    setLoading(true);
    try {
      // Mock registration for demo
      const newUser = {
        id: Date.now().toString(),
        email: userData.email,
        fullName: userData.fullName,
        role: userData.role,
        phoneNumber: userData.phoneNumber,
        country: userData.country,
        city: userData.city,
        age: userData.age,
        isApproved: userData.role === 'student',
        createdAt: new Date().toISOString()
      };

      if (userData.role === 'student') {
        // Auto-login students
        setUser(newUser);
        localStorage.setItem('al-abraar-user', JSON.stringify(newUser));
        localStorage.setItem('al-abraar-token', 'mock-token');
        return { user: newUser, access_token: 'mock-token' };
      } else {
        // Ustaadhs need approval
        return { message: 'Registration submitted! Your application is under review.', requiresApproval: true };
      }
    } catch (error) {
      throw error;
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