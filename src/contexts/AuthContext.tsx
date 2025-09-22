import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Demo users for testing
      let demoUser: User;
      if (email === 'admin@al-abraar.com') {
        demoUser = {
          id: '1',
          email: 'admin@al-abraar.com',
          fullName: 'System Administrator',
          role: 'admin',
          createdAt: new Date().toISOString()
        };
      } else if (email === 'ustaadh@al-abraar.com') {
        demoUser = {
          id: '2',
          email: 'ustaadh@al-abraar.com',
          fullName: 'Ahmed Al-Hafiz',
          role: 'ustaadh',
          phoneNumber: '+1234567890',
          country: 'Saudi Arabia',
          city: 'Riyadh',
          age: 35,
          isApproved: true,
          createdAt: new Date().toISOString()
        };
      } else {
        demoUser = {
          id: '3',
          email: 'student@al-abraar.com',
          fullName: 'Fatima Al-Zahra',
          role: 'student',
          phoneNumber: '+1234567891',
          country: 'United Kingdom',
          city: 'London',
          age: 25,
          createdAt: new Date().toISOString()
        };
      }

      setUser(demoUser);
      localStorage.setItem('al-abraar-user', JSON.stringify(demoUser));
    } catch (error) {
      throw new Error('Login failed');
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newUser: User = {
        id: Date.now().toString(),
        email: userData.email,
        fullName: userData.fullName,
        role: userData.role,
        phoneNumber: userData.phoneNumber,
        country: userData.country,
        city: userData.city,
        age: userData.age,
        isApproved: userData.role === 'student' ? true : false,
        createdAt: new Date().toISOString()
      };

      if (userData.role === 'student') {
        setUser(newUser);
        localStorage.setItem('al-abraar-user', JSON.stringify(newUser));
      }
    } catch (error) {
      throw new Error('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('al-abraar-user');
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