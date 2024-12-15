"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

interface GameContextType {
  disclaimerAccepted: boolean;
  setDisclaimerAccepted: (accepted: boolean) => void;
  isMobile: boolean;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Don't render children until we're on the client
  if (!isClient) return <div>Loading...</div>;

  return (
    <GameContext.Provider
      value={{ disclaimerAccepted, setDisclaimerAccepted, isMobile }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}
