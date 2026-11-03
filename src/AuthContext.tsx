
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { login as loginApi } from "./api";
import type { LoginRequest, LoginResponse } from "./api";
import { tokenStorage } from "./httpClient";

export type AuthUser = Omit<LoginResponse, "token">;

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_KEY = "peopledesk_user";

function getStoredUser(): AuthUser | null {
  const storedUser = sessionStorage.getItem(USER_KEY);

  if (!storedUser) return null;

  try {
    return JSON.parse(storedUser) as AuthUser;
  } catch {
    sessionStorage.removeItem(USER_KEY);
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
  function handleUnauthorized() {
    tokenStorage.clear();
    sessionStorage.removeItem(USER_KEY);
    setUser(null);
  }

  window.addEventListener("peopledesk:unauthorized", handleUnauthorized);

  return () => {
    window.removeEventListener(
      "peopledesk:unauthorized",
      handleUnauthorized
    );
  };
}, []);
  const [user, setUser] = useState<AuthUser | null>(() => {
    return tokenStorage.get() ? getStoredUser() : null;
  });

  async function login(credentials: LoginRequest): Promise<void> {
    const response = await loginApi(credentials);

    const { token, ...userDetails } = response;

    tokenStorage.set(token);
    sessionStorage.setItem(USER_KEY, JSON.stringify(userDetails));

    setUser(userDetails);
  }

  function logout(): void {
    tokenStorage.clear();
    sessionStorage.removeItem(USER_KEY);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null && tokenStorage.get() !== null,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
