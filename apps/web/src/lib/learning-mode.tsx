"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type LearningMode = "beginner" | "pro";

interface LearningContextValue {
  mode: LearningMode;
  isBeginner: boolean;
  toggleMode: () => void;
  setMode: (mode: LearningMode) => void;
}

const LearningContext = createContext<LearningContextValue | undefined>(undefined);

export function LearningProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<LearningMode>("beginner");

  useEffect(() => {
    const saved = localStorage.getItem("miniforge_learning_mode");
    if (saved === "beginner" || saved === "pro") {
      setModeState(saved);
    }
  }, []);

  const setMode = (newMode: LearningMode) => {
    setModeState(newMode);
    localStorage.setItem("miniforge_learning_mode", newMode);
  };

  const toggleMode = () => {
    const next = mode === "beginner" ? "pro" : "beginner";
    setMode(next);
  };

  return (
    <LearningContext.Provider
      value={{
        mode,
        isBeginner: mode === "beginner",
        toggleMode,
        setMode
      }}
    >
      {children}
    </LearningContext.Provider>
  );
}

export function useLearningMode() {
  const context = useContext(LearningContext);
  if (!context) {
    return {
      mode: "beginner" as LearningMode,
      isBeginner: true,
      toggleMode: () => {},
      setMode: () => {}
    };
  }
  return context;
}

