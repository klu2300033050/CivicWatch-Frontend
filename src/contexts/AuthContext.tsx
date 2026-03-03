import { VITE_BACKEND_URL, isTokenExpired, clearAuth } from "../config/config";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

interface User {
  id: string;
  email: string;
  fullName: string;
  role: "citizen" | "admin";
  phonenumber?: string;
  department?: string;
  adminAccessCode?: string;
  reputationPoints?: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (
    email: string,
    password: string,
    role: "citizen" | "admin",
    adminAccessCode?: string
  ) => Promise<boolean>;
  register: (userData: any, role: "citizen" | "admin") => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  updateUserProfile: (updatedData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

interface AuthProviderProps { children: ReactNode; }

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    clearAuth();
  }, []);

  /** Silently verify the stored token is still valid */
  const fetchProfile = useCallback(async (storedToken: string, storedRole: string) => {
    // Client-side expiry check first — avoids unnecessary network call
    if (isTokenExpired()) {
      console.warn("Token expired — logging out");
      logout();
      return;
    }

    try {
      // Citizen profile endpoint has no ID in path; admin does
      const storedUserId = localStorage.getItem("auth_user_id");
      const endpoint =
        storedRole === "admin"
          ? `admin/profile/${storedUserId}`
          : `citizen/profile`;      // ← no userId in path for citizen

      const response = await fetch(`${VITE_BACKEND_URL}/api/v1/${endpoint}`, {
        headers: {
          Authorization: `Bearer ${storedToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401 || response.status === 403) {
        console.warn("Token rejected by server — logging out");
        logout();
        return;
      }

      if (response.ok) {
        const result = await response.json();
        // Backend returns the user object directly
        const u: User = {
          id: result._id || result.id,
          email: result.email,
          fullName: result.fullName || "Guest",
          role: storedRole as "citizen" | "admin",
          phonenumber: result.phonenumber,
          department: result.department,
          adminAccessCode: result.adminAccessCode,
          reputationPoints: result.reputationPoints || 0,
        };
        setUser(u);
        localStorage.setItem("auth_user", JSON.stringify(u));
      }
    } catch (error) {
      console.error("Error verifying token:", error);
    }
  }, [logout]);

  // ── Hydrate from localStorage on mount ──────────────────────────
  useEffect(() => {
    const storedToken = localStorage.getItem("auth_token");
    const storedUser = localStorage.getItem("auth_user");
    const storedRole = localStorage.getItem("auth_role");

    if (!storedToken || !storedUser || storedUser === "undefined") {
      setIsLoading(false);
      return;
    }

    // Quick client-side check before even parsing
    if (isTokenExpired()) {
      clearAuth();
      setIsLoading(false);
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      setToken(storedToken);
      setUser(parsedUser);

      // Verify with server in background
      fetchProfile(storedToken, storedRole || parsedUser.role).finally(() => {
        setIsLoading(false);
      });
    } catch {
      clearAuth();
      setIsLoading(false);
    }
  }, [fetchProfile]);

  // ── Login ─────────────────────────────────────────────────────────
  const login = async (
    email: string,
    password: string,
    role: "citizen" | "admin",
    adminAccessCode?: string
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const endpoint = role === "admin" ? "admin/signin" : "citizen/signin";
      const body: any = { email, password };
      if (!email || !password) { alert("Email and password are required."); return false; }
      if (role === "admin" && !adminAccessCode) { alert("Admin access code is required."); return false; }
      if (role === "admin" && adminAccessCode) body.adminAccessCode = adminAccessCode;

      const response = await fetch(`${VITE_BACKEND_URL}/api/v1/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (!response.ok || !result.token || !result.user) {
        alert(result.message || "Login failed. Please check your credentials.");
        return false;
      }

      const authUser: User = {
        id: result.user.id,
        email: result.user.email,
        fullName: result.user.fullName || "Guest",
        role: result.user.role,
        phonenumber: result.user.phonenumber || "",
        department: result.user.department || "",
        adminAccessCode: result.user.adminAccessCode || "",
        reputationPoints: result.user.reputationPoints || 0,
      };

      setToken(result.token);
      setUser(authUser);
      localStorage.setItem("auth_token", result.token);
      localStorage.setItem("auth_user", JSON.stringify(authUser));
      localStorage.setItem("auth_role", authUser.role);
      localStorage.setItem("auth_user_id", authUser.id);
      localStorage.setItem("user", JSON.stringify(authUser)); // SocketContext uses this
      return true;
    } catch (error) {
      console.error("Login Error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // ── Register ──────────────────────────────────────────────────────
  const register = async (userData: any, role: "citizen" | "admin") => {
    setIsLoading(true);
    try {
      const endpoint = role === "admin" ? "admin/signup" : "citizen/signup";
      const response = await fetch(`${VITE_BACKEND_URL}/api/v1/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Registration failed");

      if (result.token && result.user) {
        setToken(result.token);
        setUser(result.user);
        localStorage.setItem("auth_token", result.token);
        localStorage.setItem("auth_user", JSON.stringify(result.user));
        localStorage.setItem("auth_role", result.user.role);
        localStorage.setItem("auth_user_id", result.user.id);
        localStorage.setItem("user", JSON.stringify(result.user));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ── Update profile ────────────────────────────────────────────────
  const updateUserProfile = async (updatedData: Partial<User>) => {
    setIsLoading(true);
    try {
      if (!token || !user) throw new Error("User is not authenticated");
      const endpoint = user.role === "admin" ? `admin/${user.id}` : `citizen/${user.id}`;
      const response = await fetch(`${VITE_BACKEND_URL}/api/v1/${endpoint}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(updatedData),
      });

      if (response.status === 401 || response.status === 403) {
        logout();
        throw new Error("Session expired. Please sign in again.");
      }

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Profile update failed");

      const newUser = { ...user, ...updatedData };
      setUser(newUser);
      localStorage.setItem("auth_user", JSON.stringify(newUser));
      return result;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, updateUserProfile, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
