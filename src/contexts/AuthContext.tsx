import React, { createContext, useContext, useEffect, useState } from "react";
import { authApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: number;
  pid: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_verified: boolean;
  created_at: string;
}

interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("access_token");

      if (!token) {
        console.log("No token found");
        setUser(null);
        return;
      }

      const response = await authApi.getCurrentUser();
      if (response.success && response.data) {
        const userData: User = {
          id: response.data.id || 0,
          pid: response.data.pid || "",
          email: response.data.email || "",
          first_name: response.data.first_name || "",
          last_name: response.data.last_name || "",
          role: response.data.role || "user",
          is_verified: response.data.is_verified || false,
          created_at: response.data.created_at || new Date().toISOString(),
        };
        console.log("User restored from session:", userData);
        setUser(userData); // <-- THIS WAS MISSING!
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await authApi.login({ email, password });
      if (response.success && response.data) {
        const userData = response.data.user;
        const formattedUser: User = {
          ...userData,
          id: typeof userData.id === "string" ? parseInt(userData.id, 10) : userData.id,
        };
        console.log("User logged in:", formattedUser);
        setUser(formattedUser);
        toast({
          title: "Login Successful",
          description: "Welcome back to Phoenix!",
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Invalid email or password";
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      setIsLoading(true);
      const response = await authApi.register(userData);
      if (response.success && response.data) {
        const formattedUser: User = {
          ...response.data.user,
          id:
            typeof response.data.user.id === "string"
              ? parseInt(response.data.user.id, 10)
              : response.data.user.id,
        };
        setUser(formattedUser);
        toast({
          title: "Account Created",
          description: "Welcome to Phoenix! Your account has been created successfully.",
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Something went wrong during registration";
      toast({
        title: "Registration Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
      setUser(null);
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out",
      });
    } catch (error) {
      setUser(null);
      localStorage.removeItem("access_token");
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out",
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
