"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface User {
  username: string;
  displayName: string;
  dateOfBirth: string;
  walletAddress: string;
}

interface GlobalContextType {
  isLoggedIn: boolean;
  setIsLoggedIn: (value: boolean) => void;
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export function GlobalProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [user, setUser] = useState<User | null>({
    username: "John Doe",
    displayName: "John Doe",
    dateOfBirth: "1990-01-01",
    walletAddress: "0x1234567890123456789012345678901234567890",
  });

  const logout = () => {
    setIsLoggedIn(false);
    setUser(null);
  };

  return (
    <GlobalContext.Provider
      value={{
        isLoggedIn,
        setIsLoggedIn,
        user,
        setUser,
        logout,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
}

export function useGlobal() {
  const context = useContext(GlobalContext);
  if (context === undefined) {
    throw new Error("useGlobal must be used within a GlobalProvider");
  }
  return context;
}
