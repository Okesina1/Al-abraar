import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { authApi, usersApi, uploadsApi } from "../utils/api";
import { normalizeUser } from '../utils/user';

import { User } from "../types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  authenticating: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<any>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  role: "ustaadh" | "student";
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
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authenticating, setAuthenticating] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      const storedUser = localStorage.getItem("al-abraar-user");
      const token = localStorage.getItem("al-abraar-token");

      if (storedUser && token) {
        try {
          const profile = await usersApi.getProfile();
          // Normalize profile so consumers can reliably use `user.id`
          const normalized = normalizeUser(profile);
          setUser(normalized);
          localStorage.setItem("al-abraar-user", JSON.stringify(normalized));
        } catch (error) {
          localStorage.removeItem("al-abraar-user");
          localStorage.removeItem("al-abraar-token");
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setAuthenticating(true);
    try {
      const response = await authApi.login(email, password);

      const userData = normalizeUser(response.user);
      const token = response.access_token;

      setUser(userData);
      localStorage.setItem("al-abraar-user", JSON.stringify(userData));
      localStorage.setItem("al-abraar-token", token);
    } catch (error: any) {
      // rethrow so callers can display the message
      throw new Error(error?.message || "Invalid email or password");
    } finally {
      setAuthenticating(false);
    }
  };

  const register = async (userData: RegisterData) => {
    setAuthenticating(true);
    try {
      let cvUrl;
      if (userData.cv) {
        const uploadResult = await uploadsApi.uploadFile(
          userData.cv,
          "cvs",
          "auto"
        );
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
        ...(userData.role === "ustaadh" && {
          bio: userData.bio,
          experience: userData.experience,
          specialties: userData.specialties,
          cvUrl: cvUrl,
        }),
      };

      const response = await authApi.register(registrationData);
      return response;
    } catch (error: any) {
      throw new Error(error?.message || "Registration failed");
    } finally {
      setAuthenticating(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("al-abraar-user");
    localStorage.removeItem("al-abraar-token");
  };

  const updateUser = async (userData: Partial<User>) => {
    try {
      const updatedUser = await usersApi.updateProfile(userData);
      const normalized = normalizeUser(updatedUser);
      setUser(normalized);
      localStorage.setItem("al-abraar-user", JSON.stringify(normalized));
    } catch (error: any) {
      throw new Error(error.message || "Failed to update profile");
    }
  };

  // helper comes from shared util

  return (
    <AuthContext.Provider
      value={{ user, loading, authenticating, login, register, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};
